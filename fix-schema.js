const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'backend', 'src', 'controllers', 'supportController.js');
let content = fs.readFileSync(file, 'utf-8');

content = content.replace(/contenido/g, 'mensaje');
content = content.replace(/fecha_envio/g, 'created_at');
// Wait, when inserting `mensaje` into `mensaje`, we do: (..., remitente_tipo, mensaje) VALUES (..., $3)
// Wait, `req.body.mensaje` was passed as `mensaje`. So it used to be `contenido: mensaje`. Now it's `mensaje: mensaje` which is fine.
// But wait, the parameter is `mensaje`. Let's just blindly replace them.

fs.writeFileSync(file, content);
console.log('Fixed schema mismatches in supportController.js');
