const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:root@localhost:5432/mexxican_menus'
});

async function run() {
  const res = await pool.query(`
      SELECT 
        r.id, 
        r.nombre_negocio, 
        r.email, 
        r.rol
      FROM restaurantes r
  `);
  console.log('Restaurantes:', res.rows.length);
  pool.end();
}
run();
