const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/orders/[id].tsx');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
for (let i = 199; i < 240; i++) {
  const line = lines[i];
  console.log(`Line ${i + 1}: ${JSON.stringify(line)}`);
}
