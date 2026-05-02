import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import { Wrench, Clock, CheckCircle, AlertTriangle, Image as ImageIcon } from 'lucide-react';

const Maintenance = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Resident Form State
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'Low', issuePic: '' });

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchRequests = async () => {
    try {
      // Safety check just in case user object isn't loaded yet
      if (!user) return;
      setLoading(true);
      
      const endpoint = (user.role === 'admin' || user.role === 'staff') 
        ? `${API_BASE_URL}/maintenance` 
        : `${API_BASE_URL}/maintenance/my`;
        
      const { data } = await axios.get(endpoint, getConfig());
      setRequests(data);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
    } else {
      setLoading(false);
    }
  }, [user]);

  // --- RESIDENT FUNCTIONS ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("File too large (Max 5MB).");
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, issuePic: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API_BASE_URL}/maintenance`, formData, getConfig());
      setFormData({ title: '', description: '', priority: 'Low', issuePic: '' });
      setRequests((current) => [data, ...current]);
      alert("Maintenance request submitted successfully.");
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting request');
    }
  };

  // --- ADMIN/STAFF FUNCTIONS ---
  const updateStatus = async (id, newStatus) => {
    try {
      const { data } = await axios.put(`${API_BASE_URL}/maintenance/${id}`, { status: newStatus }, getConfig());
      setRequests((current) => current.map((request) => (
        request._id === id ? { ...request, ...data } : request
      )));
    } catch (error) {
      alert('Error updating status');
    }
  };

  // UI Helpers
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12}/> Pending</span>;
      case 'In Progress': return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Wrench size={12}/> In Progress</span>;
      case 'Resolved': return <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Resolved</span>;
      default: return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-orange-600 font-bold';
      case 'Emergency': return 'text-red-600 font-bold flex items-center gap-1';
      default: return 'text-gray-600';
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading requests...</div>;

  // Added safety check in case the user isn't logged in yet
  if (!user) return <div className="p-8 text-center text-gray-500">Please log in to view maintenance requests.</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm"><Wrench size={24} /></div>
        <h2 className="text-2xl font-bold text-gray-800">Maintenance Requests</h2>
      </div>

      {/* --- RESIDENT VIEW: SUBMIT FORM --- */}
      {user.role === 'resident' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Submit New Request</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title *</label>
                <input type="text" required placeholder="e.g., Leaking Tap in Bathroom" className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea required rows="3" placeholder="Describe the issue in detail..." className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level *</label>
                <select className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                  <option value="Low">Low (Can wait a few days)</option>
                  <option value="Medium">Medium (Needs attention soon)</option>
                  <option value="High">High (Impacting daily living)</option>
                  <option value="Emergency">Emergency (Immediate danger/damage)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attach Photo (Optional)</label>
                <div className="flex items-center gap-3">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm border border-gray-300 p-1.5 rounded focus:ring-blue-500" />
                  {formData.issuePic && <img src={formData.issuePic} alt="Preview" className="h-10 w-10 object-cover rounded border" />}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-sm">Submit Request</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* --- SHARED VIEW: REQUESTS LIST --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">
            {user.role === 'resident' ? 'My Request History' : 'All Maintenance Tickets'}
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No maintenance requests found.</div>
          ) : (
            requests.map((req) => (
              <div key={req._id} className="p-5 flex flex-col md:flex-row gap-6 hover:bg-gray-50 transition">
                
                {/* Details Section */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-bold text-gray-900">{req.title}</h4>
                    <div className="md:hidden">{getStatusBadge(req.status)}</div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{req.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock size={14} /> {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`flex items-center gap-1 ${getPriorityColor(req.priority)}`}>
                      {req.priority === 'Emergency' && <AlertTriangle size={14} />} Priority: {req.priority}
                    </span>
                    
                    {/* Admin Specific Data */}
                    {(user.role === 'admin' || user.role === 'staff') && req.resident && (
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 font-medium">
                        Room {req.resident.assignedRoom?.roomNumber || 'N/A'} • {req.resident.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Image & Actions Section */}
                <div className="flex flex-col sm:flex-row md:flex-col items-center justify-between md:items-end gap-4 md:w-48 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4">
                  <div className="hidden md:block w-full text-right mb-auto">
                    <div className="flex justify-end">{getStatusBadge(req.status)}</div>
                  </div>
                  
                  {req.issuePic && (
                    <a href={req.issuePic} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded">
                      <ImageIcon size={14} /> View Attached Photo
                    </a>
                  )}

                  {/* Admin Status Controls */}
                  {(user.role === 'admin' || user.role === 'staff') && (
                    <select 
                      value={req.status}
                      onChange={(e) => updateStatus(req._id, e.target.value)}
                      className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                    >
                      <option value="Pending">Mark Pending</option>
                      <option value="In Progress">Mark In Progress</option>
                      <option value="Resolved">Mark Resolved</option>
                    </select>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Maintenance;