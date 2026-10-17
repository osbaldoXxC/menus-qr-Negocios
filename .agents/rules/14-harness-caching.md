# 14 - Regla de Caché y Consistencia HTTP/Redis

## 1. Integración con la Skill `harness-caching`
Gobierna el diseño de almacenamiento temporal para acelerar las lecturas sin comprometer la consistencia de los datos en MexxicanMX.

## 2. Directrices Clave
- **ETag en Lecturas Públicas:** Incluir siempre la cabecera `ETag` en endpoints públicos del menú digital y devolver `304 Not Modified` cuando el contenido no haya variado.
- **Invalidación Sincrónica en Redis:** Toda mutación confirmada (`POST`, `PATCH`, `DELETE`) debe limpiar inmediatamente las llaves en Redis dentro de la misma transacción.
- **Prevención de Stampede:** Usar variabilidad aleatoria en TTL (*jitter*) y bloqueos para evitar que múltiples peticiones saturen PostgreSQL simultáneamente tras la expiración de la caché.
