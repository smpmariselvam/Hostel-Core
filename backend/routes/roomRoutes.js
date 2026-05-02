const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const User = require('../models/User');
const { protect, isAdminOrStaff } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const rooms = await Room.find().populate('occupants', 'name email contactNumber courseDetails').lean();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    if (!req.user.assignedRoom) {
      return res.json(null);
    }

    const room = await Room.findById(req.user.assignedRoom)
      .populate('occupants', 'name email contactNumber courseDetails')
      .lean();

    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, isAdminOrStaff, async (req, res) => {
  try {
    const { roomNumber, capacity, roomType, pricePerMonth, roomPic, status } = req.body;
    const roomExists = await Room.findOne({ roomNumber });
    if (roomExists) return res.status(400).json({ message: 'Room number already exists' });

    const newRoom = new Room({ roomNumber, capacity, roomType, pricePerMonth, roomPic, status });
    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', protect, isAdminOrStaff, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (room) {
      room.roomNumber = req.body.roomNumber || room.roomNumber;
      room.capacity = req.body.capacity || room.capacity;
      room.roomType = req.body.roomType || room.roomType;
      room.pricePerMonth = req.body.pricePerMonth || room.pricePerMonth;
      room.roomPic = req.body.roomPic || room.roomPic;
      room.status = req.body.status || room.status;

      const updatedRoom = await room.save();
      res.json(updatedRoom);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, isAdminOrStaff, async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:roomId/assign', protect, isAdminOrStaff, async (req, res) => {
  try {
    const { userId } = req.body;
    const room = await Room.findById(req.params.roomId);
    const user = await User.findById(userId);

    if (!room || !user) return res.status(404).json({ message: 'Room or User not found' });
    if (room.occupants.includes(userId)) return res.status(400).json({ message: 'User already in room' });
    if (room.occupants.length >= room.capacity) return res.status(400).json({ message: 'Room full' });

    room.occupants.push(userId);
    if (room.occupants.length === room.capacity) room.status = 'full';
    await room.save();

    user.assignedRoom = room._id;
    await user.save();

    res.json({ message: 'Resident assigned' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:roomId/remove', protect, isAdminOrStaff, async (req, res) => {
  try {
    const { userId } = req.body;
    const room = await Room.findById(req.params.roomId);
    const user = await User.findById(userId);

    if (!room || !user) return res.status(404).json({ message: 'Room or User not found' });

    room.occupants = room.occupants.filter(id => id.toString() !== userId.toString());
    if (room.status === 'full') room.status = 'available';
    await room.save();

    user.assignedRoom = null;
    await user.save();

    res.json({ message: 'Resident removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;