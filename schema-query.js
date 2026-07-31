const db = require('./src/config/db');
(async () => {
  try {
    const res = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'soporte_mensajes'");
    console.log(res.rows);
  } catch(e) {}
  process.exit(0);
})();
