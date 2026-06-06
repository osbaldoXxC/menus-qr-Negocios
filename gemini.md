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
Aquí está el documento actualizado con la sección de verificación añadida a cada tarea:Listo. A cada tarea le agregué una sección verde **"✅ Verificar antes del PR"** con pruebas específicas a su lógica. El tablero es interactivo — puedes expandir o colapsar cada épica y cada tarea.

En resumen, las verificaciones cubren:

- **5.1** — que todos los contenedores estén healthy y los servicios se comuniquen entre sí
- **5.2** — migración idempotente, pgvector activo, integridad referencial
- **5.3** — flujo completo de registro/login, tokens bien firmados, cookie HttpOnly, bloqueo por suscripción
- **6.1** — transacción atómica, rollback correcto, vectorizador recibe la llamada, caché invalidado
- **6.2** — QR scaneable con celular real, URL correcta
- **6.3** — bloqueo instantáneo (caché purgado), RBAC funcional
- **6.4** — hit/miss de caché medible en logs, TTL verificado
- **7.1** — vector guardado en DB con dimensiones correctas, manejo de errores
- **7.2** — resultados semánticamente coherentes, filtros de alergias y suscripción funcionando
- **7.3** — swipes anónimos y autenticados, sin condiciones de carrera
Tareas Backend — Mexxican
@osbaldoXxC · Cada tarea requiere PR a develop + PR a deploy · Verificar funcionamiento antes de hacer el PR

