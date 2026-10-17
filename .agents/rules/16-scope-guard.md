# 16 - Regla de Protección del Alcance (Scope Guard)

## 1. Integración con la Skill `scope-guard`
Establece límites inviolables sobre el radio de acción de las modificaciones para preservar la estabilidad del proyecto.

## 2. Directrices Clave
- **Declaración Previa:** Antes de editar, definir exactamente qué archivos serán tocados.
- **Freno ante Desviaciones:** Si se detecta que se requiere modificar un archivo fuera de la lista acordada, el agente debe detenerse y pedir autorización.
- **Respeto a la Arquitectura:** Prohibido proponer o iniciar migraciones no solicitadas (ECS, cambio de BD, renombrado masivo de tablas).
- **Delegación de Infraestructura:** El despliegue y contratos de base de datos se delegan a `desplegando-mexxicanmx-aws`.
