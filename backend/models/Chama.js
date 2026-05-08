const mongoose = require('mongoose');

const chamaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  contributionAmount: { type: Number, required: true },
  contributionFrequency: {
    type: String,
    enum: ['weekly', 'monthly'],
    default: 'monthly'
  },
  totalBalance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chama', chamaSchema);