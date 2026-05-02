const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, isAdminOrStaff } = require('../middleware/authMiddleware');

// @route   POST /api/notifications
// @desc    Create a custom in-app alert (Admin/Staff only)
router.post('/', protect, isAdminOrStaff, async (req, res) => {
  try {
    const { recipientId, title, message, type } = req.body;
    
    const notification = new Notification({
      recipient: recipientId, 
      title, 
      message, 
      type
    });
    
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/notifications/my
// @desc    Get logged-in user's notifications
router.get('/my', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
                                          .sort({ createdAt: -1 })
                                          .limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;