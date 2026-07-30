# AUDITORÍA DE ARQUITECTURA — MexxicanMX / menus-qr-Negocios
**Fecha:** 2026-07-23 · **Alcance:** Full-stack · **Modo:** Solo análisis, sin modificaciones

---

## RESUMEN EJECUTIVO

MexxicanMX es una plataforma SaaS multi-tenant para menús digitales QR orientada a restaurantes. El sistema tiene **tres aplicaciones distintas** y **un motor de IA** en standby, todos orquestados con Docker Compose. La arquitectura mezcla patrones maduros (MVC en backend, Feature-based en frontend) con deuda técnica significativa (componentes dios, estado global ausente, ausencia total de tests). El sistema funciona y tiene base sólida, pero su escalabilidad está limitada por decisiones arquitectónicas tempranas.

### Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend Público | React 18 + Vite 4 + TypeScript | React 18.2 |
| Panel Admin Restaurante | Mismo repo que Frontend | — |
| Panel Super Admin | React 18 + Vite (Proyecto separado) | — |
| Backend | Node.js + Express 4 | Express 4.18 |
| Base de Datos | PostgreSQL 16 (Alpine) | pg v8.11 |
| Cache | Redis (Alpine) | redis v4.6 |
| Almacenamiento Imágenes | AWS S3 / Local fallback | AWS SDK v3 |
| Contenedores | Docker Compose | — |
| ORM | Sin ORM — SQL puro con `pg` | — |
| Autenticación | JWT (access) + Refresh tokens en BD | jsonwebtoken v9 |
| Email | Mailer (config/mailer.js) | — |
| Procesamiento imágenes | Sharp | v0.34.5 |
| QR Generation | qrcode | v1.5.4 |
| IA (standby) | pgvector, vector embeddings | vector(768) |

---

## INFRAESTRUCTURA — DOCKER COMPOSE

### Servicios y Redes

```
┌─────────────────────────────────────────────────────────────────┐
│                        public-net                               │
│  ┌──────────┐   ┌──────────────┐   ┌───────────┐              │
│  │ frontend │   │   backend    │   │   admin   │              │
│  │ :3000    │──▶│   :4000      │◀──│   :3001   │              │
│  └──────────┘   └──────┬───────┘   └───────────┘              │
│                        │                                        │
│          ──────────────── private-net (internal) ─────────────  │
│          │              │                        │              │
│   ┌──────┴──┐    ┌──────┴──┐             ┌──────┴──┐           │
│   │postgres │    │  redis  │             │ai-engine│           │
│   │ :5432   │    │ :6379   │             │(standby)│           │
│   └─────────┘    └─────────┘             └─────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

> **Decisión correcta:** PostgreSQL y Redis solo son accesibles en la red interna (`internal: true`). El backend actúa como único gateway. Esto protege la BD de exposición directa.

> **Problema detectado:** `ai-engine` está en la red privada y no expone puerto — su integración con el backend no está implementada (referenciada como "Épica 7" en comentarios del código). Es un servicio activo en Docker pero inactivo funcionalmente.

---

## ARQUITECTURA FRONTEND PÚBLICO

### Patrón Arquitectónico
**Feature-based + Lazy Loading** con enrutamiento declarativo (React Router v6).

### Árbol de Archivos

```
frontend/src/
├── App.tsx                    ← Router principal, providers, lazy imports
├── main.tsx                   ← Entry point (React.StrictMode)
├── index.css                  ← Estilos globales + Tailwind base
├── context/
│   └── ThemeContext.tsx        ← Context de tema (dark/light) — ⚠️ poco usado
├── services/
│   ├── api.ts                 ← Cliente Axios base con interceptors
│   ├── auth.ts                ← Servicio autenticación (login, logout, token)
│   ├── restaurante.ts         ← CRUD restaurante, tema, upload
│   ├── comensal.ts            ← Servicio menú público (getMenuByQR)
│   └── admin.ts               ← Endpoints admin
├── utils/
│   └── responsiveImageUtils.ts ← Sistema de resolución de breakpoints
└── pages/
    ├── components/            ← Componentes compartidos
    │   ├── MainLayout.tsx     ← Layout wrapper con Header/Footer condicional
    │   ├── Header.tsx         ← Navbar con autenticación integrada
    │   ├── Sidebar.tsx        ← Menú lateral para dashboard
    │   ├── ProtectedRoute.tsx ← Guard de rutas por rol
    │   ├── Button.tsx         ← Botón reutilizable (variantes)
    │   ├── Footer.tsx         ← Pie de página
    │   ├── Navbar.tsx         ← Navbar alternativo
    │   ├── WelcomeSplash.tsx  ← Splash screen de bienvenida
    │   └── Logo.tsx           ← Componente logo SVG
    ├── PublicMenu/            ← 🔑 Menú público (vista del comensal)
    ├── Configuracion/         ← Editor de diseño del restaurante
    ├── DashboardRestaurante/  ← Dashboard KPIs del restaurante
    ├── MiMenu/                ← Lista de platillos (gestión)
    ├── NuevoPlatillo/         ← Formulario crear/editar platillo
    ├── CodigoQR/              ← Generador y visualizador de QR
    ├── Login/                 ← Login + VerifyEmail + RecuperarContrasena
    ├── Register/              ← Registro de restaurante
    ├── Landing/               ← Homepage para comensales
    ├── ParaRestaurantes/      ← Landing marketing restaurantes
    ├── ComoFunciona/          ← Explicación del servicio
    ├── Precios/               ← Página de precios
    ├── Descubrir/             ← Feed discovery de platillos
    ├── CuestionarioIA/        ← Cuestionario para recomendaciones IA
    ├── EscanearQR/            ← Escáner de QR
    ├── Perfil/                ← Perfil de usuario
    ├── Home/                  ← (Detectado en directorio, no en rutas)
    ├── Discovery/             ← (Detectado en directorio, no en rutas)
    └── NotFound/              ← Página 404
