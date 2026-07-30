const db = require('../config/db');

async function runMigrations() {
  console.log('🏁 Iniciando migraciones de base de datos...');
  
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Asegurar columna email_verificado en la tabla restaurantes
    console.log('Migración 1: Verificando columna email_verificado...');
    await client.query('ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT false');

    // 2. Forzar verificación de emails de prueba en desarrollo
    console.log('Migración 2: Verificando correos de prueba...');
    const verifyRes = await client.query(
      "UPDATE restaurantes SET email_verificado = true WHERE email LIKE '%@example.com' OR email LIKE '%@test.com' OR email = 'contacto@elpaisa.com'"
    );
    if (verifyRes.rowCount > 0) {
      console.log(`- Se marcaron ${verifyRes.rowCount} correos de prueba como verificados.`);
    }

    // 3. Asegurar columna config_diseno en la tabla configuracion_tema
    console.log('Migración 3: Verificando columna config_diseno...');
    await client.query('ALTER TABLE configuracion_tema ADD COLUMN IF NOT EXISTS config_diseno TEXT');

    await client.query('COMMIT');
    console.log('🎉 Migraciones completadas con éxito.');
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error ejecutando las migraciones:', error.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

runMigrations();
