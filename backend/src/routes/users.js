const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/auth');
const User = require('../models/User');

// ... các route khác ...

// SỬA LẠI Route stats cho admin
router.get('/admin/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'user' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    res.json({ 
      totalUsers,
      totalStudents, 
      totalTeachers,
      totalAdmins
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// THÊM API để lấy users theo lớp
router.get('/class/:className/users', authenticate, isAdmin, async (req, res) => {
  try {
    const { className } = req.params;
    
    const users = await User.find({ 
      class: className,
      role: 'user' // chỉ lấy học sinh
    }).select('username fullName email solvedProblems rating avatar class');
    
    res.json({
      className,
      users,
      total: users.length
    });
  } catch (error) {
    console.error('Get class users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// THÊM API để lấy thống kê lớp
router.get('/class/:className/statistics', authenticate, isAdmin, async (req, res) => {
  try {
    const { className } = req.params;
    
    // Lấy tất cả users trong lớp
    const users = await User.find({ class: className, role: 'user' });
    const userIds = users.map(user => user._id);
    
    // Import Submission model
    const Submission = require('../models/Submission');
    
    // Lấy thống kê submissions
    const submissions = await Submission.find({ 
      userId: { $in: userIds } 
    });
    
    const acceptedSubmissions = submissions.filter(sub => sub.status === 'accepted');
    const solvedProblems = new Set(acceptedSubmissions.map(sub => sub.problemId?.toString())).size;
    
    res.json({
      className,
      totalStudents: users.length,
      totalSubmissions: submissions.length,
      acceptedSubmissions: acceptedSubmissions.length,
      solvedProblemsCount: solvedProblems,
      acceptanceRate: submissions.length > 0 ? 
        ((acceptedSubmissions.length / submissions.length) * 100).toFixed(1) : 0
    });
  } catch (error) {
    console.error('Get class statistics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;