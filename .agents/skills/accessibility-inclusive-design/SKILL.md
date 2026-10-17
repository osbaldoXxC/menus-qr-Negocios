---
name: accessibility-inclusive-design
description: >-
  Auditoría e implementación de accesibilidad web bajo estándar WCAG 2.1/2.2 Nivel AA: navegación por teclado, foco visible, contraste de color, lectores de pantalla y verificación responsive en móvil, tablet y desktop. Activar en cualquier tarea de frontend.
---

# Accessibility & Inclusive Design - MexxicanMX

Skill para garantizar que los menús digitales interactivos y paneles de administración de MexxicanMX sean plenamente accesibles e inclusivos para cualquier persona y dispositivo.

## Procedencia y Licencia
- **Origen:** Adaptado de `hueyexe/frontend-agent-skills/accessibility-inclusive-design`.
- **Licencia:** MIT.

## Requisitos No Negociables (WCAG 2.1 / 2.2 AA)

### 1. Navegación por Teclado y Foco Visible
- Todo elemento accionable (botones, links, selectores, modales) debe ser alcanzable y operable mediante `Tab`, `Shift+Tab`, `Enter` y `Space`.
- **Prohibido:** `outline: none` sin un estilo de foco sustituto visible de alto contraste.
- Orden de foco lógico que siga el flujo natural de lectura del DOM.
- Modales accesibles: atrapar el foco dentro del modal mientras esté abierto (*focus trap*) y cerrarse con la tecla `Escape`, restaurando el foco al botón que lo abrió.

### 2. Semántica HTML y Atributos ARIA
- **Regla de oro:** Preferir siempre elementos nativos de HTML (`<button>`, `<nav>`, `<main>`, `<dialog>`, `<form>`) antes de usar `<div>` o `<span>` con manejadores `onClick`.
- No usar ARIA para parchar HTML no semántico; usar ARIA únicamente cuando el HTML nativo no baste para expresar el estado dinámico (`aria-expanded`, `aria-busy`, `aria-live`).
- Controles basados en íconos deben incluir obligatoriamente `aria-label` descriptivo.

### 3. Contraste de Color y Percepción
- Relación de contraste mínima:
  - Texto normal: **4.5:1** contra el fondo.
  - Texto grande o elementos de interfaz: **3:1**.
- El color nunca debe ser el único medio para transmitir información o estado (acompañar con íconos o etiquetas de texto).

### 4. Verificación en Tres Breakpoints Obligatorios
Antes de cerrar cualquier desarrollo de frontend, verificar obligatoriamente en:
1. **Móvil (320px – 480px):** Experiencia de comensal escaneando menú QR en teléfono.
2. **Tablet (768px – 1024px):** Terminales de meseros o tablets de restaurantes.
3. **Desktop (1280px en adelante):** Panel de administración y gestión de restaurante.