```

### Sistema de Rutas (App.tsx)

| Ruta | Componente | Protegida | Roles Permitidos |
|---|---|---|---|
| `/` | `HomeRedirect` (→ Landing o Dashboard) | No | — |
| `/para-restaurantes` | `ParaRestaurantes` | No | — |
| `/como-funciona` | `ComoFunciona` | No | — |
| `/precios` | `Precios` | No | — |
| `/login` | `Login` | No | — |
| `/register` | `Register` | No | — |
| `/verify-email` | `VerifyEmail` | No | — |
| `/recuperar-contrasena` | `RecuperarContrasena` | No | — |
| `/descubrir` | `Descubrir` | No | — |
| `/cuestionario` | `CuestionarioIA` | No | — |
| `/menu/:restaurant_id` | `PublicMenu` | No | — |
| `/escanear/:id?` | `EscanearQR` | No | — |
| `/perfil` | `Perfil` | **Sí** | COMENSAL, RESTAURANTE, SUPER_ADMIN |
| `/dashboard/restaurante` | `DashboardRestaurante` | **Sí** | RESTAURANTE, SUPER_ADMIN |
| `/dashboard/platillos` | `MiMenu` | **Sí** | RESTAURANTE, SUPER_ADMIN |
| `/dashboard/platillos/nuevo` | `NuevoPlatillo` | **Sí** | RESTAURANTE, SUPER_ADMIN |
| `/dashboard/platillos/editar/:id` | `NuevoPlatillo` | **Sí** | RESTAURANTE, SUPER_ADMIN |
| `/dashboard/qr` | `CodigoQR` | **Sí** | RESTAURANTE, SUPER_ADMIN |
| `/dashboard/configuracion` | `Configuracion` | **Sí** | RESTAURANTE, SUPER_ADMIN |
| `/admin` | `DashboardRestaurante` | **Sí** | SUPER_ADMIN |
| `*` | `NotFound` | No | — |

> ⚠️ **Código muerto detectado:** Las páginas `Home/` y `Discovery/` existen como directorios pero no están registradas en ninguna ruta de `App.tsx`. Son código no alcanzable.

> ⚠️ **Inconsistencia:** La ruta `/admin` apunta a `DashboardRestaurante`, no a una vista de administración distinta. El panel de Super Admin real vive en el proyecto `admin/` separado (puerto 3001).

### Lazy Loading

**Todas las páginas** usan `React.lazy()` con `Suspense`. El fallback es un `<PageLoader>` con el logo animado. Esto reduce el bundle inicial significativamente.

### Gestión de Estado

| Tipo | Mecanismo | Dónde |
|---|---|---|
| Autenticación | `localStorage` (token, rol, id) via `authService` | Global implícito |
| Tema dark/light | `ThemeContext` (Context API) | Poco utilizado |
| Estado de página | `useState` local en cada componente | Por página |
| Estado servidor | Sin SWR/React Query — fetch manual | Por componente |

> ⚠️ **Problema:** No hay estado global reactivo (Redux, Zustand, Jotai). Cada componente que necesita saber si el usuario está autenticado llama directamente a `authService.getCurrentUser()` o lee `localStorage`. Si el token expira y se renueva, los componentes no se re-renderizan.

### Servicios API

**`api.ts`** — Cliente Axios base:
- Configura `baseURL` desde `VITE_API_URL` o fallback a `http://localhost:4000/api`
- Adjunta `Authorization: Bearer <token>` automáticamente via interceptor
- Interceptor de respuesta que detecta `401` y redirige al login

**Endpoints por servicio:**

| Servicio | Método | Endpoint | Propósito |
|---|---|---|---|
| `auth.ts` | POST | `/auth/login` | Login |
| `auth.ts` | POST | `/auth/register` | Registro |
| `auth.ts` | POST | `/auth/logout` | Logout |
| `auth.ts` | POST | `/auth/refresh` | Renovar token |
| `auth.ts` | POST | `/auth/verify-email` | Verificar email |
| `auth.ts` | POST | `/auth/forgot-password` | Recuperar contraseña |
| `restaurante.ts` | GET | `/restaurants/info` | Info del restaurante |
| `restaurante.ts` | GET | `/restaurants/qr` | Generar QR |
| `restaurante.ts` | PUT | `/restaurants/theme` | Actualizar tema |
| `restaurante.ts` | POST | `/restaurants/upload-branding` | Subir logo/banner |
| `restaurante.ts` | GET | `/menu/platillos` | Listar platillos |
| `restaurante.ts` | POST | `/menu/platillos` | Crear platillo |
| `restaurante.ts` | PUT | `/menu/platillos/:id` | Editar platillo |
| `restaurante.ts` | DELETE | `/menu/platillos/:id` | Eliminar platillo |
| `restaurante.ts` | GET | `/categories` | Listar categorías |
| `restaurante.ts` | POST | `/categories` | Crear categoría |
| `restaurante.ts` | PUT | `/categories/:id` | Editar categoría |
| `restaurante.ts` | DELETE | `/categories/:id` | Eliminar categoría |
| `restaurante.ts` | PUT | `/categories/orden` | Reordenar categorías |
| `comensal.ts` | GET | `/public/menu/:restaurant_id` | Menú público (sin auth) |
| `admin.ts` | GET | `/admin/restaurants` | Lista restaurantes (SA) |
| `admin.ts` | PUT | `/admin/restaurants/:id/approve` | Aprobar restaurante |
| `admin.ts` | PUT | `/admin/restaurants/:id/suspend` | Suspender restaurante |

