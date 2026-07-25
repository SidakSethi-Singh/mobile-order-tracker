const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/index.tsx');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
lines.forEach((line, i) => {
  const match = line.match(/(?<![a-zA-Z0-9_\$])\.(?![a-zA-Z0-9_])/);
  if (match) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
});
