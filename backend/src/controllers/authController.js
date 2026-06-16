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
    if (!user.suscripcion_activa && user.rol !== 'SUPER_ADMIN') {
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

const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ mensaje: 'Refresh token no proporcionado' });
  }

  try {
    // 1. Verificar el refresh token
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // 2. Verificar que existe en la BD y no ha expirado
    const result = await db.query(
      'SELECT * FROM refresh_tokens WHERE restaurante_id = $1 AND token = $2 AND expires_at > NOW()',
      [decoded.id, token]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ mensaje: 'Refresh token inválido o expirado' });
    }

    // 3. Obtener info actualizada del usuario
    const userRes = await db.query('SELECT id, rol FROM restaurantes WHERE id = $1', [decoded.id]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }

    const user = userRes.rows[0];

    // 4. Generar nuevo Access Token
    const accessToken = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      access_token: accessToken,
      rol: user.rol,
      restaurante_id: user.id
    });
  } catch (error) {
    console.error('Error en refresh token:', error);
    res.status(401).json({ mensaje: 'Refresh token inválido' });
  }
};

const updateProfile = async (req, res) => {
  const { nombre, email, telefono } = req.body;
  const restaurante_id = req.user.id;

  if (!nombre && !email && !telefono) {
    return res.status(400).json({ mensaje: 'Al menos un campo es requerido para actualizar' });
  }

  try {
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (nombre) {
      updates.push(`nombre_negocio = $${paramIndex++}`);
      values.push(nombre);
    }
    if (email) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (telefono) {
      updates.push(`descripcion = $${paramIndex++}`);
      values.push(telefono);
    }

    values.push(restaurante_id);

    const query = `UPDATE restaurantes SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, nombre_negocio, email, rol`;
    const result = await db.query(query, values);

    res.json({
      mensaje: 'Perfil actualizado correctamente',
      usuario: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ mensaje: 'Error interno al actualizar el perfil' });
  }
};

const changePassword = async (req, res) => {
  const { actual, nueva } = req.body;
  const restaurante_id = req.user.id;

  if (!actual || !nueva) {
    return res.status(400).json({ mensaje: 'Contraseña actual y nueva son requeridas' });
  }

  try {
    // 1. Verificar contraseña actual
    const result = await db.query('SELECT password_hash FROM restaurantes WHERE id = $1', [restaurante_id]);
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(actual, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ mensaje: 'Contraseña actual incorrecta' });
    }

    // 2. Hashear nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(nueva, salt);

    // 3. Actualizar
    await db.query('UPDATE restaurantes SET password_hash = $1 WHERE id = $2', [password_hash, restaurante_id]);

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ mensaje: 'Error interno al cambiar la contraseña' });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  updateProfile,
  changePassword
};
