# Actividad CI/CD - Manejo de Scripts (Abraham)

Rama: `feature/abraham-actividad-cicd`

Este paquete **solo agrega archivos nuevos**; no modifica `deploy.yml` ni nada de lo que ya usa el equipo.

## Qué agrega

```
.github/workflows/cicd-actividad.yml   Pipeline: validación, compilación, entorno de liberación, empaquetado, despliegue manual
compose.release.yml                    Entorno de liberación efímero (PostgreSQL pgvector + Redis + backend)
scripts/cicd/pipeline/check-syntax.sh  Valida la sintaxis de los .js del backend
scripts/cicd/env/release-up.sh         Genera el entorno de liberación
scripts/cicd/env/wait-for-health.sh    Espera a que /health responda 200
scripts/cicd/env/release-down.sh       Destruye el entorno de liberación
scripts/cicd/tests/smoke-test.sh       Seis pruebas de humo contra el entorno de liberación
scripts/cicd/tests/healthcheck-monitor.sh  Monitoreo de /health para cron en la EC2
scripts/cicd/deploy/package-bundle.sh  Empaqueta backend_app-<commit>.zip
scripts/cicd/deploy/ssm-deploy.sh      Sube a S3, registra versión y libera en la EC2 por SSM
scripts/cicd/deploy/ssm-remote-release.sh  Ejecuta la liberación remota y verifica /health
scripts/cicd/deploy/ssm-rollback.sh    Regresa a la versión PREVIOUS
```

## Cómo subirlo a tu rama

```bash
git checkout develop && git pull
git checkout -b feature/abraham-actividad-cicd
# copia el contenido de este paquete a la raíz del repositorio, luego:
chmod +x scripts/cicd/*/*.sh
git add .github/workflows/cicd-actividad.yml compose.release.yml scripts/cicd README-CICD.md
git commit -m "ci: pipeline CI/CD de la actividad (entorno de liberación, pruebas y despliegue)"
git push -u origin feature/abraham-actividad-cicd
```

Al hacer *push*, el pipeline corre solo (etapas 1 a 4). Después abre un Pull Request hacia `develop`.

## Configuración en GitHub (solo para la etapa de despliegue)

Settings > Environments > `production`:
- Activar **Required reviewers**.
- Variables: `AWS_ROLE_ARN` (ya existe), `EC2_INSTANCE_ID` y `RELEASE_BUCKET` (nuevas).

Para desplegar: Actions > "CI/CD Actividad" > Run workflow > marcar `deploy`.
Si no tienes acceso a AWS, las etapas 1 a 4 funcionan igual y demuestran el pipeline.

## Qué se verificó y qué no

Verificado: sintaxis de todos los scripts (`bash -n`), validez de los YAML, `check-syntax.sh` contra el backend real (36 archivos sin error en `develop`) y la validación del contrato de esquema (sin hallazgos), `smoke-test.sh` contra un servidor simulado (6 de 6) y el empaquetado del bundle.

**No verificado** (no había Docker daemon ni AWS): el arranque real de `compose.release.yml` y el despliegue por SSM. Revisa la primera corrida en la pestaña Actions.

## Hallazgos del repositorio actual

- Existe `backend/src/controllers/supportController_old.js` (en `main` su contenido está corrupto). No se importa en ningún lado; el chequeo omite los archivos `*_old.js`.
- `backend/Dockerfile` usa `node:18-alpine`, pero el README del proyecto dice Node 20.
- `develop` ya trae `ci.yml` (contrato de esquema, sintaxis de 3 archivos, compilación de los 3 frontends y de los servicios Python). Este pipeline lo complementa con el entorno de liberación, las pruebas de humo, el empaquetado y el despliegue con retroceso, y revisa la sintaxis de **todos** los archivos del backend.
- `deploy.yml` despliega a producción en cada *push* a `main` sin pruebas previas; este pipeline agrega esos controles sin reemplazarlo.
