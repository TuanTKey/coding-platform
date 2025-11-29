#!/usr/bin/env node
// Reverse String - Node.js solution
// Reads all stdin and writes reversed content to stdout

const fs = require('fs');

function reverseString(s) {
  return s.split('').reverse().join('');
}

if (require.main === module) {
  const input = fs.readFileSync(0, 'utf8');
  const out = reverseString(input);
  process.stdout.write(out);
}
