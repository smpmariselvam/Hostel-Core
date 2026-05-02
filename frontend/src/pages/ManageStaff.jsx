import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const ManageStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStaffId, setCurrentStaffId] = useState(null);
  
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', contactNumber: '', address: '', profilePic: '' 
  });

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchStaff = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/users/staff`, getConfig());
      setStaffList(data);
    } catch (error) {
      console.error('Error fetching staff', error);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Opens modal for ADDING
  const openAddModal = () => {
    setFormData({ name: '', email: '', password: '', contactNumber: '', address: '', profilePic: '' });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  // Opens modal for EDITING
  const openEditModal = (staff) => {
    setFormData({ 
      name: staff.name, 
      email: staff.email, 
      password: '', // Leave blank so we don't accidentally overwrite it unless typed
      contactNumber: staff.contactNumber || '', 
      address: staff.address || '', 
      profilePic: staff.profilePic || '' 
    });
    setCurrentStaffId(staff._id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Handle Image Upload from device
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Convert image to Base64 string so it can be saved in the database as text
        setFormData({ ...formData, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        // Edit Existing Staff
        await axios.put(`${API_BASE_URL}/users/${currentStaffId}`, formData, getConfig());
      } else {
        // Create New Staff
        await axios.post(`${API_BASE_URL}/users/staff`, formData, getConfig());
      }
      setIsModalOpen(false);
      fetchStaff(); // Refresh list
    } catch (error) {
      // If the image is too large, the backend might reject it. 
      if (error.response?.status === 413) {
        alert("Image is too large! Please select a smaller image (under 100KB).");
      } else {
        alert(error.response?.data?.message || 'Error saving staff');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await axios.delete(`${API_BASE_URL}/users/${id}`, getConfig());
        fetchStaff(); // Refresh list
      } catch (error) {
        console.error('Error deleting staff', error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Staff</h2>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm"
        >
          <Plus size={20} /> Add Staff
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff Details</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staffList.map((staff) => (
              <tr key={staff._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full object-cover" src={staff.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                      <div className="text-sm text-gray-500">{staff.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{staff.contactNumber || 'N/A'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 truncate max-w-xs">{staff.address || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openEditModal(staff)} className="text-blue-600 hover:text-blue-900 mx-3"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(staff._id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {staffList.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No staff members found. Click "Add Staff" to create one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit Staff Details' : 'Add New Staff'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" required className="w-full mb-3 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />

                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input type="email" required className="w-full mb-3 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isEditMode ? 'New Password (leave blank to keep current)' : 'Temporary Password *'}
                  </label>
                  <input type="password" required={!isEditMode} className="w-full mb-3 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>

                {/* Right Column */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <input type="text" className="w-full mb-3 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} />

                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea rows="3" className="w-full mb-3 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>

                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                  <div className="flex items-center gap-3 mb-3">
                    {formData.profilePic && (
                      <img src={formData.profilePic} alt="Preview" className="h-10 w-10 rounded-full object-cover border border-gray-300" />
                    )}
                    <input type="file" accept="image/*" className="w-full p-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                      onChange={handleImageUpload} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  {isEditMode ? 'Update Staff' : 'Save Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStaff;