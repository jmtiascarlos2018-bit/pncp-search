const fs = require('fs');

const content = fs.readFileSync('main.4767c01986db9b0a.js', 'utf8');
const index = content.indexOf('api/search');

if (index !== -1) {
    const start = Math.max(0, index - 100);
    const end = Math.min(content.length, index + 200);
    console.log('--- CONTEXT ---');
    console.log(content.substring(start, end));
} else {
    console.log('Not found in file (fs check)');
}
