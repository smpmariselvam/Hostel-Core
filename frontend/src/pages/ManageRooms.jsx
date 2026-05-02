import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, X, Users, UserPlus, UserMinus, Search } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [unassignedResidents, setUnassignedResidents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isOccupantModalOpen, setIsOccupantModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Selection state
  const [currentRoom, setCurrentRoom] = useState(null);
  const [selectedResidentId, setSelectedResidentId] = useState('');
  
  const [formData, setFormData] = useState({ 
    roomNumber: '', capacity: 2, roomType: 'Non-AC', pricePerMonth: '', status: 'available', roomPic: '' 
  });

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchData = async () => {
    try {
      // Fetch Rooms
      const roomRes = await axios.get(`${API_BASE_URL}/rooms`, getConfig());
      setRooms(roomRes.data);

      // Fetch Residents (to find who needs a room)
      const resData = await axios.get(`${API_BASE_URL}/users/residents`, getConfig());
      // Filter out residents that already have an assignedRoom
      const waitingList = resData.data.filter(user => !user.assignedRoom);
      setUnassignedResidents(waitingList);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter rooms based on search query (Room Number OR Occupant Name)
  const filteredRooms = rooms.filter(room => {
    const query = searchQuery.toLowerCase();
    const matchRoomNumber = room.roomNumber.toLowerCase().includes(query);
    const matchOccupant = room.occupants?.some(occ => occ.name?.toLowerCase().includes(query));
    return matchRoomNumber || matchOccupant;
  });

  // --- ROOM CRUD FUNCTIONS ---
  const openAddModal = () => {
    setFormData({ roomNumber: '', capacity: 2, roomType: 'Non-AC', pricePerMonth: '', status: 'available', roomPic: '' });
    setIsEditMode(false);
    setIsRoomModalOpen(true);
  };

  const openEditModal = (room) => {
    setFormData({ 
      roomNumber: room.roomNumber, capacity: room.capacity, roomType: room.roomType, 
      pricePerMonth: room.pricePerMonth, status: room.status, roomPic: room.roomPic || '' 
    });
    setCurrentRoom(room);
    setIsEditMode(true);
    setIsRoomModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("File too large (Max 5MB).");
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, roomPic: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/rooms/${currentRoom._id}`, formData, getConfig());
      } else {
        await axios.post(`${API_BASE_URL}/rooms`, formData, getConfig());
      }
      setIsRoomModalOpen(false);
      fetchData(); 
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving room');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm("Are you sure you want to delete this room? It will remove any assigned residents!")) {
      try {
        await axios.delete(`${API_BASE_URL}/rooms/${id}`, getConfig());
        fetchData(); 
      } catch (error) {
        console.error('Error deleting room', error);
      }
    }
  };

  // --- CHECK-IN / CHECK-OUT FUNCTIONS ---
  const openOccupantModal = (room) => {
    setCurrentRoom(room);
    setSelectedResidentId('');
    setIsOccupantModalOpen(true);
  };

  const handleCheckIn = async () => {
    if (!selectedResidentId) return alert("Please select a resident to check in.");
    try {
      await axios.post(`${API_BASE_URL}/rooms/${currentRoom._id}/assign`, { userId: selectedResidentId }, getConfig());
      setIsOccupantModalOpen(false);
      fetchData(); // Refresh everything
    } catch (error) {
      alert(error.response?.data?.message || 'Error checking in resident');
    }
  };

  const handleCheckOut = async (userId) => {
    if (window.confirm("Check out this resident?")) {
      try {
        await axios.post(`${API_BASE_URL}/rooms/${currentRoom._id}/remove`, { userId }, getConfig());
        setIsOccupantModalOpen(false);
        fetchData(); // Refresh everything
      } catch (error) {
        alert(error.response?.data?.message || 'Error checking out resident');
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'full': return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div>
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Room Allocation</h2>
          <p className="text-sm text-gray-500 mt-1">{unassignedResidents.length} Residents currently waiting for a room.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search room or resident..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition shadow-sm whitespace-nowrap text-sm font-medium">
            <Plus size={18} /> Add New Room
          </button>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div key={room._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col">
            {/* Image Header */}
            <div className="h-40 bg-gray-200 relative shrink-0">
              {room.roomPic ? (
                <img src={room.roomPic} alt={`Room ${room.roomNumber}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">No Image</div>
              )}
              <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(room.status)} shadow-sm uppercase`}>
                {room.status}
              </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
              <div className="flex justify-between items-center mb-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-gray-900 truncate">Room {room.roomNumber}</h3>
                  <p className="text-sm text-gray-500 truncate">{room.roomType} • ₹{room.pricePerMonth}/mo</p>
                </div>
                {/* Sleeker Manage Occupants Button */}
                <button 
                  onClick={() => openOccupantModal(room)}
                  className="shrink-0 ml-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition border border-indigo-100"
                >
                  <Users size={14} /> Manage
                </button>
              </div>

              {/* Occupancy Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span className="font-medium text-xs text-gray-500 uppercase tracking-wider">Occupancy</span>
                  <span className="font-bold text-xs">{room.occupants?.length || 0} / {room.capacity}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${room.occupants?.length === room.capacity ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${((room.occupants?.length || 0) / room.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Occupant Names List */}
              <div className="flex-1 mb-4">
                {room.occupants?.length > 0 ? (
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                    <span className="text-gray-400 font-medium mr-1">Residents:</span> 
                    {room.occupants.map(occ => occ.name).join(', ')}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic">No residents assigned</p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-auto">
                <button onClick={() => openEditModal(room)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md transition"><Edit size={16} /></button>
                <button onClick={() => handleDeleteRoom(room._id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md transition"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results Fallback */}
      {filteredRooms.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
          <Search className="mx-auto text-gray-300 mb-3" size={32} />
          <h3 className="text-lg font-medium text-gray-900">No rooms found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search query or add a new room.</p>
        </div>
      )}

      {/* --- ADD/EDIT ROOM MODAL --- */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit Room' : 'Add New Room'}</h3>
              <button onClick={() => setIsRoomModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
            </div>
            <form onSubmit={handleRoomSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                  <input type="text" required className="w-full mb-4 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" value={formData.roomNumber} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} />
                  
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Beds) *</label>
                  <input type="number" min="1" required className="w-full mb-4 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})} />
                  
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Month (₹) *</label>
                  <input type="number" min="0" required className="w-full mb-4 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" value={formData.pricePerMonth} onChange={(e) => setFormData({...formData, pricePerMonth: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
                  <select className="w-full mb-4 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" value={formData.roomType} onChange={(e) => setFormData({...formData, roomType: e.target.value})}>
                    <option value="Non-AC">Non-AC</option><option value="AC">AC</option>
                  </select>
                  
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full mb-4 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="available">Available</option><option value="full">Full</option><option value="maintenance">Maintenance</option>
                  </select>
                  
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Picture</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm border border-gray-300 p-1.5 rounded focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsRoomModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MANAGE OCCUPANTS MODAL (CHECK-IN / CHECK-OUT) --- */}
      {isOccupantModalOpen && currentRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Manage Room {currentRoom.roomNumber}</h3>
                <p className="text-sm text-gray-500">{currentRoom.occupants.length} / {currentRoom.capacity} Beds Occupied</p>
              </div>
              <button onClick={() => setIsOccupantModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
            </div>
            
            <div className="p-6">
              {/* CURRENT OCCUPANTS LIST (Check-out) */}
              <h4 className="font-semibold text-gray-700 mb-3 border-b pb-1">Current Residents</h4>
              <div className="space-y-3 mb-6">
                {currentRoom.occupants.map((resident) => (
                  <div key={resident._id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{resident.name}</p>
                      <p className="text-xs text-gray-500">{resident.courseDetails || 'Resident'}</p>
                    </div>
                    <button 
                      onClick={() => handleCheckOut(resident._id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-md transition flex items-center gap-1 text-sm font-medium"
                    >
                      <UserMinus size={16} /> Check-out
                    </button>
                  </div>
                ))}
                {currentRoom.occupants.length === 0 && (
                  <p className="text-sm text-gray-500 italic">This room is completely empty.</p>
                )}
              </div>

              {/* NEW OCCUPANT (Check-in) */}
              <h4 className="font-semibold text-gray-700 mb-3 border-b pb-1">Assign New Resident</h4>
              {currentRoom.occupants.length >= currentRoom.capacity ? (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
                  ⚠️ This room is at full capacity. Check someone out to make space.
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <select 
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={selectedResidentId}
                    onChange={(e) => setSelectedResidentId(e.target.value)}
                  >
                    <option value="">-- Select Resident from Waiting List --</option>
                    {unassignedResidents.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.courseDetails || 'New Resident'})
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={handleCheckIn}
                    disabled={!selectedResidentId}
                    className={`px-4 py-2 rounded-md flex items-center justify-center gap-1 font-medium text-white transition whitespace-nowrap ${
                      selectedResidentId ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <UserPlus size={18} /> Check-in
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button onClick={() => setIsOccupantModalOpen(false)} className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition text-gray-700">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;