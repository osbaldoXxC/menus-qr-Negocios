# 12 - Regla de Pruebas E2E con Playwright

## 1. Integración con la Skill `playwright-e2e-testing`
Esta regla gobierna la ejecución de pruebas de extremo a extremo para asegurar que ninguna regresión afecte los portales de comensales, restaurantes o administración.

## 2. Puntos de Control Obligatorios
- **Cero Pruebas en Producción:** Las pruebas solo se ejecutan contra servidores locales o contenedores Docker de *staging*.
- **Cobertura de Flujo:** Toda funcionalidad nueva debe acompañarse de su prueba Playwright validando el viaje del usuario completo (no únicamente la llamada al backend).
- **Aprobación de Merge:** Ningún Pull Request hacia `develop` puede completarse si un test de Playwright falla.
- **Trazas y Diagnóstico:** En caso de falla, consultar el reporte HTML generado (`npx playwright show-report`) e inspeccionar el archivo de trazas `.zip` antes de realizar cambios de código.
