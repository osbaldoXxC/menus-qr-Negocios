const db = require('./backend/src/config/db');
(async () => {
  try {
    const query = `
      SELECT 
        c.*,
        r.nombre_negocio, r.nombre_dueno, r.email, r.plan
      FROM soporte_conversaciones c
      JOIN restaurantes r ON c.restaurante_id = r.id
      ORDER BY 
        CASE WHEN c.estado = 'pendiente' THEN 1
             WHEN c.estado = 'en_atencion' THEN 2
             ELSE 3 END,
        c.ultima_actividad DESC
    `;
    const result = await db.query(query);
    console.log(result.rows);
  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    process.exit();
  }
})();
