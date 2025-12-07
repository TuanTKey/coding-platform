const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/users/leaderboard?limit=10',
  method: 'GET'
};

http.get(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('status', res.statusCode);
    try { console.log(JSON.stringify(JSON.parse(data), null, 2)); } catch (e) { console.log(data); }
  });
}).on('error', (e) => console.error('Request error', e.message));
