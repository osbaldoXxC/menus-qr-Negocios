const db = require('./src/config/db');

async function test() {
  try {
    const res = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'soporte_mensajes'");
    console.log("soporte_mensajes:");
    console.table(res.rows);
    
    const res2 = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'soporte_conversaciones'");
    console.log("soporte_conversaciones:");
    console.table(res2.rows);
  } catch(e) {
    console.error(e);
  }
  process.exit();
}
test();
