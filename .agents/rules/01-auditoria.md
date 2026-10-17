# 01 - Proceso Obligatorio de Auditoría Previa

## 1. Principio Fundamental
Ninguna funcionalidad nueva, cambio de comportamiento o corrección de error (bugfix) no trivial se implementa directamente. Antes de modificar o escribir una sola línea de código, se debe producir y presentar una auditoría técnica completa.

## 2. Formato Obligatorio de la Auditoría
Toda propuesta debe estructurarse con las siguientes secciones:
1. **Estado Actual:** Descripción del comportamiento existente, archivos involucrados y flujo actual.
2. **Riesgos e Impacto:**
   - Seguridad (superficie de ataque, vectores de vulnerabilidad).
   - Performance (tiempos de respuesta, volumen de consultas a DB/Redis).
   - Esquema de Datos (compatibilidad con el contrato de DB y datos existentes).
   - Arquitectura (acoplamiento y dependencias).
3. **Propuesta de Implementación:**
   - Si existe más de un camino razonable, presentar obligatoriamente **2 a 3 alternativas** con sus ventajas, desventajas y *trade-offs*.
   - Prohibido imponer una solución única sin haber evaluado alternativas previamente.
4. **Plan de Pruebas:**
   - Definición de casos de prueba e2e con Playwright y pruebas de integración requeridas.
5. **Criterio de Aprobación Explícita:** Declarar explícitamente si requiere autorización del usuario antes de proceder.

## 3. Criterio de Aprobación Previa Obligatoria
Se requiere **aprobación explícita del usuario** antes de escribir código si la propuesta toca:
- Autenticación o emisión/validación de tokens.
- Control de acceso basado en roles (RBAC) o middlewares de seguridad.
- Esquema de la base de datos (tablas, columnas, índices, llaves foráneas).
- Contratos de la API que ya sean consumidos por el frontend.

*Regla de prudencia:* Ante cualquier duda sobre si un cambio entra en estas categorías, se debe tratar obligatoriamente como que **SÍ requiere aprobación explícita**. En los demás casos, se muestra la auditoría y se procede directamente a implementar.

## 4. Tratamiento de Bugs No Triviales
Para cualquier falla no trivial:
- Identificar al menos **3 causas y soluciones posibles**.
- Exponer cada una con sus respectivos *trade-offs*.
- Dejar que el usuario seleccione el camino a seguir antes de aplicar cualquier cambio.
- Prohibido aplicar el primer parche o fix que se ocurra sin análisis previo.
