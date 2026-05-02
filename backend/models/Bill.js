const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true }, // e.g., "Monthly Rent - October"
  status: { type: String, enum: ['unpaid', 'paid', 'overdue'], default: 'unpaid' },
  dueDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);