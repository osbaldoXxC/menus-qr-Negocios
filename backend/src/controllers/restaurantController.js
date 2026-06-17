const db = require('../config/db');
const redisClient = require('../config/redis');
const QRCode = require('qrcode');

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
    banner_promocional_texto
  } = req.body;

  try {
    // 1. Verificar si el restaurante es Premium (opcional, según lógica de negocio)
    const restRes = await db.query('SELECT plan FROM restaurantes WHERE id = $1', [restaurante_id]);
    if (restRes.rows[0].plan !== 'premium' && req.user.rol !== 'SUPER_ADMIN') {
      return res.status(403).json({ mensaje: 'Esta funcionalidad solo está disponible para planes Premium' });
    }

    // 2. Upsert (Insertar o Actualizar) la configuración del tema
    const query = `
      INSERT INTO configuracion_tema (
        restaurante_id, logo_url, banner_url, color_primario, color_fondo, 
        fuente_familia, layout_type, banner_promocional_activo, banner_promocional_texto
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (restaurante_id) DO UPDATE SET
        logo_url = EXCLUDED.logo_url,
        banner_url = EXCLUDED.banner_url,
        color_primario = EXCLUDED.color_primario,
        color_fondo = EXCLUDED.color_fondo,
        fuente_familia = EXCLUDED.fuente_familia,
        layout_type = EXCLUDED.layout_type,
        banner_promocional_activo = EXCLUDED.banner_promocional_activo,
        banner_promocional_texto = EXCLUDED.banner_promocional_texto,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const values = [
      restaurante_id, logo_url, banner_url, color_primario, color_fondo,
      fuente_familia, layout_type, banner_promocional_activo, banner_promocional_texto
    ];

    const result = await db.query(query, values);

    // 3. Invalidar caché del menú para que los cambios se vean reflejados instantáneamente
    await redisClient.del(`cache:menu:${restaurante_id}`);

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
      `SELECT r.id, r.nombre_negocio, r.email, r.plan, r.suscripcion_activa, r.nombre_dueno as "nombre_dueño",
              t.logo_url, t.banner_url, t.color_primario, t.color_fondo, 
              t.fuente_familia, t.layout_type, t.banner_promocional_activo, t.banner_promocional_texto
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

module.exports = {
  generateQR,
  updateTheme,
  getRestaurantInfo
};
