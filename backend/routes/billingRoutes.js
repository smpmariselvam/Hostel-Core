const express = require('express');
const router = express.Router();
const Billing = require('../models/Billing');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect, isAdminOrStaff } = require('../middleware/authMiddleware');
const phonePeConfig = require('../config/phonepe');
const {
  decodePhonePeResponse,
  initiatePhonePePayment,
  checkPhonePePaymentStatus
} = require('../utils/phonepe');

const getBackendBaseUrl = (req) => {
  if (phonePeConfig.backendUrl) return phonePeConfig.backendUrl;
  return `${req.protocol}://${req.get('host')}`;
};

const buildBillingReturnUrl = (req) => {
  const requestedReturnUrl = req.body.returnUrl;
  const frontendBaseUrl = requestedReturnUrl || phonePeConfig.frontendUrl || req.get('origin');

  if (!frontendBaseUrl) return null;
  return `${frontendBaseUrl.replace(/\/+$/, '')}/dashboard/billing`;
};

const withPaymentStatus = (returnUrl, status) => {
  if (!returnUrl) return null;
  const separator = returnUrl.includes('?') ? '&' : '?';
  return `${returnUrl}${separator}payment=${status}`;
};

const normalizePhoneNumber = (number) => {
  const digits = String(number || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : undefined;
};

const isPaymentSuccessful = (statusResponse) => {
  return statusResponse?.state === 'COMPLETED';
};

const getGatewayReference = (statusResponse) => {
  return statusResponse?.paymentDetails?.[0]?.transactionId || statusResponse?.orderId;
};

const applyPhonePeStatusToInvoice = async (invoice, statusResponse) => {
  if (isPaymentSuccessful(statusResponse)) {
    invoice.status = 'Paid';
    invoice.gatewayReference = getGatewayReference(statusResponse);
    invoice.paidAt = Date.now();
    await invoice.save();
    return invoice;
  }

  if (statusResponse?.state === 'FAILED') {
    invoice.status = 'Failed';
    await invoice.save();
  }

  return invoice;
};

// @route   POST /api/billing
// @desc    Generate a new invoice (Admin/Staff)
router.post('/', protect, isAdminOrStaff, async (req, res) => {
  try {
    const { residentId, month, additionalService, additionalAmount, discount, lateFee, dueDate } = req.body;

    const user = await User.findById(residentId).populate('assignedRoom');
    if (!user) return res.status(404).json({ message: "Resident not found" });
    if (!user.assignedRoom) return res.status(400).json({ message: "Resident has no assigned room" });

    const roomFee = user.assignedRoom.pricePerMonth;
    const totalAmount = (roomFee + Number(additionalAmount) + Number(lateFee)) - Number(discount);

    const invoice = new Billing({
      resident: residentId,
      room: user.assignedRoom._id,
      month,
      roomFee,
      additionalService,
      additionalAmount,
      discount,
      lateFee,
      totalAmount,
      dueDate,
      transactionId: `TXN-${Date.now()}` // Internal reference ID for PhonePe
    });

    await invoice.save();

    await Notification.create({
      recipient: residentId,
      title: 'New Invoice Generated',
      message: `Your invoice for ${month} has been generated. Total amount: ₹${totalAmount}.`,
      type: 'billing'
    });

    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/billing
router.get('/', protect, isAdminOrStaff, async (req, res) => {
  try {
    const invoices = await Billing.find()
      .populate('resident', 'name email contactNumber')
      .populate('room', 'roomNumber')
      .sort({ createdAt: -1 })
      .lean();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/billing/my
router.get('/my', protect, async (req, res) => {
  try {
    const invoices = await Billing.find({ resident: req.user._id })
      .populate('room', 'roomNumber')
      .sort({ createdAt: -1 })
      .lean();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// REAL PHONEPE UAT GATEWAY INTEGRATION
// ==========================================

// @route   POST /api/billing/:id/initiate-payment
// @desc    Initiates PhonePe gateway redirect
router.post('/:id/initiate-payment', protect, async (req, res) => {
  try {
    const invoice = await Billing.findById(req.params.id).populate('resident');
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    if (req.user.role === 'resident' && invoice.resident._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only pay your own invoice" });
    }

    if (invoice.status === 'Paid') {
      return res.status(400).json({ message: "Invoice is already paid" });
    }

    if (!phonePeConfig.clientId || !phonePeConfig.clientSecret || !phonePeConfig.clientVersion) {
      return res.status(500).json({ message: "Payment Gateway not configured in .env" });
    }

    const returnUrl = buildBillingReturnUrl(req);
    if (!returnUrl) {
      return res.status(400).json({ message: "Payment return URL is missing" });
    }

    const merchantOrderId = `TXN-${invoice._id}-${Date.now()}`;
    invoice.transactionId = merchantOrderId;
    invoice.status = 'Pending';
    await invoice.save();

    const callbackUrl = `${getBackendBaseUrl(req)}/api/billing/payment-callback?merchantOrderId=${encodeURIComponent(merchantOrderId)}&returnUrl=${encodeURIComponent(returnUrl)}`;

    // PhonePe expects amount in paise (Rupees * 100)
    const amountInPaise = Math.round(invoice.totalAmount * 100);
    
    const payload = {
      merchantOrderId,
      amount: amountInPaise,
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: `Hostel bill payment for ${invoice.month}`,
        merchantUrls: {
          redirectUrl: callbackUrl
        }
      },
      metaInfo: {
        udf1: invoice._id.toString(),
        udf2: invoice.resident._id.toString(),
        udf3: normalizePhoneNumber(invoice.resident.contactNumber) || ''
      }
    };

    // Send the payment page URL back to React
    const paymentResponse = await initiatePhonePePayment(payload);
    const redirectUrl = paymentResponse?.redirectUrl;

    if (!redirectUrl) {
      return res.status(502).json({ message: 'PhonePe did not return a payment URL' });
    }

    res.json({ redirectUrl });

  } catch (err) {
    console.error("PhonePe Error:", err.response?.data || err.message);
    res.status(502).json({
      message: err.response?.data?.message || err.response?.data?.code || 'Error initiating payment gateway'
    });
  }
});

// @route   POST /api/billing/payment-callback
// @desc    PhonePe redirects here after transaction
router.all('/payment-callback', async (req, res) => {
  const returnUrl = req.query.returnUrl || phonePeConfig.frontendUrl;

  try {
    const phonePeResponse = decodePhonePeResponse(req.body);
    const merchantOrderId =
      req.query.merchantOrderId ||
      phonePeResponse?.payload?.merchantOrderId ||
      phonePeResponse?.merchantOrderId ||
      phonePeResponse?.data?.merchantOrderId;

    const invoice = await Billing.findOne({ transactionId: merchantOrderId });
    if (!invoice) return res.redirect(withPaymentStatus(returnUrl, 'failed') || '/');

    const statusResponse = await checkPhonePePaymentStatus(merchantOrderId);
    await applyPhonePeStatusToInvoice(invoice, statusResponse);

    if (invoice.status === 'Paid') {
      
      return res.redirect(withPaymentStatus(returnUrl, 'success') || '/');
    }

    return res.redirect(withPaymentStatus(returnUrl, 'failed') || '/');
  } catch (err) {
    console.error("PhonePe callback error:", err.response?.data || err.message);
    res.redirect(withPaymentStatus(returnUrl, 'failed') || '/');
  }
});

// @route   POST /api/billing/:id/refresh-payment
// @desc    Checks PhonePe order status and updates invoice
router.post('/:id/refresh-payment', protect, async (req, res) => {
  try {
    const invoice = await Billing.findById(req.params.id).populate('resident');
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    if (req.user.role === 'resident' && invoice.resident._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only check your own invoice" });
    }

    if (!invoice.transactionId) {
      return res.status(400).json({ message: "No PhonePe order found for this invoice" });
    }

    const statusResponse = await checkPhonePePaymentStatus(invoice.transactionId);
    await applyPhonePeStatusToInvoice(invoice, statusResponse);

    res.json({
      invoice,
      paymentState: statusResponse?.state || 'UNKNOWN'
    });
  } catch (err) {
    console.error("PhonePe status refresh error:", err.response?.data || err.message);
    res.status(502).json({
      message: err.response?.data?.message || 'Unable to refresh payment status'
    });
  }
});

// Manual Admin Override
router.put('/:id/pay', protect, isAdminOrStaff, async (req, res) => {
  try {
    const invoice = await Billing.findById(req.params.id);
    invoice.status = 'Paid';
    invoice.paidAt = Date.now();
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;