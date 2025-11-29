require('dotenv').config();
const mongoose = require('mongoose');
const Submission = require('../models/Submission');

async function run(){
  try{
    await mongoose.connect(process.env.MONGODB_URI);
    const sub = await Submission.create({
      userId: '69352ff6347b9ba17979e2f8',
      problemId: '69352ff6347b9ba17979e2f4',
      language: 'python',
      code: 'print("hello")',
      status: 'wrong_answer',
      testCasesResult: [{ input: 'hello', expected: 'olleh', output: 'hello', status: 'wrong_answer', time: 15 }]
    });
    console.log('Created submission', sub._id.toString());
    process.exit(0);
  }catch(e){
    console.error(e);
    process.exit(1);
  }
}
run();
