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

Por cada uno se tiene que hacer un pr para deploy 
🗄️ ÉPICA 5: Infraestructura, DB y Seguridad

Tarea 5.1 & 5.2: Entorno Docker y Esquema de BD

(Tareas de configuración de infraestructura ya vistas: Levantar contenedores y crear tablas. El enfoque principal ahora son los Endpoints).

Tarea 5.3: Sistema de Auth y RBAC (Node.js)

A. Endpoint: Registro de Restaurante

Ruta: POST /api/auth/register

Request (Datos que recibes de Kevin):

{
  "nombre_negocio": "Tacos El Paisa",
  "email": "contacto@elpaisa.com",
  "password": "PasswordSeguro123!",
  "plan": "basico"
}


Lógica Interna:

Validar que el email no exista en la tabla Restaurantes.

Hashear el password usando bcrypt (ej. salt rounds 10).

Hacer INSERT INTO Restaurantes (id, nombre, email, password_hash, suscripcion_activa, rol) VALUES (...).

Response (Datos que devuelves):

{ "mensaje": "Registrado con éxito", "restaurante_id": "uuid..." }


B. Endpoint: Login (Seguridad de Tokens)

Ruta: POST /api/auth/login

Request:

{ "email": "contacto@elpaisa.com", "password": "PasswordSeguro123!" }


Lógica Interna (Crítica según Diagrama):

Buscar usuario por email.

Comparar bcrypt.compare(password, password_hash).

Si suscripcion_activa === false y el rol NO es Super_Admin, devolver 403 Forbidden (Módulo 7 del diagrama).

Generar Access Token (JWT firmado con caducidad de 15 minutos). Payload: { id, rol }.

Generar Refresh Token (JWT firmado con caducidad de 7 días). Payload: { id }.

Guardar el Refresh Token en la DB para poder revocarlo si es necesario.

Response:

Headers: Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict

Body (JSON):

{
  "access_token": "eyJhbG...",
  "rol": "Restaurante",
  "restaurante_id": "uuid..."
}


⚙️ ÉPICA 6: API Core (Node.js) - Controladores

Tarea 6.1: API de Menús y AWS S3 (Creación con IA)

Ruta: POST /api/menu/platillos

Headers: Authorization: Bearer <access_token>

Request (Datos que recibes):

{
  "nombre": "Tacos al Pastor",
  "descripcion": "Orden de 5 tacos con piña.",
  "precio": 120.50,
  "categoria": "Plato Fuerte",
  "url_imagen": "[https://s3.aws.com/tu-bucket/imagen.jpg](https://s3.aws.com/tu-bucket/imagen.jpg)",
  "ingredientes": ["uuid-ingr1", "uuid-ingr2"]
}


Lógica Interna:

Extraer restaurante_id desde el Access Token.

Iniciar una transacción SQL (Begin).

INSERT INTO Platillos obteniendo el platillo_id generado.

Iterar sobre ingredientes y hacer INSERT INTO Receta_Platillo (platillo_id, ingrediente_id).

Cerrar transacción (Commit).

El paso asíncrono (Diagrama Módulo 4): Sin hacer un await que bloquee la respuesta, enviar un HTTP request interno a tu contenedor de Python: POST http://ai-engine:8000/vectorize enviando { id_platillo, texto_descriptivo: nombre + descripcion + ingredientes }.

Invalidar Caché: redisClient.del('cache:menu:' + restaurante_id) y redisClient.del('cache:busquedas_globales').

Response:

{ "mensaje": "Platillo creado", "platillo_id": "uuid..." }


Tarea 6.2: API Generador de QR

Ruta: GET /api/restaurants/qr

Headers: Authorization: Bearer <access_token>

Request: Ninguno (el ID viene del token).

Lógica Interna:

Obtener restaurante_id del token.

Construir el string público: const url = "https://mexxican.mx/menu/" + restaurante_id.

Usar librería qrcode para generar una imagen Base64: const qrImage = await QRCode.toDataURL(url).

Response:

{ "url_menu": "https://...", "qr_base64": "data:image/png;base64,iVBORw0K..." }


Tarea 6.3: API Super Admin (Bloqueo y RBAC)

Ruta: PUT /api/admin/restaurants/:id/status

Headers: Authorization: Bearer <access_token> (Solo Super Admins).

Request:

{ "suscripcion_activa": false }


Lógica Interna (Diagrama Módulo 7):

Middleware: Validar que req.user.rol === 'Super_Admin'. Si no, 403 Forbidden.

