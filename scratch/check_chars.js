const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/Timeline.tsx');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
for (let i = 175; i < 200; i++) {
  const line = lines[i];
  console.log(`Line ${i + 1}: ${JSON.stringify(line)}`);
}
