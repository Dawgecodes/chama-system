const express = require('express');
const router = express.Router();
const {
  makeContribution,
  contributionCallback,
  getChamaContributions,
  getMyContributions
} = require('../controllers/contributionController');
const authMiddleware = require('../middleware/auth');

router.post('/contribute', authMiddleware, makeContribution);
router.post('/callback', contributionCallback);
router.get('/chama/:chamaId', authMiddleware, getChamaContributions);
router.get('/my', authMiddleware, getMyContributions);

module.exports = router;