const db = require('../config/db');
const redisClient = require('../config/redis');
const axios = require('axios');
const s3Client = require('../config/s3');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const sanitizeText = (text) => {
  if (typeof text !== 'string') return text;
  return text.replace(/<script[^>]*>([\s\S]*?)<\/script>|<iframe[^>]*>([\s\S]*?)<\/iframe>|<object[^>]*>([\s\S]*?)<\/object>|javascript:/gi, '').trim();
};

const createDish = async (req, res) => {
  let { 
    nombre, descripcion, precio, categoria_id, categoria, 
    ingredientes_principales, complementos, activo,
    nivel_picante, tamano_porcion_id, cocinas
  } = req.body;
  const restaurante_id = req.user.id;
  
  nombre = sanitizeText(nombre);
  descripcion = sanitizeText(descripcion);
  
  // Parsear JSON strings si vienen de FormData
  try {
    if (typeof ingredientes_principales === 'string') ingredientes_principales = JSON.parse(ingredientes_principales);
    if (typeof complementos === 'string') complementos = JSON.parse(complementos);
    if (typeof cocinas === 'string') cocinas = JSON.parse(cocinas);
  } catch (e) {
    console.warn('Error parseando ingredientes/complementos/cocinas:', e);
  }

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

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insertar el platillo
    const dishRes = await client.query(
      `INSERT INTO platillos (restaurante_id, nombre, descripcion, precio, categoria_id, url_imagen, activo, estado_ia, ingredientes_principales, complementos, nivel_picante, tamano_porcion_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente', $8, $9, $10, $11) 
       RETURNING id`,
      [
        restaurante_id, 
        nombre, 
        descripcion, 
        precio, 
        final_categoria_id, 
        url_imagen, 
        activo !== undefined ? (activo === 'true' || activo === true) : true,
        JSON.stringify(ingredientes_principales || []),
        JSON.stringify(complementos || []),
        nivel_picante !== undefined ? parseInt(nivel_picante) : 0,
        tamano_porcion_id || null
      ]
    );

    const platillo_id = dishRes.rows[0].id;

    // 2. Insertar asociaciones de tipo de cocina en platillo_cocina
    if (cocinas && Array.isArray(cocinas) && cocinas.length > 0) {
      for (const cocina of cocinas) {
        let cocinaId = cocina;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cocina);

        if (!isUUID) {
          // Si no es un UUID, asumimos que es una cocina personalizada (texto)
          const cleanName = sanitizeText(cocina);
          const cocinaRes = await client.query(
            'INSERT INTO cocinas_catalogo (nombre) VALUES ($1) ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id',
            [cleanName]
          );
          cocinaId = cocinaRes.rows[0].id;
        }

        await client.query(
          'INSERT INTO platillo_cocina (platillo_id, cocina_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [platillo_id, cocinaId]
        );
      }
    }

    await client.query('COMMIT');

    // 3. Invalidar caché
    await redisClient.del(`cache:menu:${restaurante_id}`);
    const restSlugQuery = await db.query('SELECT slug FROM restaurantes WHERE id = $1', [restaurante_id]);
    if (restSlugQuery.rows.length > 0 && restSlugQuery.rows[0].slug) {
      await redisClient.del(`cache:menu:${restSlugQuery.rows[0].slug}`);
    }
    await redisClient.del('cache:busquedas_globales');

    res.status(201).json({
      mensaje: 'Platillo creado correctamente',
      platillo_id: platillo_id
    });

  } catch (error) {
    await client.query('ROLLBACK');
    
    // Rollback de imagen del sistema de almacenamiento
    if (req.file && req.file.key) {
      try {
        if (process.env.S3_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID) {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: req.file.key,
          });
          await s3Client.send(deleteCommand);
          console.log('Imagen eliminada de S3 debido a rollback de BD:', req.file.key);
        } else {
          const localPath = path.join(__dirname, '../../uploads/dishes', path.basename(req.file.location));
          if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
            console.log('Imagen local eliminada debido a rollback de BD:', localPath);
          }
        }
      } catch (rollbackError) {
        console.error('Error al realizar rollback de la imagen subida:', rollbackError);
      }
    }

    console.error('Error al crear platillo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  } finally {
    client.release();
  }
};

