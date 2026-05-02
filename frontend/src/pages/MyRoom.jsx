import React, { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import {
  BedDouble,
  BookOpen,
  Building2,
  CheckCircle2,
  Home,
  IndianRupee,
  Phone,
  ShieldCheck,
  Users
} from 'lucide-react';

const MyRoom = () => {
  const { user } = useContext(AuthContext);
  const [myRoom, setMyRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyRoom = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        const { data } = await axios.get(`${API_BASE_URL}/rooms/my`, config);
        setMyRoom(data || null);
      } catch (error) {
        console.error('Error fetching room details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchMyRoom();
  }, [user]);

  const roommates = useMemo(() => {
    if (!myRoom?.occupants) return [];
    const currentUserId = String(user?.id || user?._id);

    return myRoom.occupants.filter((occupant) => {
      const occupantId = String(occupant?._id || occupant?.id || occupant);
      return occupantId !== currentUserId;
    });
  }, [myRoom, user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white border border-slate-200 shadow-sm px-8 py-6 text-center">
          <div className="mx-auto mb-4 h-10 w-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500">Loading your room profile...</p>
        </div>
      </div>
    );
  }

  if (!myRoom) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-xl bg-white border border-slate-200 shadow-sm p-10 text-center">
          <div className="mx-auto mb-6 h-16 w-16 bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <BedDouble size={30} />
          </div>
          <p className="text-xs font-black text-blue-600 uppercase tracking-[0.25em]">Allocation Pending</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">No room assigned yet</h2>
          <p className="mt-4 text-slate-500 leading-7">
            Your hostel room has not been allocated yet. Once the admin assigns a room, your room number,
            rent, capacity, and roommate details will appear here automatically.
          </p>
          <div className="mt-6 border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
            Please wait for the hostel office to complete your room allocation.
          </div>
        </div>
      </div>
    );
  }

  const occupancy = myRoom.occupants?.length || 0;
  const capacity = Number(myRoom.capacity || 1);
  const availableBeds = Math.max(capacity - occupancy, 0);
  const occupancyPercent = Math.min(Math.round((occupancy / capacity) * 100), 100);

  const statCards = [
    {
      label: 'Room Number',
      value: myRoom.roomNumber,
      icon: <Home size={20} />,
      accent: 'text-blue-600 bg-blue-50 border-blue-100'
    },
    {
      label: 'Room Type',
      value: myRoom.roomType,
      icon: <Building2 size={20} />,
      accent: 'text-violet-600 bg-violet-50 border-violet-100'
    },
    {
      label: 'Monthly Rent',
      value: `₹${myRoom.pricePerMonth}`,
      icon: <IndianRupee size={20} />,
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-100'
    },
    {
      label: 'Available Beds',
      value: availableBeds,
      icon: <BedDouble size={20} />,
      accent: 'text-amber-600 bg-amber-50 border-amber-100'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-xs font-black text-blue-600 uppercase tracking-[0.25em]">Resident Room Profile</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">My Room Allocation</h1>
            <p className="mt-2 text-slate-500">
              A complete overview of your assigned room, rent, capacity, and current roommates.
            </p>
          </div>
          <div className="flex items-center gap-2 border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-700">
            <ShieldCheck size={18} />
            <span className="text-sm font-black">Active Allocation</span>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[0.95fr_1.05fr] gap-6">
        <section className="bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="relative h-80 bg-slate-100">
            {myRoom.roomPic ? (
              <img src={myRoom.roomPic} alt={`Room ${myRoom.roomNumber}`} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-300">
                <BedDouble size={72} strokeWidth={1.3} />
                <p className="mt-3 text-sm font-bold text-slate-400">No room image uploaded</p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-6">
              <p className="text-xs font-black text-blue-200 uppercase tracking-[0.25em]">Assigned Room</p>
              <h2 className="mt-1 text-4xl font-black text-white">Room {myRoom.roomNumber}</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="font-black text-slate-700">Occupancy</span>
              <span className="font-black text-blue-600">
                {occupancy}/{capacity} beds filled
              </span>
            </div>
            <div className="h-3 bg-slate-100 border border-slate-200">
              <div className="h-full bg-blue-600 transition-all duration-700" style={{ width: `${occupancyPercent}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-3 border border-slate-200 divide-x divide-slate-200">
              <div className="p-4 text-center">
                <p className="text-2xl font-black text-slate-950">{capacity}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Capacity</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-black text-slate-950">{occupancy}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupied</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-black text-slate-950">{occupancyPercent}%</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filled</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {statCards.map((card) => (
              <div key={card.label} className="bg-white border border-slate-200 border-l-4 border-l-blue-600 p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider">{card.label}</p>
                    <p className="mt-2 text-2xl font-black text-slate-950">{card.value}</p>
                  </div>
                  <div className={`h-11 w-11 flex items-center justify-center border ${card.accent}`}>
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 shadow-sm">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-blue-600 uppercase tracking-[0.25em]">Roommate Directory</p>
                <h3 className="mt-1 text-xl font-black text-slate-950">People sharing your room</h3>
              </div>
              <div className="h-11 w-11 bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Users size={22} />
              </div>
            </div>

            {roommates.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 h-14 w-14 bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                  <Users size={24} />
                </div>
                <h4 className="text-lg font-black text-slate-900">No roommates currently</h4>
                <p className="mt-2 text-sm text-slate-500">
                  You currently have the whole room to yourself. Roommate details will appear here after allocation.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {roommates.map((roommate, index) => (
                  <div key={roommate._id || index} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition">
                    <div className="h-12 w-12 bg-slate-900 text-white flex items-center justify-center font-black">
                      {roommate.name?.charAt(0)?.toUpperCase() || 'R'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-950 truncate">{roommate.name}</p>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <BookOpen size={12} /> {roommate.courseDetails || 'Resident'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Phone size={12} /> {roommate.contactNumber || 'Hidden'}
                        </span>
                      </div>
                    </div>
                    <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MyRoom;
