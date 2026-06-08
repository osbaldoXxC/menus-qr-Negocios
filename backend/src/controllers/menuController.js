const db = require('../config/db');
const redisClient = require('../config/redis');
const axios = require('axios');

const createDish = async (req, res) => {
  const { nombre, descripcion, precio, categoria_id, ingredientes } = req.body;
  const restaurante_id = req.user.id;
  
  // La URL de la imagen vendrá de multer-s3 si se subió un archivo
  let url_imagen = req.file ? req.file.location : req.body.url_imagen;

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

    // 1. Insertar el platillo (Usando categoria_id según esquema 3FN)
    const dishRes = await client.query(
      `INSERT INTO platillos (restaurante_id, nombre, descripcion, precio, categoria_id, url_imagen, estado_ia) 
       VALUES ($1, $2, $3, $4, $5, $6, 'pendiente') 
       RETURNING id`,
      [restaurante_id, nombre, descripcion, precio, categoria_id, url_imagen]
    );

    const platillo_id = dishRes.rows[0].id;

    // 2. Manejar ingredientes (Tabla receta_platillo en 3FN)
    if (ingredientes && Array.isArray(ingredientes)) {
      for (const ingrediente_id of ingredientes) {
        await client.query(
          'INSERT INTO receta_platillo (platillo_id, ingrediente_id) VALUES ($1, $2)',
          [platillo_id, ingrediente_id]
        );
      }
    }

    await client.query('COMMIT');

    // 3. Llamada asíncrona al motor de IA (DESHABILITADO TEMPORALMENTE - ÉPICA 7)
    /*
    const texto_descriptivo = `${nombre} ${descripcion || ''}`;
    axios.post(`${process.env.AI_ENGINE_URL || 'http://ai-engine:8000'}/vectorize`, {
      id_platillo: platillo_id,
      texto_descriptivo: texto_descriptivo.trim()
    }).catch(err => console.error('Error al llamar al AI Engine:', err.message));
    */

    // 4. Invalidar caché
    await redisClient.del(`cache:menu:${restaurante_id}`);
    await redisClient.del('cache:busquedas_globales');

    res.status(201).json({
      mensaje: 'Platillo creado correctamente',
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
    // 1. Redis Cache
    const cachedMenu = await redisClient.get(cacheKey);
    if (cachedMenu) {
      return res.json(JSON.parse(cachedMenu));
    }

    // 2. PostgreSQL - Obtener info del restaurante y su tema
    const restRes = await db.query(
      `SELECT r.nombre_negocio, r.suscripcion_activa, 
              t.logo_url, t.banner_url, t.color_primario, t.color_fondo, 
              t.fuente_familia, t.layout_type, t.banner_promocional_activo, t.banner_promocional_texto
       FROM restaurantes r
       LEFT JOIN configuracion_tema t ON r.id = t.restaurante_id
       WHERE r.id = $1`,
      [restaurant_id]
    );

    if (restRes.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Restaurante no encontrado' });
    }

    const restInfo = restRes.rows[0];

    if (!restInfo.suscripcion_activa) {
      return res.status(403).json({ mensaje: 'Restaurante no disponible temporalmente' });
    }

    // 3. Obtener platillos con sus categorías
    const dishesRes = await db.query(
      `SELECT p.id, p.nombre, p.descripcion, p.precio, p.url_imagen, c.nombre as categoria_nombre
       FROM platillos p
       LEFT JOIN categorias_catalogo c ON p.categoria_id = c.id
       WHERE p.restaurante_id = $1
       ORDER BY c.nombre, p.nombre`,
      [restaurant_id]
    );

    // 4. Estructurar la respuesta
    const response = {
      restaurante: {
        nombre: restInfo.nombre_negocio,
        tema: {
          logo_url: restInfo.logo_url,
          banner_url: restInfo.banner_url,
          color_primario: restInfo.color_primario,
          color_fondo: restInfo.color_fondo,
          fuente_familia: restInfo.fuente_familia,
          layout_type: restInfo.layout_type,
          banner_promocional_activo: restInfo.banner_promocional_activo,
          banner_promocional_texto: restInfo.banner_promocional_texto
        }
      },
      categorias: []
    };

    // Agrupar por categorías
    const categoriesMap = {};
    dishesRes.rows.forEach(dish => {
      const catName = dish.categoria_nombre || 'General';
      if (!categoriesMap[catName]) {
        categoriesMap[catName] = {
          nombre: catName,
          platillos: []
        };
        response.categorias.push(categoriesMap[catName]);
      }
      response.categorias.find(c => c.nombre === catName).platillos.push({
        id: dish.id,
        nombre: dish.nombre,
        descripcion: dish.descripcion,
        precio: dish.precio,
        url_imagen: dish.url_imagen
      });
    });

    // 5. Guardar en Redis (4h)
    await redisClient.setEx(cacheKey, 14400, JSON.stringify(response));

    res.json(response);

  } catch (error) {
    console.error('Error al obtener menú público:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  createDish,
  getPublicMenu,
};
