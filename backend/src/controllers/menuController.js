const db = require('../config/db');
const redisClient = require('../config/redis');
const axios = require('axios');

const createDish = async (req, res) => {
  const { nombre, descripcion, precio, categoria, url_imagen, ingredientes } = req.body;
  const restaurante_id = req.user.id; // Extraído del token por authMiddleware

  if (!nombre || !precio) {
    return res.status(400).json({ mensaje: 'Nombre y precio son obligatorios' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insertar el platillo
    const dishRes = await client.query(
      `INSERT INTO platillos (restaurante_id, nombre, descripcion, precio, categoria, url_imagen, estado_ia) 
       VALUES ($1, $2, $3, $4, $5, $6, 'procesando') 
       RETURNING id`,
      [restaurante_id, nombre, descripcion, precio, categoria, url_imagen]
    );

    const platillo_id = dishRes.rows[0].id;

    // 2. Manejar ingredientes si se proporcionan
    if (ingredientes && Array.isArray(ingredientes)) {
      for (const ingrediente_id of ingredientes) {
        await client.query(
          'INSERT INTO platillo_ingredientes (platillo_id, ingrediente_id) VALUES ($1, $2)',
          [platillo_id, ingrediente_id]
        );
      }
    }

    await client.query('COMMIT');

    // 3. Llamada asíncrona al motor de IA (sin await para no bloquear la respuesta)
    const texto_descriptivo = `${nombre} ${descripcion || ''}`;
    axios.post(`${process.env.AI_ENGINE_URL || 'http://ai-engine:8000'}/vectorize`, {
      id_platillo: platillo_id,
      texto_descriptivo: texto_descriptivo.trim()
    }).catch(err => console.error('Error al llamar al AI Engine:', err.message));

    // 4. Invalidar caché en Redis
    await redisClient.del(`cache:menu:${restaurante_id}`);
    await redisClient.del('cache:busquedas_globales');

    res.status(201).json({
      mensaje: 'Platillo creado y enviado a vectorización',
      platillo_id
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear platillo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  } finally {
    client.release();
  }
};

module.exports = {
  createDish,
};
