---
name: codeql-security-analysis
description: >-
  Metodología y ejecución de análisis estático de seguridad con CodeQL CLI y GitHub Code Scanning para detectar inyecciones SQL, IDOR, vulnerabilidades de autenticación, cross-site scripting (XSS) y exposición de datos en Node y Python. Activar en revisiones de seguridad.
---

# CodeQL Security Analysis - MexxicanMX

Skill de análisis de seguridad semántico mediante consultas CodeQL para el stack JavaScript/TypeScript (Node.js/React) y Python (FastAPI) de MexxicanMX.

## Procedencia y Licencia
- **Origen:** Adaptado de las directrices oficiales de GitHub CodeQL (`github/vscode-codeql` / CodeQL CLI).
- **Licencia:** Guía de integración de seguridad bajo licencia MIT.

## Alcance y Compatibilidad de Lenguajes
- **JavaScript / TypeScript:** Cobertura de backend Express (`backend/src/`), frontend comensal (`frontend/src/`) y admin (`admin/src/`).
- **Python:** Cobertura del motor semántico FastAPI (`ml-service/`).

## Vectores Críticos de Análisis en MexxicanMX

### 1. Inyecciones SQL y Manipulación de Consultas (`js/sql-injection`, `py/sql-injection`)
- Detección de concatenación de strings o interpolaciones dentro de consultas PostgreSQL `db.query(...)`.
- Garantizar el uso estricto de parámetros posicionales (`$1`, `$2`, ...).

### 2. Control de Acceso y Prevención de IDOR (`js/missing-rate-limiting`, `js/unvalidated-dynamic-method-call`)
- Verificación de que endpoints que reciben identificadores (`restaurante_id`, `platillo_id`, `categoria_id`) validen la propiedad del recurso contra la sesión autenticada en el token JWT.

### 3. Exposición de Secretos y Datos Sensibles (`js/cleartext-storage-of-sensitive-information`)
- Detección de almacenamiento indebido de tokens o contraseñas en logs o en almacenamiento de cliente (`localStorage`).

### 4. Cross-Site Scripting (XSS)
- Auditoría de renderizado de descripciones o notas de platillos en el menú comensal para evitar inyección de scripts HTML.

## Flujo de Ejecución (Local vs CI)

1. **Verificación de Entorno:**
   - Comprobar si `codeql` CLI está instalado localmente (`codeql --version`).
   - Si no está disponible localmente, no simular la ejecución; delegar la revisión a la auditoría manual de código y a las alertas de GitHub Code Scanning en CI.
2. **Creación de Base de Datos CodeQL (Cuando CLI esté disponible):**
   ```bash
   codeql database create codeql-db-js --language=javascript-typescript --source-root=.
   ```
3. **Ejecución de Suites de Seguridad:**
   ```bash
   codeql database analyze codeql-db-js javascript-security-and-quality.qls --format=sarif-latest --output=codeql-results.sarif
   ```
4. **Triaje de Falsos Positivos:** Documentar hallazgos reales frente a falsos positivos en la auditoría técnica de seguridad.
