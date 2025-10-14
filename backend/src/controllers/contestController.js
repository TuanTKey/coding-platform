const Contest = require('../models/Contest');
const Submission = require('../models/Submission');

// Get all contests
exports.getAllContests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { isPublic: true };
    const now = new Date();

    if (status === 'upcoming') {
      query.startTime = { $gt: now };
    } else if (status === 'running') {
      query.startTime = { $lte: now };
      query.endTime = { $gte: now };
    } else if (status === 'past') {
      query.endTime = { $lt: now };
    }

    const contests = await Contest.find(query)
      .populate('createdBy', 'username')
      .populate('problems', 'title difficulty')
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Contest.countDocuments(query);

    res.json({
      contests,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get contests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single contest
exports.getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('createdBy', 'username fullName')
      .populate('problems', 'title slug difficulty');

    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    res.json({ contest });
  } catch (error) {
    console.error('Get contest error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create contest (admin only)
exports.createContest = async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      duration,
      problems,
      rules
    } = req.body;

    const contest = await Contest.create({
      title,
      description,
      startTime,
      endTime,
      duration,
      problems,
      rules,
      createdBy: req.user.id
    });

    res.status(201).json({
      message: 'Contest created successfully',
      contest
    });
  } catch (error) {
    console.error('Create contest error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
// Update contest (admin only) - THÊM FUNCTION NÀY
exports.updateContest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      startTime,
      endTime,
      duration,
      problems,
      rules,
      isPublic
    } = req.body;

    const contest = await Contest.findById(id);

    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    // Update fields
    if (title !== undefined) contest.title = title;
    if (description !== undefined) contest.description = description;
    if (startTime !== undefined) contest.startTime = startTime;
    if (endTime !== undefined) contest.endTime = endTime;
    if (duration !== undefined) contest.duration = duration;
    if (problems !== undefined) contest.problems = problems;
    if (rules !== undefined) contest.rules = rules;
    if (isPublic !== undefined) contest.isPublic = isPublic;

    await contest.save();

    res.json({
      message: 'Contest updated successfully',
      contest
    });
  } catch (error) {
    console.error('Update contest error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
exports.deleteContest = async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findById(id);

    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    await Contest.findByIdAndDelete(id);

    res.json({ message: 'Contest deleted successfully' });
  } catch (error) {
    console.error('Delete contest error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Register for contest
exports.registerContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    // Check if already registered
    if (contest.participants.includes(req.user.id)) {
      return res.status(400).json({ error: 'Already registered' });
    }

    contest.participants.push(req.user.id);
    await contest.save();

    res.json({ message: 'Successfully registered for contest' });
  } catch (error) {
    console.error('Register contest error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get contest leaderboard
exports.getContestLeaderboard = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('problems', 'title difficulty');

    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    // Get all accepted submissions in this contest
    const submissions = await Submission.find({
      contestId: contest._id,
      status: 'accepted'
    })
      .populate('userId', 'username fullName')
      .populate('problemId', 'title difficulty');

    // Calculate scores - each problem solved = 100 points
    const scores = {};
    submissions.forEach(sub => {
      if (!sub.userId) return;
      const userId = sub.userId._id.toString();
      const problemId = sub.problemId?._id?.toString();
      
      if (!scores[userId]) {
        scores[userId] = {
          user: sub.userId,
          solvedCount: 0,
          score: 0,
          totalTime: 0,
          solvedProblems: [],
          solvedProblemIds: new Set()
        };
      }
      
      // Only count each problem once
      if (problemId && !scores[userId].solvedProblemIds.has(problemId)) {
        scores[userId].solvedProblemIds.add(problemId);
        scores[userId].solvedCount++;
        scores[userId].score += 100; // 100 points per problem
        scores[userId].solvedProblems.push({
          problem: sub.problemId,
          submittedAt: sub.createdAt
        });
      }
      scores[userId].totalTime += sub.executionTime || 0;
    });

    // Convert to array and sort
    const leaderboard = Object.values(scores)
      .map(item => {
        // Remove Set before sending
        const { solvedProblemIds, ...rest } = item;
        return rest;
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.solvedCount !== a.solvedCount) return b.solvedCount - a.solvedCount;
        return a.totalTime - b.totalTime;
      })
      .map((item, index) => ({
        rank: index + 1,
        ...item
      }));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};