const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');

dotenv.config();

// Test cases cho các bài toán phổ biến
const testCasesData = {
  'reverse-string': [
    { input: 'hello', expectedOutput: 'olleh', isHidden: false },
    { input: 'CodeJudge', expectedOutput: 'egduJedoC', isHidden: false },
    { input: 'a', expectedOutput: 'a', isHidden: false },
    { input: 'ab', expectedOutput: 'ba', isHidden: true },
    { input: 'racecar', expectedOutput: 'racecar', isHidden: true },
    { input: 'python', expectedOutput: 'nohtyp', isHidden: true },
  ],
  
  'two-sum': [
    { input: '2 7 11 15\n9', expectedOutput: '0 1', isHidden: false },
    { input: '3 2 4\n6', expectedOutput: '1 2', isHidden: false },
    { input: '3 3\n6', expectedOutput: '0 1', isHidden: false },
    { input: '5 5 5 5\n10', expectedOutput: '0 1', isHidden: true },
    { input: '1 2 3 4 5\n9', expectedOutput: '3 4', isHidden: true },
  ],
  
  'longest-increasing-subsequence': [
    { input: '10\n10 9 2 5 3 7 101 18', expectedOutput: '4', isHidden: false },
    { input: '5\n0 1 0 4 4', expectedOutput: '2', isHidden: false },
    { input: '3\n1 2 3', expectedOutput: '3', isHidden: false },
    { input: '5\n5 4 3 2 1', expectedOutput: '1', isHidden: true },
    { input: '7\n1 3 6 7 9 4 10', expectedOutput: '5', isHidden: true },
  ],
  
  'palindrome-number-1': [
    { input: '121', expectedOutput: 'true', isHidden: false },
    { input: '-121', expectedOutput: 'false', isHidden: false },
    { input: '10', expectedOutput: 'false', isHidden: false },
    { input: '12321', expectedOutput: 'true', isHidden: true },
    { input: '0', expectedOutput: 'true', isHidden: true },
  ],
  
  'reverse-linked-list-3': [
    { input: '1 2 3 4 5', expectedOutput: '5 4 3 2 1', isHidden: false },
    { input: '1 2', expectedOutput: '2 1', isHidden: false },
    { input: '1', expectedOutput: '1', isHidden: false },
    { input: '1 2 3', expectedOutput: '3 2 1', isHidden: true },
  ],
  
  'valid-parentheses-4': [
    { input: '()', expectedOutput: 'true', isHidden: false },
    { input: '()[]{}', expectedOutput: 'true', isHidden: false },
    { input: '(]', expectedOutput: 'false', isHidden: false },
    { input: '([)]', expectedOutput: 'false', isHidden: true },
    { input: '{[]}', expectedOutput: 'true', isHidden: true },
  ],
  
  'merge-intervals-5': [
    { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]', isHidden: false },
    { input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]', isHidden: false },
    { input: '[[1,4],[0,4]]', expectedOutput: '[[0,4]]', isHidden: true },
    { input: '[[1,4],[2,3]]', expectedOutput: '[[1,4]]', isHidden: true },
  ],
  
  'maximum-subarray-6': [
    { input: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isHidden: false },
    { input: '1', expectedOutput: '1', isHidden: false },
    { input: '5 4 -1 7 8', expectedOutput: '23', isHidden: true },
    { input: '-1', expectedOutput: '-1', isHidden: true },
    { input: '-2 -1', expectedOutput: '-1', isHidden: true },
  ],
  
  'word-ladder-7': [
    { input: 'hit\ncog\nhot dot dog lot log cog', expectedOutput: '5', isHidden: false },
    { input: 'hit\ncog\nhot dot dog lot log', expectedOutput: '0', isHidden: false },
    { input: 'a\nc\na b c', expectedOutput: '2', isHidden: true },
  ],
  
  'longest-palindrome-8': [
    { input: 'babad', expectedOutput: 'bab', isHidden: false },
    { input: 'cbbd', expectedOutput: 'bb', isHidden: false },
    { input: 'a', expectedOutput: 'a', isHidden: false },
    { input: 'ac', expectedOutput: 'a', isHidden: true },
    { input: 'racecar', expectedOutput: 'racecar', isHidden: true },
  ],
  
  'trapping-rain-water-9': [
    { input: '0 1 0 2 1 0 1 3 2 1 2 1', expectedOutput: '6', isHidden: false },
    { input: '4 2 0 3 2 5', expectedOutput: '9', isHidden: false },
    { input: '4 2 3', expectedOutput: '1', isHidden: true },
    { input: '1 0 1', expectedOutput: '1', isHidden: true },
  ],
  
  'course-schedule-10': [
    { input: '2 1\n1 0', expectedOutput: 'true', isHidden: false },
    { input: '2 2\n1 0\n0 1', expectedOutput: 'false', isHidden: false },
    { input: '3 2\n1 0\n2 1', expectedOutput: 'true', isHidden: true },
    { input: '4 3\n1 0\n2 1\n3 2', expectedOutput: 'true', isHidden: true },
  ],
};

const addTestCases = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB đã kết nối');

    // Lấy tất cả bài toán
    const allProblems = await Problem.find({});
    console.log(`\n📚 Tìm thấy ${allProblems.length} bài toán\n`);

    let addedCount = 0;
    let skippedCount = 0;

    // Thêm test cases cho những bài toán có trong testCasesData
    for (const [slug, testCases] of Object.entries(testCasesData)) {
      const problem = await Problem.findOne({ slug });
      
      if (!problem) {
        console.log(`⚠️  Không tìm thấy bài toán: ${slug}`);
        continue;
      }

      // Kiểm tra xem đã có test cases chưa
      const existingTestCases = await TestCase.countDocuments({ problemId: problem._id });
      if (existingTestCases > 0) {
        console.log(`⏭️  Bỏ qua ${problem.title} (slug: ${slug}) - đã có ${existingTestCases} test cases`);
        skippedCount++;
        continue;
      }

      // Xóa test cases cũ (nếu có)
      await TestCase.deleteMany({ problemId: problem._id });

      // Thêm test cases mới
      const testCaseDocs = testCases.map(tc => ({
        problemId: problem._id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
      }));

      await TestCase.insertMany(testCaseDocs);
      console.log(`✅ Đã thêm ${testCases.length} test cases cho: ${problem.title} (${slug})`);
      addedCount++;
    }

    // Thêm test cases mặc định cho những bài toán chưa có test cases
    console.log('\n📝 Kiểm tra những bài toán chưa có test cases...\n');
    
    for (const problem of allProblems) {
      const testCaseCount = await TestCase.countDocuments({ problemId: problem._id });
      
      if (testCaseCount === 0 && !testCasesData[problem.slug]) {
        // Thêm test case mặc định
        const defaultTestCases = [
          {
            problemId: problem._id,
            input: 'sample input',
            expectedOutput: 'sample output',
            isHidden: false,
          },
          {
            problemId: problem._id,
            input: 'test input 2',
            expectedOutput: 'test output 2',
            isHidden: true,
          }
        ];

        await TestCase.insertMany(defaultTestCases);
        console.log(`✅ Đã thêm test cases mặc định cho: ${problem.title} (${problem.slug})`);
        addedCount++;
      }
    }

    console.log(`\n🎉 Hoàn thành!`);
    console.log(`✅ Đã thêm test cases: ${addedCount}`);
    console.log(`⏭️  Đã bỏ qua: ${skippedCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

addTestCases();
