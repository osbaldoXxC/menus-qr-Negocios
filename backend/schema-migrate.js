const db = require('./src/config/db');

async function migrate() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS soporte_auditoria (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        conversacion_id UUID REFERENCES soporte_conversaciones(id) ON DELETE CASCADE,
        accion VARCHAR(255) NOT NULL,
        usuario_id UUID,
        usuario_tipo VARCHAR(50),
        detalles TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Tabla soporte_auditoria creada o ya existia.");
  } catch(e) {
    console.error("Error creating audit table", e);
  }
  process.exit(0);
}

migrate();
