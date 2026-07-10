const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(session({
  secret: process.env.SESSION_SECRET || 'mexxicanmx-session-secret-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 día
  }
}));

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

// Servir archivos estáticos (Imágenes subidas localmente)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database and Redis connections
const db = require('./config/db');
require('./config/redis');

// Iniciar verificador de suscripciones expiradas
const { initSubscriptionCheck } = require('./services/subscriptionCheck');
db.initPromise.then(() => {
  initSubscriptionCheck();
}).catch(err => {
  console.error('Failed to initialize database, skipping subscription checks:', err);
});

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
