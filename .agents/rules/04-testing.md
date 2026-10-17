# 04 - Metodología de Pruebas Automatizadas

## 1. Orden de Ejecución Fijo (No Negociable)
El proceso de pruebas sigue un orden estricto que bajo ninguna circunstancia se invierte:
1. **Definición del Flujo:** Una vez aprobada la auditoría (`01-auditoria.md`), definir explícitamente cómo debe comportarse el flujo completo del usuario de extremo a extremo (E2E), no únicamente el endpoint HTTP de forma aislada.
2. **Escritura Previa o Conjunta de Tests:** Diseñar y escribir los tests en **Playwright** basados en el comportamiento esperado antes de codificar la solución o en paralelo a ella. Nunca deben redactarse como una ocurrencia tardía al final.
3. **Ambiente Seguro de Ejecución:** Correr las pruebas contra un contenedor local o entorno de *staging*. **Prohibido terminantemente ejecutar pruebas automáticas contra datos o servicios de producción**.
4. **Análisis de Fallos (Causa Raíz):** Si un test falla, reportar el paso exacto que se rompió y verificar formalmente si el defecto se encuentra en el código o en la aserción del test. Queda estrictamente prohibido "modificar o relajar el test solo para que pase en verde".
5. **Apertura de PR:** Únicamente con toda la suite en verde se empuja a la rama remota correspondiente y se solicita la revisión para merge a `develop`.

## 2. Alcance de las Pruebas
- Pruebas E2E de flujos críticos de comensales (escaneo de QR, navegación de categorías, visualización de platillos, interacción de búsqueda).
- Pruebas E2E de flujos de restaurantes (registro, login, administración de platillos, personalización de menú).
- Aserciones de seguridad: verificación de códigos 401/403 en accesos no autorizados y rechazo de payloads inválidos (400).
