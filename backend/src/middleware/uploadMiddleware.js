const multer = require('multer');
const { S3 } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const s3Client = require('../config/s3');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
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

  try {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `${uniqueSuffix}.webp`;
    const s3Key = `dishes/${fileName}`;

    // 1. Procesar con SHARP: Convertir a WebP y comprimir
    const optimizedBuffer = await sharp(req.file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 60, effort: 6 })
      .toBuffer();

    // 2. Verificar si tenemos S3 configurado
    if (process.env.S3_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID) {
      // Subir a S3
      const parallelUploadS3 = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: s3Key,
          Body: optimizedBuffer,
          ContentType: 'image/webp',
          ACL: 'public-read'
        },
      });
      const result = await parallelUploadS3.done();
      req.file.location = result.Location;
      req.file.key = s3Key;
    } else {
      // Fallback a almacenamiento local si no hay S3 (Desarrollo)
      const localDir = path.join(__dirname, '../../uploads/dishes');
      
      // Crear directorio si no existe
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }

      const filePath = path.join(localDir, fileName);
      fs.writeFileSync(filePath, optimizedBuffer);
      
      // Construir URL local
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
      req.file.location = `${baseUrl}/uploads/dishes/${fileName}`;
      req.file.key = s3Key;
      console.log('Imagen guardada localmente en:', req.file.location);
    }
    
    next();
  } catch (error) {
    console.error('Error optimizando imagen:', error);
    res.status(500).json({ mensaje: 'Error al procesar la imagen' });
  }
};

module.exports = { upload, optimizeImage };
