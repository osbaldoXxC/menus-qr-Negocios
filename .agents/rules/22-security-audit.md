# 22 - Regla de Auditoría de Seguridad Defensiva

## 1. Integración con la Skill `security-audit`
Asegura la protección integral de las APIs, sesiones de usuarios y datos de negocio en MexxicanMX.

## 2. Directrices Clave
- **Validación Zero-Trust:** Validar exhaustivamente todo cuerpo de petición en el backend con esquemas de `Zod` (Node.js) o `Pydantic` (FastAPI).
- **Protección Anti-IDOR:** Comprobar de forma explícita que el `restaurante_id` del usuario autenticado coincida con el registro solicitado antes de permitir lectura o modificación.
- **Cookies Seguras:** Tokens de acceso (15 min) y refresh tokens hasheados en BD (7 días) gestionados exclusivamente en cookies `HttpOnly`, `Secure` y `SameSite`. Prohibido el uso de `localStorage`.
- **Cabeceras y Rate Limiting:** Aplicar Helmet con CSP estricto, HSTS, CORS con lista blanca y limitadores de tasa en autenticación y llamadas sensibles.
