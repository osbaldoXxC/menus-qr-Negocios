const db = require('../config/db');
const redisClient = require('../config/redis');

const checkExpiredSubscriptions = async () => {
  try {
    // 1. Buscar restaurantes aprobados cuya fecha de vencimiento haya pasado
    const result = await db.query(
      "SELECT id, nombre_negocio, email FROM restaurantes WHERE estado = 'aprobado' AND fecha_vencimiento IS NOT NULL AND fecha_vencimiento < NOW()"
    );

    const expiredRestaurants = result.rows;

    if (expiredRestaurants.length === 0) {
      return;
    }

    console.log(`[SubscriptionCheck] Se encontraron ${expiredRestaurants.length} restaurantes con suscripción expirada.`);

    for (const rest of expiredRestaurants) {
      const { id, nombre_negocio } = rest;
      try {
        // Actualizar estado a 'suspendido' y suscripcion_activa a false
        await db.query(
          "UPDATE restaurantes SET estado = 'suspendido', suscripcion_activa = false WHERE id = $1",
          [id]
        );

        // Eliminar sus refresh tokens de la base de datos
        await db.query(
          "DELETE FROM refresh_tokens WHERE restaurante_id = $1",
          [id]
        );

        // Pause sus platillos (activo = false)
        await db.query(
          "UPDATE platillos SET activo = false WHERE restaurante_id = $1",
          [id]
        );

        // Borrar el caché de su menú en Redis
        await redisClient.del(`cache:menu:${id}`);

        // Registrar en consola la suspensión
        console.log(`[SubscriptionCheck] Restaurante suspendido automáticamente por vencimiento: ${nombre_negocio} (ID: ${id})`);
      } catch (innerError) {
        console.error(`[SubscriptionCheck] Error al suspender el restaurante ${nombre_negocio} (ID: ${id}):`, innerError);
      }
    }
  } catch (error) {
    console.error('Error en verificador de expiración de suscripciones:', error);
  }
};

const runCleanupJob = async () => {
  try {
    console.log('[CleanupJob] Iniciando limpieza de datos obsoletos...');

    // 1. Limpieza de refresh tokens expirados
    const tokensRes = await db.query(
      "DELETE FROM refresh_tokens WHERE expires_at < NOW()"
    );
    if (tokensRes.rowCount > 0) {
      console.log(`[CleanupJob] Se eliminaron ${tokensRes.rowCount} refresh tokens expirados.`);
    }

    // 2. Limpieza de usuarios comensales inactivos (Soft-Delete para cumplimiento de políticas e historial)
    const usersRes = await db.query(`
      UPDATE usuarios_comensales 
      SET deleted_at = NOW() 
      WHERE created_at < NOW() - INTERVAL '90 days' 
        AND deleted_at IS NULL
        AND id NOT IN (SELECT DISTINCT usuario_id FROM interacciones_feed WHERE usuario_id IS NOT NULL)
    `);
    if (usersRes.rowCount > 0) {
      console.log(`[CleanupJob] Se marcaron con soft-delete ${usersRes.rowCount} usuarios comensales inactivos.`);
    }

    console.log('[CleanupJob] Limpieza completada con éxito.');
  } catch (error) {
    console.error('[CleanupJob] Error durante la ejecución del cleanup:', error);
  }
};

const initSubscriptionCheck = () => {
  // Ejecutar inmediatamente al iniciar
  checkExpiredSubscriptions();
  runCleanupJob();

  // Configurar intervalo periódico (cada 1 hora) para suscripciones
  const intervalMs = 60 * 60 * 1000;
  setInterval(checkExpiredSubscriptions, intervalMs);
  console.log('[SubscriptionCheck] Verificador de expiración automática de suscripciones inicializado (intervalo: 1 hora).');

  // Configurar intervalo periódico (cada 24 horas) para limpieza
  const dayMs = 24 * 60 * 60 * 1000;
  setInterval(runCleanupJob, dayMs);
  console.log('[CleanupJob] Limpiador periódico de base de datos inicializado (intervalo: 24 horas).');
};

module.exports = {
  checkExpiredSubscriptions,
  runCleanupJob,
  initSubscriptionCheck
};
