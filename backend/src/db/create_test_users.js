const db = require('../config/db');
const bcrypt = require('bcryptjs');

const createUsers = async () => {
  try {
    const salt = await bcrypt.genSalt(8);
    
    // Contraseñas hasheadas
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    const restPasswordHash = await bcrypt.hash('restaurante123', salt);

    console.log('Iniciando inserción de usuarios de prueba...');

    // 1. Crear Administrador (SUPER_ADMIN)
    const adminEmail = 'admin_local@test.com';
    const adminRes = await db.query(
      `INSERT INTO restaurantes (nombre_negocio, email, password_hash, rol, plan, estado, suscripcion_activa, slug)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO UPDATE 
       SET password_hash = EXCLUDED.password_hash, rol = EXCLUDED.rol, estado = EXCLUDED.estado, suscripcion_activa = EXCLUDED.suscripcion_activa
       RETURNING id`,
      [
        'Administrador Local MexxicanMX',
        adminEmail,
        adminPasswordHash,
        'SUPER_ADMIN',
        'premium',
        'aprobado',
        true,
        'administrador-local-mexxicanmx'
      ]
    );
    const adminId = adminRes.rows[0].id;
    console.log(`[Éxito] Administrador creado/actualizado: ${adminEmail} (Contraseña: admin123) - ID: ${adminId}`);

    // Asegurar configuracion_tema para el Admin
    await db.query(
      `INSERT INTO configuracion_tema (restaurante_id) VALUES ($1) ON CONFLICT (restaurante_id) DO NOTHING`,
      [adminId]
    );

    // 2. Crear Dueño de Restaurante Aprobado/Activo (RESTAURANTE)
    const restEmail = 'restaurante_local@test.com';
    const restRes = await db.query(
      `INSERT INTO restaurantes (nombre_negocio, email, password_hash, rol, plan, estado, suscripcion_activa, slug, fecha_vencimiento, dias_acceso_permitidos)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP + INTERVAL '30 days', 30)
       ON CONFLICT (email) DO UPDATE 
       SET password_hash = EXCLUDED.password_hash, rol = EXCLUDED.rol, estado = EXCLUDED.estado, suscripcion_activa = EXCLUDED.suscripcion_activa, fecha_vencimiento = EXCLUDED.fecha_vencimiento, dias_acceso_permitidos = EXCLUDED.dias_acceso_permitidos
       RETURNING id`,
      [
        'Restaurante Local Activo',
        restEmail,
        restPasswordHash,
        'RESTAURANTE',
        'premium',
        'aprobado',
        true,
        'restaurante-local-activo'
      ]
    );
    const restId = restRes.rows[0].id;
    console.log(`[Éxito] Restaurante Activo creado/actualizado: ${restEmail} (Contraseña: restaurante123) - ID: ${restId}`);

    // Asegurar configuracion_tema para el Restaurante Activo
    await db.query(
      `INSERT INTO configuracion_tema (restaurante_id) VALUES ($1) ON CONFLICT (restaurante_id) DO NOTHING`,
      [restId]
    );

    // 3. Crear Dueño de Restaurante Pendiente (RESTAURANTE)
    const restPendienteEmail = 'restaurante_pendiente@test.com';
    const restPendienteRes = await db.query(
      `INSERT INTO restaurantes (nombre_negocio, email, password_hash, rol, plan, estado, suscripcion_activa, slug, dias_acceso_permitidos)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0)
       ON CONFLICT (email) DO UPDATE 
       SET password_hash = EXCLUDED.password_hash, rol = EXCLUDED.rol, estado = EXCLUDED.estado, suscripcion_activa = EXCLUDED.suscripcion_activa, dias_acceso_permitidos = EXCLUDED.dias_acceso_permitidos
       RETURNING id`,
      [
        'Restaurante Local Pendiente',
        restPendienteEmail,
        restPasswordHash,
        'RESTAURANTE',
        'basico',
        'pendiente',
        false,
        'restaurante-local-pendiente'
      ]
    );
    const restPendienteId = restPendienteRes.rows[0].id;
    console.log(`[Éxito] Restaurante Pendiente creado/actualizado: ${restPendienteEmail} (Contraseña: restaurante123) - ID: ${restPendienteId}`);

    // Asegurar configuracion_tema para el Restaurante Pendiente
    await db.query(
      `INSERT INTO configuracion_tema (restaurante_id) VALUES ($1) ON CONFLICT (restaurante_id) DO NOTHING`,
      [restPendienteId]
    );

    console.log('Proceso de siembra finalizado con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error al insertar usuarios de prueba:', error);
    process.exit(1);
  }
};

// Esperar un momento para la conexión a la base de datos
setTimeout(createUsers, 1000);
