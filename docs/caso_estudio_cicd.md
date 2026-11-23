# Liberación y despliegue continuo de MexxicanMX

**Caso de estudio de ingeniería DevOps**
**Repositorio** `osbaldoXxC/menus-qr-Negocios`
**Destino de producción** AWS en `us-east-1`

MexxicanMX permite a los comensales consultar menús con códigos QR y a los restaurantes administrar su catálogo. El flujo de GitHub Actions valida el código contra el contrato SQL, publica las interfaces en AWS y comprueba que los servicios públicos respondan después del despliegue. La validación estática se comprobó localmente. La ejecución completa en AWS y la aceptación de los niveles de servicio están pendientes de evidencia.

## 1 Justificación del pipeline

Un cambio de código puede introducir consultas incompatibles con PostgreSQL, dejar una interfaz en caché o interrumpir las consultas de menú. Antes de publicar, el pipeline ejecuta un análisis estático contra el contrato de 20 tablas. Una falla bloquea ambos trabajos de despliegue. GitHub Actions obtiene credenciales temporales mediante OIDC y usa SSM para ejecutar el despliegue en EC2 sin una conexión SSH del runner. CloudFront recibe una solicitud de invalidación después de publicar las interfaces.

1. Un push a `main` o una ejecución manual inicia el workflow. Los trabajos que publican solo se ejecutan desde `main`.
2. `validate-release` verifica el código contra el contrato SQL del repositorio.
3. `deploy-frontends` instala dependencias desde los lockfiles, compila ambas interfaces y publica sus directorios `dist` en S3. `deploy-backend` empaqueta el código, lo sube a un bucket de artefactos y ordena a EC2 reconstruir los contenedores mediante SSM. Los dos trabajos pueden ejecutarse en paralelo.
4. `verify-deployment` espera el éxito de ambos trabajos y verifica `/health` y las páginas de inicio de las dos interfaces. Si los chequeos funcionales siguen fallando después de cinco intentos, falla la ejecución.

GitHub Actions serializa los despliegues de este workflow para evitar publicaciones simultáneas. El workflow `guard-main.yml` audita el actor en una ejecución independiente. La validación automatizada usa el contrato versionado. El preflight ampliado se ejecuta por separado con permisos AWS y requiere conectividad a la base de destino para comprobar el esquema en vivo.

## 2 Entornos de liberación y despliegue

| Entorno | Requisitos y componentes |
| --- | --- |
| Liberación | Runner `ubuntu-latest`, Python 3.11 para la validación, Node.js 20 y npm para compilar Vite, AWS CLI y zip para publicar y empaquetar. Los lockfiles fijan las dependencias de ambas interfaces. |
| Producción web | S3 aloja los artefactos de las dos interfaces y los recursos multimedia. CloudFormation define tres distribuciones CloudFront para app, panel y CDN, con HTTPS en el borde. Se usa un bucket adicional para plantillas y paquetes de despliegue. |
| Producción de la API | EC2 con Ubuntu 24.04, Docker Compose y SSM Agent. Compose ejecuta la API, los servicios de recomendación, PostgreSQL 16 con pgvector y Redis. CloudFormation configura `t3.micro` y un volumen de datos EBS gp3 cifrado de 20 GB. |
| Red y persistencia | VPC `10.0.0.0/16`, subred `10.0.1.0/24` y red interna Docker para datos. PostgreSQL y Redis montan directorios en `/mnt/ebs`. El parámetro de IaC de SSH admite `0.0.0.0/0`. La configuración efectiva de acceso queda por verificar en AWS. |

## 3 Niveles de servicio propuestos

Las metas se proponen para el caso de estudio. El responsable del servicio debe confirmar su aceptación, la fecha de entrada en vigor y el procedimiento ante un incumplimiento para poder registrarlas como acuerdos.

| Servicio o proceso | Indicador | Meta propuesta y ventana |
| --- | --- | --- |
| Menú QR | Consultas válidas a la API pública de menú con respuesta esperada / total de consultas sintéticas | Disponibilidad ≥ 99.9 % mensual, con monitoreo 24/7 |
| Panel de administración | Chequeos HTTP exitosos / chequeos ejecutados | Disponibilidad ≥ 99.5 % mensual |
| API transaccional | Solicitudes sin error 5xx / total de solicitudes, separadas de los chequeos de disponibilidad | ≥ 99.5 % mensual |
| Lectura de menú | Percentil 95 de latencia de una consulta válida a la API de menú | p95 ≤ 400 ms en ventanas de cinco minutos |
| Despliegue | Corridas exitosas / corridas finalizadas en main, y duración por separado | ≥ 98 % de éxito mensual y objetivo de ≤ 5 min por corrida |
| Recuperación | Tiempo hasta recuperar el servicio y antigüedad de los datos recuperados | RTO ≤ 15 min ante pérdida de instancia y RPO < 24 h ante pérdida del volumen. Pendientes de validar mediante restauración. |

