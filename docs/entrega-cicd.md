# Manejo de scripts para MexxicanMX

## Caso de estudio y justificación del pipeline

MexxicanMX ofrece menús digitales para negocios. El proyecto usa React, Node.js, servicios Python, PostgreSQL y Redis. El flujo propuesto valida sintaxis, contrato de datos y pruebas de recomendaciones; después construye los dos frontends. La publicación existente en AWS se ejecuta para main y mediante ejecución manual. El cambio propuesto hace que los dos trabajos de publicación esperen a la validación. Esto permite detener un despliegue si alguna comprobación falla. El flujo reutilizable también se ejecuta en solicitudes de cambios y en la rama de la actividad.

## Entorno de liberación y despliegue

La validación usa GitHub Actions en Ubuntu, Node.js 22.12 y Python 3.11; instala las dependencias de `ml-service` y las de los frontends con `npm ci`. El despliegue existente utiliza el rol `AWS_ROLE_ARN` mediante OIDC, S3 y CloudFront para los frontends, y SSM para ejecutar Docker Compose en EC2 para backend y servicios de IA. La infraestructura declarada también comprende PostgreSQL, Redis, EBS y Secrets Manager. No se deben registrar credenciales en el repositorio.

## Niveles de servicio propuestos

Estos valores son objetivos académicos, no un acuerdo contractual ni resultados medidos: disponibilidad mensual 99.5 %; latencia HTTP p95 inferior a 500 ms; primera respuesta a incidentes críticos en 30 minutos dentro del horario de soporte; objetivo de recuperación de 4 horas. Deben acordarse ventanas de soporte, medición y exclusiones antes de adoptarse.

## Métricas para monitoreo

Medir disponibilidad externa de `/health`, porcentaje de respuestas 5xx, latencia p95 y p99, CPU y memoria de EC2, espacio del volumen EBS y resultado de despliegues. Alertas iniciales propuestas: tres fallos consecutivos de salud, error 5xx superior al 1 % durante cinco minutos con tráfico suficiente y utilización sostenida superior al 80 %. La recolección y las alertas requieren configuración adicional; el pipeline no las instala.

## Parámetros de herramientas

- GitHub Actions: `ubuntu-latest`, Node 22.12.0 y Python 3.11 para validación; `AWS_ROLE_ARN` es una variable del repositorio para OIDC.
- Aplicación web: `VITE_API_URL`, con valor de reserva declarado en el workflow de despliegue.
- AWS: región `us-east-1`; los buckets, distribuciones e instancia están definidos en `.github/workflows/deploy.yml`.
- Docker Compose: `compose.prod.yml` define servicios, puertos y dependencias. Los datos de producción se conservan en EBS mediante rutas configuradas en el entorno.
- Secretos: se administran con Secrets Manager y permisos de AWS; no se incluyen valores sensibles en la entrega.

## Scripts del repositorio

- `.github/workflows/ci-entrega.yml`: validación de la liberación.
- `scripts/ci/validate_release.sh`: pruebas del entorno de liberación, sintaxis y contrato.
- `.github/workflows/deploy.yml`: empaquetado y publicación a S3, CloudFront y EC2/SSM.
- `compose.prod.yml` y `scripts/deploy_remote.sh`: configuración del entorno de producción y procedimiento remoto existente. El workflow usa sus propios comandos SSM, no invoca `deploy_remote.sh`.
- `ml-service/test_recommendations.py`: pruebas existentes de recomendaciones.

El historial de Actions contiene un despliegue exitoso del 23 de septiembre de 2026. Al revisar esta versión, `test_case_8_few_dishes` falla: no debe interpretarse como una prueba superada. La validación propuesta bloqueará la publicación mientras alguna comprobación falle. La activación en main requiere integrar la rama, lo que puede disparar el despliegue real existente.
