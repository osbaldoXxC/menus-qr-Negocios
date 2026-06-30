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

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Auto-migración defensiva para asegurar que config_diseno y las columnas de restaurantes existen
const initDb = async () => {
  try {
    // 1. Asegurar columna config_diseno en configuracion_tema
    await pool.query(`
      ALTER TABLE configuracion_tema 
      ADD COLUMN IF NOT EXISTS config_diseno JSONB DEFAULT '{}'::jsonb;
    `);

    // 2. Asegurar columnas faltantes en restaurantes
    await pool.query(`
      ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS nombre_dueno VARCHAR(255) DEFAULT '';
      ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'pendiente';
      ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS rol VARCHAR(50) DEFAULT 'RESTAURANTE';
      ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'basico';
      ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS suscripcion_activa BOOLEAN DEFAULT true;
      ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS fecha_vencimiento TIMESTAMP WITH TIME ZONE;
      ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS dias_acceso_permitidos INTEGER DEFAULT 0;
    `);

    // 3. Crear tabla audit_logs si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          usuario_id UUID NOT NULL,
          accion VARCHAR(100) NOT NULL,
          detalles JSONB DEFAULT '{}'::jsonb,
          ip_address VARCHAR(45),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // 4. Crear columna deleted_at en usuarios_comensales para Soft-Delete
    await pool.query(`
      ALTER TABLE usuarios_comensales ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
    `);

    // 5. Crear tabla cocinas_catalogo si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cocinas_catalogo (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nombre VARCHAR(100) UNIQUE NOT NULL
      );
    `);

    // Sembrar cocinas
    await pool.query(`
      INSERT INTO cocinas_catalogo (nombre) VALUES 
      ('Mexicana'), ('Italiana'), ('Japonesa'), ('China'), ('Americana'), 
      ('Árabe'), ('Española'), ('Francesa'), ('Mariscos'), ('Cafetería'), 
      ('Repostería'), ('Internacional'), ('Fusión')
      ON CONFLICT (nombre) DO NOTHING;
    `);

    // 6. Crear tabla tamanos_porcion si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tamanos_porcion (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          nombre VARCHAR(100) UNIQUE NOT NULL
      );
    `);

    // Sembrar tamaños de porción
    await pool.query(`
      INSERT INTO tamanos_porcion (nombre) VALUES 
      ('Individual'), ('Mediana'), ('Grande'), ('Familiar')
      ON CONFLICT (nombre) DO NOTHING;
    `);

    // 7. Modificar tabla platillos para nivel_picante y tamano_porcion_id
    await pool.query(`
      ALTER TABLE platillos ADD COLUMN IF NOT EXISTS nivel_picante INT DEFAULT 0 CHECK (nivel_picante BETWEEN 0 AND 5);
      ALTER TABLE platillos ADD COLUMN IF NOT EXISTS tamano_porcion_id UUID REFERENCES tamanos_porcion(id) ON DELETE SET NULL;
    `);

    // 8. Crear tabla pivote platillo_cocina
    await pool.query(`
      CREATE TABLE IF NOT EXISTS platillo_cocina (
          platillo_id UUID REFERENCES platillos(id) ON DELETE CASCADE,
          cocina_id UUID REFERENCES cocinas_catalogo(id) ON DELETE CASCADE,
          PRIMARY KEY (platillo_id, cocina_id)
      );
    `);
    
    console.log('Database schema verified: config_diseno, restaurantes, audit_logs, deleted_at, cocinas, portions, and spiciness columns are present.');
  } catch (err) {
    console.error('Database migration error:', err);
  }
};
initDb();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
