const express = require('express');
const router = express.Router();
const { register, login, refresh, callback, logout, forgotPassword, resetPassword } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login (Autenticación directa de credenciales)
router.post('/login', login);

// POST /api/auth/forgot-password (Solicitar recuperación de contraseña)
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password (Confirmar nueva contraseña con código)
router.post('/reset-password', resetPassword);

// GET /api/auth/callback (Callback de Cognito)
router.get('/callback', callback);

// GET /api/auth/logout (Cierre de sesión)
router.get('/logout', logout);

// POST /api/auth/refresh
router.post('/refresh', refresh);

module.exports = router;
