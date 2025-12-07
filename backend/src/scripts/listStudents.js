const connect = require('../config/database');
const User = require('../models/User');

(async()=>{
  try{
    await connect();
    const users = await User.find({ role: 'user' }).select('username studentId class email fullName').lean();
    console.log('Found', users.length, 'users with role user');
    console.log(users.map(u => ({ username: u.username, studentId: u.studentId || null, class: u.class || null }))); 
    process.exit(0);
  }catch(e){
    console.error(e);
    process.exit(1);
  }
})();
