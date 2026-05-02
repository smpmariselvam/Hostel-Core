import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Send, Users, Bell } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const AnnouncementsManager = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientId: 'all', // Default to all residents
    title: '',
    message: '',
    type: 'general'
  });

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/users/residents`, getConfig());
        setResidents(data);
      } catch (error) {
        console.error("Error fetching residents", error);
      }
    };
    fetchResidents();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // If 'all' is selected, we loop through all residents and send individual alerts
      // (Or you could create a specific 'broadcast' route in the backend)
      const targets = formData.recipientId === 'all' 
        ? residents.map(r => r._id) 
        : [formData.recipientId];

      const sendPromises = targets.map(id => 
        axios.post(`${API_BASE_URL}/notifications`, {
          recipientId: id,
          title: formData.title,
          message: formData.message,
          type: formData.type
        }, getConfig())
      );

      await Promise.all(sendPromises);
      
      alert(`Announcement sent successfully to ${formData.recipientId === 'all' ? 'all residents' : 'the selected resident'}.`);
      setFormData({ ...formData, title: '', message: '' });
    } catch (error) {
      alert("Failed to send announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-600 text-white rounded-lg">
          <Megaphone size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Send Announcement</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b bg-gray-50 flex items-center gap-2">
          <Bell size={20} className="text-blue-600" />
          <p className="text-sm text-gray-600">
            Announcements sent here will appear in the recipient's notification bell instantly.
          </p>
        </div>

        <form onSubmit={handleSend} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recipient Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Users size={16} /> Select Recipient
              </label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={formData.recipientId}
                onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
              >
                <option value="all">Broadcast to All Residents</option>
                <optgroup label="Individual Residents">
                  {residents.map(r => (
                    <option key={r._id} value={r._id}>{r.name} (Room {r.assignedRoom?.roomNumber || 'N/A'})</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Notification Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="general">General Announcement</option>
                <option value="billing">Payment Reminder</option>
                <option value="maintenance">Maintenance Update</option>
                <option value="room">Room Change/Info</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Subject / Title *</label>
            <input 
              type="text" 
              required
              placeholder="e.g., Hostel Meeting Tonight"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
            <textarea 
              required
              rows="4"
              placeholder="Type your message here..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white transition shadow-md ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {loading ? 'Sending...' : <><Send size={18} /> Send Announcement</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementsManager;