/*
  Script: assignStudentIds.js
  Purpose: Assign unique numeric `studentId` values to existing users with role 'user'
  Usage: from backend folder run `node src/scripts/assignStudentIds.js`
*/

const connectDB = require('../config/database');
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    console.log('Connecting to DB...');
    await connectDB();

    // Find users that are students and missing studentId or empty
    const students = await User.find({ role: 'user', $or: [{ studentId: { $exists: false } }, { studentId: null }, { studentId: '' }] }).lean();
    console.log(`Found ${students.length} students without studentId.`);

    if (students.length === 0) {
      console.log('No students to process. Exiting.');
      process.exit(0);
    }

    // Determine starting counter: look at existing numeric studentIds and take max
    const allStudentIds = await User.find({ studentId: { $exists: true, $ne: null, $ne: '' } }).select('studentId').lean();
    const numericIds = allStudentIds
      .map(u => u.studentId)
      .filter(s => typeof s === 'string' && /^\d+$/.test(s))
      .map(s => Number(s));

    let counter = 100000;
    if (numericIds.length) {
      const maxExisting = Math.max(...numericIds);
      if (maxExisting >= counter) counter = maxExisting + 1;
    }

    console.log(`Starting numeric studentId counter at ${counter}`);

    const results = [];
    for (const stu of students) {
      // generate candidate id and ensure uniqueness
      let candidate;
      let attempts = 0;
      do {
        candidate = String(counter);
        counter++;
        attempts++;
        // safety
        if (attempts > 1000000) {
          throw new Error('Too many attempts generating unique studentId');
        }
      } while (await User.exists({ studentId: candidate }));

      // update user
      await User.updateOne({ _id: stu._id }, { $set: { studentId: candidate } });
      console.log(`Assigned studentId=${candidate} to user ${stu.username} (${stu._id})`);
      results.push({ _id: stu._id, username: stu.username, studentId: candidate });
    }

    console.log('Done. Summary:');
    console.table(results);
    console.log('All done. Exiting.');
    process.exit(0);
  } catch (err) {
    console.error('Error in assignStudentIds:', err);
    process.exit(1);
  }
})();
