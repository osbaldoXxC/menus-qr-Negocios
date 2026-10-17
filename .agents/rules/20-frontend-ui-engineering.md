# 20 - Regla de Ingeniería de UI y Anti-patrones

## 1. Integración con la Skill `frontend-ui-engineering`
Asegura la construcción de componentes limpios, escalables y con espaciados visuales consistentes en React y Tailwind.

## 2. Directrices Clave
- **Prevención de Anti-patrones:** Evitar gradientes estridentes, bordes redondeados excesivos (`rounded-3xl`) o componentes con más de 200 líneas de código.
- **Escala de Espaciado:** Respetar los múltiplos estándar de 4px de Tailwind (`p-2`, `p-4`, `p-6`) sin inventar valores arbitrarios (`p-[13px]`).
- **Estados Interactivos:** Todo elemento debe contar con estilos claros para `:hover`, `:active` y `:focus-visible`.
- **Rendimiento Visual:** Implementar carga perezosa (`loading="lazy"`) y dimensiones de reserva en imágenes de platillos.
