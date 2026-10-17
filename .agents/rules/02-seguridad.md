# 02 - Estándares Estrictos de Seguridad

## 1. Validación de Entrada (Zero Trust al Cliente)
- El backend nunca confía en ningún dato proveniente del frontend, sin importar que "ya haya sido validado en el cliente".
- Toda petición debe validarse exhaustivamente mediante esquemas antes de tocar cualquier lógica de negocio:
  - **Node.js / Express:** Esquemas estrictos con `Zod` (o `Joi`).
  - **Python / FastAPI:** Modelos estrictos con `Pydantic`.

## 2. Autorización por Recurso (Prevención de IDOR)
- Cada endpoint debe verificar explícitamente que el usuario autenticado sea el propietario legítimo o posea el rol necesario sobre el recurso específico solicitado (ej. verificar `restaurante_id` en la entidad contra el token).
- Estar autenticado no es suficiente; la autorización debe ser granular por registro.

## 3. Gestión y Almacenamiento de Tokens y Credenciales
- **Access Token (15 minutos):** Almacenado exclusivamente en cookie con atributos `HttpOnly`, `Secure` y `SameSite`. Prohibido almacenarlo en `localStorage` o `sessionStorage`.
- **Refresh Token (7 días):** Almacenado exclusivamente en cookie `HttpOnly`, `Secure` y `SameSite`. En la base de datos se guarda **hasheado**, nunca en texto plano.
- **Prohibición Total en el Cliente:** Jamás almacenar credenciales, llaves privadas, API keys ni secretos en el almacenamiento del navegador (`localStorage`, `sessionStorage`, `IndexedDB`), ni siquiera de forma temporal.

## 4. Control de Tráfico y Cabeceras
- **Rate Limiting:** Aplicación obligatoria de limitadores de tasa en endpoints sensibles (autenticación, registro, recuperación de contraseña, endpoints de IA y subida de archivos).
- **Cabeceras de Seguridad Obligatorias:** Configuración de `Helmet` con `Content-Security-Policy` (CSP), `Strict-Transport-Security` (HSTS), `X-Frame-Options: DENY` y `X-Content-Type-Options: nosniff`.
- **CORS Estricto:** Whitelist explícita de orígenes autorizados (`https://app.oamdevsol.site`, `https://panel.oamdevsol.site`, etc.). Prohibido usar comodines `*` en entornos productivos cuando se usan credenciales.

## 5. Manejo de Errores y Logs
- El cliente nunca recibe *stack traces*, nombres de tablas, consultas SQL ni detalles internos de error. Al usuario se le entregan mensajes genéricos y controlados.
- El detalle técnico completo se registra exclusivamente en logs internos del servidor.
- Prohibido registrar tokens, contraseñas, códigos OTP o Información Personal Identificable (PII) en texto plano dentro de los logs.

## 6. Auditoría de Dependencias
- Antes de agregar cualquier librería o paquete externo, ejecutar obligatoriamente `npm audit` (en Node) o `pip-audit` (en Python).
- Cualquier vulnerabilidad detectada debe reportarse dentro de la auditoría técnica de `01-auditoria.md` antes de instalar el paquete.
