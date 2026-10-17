# 10 - Accesibilidad Frontend y Diseño Adaptativo

## 1. Estándar WCAG 2.1 Nivel AA
Todo componente visual e interactivo desarrollado en el frontend (React) debe cumplir obligatoriamente con el estándar **WCAG 2.1 nivel AA**:
- **Contraste de Color:** Relación de contraste mínima de 4.5:1 para texto normal y 3:1 para texto grande o elementos gráficos esenciales de la interfaz.
- **Navegación por Teclado:** Todo botón, enlace, modal, selector o campo de formulario debe ser 100% operable mediante teclado (`Tab`, `Enter`, `Space`, `Escape`), mostrando un indicador de foco visible y claro.
- **HTML Semántico y ARIA:** Priorizar siempre elementos nativos (`<button>`, `<nav>`, `<main>`, `<article>`, `<header>`). Utilizar atributos ARIA (`aria-label`, `aria-expanded`, `aria-live`, `role`) única y exclusivamente cuando el HTML semántico no sea suficiente para transmitir el estado o propósito a lectores de pantalla.
- **Formularios Accesibles:** Todo campo de entrada (`<input>`, `<select>`, `<textarea>`) debe tener una etiqueta asociada mediante `<label htmlFor="...">` o `aria-labelledby`. Mensajes de error en línea deben vincularse con `aria-describedby` y `aria-invalid`.

## 2. Diseño Responsivo y Breakpoints Obligatorios
- La interfaz debe adaptarse fluidamente a diversos dispositivos sin pérdida de funcionalidad ni desbordamientos horizontales de contenido (*overflow*).
- Antes de dar una tarea de frontend por concluida, debe validarse de forma explícita en al menos los tres puntos de quiebre (*breakpoints*) fundamentales:
  1. **Móvil:** 320px – 480px (Prioridad absoluta: experiencia del comensal escaneando el QR en mesa).
  2. **Tablet:** 768px – 1024px (Visualización en terminales de meseros o tablets de restaurante).
  3. **Desktop:** 1280px en adelante (Panel de administración y configuración del menú).
