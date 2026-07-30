const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function seedSuperAdmin() {
  console.log('🌱 Creando/Actualizando Super Admin en la base de datos...');

  const email = 'admin@mexxican.mx';
  const password = 'Admin12345!';
  const nombreNegocio = 'Super Admin MexxicanMX';
  const nombreDueno = 'Super Administrador';

  try {
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO restaurantes (
        id, 
        nombre_negocio, 
        email, 
        password_hash, 
        nombre_dueno, 
        rol, 
        plan, 
        suscripcion_activa, 
        email_verificado, 
        estado
      )
      VALUES (
        '11111111-1111-1111-1111-111111111111',
        $1,
        $2,
        $3,
        $4,
        'SUPER_ADMIN',
        'premium',
        true,
        true,
        'aprobado'
      )
      ON CONFLICT (email) DO UPDATE 
      SET 
        password_hash = EXCLUDED.password_hash,
        rol = 'SUPER_ADMIN',
        suscripcion_activa = true,
        email_verificado = true,
        estado = 'aprobado';
    `;

    await db.query(query, [nombreNegocio, email, password_hash, nombreDueno]);

    console.log('✅ Super Admin registrado con éxito:');
    console.log(`   - Email: ${email}`);
    console.log(`   - Contraseña: ${password}`);
    console.log(`   - Rol: SUPER_ADMIN`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al registrar Super Admin:', error);
    process.exit(1);
  }
}

seedSuperAdmin();
