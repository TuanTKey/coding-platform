const User = require('../models/User');

/**
 * Generate a unique numeric studentId as a string.
 * Starts from 100000 or (max existing numeric studentId + 1).
 */
async function generateStudentId() {
  // collect existing numeric studentIds
  const all = await User.find({ studentId: { $exists: true, $ne: null, $ne: '' } }).select('studentId').lean();
  const numericIds = all
    .map(u => u.studentId)
    .filter(s => typeof s === 'string' && /^\d+$/.test(s))
    .map(s => Number(s));

  let counter = 100000;
  if (numericIds.length) {
    const maxExisting = Math.max(...numericIds);
    if (maxExisting >= counter) counter = maxExisting + 1;
  }

  // find a candidate that's not taken
  let attempts = 0;
  while (true) {
    const candidate = String(counter);
    // safety
    attempts++;
    if (attempts > 1000000) throw new Error('Too many attempts generating unique studentId');

    const exists = await User.exists({ studentId: candidate });
    if (!exists) return candidate;

    counter++;
  }
}

module.exports = { generateStudentId };
