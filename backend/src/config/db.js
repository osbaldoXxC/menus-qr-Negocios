const { Pool } = require('pg');
require('dotenv').config();

// En Docker, DATABASE_URL debe apuntar al nombre del servicio (postgres)
// Para pruebas locales fuera de Docker, usaría localhost
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://admin:password123@localhost:5432/mexxicanmx_db',
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

// Auto-migración segura de columnas en platillos
async function runMigrations() {
  try {
    await pool.query(`
      ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'aprobado';
      ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS suscripcion_expira_en TIMESTAMP WITH TIME ZONE;
      ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS dias_licencia INT DEFAULT 30;

      ALTER TABLE platillos ADD COLUMN IF NOT EXISTS ingredientes_principales JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE platillos ADD COLUMN IF NOT EXISTS complementos JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE platillos ADD COLUMN IF NOT EXISTS nivel_picante INTEGER DEFAULT 0;
      ALTER TABLE platillos ADD COLUMN IF NOT EXISTS porcion VARCHAR(100) DEFAULT '';
      ALTER TABLE platillos ADD COLUMN IF NOT EXISTS etiquetas_dieteticas JSONB DEFAULT '[]'::jsonb;

      CREATE TABLE IF NOT EXISTS soporte_conversaciones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurante_id UUID REFERENCES restaurantes(id) ON DELETE CASCADE,
        admin_id UUID REFERENCES restaurantes(id) ON DELETE SET NULL,
        estado VARCHAR(20) DEFAULT 'pendiente',
        calificacion INT DEFAULT NULL,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        fecha_cierre TIMESTAMP WITH TIME ZONE DEFAULT NULL,
        ultima_actividad TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        mensajes_restaurante_count INT DEFAULT 0,
        leido_admin BOOLEAN DEFAULT false,
        leido_restaurante BOOLEAN DEFAULT true
      );

      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES restaurantes(id) ON DELETE SET NULL;
      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS calificacion INT DEFAULT NULL;
      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS fecha_cierre TIMESTAMP WITH TIME ZONE DEFAULT NULL;
      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS ultima_actividad TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS mensajes_restaurante_count INT DEFAULT 0;
      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS leido_admin BOOLEAN DEFAULT false;
      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS leido_restaurante BOOLEAN DEFAULT true;
      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS asunto VARCHAR(255) DEFAULT 'Asunto General';
      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS comentario_calificacion TEXT DEFAULT NULL;

      CREATE TABLE IF NOT EXISTS soporte_mensajes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversacion_id UUID REFERENCES soporte_conversaciones(id) ON DELETE CASCADE,
        remitente_id UUID REFERENCES restaurantes(id) ON DELETE CASCADE,
        tipo_remitente VARCHAR(20),
        contenido TEXT NOT NULL,
        fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

    `);
    console.log('[DB Migration] Columnas y credenciales de Super Admin verificadas correctamente.');
  } catch (err) {
    console.warn('[DB Migration Warning] Error al migrar datos:', err.message);
  }
}
runMigrations();

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