### Librerías de UI

| Librería | Versión | Uso |
|---|---|---|
| `framer-motion` | ^10.16.4 | Animaciones de página, transiciones |
| `lucide-react` | ^0.284.0 | Iconos SVG |
| `react-colorful` | ^5.7.0 | Color picker en Configuracion |
| `react-dropzone` | ^15.0.0 | Upload de imágenes |
| `tailwindcss` | ^3.3.3 | Framework CSS utilitario |

> ⚠️ **`playwright` como dependencia de producción:** El paquete `playwright` v1.61.1 está en `dependencies` (no `devDependencies`). Esto aumenta el bundle de producción innecesariamente (~100MB). Debe moverse a `devDependencies`.

### Componente PublicMenu — Análisis Específico

El menú público (`PublicMenu.tsx`, ~709 líneas) es el componente más complejo del frontend público. Es **un componente dios** con responsabilidades mezcladas:

- Carga de datos del backend
- Cálculo de breakpoints responsivos
- Resolución de configuración de imagen heredada
- Renderizado del fondo (imagen, gradiente, sólido)
- Renderizado del header sticky
- Renderizado de categorías y platillos
- Sistema de escalado (actualmente deshabilitado)
- Paleta de colores adaptativa (dark/light)

**Sistema de breakpoints de imagen** (`responsiveImageUtils.ts`):
- Define 6 breakpoints: `mobile_small`, `mobile`, `tablet`, `laptop`, `desktop`, `desktop_large`
- Herencia de configuración: si un breakpoint no tiene config propia, hereda del más cercano
- Configuración almacenada en `config_diseno` (TEXT en BD) como JSON serializado

---

## ARQUITECTURA PANEL ADMIN RESTAURANTE (`/dashboard/configuracion`)

La página `Configuracion` (dentro del proyecto `frontend/`) es donde los restaurantes configuran el diseño visual de su menú. Contiene un editor responsivo de imagen con preview en tiempo real.

> **Nota:** Este editor no fue analizado en profundidad por los subagentes — requiere lectura directa de `pages/Configuracion/`. Lo que se sabe: guarda en `PUT /restaurants/theme` con el campo `config_diseno` como JSON serializado en TEXT.

---

## ARQUITECTURA PANEL SUPER ADMIN (`admin/`)

El panel de super administración es un **proyecto React independiente** (puerto 3001). Se comunica directamente con el mismo backend en `/api/admin`.

### Patrón Arquitectónico
**Single-File Architecture** — Todo reside en `App.tsx` (~600+ líneas).

### Estructura

```
admin/src/
├── App.tsx      ← TODO el sistema (login + dashboard + modal)
├── App.css      ← 1600+ líneas de CSS global
├── index.css    ← Reset base
└── main.tsx     ← Entry point
```

### Vistas/Módulos detectados

| Módulo | Descripción |
|---|---|
| Login | Autenticación SUPER_ADMIN |
| Dashboard KPIs | Totales, Pendientes, Aprobados, Suspendidos |
| Tabla Restaurantes | Lista con filtros por estado |
| Búsqueda | Input de búsqueda en tiempo real |
| Tabs de filtro | Todos / Pendientes / Aprobados / Suspendidos |
| Asignar licencia | Input de días + botón Aprobar por fila |
| Kill Switch Modal | Confirmación de suspensión con advertencia crítica |

### Endpoints Consumidos

| Método | Endpoint | Propósito |
|---|---|---|
| POST | `/auth/login` | Login SUPER_ADMIN |
| GET | `/admin/restaurants` | Lista de negocios |
| PUT | `/admin/restaurants/:id/approve` | Aprobar + asignar días |
| PUT | `/admin/restaurants/:id/suspend` | Suspender (Kill Switch) |

> ⚠️ **Inconsistencia detectada:** `adminRoutes.js` solo define `PUT /restaurants/:id/status`, pero el panel admin llama a `/approve` y `/suspend` como endpoints separados. Esto indica que el admin usa endpoints que **no existen en el router actual** o fueron renombrados. Requiere verificación.

### Problemas Detectados

1. **God Component:** `App.tsx` hace todo — autenticación, routing condicional, listado, acciones, modal
2. **No hay Router:** La navegación se basa en `isAuthenticated` — no escala
3. **Token en localStorage:** Susceptible a XSS
4. **Sin separación de responsabilidades:** Fetch, lógica, presentación en el mismo componente
5. **CSS monolítico:** `App.css` de 1600+ líneas sin módulos

---

## ARQUITECTURA BACKEND

### Patrón Arquitectónico
**MVC Layered** (Routes → Controllers → DB) sin capa de Service explícita. Los controllers acceden directamente al pool de PostgreSQL.

### Estructura

