const db = require('./src/config/db');
(async () => {
  try {
    const res1 = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'soporte_conversaciones'");
    const res2 = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'soporte_mensajes'");
    const res3 = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'soporte_auditoria'");
    console.log('Conversaciones:', res1.rows);
    console.log('Mensajes:', res2.rows);
    console.log('Auditoria:', res3.rows);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
})();
