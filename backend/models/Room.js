const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true, default: 2 },
  roomType: { type: String, enum: ['AC', 'Non-AC'], default: 'Non-AC' }, // Helps with resident preferences
  occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Tracks who is currently in the room
  status: { type: String, enum: ['available', 'full', 'maintenance'], default: 'available' },
  pricePerMonth: { type: Number, required: true },
  roomPic: { type: String } // Base64 Image
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);