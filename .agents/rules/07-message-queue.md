# 07 - Criterios de Uso de Colas de Mensajes Asíncronas

## 1. Criterio de Selección
Una operación califica para procesarse a través de una cola de mensajes asíncrona únicamente si cumple con los tres requisitos fundamentales:
1. No requiere respuesta inmediata y sincrónica para el usuario en la misma llamada HTTP.
2. Tolera un retraso razonable en su ejecución (segundos o minutos).
3. Es idempotente y reintentable sin generar efectos secundarios duplicados en caso de fallo transitorio.

## 2. Casos que SÍ Califican para Cola Asíncrona
- Envío de correos electrónicos transaccionales (bienvenida, verificación de email, alertas).
- Envío de códigos OTP o notificaciones por canales secundarios.
- Generación de reportes analíticos pesados o exportación de datos.
- Procesamiento en segundo plano de imágenes subidas (redimensionamiento, compresión WebP, generación de miniaturas).
- Invocaciones al motor de IA que alimenten métricas o modelos sin bloquear la pantalla activa del usuario.

## 3. Casos que NO Califican (Prohibido Encolar)
- Inicio de sesión (login) y emisión de credenciales.
- Consulta y visualización del menú público o detalle de platillos.
- Cualquier operación donde la interfaz de usuario esté esperando activamente la respuesta para completar la interacción inmediata.

## 4. Resolución de Ambigüedades
Si una tarea u operación propuesta no encaja con claridad en ninguna de las dos listas anteriores, debe señalarse formalmente dentro de la sección de riesgos de la auditoría (`01-auditoria.md`) para que el usuario determine el enfoque arquitectónico adecuado.
