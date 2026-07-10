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

    // 2. Crear Dueño de Restaurante (RESTAURANTE)
    const restEmail = 'restaurante_local@test.com';
    const restRes = await db.query(
      `INSERT INTO restaurantes (nombre_negocio, email, password_hash, rol, plan, estado, suscripcion_activa, slug, fecha_vencimiento)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP + INTERVAL '30 days')
       ON CONFLICT (email) DO UPDATE 
       SET password_hash = EXCLUDED.password_hash, rol = EXCLUDED.rol, estado = EXCLUDED.estado, suscripcion_activa = EXCLUDED.suscripcion_activa, fecha_vencimiento = EXCLUDED.fecha_vencimiento
       RETURNING id`,
      [
        'Restaurante Local Demo',
        restEmail,
        restPasswordHash,
        'RESTAURANTE',
        'premium',
        'aprobado',
        true,
        'restaurante-local-demo'
      ]
    );
    const restId = restRes.rows[0].id;
    console.log(`[Éxito] Restaurante creado/actualizado: ${restEmail} (Contraseña: restaurante123) - ID: ${restId}`);

    // Asegurar configuracion_tema para el Restaurante
    await db.query(
      `INSERT INTO configuracion_tema (restaurante_id) VALUES ($1) ON CONFLICT (restaurante_id) DO NOTHING`,
      [restId]
    );

    console.log('Proceso finalizado con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error al insertar usuarios de prueba:', error);
    process.exit(1);
  }
};

// Esperar un momento para la conexión a la base de datos
setTimeout(createUsers, 1000);
