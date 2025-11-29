const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Class = require('../models/Class');
const Submission = require('../models/Submission');

// Tạo lớp mới
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, teacherId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Tên lớp là bắt buộc' });
    }

    console.log('🔄 Creating class:', { name, description, teacherId });
    const className = name.toUpperCase();

    // Kiểm tra tồn tại Class document
    const exists = await Class.findOne({ name: className });
    if (exists) {
      return res.status(400).json({ error: 'Lớp đã tồn tại' });
    }

    // Nếu teacherId được cung cấp, kiểm tra hợp lệ
    let teacher = null;
    if (teacherId) {
      teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(400).json({ error: 'teacherId không hợp lệ hoặc user không phải teacher' });
      }
    }

    // Tạo Class và cập nhật teacher trong transaction để tránh inconsistent state
    const session = await Class.startSession();
    session.startTransaction();
    try {
      const cls = await Class.create([{
        name: className,
        slug: (className || '').toLowerCase().replace(/\s+/g, '-'),
        description: description || '',
        teacherId: teacherId || null
      }], { session });

      if (teacherId) {
        await User.findByIdAndUpdate(teacherId, { $addToSet: { teacherClasses: className } }, { session });
      }

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({ message: 'Tạo lớp thành công', class: cls[0] });
    } catch (txErr) {
      await session.abortTransaction();
      session.endSession();
      console.error('Transaction create class error:', txErr);
      return res.status(500).json({ error: 'Không thể tạo lớp' });
    }
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Lấy danh sách lớp kèm thống kê (server-side)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const match = {};
    if (search) {
      match.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    // Nếu không có class documents, fallback lấy từ users
    const classes = await Class.find(match).sort({ name: 1 }).skip(Number(skip)).limit(Number(limit)).lean();

    let classNames = classes.map(c => c.name);
    if (classNames.length === 0) {
      const usersClasses = await User.distinct('class');
      classNames = (usersClasses || []).filter(c => c).map(c => c.toUpperCase());
    }

    // Aggregation lấy stats trên Submission
    const statsAgg = await Submission.aggregate([
      { $match: { 'userId.class': { $in: classNames } } },
      { $group: {
          _id: '$userId.class',
          totalSubmissions: { $sum: 1 },
          acceptedSubmissions: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
          uniqueStudents: { $addToSet: '$userId' },
          solvedProblemsSet: { $addToSet: '$problemId' }
      }},
      { $project: {
          totalSubmissions: 1,
          acceptedSubmissions: 1,
          uniqueStudents: { $size: '$uniqueStudents' },
          solvedProblems: { $size: '$solvedProblemsSet' }
      }}
    ]);

    const statsByClass = {};
    statsAgg.forEach(s => { statsByClass[s._id] = s; });

    res.json({ classes, stats: statsByClass, page: Number(page) });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Lấy chi tiết 1 lớp
router.get('/:className', authenticate, isAdmin, async (req, res) => {
  try {
    const { className } = req.params;
    const cls = await Class.findOne({ name: className }).lean();
    if (!cls) return res.status(404).json({ error: 'Lớp không tồn tại' });

    // Đếm học sinh
    const studentCount = await User.countDocuments({ class: className });

    res.json({ class: cls, studentCount });
  } catch (error) {
    console.error('Get class detail error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Danh sách học sinh trong lớp (paginated)
router.get('/:className/students', authenticate, isAdmin, async (req, res) => {
  try {
    const { className } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const students = await User.find({ class: className })
      .select('username fullName email solvedProblems rating role')
      .sort({ username: 1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .lean();

    const total = await User.countDocuments({ class: className });

    res.json({ students, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Thêm học sinh vào lớp
router.post('/:className/students', authenticate, isAdmin, async (req, res) => {
  try {
    const { className } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await User.findByIdAndUpdate(userId, { class: className });
    res.json({ message: 'Thêm học sinh vào lớp thành công' });
  } catch (error) {
    console.error('Add student to class error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Xóa học sinh khỏi lớp
router.delete('/:className/students/:userId', authenticate, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndUpdate(userId, { $unset: { class: 1 } });
    res.json({ message: 'Xóa học sinh khỏi lớp thành công' });
  } catch (error) {
    console.error('Remove student from class error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// (Removed demo student auto-creation) If needed, use a dedicated seed script.

// Cập nhật lớp
router.put('/:className', authenticate, isAdmin, async (req, res) => {
  try {
    const { className } = req.params;
    const { description, teacherId } = req.body;
    const cls = await Class.findOne({ name: className });
    if (!cls) {
      return res.status(404).json({ error: 'Lớp không tồn tại' });
    }

    // Validate teacherId if provided
    let newTeacher = null;
    if (teacherId) {
      newTeacher = await User.findById(teacherId);
      if (!newTeacher || newTeacher.role !== 'teacher') {
        return res.status(400).json({ error: 'teacherId không hợp lệ hoặc user không phải teacher' });
      }
    }

    // Use transaction to update Class and teacher assignments atomically
    const session = await Class.startSession();
    session.startTransaction();
    try {
      // Remove this class from any current teachers
      await User.updateMany({ teacherClasses: className }, { $pull: { teacherClasses: className } }, { session });

      // Assign to new teacher
      if (teacherId) {
        await User.findByIdAndUpdate(teacherId, { $addToSet: { teacherClasses: className } }, { session });
      }

      // Update class doc
      cls.description = description || cls.description;
      cls.teacherId = teacherId || null;
      await cls.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.json({ message: 'Cập nhật lớp thành công', class: cls });
    } catch (txErr) {
      await session.abortTransaction();
      session.endSession();
      console.error('Transaction update class error:', txErr);
      return res.status(500).json({ error: 'Không thể cập nhật lớp' });
    }
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Xóa lớp
router.delete('/:className', authenticate, isAdmin, async (req, res) => {
  try {
    const { className } = req.params;
    const cls = await Class.findOne({ name: className });
    if (!cls) {
      return res.status(404).json({ error: 'Lớp không tồn tại' });
    }

    // Start transaction: delete Class doc, unset users' class, remove from teachers
    const session = await Class.startSession();
    session.startTransaction();
    try {
      await Class.deleteOne({ _id: cls._id }, { session });

      await User.updateMany({ teacherClasses: className }, { $pull: { teacherClasses: className } }, { session });

      await User.updateMany({ class: className }, { $unset: { class: 1 } }, { session });

      await session.commitTransaction();
      session.endSession();

      res.json({ message: 'Xóa lớp thành công', className });
    } catch (txErr) {
      await session.abortTransaction();
      session.endSession();
      console.error('Transaction delete class error:', txErr);
      return res.status(500).json({ error: 'Không thể xóa lớp' });
    }
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
