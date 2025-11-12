const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');
const judgeService = require('../services/judgeService');

// Submit solution
exports.submitSolution = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    // Validate
    if (!problemId || !code || !language) {
      return res.status(400).json({ 
        error: 'Problem ID, code and language are required' 
      });
    }

    // Check if problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Get all test cases for this problem
    const testCases = await TestCase.find({ problemId });

    if (testCases.length === 0) {
      return res.status(400).json({ 
        error: 'No test cases available for this problem' 
      });
    }

    // Create submission
    const submission = await Submission.create({
      userId: req.user.id,
      problemId,
      code,
      language,
      status: 'pending',
      totalTestCases: testCases.length
    });

    // Run judge asynchronously
    judgeService.judgeSubmission(submission._id, problem, testCases, code, language);

    res.status(201).json({
      message: 'Submission received',
      submissionId: submission._id,
      status: 'pending'
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
      .populate('userId', 'username');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check if user owns this submission or is admin
    if (submission.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ submission });
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
      .populate('userId', 'username')
      .populate('problemId', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Submission.countDocuments();

    res.json({
      submissions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get all submissions error:', error);
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

    // Language configs - FIXED for Windows/Linux compatibility
    const LANG_CONFIG = {
      python: { 
        ext: 'py', 
        cmd: (f) => process.platform === 'win32' ? `python "${f}"` : `python3 "${f}"` 
      },
      javascript: { 
        ext: 'js', 
        cmd: (f) => `node "${f}"` 
      },
      cpp: { 
        ext: 'cpp', 
        compile: (f) => `g++ "${f}" -o "${f}.out"`, 
        cmd: (f) => process.platform === 'win32' ? `"${f}.exe"` : `"${f}.out"` 
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

    const filename = path.join(tempDir, `solution.${config.ext}`);
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
        executablePath = process.platform === 'win32' ? `${filename}.exe` : `${filename}.out`;
      }
    }

    // Run code
    const startTime = Date.now();
    const runCmd = config.cmd(executablePath);

    const runResult = await new Promise((resolve) => {
      const child = exec(runCmd, {
        cwd: tempDir,
        timeout: 10000, // 10 seconds timeout
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      }, (error, stdout, stderr) => {
        const executionTime = Date.now() - startTime;
        resolve({ error, stdout, stderr, executionTime });
      });

      // Send input to stdin
      if (input && child.stdin) {
        child.stdin.write(input);
        child.stdin.end();
      }
    });

    // Cleanup
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.warn('Cleanup warning:', cleanupError);
    }

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