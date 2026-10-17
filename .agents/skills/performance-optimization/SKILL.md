---
name: performance-optimization
description: >-
  Medición rigurosa antes de optimizar, detección y eliminación de consultas N+1, paginación eficiente en endpoints, indexación de PostgreSQL y optimización de latencia entre Node, FastAPI, Redis y PostgreSQL. Activar ante reportes de lentitud o mejoras de rendimiento.
---

# Performance Optimization - MexxicanMX

Skill para la auditoría, perfilado y optimización de rendimiento en el backend, frontend y base de datos de MexxicanMX.

## Procedencia y Licencia
- **Origen:** Adaptado de `addyosmani/agent-skills/performance-optimization`.
- **Licencia:** MIT.

## Regla de Oro: Medir Primero, Optimizar Después
- Prohibido realizar optimizaciones prematuras o basadas en suposiciones.
- Antes de proponer o aplicar un cambio, se debe contar con evidencia cuantitativa:
  - Tiempo de respuesta de endpoints (`ms`).
  - Número de consultas SQL disparadas por petición.
  - Planes de ejecución de PostgreSQL (`EXPLAIN ANALYZE`).
  - Tamaño del payload HTTP y tiempo de carga de assets.

## Áreas Clave de Optimización en MexxicanMX

### 1. Eliminación de Consultas N+1 en PostgreSQL
- **Patrón a erradicar:** Ejecutar una consulta en bucle para obtener platillos dentro de cada categoría.
- **Solución requerida:** Utilizar `JOIN` estructurados o funciones de agregación JSON nativas de PostgreSQL (`json_agg`, `json_build_object`) para devolver el árbol completo en una única consulta de alta velocidad.

### 2. Paginación Obligatoria
- Ningún endpoint debe devolver un listado sin límite.
- Para listados grandes o crecientes (platillos, historial de pedidos, logs):
  - Paginación basada en límites (`limit`, `offset`) o basada en cursor (`created_at`, `id`) para evitar degradación conforme crezca la tabla.

### 3. Índices Estratégicos
- Asegurar índices en todas las columnas utilizadas en filtros de alta frecuencia:
  - `restaurante_id` en tablas `platillos`, `categorias`, `pedidos`.
  - `email` y `estado` en `usuarios`.
  - Índices vectoriales (`HNSW` / `IVFFlat`) para consultas semánticas de `pgvector` en `ml-service`.

### 4. Reducción de Roundtrips entre Servicios
- Minimizar el número de saltos de red entre `Node.js (Express)` ↔ `FastAPI (ml-service)` ↔ `PostgreSQL` ↔ `Redis`.
- Cachear en Redis respuestas completas agregadas del menú digital para responder peticiones de comensales en `< 15ms`.