```
backend/src/
├── index.js           ← Entry point: CORS, middlewares, rutas, server
├── config/
│   ├── db.js          ← Pool de conexiones PostgreSQL (pg.Pool)
│   ├── redis.js       ← Cliente Redis (auto-conecta al arrancar)
│   ├── s3.js          ← Cliente AWS S3
│   └── mailer.js      ← Configuración de email (nodemailer)
├── middleware/
│   ├── authMiddleware.js    ← Verifica JWT Bearer token
│   ├── roleMiddleware.js    ← Verifica rol del usuario
│   └── uploadMiddleware.js  ← Multer + Sharp + S3/Local
├── routes/
│   ├── authRoutes.js        ← /api/auth/*
│   ├── restaurantRoutes.js  ← /api/restaurants/*
│   ├── menuRoutes.js        ← /api/menu/*
│   ├── categoryRoutes.js    ← /api/categories/*
│   ├── publicRoutes.js      ← /api/public/menu/*
│   ├── adminRoutes.js       ← /api/admin/*
│   └── searchRoutes.js      ← /api/search/*
└── controllers/
    ├── authController.js        ← Auth completo
    ├── restaurantController.js  ← Tema, QR, info, upload
    ├── menuController.js        ← CRUD platillos + menú público
    ├── categoryController.js    ← CRUD + reordenamiento categorías
    ├── adminController.js       ← Gestión de restaurantes (SA)
    └── searchController.js      ← Búsqueda de platillos
```

### Tabla Completa de Endpoints

| Método | Ruta | Controller | Auth | Roles |
|---|---|---|---|---|
| POST | `/api/auth/register` | authController.register | No | — |
| POST | `/api/auth/login` | authController.login | No | — |
| POST | `/api/auth/verify-email` | authController.verifyEmail | No | — |
| POST | `/api/auth/resend-verification` | authController.resendVerification | No | — |
| POST | `/api/auth/forgot-password` | authController.forgotPassword | No | — |
| POST | `/api/auth/reset-password` | authController.resetPassword | No | — |
| POST | `/api/auth/refresh` | authController.refresh | No | — |
| POST | `/api/auth/logout` | authController.logout | No | — |
| GET | `/api/restaurants/info` | restaurantController.getRestaurantInfo | JWT | RESTAURANTE, SUPER_ADMIN |
| GET | `/api/restaurants/qr` | restaurantController.generateQR | JWT | RESTAURANTE, SUPER_ADMIN |
| PUT | `/api/restaurants/theme` | restaurantController.updateTheme | JWT | RESTAURANTE, SUPER_ADMIN |
| POST | `/api/restaurants/upload-branding` | restaurantController.uploadBrandingImage | JWT | RESTAURANTE, SUPER_ADMIN |
| GET | `/api/menu/platillos` | menuController.getDishes | JWT | RESTAURANTE, SUPER_ADMIN |
| POST | `/api/menu/platillos` | menuController.createDish | JWT | RESTAURANTE, SUPER_ADMIN |
| PUT | `/api/menu/platillos/:id` | menuController.updateDish | JWT | RESTAURANTE, SUPER_ADMIN |
| DELETE | `/api/menu/platillos/:id` | menuController.deleteDish | JWT | RESTAURANTE, SUPER_ADMIN |
| GET | `/api/categories` | categoryController.getCategories | JWT | RESTAURANTE, SUPER_ADMIN |
| POST | `/api/categories` | categoryController.createCategory | JWT | RESTAURANTE, SUPER_ADMIN |
| PUT | `/api/categories/orden` | categoryController.reorderCategories | JWT | RESTAURANTE, SUPER_ADMIN |
| PUT | `/api/categories/:id` | categoryController.updateCategory | JWT | RESTAURANTE, SUPER_ADMIN |
| DELETE | `/api/categories/:id` | categoryController.deleteCategory | JWT | RESTAURANTE, SUPER_ADMIN |
| GET | `/api/public/menu/:restaurant_id` | menuController.getPublicMenu | **No** | — |
| PUT | `/api/admin/restaurants/:id/status` | adminController.updateRestaurantStatus | JWT | SUPER_ADMIN |
| POST | `/api/search/matches` | searchController.findMatches | **No** | — |

### Middleware Stack (por request)

```
Request
  └── CORS (origin whitelist)
  └── express.json()
  └── cookieParser()
  └── Logger (req.method, req.url, origin)
  └── [ruta estática /uploads]
  └── Router específico
        └── [authLimiter: 5 req/min por IP] (solo /api/auth/*)
        └── authMiddleware (verifica JWT Bearer)
        └── roleMiddleware (verifica rol en array permitido)
        └── [uploadMiddleware: multer + magic bytes + sharp + S3]
        └── Controller
```

### Sistema de Autenticación

**Access Token (JWT):**
- Firmado con `JWT_SECRET`
- Payload: `{ id, rol }`
- Sin expiración explícita detectada en las rutas leídas (requiere verificación en `authController.js`)

**Refresh Token:**
- Almacenado en tabla `refresh_tokens` de la BD
- Incluye `expires_at`
- Endpoint: `POST /api/auth/refresh`

**Flujo de Verificación de Email:**
- Endpoints: `verify-email` y `resend-verification`
- Usa `config/mailer.js` para envío

**Rate Limiting (OWASP A07):**
- 5 requests / 1 minuto / IP en **todos los endpoints de auth**
- Solo en `authRoutes.js` — los demás endpoints no tienen rate limit

### Sistema de Autorización

- `authMiddleware`: extrae JWT del header `Authorization: Bearer <token>`, decodifica, asigna `req.user = { id, rol }`
- `roleMiddleware(allowedRoles)`: compara `req.user.rol` contra array de roles permitidos (case-insensitive)
- Roles existentes: `RESTAURANTE`, `SUPER_ADMIN` (en BD también `COMENSAL` aunque no se usa en backend)

