const express = require('express');
const router = express.Router();
const { createChama, getChama, joinChama, getAllChamas } = require('../controllers/chamaController');
const authMiddleware = require('../middleware/auth');

router.post('/create', authMiddleware, createChama);
router.get('/all', authMiddleware, getAllChamas);
router.get('/:id', authMiddleware, getChama);
router.post('/join/:id', authMiddleware, joinChama);

module.exports = router;