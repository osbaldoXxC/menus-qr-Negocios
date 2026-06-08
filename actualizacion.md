# Reporte de Estado del Proyecto: MexxicanMX
**Fecha de actualización:** Sábado, 6 de Junio de 2026

Este documento constituye la fuente oficial de verdad sobre el progreso técnico del proyecto MexxicanMX, reflejando la infraestructura y el backend core totalmente operativos tras completar las Épicas 5 y 6.

---

## 1. Infraestructura y Despliegue (Docker) ✅
El sistema se encuentra totalmente contenedorizado mediante **Docker Compose**, lo que garantiza un entorno escalable, reproducible y con paridad total entre desarrollo y producción.

*   **Servicios en Ejecución:**
    *   **Backend:** Node.js (Express) - API principal y lógica de negocio.
    *   **Database:** PostgreSQL 16 + Extensión `pgvector` (Habilitada para búsqueda semántica).
    *   **Caché:** Redis Alpine - Optimización de menús públicos y sesiones.
    *   **AI Engine:** FastAPI (Python) - Microservicio de vectorización y recomendación.
    *   **Frontend:** Vite + React + TypeScript - Entorno base configurado.

---

## 2. Esquema de Base de Datos (Implementado en PostgreSQL) ✅
Estructura normalizada y optimizada para multi-tenancy, seguridad avanzada y búsqueda por IA. Se han estandarizado los roles a MAYÚSCULAS para mayor consistencia.

*   **Tablas Core:**
    *   **`restaurantes`**: Gestión de socios, planes, roles (`RESTAURANTE`, `SUPER_ADMIN`) y suscripciones.
    *   **`refresh_tokens`**: Persistencia de sesiones seguras mediante tokens persistidos en base de datos.
    *   **`platillos`**: Catálogo con soporte para fotos en S3 y vectores de IA (768 dimensiones).
    *   **`ingredientes`**: Diccionario global para gestión de alérgenos y filtros de salud.
    *   **`platillo_ingredientes`**: Relación muchos-a-muchos para recetas detalladas.
    *   **`interacciones`**: Registro de actividad del comensal (Swipes) listo para el motor de recomendaciones.

---

## 3. Funcionalidades del Backend (Épicas 5 y 6) ✅

### 🔐 Seguridad e Identidad (Auth & RBAC)
*   **Registro y Login:** Flujo completo con hasheo de contraseñas (`bcrypt`).
*   **Tokens Duales:** Implementación de **Access Token (JWT)** para peticiones y **Refresh Token** (Cookie `HttpOnly` + persistencia en DB) para sesiones prolongadas.
*   **RBAC:** Control de acceso estricto basado en roles estandarizados.

### 🖼️ Gestión de Menús e Imágenes (AWS S3 + Sharp)
*   **Pipeline de Optimización:** Middleware que usa `Sharp` para convertir imágenes a **WebP**, redimensionar y comprimir (~30KB) automáticamente antes de subir a **AWS S3**.
*   **Consistencia:** Transacciones SQL atómicas para la creación de platillos e ingredientes.

### 📱 Experiencia del Comensal y QR
*   **Generador de QR:** Creación dinámica de códigos QR en Base64 vinculados a la URL única del menú.
*   **Rendimiento Extremo (Redis):** Menús públicos servidos desde caché con estrategia *Cache-Aside* (4h TTL), logrando tiempos de respuesta de <50ms.

### 🛡️ Administración (Super Admin)
*   **Control Global:** Endpoint funcional para bloqueo instantáneo de restaurantes.
*   **Purga de Caché:** Invalidez inmediata del menú en Redis al desactivar un negocio para cese de servicio en tiempo real.

---

## 4. Estado de la Inteligencia Artificial (En Pausa) ⏳
*   **Estatus Técnico:** La infraestructura técnica está completada (Motor en Python + pgvector).
*   **Acción:** La integración activa en el flujo de Node.js se mantiene pausada por decisión estratégica, permitiendo que el sistema opere como un catálogo digital robusto de forma independiente.

---
**MexxicanMX - El futuro de la comida a un swipe de distancia.**
