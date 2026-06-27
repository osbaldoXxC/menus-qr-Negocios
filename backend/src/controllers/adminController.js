const db = require('../config/db');
const redisClient = require('../config/redis');

// Obtener todos los restaurantes para el panel de administración
const getRestaurants = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, nombre_negocio, email, estado, suscripcion_activa, plan, fecha_vencimiento, dias_acceso_permitidos, created_at FROM restaurantes ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener restaurantes:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Aprobar un restaurante y otorgarle días de acceso
const approveRestaurant = async (req, res) => {
  const { id } = req.params;
  const { dias_acceso_permitidos } = req.body;

  if (!dias_acceso_permitidos || typeof dias_acceso_permitidos !== 'number' || dias_acceso_permitidos <= 0) {
    return res.status(400).json({ mensaje: 'Los días de acceso permitidos deben ser un número positivo' });
  }

  try {
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + dias_acceso_permitidos);

    const result = await db.query(
      `UPDATE restaurantes 
       SET estado = 'aprobado', suscripcion_activa = true, dias_acceso_permitidos = $1, fecha_vencimiento = $2 
       WHERE id = $3 
       RETURNING id, nombre_negocio, estado, suscripcion_activa, fecha_vencimiento, dias_acceso_permitidos`,
      [dias_acceso_permitidos, fechaVencimiento, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Restaurante no encontrado' });
    }

    // Purgar caché en Redis para asegurar la disponibilidad del menú
    await redisClient.del(`cache:menu:${id}`);

    // Registrar en Audit Logs
    const adminId = req.user.id;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    await db.query(
      'INSERT INTO audit_logs (usuario_id, accion, detalles, ip_address) VALUES ($1, $2, $3, $4)',
      [
        adminId, 
        'APROBAR_RESTAURANTE', 
        JSON.stringify({ 
          restaurante_id: id, 
          nombre_negocio: result.rows[0].nombre_negocio,
          dias_acceso_permitidos, 
          fecha_vencimiento: fechaVencimiento 
        }), 
        ipAddress
      ]
    ).catch(err => console.error('Error al insertar log de auditoría (approve):', err));

    res.json({
      mensaje: 'Restaurante aprobado con éxito',
      restaurante: result.rows[0]
    });
  } catch (error) {
    console.error('Error al aprobar restaurante:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Cancelar acceso del restaurante (The Kill Switch)
const suspendRestaurant = async (req, res) => {
  const { id } = req.params;

  try {
    // Paso A: Invalidation del refresh_token y actualización del estado del restaurante
    // 1. Cambiar estado a 'suspendido' y suscripcion_activa a false
    const restResult = await db.query(
      `UPDATE restaurantes 
       SET estado = 'suspendido', suscripcion_activa = false 
       WHERE id = $1 
       RETURNING id, nombre_negocio, estado, suscripcion_activa`,
      [id]
    );

    if (restResult.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Restaurante no encontrado' });
    }

    // 2. Destrucción de Sesión: Eliminar refresh tokens
    await db.query('DELETE FROM refresh_tokens WHERE restaurante_id = $1', [id]);

    // Paso B: Pausado Masivo del Menú Público
    // 1. Modificación en Lote (Bulk Update) de platillos del restaurante a activo = false
    await db.query('UPDATE platillos SET activo = false WHERE restaurante_id = $1', [id]);

    // 2. Purga absoluta de caché en Redis
    await redisClient.del(`cache:menu:${id}`);

    // Registrar en Audit Logs
    const adminId = req.user.id;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    await db.query(
      'INSERT INTO audit_logs (usuario_id, accion, detalles, ip_address) VALUES ($1, $2, $3, $4)',
      [
        adminId, 
        'SUSPENDER_RESTAURANTE', 
        JSON.stringify({ 
          restaurante_id: id, 
          nombre_negocio: restResult.rows[0].nombre_negocio 
        }), 
        ipAddress
      ]
    ).catch(err => console.error('Error al insertar log de auditoría (suspend):', err));

    res.json({
      mensaje: 'Acceso cancelado exitosamente (Kill Switch ejecutado)',
      restaurante: restResult.rows[0]
    });
  } catch (error) {
    console.error('Error al suspender restaurante:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// Mantener la función original por compatibilidad o propósitos de legado
const updateRestaurantStatus = async (req, res) => {
  const { id } = req.params;
  const { suscripcion_activa } = req.body;

  if (typeof suscripcion_activa !== 'boolean') {
    return res.status(400).json({ mensaje: 'El campo suscripcion_activa es obligatorio y debe ser booleano' });
  }

  try {
    const result = await db.query(
      'UPDATE restaurantes SET suscripcion_activa = $1, estado = $2 WHERE id = $3 RETURNING id, nombre_negocio, suscripcion_activa, estado',
      [suscripcion_activa, suscripcion_activa ? 'aprobado' : 'suspendido', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Restaurante no encontrado' });
    }

    await redisClient.del(`cache:menu:${id}`);

    res.json({
      mensaje: 'Estado del restaurante actualizado y caché purgado',
      restaurante: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar estado de restaurante:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  getRestaurants,
  approveRestaurant,
  suspendRestaurant,
  updateRestaurantStatus,
};
