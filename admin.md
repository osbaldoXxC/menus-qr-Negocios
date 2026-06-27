🛠️ Panel de SuperAdministrador (Backoffice Central)
Este nuevo proyecto actuará como el cerebro de control de MexxicanMX, encargado de vigilar las altas, bajas y tiempos de expiración de todos los clientes de la plataforma.

1. Base de Datos: Nuevos Campos de Control (PostgreSQL)
Para soportar esta administración, la tabla de restaurantes (o usuarios administradores) se actualizará con los siguientes campos obligatorios:

estado: VARCHAR (Valores: 'pendiente', 'aprobado', 'suspendido'). Por defecto, todo nuevo registro entra como 'pendiente'.

fecha_vencimiento: TIMESTAMP (Guarda el día exacto en que expira su acceso).

dias_acceso_permitidos: INTEGER (Cantidad de días otorgados).

2. Flujo de Control de Acceso y Activación
Cuando un dueño de restaurante se registra en la plataforma desde la Landing Page pública, ocurre el siguiente proceso:

Fase de Espera (Pre-Aprobación): El restaurante se registra, pero su cuenta queda en estado 'pendiente'. Si intenta iniciar sesión en su panel privado, el sistema le denegará el acceso con un mensaje: "Tu cuenta está en proceso de revisión por el administrador".

Módulo de Autorización en el Backoffice: El SuperAdmin visualiza una Lista de Solicitudes Pendientes. Desde aquí puede:

Liberar/Aprobar Cuenta: El SuperAdmin ingresa manualmente el número de días de acceso permitidos (por ejemplo: 30 días, 90 días, 365 días). El sistema calcula automáticamente la fecha_vencimiento sumando esos días a la fecha actual y cambia el estado a 'aprobado'. A partir de este momento, el restaurante ya puede operar.

3. El Mecanismo de Cancelación Inmediata (The Kill Switch)
Si un restaurante incumple las políticas, cancela su suscripción o su periodo de prueba expira, el SuperAdmin puede presionar el botón de "Cancelar Acceso". Esto dispara un flujo destructivo en tiempo real diseñado para proteger el sistema:

Paso A: Invalidation del refresh_token e Impacto en el Frontend
El backend del SuperAdmin cambia el estado del restaurante a 'suspendido'.

Destrucción de Sesión: Se elimina por completo el refresh_token del usuario de la base de datos (o de la lista de sesiones activas en Redis).

Expulsión del Frontend: Al destruirse el refresh_token, en cuanto el frontend del restaurante intente renovar su sesión automática (Silent Refresh) o intente realizar cualquier acción, el backend rechazará el token. El frontend detectará este error (401/403) y redigirá inmediatamente al usuario a la pantalla de /login, bloqueándole la entrada.

Paso B: Pausado Masivo del Menú Público
Para evitar que un restaurante suspendido siga mostrando su carta a los comensales, el sistema ejecuta un proceso de apagado automático:

Modificación en Lote (Bulk Update): El backend ejecuta de forma automática la siguiente consulta en la base de datos:

SQL
UPDATE platillos 
SET activo = false 
WHERE restaurante_id = $1;
Desaparición del Estado "Activado": Todos los productos cambian su estatus internamente. En el panel del dueño, el interruptor de "Activado" desaparece o se muestra como apagado de manera forzosa.

Purga Absoluta de Caché: El sistema ejecuta inmediatamente un redis.del("cache:menu:" + restaurante_id). Al borrarse la caché y estar el restaurante suspendido, si un comensal intenta escatnear el código QR en la mesa, el sistema público arrojará un error de "Menú no disponible o cuenta suspendida".