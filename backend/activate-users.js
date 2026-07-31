const db = require('./src/config/db');
(async () => {
  try {
    await db.query("UPDATE restaurantes SET email_verificado = true, suscripcion_activa = true, estado = 'aprobado', rol = 'RESTAURANTE' WHERE email IN ('e2epremium@test.com', 'e2eprueba@test.com')");
    console.log('Users activated');
  } catch (e) { console.log(e); }
  process.exit(0);
})();
