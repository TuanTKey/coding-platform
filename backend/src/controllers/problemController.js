const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');

// Get all problems (public)
exports.getAllProblems = async (req, res) => {
  try {
    const { difficulty, tags, search, page = 1, limit = 20, createdBy } = req.query;

    const query = {};

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (createdBy) {
      query.createdBy = createdBy;
    }

    const problems = await Problem.find(query)
      .select('-__v')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Problem.countDocuments(query);

    res.json({
      problems,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single problem with sample test cases
exports.getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate('createdBy', 'username fullName');

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Get only sample test cases (not hidden ones)
    const sampleTestCases = await TestCase.find({
      problemId: problem._id,
      isHidden: false
    }).select('input expectedOutput');

    res.json({
      problem,
      sampleTestCases
    });
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get problem by slug
exports.getProblemBySlug = async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug })
      .populate('createdBy', 'username fullName');

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const sampleTestCases = await TestCase.find({
      problemId: problem._id,
      isHidden: false
    }).select('input expectedOutput');

    res.json({
      problem,
      sampleTestCases
    });
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create problem (admin only)
exports.createProblem = async (req, res) => {
  try {
    const {
      title,
      description,
      difficulty,
      timeLimit,
      memoryLimit,
      inputFormat,
      outputFormat,
      constraints,
      tags,
      sampleTestCases, // Array of {input, expectedOutput}
      hiddenTestCases   // Array of {input, expectedOutput}
    } = req.body;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug exists
    const existingProblem = await Problem.findOne({ slug });
    if (existingProblem) {
      return res.status(400).json({ 
        error: 'Problem with similar title already exists' 
      });
    }

    // Create problem
    const problem = await Problem.create({
      title,
      slug,
      description,
      difficulty,
      timeLimit,
      memoryLimit,
      inputFormat,
      outputFormat,
      constraints,
      tags,
      createdBy: req.user.id
    });

    // Create test cases if provided (optional)
    const totalTestCases = (sampleTestCases?.length || 0) + (hiddenTestCases?.length || 0);
    
    if (totalTestCases > 0) {
      // Create sample test cases if provided
      if (sampleTestCases && sampleTestCases.length > 0) {
        const sampleTests = sampleTestCases.map(tc => ({
        problemId: problem._id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: false
      }));
      await TestCase.insertMany(sampleTests);
    }

    // Create hidden test cases if provided
    if (hiddenTestCases && hiddenTestCases.length > 0) {
      const hiddenTests = hiddenTestCases.map(tc => ({
        problemId: problem._id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: true
      }));
      await TestCase.insertMany(hiddenTests);
    }
    } // Close the if (totalTestCases > 0) block

    res.status(201).json({
      message: totalTestCases > 0 
        ? 'Problem created successfully with test cases'
        : 'Problem created successfully (test cases can be added later)',
      problem
    });
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update problem (admin only)
exports.updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json({
      message: 'Problem updated successfully',
      problem
    });
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete problem (admin only)
exports.deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Delete associated test cases
    await TestCase.deleteMany({ problemId: problem._id });

    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all test cases for a problem (admin only)
exports.getTestCases = async (req, res) => {
  try {
    const testCases = await TestCase.find({ 
      problemId: req.params.id 
    });

    res.json({ testCases });
  } catch (error) {
    console.error('Get test cases error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add test case (admin only)
exports.addTestCase = async (req, res) => {
  try {
    const { input, expectedOutput, isHidden } = req.body;

    const testCase = await TestCase.create({
      problemId: req.params.id,
      input,
      expectedOutput,
      isHidden
    });

    console.log('✅ Test case added successfully');

    // Trigger re-judge for pending submissions
    console.log('🔄 Checking for pending submissions to re-judge...');
    const judgeService = require('../services/judgeService');
    const Problem = require('../models/Problem');
    const Submission = require('../models/Submission');
    const TestCase = require('../models/TestCase');

    const problem = await Problem.findById(req.params.id);
    const pendingSubmissions = await Submission.find({
      problemId: req.params.id,
      status: 'pending'
    });

    console.log(`📝 Found ${pendingSubmissions.length} pending submissions to re-judge`);

    // Re-judge each pending submission
    for (const submission of pendingSubmissions) {
      try {
        const testCases = await TestCase.find({ problemId: req.params.id });
        console.log(`🔄 Re-judging submission ${submission._id}...`);
        
        judgeService.judgeSubmission(
          submission._id,
          problem,
          testCases,
          submission.code,
          submission.language
        );
      } catch (judgeError) {
        console.error(`❌ Error re-judging submission ${submission._id}:`, judgeError);
      }
    }

    res.status(201).json({
      message: 'Test case added successfully',
      testCase,
      pendingSubmissionsReJudged: pendingSubmissions.length
    });
  } catch (error) {
    console.error('Add test case error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete test case (admin only)
exports.deleteTestCase = async (req, res) => {
  try {
    const testCase = await TestCase.findByIdAndDelete(req.params.testCaseId);

    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }

    res.json({ message: 'Test case deleted successfully' });
  } catch (error) {
    console.error('Delete test case error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
