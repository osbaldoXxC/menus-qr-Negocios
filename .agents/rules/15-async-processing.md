# 15 - Regla de Procesamiento Asíncrono y Colas

## 1. Integración con la Skill `async-processing-patterns`
Define cuándo y cómo delegar tareas pesadas a ejecución en segundo plano para proteger el tiempo de respuesta de la API REST.

## 2. Directrices Clave
- **Criterio de Exclusión:** Operaciones críticas para la interacción inmediata (login, lectura de menú, autorización) permanecen 100% síncronas.
- **Idempotencia Garantizada:** Toda tarea encolada (envío de correos, procesamiento de fotos, reportes) debe poder reintentarse sin provocar duplicaciones en base de datos.
- **Reintentos y DLQ:** Política de retroceso exponencial (*exponential backoff*) con límite de intentos y envío a Dead-Letter Queue en caso de fallo definitivo.
