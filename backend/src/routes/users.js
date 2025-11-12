const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/auth'); // THÊM isAdmin
const User = require('../models/User'); // THÊM dòng này

router.get('/me', authenticate, userController.getCurrentUser);
router.put('/me', authenticate, userController.updateProfile);
router.get('/leaderboard', userController.getLeaderboard);
router.get('/:id', userController.getUserProfile);

// Route stats cho admin
router.get('/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({ totalUsers });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;