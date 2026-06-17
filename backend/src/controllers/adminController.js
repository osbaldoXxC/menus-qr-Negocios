const db = require('../config/db');
const redisClient = require('../config/redis');

const updateRestaurantStatus = async (req, res) => {
  const { id } = req.params;
  const { suscripcion_activa } = req.body;

  if (typeof suscripcion_activa !== 'boolean') {
    return res.status(400).json({ mensaje: 'El campo suscripcion_activa es obligatorio y debe ser booleano' });
  }

  try {
    // 1. Actualizar el estado en la base de datos
    // Usamos 'suscripcion_activa' que es el nombre de la columna en nuestro nuevo esquema SQL
    const result = await db.query(
      'UPDATE restaurantes SET suscripcion_activa = $1 WHERE id = $2 RETURNING id, nombre_negocio, suscripcion_activa',
      [suscripcion_activa, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Restaurante no encontrado' });
    }

    // 2. Limpieza crítica de Redis: Invalidar el menú inmediatamente
    // Esto asegura que si el restaurante fue bloqueado, su menú deje de estar disponible en el caché
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
  updateRestaurantStatus,
};
