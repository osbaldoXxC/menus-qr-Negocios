---
name: aws-deployment
description: >-
  Validación de contrato de esquema de base de datos PostgreSQL/pgvector, sincronización de secretos con AWS Secrets Manager y procedimientos de despliegue a AWS EC2 único con Docker Compose y S3/CloudFront en MexxicanMX. Activar al tocar modelos, consultas SQL, migraciones, variables de entorno, preparación de despliegues o comandos de infraestructura.
---

# AWS Deployment & Schema Contract - MexxicanMX

Esta skill gobierna la verificación obligatoria del contrato de datos de PostgreSQL y la preparación/ejecución segura de despliegues hacia la infraestructura de producción en AWS para MexxicanMX.

## Principios Innegociables
1. **Contrato de Esquema Estricto:** Está prohibido escribir nombres de tablas, columnas, atributos o modelos que no existan en `db/contract/schema.json` o `db/contract/SCHEMA.md`.
2. **Cero Secretos en Repositorio:** Ninguna variable sensible se guarda en `.env` en producción. Toda credencial se gestiona mediante AWS Secrets Manager (`mexxicanmx/production/api`) según `deploy/secrets.manifest.json`.
3. **Instancia Única EC2:** La arquitectura de producción opera en una única instancia EC2 con Docker Compose y volumen EBS persistente (`/mnt/ebs/postgres`, `/mnt/ebs/redis`). No se usan clusters ECS, ECR, ni Fargate salvo indicación explícita del usuario.
4. **Despliegue Asistido y Confirmado:** Nunca ejecutar despliegues en producción de forma autónoma. Presentar el preflight y solicitar confirmación explícita del usuario.

---

## Flujo A — Verificación de Contrato de Esquema (Antes de tocar código o SQL)

Antes de redactar o modificar cualquier modelo, consulta SQL o DTO:

### A1. Inspeccionar Contrato Existente
Consultar la definición formal del esquema en el repositorio local:
- `db/contract/SCHEMA.md` (formato legible para revisión humana y del agente).
- `db/contract/schema.json` (esquema estructurado de tablas, tipos, llaves foráneas e índices).
- `db/contract/schema.lock` (hash SHA-256 de integridad).

### A2. Extracción de Esquema (Solo si la BD ha recibido migraciones)
Si se aplicaron migraciones locales o remotas y se requiere actualizar el contrato:
```bash
python scripts/extract_schema.py --out db/contract
```

### A3. Validación de Código contra el Contrato
Ejecutar la validación estática para asegurar que ningún archivo contenga discrepancias:
```bash
python scripts/validate_code_vs_schema.py --schema db/contract/schema.json --root .
```
- **0 errores:** Proceder con la implementación.
- **Errores reportados:** Corregir el código al nombre real de la BD o generar una migración formal si el campo es nuevo.

---

## Flujo B — Gestión de Secretos y Configuración

Toda variable debe contrastarse contra `deploy/secrets.manifest.json`.

- **Claves de Configuración (no secretas):** `PORT`, `AWS_REGION`, `FRONTEND_URL`, `PUBLIC_MENU_URL`, `S3_BUCKET_NAME`, etc.
- **Claves Secretas:** `DATABASE_URL`, `JWT_SECRET`, `POSTGRES_PASSWORD`, `REDIS_URL`, `REFRESH_TOKEN_SECRET`, `RESEND_API_KEY`.
- **Secreto AWS:** `mexxicanmx/production/api` en la región `us-east-1`.

Para validar la sincronización de secretos sin exponer valores:
```bash
python scripts/preflight_deploy.py --check-secrets
```

---

## Flujo C — Preflight y Despliegue a Producción

### C1. Preflight Check Obligatorio
Antes de cualquier despliegue, validar la integridad del proyecto:
```bash
python scripts/preflight_deploy.py
```
El preflight verifica:
- Rama Git limpia y sincronizada con `origin/develop` o `origin/main`.
- Suite de pruebas de Playwright pasando 100% en verde.
- Ausencia de discrepancias en `validate_code_vs_schema.py`.
- Consistencia del manifiesto de secretos `deploy/secrets.manifest.json`.

### C2. Ejecución Remota (Previa Autorización)
Una vez aprobado el resultado del preflight por el usuario, el despliegue a la instancia EC2 se coordina mediante el script de automatización:
```bash
bash scripts/deploy_remote.sh
```
El script actualiza el código en `/home/ubuntu/app`, asegura los permisos en `/mnt/ebs` y reinicia los contenedores orquestados con Docker Compose tras validar el Reverse Proxy de Nginx.
