const multer = require('multer');
const { S3 } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const s3Client = require('../config/s3');
const sharp = require('sharp');
require('dotenv').config();

// Usar memoria para procesar la imagen antes de subirla
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite inicial de subida 5MB
  }
});

// Middleware para procesar y optimizar la imagen
const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();

  const bucketName = process.env.S3_BUCKET_NAME;
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

  const isPlaceholderCredential = (value) => !value || value === 'your_access_key' || value === 'your_secret_key' || value.toLowerCase().includes('your_');

  if (!bucketName || isPlaceholderCredential(accessKey) || isPlaceholderCredential(secretKey)) {
    console.warn('S3 no está configurado correctamente. Se omite la subida de imagen y se continúa sin URL de imagen.');
    req.file.location = undefined;
    return next();
  }

  try {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `dishes/${uniqueSuffix}.webp`;

    // 1. Procesar con SHARP: Convertir a WebP y comprimir agresivamente para buscar ~30KB
    // Redimensionamos a un tamaño razonable para menús (ej. 800px) para bajar peso
    const optimizedBuffer = await sharp(req.file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 60, effort: 6 }) // Calidad baja/media para asegurar < 30KB
      .toBuffer();

    // 2. Subir a S3 manualmente usando @aws-sdk/lib-storage
    const parallelUploadS3 = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: fileName,
        Body: optimizedBuffer,
        ContentType: 'image/webp',
        ACL: 'public-read'
      },
    });

    const result = await parallelUploadS3.done();

    // 3. Adjuntar la ubicación al objeto req para el controlador
    req.file.location = result.Location;
    req.file.key = fileName;
    
    next();
  } catch (error) {
    console.error('Error optimizando imagen:', error);
    res.status(500).json({ mensaje: 'Error al procesar la imagen' });
  }
};

module.exports = { upload, optimizeImage };
