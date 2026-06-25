const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { nombre_negocio, email, password, plan, nombre_dueño } = req.body;

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
    const salt = await bcrypt.genSalt(8);
    const password_hash = await bcrypt.hash(password, salt);

    // 3. Insertar restaurante
    const newRest = await db.query(
      'INSERT INTO restaurantes (nombre_negocio, email, password_hash, plan, nombre_dueno) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [nombre_negocio, email, password_hash, plan || 'basico', nombre_dueño || '']
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
    // 1. Buscar usuario (con índice activo en DB)
    const result = await db.query('SELECT id, password_hash, rol, suscripcion_activa FROM restaurantes WHERE email = $1 LIMIT 1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // 2. Comparar password (Costo optimizado a 8 rounds en registro)
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // 3. Verificar suscripción (Solo para restaurantes)
    if (!user.suscripcion_activa && user.rol !== 'SUPER_ADMIN') {
      return res.status(403).json({ mensaje: 'Suscripción inactiva. Contacte al administrador.' });
    }

    // 4. Generar tokens en paralelo para reducir latencia
    const [accessToken, refreshToken] = await Promise.all([
      jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '15m' }),
      jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
    ]);

    // 5. Guardar Refresh Token de forma asíncrona (no bloqueante para la respuesta al cliente)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    db.query(
      'INSERT INTO refresh_tokens (restaurante_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    ).catch(err => console.error('Error guardando refresh token (background):', err));

    // 6. Responder inmediatamente
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
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
