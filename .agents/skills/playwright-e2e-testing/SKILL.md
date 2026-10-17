---
name: playwright-e2e-testing
description: >-
  Auditoría, diseño y ejecución de pruebas E2E con Playwright en navegador real para flujos completos de comensal, restaurante y superadmin en MexxicanMX. Activar al preparar pruebas, validar flujos antes de PR o verificar regresiones.
---

# Playwright E2E Testing - MexxicanMX

Skill especializada en pruebas end-to-end (E2E) con Playwright para la plataforma MexxicanMX (menús QR interactivos, panel de restaurantes y panel de administración).

## Procedencia y Licencia
- **Origen:** Adaptación verificada y especializada para MexxicanMX inspirada en las mejores prácticas de automatización de `@playwright/test` y patrones de pruebas de flujos de trabajo web.
- **Licencia:** MIT.

## Principios Fundamentales
1. **Ambiente Aislado:** Ejecutar pruebas **únicamente** contra entornos locales (`http://localhost:3000`, `http://localhost:4000`) o contenedores de *staging*. **NUNCA contra producción**.
2. **Flujo Completo:** Probar journeys de usuario completos de extremo a extremo, no endpoints aislados.
3. **Estabilidad y Anti-flakiness:** Usar localizadores basados en accesibilidad y roles (`page.getByRole`, `page.getByLabel`, `page.getByText`) en lugar de selectores CSS frágiles.
4. **Verificación de Causa Raíz:** Si un test falla, identificar si el defecto está en el código o en la aserción. **Prohibido relajar o silenciar un test para forzar el verde**.

## Flujos Críticos de MexxicanMX a Cubrir

### 1. Comensal (Menú Digital QR)
- Escaneo de QR / acceso a URL pública `/menu/:restaurante_id`.
- Visualización de categorías, platillos, fotos y precios.
- Filtrado por ingredientes y alérgenos.
- Motor de recomendación semántica (cuestionario de preferencias).
- Verificación responsive en viewport móvil (375x667, 390x844).

### 2. Restaurante (Portal de Gestión)
- Registro y autenticación segura (cookies `HttpOnly`/`Secure`).
- Creación, edición (`PATCH`) y soft-delete (`deleted_at`) de platillos.
- Subida de imágenes a S3 con validación de tipo y tamaño.
- Personalización de colores y tema visual.
- Generación y descarga del código QR en alta resolución.

### 3. SuperAdmin (Portal de Control)
- Login con credenciales de administración.
- Aprobación, suspensión y control de vigencia de restaurantes.
- Monitoreo de salud del sistema (`/health`).

## Procedimiento Paso a Paso

1. **Definir Criterios de Aceptación:** Antes de escribir código, formalizar los casos de éxito, error y permisos.
2. **Configurar Fixtures y Autenticación:**
   - Usar almacenamiento de sesión reutilizable (`storageState`) para no re-autenticar en cada test.
   - Limpiar datos de prueba al finalizar (`afterEach` / `afterAll`).
3. **Ejecutar Pruebas:**
   ```bash
   npx playwright test
   # Modo UI interactivo para depuración
   npx playwright test --ui
   # Reporte HTML con trazas y capturas
   npx playwright show-report
   ```
4. **Capturas y Trazas:**
   - Configurar `trace: 'on-first-retry'` y `screenshot: 'only-on-failure'` en `playwright.config.ts`.
5. **Aprobación para Merge:** Los tests deben pasar 100% en verde para autorizar el merge a `develop`.
