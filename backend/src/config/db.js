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

      INSERT INTO restaurantes (id, nombre_negocio, email, password_hash, nombre_dueno, rol, plan, suscripcion_activa, email_verificado, estado)
      VALUES (
        '11111111-1111-1111-1111-111111111111',
        'Super Admin MexxicanMX',
        'admin@mexxican.mx',
        '$2a$12$.uE.vltFrnP2TT0S8uLNZ.ourKbJfk3OSX4w/GGEWuaRcQjqjDv6y',
        'Super Administrador',
        'SUPER_ADMIN',
        'premium',
        true,
        true,
        'aprobado'
      )
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, rol = 'SUPER_ADMIN', email_verificado = true, suscripcion_activa = true, estado = 'aprobado';

      INSERT INTO restaurantes (id, nombre_negocio, email, password_hash, nombre_dueno, rol, plan, suscripcion_activa, email_verificado, estado)
      VALUES (
        '11111111-1111-1111-1111-111111111112',
        'Admin System',
        'admin@test.com',
        '$2a$12$.uE.vltFrnP2TT0S8uLNZ.ourKbJfk3OSX4w/GGEWuaRcQjqjDv6y',
        'Administrador',
        'SUPER_ADMIN',
        'premium',
        true,
        true,
        'aprobado'
      )
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, rol = 'SUPER_ADMIN', email_verificado = true, suscripcion_activa = true, estado = 'aprobado';
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
