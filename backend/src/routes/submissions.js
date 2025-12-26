const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Teacher statistics - MUST be before /:id route
router.get('/teacher/stats', authenticate, submissionController.getTeacherStats);

// Teacher: Get submissions from student's classes
router.get('/teacher/class-submissions', authenticate, submissionController.getTeacherClassSubmissions);

// Teacher: Get grades board (all students + problems)
router.get('/teacher/grades', authenticate, submissionController.getTeacherGradesBoard);

// Student: Get my scores
router.get('/my/scores', authenticate, submissionController.getMyScores);

// Judge submission (teacher/admin only)
router.post('/:id/judge', authenticate, submissionController.judgeSubmission);

// RUN CODE (test với custom input)
router.post('/run', authenticate, submissionController.runCode);

// Existing routes
router.post('/', authenticate, submissionController.submitSolution);
router.get('/my', authenticate, submissionController.getUserSubmissions);
router.get('/contest/:contestId/user', authenticate, submissionController.getUserContestSubmissions);
router.get('/:id', authenticate, submissionController.getSubmissionStatus);
router.get('/admin/all', authenticate, isAdmin, submissionController.getAllSubmissions);

module.exports = router;