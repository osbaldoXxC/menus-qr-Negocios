🔌 Documentación Completa de la API (MexxicanMX)

Este documento define la estructura de datos (JSON) para las peticiones (Requests) y respuestas (Responses) de todos los endpoints del sistema, alineado al 100% con el Diagrama de Secuencia y Arquitectura.

URL Base (Desarrollo): http://localhost:4000/api

👤 Módulo 1 y 2: Autenticación (Auth & RBAC)

1. Registro de Restaurante

Endpoint: POST /auth/register

Descripción: Crea la cuenta del dueño del restaurante.

Request Body:

{
  "nombre_dueño": "Juan Pérez",
  "email": "juan@tacoselpaisa.com",
  "password": "Password123!",
  "nombre_negocio": "Tacos El Paisa"
}


Response (201 Created):

{
  "mensaje": "Restaurante registrado exitosamente",
  "restaurante_id": "uuid-1234"
}


2. Login General (Web)

Endpoint: POST /auth/login

Descripción: Inicia sesión. Autentica las credenciales y devuelve el JWT y el Rol.

Request Body:

{
  "email": "juan@tacoselpaisa.com",
  "password": "Password123!"
}


Response (200 OK):

{
  "mensaje": "Login exitoso",
  "access_token": "eyJhbGciOiJIUz...", 
  "rol": "Restaurante", 
  "restaurante_id": "uuid-1234"
}


(Nota: El refresh_token debe ser devuelto automáticamente por el backend en una cookie HTTP-Only).

🍽️ Módulo 3: Panel SaaS Restaurantes

3. Generar Código QR de Sucursal

Endpoint: GET /restaurants/qr

Headers: Authorization: Bearer <access_token>

Descripción: Devuelve un hash o enlace único para la sucursal del restaurante logueado.

Response (200 OK):

{
  "url_menu_local": "https://mexxican.mx/menu/local/uuid-1234",
  "qr_base64": "data:image/png;base64,iVBORw0KGgo..."
}


4. Crear Nuevo Platillo (Constructor de Menú IA)

Endpoint: POST /menu/platillos

Headers: Authorization: Bearer <access_token>

Descripción: Guarda el platillo en la BD relacional y dispara la vectorización asíncrona hacia el motor de Python.

Request Body:

{
  "nombre": "Tacos al Pastor",
  "descripcion": "Orden de 5 tacos con piña, cebolla y cilantro.",
  "precio": 120.50,
  "categoria": "Plato Fuerte",
  "url_imagen": "https://s3.aws.com/mexxicanmx/tacos.jpg",
  "ingredientes": ["Cerdo", "Piña", "Cebolla", "Cilantro", "Tortilla de Maíz"],
  "etiquetas": ["Picante", "Sin Lácteos"]
}


Response (201 Created):

{
  "mensaje": "Platillo creado y enviado a vectorización",
  "platillo_id": "uuid-9876",
  "estado_ia": "procesando"
}


📱 Módulo 4: App Comensales

5. Obtener Menú Local (QR)

Endpoint: GET /menu/local/:restaurante_id

Descripción: Lectura rápida del menú de un restaurante específico. (Debe consultar Redis primero).

Response (200 OK):

{
  "restaurante_nombre": "Tacos El Paisa",
  "categorias": [
    {
      "nombre": "Plato Fuerte",
      "platillos": [
        {
          "id": "uuid-9876",
          "nombre": "Tacos al Pastor",
          "precio": 120.50,
          "descripcion": "Orden de 5 tacos...",
          "url_imagen": "https://s3..."
        }
      ]
    }
  ]
}


6. Búsqueda Global (Motor IA - Discovery Feed)

Endpoint: POST /search/matches

Descripción: Recibe las respuestas del cuestionario y devuelve las tarjetas de platillos recomendados. (Node llama a Python internamente).

Request Body (Respuestas del Cuestionario):

{
  "sabor_antojo": "Quiero algo caldosito y muy picante para revivir",
  "dieta": "ninguna",
  "alergias": ["cacahuate", "camarón"],
  "ocasion": "Solo"
}


Response (200 OK - Array de Tarjetas):

{
  "resultados": [
    {
      "platillo_id": "uuid-abc1",
      "nombre": "Pozole Rojo Especial",
      "restaurante_nombre": "La Casa de Toño",
      "precio": 150.00,
      "url_imagen": "https://...",
      "porcentaje_match": 98,
      "motivo_match": "Contiene caldo y chile de árbol. Sin cacahuate."
    },
    {
      "platillo_id": "uuid-abc2",
      "nombre": "Birria en Caldo",
      "restaurante_nombre": "Birrieria Tijuana",
      "precio": 180.00,
      "url_imagen": "https://...",
      "porcentaje_match": 85,
      "motivo_match": "Caldo caliente y especiado."
    }
  ]
}


7. Registrar Interacción (Swipes)

Endpoint: POST /feed/interactions

Descripción: Registra si al usuario le gustó (Swipe Derecho) o no el platillo.

Request Body:

{
  "platillo_id": "uuid-abc1",
  "accion": "like" 
}


Response (201 Created):

{
  "mensaje": "Interacción guardada"
}


👑 Módulo 5: Súper Admin

8. Listar Todos los Restaurantes

Endpoint: GET /admin/restaurants

Headers: Authorization: Bearer <access_token_admin>

Response (200 OK):

[
  {
    "id": "uuid-1234",
    "nombre_negocio": "Tacos El Paisa",
    "email": "juan@tacoselpaisa.com",
    "estado": "activo",
    "ultimo_pago": "2026-05-10"
  }
]


9. Bloquear/Desbloquear Restaurante (Status)

Endpoint: PUT /admin/restaurants/:id/status

Headers: Authorization: Bearer <access_token_admin>

Descripción: Cambia el estado del restaurante (ej. por falta de pago) e invalida su menú en Redis.

Request Body:

{
  "estado_activo": false,
  "motivo": "Pago atrasado"
}


Response (200 OK):

{
  "mensaje": "Restaurante bloqueado. Caché invalidado."
}
