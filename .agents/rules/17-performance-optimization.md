# 17 - Regla de Optimización de Rendimiento

## 1. Integración con la Skill `performance-optimization`
Regula las mejoras de velocidad y uso eficiente de recursos en el servidor y la base de datos de MexxicanMX.

## 2. Directrices Clave
- **Evidencia Previa:** No optimizar a ciegas; toda propuesta debe fundamentarse en métricas reales (tiempos de respuesta, planes `EXPLAIN ANALYZE`).
- **Cero N+1:** Reemplazar consultas en bucles por agregaciones JSON nativas o `JOIN`s en PostgreSQL.
- **Paginación Defensiva:** Listados grandes deben contar con paginación (`limit`/`offset` o cursor).
- **Consolidación de Roundtrips:** Reducir la cantidad de llamadas entre Node.js, FastAPI, PostgreSQL y Redis.
