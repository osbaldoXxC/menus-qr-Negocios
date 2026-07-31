const db = require('./src/config/db');
(async () => {
  try {
    await db.query("UPDATE restaurantes SET email_verificado = true WHERE email IN ('premium@test.com', 'prueba@test.com')");
    console.log('Users verified');
  } catch (e) { console.log(e); }
  process.exit(0);
})();
