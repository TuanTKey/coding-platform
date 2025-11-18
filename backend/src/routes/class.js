const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const User = require('../models/User');

// Tạo lớp mới
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, teacherId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Tên lớp là bắt buộc' });
    }

    // Kiểm tra lớp đã tồn tại trong hệ thống (có học sinh trong lớp)
    const existingUsers = await User.find({ class: name.toUpperCase() });
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Lớp đã tồn tại trong hệ thống' });
    }

    // Nếu có teacherId, cập nhật teacherClasses cho giáo viên
    if (teacherId) {
      await User.findByIdAndUpdate(teacherId, {
        $addToSet: { teacherClasses: name.toUpperCase() }
      });
    }

    res.status(201).json({
      message: 'Tạo lớp thành công',
      className: name.toUpperCase()
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cập nhật lớp
router.put('/:className', authenticate, isAdmin, async (req, res) => {
  try {
    const { className } = req.params;
    const { description, teacherId } = req.body;

    // Xóa teacher cũ khỏi lớp này
    const oldTeachers = await User.find({ 
      teacherClasses: className,
      role: 'teacher'
    });
    
    for (let teacher of oldTeachers) {
      await User.findByIdAndUpdate(teacher._id, {
        $pull: { teacherClasses: className }
      });
    }

    // Thêm teacher mới
    if (teacherId) {
      await User.findByIdAndUpdate(teacherId, {
        $addToSet: { teacherClasses: className }
      });
    }

    res.json({
      message: 'Cập nhật lớp thành công',
      className
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Xóa lớp
router.delete('/:className', authenticate, isAdmin, async (req, res) => {
  try {
    const { className } = req.params;

    // Xóa lớp khỏi teacherClasses của tất cả giáo viên
    await User.updateMany(
      { teacherClasses: className },
      { $pull: { teacherClasses: className } }
    );

    // Đặt class = null cho tất cả học sinh trong lớp
    await User.updateMany(
      { class: className },
      { $unset: { class: 1 } }
    );

    res.json({
      message: 'Xóa lớp thành công',
      className
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;