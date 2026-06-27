/**
 * Integration Test Script for SuperAdmin Functionalities
 * Validates approveRestaurant, suspendRestaurant, and checkExpiredSubscriptions.
 * Supports both real DB/Redis integration and automated mock fallbacks.
 */

const path = require('path');
// Load environment variables from root .env
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const db = require('./config/db');
const redisClient = require('./config/redis');

// Import controllers and services
const adminController = require('./controllers/adminController');
const subscriptionCheck = require('./services/subscriptionCheck');

// Setup mock state for Database and Redis (if connection fails)
const mockDatabase = {
  restaurantes: [],
  refresh_tokens: [],
  platillos: []
};
const mockRedisDb = new Map();

// Helper to check connections
async function checkConnectivity() {
  let dbOk = false;
  let redisOk = false;

  // Test DB connection
  try {
    const res = await db.pool.query('SELECT NOW()');
    if (res && res.rows) {
      dbOk = true;
    }
  } catch (err) {
    // DB down
  }

  // Test Redis connection
  try {
    if (redisClient.isOpen) {
      await redisClient.ping();
      redisOk = true;
    } else {
      // Give a tiny window to connect
      await new Promise(resolve => setTimeout(resolve, 500));
      if (redisClient.isOpen) {
        await redisClient.ping();
        redisOk = true;
      }
    }
  } catch (err) {
    // Redis down
  }

  return { dbOk, redisOk };
}

// Request & Response Mock Factories
function mockRequest(params = {}, body = {}) {
  return { params, body };
}

function mockResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
}

