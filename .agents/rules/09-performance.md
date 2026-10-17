# 09 - Rendimiento y Optimización del Backend

## 1. Principio Fundamental
El backend de MexxicanMX debe estar optimizado para ofrecer respuestas rápidas y predecibles en todo momento, reduciendo al mínimo la latencia para los comensales que consultan los menús.

## 2. Reglas de Consulta a Base de Datos
- **Prohibición de Consultas N+1:** Prohibido ejecutar consultas dentro de bucles (*loops*). Utilizar `JOIN`s estructurados, agregaciones SQL (`json_agg`, `json_build_object`) o procesamiento por lotes (*batching*).
- **Paginación Obligatoria:** Todo endpoint que devuelva listados susceptibles de crecer (platillos, pedidos, transacciones, registros de auditoría) debe implementar paginación mediante `limit`/`offset` o cursores (`cursor-based pagination`).
- **Estrategia de Indexación:** Toda columna utilizada frecuentemente en cláusulas `WHERE`, condiciones de `JOIN` u ordenamientos (`ORDER BY`) debe contar con su correspondiente índice en PostgreSQL.

## 3. Reducción de Roundtrips entre Servicios
- Minimizar saltos de red innecesarios entre componentes del sistema (`Node.js Express` ↔ `FastAPI ml-service` ↔ `PostgreSQL` ↔ `Redis`).
- Consolidar operaciones y lecturas cuando sea factible para no multiplicar la latencia acumulada de la petición.

## 4. Medición Previa a la Optimización
- Prohibido aplicar optimizaciones prematuras o basadas en suposiciones.
- Antes de modificar código por motivos de rendimiento, se debe **medir primero** (tiempos de consulta, uso de memoria, benchmarks locales).
- Cualquier impacto significativo o cuello de botella detectado debe exponerse cuantitativamente en la auditoría técnica de `01-auditoria.md`.
