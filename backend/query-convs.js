const db = require('./src/config/db');
(async () => {
  try {
    const res = await db.query("SELECT * FROM soporte_conversaciones");
    console.log(res.rows);
  } catch(e) { console.error(e) }
  process.exit(0);
})();
