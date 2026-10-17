# 19 - Regla de Accesibilidad e Inclusión (WCAG 2.1/2.2 AA)

## 1. Integración con la Skill `accessibility-inclusive-design`
Establece los requisitos obligatorios para asegurar que cualquier persona pueda navegar e interactuar con los menús digitales y paneles de control.

## 2. Directrices Clave
- **Operabilidad por Teclado:** Todo control debe ser navegable mediante `Tab`/`Shift+Tab` y accionable con `Enter`/`Space`.
- **Foco Visible:** Prohibido retirar el outline de foco sin un indicador visible de alto contraste.
- **Semántica Nativa:** Priorizar elementos HTML nativos (`<button>`, `<dialog>`) antes de atribuir roles manuales a elementos `<div>`.
- **Tres Breakpoints Verificados:** Validar la interfaz en móvil (320px–480px), tablet (768px–1024px) y desktop (1280px+).