const updateDish = async (req, res) => {
  const { id } = req.params;
  let { 
    nombre, descripcion, precio, categoria_id, categoria,
    ingredientes_principales, complementos, activo,
    nivel_picante, tamano_porcion_id, cocinas
  } = req.body;
  const restaurante_id = req.user.id;

  if (nombre) nombre = sanitizeText(nombre);
  if (descripcion) descripcion = sanitizeText(descripcion);

  // Parsear JSON strings si vienen de FormData
  try {
    if (typeof ingredientes_principales === 'string') ingredientes_principales = JSON.parse(ingredientes_principales);
    if (typeof complementos === 'string') complementos = JSON.parse(complementos);
    if (typeof cocinas === 'string') cocinas = JSON.parse(cocinas);
  } catch (e) {
    console.warn('Error parseando ingredientes/complementos/cocinas en update:', e);
  }

  // URL de imagen (si se sube nueva)
  let url_imagen = req.file ? req.file.location : req.body.url_imagen;

  if (req.file && process.env.CLOUDFRONT_DOMAIN) {
    const s3Url = new URL(req.file.location);
    url_imagen = `${process.env.CLOUDFRONT_DOMAIN}${s3Url.pathname}`;
  }

  // Manejar categoría por nombre si se envía
  let final_categoria_id = categoria_id;
  if (!final_categoria_id && categoria) {
    const catRes = await db.query(
      'INSERT INTO categorias_restaurante (restaurante_id, nombre) VALUES ($1, $2) ON CONFLICT (restaurante_id, nombre) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id',
      [restaurante_id, categoria]
    );
    final_categoria_id = catRes.rows[0].id;
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
          activo = COALESCE($6, activo),
          ingredientes_principales = COALESCE($7, ingredientes_principales),
          complementos = COALESCE($8, complementos),
          nivel_picante = COALESCE($9, nivel_picante),
          tamano_porcion_id = $10
      WHERE id = $11 AND restaurante_id = $12
      RETURNING id
    `;
    const updateValues = [
      nombre, 
      descripcion, 
      precio, 
      final_categoria_id, 
      url_imagen, 
      activo !== undefined ? (activo === 'true' || activo === true) : undefined, 
      ingredientes_principales ? JSON.stringify(ingredientes_principales) : null,
      complementos ? JSON.stringify(complementos) : null,
      nivel_picante !== undefined ? parseInt(nivel_picante) : undefined,
      tamano_porcion_id === undefined ? undefined : (tamano_porcion_id || null),
      id, 
      restaurante_id
    ];
    
    const dishRes = await client.query(updateQuery, updateValues);

    if (dishRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ mensaje: 'Platillo no encontrado o no tienes permisos' });
    }

    // 2. Actualizar cocinas (Eliminar anteriores y sembrar nuevas)
    if (cocinas && Array.isArray(cocinas)) {
      await client.query('DELETE FROM platillo_cocina WHERE platillo_id = $1', [id]);
      
      for (const cocina of cocinas) {
        let cocinaId = cocina;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cocina);

        if (!isUUID) {
          const cleanName = sanitizeText(cocina);
          const cocinaRes = await client.query(
            'INSERT INTO cocinas_catalogo (nombre) VALUES ($1) ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre RETURNING id',
            [cleanName]
          );
          cocinaId = cocinaRes.rows[0].id;
        }

        await client.query(
          'INSERT INTO platillo_cocina (platillo_id, cocina_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, cocinaId]
        );
      }
    }

    await client.query('COMMIT');
    await redisClient.del(`cache:menu:${restaurante_id}`);
    const restSlugQuery = await db.query('SELECT slug FROM restaurantes WHERE id = $1', [restaurante_id]);
    if (restSlugQuery.rows.length > 0 && restSlugQuery.rows[0].slug) {
      await redisClient.del(`cache:menu:${restSlugQuery.rows[0].slug}`);
    }

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
    const restSlugQuery2 = await db.query('SELECT slug FROM restaurantes WHERE id = $1', [restaurante_id]);
    if (restSlugQuery2.rows.length > 0 && restSlugQuery2.rows[0].slug) {
      await redisClient.del(`cache:menu:${restSlugQuery2.rows[0].slug}`);
    }

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

    // Comprobar si es UUID o Slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(restaurant_id);
    
    if (!isUUID) {
      const slugRegex = /^[a-z0-9-]{3,50}$/;
      if (!slugRegex.test(restaurant_id)) {
        return res.status(400).json({ mensaje: 'Identificador de restaurante o slug inválido' });
      }
    }

    const queryField = isUUID ? 'r.id' : 'r.slug';

    // 2. PostgreSQL - Obtener info del restaurante y su tema
    const restRes = await db.query(
      `SELECT r.id, r.nombre_negocio, r.suscripcion_activa, r.estado,
              t.logo_url, t.banner_url, t.color_primario, t.color_fondo, 
              t.fuente_familia, t.layout_type, t.banner_promocional_activo, t.banner_promocional_texto, t.config_diseno
       FROM restaurantes r
       LEFT JOIN configuracion_tema t ON r.id = t.restaurante_id
       WHERE ${queryField} = $1`,
      [restaurant_id]
    );

    if (restRes.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Restaurante no encontrado' });
    }

    const restInfo = restRes.rows[0];

    if (restInfo.estado !== 'aprobado' || !restInfo.suscripcion_activa) {
      return res.status(403).json({ mensaje: 'Menú no disponible o cuenta suspendida' });
    }

    const realRestaurantId = restInfo.id;

    // 3. Obtener platillos con sus categorías ordenadas (solo activos)
    const dishesRes = await db.query(
      `SELECT p.id, p.nombre, p.descripcion, p.precio, p.url_imagen, p.ingredientes_principales, p.complementos, p.nivel_picante, p.tamano_porcion_id,
              c.nombre as categoria_nombre, c.orden as categoria_orden, tp.nombre as tamano_porcion_nombre,
              COALESCE(json_agg(json_build_object('id', cc.id, 'nombre', cc.nombre)) FILTER (WHERE cc.id IS NOT NULL), '[]') as cocinas
       FROM platillos p
       LEFT JOIN categorias_restaurante c ON p.categoria_id = c.id
       LEFT JOIN tamanos_porcion tp ON p.tamano_porcion_id = tp.id
       LEFT JOIN platillo_cocina pc ON p.id = pc.platillo_id
       LEFT JOIN cocinas_catalogo cc ON pc.cocina_id = cc.id
       WHERE p.restaurante_id = $1 AND p.activo = true
       GROUP BY p.id, c.nombre, c.orden, tp.nombre
       ORDER BY c.orden ASC, c.nombre ASC, p.nombre ASC`,
      [realRestaurantId]
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
          banner_promocional_texto: restInfo.banner_promocional_texto,
          config_diseno: restInfo.config_diseno || {}
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
        url_imagen: dish.url_imagen,
        ingredientes_principales: dish.ingredientes_principales,
        complementos: dish.complementos,
        nivel_picante: dish.nivel_picante,
        tamano_porcion_id: dish.tamano_porcion_id,
        tamano_porcion_nombre: dish.tamano_porcion_nombre,
        cocinas: dish.cocinas
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
      `SELECT p.id, p.nombre, p.descripcion, p.precio, p.url_imagen, p.estado_ia, p.activo, p.ingredientes_principales, p.complementos, p.nivel_picante, p.tamano_porcion_id,
              c.nombre as categoria_nombre, tp.nombre as tamano_porcion_nombre,
              COALESCE(json_agg(json_build_object('id', cc.id, 'nombre', cc.nombre)) FILTER (WHERE cc.id IS NOT NULL), '[]') as cocinas
       FROM platillos p
       LEFT JOIN categorias_restaurante c ON p.categoria_id = c.id
       LEFT JOIN tamanos_porcion tp ON p.tamano_porcion_id = tp.id
       LEFT JOIN platillo_cocina pc ON p.id = pc.platillo_id
       LEFT JOIN cocinas_catalogo cc ON pc.cocina_id = cc.id
       WHERE p.restaurante_id = $1
       GROUP BY p.id, c.nombre, tp.nombre
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