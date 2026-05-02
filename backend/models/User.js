const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff', 'resident'], default: 'resident' },
  
  // General Contact
  contactNumber: { type: String },
  address: { type: String },
  profilePic: { type: String, default: "https://cdn-icons-png.flaticon.com/512/149/149071.png" },
  
  // Resident Specific Data
  guardianName: { type: String },
  emergencyContact: { type: String },
  bloodGroup: { type: String },
  courseDetails: { type: String }, // e.g., B.Tech 2nd Year
  idProof: { type: String }, // Base64 string of ID document
  
  assignedRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);