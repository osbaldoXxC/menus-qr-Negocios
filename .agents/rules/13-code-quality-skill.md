# 13 - Regla de Calidad de Código y Revisión

## 1. Integración con la Skill `code-quality`
Asegura que el código producido en Node.js, React y Python mantenga alta legibilidad, baja complejidad ciclomática y estructura limpia.

## 2. Directrices Clave
- **Sin Refactorizaciones Espontáneas:** El agente no debe emprender refactorizaciones masivas de archivos que no forman parte de la tarea asignada.
- **Flujo Lineal y Cláusulas de Guarda:** Reemplazar anidamientos profundos por salidas tempranas (*early returns*).
- **Límite Ciclomático:** Las funciones deben mantenerse en complejidad ≤ 10.
- **Nomenclatura Unificada:** Entidades de la base de datos en español (`platillos`, `restaurantes`); código, variables y funciones en inglés (`fetchMenu`, `createDish`).
