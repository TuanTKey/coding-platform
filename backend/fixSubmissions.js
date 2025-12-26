const mongoose = require('mongoose');
const Submission = require('./src/models/Submission');
const User = require('./src/models/User');
const Problem = require('./src/models/Problem');
const Contest = require('./src/models/Contest');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Re-fetch tất cả submissions với populate
    const submissions = await Submission.find({});
    console.log(`📝 Found ${submissions.length} submissions\n`);

    // Delete all submissions cũ không có populate đầy đủ
    const brokenSubmissions = submissions.filter(
      sub => !sub.userId || !sub.problemId
    );

    if (brokenSubmissions.length > 0) {
      console.log(`🗑️  Deleting ${brokenSubmissions.length} broken submissions...`);
      const result = await Submission.deleteMany({
        _id: { $in: brokenSubmissions.map(s => s._id) }
      });
      console.log(`✅ Deleted ${result.deletedCount} submissions\n`);
    }

    // Verify remaining submissions
    const remaining = await Submission.find({})
      .populate('userId', 'username fullName class')
      .populate('problemId', 'title slug')
      .populate('contestId', 'title');

    console.log(`📊 Remaining submissions: ${remaining.length}`);
    
    // Show first 5
    if (remaining.length > 0) {
      console.log('\n📋 First 5 submissions:');
      remaining.slice(0, 5).forEach((sub, i) => {
        console.log(`  ${i+1}. User: ${sub.userId?.username || 'MISSING'}, Problem: ${sub.problemId?.title || 'MISSING'}, Status: ${sub.status}`);
      });
    }

    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
