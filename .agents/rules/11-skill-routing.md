# 11 - Enrutamiento Automático de Skills

## 1. Principio Fundamental
Antigravity CLI debe seleccionar y activar automáticamente las skills especializadas según la intención de la solicitud del usuario, **sin exigirle que escriba o recuerde el nombre de ninguna skill**.

El agente interpreta el objetivo, identifica la naturaleza técnica de la tarea y carga progresivamente las instrucciones de los `SKILL.md` pertinentes en `.agents/skills/`.

## 2. Matriz de Enrutamiento Automático

| Tipo de Solicitud del Usuario | Skills que se Activan Automáticamente |
| :--- | :--- |
| **Agregar pestaña, página, pantalla o componente** | `feature-audit`, `frontend-design`, `frontend-ui-engineering`, `accessibility-inclusive-design`, `code-quality`, `playwright-e2e-testing` |
| **Crear o modificar un endpoint de API** | `feature-audit`, `security-audit`, `code-quality`, `playwright-e2e-testing` |
| **Cambiar autenticación, sesiones, roles o permisos** | `security-audit`, `code-quality`, `codeql-security-analysis`, `playwright-e2e-testing` |
| **Corregir un error o bug** | `feature-audit`, `scope-guard`, `code-quality`, `playwright-e2e-testing` |
| **Mejorar accesibilidad o diseño responsive** | `accessibility-inclusive-design`, `frontend-design`, `playwright-e2e-testing` |
| **Revisar o implementar estrategia de caché** | `harness-caching`, `performance-optimization`, `code-quality` |
| **Crear procesos asíncronos o workers en segundo plano** | `async-processing-patterns`, `security-audit`, `code-quality` |
| **Optimizar rendimiento o latencia** | `performance-optimization`, `harness-caching`, `code-quality` |
| **Auditar seguridad o revisar vulnerabilidades** | `security-audit`, `codeql-security-analysis` |
| **Revisar código sin modificarlo** | `code-quality` (modo revisión), `scope-guard` |
| **Simplificar o refactorizar código** | `code-quality`, `scope-guard` |
| **Preparar pruebas funcionales o de regresión** | `feature-audit`, `playwright-e2e-testing`, `code-quality` |
| **Modificar BD, consultas SQL, migraciones o desplegar** | `aws-deployment`, `security-audit`, `scope-guard` |

## 3. Resolución Silenciosa y Jerarquía de Conflictos
1. **Selección Silenciosa:** El agente no pregunta "¿Qué skill quieres que use?". Declara con naturalidad el enfoque de trabajo y sigue el procedimiento correspondiente.
2. **Jerarquía en Caso de Conflicto:** Si dos skills ofrecen pautas divergentes, la precedencia es:
   - **1° Seguridad y Protección de Datos** (`security-audit`, `02-seguridad.md`)
   - **2° Alcance Aprobado por el Usuario** (`scope-guard`, `08-scope-guard.md`)
   - **3° Arquitectura Existente y Contratos de MexxicanMX** (`00-modularidad.md`, `aws-deployment`)
   - **4° Guías Estéticas o de Optimización**