Ejecutar UPDATE Restaurantes SET suscripcion_activa = $1 WHERE id = $2.

Limpieza Crítica de Redis: redisClient.del('cache:menu:' + req.params.id). (Esto garantiza que el restaurante desaparezca instantáneamente).

Response:

{ "mensaje": "Estado del restaurante actualizado y caché purgado." }


Tarea 6.4: API Menú Local con Caché Redis

Ruta: GET /api/menu/:restaurant_id

Request: restaurant_id en la URL.

Lógica Interna (Diagrama Módulo 5):

Definir clave: const cacheKey = 'cache:menu:' + req.params.restaurant_id.

const cachedMenu = await redisClient.get(cacheKey).

Hit: Si cachedMenu existe, retornarlo con JSON.parse().

Miss: Si es nulo, ejecutar SELECT * FROM Platillos WHERE restaurante_id = $1.

Validar que la tabla Restaurantes tenga suscripcion_activa = true. (Si es false, devolver error 403 "Restaurante no disponible").

Guardar en caché: redisClient.setEx(cacheKey, 14400, JSON.stringify(datosDB)) (Expira en 4 horas).

Response:

[
  { "id": "...", "nombre": "Tacos", "precio": 120, "url_imagen": "..." }
]


🧠 ÉPICA 7: Motor IA (Python / FastAPI)

Tarea 7.1: Microservicio Vectorizador

Ruta: POST /vectorize (Puerto 8000, interno, llamado por Node.js).

Request (Lo que manda Node.js):

{
  "id_platillo": "uuid...",
  "texto_descriptivo": "Tacos al Pastor Orden de 5 tacos con piña Cerdo Piña Cebolla"
}


Lógica Interna:

Recibir texto y llamar a la API de Google Gemini (o OpenAI Text-Embedding).

El LLM devuelve un arreglo matemático: [0.015, -0.022, 0.551, ...].

Conectarse a Postgres mediante psycopg2 o SQLAlchemy.

Ejecutar: UPDATE platillos SET vector_embedding = %s WHERE id = %s.

Response:

{ "status": "vector_actualizado" }


Tarea 7.2: Motor de Recomendación IA (El Cerebro)

Ruta: POST /api/search/matches (Expuesto al Frontend de Kevin)

Request (Datos del Cuestionario):

{
  "sabor_antojo": "Tengo ganas de algo muy picante y caldosito",
  "alergias_ids": ["uuid-mani", "uuid-mariscos"]
}


Lógica Interna (El algoritmo híbrido):

Node.js (Filtro Duro): Construir un Query SQL que excluya las alergias y verifique que el negocio haya pagado.
SELECT id FROM Platillos p JOIN Restaurantes r ON p.restaurante_id = r.id WHERE r.suscripcion_activa = true AND p.id NOT IN (SELECT platillo_id FROM Receta_Platillo WHERE ingrediente_id IN ($1, $2))

Node.js manda el sabor_antojo y la lista de IDs permitidos al servidor de Python.

Python (Filtro Vectorial): Convierte "Tengo ganas de algo muy picante..." a un Vector de Embedding.

Ejecutar consulta de Similitud del Coseno usando pgvector:
SELECT id, 1 - (vector_embedding <=> '[vector_del_usuario]') AS match_score FROM Platillos WHERE id IN (lista_ids_permitidos) ORDER BY match_score DESC LIMIT 15;

Python devuelve los IDs ordenados a Node.js.

Node.js consulta los detalles de esos IDs a Postgres (nombres, fotos, precios) para enviárselos a Kevin.

Response:

{
  "resultados": [
    {
      "platillo_id": "uuid...",
      "nombre": "Birria en Caldo",
      "precio": 150,
      "url_imagen": "https://...",
      "porcentaje_match": 98.5
    }
  ]
}


Tarea 7.3: Endpoint de Interacciones (Para entrenar la IA a futuro)

Ruta: POST /api/feed/interactions

Request (De los swipes de Kevin):

{
  "platillo_id": "uuid...",
  "tipo_accion": "SWIPE_DERECHA" 
}


Lógica Interna:

Obtener ID del comensal (ya sea por Token de usuario registrado o generar un ID anónimo vinculado al dispositivo/sesión).

Ejecutar INSERT INTO Interacciones_Feed (usuario_id, platillo_id, tipo_interaccion, fecha) VALUES (...).

Response:

{ "status": "registrado" }



Por cada uno se tiene que hacer un pr para deploy 