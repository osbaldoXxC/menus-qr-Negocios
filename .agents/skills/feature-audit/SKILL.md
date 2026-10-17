---
name: feature-audit
description: >-
  Auditoría previa obligatoria para nuevas funcionalidades y cambios de comportamiento en MexxicanMX. Inspecciona el estado actual, evalúa riesgos e impacto, genera exactamente tres alternativas con sus trade-offs y se detiene para esperar la elección del usuario antes de programar.
---

# Feature Audit - MexxicanMX

Skill rectora para la evaluación técnica previa, análisis de impacto y diseño de propuestas de implementación para MexxicanMX.

## Procedencia y Licencia
- **Origen:** Skill nativa de gobernanza de arquitectura y calidad desarrollada específicamente para MexxicanMX.
- **Licencia:** MIT.

## Protocolo Obligatorio en Tres Fases

### Fase A — Inspección Profunda del Estado Actual
Antes de proponer o tocar código, el agente debe investigar y explicar:
1. Cómo está construida el área o módulo actualmente (rutas, controladores, modelos, componentes de frontend).
2. Qué endpoints existen y qué contratos de datos manejan.
3. Qué permisos y roles (`SUPER_ADMIN`, `RESTAURANTE`, `COMENSAL`) están involucrados.
4. Qué pruebas existentes cubren esa zona.
5. Qué implicaciones existen en caché (Redis), colas, base de datos y rendimiento.

### Fase B — Generación de Exactamente Tres Alternativas
El agente debe formular y presentar **exactamente 3 alternativas viables**, estructuradas con:
1. **Arquitectura y Archivos:** Lista de archivos a crear o modificar.
2. **Experiencia de Usuario:** Cómo interactúa el usuario y qué espera ver.
3. **Cambios Técnicos:** Ajustes en Frontend, Backend y Base de Datos (si aplica).
4. **Ventajas:** Puntos fuertes de la alternativa.
5. **Desventajas y Riesgos:** Complejidad, deuda técnica o posibles puntos de falla.
6. **Impacto:** En seguridad, rendimiento y mantenibilidad.
7. **Estrategia de Pruebas:** Cómo se verificará con Playwright y pruebas de integración.
8. **Complejidad Estimada:** Baja / Media / Alta con su justificación.

*Regla:* Las 3 alternativas deben ser genuinamente diferentes (ej. enfoque puramente en cliente vs server-driven vs híbrido con caché en Redis). El agente debe recomendar la más conveniente justificando el motivo técnico.

### Fase C — Detención Obligatoria y Espera de Decisión
- **Pausa Total:** Tras presentar las 3 alternativas y la recomendación, **el agente se detiene por completo**.
- **Prohibido:** Implementar la funcionalidad, modificar archivos funcionales o auto-aprobar una alternativa sin la elección explícita del usuario.
- Una vez que el usuario responde con la opción elegida, se procede a delimitar el alcance con `scope-guard` e implementar exclusivamente lo acordado.
