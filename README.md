# 🌮 MexxicanMX — Motor de Descubrimiento Gastronómico con IA

> Plataforma SaaS que conecta restaurantes con sus comensales ideales a través de un motor de recomendación impulsado por Inteligencia Artificial y una experiencia de usuario inmersiva (estilo TikTok/Tinder).

---

## 🚀 Descripción del Proyecto

MexxicanMX resuelve el problema de la **"fatiga de decisión"** al momento de elegir dónde y qué comer. El sistema se divide en dos grandes experiencias:

- **Para Restaurantes (SaaS):** Un panel administrativo donde digitalizan sus menús, especifican ingredientes, gestionan alérgenos y generan códigos QR para sus sucursales.
- **Para Comensales (App):** Un *Discovery Feed* global donde, tras un breve cuestionario de preferencias (sabor, alergias, dieta), la IA recomienda platillos específicos uno por uno en formato visual, aprendiendo de sus *swipes* y *likes*.

---

## 🛠 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React.js / Next.js + Tailwind CSS |
| **Backend Core API** | Node.js (Express / NestJS) |
| **Motor de IA** | Python (FastAPI) + LLMs (Gemini/OpenAI) |
| **Base de Datos** | PostgreSQL + `pgvector` |
| **Caché** | Redis |
| **Almacenamiento** | Amazon S3 |
| **Infraestructura** | Docker & Docker Compose / AWS EC2 |

---

## 🏗 Arquitectura y Módulos Principales

El desarrollo está segmentado en **7 flujos principales**:

1. **Registro y Onboarding SaaS** — Creación de cuentas para dueños de restaurantes.
2. **Autenticación (Identity & RBAC)** — Access Tokens (Memoria) y Refresh Tokens (Secure Storage/Cookies). Roles: `Super_Admin`, `Restaurante`, `Comensal`.
3. **Gestión de Sucursal** — Generación de códigos QR para mesas/establecimientos.
4. **Constructor de Menú IA** — Alta de platillos, carga de fotos a S3 y vectorización automática en segundo plano.
5. **Menú QR Local** — Lectura simple y ultra rápida (apoyada en Redis) para el comensal en el restaurante.
6. **Discovery Feed e IA (Global)** — Filtros duros SQL (alergias/pagos) + Filtros Vectoriales IA (sabor/antojo) en interfaz tipo Tinder.
7. **Panel Super Admin** — Control de facturación y bloqueo de restaurantes morosos (invalida tokens y caché instantáneamente).

> Consulta el [Diagrama de Secuencia] para entender el flujo de datos exacto.

---

## 💻 Entorno de Desarrollo Local

### Prerrequisitos

- Node.js (v18+)
- Python (v3.10+)
- Docker y Docker Compose
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/osbaldoXxC/menus-qr-Negocios.git
cd menus-qr-Negocios
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Abre el archivo `.env` y agrega tus credenciales locales.

### 3. Levantar infraestructura base (DB & Redis)

```bash
docker-compose up -d
```

### 4. Levantar los servicios

Ejecuta cada servicio en una terminal separada:

**A. Backend Node.js**

```bash
cd backend
npm install
npm run dev
```

**B. Motor IA (Python)**

```bash
cd ai-engine
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**C. Frontend React**

```bash
cd frontend
npm install
npm run dev
```

---

## 🤝 Guía de Contribución

Utilizamos **Git Flow**. Sigue estas reglas estrictamente.

### Flujo de Ramas

| Rama | Propósito |
|---|---|
| `main` | Producción. Código 100% estable. **Nunca commit directo.** |
| `develop` | Integración. Rama principal de desarrollo. |
| `feature/nombre-tarea` | Nuevas funcionalidades. Se crean desde `develop` y se fusionan en `develop`. |
| `release/vX.X.X` | Preparación de versión. Se fusiona en `main` y `develop`. |
| `hotfix/descripcion-error` | Correcciones urgentes en producción. Se fusiona en `main` y `develop`. |

### Conventional Commits

```
feat: añade constructor de menú
fix: corrige validación de token en redis
docs: actualiza diagrama de arquitectura
```

### Pull Requests

Todo código nuevo debe enviarse mediante un **Pull Request** hacia `develop`. Se requiere al menos **una revisión (Code Review)** antes de fusionar.

---

Hecho con 🌶️ por el equipo de **MexxicanMX**
