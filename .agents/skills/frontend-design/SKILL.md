---
name: frontend-design
description: >-
  Diseño, maquetación y desarrollo de componentes, pantallas, pestañas, modales y formularios en React/Tailwind respetando la identidad visual y design tokens de MexxicanMX sin rediseñar la aplicación completa. Activar al crear o modificar UI.
---

# Frontend Design - MexxicanMX

Skill de diseño visual, arquitectura de componentes y sistemas de diseño para los portales de Comensal, Restaurante y SuperAdmin de MexxicanMX.

## Procedencia y Licencia
- **Origen:** Adaptado de `PracticalSwan/agent-skills/frontend-design`.
- **Licencia:** MIT.

## Principios de Diseño en MexxicanMX

### 1. Respetar la Identidad Visual Existente
- No reinventar paletas de colores, tipografías ni estilos en cada nuevo componente.
- Reutilizar los componentes base ya creados en `frontend/src/` y `admin/src/`:
  - `Header`, `Sidebar`, `Footer`, `Logo`, `MainLayout`.
  - Botones, tarjetas de platillo, modales y alertas existentes.
- Utilizar Tailwind CSS manteniendo coherencia con `tailwind.config.js`.

### 2. Estados de UI Completos y Obligatorios
Todo componente, vista o formulario nuevo debe contemplar explícitamente y diseñar:
- **Estado Inicial / Vacío (*Empty State*):** Mensaje claro, ilustración o ícono y botón de acción principal cuando no hay datos (ej. "Aún no tienes platillos registrados").
- **Estado de Carga (*Loading State*):** *Skeletons* o indicadores de carga discretos para evitar saltos de layout (*Cumulative Layout Shift*).
- **Estado de Éxito (*Success State*):** Notificaciones toast o confirmaciones visuales claras.
- **Estado de Error (*Error State*):** Mensajes legibles en línea orientando al usuario sobre cómo solucionar el problema.
- **Estado de Permiso Denegado (*Unauthorized State*):** Pantalla limpia cuando el rol o suscripción no permiten acceder a la funcionalidad.

### 3. Formularios Accesibles y Amigables
- Inputs con labels persistentes y visibles (no usar el placeholder como sustituto de etiqueta).
- Validación de campos en tiempo real con mensajes de error contextuales.
- Deshabilitación de botones de envío durante peticiones en curso para prevenir dobles envíos.
