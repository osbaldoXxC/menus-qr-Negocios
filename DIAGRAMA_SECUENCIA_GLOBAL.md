# 🌐 Diagrama de Secuencia Global: Ecosistema MexxicanMX

Este diagrama representa el flujo completo de vida de la aplicación, desde que un restaurante se registra hasta que un comensal recibe recomendaciones inteligentes basadas en IA.

```mermaid
sequenceDiagram
    autonumber
    participant Rest as Restaurante (Frontend)
    participant Com as Comensal (App/Web)
    participant API as API Gateway (Node.js)
    participant Auth as Auth Service
    participant IA as AI Engine (Python)
    participant DB as PostgreSQL (pgvector)
    participant Redis as Cache (Redis)
    participant S3 as Storage (AWS S3)

    Note over Rest, DB: [FASE 1] Onboarding y Gestión
    Rest->>API: POST /api/auth/register (Datos + Plan)
    API->>DB: INSERT Restaurante
    API-->>Rest: 201 Created (ID Restaurante)

    Rest->>API: POST /api/menu/platillos (Foto + Ingredientes)
    API->>S3: Upload Imagen
    API->>DB: BEGIN Transaction: INSERT Platillo + Receta
    API->>DB: COMMIT
    API->>IA: POST /vectorize (Async: ID + Texto)
    IA->>IA: Gemini/OpenAI Embedding
    IA->>DB: UPDATE Platillo SET vector_embedding
    API->>Redis: DEL cache:menu:{id}
    API-->>Rest: 201 OK

    Note over Rest, API: [FASE 2] Generación de Acceso
    Rest->>API: GET /api/restaurants/qr
    API->>API: QRCode.toDataURL(URL_Publica)
    API-->>Rest: Imagen QR (Base64)

    Note over Com, DB: [FASE 3] Experiencia del Comensal
    Note right of Com: Escaneo de QR Local
    Com->>API: GET /api/menu/{id}
    API->>Redis: GET cache:menu:{id}
    alt Cache Miss
        API->>DB: SELECT Menu + Tema + Restaurante
        API->>Redis: SET cache:menu:{id}
    end
    API-->>Com: Menú Digital Personalizado (White-label)

    Note right of Com: Buscador Global IA (Discovery Feed)
    Com->>API: POST /api/search/matches (Antojo + Alergias)
    API->>DB: SELECT IDs permitidos (Filtro Alergias + Suscripción)
    API->>IA: Enviar Antojo + IDs Permitidos
    IA->>IA: Vectorize Antojo
    IA->>DB: SELECT Similarity Coseno (<=>) LIMIT 15
    IA-->>API: Lista IDs ordenados por Match
    API->>DB: SELECT Detalles Platillos (Nombres, Fotos)
    API-->>Com: Discovery Feed (Tarjetas estilo TikTok/Tinder)

    Note over Com, DB: [FASE 4] Feedback y Aprendizaje
    Com->>API: POST /api/feed/interactions (Swipe R/L)
    API->>DB: INSERT Interacciones_Feed
    API-->>Com: 200 OK
```

---

## 🗝️ Explicación de los Componentes Críticos

1.  **Auth Service (Nº 1-3):** Gestiona el acceso RBAC. Si un restaurante no tiene la suscripción activa (bloqueo por Super Admin), el acceso al menú devuelve un 403.
2.  **Vectorización Asíncrona (Nº 6-9):** Cuando se crea un platillo, la API de Node no espera a que la IA termine. Envía la respuesta al usuario y el proceso de IA ocurre en segundo plano para no bloquear la UX.
3.  **Algoritmo Híbrido de Búsqueda (Nº 16-21):** 
    *   **Filtro Duro (Node.js):** Seguridad alimentaria (alergias) y comercial (pago).
    *   **Filtro Semántico (Python/pgvector):** Encuentra el "antojo" exacto del usuario mediante matemáticas vectoriales.
4.  **Caché White-label (Nº 12-15):** El diseño personalizado (colores, fuentes) se sirve desde Redis para garantizar que la "primera impresión" del comensal sea instantánea.

---

## 🛠️ Tecnologías Involucradas
*   **Backend:** Node.js (Express), Python (FastAPI).
*   **Bases de Datos:** PostgreSQL con extensión `pgvector`, Redis Stack.
*   **Infraestructura:** Docker Compose, AWS S3.
*   **IA:** Modelos de Embedding (Google Gemini / OpenAI).
