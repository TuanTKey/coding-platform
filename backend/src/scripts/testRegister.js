const http = require('http');

const idSuffix = Date.now()%100000;
const payload = JSON.stringify({ username: `autotestuser${idSuffix}`, email: `autotestuser+${idSuffix}@example.com`, password: 'Password123', fullName: 'Auto Test', class: '10A1' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('status', res.statusCode);
    try { console.log(JSON.stringify(JSON.parse(data), null, 2)); } catch(e) { console.log(data); }
  });
});

req.on('error', (e) => {
  console.error('Request error', e.message);
});

req.write(payload);
req.end();