### Upload de Imágenes

**Pipeline completo:**
1. `multer.memoryStorage()` — recibe en RAM, límite 5MB
2. Validación de MIME type (`image/*`)
3. Validación de **magic bytes** (PNG, JPEG, WebP, GIF) — mitigación de shell uploads
4. `sharp` — redimensiona a max 800x800, convierte a WebP quality 60
5. Si S3 configurado → sube a `dishes/` en S3 bucket
6. Si no S3 → guarda en `backend/uploads/dishes/` con URL local

**Destino de branding (logos/banners):** Mismo pipeline, misma lógica.

### Cache (Redis)

El cliente Redis se conecta al arrancar (`config/redis.js`). Estrategia documentada por el subagente de backend:
- **OTPs/verificación email:** TTL de 5 minutos
- **Menú público:** Clave `cache:menu:<id>`, TTL de **4 horas**
- **Resiliencia:** El bloque `getPublicMenu` envuelve Redis en try-catch — si Redis cae, la API continúa consultando PostgreSQL directamente (degraded mode correcto)
- **Invalidación proactiva:** `updateTheme` llama a `redisClient.del(key)` para invalidar al guardar

### Sistema de Autenticación (detalle adicional)

- **Access Token:** Expiración de **15 minutos**
- **Refresh Token:** Expiración de **7 días**, almacenado **hasheado** en BD, emitido como **Cookie HTTP-only** (mitigación XSS)
- **Verificación de email:** OTP enviado via Resend API, requerido antes de poder usar la cuenta
- El login valida que el email esté verificado antes de emitir tokens

### Seguridad — Análisis

| Aspecto | Estado | Evidencia |
|---|---|---|
| CORS | ✅ Whitelist de orígenes | `index.js` líneas 11-30 |
| Rate Limiting auth | ✅ 5 req/min/IP | `authRoutes.js` líneas 16-22 |
| Magic bytes validation | ✅ Implementado | `uploadMiddleware.js` líneas 27-43 |
| Validación MIME | ✅ Solo `image/*` | `uploadMiddleware.js` línea 16 |
| Password hashing | ✅ bcryptjs | package.json |
| JWT firmado | ✅ JWT_SECRET env var | `authMiddleware.js` línea 13 |
| SQL Injection | ⚠️ Sin ORM — depende de parametrización manual | Sin leer controllers |
| Rate limiting general | ❌ Solo en auth — otros endpoints sin límite | Resto de routes |
| CSRF | ❌ No detectado | Sin evidencia en código |
| HTTPS | ❌ No configurado en Docker dev | compose.yml sin SSL |
| Secrets en código | ⚠️ Fallbacks hardcodeados en config | `db.js` línea 7, `s3.js` líneas 7-8 |
| Token Refresh en cookie HTTP-only | ✅ Mitigación XSS activa | `authController.js` — cookie HTTP-only |
| Sanitización `config_diseno` | ✅ Validación CSS/Hex manual extensa | `restaurantController.js` |
| OTP verificación email | ✅ Requerido antes de primer login | `authController.js` |

---

## ARQUITECTURA BASE DE DATOS

### Diagrama de Tablas

```
restaurantes (1) ─────────────────────────────────────────────────────
│ id (UUID PK)                                                         │
│ nombre_negocio, descripcion, email (UNIQUE), password_hash           │
│ ubicacion_lat, ubicacion_lng                                         │
│ suscripcion_activa (BOOLEAN), rol, plan, ultimo_pago                │
│ created_at                                                           │
│                                                                      │
├──(1:1)──▶ configuracion_tema                                        │
│            id, restaurante_id (UNIQUE FK), logo_url, banner_url     │
│            color_primario, color_fondo, fuente_familia               │
│            layout_type (ENUM), config_diseno (TEXT← JSON)           │
│            banner_promocional_activo, banner_promocional_texto       │
│                                                                      │
├──(1:N)──▶ horarios_restaurante                                      │
│            id, restaurante_id, dia_semana (1-7)                     │
│            hora_apertura, hora_cierre                                │
│                                                                      │
├──(1:N)──▶ categorias_restaurante                                    │
│            id, restaurante_id, nombre, orden                        │
│            UNIQUE(restaurante_id, nombre)                            │
│                 │                                                    │
│                 └──(1:N)──▶ platillos.categoria_id                  │
│                                                                      │
├──(1:N)──▶ platillos                                                 │
│            id, restaurante_id, nombre, descripcion, precio          │
│            url_imagen, categoria_id (FK→categorias), activo         │
│            vector_ia (vector(768)), estado_ia                       │
│            created_at                                                │
│                 │                                                    │
│                 ├──(M:M)──▶ receta_platillo ──▶ ingredientes_catalogo│
│                 ├──(M:M)──▶ perfil_sabor_platillo ──▶ sabores_catalogo│
│                 └──(1:N)──▶ interacciones_feed                      │
│                                                                      │
└──(1:N)──▶ refresh_tokens                                           │
             id, restaurante_id, token, expires_at                    │

usuarios_comensales (independiente — no FK a restaurantes)
interacciones_feed.usuario_id ──▶ usuarios_comensales (nullable)
```

### Columnas por Tabla

