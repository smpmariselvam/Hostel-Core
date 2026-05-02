const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  
  month: { type: String, required: true }, // e.g., "October 2023"
  
  roomFee: { type: Number, required: true },
  additionalService: { type: String, default: "" },
  additionalAmount: { type: Number, default: 0 },
  
  discount: { type: Number, default: 0 },
  lateFee: { type: Number, default: 0 },
  
  totalAmount: { type: Number, required: true },
  
  status: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  dueDate: { type: Date, required: true },
  
  // PhonePe Ready Fields
  transactionId: { type: String }, // Internal ref
  gatewayReference: { type: String }, // Ref from PhonePe
  paidAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Billing', billingSchema);