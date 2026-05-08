const Chama = require('../models/Chama');
const User = require('../models/User');

// Create Chama
const createChama = async (req, res) => {
  try {
    const { name, description, contributionAmount, contributionFrequency } = req.body;

    const chama = new Chama({
      name,
      description,
      admin: req.user.userId,
      members: [req.user.userId],
      contributionAmount,
      contributionFrequency,
    });
    await chama.save();

    // Update user role to admin
    await User.findByIdAndUpdate(req.user.userId, {
      role: 'admin',
      chama: chama._id
    });

    res.status(201).json({ message: 'Chama created successfully', chama });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Chama Details
const getChama = async (req, res) => {
  try {
    const chama = await Chama.findById(req.params.id)
      .populate('members', 'name email phone')
      .populate('admin', 'name email');
    if (!chama) return res.status(404).json({ message: 'Chama not found' });
    res.json(chama);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Join Chama
const joinChama = async (req, res) => {
  try {
    const chama = await Chama.findById(req.params.id);
    if (!chama) return res.status(404).json({ message: 'Chama not found' });

    // Check if already a member
    if (chama.members.includes(req.user.userId)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    chama.members.push(req.user.userId);
    await chama.save();

    await User.findByIdAndUpdate(req.user.userId, { chama: chama._id });

    res.json({ message: 'Joined chama successfully', chama });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Chamas
const getAllChamas = async (req, res) => {
  try {
    const chamas = await Chama.find()
      .populate('admin', 'name email')
      .sort({ createdAt: -1 });
    res.json(chamas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createChama, getChama, joinChama, getAllChamas };