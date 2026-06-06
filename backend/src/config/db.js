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

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
