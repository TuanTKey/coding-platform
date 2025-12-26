const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest'
  },
  language: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: [
      'submitted',  // Chỉ lưu, không judge
      'pending', 
      'judging', 
      'accepted', 
      'wrong_answer', 
      'time_limit', 
      'memory_limit', 
      'runtime_error', 
      'compile_error'
    ],
    default: 'submitted'
  },
  executionTime: {
    type: Number // ms
  },
  memory: {
    type: Number // KB
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number
  },
  errorMessage: {
    type: String
  },
  // ⭐ THÊM CÁC FIELD MỚI CHO AI JUDGE
  aiAnalysis: {
    type: String,
    default: null
  },
  suggestions: [{
    type: String
  }],
  judgeMethod: {
    type: String,
    enum: ['traditional', 'ai', 'hybrid'],
    default: 'traditional'
  },
  // ⭐ Thêm mảng lưu kết quả từng test case
  testCasesResult: [
    {
      input: String,
      expected: String,
      output: String,
      status: String,
      time: Number,
      error: String
    }
  ],
  // Manual override by teacher/admin
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  scoreNote: {
    type: String,
    default: null
  },
  scoredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  scoredAt: {
    type: Date
  },
  manualScore: {
    type: Number,
    default: null
  },
  manualOverrideNote: {
    type: String,
    default: null
  },
  manualOverriddenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  manualOverriddenAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);