| Tabla | Columnas Clave | Tipo |
|---|---|---|
| `restaurantes` | id, email, password_hash, suscripcion_activa, rol, plan | UUID, VARCHAR, BOOLEAN |
| `configuracion_tema` | restaurante_id (UNIQUE), config_diseno | UUID FK, TEXT |
| `refresh_tokens` | restaurante_id, token, expires_at | UUID FK, TEXT, TIMESTAMP |
| `horarios_restaurante` | restaurante_id, dia_semana, hora_apertura, hora_cierre | UUID FK, INT, TIME |
| `categorias_restaurante` | restaurante_id, nombre, orden | UUID FK, VARCHAR, INT |
| `platillos` | restaurante_id, categoria_id, precio, activo, vector_ia | UUID FK, DECIMAL, BOOL, vector(768) |
| `ingredientes_catalogo` | nombre (UNIQUE), es_alergeno_comun, es_origen_animal | VARCHAR, BOOLEAN |
| `sabores_catalogo` | nombre (UNIQUE) | VARCHAR |
| `receta_platillo` | platillo_id, ingrediente_id (PK compuesta) | UUID FK × 2 |
| `perfil_sabor_platillo` | platillo_id, sabor_id (PK compuesta) | UUID FK × 2 |
| `interacciones_feed` | usuario_id (nullable), platillo_id, tipo_interaccion | UUID FK, VARCHAR |
| `usuarios_comensales` | id, nombre, email, auth_provider | UUID, VARCHAR |

### Índices Definidos

| Índice | Tabla | Columna | Propósito |
|---|---|---|---|
| `idx_restaurantes_email` | restaurantes | email | Búsqueda por login |
| `idx_platillos_restaurante` | platillos | restaurante_id | Listar platillos del restaurante |
| `idx_categorias_restaurante_id` | categorias_restaurante | restaurante_id | Listar categorías |
| `idx_refresh_tokens_token` | refresh_tokens | token | Validación de refresh |
| `idx_platillos_activo` | platillos | activo WHERE activo=true | Partial index, platillos visibles |

### 🔴 BUG CRÍTICO CONFIRMADO: Columnas inexistentes en `platillos`

> El subagente de Backend encontró que `menuController.js` (funciones `createDish` y `updateDish`) intenta insertar valores en columnas `ingredientes_principales` y `complementos` de la tabla `platillos`. **Estas columnas NO existen en `init.sql` ni en ninguna migración activa en `migrate.js`.** Esto causa un error SQL en producción cuando un restaurante intenta crear o editar un platillo con estos campos.

---

### Datos de Seed

- `seed_china_gourmet.sql` y `seed_test_data.sql` usan UUIDs quemados (`da70...`)
- Requieren que el `restaurante_id` exista **antes** de insertar categorías y platillos
- Si se ejecutan antes del seed del restaurante → error de Foreign Key


**Fortalezas:**
- Esquema v3.0 — comentado como "100% Normalizado 3FN"
- Tablas pivot correctas para M:M (receta_platillo, perfil_sabor_platillo)
- Extensión pgvector instalada para IA futura
- Cascades correctos (ON DELETE CASCADE en platillos, categorias)

**Problemas:**
- `config_diseno` almacenado como `TEXT` (JSON serializado) en `configuracion_tema` — viola 1NF al guardar estructura compleja como string. Debería ser `JSONB` para poder hacer queries parciales y validar esquema.
- `horarios_restaurante` definida en el esquema pero sin evidencia de uso en ningún controller leído.
- `ingredientes_catalogo`, `sabores_catalogo`, `receta_platillo`, `perfil_sabor_platillo`, `interacciones_feed` y `usuarios_comensales` están definidas en el esquema pero sin evidencia de uso activo en los controllers actuales — probable infraestructura para features futuras (IA, Discovery Feed).

---

## FLUJO COMPLETO DEL SISTEMA

### Flujo: Comensal Escanea QR

```
Comensal
  └── Escanea QR
  └── Navegador abre: https://app.com/menu/{restaurant_id}
  └── Frontend: PublicMenu.tsx
        └── comensalService.getMenuByQR(restaurant_id)
              └── GET /api/public/menu/{restaurant_id}  [Sin Auth]
              └── backend: menuController.getPublicMenu
                    └── Redis CACHE HIT → return JSON
                    └── Redis CACHE MISS →
                          └── SQL: SELECT restaurantes + configuracion_tema
                          └── SQL: SELECT categorias + platillos (activo=true)
                          └── JSON.parse(config_diseno) ← Fix aplicado
                          └── Guardar en Redis cache
                          └── return { restaurante, categorias }
  └── PublicMenu renderiza con tema del restaurante
```

### Flujo: Restaurante Configura su Menú

```
Restaurante (autenticado)
  └── Accede a /dashboard/configuracion
  └── Configura tema, imagen de fondo, breakpoints responsivos
  └── Guarda: restauranteService.updateTheme(data)
        └── PUT /api/restaurants/theme [Bearer Token]
              └── authMiddleware → verifica JWT
              └── roleMiddleware(['RESTAURANTE', 'SUPER_ADMIN'])
              └── restaurantController.updateTheme
                    └── sanitizarConfigDiseno(config_diseno)
                    └── UPDATE configuracion_tema SET ... WHERE restaurante_id = $1
                    └── Redis: DELETE cache del restaurante (invalidación)
```

### Flujo: Upload de Imagen de Platillo

