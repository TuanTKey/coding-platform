const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/auth');
const User = require('../models/User');

// Public routes
router.get('/leaderboard', userController.getLeaderboard);
// Public: get all users (hide password)
router.get('/', async (req, res) => {
  try {
    const users = await require('../models/User').find().select('-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Authenticated routes
// `/me` must be defined before `/:id` to avoid treating 'me' as an id param
router.get('/me', authenticate, userController.getCurrentUser);
router.get('/:id', userController.getUserProfile);
router.put('/me', authenticate, userController.updateProfile);

// Class management routes
router.get('/classes/all', userController.getClasses);
router.get('/classes/teacher', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const teacher = await User.findById(userId).lean();
    
    if (!teacher) return res.status(404).json({ error: 'User not found' });
    if (teacher.role !== 'teacher' && teacher.role !== 'admin') {
      return res.status(403).json({ error: 'Only teachers and admins' });
    }

    const Class = require('../models/Class');
    const teacherClasses = teacher.teacherClasses || [];
    const objectIds = teacherClasses.filter(tc => /^[0-9a-fA-F]{24}$/.test(tc));
    const names = teacherClasses.filter(tc => !(/^[0-9a-fA-F]{24}$/.test(tc)));
    
    const classQuery = { $or: [] };
    if (objectIds.length) classQuery.$or.push({ _id: { $in: objectIds } });
    if (names.length) classQuery.$or.push({ name: { $in: names } });
    
    const classes = classQuery.$or.length 
      ? await Class.find(classQuery).select('name').lean()
      : [];
    
    const classNames = classes.map(c => c.name).concat(names).filter(Boolean);
    
    res.json({ classes: classNames });
  } catch (error) {
    console.error('Get teacher classes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/class/:class/users', authenticate, userController.getUsersByClass);
router.get('/class/:class/statistics', authenticate, userController.getClassStatistics);

// Admin only routes
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

// THÊM API LẤY DANH SÁCH GIÁO VIÊN
router.get('/admin/teachers', authenticate, isAdmin, async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('username fullName email teacherClasses createdAt')
      .sort({ createdAt: -1 });

    res.json({
      teachers,
      total: teachers.length
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// TẠO GIÁO VIÊN (ADMIN ONLY)
router.post('/admin/teachers', authenticate, isAdmin, async (req, res) => {
  try {
    const { username, email, password, fullName, teacherClasses = [] } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email và password là bắt buộc' });
    }

    // Kiểm tra tồn tại
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(400).json({ error: 'Username hoặc email đã tồn tại' });

    const newTeacher = await User.create({
      username,
      email,
      password,
      fullName,
      role: 'teacher',
      teacherClasses
    });

    res.status(201).json({ message: 'Tạo giáo viên thành công', teacher: {
      id: newTeacher._id,
      username: newTeacher.username,
      email: newTeacher.email,
      fullName: newTeacher.fullName,
      teacherClasses: newTeacher.teacherClasses
    }});
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// TẠO NGƯỜI DÙNG (ADMIN ONLY) - cho phép chọn role
router.post('/admin/users', authenticate, isAdmin, userController.adminCreateUser);

// LẤY THÔNG TIN GIÁO VIÊN HIỆN TẠI, DANH SÁCH LỚP VÀ HỌC SINH TRONG LÔI
router.get('/teacher/me', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const current = await User.findById(userId).lean();
    if (!current) return res.status(404).json({ error: 'User không tồn tại' });

    if (current.role !== 'teacher' && current.role !== 'admin') {
      return res.status(403).json({ error: 'Chỉ giáo viên hoặc admin mới truy cập' });
    }

    // Lấy các lớp mà giáo viên quản lý
    const Class = require('../models/Class');
    // teacherClasses có thể chứa tên lớp (ví dụ '10A1') hoặc _id; xử lý an toàn để tránh CastError
    const teacherClasses = current.teacherClasses || [];
    const objectIds = teacherClasses.filter(tc => /^[0-9a-fA-F]{24}$/.test(tc));
    const names = teacherClasses.filter(tc => !(/^[0-9a-fA-F]{24}$/.test(tc)));
    const classQuery = { $or: [] };
    if (objectIds.length) classQuery.$or.push({ _id: { $in: objectIds } });
    if (names.length) classQuery.$or.push({ name: { $in: names } });
    const classes = classQuery.$or.length ? await Class.find(classQuery).lean() : [];

    // Lấy học sinh thuộc các lớp này (dựa theo tên lớp)
    const classNames = classes.map(c => c.name).concat(names).filter(Boolean);
    const students = await User.find({ class: { $in: classNames } }).select('username email fullName class studentId').lean();

    res.json({ teacher: { id: current._id, username: current.username, email: current.email, fullName: current.fullName }, classes, students });
  } catch (err) {
    console.error('GET /teacher/me error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// TEACHER: LẤY DANH SÁCH HỌC SINH (các lớp được phân công)
router.get('/teacher/students', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const current = await User.findById(userId).lean();
    if (!current) return res.status(404).json({ error: 'User không tồn tại' });
    if (current.role !== 'teacher' && current.role !== 'admin') return res.status(403).json({ error: 'Chỉ giáo viên/admin' });

    const Class = require('../models/Class');
    const teacherClasses = current.teacherClasses || [];
    const objectIds = teacherClasses.filter(tc => /^[0-9a-fA-F]{24}$/.test(tc));
    const names = teacherClasses.filter(tc => !(/^[0-9a-fA-F]{24}$/.test(tc)));
    const classQuery = { $or: [] };
    if (objectIds.length) classQuery.$or.push({ _id: { $in: objectIds } });
    if (names.length) classQuery.$or.push({ name: { $in: names } });
    const classes = classQuery.$or.length ? await Class.find(classQuery).lean() : [];
    const classNames = classes.map(c => c.name).concat(names).filter(Boolean);

    const students = await User.find({ class: { $in: classNames }, role: 'user' })
      .select('username email fullName class createdAt studentId')
      .lean();

    res.json({ classes, students });
  } catch (err) {
    console.error('GET /teacher/students error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// TEACHER: THÊM HỌC SINH VÀO LỚP (teacher chỉ có thể thêm vào lớp mình quản lý)
router.post('/teacher/students', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { studentId, classId } = req.body;
    if (!studentId || !classId) return res.status(400).json({ error: 'studentId và classId là bắt buộc' });

    const current = await User.findById(userId);
    if (!current) return res.status(404).json({ error: 'User không tồn tại' });
    if (current.role !== 'teacher' && current.role !== 'admin') return res.status(403).json({ error: 'Chỉ giáo viên/admin' });

    // Kiểm tra giáo viên quản lý lớp này
    const Class = require('../models/Class');
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ error: 'Class không tồn tại' });

    const manages = current.role === 'admin' || (current.teacherClasses || []).some(id => id.toString() === classId);
    if (!manages) return res.status(403).json({ error: 'Bạn không quản lý lớp này' });

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student không tồn tại' });
    if (student.role !== 'user') return res.status(400).json({ error: 'Target must be a student' });

    student.class = cls.name;
    await student.save();

    res.json({ message: 'Thêm học sinh vào lớp thành công', student: { id: student._id, username: student.username, class: student.class } });
  } catch (err) {
    console.error('POST /teacher/students error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// TEACHER: XÓA HỌC SINH KHỎI LỚP
router.delete('/teacher/students/:studentId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { studentId } = req.params;
    const { classId } = req.body; // expect classId in body to confirm which class to remove from

    if (!classId) return res.status(400).json({ error: 'classId là bắt buộc' });

    const current = await User.findById(userId);
    if (!current) return res.status(404).json({ error: 'User không tồn tại' });
    if (current.role !== 'teacher' && current.role !== 'admin') return res.status(403).json({ error: 'Chỉ giáo viên/admin' });

    const Class = require('../models/Class');
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ error: 'Class không tồn tại' });

    const manages = current.role === 'admin' || (current.teacherClasses || []).some(id => id.toString() === classId);
    if (!manages) return res.status(403).json({ error: 'Bạn không quản lý lớp này' });

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ error: 'Student không tồn tại' });
    if (student.class !== cls.name) return res.status(400).json({ error: 'Học sinh không thuộc lớp này' });

    student.class = null;
    await student.save();

    res.json({ message: 'Đã xóa học sinh khỏi lớp', student: { id: student._id } });
  } catch (err) {
    console.error('DELETE /teacher/students/:studentId error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// TEACHER: OVERRIDE/ADJUST SUBMISSION SCORE
router.post('/teacher/submissions/:submissionId/override', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { submissionId } = req.params;
    const { manualScore, note } = req.body;

    if (manualScore == null) return res.status(400).json({ error: 'manualScore là bắt buộc' });

    const current = await User.findById(userId);
    if (!current) return res.status(404).json({ error: 'User không tồn tại' });
    if (current.role !== 'teacher' && current.role !== 'admin') return res.status(403).json({ error: 'Chỉ giáo viên/admin' });

    const Submission = require('../models/Submission');
    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ error: 'Submission không tồn tại' });

    const student = await User.findById(submission.userId);
    if (!student) return res.status(404).json({ error: 'Student không tồn tại' });

    // xác nhận giáo viên quản lý lớp của học sinh
    const Class = require('../models/Class');
    const studentClass = await Class.findOne({ name: student.class });
    // current.teacherClasses may store class names or class _id strings
    const tc = current.teacherClasses || [];
    const managesByName = tc.includes(student.class);
    const managesById = studentClass && tc.some(id => /^[0-9a-fA-F]{24}$/.test(id) && id.toString() === studentClass._id.toString());
    const manages = current.role === 'admin' || managesByName || managesById;
    if (!manages) return res.status(403).json({ error: 'Bạn không có quyền chỉnh submission này' });

    submission.manualScore = manualScore;
    submission.manualOverrideNote = note || null;
    submission.manualOverriddenBy = current._id;
    submission.manualOverriddenAt = new Date();

    await submission.save();

    res.json({ message: 'Ghi đè điểm thành công', submissionId: submission._id, manualScore: submission.manualScore });
  } catch (err) {
    console.error('POST /teacher/submissions/:id/override error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// THÊM API CẬP NHẬT LỚP CHO GIÁO VIÊN
router.put('/admin/teachers/:teacherId/classes', authenticate, isAdmin, userController.updateTeacherClasses);

// THÊM API LẤY USERS THEO LỚP (đã có trong controller)
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

// THÊM API LẤY THỐNG KÊ LỚP
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