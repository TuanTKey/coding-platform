const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');
const judgeService = require('../services/judgeService');

// Submit solution
exports.submitSolution = async (req, res) => {
  try {
    const { problemId, code, language, contestId } = req.body;

    console.log('📝 Submit request - problemId:', problemId, 'language:', language, 'codeLength:', code?.length);

    // Validate
    if (!problemId || !code || !language) {
      console.error('❌ Validation failed:', { problemId: !!problemId, code: !!code, language: !!language });
      return res.status(400).json({ 
        error: 'Problem ID, code and language are required' 
      });
    }

    // Check if problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      console.error('❌ Problem not found:', problemId);
      return res.status(404).json({ error: 'Problem not found' });
    }

    console.log('⏱️  Problem timeLimit:', problem.timeLimit, 'ms');

    // Get all test cases for this problem
    const testCases = await TestCase.find({ problemId });
    console.log('📊 Found test cases:', testCases.length);

    // If no test cases, submission will be pending - teacher can add test cases later
    if (testCases.length === 0) {
      console.log('⚠️  No test cases for problem (sẽ được chấm khi có test cases)');
    }

    // Check if student already has a submission for this problem
    let existingSubmission = await Submission.findOne({
      userId: req.user.id,
      problemId: problemId
    });

    if (existingSubmission) {
      // Update existing submission - only update code and reset scoring
      console.log('🔄 Updating existing submission:', existingSubmission._id);
      existingSubmission.code = code;
      existingSubmission.language = language;
      existingSubmission.status = 'submitted';  // Reset to submitted
      existingSubmission.score = null;  // Reset score
      existingSubmission.scoreNote = null;
      existingSubmission.scoredBy = null;
      existingSubmission.scoredAt = null;
      existingSubmission.totalTestCases = testCases.length;
      
      await existingSubmission.save();

      return res.status(200).json({
        message: '✅ Bài tập đã cập nhập thành công!',
        submissionId: existingSubmission._id,
        status: 'submitted',
        testCasesResult: [],
        isUpdate: true
      });
    }

    // Create new submission if no existing one
    const submissionData = {
      userId: req.user.id,
      problemId,
      code,
      language,
      status: 'submitted',  // Chỉ lưu, không judge
      totalTestCases: testCases.length
    };
    
    // Thêm contestId nếu có
    if (contestId) {
      submissionData.contestId = contestId;
    }
    
    const submission = await Submission.create(submissionData);

    // ❌ Không judge, chỉ lưu submission
    // judgeService.judgeSubmission(submission._id, problem, testCases, code, language);

    res.status(201).json({
      message: '✅ Bài tập đã nộp thành công!',
      submissionId: submission._id,
      status: 'submitted',
      testCasesResult: [],
      isUpdate: false
    });
  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get submission status
exports.getSubmissionStatus = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problemId', 'title slug')
      .populate('userId', 'username fullName email class');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check access: owner, admin, or teacher of the student
    const isOwner = submission.userId._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    let isTeacher = false;

    if (req.user.role === 'teacher') {
      // Check if student's class is in teacher's classes
      const User = require('../models/User');
      const teacher = await User.findById(req.user.id).lean();
      const studentClass = submission.userId.class;
      const teacherClasses = teacher?.teacherClasses || [];
      isTeacher = teacherClasses.includes(studentClass);
    }

    if (!isOwner && !isAdmin && !isTeacher) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ 
      submission,
      testCasesResult: submission.testCasesResult || []
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user's submissions
exports.getUserSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 20, problemId, status } = req.query;
    
    const query = { userId: req.user.id };
    
    if (problemId) {
      query.problemId = problemId;
    }
    
    if (status) {
      query.status = status;
    }

    const submissions = await Submission.find(query)
      .populate('problemId', 'title slug difficulty')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Submission.countDocuments(query);

    res.json({
      submissions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all submissions (admin only)
exports.getAllSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const submissions = await Submission.find()
      .populate('userId', 'username fullName class')
      .populate('problemId', 'title slug')
      .populate('contestId', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Map lại cho frontend dễ dùng
    const mapped = submissions.map(s => ({
      ...s,
      user: s.userId,
      problem: s.problemId,
      contest: s.contestId,
    }));

    const count = await Submission.countDocuments();

    res.json({
      submissions: mapped,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user's submissions for a specific contest
exports.getUserContestSubmissions = async (req, res) => {
  try {
    const { contestId } = req.params;
    
    const submissions = await Submission.find({
      userId: req.user.id,
      contestId: contestId
    })
      .populate('problemId', 'title slug')
      .select('problemId status createdAt')
      .sort({ createdAt: -1 });

    res.json({ submissions });
  } catch (error) {
    console.error('Get user contest submissions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// RUN CODE với custom input (không chấm điểm)
exports.runCode = async (req, res) => {
  try {
    const { code, language, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    console.log('🏃 Running code with custom input...');

    const { exec } = require('child_process');
    const fs = require('fs').promises;
    const path = require('path');
    const os = require('os');

    // Python path for Windows
    const PYTHON_PATH = process.platform === 'win32' 
      ? 'C:\\Users\\Dell\\AppData\\Local\\Programs\\Python\\Python312\\python.exe'
      : 'python3';

    // Language configs - FIXED for Windows/Linux compatibility
    const LANG_CONFIG = {
      python: { 
        ext: 'py', 
        cmd: (f) => `"${PYTHON_PATH}" "${f}"` 
      },
      javascript: { 
        ext: 'js', 
        cmd: (f) => `node "${f}"` 
      },
      cpp: { 
        ext: 'cpp', 
        compile: (f) => process.platform === 'win32' 
          ? `g++ "${f}" -o "${f.replace('.cpp', '.exe')}"` 
          : `g++ "${f}" -o "${f}.out"`, 
        cmd: (f) => process.platform === 'win32' ? `"${f}"` : `"${f}.out"` 
      },
      java: { 
        ext: 'java', 
        compile: (f) => `javac "${f}"`, 
        cmd: (f) => `java -cp "${path.dirname(f)}" Solution` 
      }
    };

    const config = LANG_CONFIG[language];
    if (!config) {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    // Create temp directory in system temp folder
    const tempDir = path.join(os.tmpdir(), `code_runner_${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Java requires filename to match class name (Solution.java)
    const baseFilename = language === 'java' ? 'Solution' : 'solution';
    const filename = path.join(tempDir, `${baseFilename}.${config.ext}`);
    await fs.writeFile(filename, code);

    let executablePath = filename;

    // Compile if needed
    if (config.compile) {
      const compileCmd = config.compile(filename);
      const compileResult = await new Promise((resolve) => {
        exec(compileCmd, { cwd: tempDir, timeout: 10000 }, (error, stdout, stderr) => {
          resolve({ error, stdout, stderr });
        });
      });

      if (compileResult.error) {
        await fs.rm(tempDir, { recursive: true, force: true });
        return res.json({
          error: compileResult.stderr || 'Compilation error',
          executionTime: 0
        });
      }
      
      // Update executable path for compiled languages
      if (language === 'cpp') {
        executablePath = process.platform === 'win32' 
          ? filename.replace('.cpp', '.exe') 
          : `${filename}.out`;
      }
    }

    // Run code
    const startTime = Date.now();
    const runCmd = config.cmd(executablePath);

    const runResult = await new Promise((resolve) => {
      const child = exec(runCmd, {
        cwd: tempDir,
        timeout: 10000, // 10 seconds timeout
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        windowsHide: true
      }, (error, stdout, stderr) => {
        const executionTime = Date.now() - startTime;
        resolve({ error, stdout, stderr, executionTime });
      });

      // Send input to stdin
      if (input && child.stdin) {
        try {
          child.stdin.write(input);
          child.stdin.end();
        } catch (e) {
          // Ignore stdin errors
        }
      }
    });

    // Cleanup with retry for Windows
    const cleanupWithRetry = async (dir, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          await new Promise(r => setTimeout(r, 100 * (i + 1))); // Wait before cleanup
          await fs.rm(dir, { recursive: true, force: true });
          return;
        } catch (e) {
          if (i === retries - 1) {
            console.warn('Cleanup failed after retries:', dir);
          }
        }
      }
    };
    
    // Don't await cleanup to avoid blocking response
    cleanupWithRetry(tempDir);

    // Return result
    if (runResult.error) {
      if (runResult.error.killed) {
        return res.json({
          error: 'Time Limit Exceeded (10s)',
          executionTime: runResult.executionTime
        });
      }
      return res.json({
        error: runResult.stderr || runResult.error.message,
        executionTime: runResult.executionTime
      });
    }

    res.json({
      output: runResult.stdout,
      executionTime: runResult.executionTime
    });

  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({ error: 'Failed to run code: ' + error.message });
  }
};

// Get teacher statistics for their classes
exports.getTeacherStats = async (req, res) => {
  try {
    const User = require('../models/User');
    const Class = require('../models/Class');
    const mongoose = require('mongoose');
    
    const teacherId = req.user.id;
    const teacher = await User.findById(teacherId);
    
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can access this' });
    }

    const teacherClasses = teacher.teacherClasses || [];
    
    // Get all students in teacher's classes
    const classNames = [];
    for (const classItem of teacherClasses) {
      let cls = null;
      
      // Check if classItem is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(classItem)) {
        cls = await Class.findById(classItem).lean();
      } else {
        // classItem is a class name string
        classNames.push(classItem);
        continue;
      }
      
      if (cls) classNames.push(cls.name);
    }

    // Get all students in these classes
    const students = await User.find({ 
      class: { $in: classNames },
      role: 'user'
    }).lean();
    const studentIds = students.map(s => s._id);

    // Get submissions for these students
    const submissions = await Submission.find({ 
      userId: { $in: studentIds } 
    }).populate('problemId', 'title slug').lean();

    // Calculate statistics
    const totalSubmissions = submissions.length;
    const acceptedCount = submissions.filter(s => s.status === 'accepted').length;
    const rejectedCount = submissions.filter(s => s.status === 'wrong_answer' || s.status === 'runtime_error' || s.status === 'time_limit_exceeded').length;
    const pendingCount = submissions.filter(s => s.status === 'pending' || s.status === 'judging').length;

    // Per-problem statistics
    const problemStats = {};
    for (const submission of submissions) {
      const problemId = submission.problemId._id.toString();
      if (!problemStats[problemId]) {
        problemStats[problemId] = {
          problemId,
          problemTitle: submission.problemId?.title || 'Unknown',
          totalSubmissions: 0,
          accepted: 0,
          rejected: 0,
          submitCount: {}
        };
      }
      problemStats[problemId].totalSubmissions++;
      if (submission.status === 'accepted') {
        problemStats[problemId].accepted++;
      } else if (submission.status !== 'pending' && submission.status !== 'judging') {
        problemStats[problemId].rejected++;
      }
      
      // Count submissions per user
      const userId = submission.userId.toString();
      if (!problemStats[problemId].submitCount[userId]) {
        problemStats[problemId].submitCount[userId] = 0;
      }
      problemStats[problemId].submitCount[userId]++;
    }

    // Student performance
    const studentStats = {};
    for (const student of students) {
      const studentId = student._id.toString();
      const studentSubmissions = submissions.filter(s => s.userId.toString() === studentId);
      const accepted = studentSubmissions.filter(s => s.status === 'accepted').length;
      
      studentStats[studentId] = {
        studentId,
        username: student.username,
        studentIdField: student.studentId,
        totalSubmissions: studentSubmissions.length,
        acceptedCount: accepted,
        rating: student.rating || 0
      };
    }

    // Daily submission trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyTrend = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyTrend[dateStr] = { date: dateStr, count: 0, accepted: 0 };
    }

    for (const submission of submissions) {
      const dateStr = submission.createdAt.toISOString().split('T')[0];
      if (dailyTrend[dateStr]) {
        dailyTrend[dateStr].count++;
        if (submission.status === 'accepted') {
          dailyTrend[dateStr].accepted++;
        }
      }
    }

    res.json({
      summary: {
        totalStudents: students.length,
        totalSubmissions,
        acceptedCount,
        rejectedCount,
        pendingCount,
        acRate: totalSubmissions > 0 ? ((acceptedCount / totalSubmissions) * 100).toFixed(2) : 0
      },
      problemStats: Object.values(problemStats),
      studentStats: Object.values(studentStats).sort((a, b) => b.acceptedCount - a.acceptedCount),
      dailyTrend: Object.values(dailyTrend),
      classes: classNames
    });

  } catch (error) {
    console.error('Get teacher stats error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Get submissions from students in teacher's classes
exports.getTeacherClassSubmissions = async (req, res) => {
  try {
    const { limit = 200 } = req.query;
    const teacherId = req.user.id;
    const User = require('../models/User');

    // Get teacher info
    const teacher = await User.findById(teacherId).lean();
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    if (teacher.role !== 'teacher' && teacher.role !== 'admin') {
      return res.status(403).json({ error: 'Only teachers and admins' });
    }

    // Get teacher's classes
    const teacherClasses = teacher.teacherClasses || [];
    const objectIds = teacherClasses.filter(tc => /^[0-9a-fA-F]{24}$/.test(tc));
    const names = teacherClasses.filter(tc => !(/^[0-9a-fA-F]{24}$/.test(tc)));
    
    const classQuery = { $or: [] };
    if (objectIds.length) classQuery.$or.push({ _id: { $in: objectIds } });
    if (names.length) classQuery.$or.push({ name: { $in: names } });

    const Class = require('../models/Class');
    const classes = classQuery.$or.length 
      ? await Class.find(classQuery).select('name').lean()
      : [];
    
    const classNames = classes.map(c => c.name).concat(names).filter(Boolean);

    // Get students in these classes
    const students = await User.find({ class: { $in: classNames } }).select('_id').lean();
    const studentIds = students.map(s => s._id);

    // Get all submissions from these students
    const submissions = await Submission.find({ userId: { $in: studentIds } })
      .populate('userId', 'username fullName email class studentId')
      .populate('problemId', 'title slug description')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({ submissions });
  } catch (error) {
    console.error('Get teacher class submissions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Judge a submission (teacher/admin can judge student submissions)
exports.judgeSubmission = async (req, res) => {
  try {
    const submissionId = req.params.id;
    const { score, scoreNote } = req.body;

    // Validate score
    if (score === undefined || score === null) {
      return res.status(400).json({ error: 'Score is required (0-100)' });
    }

    if (score < 0 || score > 100) {
      return res.status(400).json({ error: 'Score must be between 0 and 100' });
    }

    const submission = await Submission.findById(submissionId)
      .populate('problemId')
      .populate('userId', 'class');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check access: admin or teacher of the student
    let hasAccess = req.user.role === 'admin';
    
    if (!hasAccess && req.user.role === 'teacher') {
      const User = require('../models/User');
      const teacher = await User.findById(req.user.id).lean();
      const studentClass = submission.userId.class;
      const teacherClasses = teacher?.teacherClasses || [];
      hasAccess = teacherClasses.includes(studentClass);
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update submission with teacher's manual score
    submission.score = score;
    submission.scoreNote = scoreNote || null;
    submission.scoredBy = req.user.id;
    submission.scoredAt = new Date();
    
    // Update status based on score
    if (score === 0) {
      submission.status = 'wrong_answer';
    } else if (score >= 100) {
      submission.status = 'accepted';
    } else {
      submission.status = 'accepted'; // Partial score - still accepted
    }

    await submission.save();

    // Get updated submission
    const updatedSubmission = await Submission.findById(submissionId)
      .populate('problemId', 'title slug')
      .populate('userId', 'username fullName')
      .populate('scoredBy', 'username');

    console.log('✅ Submission scored:', {
      submissionId,
      score,
      scoredBy: req.user.id,
      status: submission.status
    });

    res.json({
      message: 'Submission scored successfully',
      submission: updatedSubmission
    });
  } catch (error) {
    console.error('Judge submission error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Get my scores (for students)
exports.getMyScores = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all submissions with scores for this user
    const submissions = await Submission.find({ 
      userId: userId,
      score: { $ne: null }  // Only submissions that have been scored
    })
      .populate('problemId', 'title slug difficulty')
      .sort({ scoredAt: -1 })
      .lean();

    // Calculate statistics
    const totalSubmissions = submissions.length;
    const totalScore = submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
    const averageScore = totalSubmissions > 0 ? (totalScore / totalSubmissions).toFixed(2) : 0;
    const perfectScores = submissions.filter(s => s.score === 100).length;

    res.json({
      scores: submissions,
      statistics: {
        totalSubmissions,
        totalScore,
        averageScore,
        perfectScores
      }
    });
  } catch (error) {
    console.error('Get my scores error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get grades board for teacher (all students + all problems)
exports.getTeacherGradesBoard = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const User = require('../models/User');
    const Problem = require('../models/Problem');

    // Get teacher info
    const teacher = await User.findById(teacherId).lean();
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    if (teacher.role !== 'teacher' && teacher.role !== 'admin') {
      return res.status(403).json({ error: 'Only teachers and admins' });
    }

    // Get teacher's classes
    const teacherClasses = teacher.teacherClasses || [];
    const objectIds = teacherClasses.filter(tc => /^[0-9a-fA-F]{24}$/.test(tc));
    const names = teacherClasses.filter(tc => !(/^[0-9a-fA-F]{24}$/.test(tc)));
    
    const classQuery = { $or: [] };
    if (objectIds.length) classQuery.$or.push({ _id: { $in: objectIds } });
    if (names.length) classQuery.$or.push({ name: { $in: names } });

    const Class = require('../models/Class');
    const classes = classQuery.$or.length 
      ? await Class.find(classQuery).select('name').lean()
      : [];
    
    // Combine class names - use Set to avoid duplicates
    const classNamesSet = new Set([
      ...classes.map(c => c.name),
      ...names
    ]);
    const classNames = Array.from(classNamesSet);

    // Get all students in these classes
    const students = await User.find({ class: { $in: classNames }, role: 'user' })
      .select('_id username fullName email class studentId')
      .sort({ class: 1, fullName: 1 })
      .lean();

    // Get all problems
    const problems = await Problem.find()
      .select('_id title slug difficulty')
      .sort({ createdAt: 1 })
      .lean();

    // Get all submissions for these students
    const studentIds = students.map(s => s._id);
    const submissions = await Submission.find({ userId: { $in: studentIds } })
      .select('userId problemId score scoreNote scoredAt')
      .lean();

    // Build grades matrix: student -> problem -> score
    const gradesMatrix = {};
    
    students.forEach(student => {
      gradesMatrix[student._id] = {
        student,
        scores: {}
      };
      
      problems.forEach(problem => {
        gradesMatrix[student._id].scores[problem._id] = null;
      });
    });

    // Fill in the grades
    submissions.forEach(submission => {
      const studentId = submission.userId.toString();
      const problemId = submission.problemId.toString();
      
      if (gradesMatrix[studentId] && gradesMatrix[studentId].scores[problemId] !== undefined) {
        gradesMatrix[studentId].scores[problemId] = {
          score: submission.score,
          scoreNote: submission.scoreNote,
          scoredAt: submission.scoredAt
        };
      }
    });

    // Calculate student stats
    const gradedData = Object.values(gradesMatrix).map(item => {
      const scores = Object.values(item.scores).filter(s => s !== null);
      const totalScore = scores.reduce((sum, s) => sum + (s.score || 0), 0);
      const averageScore = scores.length > 0 ? (totalScore / scores.length).toFixed(2) : 0;
      const perfectScores = scores.filter(s => s.score === 100).length;

      return {
        student: item.student,
        scores: item.scores,
        stats: {
          totalSubmitted: scores.length,
          totalScore,
          averageScore,
          perfectScores
        }
      };
    });

    res.json({
      students: gradedData,
      problems,
      classes: classNames,
      summary: {
        totalStudents: students.length,
        totalProblems: problems.length,
        totalClasses: classNames.length
      }
    });
  } catch (error) {
    console.error('Get teacher grades board error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};