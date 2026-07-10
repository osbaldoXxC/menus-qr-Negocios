const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir orígenes sin definir (ej. herramientas como Postman) o si están en la lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Bloqueado por CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Logger de peticiones para depuración
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

// Servir archivos estáticos (Imágenes subidas localmente)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database and Redis connections
const dbConfig = require('./config/db');
require('./config/redis');

// Migración rápida para asegurar la columna email_verificado
dbConfig.query('ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT false')
  .then(() => {
    console.log('Base de datos: Columna email_verificado verificada/creada con éxito');
    // Forzar verificación para correos de prueba habituales por defecto
    return dbConfig.query("UPDATE restaurantes SET email_verificado = true WHERE email LIKE '%@example.com' OR email LIKE '%@test.com' OR email = 'contacto@elpaisa.com'");
  })
  .then((res) => {
    if (res && res.rowCount > 0) {
      console.log(`Base de datos: Se marcaron ${res.rowCount} correos de prueba como verificados.`);
    }
  })
  .catch(err => console.error('Error en migración inicial de email_verificado:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/restaurants', require('./routes/restaurantRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/public/menu', require('./routes/publicRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'MexxicanMX Backend API is running' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
