const express = require('express');
const router = express.Router();
const { createDish } = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { upload, optimizeImage } = require('../middleware/uploadMiddleware');

// POST /api/menu/platillos
// Solo accesible por Restaurantes y Super Admins
// Flujo: Autenticar -> Verificar Rol -> Recibir Archivo -> Optimizar y Subir a S3 -> Crear en DB
router.post('/platillos', 
  authMiddleware, 
  roleMiddleware(['restaurante', 'super_admin']), 
  upload.single('imagen'), 
  optimizeImage,
  createDish
);

module.exports = router;
