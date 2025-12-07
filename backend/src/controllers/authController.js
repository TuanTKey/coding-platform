const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateStudentId } = require('../utils/studentIdGenerator');

exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, class: userClass, studentId } = req.body;

    // Validate
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email and password are required' 
      });
    }

    if (!userClass) {
      return res.status(400).json({ 
        error: 'Vui lòng chọn lớp học' 
      });
    }

    // If studentId not provided, auto-generate one
    let finalStudentId = studentId;
    if (!finalStudentId) {
      finalStudentId = await generateStudentId();
    } else {
      finalStudentId = String(finalStudentId).trim();
      if (!finalStudentId) {
        finalStudentId = await generateStudentId();
      }
    }

    // Check existing user or studentId
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }, { studentId: finalStudentId }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Username, email hoặc mã số sinh viên đã tồn tại' 
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      fullName,
      class: userClass,
      role: 'user',
      studentId: String(finalStudentId)
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        studentId: user.studentId || null
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        rating: user.rating
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};