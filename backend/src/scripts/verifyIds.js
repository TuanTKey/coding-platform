const connect = require('../config/database');
const User = require('../models/User');
const http = require('http');

async function fetchLeaderboard() {
  return new Promise((resolve, reject) => {
    const options = { hostname: 'localhost', port: 5000, path: '/api/users/leaderboard?limit=50', method: 'GET' };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  try {
    await connect();
    const usernames = ['alice','bob','tuan123','autotestuser','autotestuser24555'];

    console.log('--- DB full documents for selected users ---');
    for (const u of usernames) {
      const doc = await User.findOne({ username: u }).lean();
      if (!doc) {
        console.log(u, '-> not found');
      } else {
        console.log(u, '-> studentId:', doc.studentId || null, 'class:', doc.class || null, '_id:', doc._id.toString());
      }
    }

    console.log('\n--- Fetching /api/users/leaderboard ---');
    const lb = await fetchLeaderboard();
    const map = {};
    (lb.leaderboard || []).forEach(entry => { map[entry.username] = entry; });

    console.log('\n--- Leaderboard entries for same users ---');
    for (const u of usernames) {
      const e = map[u];
      if (!e) console.log(u, '-> not present in leaderboard result');
      else console.log(u, '-> entry studentId:', ('studentId' in e) ? e.studentId : '(missing)', 'class:', e.class || null);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error during verify:', err);
    process.exit(1);
  }
})();
