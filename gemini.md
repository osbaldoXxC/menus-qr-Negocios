[@osbaldoXxC] Tarea 5.1: Levantar Entorno Docker, DB, Redis (Rama: feature/5.1-entorno-docker | PR -> develop)
[@osbaldoXxC] Tarea 5.2: Esquema Relacional PostgreSQL (Rama: feature/5.2-esquema-db | PR -> develop)
[@osbaldoXxC] Tarea 5.3: Sistema de Auth y RBAC Node (Rama: feature/5.3-auth-rbac | PR -> develop)
[@osbaldoXxC] Tarea 6.1: API de Menús y AWS S3 Node (Rama: feature/6.1-api-menus | PR -> develop)
[@osbaldoXxC] Tarea 6.2: API Generador de QR Node (Rama: feature/6.2-api-qr | PR -> develop)
[@osbaldoXxC] Tarea 6.3: API Super Admin Bloqueo Node (Rama: feature/6.3-api-admin | PR -> develop)
[@osbaldoXxC] Tarea 6.4: API Menú Local Redis Node (Rama: feature/6.4-api-menu-redis | PR -> develop)
[@osbaldoXxC] Tarea 7.1: Microservicio Vectorizador Python (Rama: feature/7.1-ia-vectorizador | PR -> develop)
[@osbaldoXxC] Tarea 7.2: Motor de Recomendación IA Python (Rama: feature/7.2-ia-recomendacion | PR -> develop)
[@osbaldoXxC] Tarea 7.3: Endpoint de Interacciones Swipes (Rama: feature/7.3-api-interacciones | PR -> develop)


////
primer tarea Contexto:
Soy el Líder Técnico de un proyecto llamado MexxicanMX. Estoy trabajando en la "Tarea 5.1: Levantar Entorno Docker, DB, Redis". Necesito que me ayudes a crear la infraestructura base en contenedores.

Instrucciones:

Crea la siguiente estructura de carpetas en la raíz del proyecto (si no existen):

/frontend

/backend

/ai-engine

En la raíz del proyecto, crea un archivo docker-compose.yml que orqueste 5 servicios:

postgres: Usando la imagen ankane/pgvector:latest (puerto 5432, con volumen persistente postgres_data). Usuario: admin, Password: password123, BD: mexxicanmx_db.

redis: Usando la imagen redis:alpine (puerto 6379, volumen redis_data).

frontend: Construido desde ./frontend/Dockerfile.dev (puerto 3000, volumen apuntando a ./frontend). Depende de backend.

backend: Construido desde ./backend/Dockerfile.dev (puerto 4000, volumen apuntando a ./backend). Depende de postgres y redis.

ai-engine: Construido desde ./ai-engine/Dockerfile.dev (puerto 8000, volumen apuntando a ./ai-engine). Depende de postgres.

Todos deben estar en una red llamada app-network (driver bridge).

Crea el archivo frontend/Dockerfile.dev usando node:18-alpine. El comando CMD debe mantener el contenedor vivo si aún no existe un package.json (ej. usando tail -f /dev/null).

Crea el archivo backend/Dockerfile.dev usando node:18-alpine. Igual que el anterior, mantenlo vivo si no hay package.json.

Crea el archivo ai-engine/Dockerfile.dev usando python:3.10-slim. Mantenlo vivo si no existe requirements.txt.

Genera el código para estos 4 archivos de configuración.