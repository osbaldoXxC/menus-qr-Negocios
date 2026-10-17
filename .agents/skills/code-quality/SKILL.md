---
name: code-quality
description: >-
  Estándares de calidad de código, refactorización controlada, adherencia a principios de flujo lineal, complejidad ciclomática <= 10, convención de nombres y revisión sin refactors masivos no autorizados. Activar al escribir, revisar o simplificar código.
---

# Code Quality - MexxicanMX

Skill especializada en calidad de código, legibilidad y estándares de ingeniería para el stack Node.js/Express, React/TypeScript y Python/FastAPI de MexxicanMX.

## Procedencia y Licencia
- **Origen:** Adaptado de `mthines/agent-skills/skills/quality/code-quality`.
- **Licencia:** MIT.

## Reglas Críticas (No Negociables)

### 1. Flujo Lineal vs Ramificaciones Profundas
- Las funciones deben fluir de arriba a abajo: cláusulas de guarda (*guard clauses*) primero, lógica central después, retorno limpio al final.
- Evitar estructuras anidadas `if/else if/else` profundas. Extraer lógica a funciones puras auxiliares.

### 2. Complejidad Ciclomática
- Límite máximo sugerido: **10** por función/método.
- Si una función supera 10 puntos de complejidad ciclomática, debe refactorizarse extrayendo responsabilidades aisladas.

### 3. Convenciones de Nomenclatura del Proyecto
- **Entidades de dominio en español:** `restaurantes`, `platillos`, `categorias`, `pedidos`, `usuarios` (coherencia con el esquema PostgreSQL).
- **Código y lógica en inglés:** Nombres de funciones, variables, métodos y archivos (`getRestaurantById`, `calculateMenuHash`, `useAuth`).

### 4. Reutilización Estricta (DRY)
- **Prohibido duplicar lógica:** Antes de crear una función o utilidad, buscar en el repositorio si ya existe una función equivalente y extenderla o reutilizarla.

### 5. Documentación de Endpoints
- En Node.js/Express: Bloques JSDoc con tipos de entrada, cabeceras requeridas y códigos HTTP de respuesta.
- En FastAPI: Modelos Pydantic tipados y descripciones OpenAPI claras.

## Modo Revisión vs Modo Autoría
- **Modo Revisión (Review):** Generar reporte con secciones de impacto Alto, Medio y Bajo, evaluando mantenibilidad, pruebas y corrección sin modificar código.
- **Modo Autoría (Authoring):** Aplicar principios de código limpio en silencio. No hacer refactorizaciones de gran alcance sin autorización previa del usuario.