// Mock Database query processor
async function mockDbQuery(text, params) {
  const queryNormalized = text.replace(/\s+/g, ' ').trim();

  // INSERT INTO restaurantes
  if (queryNormalized.includes("INSERT INTO restaurantes")) {
    const [id, nombre_negocio, email, password_hash, rol, plan, estado, suscripcion_activa, dias_acceso_permitidos, fecha_vencimiento] = params;
    // Clean if already present
    mockDatabase.restaurantes = mockDatabase.restaurantes.filter(r => r.id !== id);
    mockDatabase.restaurantes.push({
      id,
      nombre_negocio,
      email,
      password_hash,
      rol,
      plan,
      estado,
      suscripcion_activa,
      dias_acceso_permitidos,
      fecha_vencimiento: fecha_vencimiento || null
    });
    return { rows: [] };
  }

  // INSERT INTO refresh_tokens
  if (queryNormalized.includes("INSERT INTO refresh_tokens")) {
    const [restaurante_id, token, expires_at] = params;
    mockDatabase.refresh_tokens.push({ restaurante_id, token, expires_at });
    return { rows: [] };
  }

  // INSERT INTO platillos
  if (queryNormalized.includes("INSERT INTO platillos")) {
    const [restaurante_id, nombre, precio, activo] = params;
    mockDatabase.platillos.push({
      id: Math.random().toString(),
      restaurante_id,
      nombre,
      precio,
      activo
    });
    return { rows: [] };
  }

  // UPDATE restaurantes (Approve)
  // UPDATE restaurantes SET estado = 'aprobado', suscripcion_activa = true, dias_acceso_permitidos = $1, fecha_vencimiento = $2 WHERE id = $3 RETURNING ...
  if (queryNormalized.includes("UPDATE restaurantes") && queryNormalized.includes("'aprobado'")) {
    const [dias_acceso_permitidos, fecha_vencimiento, id] = params;
    const r = mockDatabase.restaurantes.find(item => item.id === id);
    if (!r) return { rows: [] };
    r.estado = 'aprobado';
    r.suscripcion_activa = true;
    r.dias_acceso_permitidos = dias_acceso_permitidos;
    r.fecha_vencimiento = fecha_vencimiento;
    return {
      rows: [{
        id: r.id,
        nombre_negocio: r.nombre_negocio,
        estado: r.estado,
        suscripcion_activa: r.suscripcion_activa,
        fecha_vencimiento: r.fecha_vencimiento,
        dias_acceso_permitidos: r.dias_acceso_permitidos
      }]
    };
  }

  // UPDATE restaurantes (Suspend - Manual)
  // UPDATE restaurantes SET estado = 'suspendido', suscripcion_activa = false WHERE id = $1 RETURNING ...
  if (queryNormalized.includes("UPDATE restaurantes") && queryNormalized.includes("'suspendido'") && queryNormalized.includes("RETURNING")) {
    const [id] = params;
    const r = mockDatabase.restaurantes.find(item => item.id === id);
    if (!r) return { rows: [] };
    r.estado = 'suspendido';
    r.suscripcion_activa = false;
    return {
      rows: [{
        id: r.id,
        nombre_negocio: r.nombre_negocio,
        estado: r.estado,
        suscripcion_activa: r.suscripcion_activa
      }]
    };
  }

  // UPDATE restaurantes (Suspend - Subscription Expired)
  // UPDATE restaurantes SET estado = 'suspendido', suscripcion_activa = false WHERE id = $1
  if (queryNormalized.includes("UPDATE restaurantes") && queryNormalized.includes("'suspendido'") && !queryNormalized.includes("RETURNING")) {
    const [id] = params;
    const r = mockDatabase.restaurantes.find(item => item.id === id);
    if (r) {
      r.estado = 'suspendido';
      r.suscripcion_activa = false;
    }
    return { rows: [] };
  }

  // DELETE FROM refresh_tokens
  if (queryNormalized.includes("DELETE FROM refresh_tokens")) {
    const [id] = params;
    const lenBefore = mockDatabase.refresh_tokens.length;
    mockDatabase.refresh_tokens = mockDatabase.refresh_tokens.filter(t => t.restaurante_id !== id);
    return { rows: [], rowCount: lenBefore - mockDatabase.refresh_tokens.length };
  }

  // UPDATE platillos
  if (queryNormalized.includes("UPDATE platillos") && queryNormalized.includes("activo = false")) {
    const [id] = params;
    let count = 0;
    mockDatabase.platillos.forEach(p => {
      if (p.restaurante_id === id) {
        p.activo = false;
        count++;
      }
    });
    return { rows: [], rowCount: count };
  }

  // SELECT expired restaurants
  // SELECT id, nombre_negocio, email FROM restaurantes WHERE estado = 'aprobado' AND fecha_vencimiento IS NOT NULL AND fecha_vencimiento < NOW()
  if (queryNormalized.includes("SELECT id, nombre_negocio, email FROM restaurantes") && queryNormalized.includes("fecha_vencimiento < NOW()")) {
    const expired = mockDatabase.restaurantes.filter(r => {
      return r.estado === 'aprobado' && r.fecha_vencimiento && new Date(r.fecha_vencimiento) < new Date();
    });
    return { rows: expired };
  }

  // Fallback select
  if (queryNormalized.includes("SELECT") && queryNormalized.includes("restaurantes") && queryNormalized.includes("WHERE id =")) {
    const [id] = params;
    const r = mockDatabase.restaurantes.find(item => item.id === id);
    return { rows: r ? [r] : [] };
  }

  // DELETE FROM refresh_tokens with multiple IDs (cleanup)
  if (queryNormalized.includes("DELETE FROM refresh_tokens WHERE restaurante_id IN")) {
    const ids = params;
    mockDatabase.refresh_tokens = mockDatabase.refresh_tokens.filter(t => !ids.includes(t.restaurante_id));
    return { rows: [], rowCount: 1 };
  }

  // DELETE FROM platillos with multiple IDs (cleanup)
  if (queryNormalized.includes("DELETE FROM platillos WHERE restaurante_id IN")) {
    const ids = params;
    mockDatabase.platillos = mockDatabase.platillos.filter(p => !ids.includes(p.restaurante_id));
    return { rows: [], rowCount: 1 };
  }

  // DELETE FROM restaurantes with multiple IDs (cleanup)
  if (queryNormalized.includes("DELETE FROM restaurantes WHERE id IN")) {
    const ids = params;
    mockDatabase.restaurantes = mockDatabase.restaurantes.filter(r => !ids.includes(r.id));
    return { rows: [], rowCount: 1 };
  }

  return { rows: [] };
}

