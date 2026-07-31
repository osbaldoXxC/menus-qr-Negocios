const db = require('./src/config/db');
const bcrypt = require('bcryptjs');
(async () => {
  try {
    const hash = await bcrypt.hash('password123', 10);
    // Premium User
    await db.query(`INSERT INTO restaurantes (id, nombre_negocio, email, password_hash, plan, suscripcion_activa, estado, rol, email_verificado) VALUES ('22222222-2222-2222-2222-222222222222', 'Test Premium', 'premium@test.com', $1, 'premium', true, 'aprobado', 'RESTAURANTE', true) ON CONFLICT (id) DO UPDATE SET plan = 'premium', suscripcion_activa = true;`, [hash]);
    
    // Prueba User
    await db.query(`INSERT INTO restaurantes (id, nombre_negocio, email, password_hash, plan, suscripcion_activa, estado, rol, email_verificado) VALUES ('33333333-3333-3333-3333-333333333333', 'Test Prueba', 'prueba@test.com', $1, 'prueba', true, 'aprobado', 'RESTAURANTE', true) ON CONFLICT (id) DO UPDATE SET plan = 'prueba', suscripcion_activa = true;`, [hash]);
    
    console.log('Test users created');
  } catch (e) { console.log(e); }
  process.exit(0);
})();
