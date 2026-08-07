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

// Runtime schema safety net - defensive ALTER TABLE for backwards compatibility
// NOTE: Primary schema definition is in init.sql (single source of truth)
// These migrations handle edge cases where old DB instances might be missing columns
async function runMigrations() {
  try {
    await pool.query('BEGIN');

    // Add columns that might be missing from old instances
    // These are idempotent (IF NOT EXISTS guards prevent errors)
    await pool.query(`
      ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT false;
      ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS nombre_dueno VARCHAR(255) DEFAULT '';
      ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
      ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
      ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;
      ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS fecha_vencimiento TIMESTAMP WITH TIME ZONE;
      ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS dias_acceso_permitidos INTEGER DEFAULT 0;

      ALTER TABLE platillos ADD COLUMN IF NOT EXISTS ingredientes_principales JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE platillos ADD COLUMN IF NOT EXISTS complementos JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE platillos ADD COLUMN IF NOT EXISTS nivel_picante INTEGER DEFAULT 0;
      ALTER TABLE platillos ADD COLUMN IF NOT EXISTS porcion VARCHAR(100) DEFAULT '';
      ALTER TABLE platillos ADD COLUMN IF NOT EXISTS etiquetas_dieteticas JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE platillos ADD COLUMN IF NOT EXISTS tamano_porcion_id UUID;

      ALTER TABLE usuarios_comensales ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

      ALTER TABLE configuracion_tema ADD COLUMN IF NOT EXISTS config_diseno JSONB DEFAULT '{}'::jsonb;

      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS asunto VARCHAR(255) DEFAULT 'Asunto General';
      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS comentario_calificacion TEXT;
      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS admin_id UUID;
      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS calificacion INTEGER;
      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS fecha_cierre TIMESTAMP WITH TIME ZONE;
      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS ultima_actividad TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS mensajes_restaurante_count INTEGER DEFAULT 0;
      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS leido_admin BOOLEAN DEFAULT false;
      ALTER TABLE soporte_conversaciones ADD COLUMN IF NOT EXISTS leido_restaurante BOOLEAN DEFAULT true;
    `);

    await pool.query('COMMIT');
    console.log('[DB Migration] Runtime schema safety checks completed successfully.');
  } catch (err) {
    await pool.query('ROLLBACK');
    console.warn('[DB Migration Warning] Error during schema verification:', err.message);
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
