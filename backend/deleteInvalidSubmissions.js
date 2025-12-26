const mongoose = require('mongoose');
const Submission = require('./src/models/Submission');
const User = require('./src/models/User');
const Problem = require('./src/models/Problem');
const Contest = require('./src/models/Contest');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('🔍 Kiểm tra submissions...\n');
    
    const allSubmissions = await Submission.find({});
    console.log('📝 Tổng submissions: ' + allSubmissions.length);
    
    // Kiểm tra submissions valid
    const validSubmissions = allSubmissions.filter(sub => 
      sub.userId && sub.problemId && mongoose.Types.ObjectId.isValid(sub.userId) && mongoose.Types.ObjectId.isValid(sub.problemId)
    );
    
    console.log('✅ Valid submissions: ' + validSubmissions.length);
    
    // Xoá submissions invalid
    const invalidCount = allSubmissions.length - validSubmissions.length;
    if (invalidCount > 0) {
      console.log('🗑️  Deleting ' + invalidCount + ' invalid submissions...');
      await Submission.deleteMany({
        $or: [
          { userId: null },
          { userId: undefined },
          { problemId: null },
          { problemId: undefined }
        ]
      });
      console.log('✅ Deleted!');
    } else {
      console.log('✅ All submissions are valid!');
    }
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
