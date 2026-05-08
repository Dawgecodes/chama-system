const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chama: { type: mongoose.Schema.Types.ObjectId, ref: 'Chama', required: true },
  amount: { type: Number, required: true },
  phone: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  merchantRequestID: String,
  checkoutRequestID: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contribution', contributionSchema);