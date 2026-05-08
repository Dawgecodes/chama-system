const express = require('express');
const router = express.Router();
const {
  applyLoan,
  updateLoanStatus,
  getChamaLoans,
  getMyLoans
} = require('../controllers/loanController');
const authMiddleware = require('../middleware/auth');

router.post('/apply', authMiddleware, applyLoan);
router.put('/update/:id', authMiddleware, updateLoanStatus);
router.get('/chama/:chamaId', authMiddleware, getChamaLoans);
router.get('/my', authMiddleware, getMyLoans);

module.exports = router;