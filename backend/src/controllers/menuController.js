const db = require('../config/db');
const redisClient = require('../config/redis');
const axios = require('axios');

const createDish = async (req, res) => {
  const { nombre, descripcion, precio, categoria_id, categoria, ingredientes, activo } = req.body;
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

  let final_categoria_id = categoria_id;

  // Si envían nombre de categoría en lugar de ID (como en el frontend actual)
  if (!final_categoria_id && categoria) {
    try {
      // Buscar o crear la categoría para este restaurante
      const catRes = await db.query(
        'INSERT INTO categorias_restaurante (restaurante_id, nombre) VALUES ($1, $2) ON CONFLICT (restaurante_id, nombre) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id',
        [restaurante_id, categoria]
      );
      final_categoria_id = catRes.rows[0].id;
    } catch (err) {
      console.error('Error al manejar categoría:', err);
    }
  }

  // Validar que la categoría pertenezca al restaurante (si se pasó por ID)
  if (final_categoria_id && !categoria) {
    const catCheck = await db.query(
      'SELECT id FROM categorias_restaurante WHERE id = $1 AND restaurante_id = $2',
      [final_categoria_id, restaurante_id]
    );
    if (catCheck.rows.length === 0) {
      return res.status(400).json({ mensaje: 'La categoría seleccionada no es válida para tu restaurante' });
    }
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insertar el platillo
    const dishRes = await client.query(
      `INSERT INTO platillos (restaurante_id, nombre, descripcion, precio, categoria_id, url_imagen, activo, estado_ia) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente') 
       RETURNING id`,
      [restaurante_id, nombre, descripcion, precio, final_categoria_id, url_imagen, activo !== undefined ? activo : true]
    );

    const platillo_id = dishRes.rows[0].id;

    // 2. Manejar ingredientes
    if (ingredientes && Array.isArray(ingredientes)) {
      for (const ingrediente_id of ingredientes) {
        await client.query(
          'INSERT INTO receta_platillo (platillo_id, ingrediente_id) VALUES ($1, $2)',
          [platillo_id, ingrediente_id]
        );
      }
    }

    await client.query('COMMIT');

    // 3. Invalidar caché
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

const updateDish = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, categoria_id, ingredientes, activo } = req.body;
  const restaurante_id = req.user.id;

  // URL de imagen (si se sube nueva)
  let url_imagen = req.file ? req.file.location : req.body.url_imagen;

  if (req.file && process.env.CLOUDFRONT_DOMAIN) {
    const s3Url = new URL(req.file.location);
    url_imagen = `${process.env.CLOUDFRONT_DOMAIN}${s3Url.pathname}`;
  }

  // Validar categoría
  if (categoria_id) {
    const catCheck = await db.query(
      'SELECT id FROM categorias_restaurante WHERE id = $1 AND restaurante_id = $2',
      [categoria_id, restaurante_id]
    );
    if (catCheck.rows.length === 0) {
      return res.status(400).json({ mensaje: 'La categoría seleccionada no es válida para tu restaurante' });
    }
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Actualizar platillo
    const updateQuery = `
      UPDATE platillos 
      SET nombre = COALESCE($1, nombre),
          descripcion = COALESCE($2, descripcion),
          precio = COALESCE($3, precio),
          categoria_id = COALESCE($4, categoria_id),
          url_imagen = COALESCE($5, url_imagen),
          activo = COALESCE($6, activo)
      WHERE id = $7 AND restaurante_id = $8
      RETURNING id
    `;
    const updateValues = [nombre, descripcion, precio, categoria_id, url_imagen, activo, id, restaurante_id];
    
    const dishRes = await client.query(updateQuery, updateValues);

    if (dishRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensaje: 'Platillo no encontrado o no tienes permisos' });
    }

    // 2. Actualizar ingredientes (opcional: solo si se envían)
    if (ingredientes && Array.isArray(ingredientes)) {
      await client.query('DELETE FROM receta_platillo WHERE platillo_id = $1', [id]);
      for (const ingrediente_id of ingredientes) {
        await client.query(
          'INSERT INTO receta_platillo (platillo_id, ingrediente_id) VALUES ($1, $2)',
          [id, ingrediente_id]
        );
      }
    }

    await client.query('COMMIT');
    await redisClient.del(`cache:menu:${restaurante_id}`);

    res.json({ mensaje: 'Platillo actualizado correctamente' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar platillo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  } finally {
    client.release();
  }
};

const deleteDish = async (req, res) => {
  const { id } = req.params;
  const restaurante_id = req.user.id;

  try {
    const result = await db.query(
      'DELETE FROM platillos WHERE id = $1 AND restaurante_id = $2 RETURNING id',
      [id, restaurante_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Platillo no encontrado o no tienes permisos' });
    }

    await redisClient.del(`cache:menu:${restaurante_id}`);

    res.json({ mensaje: 'Platillo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar platillo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
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

    // 3. Obtener platillos con sus categorías ordenadas (solo activos)
    const dishesRes = await db.query(
      `SELECT p.id, p.nombre, p.descripcion, p.precio, p.url_imagen, c.nombre as categoria_nombre, c.orden as categoria_orden
       FROM platillos p
       LEFT JOIN categorias_restaurante c ON p.categoria_id = c.id
       WHERE p.restaurante_id = $1 AND p.activo = true
       ORDER BY c.orden ASC, c.nombre ASC, p.nombre ASC`,
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

const getDishes = async (req, res) => {
  const restaurante_id = req.user.id;

  try {
    const result = await db.query(
      `SELECT p.id, p.nombre, p.descripcion, p.precio, p.url_imagen, p.estado_ia, p.activo, c.nombre as categoria_nombre
       FROM platillos p
       LEFT JOIN categorias_restaurante c ON p.categoria_id = c.id
       WHERE p.restaurante_id = $1
       ORDER BY p.created_at DESC`,
      [restaurante_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener platillos:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  createDish,
  updateDish,
  deleteDish,
  getPublicMenu,
  getDishes
};
