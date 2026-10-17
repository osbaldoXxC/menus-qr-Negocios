# 21 - Regla de Análisis Estático de Seguridad con CodeQL

## 1. Integración con la Skill `codeql-security-analysis`
Define los estándares de análisis estático semántico para descubrir vulnerabilidades en el código fuente de Node.js, React y Python.

## 2. Directrices Clave
- **Focos Críticos:** Inyección SQL en consultas de PostgreSQL, vectores IDOR por falta de validación de propiedad de recursos, y exposición accidental de secretos en texto plano.
- **Verificación Local vs CI:** Si CodeQL CLI no está disponible en la máquina local, el agente no debe inventar resultados; documentará la limitación y se apoyará en la auditoría manual de seguridad y en los flujos de CI de GitHub Code Scanning.
- **Triaje Responsable:** Analizar cada alerta separando falsos positivos de riesgos reales con propuesta de mitigación.
