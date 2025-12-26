const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');
const TestCase = require('./src/models/TestCase');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const problems = await Problem.find({});
    
    console.log('📊 Thống kê Test Cases\n');
    console.log('Tên Bài Toán'.padEnd(40) + ' | Test Cases');
    console.log('─'.repeat(60));
    
    let totalProblems = 0;
    let problemsWithTestCases = 0;
    
    for (const problem of problems) {
      const testCaseCount = await TestCase.countDocuments({ problemId: problem._id });
      const status = testCaseCount > 0 ? '✅' : '❌';
      
      console.log(
        status + ' ' + problem.title.slice(0, 37).padEnd(37) + 
        ' | ' + testCaseCount
      );
      
      totalProblems++;
      if (testCaseCount > 0) problemsWithTestCases++;
    }
    
    console.log('─'.repeat(60));
    console.log('✅ Tổng cộng: ' + problemsWithTestCases + '/' + totalProblems + ' bài toán có test cases');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
})();
