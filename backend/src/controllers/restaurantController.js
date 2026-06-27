const db = require('../config/db');
const redisClient = require('../config/redis');
const QRCode = require('qrcode');

const sanitizeText = (text) => {
  if (typeof text !== 'string') return text;
  return text.replace(/<script[^>]*>([\s\S]*?)<\/script>|<iframe[^>]*>([\s\S]*?)<\/iframe>|<object[^>]*>([\s\S]*?)<\/object>|javascript:/gi, '').trim();
};

const generateQR = async (req, res) => {
  try {
    // 1. Obtener restaurante_id del token (inyectado por authMiddleware)
    const restaurante_id = req.user.id;

    // 2. Construir URL pública del menú
    const baseUrl = process.env.PUBLIC_MENU_URL || 'https://mexxican.mx/menu/';
    const url_menu = `${baseUrl}${restaurante_id}`;

    // 3. Generar imagen QR en Base64
    const qr_base64 = await QRCode.toDataURL(url_menu, {
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      width: 500,
      margin: 2
    });

    // 4. Responder
    res.json({
      url_menu,
      qr_base64
    });

  } catch (error) {
    console.error('Error al generar QR:', error);
    res.status(500).json({ mensaje: 'Error interno al generar el código QR' });
  }
};

const updateTheme = async (req, res) => {
  const restaurante_id = req.user.id;
  const {
    logo_url,
    banner_url,
    color_primario,
    color_fondo,
    fuente_familia,
    layout_type,
    banner_promocional_activo,
    banner_promocional_texto,
    config_diseno
  } = req.body;

  let sanitizedBannerTexto = banner_promocional_texto;
  if (sanitizedBannerTexto) {
    sanitizedBannerTexto = sanitizeText(sanitizedBannerTexto);
  }

  let sanitizedConfigDiseno = config_diseno;
  if (sanitizedConfigDiseno && typeof sanitizedConfigDiseno === 'object') {
    if (sanitizedConfigDiseno.informacion && typeof sanitizedConfigDiseno.informacion === 'object') {
      if (sanitizedConfigDiseno.informacion.direccion) {
        sanitizedConfigDiseno.informacion.direccion = sanitizeText(sanitizedConfigDiseno.informacion.direccion);
      }
      if (sanitizedConfigDiseno.informacion.ambiente) {
        sanitizedConfigDiseno.informacion.ambiente = sanitizeText(sanitizedConfigDiseno.informacion.ambiente);
      }
    }
  }

  try {
    // 2. Upsert (Insertar o Actualizar) la configuración del tema
    const query = `
      INSERT INTO configuracion_tema (
        restaurante_id, logo_url, banner_url, color_primario, color_fondo, 
        fuente_familia, layout_type, banner_promocional_activo, banner_promocional_texto, config_diseno
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (restaurante_id) DO UPDATE SET
        logo_url = EXCLUDED.logo_url,
        banner_url = EXCLUDED.banner_url,
        color_primario = EXCLUDED.color_primario,
        color_fondo = EXCLUDED.color_fondo,
        fuente_familia = EXCLUDED.fuente_familia,
        layout_type = EXCLUDED.layout_type,
        banner_promocional_activo = EXCLUDED.banner_promocional_activo,
        banner_promocional_texto = EXCLUDED.banner_promocional_texto,
        config_diseno = EXCLUDED.config_diseno,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const values = [
      restaurante_id,
      logo_url,
      banner_url,
      color_primario,
      color_fondo,
      fuente_familia,
      layout_type,
      banner_promocional_activo,
      sanitizedBannerTexto,
      sanitizedConfigDiseno ? JSON.stringify(sanitizedConfigDiseno) : '{}'
    ];

    const result = await db.query(query, values);

    // 3. Invalidar caché del menú para que los cambios se vean reflejados instantáneamente
    await redisClient.del(`cache:menu:${restaurante_id}`);
    
    // Invalidar también la caché asociada al slug para evitar desincronizaciones en la vista pública
    const restSlugQuery = await db.query('SELECT slug FROM restaurantes WHERE id = $1', [restaurante_id]);
    if (restSlugQuery.rows.length > 0 && restSlugQuery.rows[0].slug) {
      await redisClient.del(`cache:menu:${restSlugQuery.rows[0].slug}`);
    }

    res.json({
      mensaje: 'Configuración de marca actualizada correctamente',
      tema: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar tema:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor al guardar la configuración' });
  }
};

const getRestaurantInfo = async (req, res) => {
  const restaurante_id = req.user.id;

  try {
    const result = await db.query(
      `SELECT r.id, r.nombre_negocio, r.email, r.plan, r.suscripcion_activa, r.estado, r.fecha_vencimiento, r.nombre_dueno as "nombre_dueño", r.slug,
              t.logo_url, t.banner_url, t.color_primario, t.color_fondo, 
              t.fuente_familia, t.layout_type, t.banner_promocional_activo, t.banner_promocional_texto, t.config_diseno
       FROM restaurantes r
       LEFT JOIN configuracion_tema t ON r.id = t.restaurante_id
       WHERE r.id = $1`,
      [restaurante_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Restaurante no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener info del restaurante:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

const uploadBrandingImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se subió ninguna imagen' });
    }

    let url_imagen = req.file.location;

    if (process.env.CLOUDFRONT_DOMAIN) {
      const s3Url = new URL(req.file.location);
      url_imagen = `${process.env.CLOUDFRONT_DOMAIN}${s3Url.pathname}`;
    }

    res.json({
      mensaje: 'Imagen subida correctamente',
      url_imagen
    });
  } catch (error) {
    console.error('Error al procesar la imagen de branding:', error);
    res.status(500).json({ mensaje: 'Error interno al procesar la imagen' });
  }
};

module.exports = {
  generateQR,
  updateTheme,
  getRestaurantInfo,
  uploadBrandingImage
};