5.1
Levantar Entorno Docker, DB, Redis
feature/5.1-entorno-docker
▶
Descripción
Levantar contenedores Docker: Node.js, PostgreSQL, Redis, Python AI Engine
Configurar variables de entorno y red interna
Verificar conectividad entre servicios
✅ Verificar antes del PR
Ejecutar docker-compose up sin errores
Confirmar que todos los contenedores aparecen como healthy con docker ps
Probar conexión a PostgreSQL desde el contenedor Node: pg_isready
Probar conexión a Redis: redis-cli ping responde PONG
Confirmar que el contenedor Python (ai-engine) responde en el puerto 8000
Hacer docker-compose down && docker-compose up para asegurar idempotencia
PR: feature/5.1-entorno-docker → develop · luego PR a deploy
5.2
Esquema Relacional PostgreSQL
feature/5.2-esquema-db
▶
Descripción
Crear tablas: Restaurantes, Platillos, Ingredientes, Receta_Platillo, Interacciones_Feed
Habilitar extensión pgvector para columna vector_embedding
Crear índices necesarios
✅ Verificar antes del PR
Ejecutar el script de migración completo desde cero en una DB limpia sin errores
Conectarse a la DB y listar tablas: \dt — deben aparecer todas las tablas esperadas
Verificar que la extensión pgvector está activa: SELECT * FROM pg_extension WHERE extname='vector'
Insertar un registro de prueba en Restaurantes y luego eliminarlo
Confirmar que las claves foráneas funcionan (intentar insertar en Platillos con un restaurante_id inexistente debe fallar)
PR: feature/5.2-esquema-db → develop · luego PR a deploy
5.3
Sistema de Auth y RBAC
feature/5.3-auth-rbac
▶
Endpoint A — Registro
POST /api/auth/register
{
  "nombre_negocio": "Tacos El Paisa",
  "email": "contacto@elpaisa.com",
  "password": "PasswordSeguro123!",
  "plan": "basico"
}
Lógica registro
Validar email único en tabla Restaurantes
Hashear password con bcrypt (salt rounds: 10)
INSERT INTO Restaurantes con UUID generado
Retornar { mensaje, restaurante_id }
Endpoint B — Login
POST /api/auth/login
{
  "email": "contacto@elpaisa.com",
  "password": "PasswordSeguro123!"
}
Lógica login (crítica)
Buscar usuario por email → comparar con bcrypt.compare()
Si suscripcion_activa === false y rol ≠ Super_Admin → 403 Forbidden
Generar Access Token JWT (15 min) con payload { id, rol }
Generar Refresh Token JWT (7 días) con payload { id }
Guardar Refresh Token en DB para revocación
Responder con header Set-Cookie: refreshToken; HttpOnly; Secure; SameSite=Strict
✅ Verificar antes del PR
Registrar un restaurante nuevo → debe devolver 201 con el restaurante_id
Intentar registrar el mismo email de nuevo → debe devolver 409 Conflict
Hacer login con credenciales correctas → debe devolver access_token y cookie refreshToken
Hacer login con password incorrecto → debe devolver 401 Unauthorized
Desactivar suscripcion_activa del restaurante y volver a hacer login → debe devolver 403 Forbidden
Decodificar el access_token (ej. en jwt.io) y verificar que tiene id y rol correctos y expira en 15 min
Confirmar que el Refresh Token quedó guardado en la DB
Verificar que la cookie se setea como HttpOnly revisando headers de respuesta
PR: feature/5.3-auth-rbac → develop · luego PR a deploy
6.1
API de Menús y AWS S3
feature/6.1-api-menus
▶
Endpoint
POST /api/menu/platillos  ·  Authorization: Bearer <token>
Lógica
Extraer restaurante_id del Access Token
Transacción SQL: INSERT en Platillos → INSERT en Receta_Platillo por cada ingrediente
Sin bloquear respuesta: HTTP POST a http://ai-engine:8000/vectorize con { id_platillo, texto_descriptivo }
Invalidar caché Redis: cache:menu:{restaurante_id} y cache:busquedas_globales
✅ Verificar antes del PR
Crear un platillo con token válido → debe devolver 201 con el platillo_id
Intentar crear un platillo sin token o con token inválido → debe devolver 401
Verificar en la DB que el platillo fue insertado en Platillos
Verificar en la DB que los registros de Receta_Platillo se crearon correctamente
Confirmar que si la transacción falla a mitad (ej. ingrediente_id inválido), se hace rollback y no queda platillo huérfano
Revisar logs del contenedor Python (ai-engine) para confirmar que recibió la solicitud de vectorización
Verificar en Redis que las claves de caché fueron eliminadas: redis-cli EXISTS cache:menu:{id} → 0
Si aplica: subir una imagen a S3 y confirmar que la URL queda guardada en el platillo
PR: feature/6.1-api-menus → develop · luego PR a deploy
6.2
API Generador de QR
feature/6.2-api-qr
▶
Endpoint
GET /api/restaurants/qr  ·  Authorization: Bearer <token>
Lógica
Obtener restaurante_id del token
Construir URL pública: https://mexxican.mx/menu/{restaurante_id}
Generar imagen Base64 con librería qrcode
✅ Verificar antes del PR
Llamar al endpoint con token válido → respuesta con url_menu y qr_base64
Pegar el valor de qr_base64 en un browser (data:image/png;base64,...) y confirmar que la imagen se ve correctamente
Escanear el QR generado con un celular → debe abrir https://mexxican.mx/menu/{id}
Intentar sin token → debe devolver 401
PR: feature/6.2-api-qr → develop · luego PR a deploy
6.3
API Super Admin — Bloqueo y RBAC
feature/6.3-api-admin
▶
Endpoint
PUT /api/admin/restaurants/:id/status  ·  Solo Super_Admin
{ "suscripcion_activa": false }
Lógica
Middleware: verificar req.user.rol === 'Super_Admin', si no → 403
UPDATE en Restaurantes con el nuevo status
Purgar caché Redis: cache:menu:{id}
✅ Verificar antes del PR
Llamar con token de Super_Admin → debe actualizar y responder 200 con mensaje de confirmación
Llamar con token de rol Restaurante → debe devolver 403 Forbidden
Llamar sin token → debe devolver 401
Verificar en la DB que suscripcion_activa cambió correctamente
Confirmar en Redis que la clave cache:menu:{id} fue eliminada inmediatamente tras el bloqueo
Intentar obtener el menú del restaurante bloqueado vía GET /api/menu/:id → debe devolver 403 "Restaurante no disponible"
PR: feature/6.3-api-admin → develop · luego PR a deploy
6.4
API Menú Local con Caché Redis
feature/6.4-api-menu-redis
▶
Endpoint
GET /api/menu/:restaurant_id  ·  Público
Lógica (Cache-Aside)
Buscar en Redis con clave cache:menu:{restaurant_id}
Cache hit → retornar JSON parseado directamente
Cache miss → consultar Platillos en Postgres
Validar suscripcion_activa === true, si no → 403
Guardar en Redis con TTL de 4 horas (setEx(..., 14400, ...))
✅ Verificar antes del PR
Primera petición (cache miss): debe consultar Postgres y devolver el menú correctamente
Verificar en Redis que la clave cache:menu:{id} ahora existe con un TTL cercano a 14400s
Segunda petición (cache hit): debe devolver el mismo menú — confirmar en logs que NO se hizo consulta a Postgres
Medir tiempos: la respuesta en cache hit debe ser notablemente más rápida que el miss
Solicitar menú de restaurante con suscripcion_activa = false → debe devolver 403
Solicitar menú de restaurant_id inexistente → debe manejar el error con gracia (404 o array vacío, según diseño)
PR: feature/6.4-api-menu-redis → develop · luego PR a deploy
7.1
Microservicio Vectorizador
feature/7.1-ia-vectorizador
▶
Endpoint (interno)
POST /vectorize  ·  Puerto 8000, llamado por Node.js
{
  "id_platillo": "uuid...",
  "texto_descriptivo": "Tacos al Pastor Orden de 5 tacos..."
}
Lógica
Llamar API de Google Gemini (o OpenAI Embeddings) con el texto
Recibir vector de embedding: [0.015, -0.022, 0.551, ...]
Conectar a Postgres con psycopg2 / SQLAlchemy
UPDATE platillos SET vector_embedding = %s WHERE id = %s
✅ Verificar antes del PR
Llamar al endpoint directamente con curl o Postman y confirmar respuesta { "status": "vector_actualizado" }
Verificar en la DB que la columna vector_embedding del platillo ya no está nula y tiene el arreglo correcto
Confirmar que el vector tiene la dimensión esperada según el modelo de embeddings usado (ej. 768 o 1536 dimensiones)
Probar con un texto largo y uno corto — ambos deben vectorizarse sin error
Simular la llamada desde el contenedor Node (http://ai-engine:8000/vectorize) y revisar logs de Python para confirmar conectividad interna
Verificar manejo de error: ¿qué pasa si el id_platillo no existe en la DB? Debe devolver un error claro, no un 500 genérico
PR: feature/7.1-ia-vectorizador → develop · luego PR a deploy
7.2
Motor de Recomendación IA
feature/7.2-ia-recomendacion
▶
Endpoint (expuesto al frontend)
POST /api/search/matches
{
  "sabor_antojo": "Tengo ganas de algo muy picante y caldosito",
  "alergias_ids": ["uuid-mani", "uuid-mariscos"]
}
Algoritmo híbrido
Node: filtro duro SQL excluyendo alergias y restaurantes con suscripcion_activa = false
Node → Python: enviar antojo + IDs permitidos
Python: convertir antojo a vector embedding
Python: consulta de similitud coseno con pgvector (<=>) sobre los IDs permitidos, LIMIT 15
Python → Node: IDs ordenados por match_score
Node: consultar detalles (nombre, foto, precio) y devolver al frontend
✅ Verificar antes del PR
Enviar una búsqueda con antojo claro (ej. "algo dulce") — los resultados devueltos deben ser coherentes semánticamente
Verificar que platillos con ingredientes alérgenos listados NO aparezcan en los resultados
Verificar que platillos de restaurantes con suscripcion_activa = false NO aparezcan
Confirmar que la respuesta incluye platillo_id, nombre, precio, url_imagen y porcentaje_match
Probar con todas las alergias posibles (caso extremo: que no quede ningún platillo permitido) → debe devolver array vacío sin errores
Revisar logs de Python para confirmar que la consulta pgvector se ejecuta y devuelve resultados ordenados
Medir tiempo de respuesta total — debe ser aceptable para UX (idealmente < 2 segundos)
PR: feature/7.2-ia-recomendacion → develop · luego PR a deploy
7.3
Endpoint de Interacciones (Swipes)
feature/7.3-api-interacciones
▶
Endpoint
POST /api/feed/interactions
{
  "platillo_id": "uuid...",
  "tipo_accion": "SWIPE_DERECHA"
}
Lógica
Obtener ID del comensal desde token JWT, o generar ID anónimo por dispositivo/sesión
INSERT INTO Interacciones_Feed (usuario_id, platillo_id, tipo_interaccion, fecha)
✅ Verificar antes del PR
Registrar un swipe derecho con usuario autenticado → responder { "status": "registrado" }
Registrar un swipe izquierdo → también debe registrarse correctamente
Verificar en la DB que el registro aparece en Interacciones_Feed con todos los campos: usuario_id, platillo_id, tipo_interaccion, fecha
Probar sin token (usuario anónimo) → debe generar y usar un ID anónimo de sesión, no fallar
Enviar un platillo_id inexistente → debe manejar el error correctamente (no romper la DB)
Enviar un tipo_accion inválido (ej. "CLICK") → validar y devolver error descriptivo
Hacer 10 swipes rápidos seguidos → verificar que todos se registraron y no hay condiciones de carrera
PR: feature/7.3-api-interacciones → develop · luego PR a deploy