// Main Runner
async function runTests() {
  console.log(`\n\x1b[36m==================================================\x1b[0m`);
  console.log(`\x1b[36m   MEXXICANMX INTEGRATION TEST SUITE - SUPERADMIN \x1b[0m`);
  console.log(`\x1b[36m==================================================\x1b[0m`);

  const { dbOk, redisOk } = await checkConnectivity();

  console.log(`\n\x1b[1mChecking Services Status:\x1b[0m`);
  console.log(`- PostgreSQL DB: ${dbOk ? '\x1b[32mCONNECTED \x1b[0m' : '\x1b[31mNOT CONNECTED (Using Mock)\x1b[0m'}`);
  console.log(`- Redis Server:  ${redisOk ? '\x1b[32mCONNECTED \x1b[0m' : '\x1b[31mNOT CONNECTED (Using Mock)\x1b[0m'}`);

  // Apply stubs if services are down
  if (!dbOk) {
    db.query = mockDbQuery;
  }
  if (!redisOk) {
    redisClient.del = async (key) => {
      console.log(`\x1b[33m[Mock Redis] DEL: ${key}\x1b[0m`);
      const deleted = mockRedisDb.delete(key);
      return deleted ? 1 : 0;
    };
    redisClient.set = async (key, val) => {
      console.log(`\x1b[33m[Mock Redis] SET: ${key}\x1b[0m`);
      mockRedisDb.set(key, val);
      return 'OK';
    };
    redisClient.get = async (key) => {
      console.log(`\x1b[33m[Mock Redis] GET: ${key}\x1b[0m`);
      return mockRedisDb.get(key) || null;
    };
  }

  // Define test UUIDs
  const pendingId = 'a1111111-1111-1111-1111-111111111111';
  const expiredId = 'b2222222-2222-2222-2222-222222222222';

  // ----------------------------------------------------
  // TEST INITIALIZATION / SEEDING
  // ----------------------------------------------------
  console.log(`\n\x1b[35m[1/4] Seeding database and caching dummy keys...\x1b[0m`);
  try {
    // Teardown leftovers
    await db.query(`DELETE FROM refresh_tokens WHERE restaurante_id IN ($1, $2)`, [pendingId, expiredId]);
    await db.query(`DELETE FROM platillos WHERE restaurante_id IN ($1, $2)`, [pendingId, expiredId]);
    await db.query(`DELETE FROM restaurantes WHERE id IN ($1, $2)`, [pendingId, expiredId]);

    // Insert Pending Restaurant
    await db.query(
      `INSERT INTO restaurantes (id, nombre_negocio, email, password_hash, rol, plan, estado, suscripcion_activa, dias_acceso_permitidos)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [pendingId, 'Test Taco Live (Pending)', 'test-pending@mexxican.mx', 'dummy_hash', 'RESTAURANTE', 'basico', 'pendiente', false, 0]
    );

    // Insert Expired Restaurant
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
    await db.query(
      `INSERT INTO restaurantes (id, nombre_negocio, email, password_hash, rol, plan, estado, suscripcion_activa, dias_acceso_permitidos, fecha_vencimiento)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [expiredId, 'Test Taco Live (Expired)', 'test-expired@mexxican.mx', 'dummy_hash', 'RESTAURANTE', 'basico', 'aprobado', true, 10, pastDate]
    );

    // Add refresh tokens & platillos to test Kill Switch cascades
    await db.query(
      `INSERT INTO refresh_tokens (restaurante_id, token, expires_at) VALUES ($1, $2, $3)`,
      [expiredId, 'expired-refresh-token', new Date(Date.now() + 24 * 60 * 60 * 1000)]
    );
    await db.query(
      `INSERT INTO refresh_tokens (restaurante_id, token, expires_at) VALUES ($1, $2, $3)`,
      [pendingId, 'pending-refresh-token', new Date(Date.now() + 24 * 60 * 60 * 1000)]
    );

    await db.query(
      `INSERT INTO platillos (restaurante_id, nombre, precio, activo) VALUES ($1, $2, $3, $4)`,
      [expiredId, 'Taco Expired Test', 45.00, true]
    );
    await db.query(
      `INSERT INTO platillos (restaurante_id, nombre, precio, activo) VALUES ($1, $2, $3, $4)`,
      [pendingId, 'Taco Pending Test', 35.00, true]
    );

    // Seed Redis cache
    if (redisOk) {
      await redisClient.set(`cache:menu:${pendingId}`, 'pending_cache_data');
      await redisClient.set(`cache:menu:${expiredId}`, 'expired_cache_data');
    } else {
      mockRedisDb.set(`cache:menu:${pendingId}`, 'pending_cache_data');
      mockRedisDb.set(`cache:menu:${expiredId}`, 'expired_cache_data');
    }

    console.log(`\x1b[32m✔ Seeding successfully completed.\x1b[0m`);
  } catch (error) {
    console.error(`\x1b[31m✖ Setup and Seeding failed:\x1b[0m`, error);
    process.exit(1);
  }

  let failedTests = 0;

  // ----------------------------------------------------
  // SCENARIO 1: APPROVE RESTAURANT
  // ----------------------------------------------------
  console.log(`\n\x1b[35m[2/4] Testing Controller: approveRestaurant\x1b[0m`);

  // Invalid parameters test (days <= 0)
  try {
    console.log(`  - Subtest: Check inputs validation (invalid days)`);
    const req1 = mockRequest({ id: pendingId }, { dias_acceso_permitidos: -10 });
    const res1 = mockResponse();
    await adminController.approveRestaurant(req1, res1);

    if (res1.statusCode === 400) {
      console.log(`    \x1b[32m✔ Correctly rejected negative days (Status 400)\x1b[0m`);
    } else {
      console.log(`    \x1b[31m✖ Expected Status 400 but got ${res1.statusCode}\x1b[0m`);
      failedTests++;
    }
  } catch (e) {
    console.error(`    \x1b[31m✖ Error during input validation test:\x1b[0m`, e);
    failedTests++;
  }

  // Non-existent restaurant test
  try {
    console.log(`  - Subtest: Non-existent restaurant ID`);
    const req2 = mockRequest({ id: '00000000-0000-0000-0000-000000000000' }, { dias_acceso_permitidos: 30 });
    const res2 = mockResponse();
    await adminController.approveRestaurant(req2, res2);

    if (res2.statusCode === 404) {
      console.log(`    \x1b[32m✔ Correctly returned 404 for unknown restaurant\x1b[0m`);
    } else {
      console.log(`    \x1b[31m✖ Expected Status 404 but got ${res2.statusCode}\x1b[0m`);
      failedTests++;
    }
  } catch (e) {
    console.error(`    \x1b[31m✖ Error during 404 validation test:\x1b[0m`, e);
    failedTests++;
  }

  // Successful approval test
  try {
    console.log(`  - Subtest: Successful approval (30 access days)`);
    const req3 = mockRequest({ id: pendingId }, { dias_acceso_permitidos: 30 });
    const res3 = mockResponse();
    await adminController.approveRestaurant(req3, res3);

    if (res3.statusCode === 200 && res3.body.restaurante) {
      const rest = res3.body.restaurante;
      console.log(`    \x1b[32m✔ Response is OK (Status 200)\x1b[0m`);
      console.log(`    \x1b[32m✔ Restaurant state: ${rest.estado} (Expected: aprobado)\x1b[0m`);
      console.log(`    \x1b[32m✔ Subscription active: ${rest.suscripcion_activa} (Expected: true)\x1b[0m`);
      console.log(`    \x1b[32m✔ Expiry date generated: ${rest.fecha_vencimiento}\x1b[0m`);

      // Verify date calculation
      const expiry = new Date(rest.fecha_vencimiento);
      const diffMs = expiry.getTime() - Date.now();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays >= 29 && diffDays <= 31) {
        console.log(`    \x1b[32m✔ Date calculation is correct (~30 days in the future)\x1b[0m`);
      } else {
        console.log(`    \x1b[31m✖ Incorrect date calculation (got diff: ${diffDays} days)\x1b[0m`);
        failedTests++;
      }

      // Verify Cache is cleared
      let cacheExists = true;
      if (redisOk) {
        cacheExists = await redisClient.get(`cache:menu:${pendingId}`);
      } else {
        cacheExists = mockRedisDb.has(`cache:menu:${pendingId}`);
      }

      if (!cacheExists) {
        console.log(`    \x1b[32m✔ Redis menu cache successfully deleted.\x1b[0m`);
      } else {
        console.log(`    \x1b[31m✖ Redis menu cache still exists.\x1b[0m`);
        failedTests++;
      }
    } else {
      console.log(`    \x1b[31m✖ Approval failed: Status ${res3.statusCode}, Body:`, res3.body);
      failedTests++;
    }
  } catch (e) {
    console.error(`    \x1b[31m✖ Error during approval flow test:\x1b[0m`, e);
    failedTests++;
  }

  // ----------------------------------------------------
  // SCENARIO 2: SUBSCRIPTION EXPIRATION CHANGER (CRON TASK)
  // ----------------------------------------------------
  console.log(`\n\x1b[35m[3/4] Testing Service: checkExpiredSubscriptions (Cron Flow)\x1b[0m`);
  try {
    console.log(`  - Subtest: Check expiration for past subscriptions`);
    await subscriptionCheck.checkExpiredSubscriptions();

    // Verify DB (or mock state) of expiredId
    let restState = null;
    let tokensCount = 0;
    let platillosActivosCount = 0;

    if (dbOk) {
      const dbRest = await db.query('SELECT estado, suscripcion_activa FROM restaurantes WHERE id = $1', [expiredId]);
      restState = dbRest.rows[0];

      const dbTokens = await db.query('SELECT COUNT(*)::int as count FROM refresh_tokens WHERE restaurante_id = $1', [expiredId]);
      tokensCount = dbTokens.rows[0].count;

      const dbPlatillos = await db.query('SELECT COUNT(*)::int as count FROM platillos WHERE restaurante_id = $1 AND activo = true', [expiredId]);
      platillosActivosCount = dbPlatillos.rows[0].count;
    } else {
      const mockRest = mockDatabase.restaurantes.find(r => r.id === expiredId);
      restState = mockRest ? { estado: mockRest.estado, suscripcion_activa: mockRest.suscripcion_activa } : null;

      tokensCount = mockDatabase.refresh_tokens.filter(t => t.restaurante_id === expiredId).length;
      platillosActivosCount = mockDatabase.platillos.filter(p => p.restaurante_id === expiredId && p.activo === true).length;
    }

    if (restState && restState.estado === 'suspendido' && restState.suscripcion_activa === false) {
      console.log(`    \x1b[32m✔ Expired restaurant correctly set to 'suspendido' and inactive.\x1b[0m`);
    } else {
      console.log(`    \x1b[31m✖ Expired restaurant state mismatch:`, restState);
      failedTests++;
    }

    if (tokensCount === 0) {
      console.log(`    \x1b[32m✔ Expired restaurant refresh tokens deleted from DB.\x1b[0m`);
    } else {
      console.log(`    \x1b[31m✖ Expired restaurant refresh tokens not deleted: found ${tokensCount} tokens.\x1b[0m`);
      failedTests++;
    }

    if (platillosActivosCount === 0) {
      console.log(`    \x1b[32m✔ Expired restaurant dishes paused (activo = false) in DB.\x1b[0m`);
    } else {
      console.log(`    \x1b[31m✖ Expired restaurant dishes not paused: found ${platillosActivosCount} active dishes.\x1b[0m`);
      failedTests++;
    }

    // Verify cache purged
    let cacheExists = true;
    if (redisOk) {
      cacheExists = await redisClient.get(`cache:menu:${expiredId}`);
    } else {
      cacheExists = mockRedisDb.has(`cache:menu:${expiredId}`);
    }

    if (!cacheExists) {
      console.log(`    \x1b[32m✔ Redis menu cache successfully deleted.\x1b[0m`);
    } else {
      console.log(`    \x1b[31m✖ Redis menu cache still exists.\x1b[0m`);
      failedTests++;
    }
  } catch (e) {
    console.error(`    \x1b[31m✖ Error during subscription expiration check test:\x1b[0m`, e);
    failedTests++;
  }

  // ----------------------------------------------------
  // SCENARIO 3: MANUAL SUSPENSION (THE KILL SWITCH)
  // ----------------------------------------------------
  console.log(`\n\x1b[35m[4/4] Testing Controller: suspendRestaurant (The Kill Switch)\x1b[0m`);
  try {
    console.log(`  - Subtest: Suspending the newly approved restaurant manually`);
    const req4 = mockRequest({ id: pendingId });
    const res4 = mockResponse();
    await adminController.suspendRestaurant(req4, res4);

    if (res4.statusCode === 200) {
      console.log(`    \x1b[32m✔ Controller returned success (Status 200)\x1b[0m`);
      
      let restState = null;
      let tokensCount = 0;
      let platillosActivosCount = 0;

      if (dbOk) {
        const dbRest = await db.query('SELECT estado, suscripcion_activa FROM restaurantes WHERE id = $1', [pendingId]);
        restState = dbRest.rows[0];

        const dbTokens = await db.query('SELECT COUNT(*)::int as count FROM refresh_tokens WHERE restaurante_id = $1', [pendingId]);
        tokensCount = dbTokens.rows[0].count;

        const dbPlatillos = await db.query('SELECT COUNT(*)::int as count FROM platillos WHERE restaurante_id = $1 AND activo = true', [pendingId]);
        platillosActivosCount = dbPlatillos.rows[0].count;
      } else {
        const mockRest = mockDatabase.restaurantes.find(r => r.id === pendingId);
        restState = mockRest ? { estado: mockRest.estado, suscripcion_activa: mockRest.suscripcion_activa } : null;

        tokensCount = mockDatabase.refresh_tokens.filter(t => t.restaurante_id === pendingId).length;
        platillosActivosCount = mockDatabase.platillos.filter(p => p.restaurante_id === pendingId && p.activo === true).length;
      }

      if (restState && restState.estado === 'suspendido' && restState.suscripcion_activa === false) {
        console.log(`    \x1b[32m✔ Restaurant correctly set to 'suspendido' and inactive.\x1b[0m`);
      } else {
        console.log(`    \x1b[31m✖ Restaurant state mismatch:`, restState);
        failedTests++;
      }

      if (tokensCount === 0) {
        console.log(`    \x1b[32m✔ Refresh tokens deleted from DB (session destroyed).\x1b[0m`);
      } else {
        console.log(`    \x1b[31m✖ Refresh tokens not deleted: found ${tokensCount} tokens.\x1b[0m`);
        failedTests++;
      }

      if (platillosActivosCount === 0) {
        console.log(`    \x1b[32m✔ Restaurant dishes paused (activo = false) in DB.\x1b[0m`);
      } else {
        console.log(`    \x1b[31m✖ Restaurant dishes not paused: found ${platillosActivosCount} active dishes.\x1b[0m`);
        failedTests++;
      }
    } else {
      console.log(`    \x1b[31m✖ Kill Switch failed with Status ${res4.statusCode}\x1b[0m`);
      failedTests++;
    }
  } catch (e) {
    console.error(`    \x1b[31m✖ Error during manual suspension test:\x1b[0m`, e);
    failedTests++;
  }

  // ----------------------------------------------------
  // CLEANUP & FINAL REPORT
  // ----------------------------------------------------
  console.log(`\n\x1b[35mCleaning up test database seed data...\x1b[0m`);
  try {
    await db.query(`DELETE FROM refresh_tokens WHERE restaurante_id IN ($1, $2)`, [pendingId, expiredId]);
    await db.query(`DELETE FROM platillos WHERE restaurante_id IN ($1, $2)`, [pendingId, expiredId]);
    await db.query(`DELETE FROM restaurantes WHERE id IN ($1, $2)`, [pendingId, expiredId]);
    console.log(`\x1b[32m✔ Cleanup successfully completed.\x1b[0m`);
  } catch (e) {
    console.error(`\x1b[31m✖ Cleanup failed:\x1b[0m`, e);
  }

  // Close open handles
  if (dbOk) {
    await db.pool.end();
  }
  if (redisOk) {
    await redisClient.quit();
  }

  console.log(`\n\x1b[36m==================================================\x1b[0m`);
  console.log(`\x1b[36m               TEST RUN SUMMARY                   \x1b[0m`);
  console.log(`\x1b[36m==================================================\x1b[0m`);
  if (failedTests === 0) {
    console.log(`\x1b[32m\x1b[1mALL TESTS PASSED SUCCESSFULLY! (0 failures)\x1b[0m`);
  } else {
    console.log(`\x1b[31m\x1b[1mSOME TESTS FAILED: ${failedTests} failure(s) found.\x1b[0m`);
    process.exit(1);
  }
}

// Run test suite
runTests().catch(err => {
  console.error("Fatal error in test suite runner:", err);
  process.exit(1);
});
