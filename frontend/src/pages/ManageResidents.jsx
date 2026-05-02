import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const ManageResidents = () => {
  const [residentList, setResidentList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentResidentId, setCurrentResidentId] = useState(null);
  
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', contactNumber: '', address: '', profilePic: '',
    guardianName: '', emergencyContact: '', bloodGroup: '', courseDetails: '', idProof: ''
  });

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchResidents = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/users/residents`, getConfig());
      setResidentList(data);
    } catch (error) {
      console.error('Error fetching residents', error);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const openAddModal = () => {
    setFormData({ 
      name: '', email: '', password: '', contactNumber: '', address: '', profilePic: '',
      guardianName: '', emergencyContact: '', bloodGroup: '', courseDetails: '', idProof: ''
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (resident) => {
    setFormData({ 
      name: resident.name, email: resident.email, password: '', 
      contactNumber: resident.contactNumber || '', address: resident.address || '', 
      profilePic: resident.profilePic || '', guardianName: resident.guardianName || '',
      emergencyContact: resident.emergencyContact || '', bloodGroup: resident.bloodGroup || '',
      courseDetails: resident.courseDetails || '', idProof: resident.idProof || ''
    });
    setCurrentResidentId(resident._id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Please upload an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/users/${currentResidentId}`, formData, getConfig());
      } else {
        await axios.post(`${API_BASE_URL}/users/residents`, formData, getConfig());
      }
      setIsModalOpen(false);
      fetchResidents(); 
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving resident');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this resident?")) {
      try {
        await axios.delete(`${API_BASE_URL}/users/${id}`, getConfig());
        fetchResidents(); 
      } catch (error) {
        console.error('Error deleting resident', error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Residents</h2>
        <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm">
          <Plus size={20} /> Add Resident
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Resident Details</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course / Blood Grp</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Guardian Contact</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Room Allocation</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {residentList.map((resident) => (
              <tr key={resident._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full object-cover" src={resident.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{resident.name}</div>
                      <div className="text-sm text-gray-500">{resident.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{resident.courseDetails || 'N/A'}</div>
                  <div className="text-sm text-red-500 font-bold">{resident.bloodGroup || 'N/A'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{resident.guardianName || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{resident.emergencyContact || 'N/A'}</div>
                </td>
                {/* NEW ROOM ALLOCATION COLUMN */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {resident.assignedRoom ? (
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                      Room {resident.assignedRoom.roomNumber}
                    </span>
                  ) : (
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      Not Assigned
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openEditModal(resident)} className="text-blue-600 hover:text-blue-900 mx-3"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(resident._id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {residentList.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No residents found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit Resident' : 'Add New Resident'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 border-b pb-2">Personal Details</h4>
                  <input type="text" placeholder="Full Name *" required className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  <input type="email" placeholder="Email Address *" required className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  <input type="password" placeholder={isEditMode ? 'New Password (Optional)' : 'Temporary Password *'} required={!isEditMode} className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  <input type="text" placeholder="Mobile Number *" required className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} />
                  <textarea placeholder="Permanent Address *" required rows="2" className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 border-b pb-2">Hostel & Emergency Details</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Course/Year *" required className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" value={formData.courseDetails} onChange={(e) => setFormData({...formData, courseDetails: e.target.value})} />
                    <input type="text" placeholder="Blood Group" className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} />
                  </div>
                  <input type="text" placeholder="Guardian Name *" required className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" value={formData.guardianName} onChange={(e) => setFormData({...formData, guardianName: e.target.value})} />
                  <input type="text" placeholder="Emergency Contact *" required className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500" value={formData.emergencyContact} onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})} />
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Profile Picture (Optional)</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'profilePic')} className="w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Upload ID Proof *</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'idProof')} className="w-full text-sm" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">{isEditMode ? 'Update Resident' : 'Save Resident'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageResidents;