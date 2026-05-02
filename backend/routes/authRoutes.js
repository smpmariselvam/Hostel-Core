const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- SIGNUP ROUTE ---
router.post('/register', async (req, res) => {
  try {
    const { 
      name, email, password, contactNumber, address, profilePic,
      guardianName, emergencyContact, bloodGroup, courseDetails, idProof
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists with this email" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Hardcode role to 'resident' for security. 
    // Admins/Staff are created from the dashboard.
    const newUser = new User({
      name, email, password: hashedPassword, role: 'resident',
      contactNumber, address, profilePic,
      guardianName, emergencyContact, bloodGroup, courseDetails, idProof
    });

    await newUser.save();
    res.status(201).json({ message: "Resident registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'my_super_secret_key_123', 
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;