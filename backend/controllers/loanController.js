const Loan = require('../models/Loan');
const Chama = require('../models/Chama');

// Apply for Loan
const applyLoan = async (req, res) => {
  try {
    const { amount, reason, chamaId } = req.body;

    // Check chama balance
    const chama = await Chama.findById(chamaId);
    if (!chama) return res.status(404).json({ message: 'Chama not found' });
    if (chama.totalBalance < amount) {
      return res.status(400).json({ message: 'Insufficient chama balance' });
    }

    const loan = new Loan({
      member: req.user.userId,
      chama: chamaId,
      amount,
      reason,
    });
    await loan.save();

    res.status(201).json({ message: 'Loan application submitted', loan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve or Reject Loan
const updateLoanStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    loan.status = status;
    loan.approvedBy = req.user.userId;

    // Deduct from chama balance if approved
    if (status === 'approved') {
      await Chama.findByIdAndUpdate(
        loan.chama,
        { $inc: { totalBalance: -loan.amount } }
      );
    }

    await loan.save();
    res.json({ message: `Loan ${status} successfully`, loan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Loans for a Chama
const getChamaLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ chama: req.params.chamaId })
      .populate('member', 'name phone')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get My Loans
const getMyLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ member: req.user.userId })
      .populate('chama', 'name')
      .sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { applyLoan, updateLoanStatus, getChamaLoans, getMyLoans };