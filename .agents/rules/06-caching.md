# 06 - Estrategia de Caché e Invalidación

## 1. Caché HTTP y Optimización de Ancho de Banda
- **Respuestas GET con ETag:** Toda lectura de recursos de alta demanda (menú público, categorías, información del restaurante) debe incluir una cabecera `ETag` generada a partir de un hash del recurso.
- **Validación Condicional (`If-None-Match`):** El cliente envía la cabecera `If-None-Match` en solicitudes subsecuentes. Si el hash coincide, el backend responde inmediatamente con código `304 Not Modified` sin cuerpo (body), ahorrando ancho de banda y carga computacional.
- **`If-Modified-Since`:** Reservado únicamente para recursos donde el cálculo de un hash sea costoso y se disponga de un timestamp confiable de última modificación.

## 2. Actualizaciones Parciales (`PATCH` vs `PUT`)
- Las modificaciones a recursos existentes deben utilizar el verbo HTTP `PATCH` para transmitir deltas (solo los campos que cambiaron).
- Evitar `PUT` cuando implique el reenvío innecesario del payload completo del recurso.

## 3. Invalidación Atómica en Redis
- Toda operación de escritura (`POST`, `PATCH`, `DELETE`) que altere un recurso cacheado debe invalidar de manera inmediata y sincrónica la llave correspondiente en Redis dentro de la misma transacción lógica.
- **Prohibido:** Dejar ventanas de tiempo donde se sirvan datos obsoletos luego de una escritura confirmada en la base de datos.

## 4. Protección contra Cache Stampede
- En recursos de lectura masiva (como el menú público de un restaurante concurrido), implementar técnicas de bloqueo atómico (*single-flight / distributed locking*) o TTL con variación aleatoria (*jitter*) al regenerar la entrada en Redis, evitando que múltiples peticiones concurrentes golpeen la base de datos simultáneamente.

## 5. Justificación en Auditoría
- La estrategia de caché aplicable (llaves, TTL, invalidación y mitigación de stampede) debe definirse explícitamente en la auditoría técnica de `01-auditoria.md`. Declarar simplemente "se cachea" no se considera una decisión técnica válida.
