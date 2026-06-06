const db = require('../config/db');
const redisClient = require('../config/redis');
const axios = require('axios');

const createDish = async (req, res) => {
  const { nombre, descripcion, precio, categoria, ingredientes } = req.body;
  const restaurante_id = req.user.id;
  
  // La URL de la imagen vendrá de multer-s3 si se subió un archivo
  // Si no hay archivo, se puede permitir una URL externa o dejarlo vacío
  let url_imagen = req.file ? req.file.location : req.body.url_imagen;

  // Si existe CLOUDFRONT_DOMAIN, reemplazar el host de S3 por el de CloudFront para mejores tiempos de carga
  if (req.file && process.env.CLOUDFRONT_DOMAIN) {
    const s3Url = new URL(req.file.location);
    url_imagen = `${process.env.CLOUDFRONT_DOMAIN}${s3Url.pathname}`;
  }

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

const getPublicMenu = async (req, res) => {
  const { restaurant_id } = req.params;
  const cacheKey = `cache:menu:${restaurant_id}`;

  try {
    // 1. Intentar obtener de Redis (Cache Hit)
    const cachedMenu = await redisClient.get(cacheKey);
    if (cachedMenu) {
      console.log(`Cache Hit for restaurant: ${restaurant_id}`);
      return res.json(JSON.parse(cachedMenu));
    }

    // 2. Si no hay en caché (Cache Miss), consultar PostgreSQL
    console.log(`Cache Miss for restaurant: ${restaurant_id}`);
    
    // Validar primero que el restaurante exista y esté activo
    const restRes = await db.query(
      'SELECT estado_activo FROM restaurantes WHERE id = $1',
      [restaurant_id]
    );

    if (restRes.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Restaurante no encontrado' });
    }

    if (!restRes.rows[0].estado_activo) {
      return res.status(403).json({ mensaje: 'Restaurante no disponible temporalmente' });
    }

    // Obtener los platillos
    const dishesRes = await db.query(
      'SELECT id, nombre, descripcion, precio, categoria, url_imagen FROM platillos WHERE restaurante_id = $1',
      [restaurant_id]
    );

    const menuData = dishesRes.rows;

    // 3. Guardar en Redis con TTL de 4 horas (14400 segundos)
    await redisClient.setEx(cacheKey, 14400, JSON.stringify(menuData));

    res.json(menuData);

  } catch (error) {
    console.error('Error al obtener menú público:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  createDish,
  getPublicMenu,
};
