---
name: harness-caching
description: >-
  Estrategias de almacenamiento en caché HTTP (ETag, 304 Not Modified, Cache-Control), Redis en memoria, invalidación sincrónica, prevención de cache stampede con jitter y locks. Activar al diseñar o auditar endpoints de lectura intensiva.
---

# Harness Caching - MexxicanMX

Skill de arquitectura y diseño de caché multinivel para optimizar el rendimiento y la consistencia de datos en MexxicanMX.

## Procedencia y Licencia
- **Origen:** Adaptado de `intense-visions/harness-engineering/agents/skills/claude-code/harness-caching`.
- **Licencia:** MIT.

## Niveles de Caché en MexxicanMX

### 1. Caché HTTP / CDN (CloudFront + Navegador)
- **Cabecera `ETag`:** Todo endpoint `GET` de catálogo o menú público debe generar un `ETag` basado en hash del contenido (o timestamp `updated_at`).
- **Respuesta `304 Not Modified`:** Si el cliente envía `If-None-Match: "<hash>"` y coincide con el estado actual, el servidor debe responder con `304` y cuerpo vacío.
- **Cabeceras `Cache-Control`:**
  - Menú público: `public, max-age=60, s-maxage=300, stale-while-revalidate=60`.
  - Rutas privadas de restaurante/admin: `private, no-cache, no-store, must-revalidate`.
- **Cabecera `Vary`:** Incluir `Vary: Origin, Accept-Encoding` para evitar contaminación de caché CORS entre dominios.

### 2. Caché de Aplicación en Servidor (Redis)
- **Llaves Estructuradas:** Convención de nombres unificada:
  - `menu:public:<restaurante_id>`
  - `restaurant:info:<restaurante_id>`
  - `categories:<restaurante_id>`
- **TTL con Jitter:** Almacenar con tiempo de vida limitado más una variación aleatoria (ej. 300s ± 30s) para evitar que todas las llaves expiren al mismo milisegundo.
- **Prevención de Cache Stampede:** Utilizar patrón *single-flight* o bloqueo distribuido (`SET NX EX`) al recalcular datos costosos tras la expiración de la caché.

### 3. Invalidación Inmediata y Consistencia
- **Regla de Oro:** Toda escritura (`POST`, `PATCH`, `DELETE`) en platillos, categorías o información del restaurante debe invalidar sincrónicamente las llaves asociadas en Redis dentro de la misma transacción lógica.
- **Prohibido:** Ventanas de tiempo donde comensales vean precios o disponibilidad obsoletos tras una actualización confirmada por el restaurante.

## Checklist de Decisión en Auditoría
- [ ] ¿El dato cambia con alta frecuencia o es de solo lectura?
- [ ] ¿El dato contiene información privada o es público? (Nunca cachear respuestas autenticadas bajo llaves públicas).
- [ ] ¿Cuál es la estrategia de invalidación al hacer un cambio?
- [ ] ¿Se utiliza `PATCH` para deltas en lugar de reescribir todo el recurso?