```
Restaurante
  └── Sube imagen en NuevoPlatillo
  └── POST /api/menu/platillos [multipart/form-data, Bearer Token]
        └── authMiddleware → JWT válido
        └── roleMiddleware → RESTAURANTE o SUPER_ADMIN
        └── uploadMiddleware.upload.single('imagen')
              └── multer: memoria RAM, max 5MB, solo image/*
              └── magic bytes validation (PNG/JPEG/WebP/GIF)
        └── uploadMiddleware.optimizeImage
              └── sharp: resize 800x800, webp quality 60
              └── S3 configurado → Upload a S3 dishes/
              └── Sin S3 → Guarda local en /uploads/dishes/
        └── menuController.createDish
              └── INSERT INTO platillos (..., url_imagen) VALUES (...)
```

---

## DESIGN SYSTEM

### Frontend Público

- **Framework CSS:** Tailwind CSS v3 (utilitario)
- **Tipografía:** Inter, system-ui (Google Fonts no detectado explícitamente)
- **Colores:** Adaptativos según `color_primario` y `color_fondo` del restaurante
- **Modo oscuro:** Calculado con `isColorDark()` sobre `color_fondo`
- **Animaciones:** Framer Motion (transiciones de página, fade in/out 0.2s)
- **Iconos:** Lucide React

### Panel Super Admin

- **Framework CSS:** Vanilla CSS (no Tailwind)
- **Variables CSS:** Sistema completo (`--admin-blue`, `--admin-bg-light`, `--admin-bg-dark`, gradientes, sombras)
- **Modo oscuro:** `@media (prefers-color-scheme: dark)` nativo
- **Tipografía:** Outfit (Google Fonts)
- **Estética:** Glassmorphism, ambient blur blobs

---

## ANÁLISIS DE PERFORMANCE

### Frontend

| Aspecto | Estado | Detalle |
|---|---|---|
| Lazy loading | ✅ | Todas las páginas con React.lazy() |
| Animaciones de página | ✅ | Framer Motion, 0.2s fade |
| Re-renders | ⚠️ | Sin memo/useMemo/useCallback evidenciado |
| Bundle | ⚠️ | playwright en dependencies (no devDependencies) |
| Imágenes | ✅ | WebP optimizado desde backend |
| React Query/SWR | ❌ | No — fetch manual por componente |
| Cache cliente | ❌ | No — cada navegación refetch |

### Backend

