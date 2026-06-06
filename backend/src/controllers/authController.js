const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { nombre_negocio, email, password, plan } = req.body;

  if (!nombre_negocio || !email || !password) {
    return res.status(400).json({ mensaje: 'Nombre de negocio, email y contraseña son requeridos' });
  }

  try {
    // 1. Validar email único
    const userCheck = await db.query('SELECT id FROM restaurantes WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ mensaje: 'El email ya está registrado' });
    }

    // 2. Hashear password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 3. Insertar restaurante
    const newRest = await db.query(
      'INSERT INTO restaurantes (nombre_negocio, email, password_hash, plan) VALUES ($1, $2, $3, $4) RETURNING id',
      [nombre_negocio, email, password_hash, plan || 'basico']
    );

    res.status(201).json({
      mensaje: 'Registrado con éxito',
      restaurante_id: newRest.rows[0].id
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ mensaje: 'Email y contraseña son requeridos' });
  }

  try {
    // 1. Buscar usuario
    const result = await db.query('SELECT * FROM restaurantes WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // 2. Comparar password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // 3. Verificar suscripción (si no es SUPER_ADMIN)
    if (!user.estado_activo && user.rol !== 'SUPER_ADMIN') {
      return res.status(403).json({ mensaje: 'Suscripción inactiva. Contacte al administrador.' });
    }

    // 4. Generar Access Token (15 min)
    const accessToken = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // 5. Generar Refresh Token (7 días)
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // 6. Guardar Refresh Token en DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await db.query(
      'INSERT INTO refresh_tokens (restaurante_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    // 7. Responder con Cookie y JSON
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    res.json({
      access_token: accessToken,
      rol: user.rol,
      restaurante_id: user.id
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  register,
  login
};
