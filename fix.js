const fs = require('fs'); 
const path = 'backend/src/controllers/supportController.js'; 
let content = fs.readFileSync(path, 'utf8'); 
content = content.replace(/\\`/g, '`'); 
fs.writeFileSync(path, content);
