import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { Receipt, Plus, CheckCircle, Clock, CreditCard, AlertCircle, Download } from 'lucide-react';

const Billing = () => {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [invoices, setInvoices] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    residentId: '', month: '', additionalService: '', 
    additionalAmount: 0, discount: 0, lateFee: 0, dueDate: ''
  });

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchData = async () => {
    if (!user) return;
    try {
      const isManager = user.role === 'admin' || user.role === 'staff';
      const billingRequest = axios.get(
        isManager ? `${API_BASE_URL}/billing` : `${API_BASE_URL}/billing/my`,
        getConfig()
      );

      if (isManager) {
        const [billingData, residentsData] = await Promise.all([
          billingRequest,
          axios.get(`${API_BASE_URL}/users/residents`, getConfig())
        ]);
        setInvoices(billingData.data);
        setResidents(residentsData.data.filter(r => r.assignedRoom));
      } else {
        const { data } = await billingRequest;
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error fetching billing data', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Check for PhonePe redirect callbacks
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      alert("Payment Successful! Your invoice has been updated.");
      setSearchParams({}); // Clear the URL
    } else if (paymentStatus === 'failed') {
      alert("Payment Failed. Please try again.");
      setSearchParams({});
    }
  }, [user, searchParams, setSearchParams]);

  // --- PHONEPE PAYMENT HANDLER ---
  const handleOnlinePayment = async (id) => {
    setPaymentLoading(true);
    try {
      // Calls our backend to create a PhonePe checkout order.
      const { data } = await axios.post(
        `${API_BASE_URL}/billing/${id}/initiate-payment`,
        { returnUrl: window.location.origin },
        getConfig()
      );
      
      // Redirect user to the PhonePe Test Gateway
      window.location.href = data.redirectUrl;
    } catch (error) {
      alert(error.response?.data?.message || "Failed to initiate payment gateway.");
      setPaymentLoading(false);
    }
  };

  const handleRefreshPayment = async (id) => {
    setPaymentLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/billing/${id}/refresh-payment`, {}, getConfig());
      await fetchData();

      if (data.paymentState === 'COMPLETED') {
        alert("Payment verified successfully. Your invoice is now marked as paid.");
      } else if (data.paymentState === 'PENDING') {
        alert("Payment is still pending in PhonePe. Please check again after a minute.");
      } else {
        alert(`PhonePe payment status: ${data.paymentState}`);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Unable to refresh payment status.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // --- MANUAL OVERRIDE (For Admins) ---
  const handleManualPayment = async (id) => {
    if (window.confirm("Admin Override: Mark this invoice as PAID in cash?")) {
      try {
        await axios.put(`${API_BASE_URL}/billing/${id}/pay`, {}, getConfig());
        fetchData();
      } catch (error) {
        alert("Payment update failed");
      }
    }
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/billing`, formData, getConfig());
      setIsModalOpen(false);
      fetchData();
      alert("Invoice generated successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to generate invoice");
    }
  };

  // --- INVOICE DOWNLOAD LOGIC ---
  const handleDownloadInvoice = (inv) => {
    const printWindow = window.open('', '_blank');
    const html = `
      <html>
        <head>
          <title>Invoice - ${inv.month}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: 900; color: #4f46e5; margin-bottom: 4px; }
            .title { font-size: 32px; font-weight: bold; color: #111; margin: 0 0 10px 0; letter-spacing: -1px; }
            .details-grid { display: flex; justify-content: space-between; margin-bottom: 40px; background: #f9fafb; padding: 20px; border-radius: 8px; }
            .section-title { font-size: 11px; text-transform: uppercase; color: #888; font-weight: bold; margin-bottom: 8px; letter-spacing: 1px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 14px 12px; text-align: left; border-bottom: 1px solid #eee; }
            th { background: #f3f4f6; font-weight: 700; color: #374151; font-size: 13px; text-transform: uppercase; }
            .text-right { text-align: right; }
            .total-row { font-size: 18px; font-weight: 900; background: #eef2ff; color: #3730a3; }
            .total-row td { border-bottom: none; border-top: 2px solid #c7d2fe; }
            .status { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
            .status.Paid { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
            .status.Pending { background: #fef08a; color: #854d0e; border: 1px solid #fde047; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 60px; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">INVOICE</h1>
              <div class="status ${inv.status}">${inv.status}</div>
            </div>
            <div class="text-right">
              <div class="logo">HostelCore</div>
              <div style="color: #666; font-size: 14px;">123 University Road, Campus Area</div>
              <div style="color: #666; font-size: 14px;">support@hostelcore.com</div>
            </div>
          </div>

          <div class="details-grid">
            <div>
              <div class="section-title">Billed To</div>
              <div style="font-size: 18px; font-weight: bold; color: #111;">${inv.resident?.name || 'Resident'}</div>
              <div style="margin-top: 4px; color: #555;">Room ${inv.room?.roomNumber || 'N/A'}</div>
              <div style="color: #555;">${inv.resident?.email || ''}</div>
            </div>
            <div class="text-right">
              <div class="section-title">Invoice Details</div>
              <div style="margin-bottom: 4px;"><strong>Invoice No:</strong> ${inv.transactionId || inv._id?.substring(0, 8)}</div>
              <div style="margin-bottom: 4px;"><strong>Billing Month:</strong> ${inv.month}</div>
              <div style="margin-bottom: 4px;"><strong>Date Issued:</strong> ${new Date(inv.createdAt || Date.now()).toLocaleDateString()}</div>
              <div><strong>Due Date:</strong> ${new Date(inv.dueDate).toLocaleDateString()}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Room Rent (Base Fee)</td>
                <td class="text-right">₹${inv.roomFee}</td>
              </tr>
              ${inv.additionalAmount > 0 ? `
              <tr>
                <td>Additional Service: ${inv.additionalService || 'Misc Services'}</td>
                <td class="text-right">₹${inv.additionalAmount}</td>
              </tr>` : ''}
              ${inv.lateFee > 0 ? `
              <tr>
                <td>Late Fee Penalty</td>
                <td class="text-right">₹${inv.lateFee}</td>
              </tr>` : ''}
              ${inv.discount > 0 ? `
              <tr>
                <td>Discount Applied</td>
                <td class="text-right" style="color: #166534;">- ₹${inv.discount}</td>
              </tr>` : ''}
              <tr class="total-row">
                <td>Total Amount Payable</td>
                <td class="text-right">₹${inv.totalAmount}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>If you have any questions about this invoice, please contact the administration.</p>
            <p><strong>This is a computer generated document. No signature is required.</strong></p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Paid': 'bg-green-100 text-green-700 border-green-200',
      'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Failed': 'bg-red-100 text-red-700 border-red-200'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.Pending}`}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="p-12 text-center text-gray-500 font-medium">Loading Billing Module...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg ring-4 ring-indigo-50">
            <Receipt size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Billing & Payments</h2>
            <p className="text-sm text-gray-500">Manage room fees, services, and transactions.</p>
          </div>
        </div>
        
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-md font-semibold"
          >
            <Plus size={20} /> Generate Invoice
          </button>
        )}
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Resident / Room</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Month</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{inv.resident?.name || 'Self'}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} /> Room {inv.room?.roomNumber || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{inv.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-black text-gray-900">₹{inv.totalAmount}</div>
                    <div className="text-[10px] text-gray-400 font-medium">Base: ₹{inv.roomFee}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(inv.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {new Date(inv.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleDownloadInvoice(inv)}
                        title="Download / Print Invoice"
                        className="text-gray-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Download size={18} />
                      </button>

                      {inv.status !== 'Paid' ? (
                        <>
                          {/* 🔴 THIS IS WHERE THE PHONEPE BUTTON SHOWS FOR RESIDENTS */}
                          {(user?.role === 'resident') ? (
                            <>
                              <button 
                                onClick={() => handleOnlinePayment(inv._id)}
                                disabled={paymentLoading}
                                className="inline-flex items-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-1.5 rounded-lg text-xs font-black transition-all shadow-sm disabled:opacity-60"
                              >
                                <CreditCard size={14} /> Pay via PhonePe
                              </button>
                              {inv.transactionId && (
                                <button 
                                  onClick={() => handleRefreshPayment(inv._id)}
                                  disabled={paymentLoading}
                                  className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 hover:bg-green-100 px-4 py-1.5 rounded-lg text-xs font-black transition-all border border-green-100 disabled:opacity-60"
                                >
                                  Check Status
                                </button>
                              )}
                            </>
                          ) : (
                            <button 
                              onClick={() => handleManualPayment(inv._id)}
                              className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-1.5 rounded-lg text-xs font-black transition-all"
                            >
                              Mark Paid Cash
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-green-600 flex items-center justify-end gap-1.5 text-xs font-black bg-green-50 px-3 py-1.5 rounded-lg w-fit ml-auto border border-green-100">
                          <CheckCircle size={14}/> Invoice Paid
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-gray-400 italic">
                    <div className="flex flex-col items-center gap-2">
                      <Receipt size={40} className="text-gray-200" />
                      <span>No billing history found.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- GENERATE INVOICE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Plus className="text-indigo-600" size={20} />
                <h3 className="text-xl font-bold text-gray-800">New Bill Generation</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition"
              >✕</button>
            </div>
            
            <form onSubmit={handleGenerateInvoice} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Select Resident *</label>
                <select 
                  required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition" 
                  value={formData.residentId} 
                  onChange={(e) => setFormData({...formData, residentId: e.target.value})}
                >
                  <option value="">Choose resident with assigned room...</option>
                  {residents.map(r => (
                    <option key={r._id} value={r._id}>{r.name} — Room {r.assignedRoom?.roomNumber || '?'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Billing Month *</label>
                <input type="text" placeholder="e.g., November 2023" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition" value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Due Date *</label>
                <input type="date" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
              </div>

              <div className="col-span-2 flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-medium border border-blue-100">
                <AlertCircle size={14} /> Room fee is automatically fetched from the resident's current room assignment.
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Extra Service</label>
                <input type="text" placeholder="e.g., Laundry / Mess" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition" value={formData.additionalService} onChange={(e) => setFormData({...formData, additionalService: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Extra Amount (₹)</label>
                <input type="number" min="0" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition" value={formData.additionalAmount} onChange={(e) => setFormData({...formData, additionalAmount: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-black text-red-400 uppercase mb-2 tracking-widest">Late Fee (₹)</label>
                <input type="number" min="0" className="w-full p-3 bg-red-50 border border-red-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition text-red-700" value={formData.lateFee} onChange={(e) => setFormData({...formData, lateFee: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-black text-green-600 uppercase mb-2 tracking-widest">Discount (₹)</label>
                <input type="number" min="0" className="w-full p-3 bg-green-50 border border-green-100 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition text-green-700" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} />
              </div>

              <div className="col-span-2 pt-6 border-t flex flex-col sm:flex-row justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                >Cancel</button>
                <button 
                  type="submit" 
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
                >Confirm & Generate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;