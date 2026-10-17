---
name: async-processing-patterns
description: >-
  Patrones de colas de mensajes y procesamiento asíncrono para tareas tolerantes a latencia: idempotencia, reintentos con exponential backoff, jitter, dead-letter queues y transactional outbox en MexxicanMX. Activar al diseñar workers o tareas en segundo plano.
---

# Async Processing Patterns - MexxicanMX

Skill para el diseño y operación de flujos de trabajo asíncronos y desacoplados en el backend de MexxicanMX.

## Procedencia y Licencia
- **Origen:** Adaptado de `marquesfelip/agents-and-skills/skills/async-processing-patterns`.
- **Licencia:** MIT.

## Criterio de Selección: ¿Síncrono o Asíncrono?

| Tarea | Modo | Justificación |
| :--- | :---: | :--- |
| **Login / Emisión de Tokens** | **Síncrono** | El usuario requiere el token inmediatamente para continuar. |
| **Consulta de Menú Digital** | **Síncrono** | El comensal necesita visualizar los platillos en tiempo real. |
| **Envío de Correo OTP / Verificación** | **Asíncrono** | Tolera retraso de segundos; no debe bloquear la respuesta HTTP. |
| **Optimización / Compresión de Fotos S3** | **Asíncrono** | Tarea pesada de CPU/E-S; se notifica al completar o se genera WebP en worker. |
| **Generación de Reportes / Métricas** | **Asíncrono** | Procesamiento analítico pesado que impactaría el event-loop de Node. |

## Principios y Patrones Requeridos

### 1. Idempotencia Obligatoria
- Los mensajes deben incluir un identificador único de operación (`idempotency_key` o `message_id`).
- El worker debe verificar en Redis o base de datos si el mensaje ya fue procesado antes de ejecutar efectos secundarios (evita cobros o correos duplicados).

### 2. Política de Reintentos
- Reintentos con **Exponential Backoff** y **Jitter** para evitar tormentas sobre bases de datos o servicios externos:
  $$\text{delay} = \min(\text{max\_delay}, \text{base\_delay} \times 2^{\text{attempt}}) \pm \text{jitter}$$
- Límite máximo de reintentos (ej. 3 a 5 intentos).

### 3. Dead-Letter Queue (DLQ)
- Todo mensaje que supere el número máximo de reintentos fallidos debe moverse a una cola de mensajes muertos (DLQ) con el detalle del error y stack trace para auditoría.

### 4. Patrón Transactional Outbox
- Si una operación de PostgreSQL debe disparar un evento asíncrono de forma confiable, registrar el evento en una tabla `outbox` dentro de la misma transacción de base de datos antes de publicarlo.
