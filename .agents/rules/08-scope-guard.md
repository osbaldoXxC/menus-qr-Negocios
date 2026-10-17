# 08 - Guardián de Alcance y Estabilidad Arquitectónica

## 1. Principio de No Invasión Arquitectónica
- Queda terminantemente prohibido proponer o introducir cambios en la arquitectura base del proyecto como parte de la resolución de una funcionalidad requerida, aun bajo el argumento de que "técnicamente sería mejor".
- Ejemplos de cambios prohibidos salvo solicitud explícita del usuario:
  - Migrar la infraestructura a AWS ECS, ECR, Fargate o Kubernetes.
  - Reemplazar PostgreSQL por otra base de datos o introducir nuevos motores no aprobados.
  - Renombrar tablas o reestructurar modelos de datos centrales sin orden directa.
  - Reescribir módulos enteros en frameworks o librerías alternativas.

## 2. Manejo de Bloqueos por Arquitectura
Si la arquitectura existente complica, ralentiza o bloquea la implementación de una funcionalidad solicitada:
1. No intentar sortearla modificando la infraestructura por cuenta propia.
2. Documentar el hallazgo detalladamente en la sección de **Riesgos e Impacto** de la auditoría técnica (`01-auditoria.md`).
3. Detener la codificación y esperar la aprobación y dirección explícita del usuario.

## 3. Delegación de Despliegue y Datos
Todo lo concerniente a:
- Esquema de base de datos (`init.sql`, tablas, columnas, migraciones).
- Variables de entorno, llaves y secretos de AWS Secrets Manager.
- Comandos de despliegue a AWS EC2 / S3 / CloudFront.

Se delega estrictamente en la skill `aws-deployment`. Prohibido inventar pasos o alterar la infraestructura sin su concurso.