## 4 Métricas y alertas

| Métrica | Fuente y frecuencia | Umbral o acción |
| --- | --- | --- |
| Salud de aplicación y BD | Prueba implementada después del despliegue. GET `/health` debe indicar `UP` y `connected`. | Falla el trabajo si todos los intentos fallan. Una sonda periódica independiente queda propuesta para medir disponibilidad mensual. |
| Disponibilidad de lectura de menú | Sonda periódica propuesta contra un menú de prueba con respuesta esperada. | Alertar tras dos fallas consecutivas. Revisar API, PostgreSQL y logs. |
| Latencia y errores de API | Logs del proxy o telemetría de la API. Agregación propuesta cada cinco minutos. | Alertar si p95 de lectura supera 400 ms o si 5xx supera 1 %. |
| CDN | CloudWatch por distribución. Revisar tasa de caché y errores 5xx. | Umbral propuesto de caché < 70 %. Revisar políticas y cabeceras. |
| EC2 y disco de datos | CloudWatch para CPU y créditos. Medir porcentaje de uso de `/mnt/ebs` con un agente o sonda de sistema. | Umbrales propuestos de CPU > 75 % y disco > 80 %. Revisar carga y capacidad. |

La prueba de humo verifica HTTP 200 en ambas interfaces y el JSON de salud del backend. Los 500 ms de API y 400 ms de interfaz son umbrales de aviso para muestras individuales. Las cabeceras de seguridad faltantes también generan avisos. Los percentiles y la disponibilidad mensual requieren un historial de mediciones. Los healthchecks de PostgreSQL y Redis están definidos en Compose.

## 5 Parámetros de configuración

| Herramienta | Parámetros y ubicación |
| --- | --- |
| GitHub Actions | `AWS_ROLE_ARN` y `VITE_API_URL` como variables del repositorio. El valor por defecto de la URL es `https://backend.oamdevsol.site/api`. `id-token: write` habilita OIDC y `contents: read` permite el checkout. |
| Terraform e IAM | `infra/oidc.tf` e `infra/iam.tf`. Rol `aws-git`, audiencia `sts.amazonaws.com` y sujeto limitado a la rama `main` del repositorio. |
| CloudFormation | `cloudformation/parameters.json`. Prefijo `oamdevsol`, tipo `t3.micro`, `EbsVolumeSize=20`, certificado ACM y dominios de app, panel y CDN. |
| SSM y Docker Compose | Región `us-east-1`, documento `AWS-RunShellScript` y archivo `compose.prod.yml`. El workflow consulta el estado del comando. |
| Secrets Manager | `deploy/secrets.manifest.json` documenta el identificador `mexxicanmx/production/api` y las claves requeridas. Los valores se administran fuera de Git. |

La verificación automatizada consulta `backend.oamdevsol.site`. El script auxiliar `deploy_remote.sh` contiene configuración para `api.oamdevsol.site` y `monitor.oamdevsol.site`. El despliegue normal de GitHub Actions ejecuta Compose directamente vía SSM.

## 6 Vinculación con AWS y evidencia

El código configura la cadena GitHub Actions → OIDC → AWS IAM → S3 y CloudFront para las interfaces, y SSM → EC2 para la API. El workflow `test-oidc.yml` permite comprobar la identidad con STS. La URL del historial es https://github.com/osbaldoXxC/menus-qr-Negocios/actions.

Para acreditar el vínculo, queda pendiente registrar el enlace de una ejecución exitosa del commit entregado, el resultado de STS y SSM y los resultados de las pruebas de humo. La comprobación local ejecutó `python scripts/test_release_env.py --skip-network` y obtuvo 20 tablas en el contrato, sin hallazgos del validador.

## 7 Inventario de la entrega

| Requisito | Archivos y función |
| --- | --- |
| Scripts del pipeline | `.github/workflows/deploy.yml` orquesta la validación, la publicación y la verificación. `test-oidc.yml` prueba la identidad y `guard-main.yml` audita el actor. |
| Generación del entorno de liberación | `scripts/build_release_frontends.sh` instala las dependencias fijadas y genera los artefactos de las dos interfaces en el runner. `scripts/provision_release_env.sh`, `cloudformation/` e `infra/` preparan la infraestructura AWS y la federación. |
| Pruebas del entorno de liberación | `scripts/test_release_env.py --skip-network` usa `scripts/validate_code_vs_schema.py` antes de publicar. El modo `--smoke-only` verifica los servicios publicados. `scripts/preflight_deploy.py` ofrece comprobaciones operativas adicionales. |
| Generación del despliegue | `deploy.yml` contiene los comandos de publicación a S3, invalidación y despliegue por SSM. `compose.prod.yml` define los servicios. `scripts/deploy_remote.sh` y `scripts/sync_secrets.py` son utilidades operativas separadas. |
