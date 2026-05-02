import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const RoomsDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // This runs automatically when the page loads
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // Fetching data from the backend API you built!
        const response = await axios.get(`${API_BASE_URL}/rooms`);
        setRooms(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) {
    return <div className="p-4 text-gray-500">Loading rooms...</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Available Rooms</h2>
      
      {/* Grid to display rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div key={room._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-gray-800">Room {room.roomNumber}</h3>
            <div className="mt-2 text-gray-600">
              <p>Capacity: {room.capacity} beds</p>
              <p>Price: ₹{room.pricePerMonth} / month</p>
            </div>
            <div className="mt-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                room.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {room.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {rooms.length === 0 && (
        <p className="text-gray-500 italic">No rooms found. Go to Thunder Client and add some!</p>
      )}
    </div>
  );
};

export default RoomsDashboard;