| Aspecto | Estado | Detalle |
|---|---|---|
| Connection Pool | ✅ | pg.Pool |
| Cache Redis | ✅ | Menú público cacheado |
| Índices BD | ✅ | 5 índices críticos definidos |
| N+1 queries | ⚠️ | Sin ORM — depende de queries en controllers |
| Rate limiting global | ❌ | Solo en /api/auth/* |
| Compresión HTTP | ❌ | No detectado (sin compression middleware) |

---

## CÓDIGO MUERTO Y DUPLICACIÓN

### Código Muerto Confirmado

| Elemento | Ubicación | Evidencia |
|---|---|---|
| `pages/Home/` | frontend/src/pages/ | Directorio sin ruta en App.tsx |
| `pages/Discovery/` | frontend/src/pages/ | Directorio sin ruta en App.tsx |
| `horarios_restaurante` | DB + schema | Definida en init.sql, sin controller |
| `ingredientes_catalogo` | DB + schema | Definida, sin uso activo confirmado |
| `sabores_catalogo` | DB + schema | Definida, sin uso activo confirmado |
| `receta_platillo` | DB + schema | Definida, sin uso activo confirmado |
| `perfil_sabor_platillo` | DB + schema | Definida, sin uso activo confirmado |
| `usuarios_comensales` | DB + schema | Definida, sin uso activo confirmado |
| `interacciones_feed` | DB + schema | Definida, sin uso activo confirmado |
| `scalingFactor` + `baseWidth` | PublicMenu.tsx L184-196 | Calculado pero `transform:scale()` eliminado — variable existe sin efecto visual |
| `ai-engine` | Docker Compose | Servicio activo pero sin integración funcional |
| **`columnas ingredientes_principales/complementos`** | `menuController.js` | **Referenciadas en SQL pero no existen en BD — BUG CRÍTICO** |

### Duplicación Detectada

| Patrón duplicado | Dónde |
|---|---|
| Lectura de `localStorage` (token, user) | Múltiples componentes llaman `authService.getCurrentUser()` — correcto, pero sin reactividad |
| Manejo de errores try/catch en controllers | Sin capa de servicio — lógica de negocio en controllers |
| Fallback de datos mock en `PublicMenu.tsx` | MENU_DUMMY, CHINA_MENU_DUMMY, GOURMET_MENU_DUMMY hardcodeados en el mismo archivo (~150 líneas) |
| **Mock data en catch de services** | `comensal.ts` y otros — errores de red enmascarados como éxitos con datos falsos |
| **`PLATILLOS_DUMMY` en `Descubrir.tsx`** | Datos de prueba mezclados con código de producción |

---

## PROBLEMAS POR PRIORIDAD

### 🔴 Prioridad Alta

| # | Problema | Impacto | Ubicación |
|---|---|---|---|
| A1 | `config_diseno` guardado como TEXT en vez de JSONB | Performance, integridad, imposible query parcial | `init.sql` línea 41 |
| A2 | **Columnas `ingredientes_principales`/`complementos` referenciadas en controller pero inexistentes en BD** | **BUG CRÍTICO — createDish/updateDish fallan en producción** | `menuController.js` + `init.sql` |
| A3 | Sin rate limiting en endpoints no-auth | Riesgo de abuso/DDoS | Todos los routers excepto authRoutes |
| A4 | Secrets hardcodeados como fallback en código | Seguridad — credenciales default en repo | `db.js`, `s3.js` |
| A5 | Sin tests (unitarios, integración, e2e) | Riesgo de regresiones — `"test": "echo Error"` | package.json backend |
| A6 | Inconsistencia de endpoints admin | Panel admin llama a `/approve` y `/suspend`, pero el router solo define `/status` | `adminRoutes.js` vs `admin/App.tsx` |
| A7 | `playwright` en dependencies de producción | Bundle innecesario ~100MB en prod | `frontend/package.json` |
| A8 | Mock data en catch de services | Errores de red enmascarados como éxitos — debugging imposible en producción | `comensal.ts`, `Descubrir.tsx` |
| A9 | `localStorage.getItem('cuestionario')` sin validación | Si está corrupto → crash sin catch en `Descubrir.tsx` | `Descubrir.tsx` |

### 🟡 Prioridad Media

| # | Problema | Impacto | Ubicación |
|---|---|---|---|
| M1 | Sin estado global reactivo | Token expirado no actualiza UI sin refresh | Frontend global |
| M2 | `PublicMenu.tsx` es un God Component (709 líneas) | Mantenimiento difícil, testing imposible | `PublicMenu.tsx` |
| M3 | `admin/App.tsx` God Component (600+ líneas) | Sin escalabilidad del panel admin | `admin/App.tsx` |
| M4 | Sin capa de Service en backend (controllers acceden directo a DB) | Dificulta testing y reutilización | Backend controllers |
| M5 | Sin compresión HTTP | Payload más grande de lo necesario | Backend index.js |
| M6 | Sin React Query/SWR | Sin cache cliente, sin deduplicación, sin stale-while-revalidate | Frontend global |
| M7 | Variables CSS `--scale-factor` calculada pero sin uso efectivo | Confusión de código | `PublicMenu.tsx` L324 |
| M8 | Páginas `Home/` y `Discovery/` sin ruta | Código muerto acumulado | `frontend/src/pages/` |
| M9 | Token en localStorage en panel admin | XSS vulnerable | `admin/App.tsx` |

### 🟢 Prioridad Baja

| # | Problema | Impacto |
|---|---|---|
| B1 | Sin documentación de API (Swagger/OpenAPI) | Onboarding lento para nuevos devs |
| B2 | CSS monolítico en admin (App.css 1600 líneas) | Difícil de mantener |
| B3 | Sin env validation al startup | Errores silenciosos si falta var |
| B4 | Mock data embebida en PublicMenu.tsx | Aumenta tamaño del bundle en producción |
| B5 | `ThemeContext` poco utilizado | Capa de abstracción que no se aprovecha |
| B6 | Esquema de BD v3.0 con tablas de IA vacías | Ruido en el esquema |

---

## FORTALEZAS

1. **Separación de proyectos por audiencia** — frontend público, admin restaurante y super-admin son entidades distintas
2. **Infraestructura Docker bien configurada** — redes separadas, healthchecks, dependencias explícitas
3. **Upload seguro de imágenes** — magic bytes + mime type + sharp + webp
4. **Sistema de autenticación completo** — verify email, forgot password, refresh tokens en BD
5. **Rate limiting en auth** — OWASP A07 aplicado
6. **Lazy loading universal** — todas las páginas con React.lazy
7. **Sistema de breakpoints responsivos de imagen** — solución personalizada y funcional
8. **Índices de BD bien pensados** — partial index en platillos activos
9. **pgvector instalado** — infraestructura lista para IA futura
10. **Cache Redis para menú público** — el endpoint más consultado está cacheado

---

## ROADMAP DE MEJORAS

### Fase 1 — Correcciones críticas (1-2 semanas)

- [ ] Migrar `config_diseno` de TEXT a JSONB en PostgreSQL
- [ ] Agregar rate limiting global (ej. 100 req/15min por IP)
- [ ] Mover `playwright` a devDependencies
- [ ] Resolver inconsistencia endpoints admin (`/approve`, `/suspend` vs `/status`)
- [ ] Eliminar fallbacks de credenciales hardcodeadas en configs

### Fase 2 — Deuda técnica alta (2-4 semanas)

- [ ] Extraer mock data de PublicMenu.tsx a archivo separado
- [ ] Refactorizar PublicMenu.tsx en subcomponentes (Header, Background, MenuSection, CategoryNav)
- [ ] Refactorizar admin/App.tsx en componentes separados (LoginView, KpiCards, RestaurantTable, KillSwitchModal)
- [ ] Agregar capa de Service en backend entre routes y controllers
- [ ] Agregar `compression` middleware en Express
- [ ] Añadir React Query o SWR en frontend

### Fase 3 — Escalabilidad (1-2 meses)

- [ ] Implementar tests unitarios en backend (Jest + supertest)
- [ ] Implementar tests de componentes en frontend (Vitest + Testing Library)
- [ ] Añadir validación de variables de entorno al startup (ej. zod, joi)
- [ ] Documentar API con Swagger/OpenAPI
- [ ] Migrar admin token de localStorage a httpOnly cookie
- [ ] Activar y conectar ai-engine al backend
- [ ] Implementar las tablas de BD inactivas (interacciones, comensales, ingredientes)

### Fase 4 — Madurez (3+ meses)

- [ ] Separar panel de configuración de restaurante en microapp independiente
- [ ] Implementar CI/CD pipeline
- [ ] Añadir monitoreo (logs estructurados, alertas)
- [ ] Implementar sistema de pagos para gestión de planes
- [ ] Activar Feature Discovery Feed (Descubrir + CuestionarioIA)
