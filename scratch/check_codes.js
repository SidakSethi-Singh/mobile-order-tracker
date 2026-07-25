const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/orders/[id].tsx');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
for (let i = 100; i < 105; i++) {
  const line = lines[i];
  console.log(`Line ${i + 1}:`);
  for (let j = 0; j < line.length; j++) {
    console.log(`  char[${j}]: ${JSON.stringify(line[j])} (code: ${line.charCodeAt(j)})`);
  }
}
