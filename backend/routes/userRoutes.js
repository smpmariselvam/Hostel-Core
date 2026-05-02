const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect, isAdmin, isAdminOrStaff } = require('../middleware/authMiddleware');

// --- STAFF ROUTES (Only Admin can manage staff) ---
router.get('/staff', protect, isAdmin, async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('-password');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/staff', protect, isAdmin, async (req, res) => {
  try {
    const { name, email, password, contactNumber, address, profilePic } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const staff = new User({ name, email, password: hashedPassword, role: 'staff', contactNumber, address, profilePic });
    await staff.save();
    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- RESIDENT ROUTES (Admin & Staff can manage residents) ---
router.get('/residents', protect, isAdminOrStaff, async (req, res) => {
  try {
    const residents = await User.find({ role: 'resident' }).select('-password').populate('assignedRoom');
    res.json(residents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/residents', protect, isAdminOrStaff, async (req, res) => {
  try {
    const { name, email, password, contactNumber, address, profilePic, guardianName, emergencyContact, bloodGroup, courseDetails, idProof } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const resident = new User({ name, email, password: hashedPassword, role: 'resident', contactNumber, address, profilePic, guardianName, emergencyContact, bloodGroup, courseDetails, idProof });
    await resident.save();
    res.status(201).json(resident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- SHARED ROUTES (Edit & Delete applies to Admin & Staff) ---
router.put('/:id', protect, isAdminOrStaff, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.contactNumber = req.body.contactNumber || user.contactNumber;
      user.address = req.body.address || user.address;
      user.profilePic = req.body.profilePic || user.profilePic;
      user.guardianName = req.body.guardianName || user.guardianName;
      user.emergencyContact = req.body.emergencyContact || user.emergencyContact;
      user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
      user.courseDetails = req.body.courseDetails || user.courseDetails;
      user.idProof = req.body.idProof || user.idProof;

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, isAdminOrStaff, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;