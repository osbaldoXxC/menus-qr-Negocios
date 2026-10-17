---
name: security-audit
description: >-
  Auditoría exhaustiva de seguridad: modelado de amenazas, validación zero-trust con Zod/Pydantic, prevención de IDOR, seguridad de tokens JWT/refresh en cookies HttpOnly, cabeceras Helmet, rate limiting y escaneo de vulnerabilidades en dependencias. Activar en cualquier cambio de backend o auth.
---

# Security Audit - MexxicanMX

Skill de auditoría profunda de seguridad defensiva, autenticación, autorización y protección de datos para MexxicanMX.

## Procedencia y Licencia
- **Origen:** Skill nativa especializada creada específicamente para MexxicanMX basada en estándares OWASP Top 10 y directrices de seguridad de nube en AWS.
- **Licencia:** MIT.

## Matriz de Auditoría de Seguridad

### 1. Validación de Entrada (Zero Trust al Cliente)
- **Regla:** El backend jamás asume que un dato es válido porque "ya lo validó el frontend".
- En Node.js: Validar cada cuerpo de petición con schemas de `Zod` o validadores estrictos.
- En FastAPI: Modelos `Pydantic` estrictos con tipos primitivos validados y saneamiento de cadenas.

### 2. Autorización por Recurso (Anti-IDOR)
- **Principio:** No basta con verificar que el usuario esté logueado (`authMiddleware`). Se debe validar explícitamente:
  ```javascript
  // Ejemplo de validación anti-IDOR
  if (platillo.restaurante_id !== req.user.restaurante_id && req.user.rol !== 'SUPER_ADMIN') {
    return res.status(403).json({ mensaje: 'No autorizado para modificar este recurso' });
  }
  ```

### 3. Seguridad de Sesiones y Tokens
- **Access Token:** JWT con tiempo de expiración corto (15 min), firmado con `JWT_SECRET`.
- **Refresh Token:** Caducidad a 7 días, almacenado con hash criptográfico en la base de datos (nunca en texto plano).
- **Cookies de Transporte:**
  - `HttpOnly: true` (inmune a robo vía XSS en JavaScript).
  - `Secure: true` en producción (transmitido únicamente por HTTPS).
  - `SameSite: 'strict'` o `'lax'` para mitigar ataques CSRF.
- **Prohibido:** Almacenar tokens o llaves en `localStorage`, `sessionStorage` o `IndexedDB`.

### 4. Cabeceras y Endpoints Expuestos
- **Helmet:** Configurar `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`.
- **CORS:** Whitelist explícita de orígenes (`https://app.oamdevsol.site`, `https://panel.oamdevsol.site`). Prohibido comodín `*` en producción cuando se emplean credenciales.
- **Rate Limiting:** Límites estrictos en autenticación, endpoints de IA y subida de archivos para evitar abusos o ataques de denegación de servicio.

### 5. Auditoría de Dependencias
- Comprobar vulnerabilidades conocidas antes de integrar paquetes:
  ```bash
  npm audit
  pip-audit
  ```
