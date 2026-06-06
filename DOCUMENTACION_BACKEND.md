# Documentación Técnica del Backend - MexxicanMX 🇲🇽

Este documento describe la arquitectura, componentes y flujos de trabajo del backend de MexxicanMX, un sistema SaaS diseñado para digitalizar menús de restaurantes y ofrecer recomendaciones personalizadas mediante Inteligencia Artificial.

---

## 1. Arquitectura del Sistema

MexxicanMX utiliza una **arquitectura de microservicios híbrida** contenida en Docker:

- **Core API (Node.js/Express):** Gestiona la lógica de negocio, autenticación, base de datos relacional y orquestación de servicios.
- **AI Engine (Python/FastAPI):** Encargado del procesamiento pesado de IA, generación de embeddings (vectores) y búsquedas semánticas.
- **PostgreSQL + pgvector:** Base de datos relacional con capacidades vectoriales.
- **Redis:** Capa de caché para alta disponibilidad del menú y búsquedas rápidas.

---

## 2. Stack Tecnológico

### Backend Principal (Core)
- **Runtime:** Node.js + Express
- **Autenticación:** JWT (Access & Refresh Tokens) + Cookies HttpOnly.
- **DB:** PostgreSQL (con extensión `pgvector`).
- **Caché:** Redis.
- **Almacenamiento:** AWS S3 (para imágenes de platillos).
- **Herramientas:** `bcryptjs` (seguridad), `multer` (archivos), `qrcode` (generación de QR).

### Motor de IA (AI Engine)
- **Framework:** FastAPI
- **Modelos:** Google Gemini API (Embeddings).
- **ORM:** SQLAlchemy + Psycopg2.
- **Búsqueda:** Búsqueda por similitud de coseno en `pgvector`.

---

## 3. Flujos Críticos de Funcionamiento

### A. Autenticación y RBAC (Role-Based Access Control)
El sistema utiliza un esquema de seguridad de dos niveles:
1.  **Access Token (JWT):** Corta duración (15 min), viaja en el Header Authorization.
2.  **Refresh Token (JWT):** Larga duración (7 días), almacenado en la base de datos y enviado vía **Cookie HttpOnly** para prevenir ataques XSS.
3.  **Roles:** `Super_Admin` (gestión global) y `Restaurante` (gestión de catálogo propio).

### B. Ciclo de Vida del Menú (IA Pipeline)
Cuando un restaurante registra un platillo:
1.  **Node.js** guarda los datos básicos en Postgres (Transacción atómica).
2.  **Node.js** dispara una petición asíncrona (sin bloquear al usuario) al **AI Engine**.
3.  **AI Engine** toma el nombre, descripción e ingredientes, y solicita un **Embedding** a la IA de Google.
4.  El vector resultante se guarda en la tabla `platillos` para futuras búsquedas.
5.  **Invalidación de Caché:** Se purga la clave de Redis correspondiente para que el cliente vea el cambio al instante.

### C. Motor de Recomendación (Discovery Feed)
Es el "Cerebro" que alimenta el feed estilo TikTok:
1.  **Filtro Duro (Node.js):** Descarta platillos con ingredientes alérgenos marcados por el usuario y aquellos de restaurantes sin suscripción activa.
2.  **Filtro Semántico (Python):** Convierte el "antojo" del usuario (ej: *"algo picante y con queso"*) en un vector.
3.  **Matchmaking:** Realiza una búsqueda de similitud de coseno en Postgres comparando el vector del antojo con los vectores de los platillos permitidos.
4.  **Resultado:** Devuelve una lista ordenada por porcentaje de "Match".

---

## 4. Estrategia de Caché (Redis)

Para garantizar que el sistema soporte miles de lecturas simultáneas:
- **Cache-Aside Pattern:** Antes de consultar la DB para un menú, el sistema busca en Redis.
- **TTL (Time To Live):** Los menús se guardan por 4 horas (14,400 segundos).
- **Purga Selectiva:** Cuando un Admin bloquea un restaurante o el dueño edita un platillo, la caché de ese restaurante se elimina inmediatamente.

---

## 5. Infraestructura y Docker

El proyecto se despliega mediante `docker-compose.yml`, orquestando 4 servicios clave:
- `backend`: API Node.js (Puerto 4000).
- `ai-engine`: Microservicio Python (Puerto 8000).
- `db`: PostgreSQL (Puerto 5432).
- `redis`: Redis Cache (Puerto 6379).

---

## 6. Seguridad y Buenas Prácticas

- **Cifrado:** Contraseñas hasheadas con `bcrypt` (10 salt rounds).
- **Protección de Datos:** Las imágenes se procesan con `sharp` antes de subir a S3 para optimizar tamaño y eliminar metadatos sensibles.
- **Aislamiento:** El microservicio de IA solo es accesible internamente por el contenedor de Node.js.
- **Suscripción:** Se verifica el estado de `suscripcion_activa` en cada login y cada consulta de menú.
