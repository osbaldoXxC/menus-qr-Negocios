---
name: frontend-ui-engineering
description: >-
  Ingeniería de componentes visuales en React, manejo de estados de error, carga y vacío, jerarquía tipográfica, espaciado consistente y prevención de anti-patrones de diseño genérico en MexxicanMX. Activar al construir componentes de interfaz.
---

# Frontend UI Engineering - MexxicanMX

Skill de ingeniería de interfaz de usuario para construir componentes robustos, escalables y visualmente profesionales en React y Tailwind CSS para MexxicanMX.

## Procedencia y Licencia
- **Origen:** Adaptado de `tuanfung/pqt-agent-skills/skills/frontend-ui-engineering`.
- **Licencia:** MIT.

## Anti-patrones de Diseño a Evitar (Red Flags)

| Anti-patrón | Por qué evitarlo | Enfoque Correcto en MexxicanMX |
| :--- | :--- | :--- |
| **Abuso de gradientes estridentes** | Crea ruido visual y choca con la fotografía de comida | Usar colores sólidos o gradientes muy sutiles de la paleta |
| **Bordes redondeados exagerados (`rounded-3xl`)** | Da aspecto infantil e ignora la jerarquía del diseño | Seguir escala consistente de `rounded-lg` o `rounded-xl` |
| **Componentes gigantes (> 200 líneas)** | Difíciles de mantener y probar | Dividir en subcomponentes modulares especializados |
| **Padding/margin arbitrarios (`p-[13px]`)** | Rompe la escala armónica de Tailwind | Usar siempre la escala de múltiplos de 4 (`p-3`, `p-4`, `p-6`) |
| **Sombras excesivas multinivel** | Sobrecarga el renderizado en teléfonos económicos | Sombras sutiles (`shadow-sm`, `shadow-md`) |
| **Falta de estados de carga/error** | El usuario cree que la app se congeló | Implementar skeletons y mensajes claros en cada interacción |

## Verificación de Calidad en el Componente
- [ ] El componente renderiza sin advertencias ni errores en la consola del navegador.
- [ ] Todo elemento interactivo tiene un estado `:hover`, `:active` y `:focus-visible`.
- [ ] El texto largo se trunca con elegancia (`truncate` / `line-clamp-2`) para no desbordar tarjetas de platillos.
- [ ] Las imágenes de platillos implementan `loading="lazy"` y tienen dimensiones de reserva para evitar saltos de layout.
