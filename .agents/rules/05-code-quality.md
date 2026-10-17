# 05 - Calidad de Código y Estándares de Ingeniería

## 1. Herramientas de Análisis Estático y Formateo
- **Node.js / React:** ESLint + Prettier configurados y ejecutándose obligatoriamente en hooks de `pre-commit` (no únicamente en CI).
- **Python / FastAPI:** Ruff + Black configurados y ejecutándose en `pre-commit`.
- El código no debe tener advertencias (*warnings*) no atendidas ni errores de tipado o formato.

## 2. Complejidad Ciclomática
- Límite máximo sugerido de complejidad ciclomática por función: **10**.
- Si una función excede este umbral, debe refactorizarse extrayendo funciones puras auxiliares o justificarse técnicamente en la auditoría previa.

## 3. Convenciones de Nomenclatura
- **Entidades de Dominio en Español:** Se mantiene coherencia con el esquema real de la base de datos de MexxicanMX (`restaurantes`, `platillos`, `categorias`, `pedidos`, `usuarios`).
- **Nombres de Código en Inglés:** Identificadores de funciones, métodos, variables, interfaces y clases en inglés (`getRestaurantById`, `calculateMenuHash`, `fetchActiveOrders`).

## 4. Reutilización Estricta (DRY)
- **Prohibición de duplicación de lógica:** Antes de implementar cualquier utilidad o función nueva, es obligatorio buscar en el repositorio si ya existe algo equivalente o similar.
- Si existe, se reutiliza o se extiende; queda prohibido copiar y pegar código para resolver un caso particular.

## 5. Documentación de Endpoints
- Ningún endpoint nuevo se considera terminado sin su documentación formal:
  - **FastAPI:** Esquemas Pydantic y descripciones OpenAPI / Swagger autogeneradas.
  - **Node.js / Express:** Bloques de documentación JSDoc que detallen parámetros de entrada, cabeceras requeridas y respuestas esperadas.
