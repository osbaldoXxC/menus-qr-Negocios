const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

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

    // Generar slug único y no consecutivo
    const baseSlug = slugify(nombre_negocio);
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${baseSlug}-${randomSuffix}`;

    // 3. Insertar restaurante
    const newRest = await db.query(
      'INSERT INTO restaurantes (nombre_negocio, email, password_hash, plan, nombre_dueno, slug) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [nombre_negocio, email, password_hash, plan || 'basico', nombre_dueño || '', slug]
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
    const result = await db.query('SELECT id, password_hash, rol, suscripcion_activa, estado, fecha_vencimiento FROM restaurantes WHERE email = $1 LIMIT 1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // 2. Comparar password (Costo optimizado a 8 rounds en registro)
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // 3. Verificar estado y vencimiento de suscripción (Solo para restaurantes)
    if (user.rol !== 'SUPER_ADMIN') {
      const ahora = new Date();
      if (user.fecha_vencimiento && new Date(user.fecha_vencimiento) < ahora) {
        // Suspender automáticamente si venció la fecha
        await db.query("UPDATE restaurantes SET estado = 'suspendido', suscripcion_activa = false WHERE id = $1", [user.id]);
        await db.query("UPDATE platillos SET activo = false WHERE restaurante_id = $1", [user.id]);
        user.estado = 'suspendido';
        user.suscripcion_activa = false;
      }

      if (user.estado === 'pendiente') {
        return res.status(403).json({ mensaje: 'Tu cuenta está en proceso de revisión por el administrador' });
      }

      if (user.estado === 'suspendido' || !user.suscripcion_activa) {
        return res.status(403).json({ mensaje: 'Tu cuenta está suspendida por el administrador o su suscripción ha expirado' });
      }
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

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ mensaje: 'Token de refresco ausente' });
  }

  try {
    // 1. Verificar firma del token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // 2. Verificar existencia en base de datos y que no haya expirado
    const tokenRes = await db.query(
      'SELECT token, expires_at, restaurante_id FROM refresh_tokens WHERE token = $1 LIMIT 1',
      [refreshToken]
    );

    if (tokenRes.rows.length === 0) {
      return res.status(401).json({ mensaje: 'Token de refresco inválido o revocado' });
    }

    const dbToken = tokenRes.rows[0];
    if (new Date(dbToken.expires_at) < new Date()) {
      // Eliminar token expirado de la base de datos
      await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
      res.clearCookie('refreshToken');
      return res.status(401).json({ mensaje: 'Token de refresco expirado' });
    }

    // 3. Verificar estado del restaurante
    const restRes = await db.query(
      'SELECT id, rol, estado, suscripcion_activa FROM restaurantes WHERE id = $1 LIMIT 1',
      [dbToken.restaurante_id]
    );

    if (restRes.rows.length === 0) {
      return res.status(401).json({ mensaje: 'Restaurante no encontrado' });
    }

    const rest = restRes.rows[0];

    // Si no está aprobado o la suscripción no está activa, denegar silent refresh
    if (rest.rol !== 'SUPER_ADMIN' && (rest.estado !== 'aprobado' || !rest.suscripcion_activa)) {
      res.clearCookie('refreshToken');
      return res.status(403).json({ mensaje: 'Cuenta suspendida o inactiva' });
    }

    // 4. Generar nuevo Access Token
    const accessToken = jwt.sign(
      { id: rest.id, rol: rest.rol },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      access_token: accessToken,
      rol: rest.rol,
      restaurante_id: rest.id
    });

  } catch (error) {
    console.error('Error al refrescar token:', error);
    res.clearCookie('refreshToken');
    return res.status(401).json({ mensaje: 'Token de refresco inválido' });
  }
};

module.exports = {
  register,
  login,
  refresh
};
