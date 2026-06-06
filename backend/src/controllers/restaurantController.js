const QRCode = require('qrcode');

const generateQR = async (req, res) => {
  try {
    // 1. Obtener restaurante_id del token (inyectado por authMiddleware)
    const restaurante_id = req.user.id;

    // 2. Construir URL pública del menú
    // En producción esto debería ser el dominio real
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

module.exports = {
  generateQR,
};
