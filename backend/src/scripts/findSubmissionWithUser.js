require('dotenv').config();
const mongoose = require('mongoose');
const Submission = require('../models/Submission');

async function run(){
  try{
    await mongoose.connect(process.env.MONGODB_URI);
    const s = await Submission.findOne({ userId: { $ne: null } }).lean();
    if(!s){ console.log('NO_SUB'); process.exit(0); }
    console.log('FOUND', s._id.toString(), 'userId', s.userId);
    process.exit(0);
  }catch(e){ console.error(e); process.exit(1); }
}
run();
