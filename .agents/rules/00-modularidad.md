# 00 - Modularidad y Separación de Responsabilidades

## 1. Principio Fundamental
Cada responsabilidad vive en su propio archivo y capa. Está estrictamente prohibido mezclar reglas o responsabilidades de distintos temas en el mismo archivo, configuración, commit o Pull Request.

## 2. Arquitectura en Capas
El código de la aplicación debe estructurarse obligatoriamente siguiendo un flujo unidireccional y limpio:
1. **Rutas / Controladores (`routes` / `controllers`):**
   - Reciben la petición HTTP.
   - Aplican middlewares de autenticación, autorización y validación de schemas.
   - Delegan de inmediato a la capa de servicios.
   - **Prohibido:** Colocar lógica de negocio, cálculos de tarifas, generación de tokens o consultas SQL directas dentro del controlador.
2. **Servicios / Lógica de Negocio (`services`):**
   - Implementan las reglas del negocio de MexxicanMX.
   - Coordinan llamadas entre múltiples repositorios o clientes externos (Redis, S3, FastAPI).
   - No tienen conocimiento de objetos de transporte HTTP (`req`, `res`).
3. **Repositorios / Acceso a Datos (`db` / `repositories`):**
   - Ejecutan consultas a PostgreSQL o interactúan con el cliente de Redis.
   - Encapsulan el SQL y el mapeo de entidades de la base de datos.
   - No toman decisiones de negocio.

## 3. Delegación de Despliegue e Infraestructura
Todo lo relativo a:
- Esquema de base de datos (`PostgreSQL` / `pgvector`).
- Variables de entorno y sincronización con AWS Secrets Manager.
- Infraestructura y scripts de despliegue a AWS EC2 / S3 / CloudFront.

Se delega exclusivamente a la skill oficial del proyecto: `aws-deployment`. Este conjunto de reglas de desarrollo no duplica, modifica ni reinventa los flujos de despliegue ya establecidos.
