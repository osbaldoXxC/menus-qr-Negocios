const db = require('./src/config/db');
(async () => {
  try {
    const hash = '$2a$12$.uE.vltFrnP2TT0S8uLNZ.ourKbJfk3OSX4w/GGEWuaRcQjqjDv6y';
    await db.query("UPDATE restaurantes SET password_hash = $1 WHERE email = 'premium@test.com'", [hash]);
    await db.query("UPDATE restaurantes SET password_hash = $1 WHERE email = 'prueba@test.com'", [hash]);
    console.log('Passwords updated to Admin12345!');
  } catch (e) { console.log(e); }
  process.exit(0);
})();
