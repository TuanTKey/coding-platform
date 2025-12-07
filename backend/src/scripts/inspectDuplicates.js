const connect = require('../config/database');
const User = require('../models/User');

(async ()=>{
  try{
    await connect();
    const targets = ['alice','bob','tuan123','tuan1311','tuanks11'];
    for(const t of targets){
      const docs = await User.find({ username: t }).lean();
      console.log('\n== username:', t, 'found', docs.length, 'documents ==');
      docs.forEach(d => console.log({ _id: d._id.toString(), username: d.username, role: d.role, studentId: d.studentId || null, class: d.class || null, createdAt: d.createdAt }));
    }
    process.exit(0);
  }catch(e){
    console.error(e);
    process.exit(1);
  }
})();
