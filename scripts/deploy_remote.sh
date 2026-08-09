#!/bin/bash
set -e
export PATH=$PATH:/usr/local/bin

echo "[REMOTE DEPLOY] Descargando código de aplicación desde S3..."
aws s3 cp s3://oamdevsol-cfn-templates-825765395825/backend_app.zip /home/ubuntu/backend_app.zip --region us-east-1

echo "[REMOTE DEPLOY] Descomprimiendo archivos..."
mkdir -p /home/ubuntu/app
unzip -o /home/ubuntu/backend_app.zip -d /home/ubuntu/app
cd /home/ubuntu/app

echo "[REMOTE DEPLOY] Levantando servicios Backend y PostgreSQL (mexxicanmx_db_prod con pgvector, redis, backend, ai-engine)..."
sudo docker compose -f compose.prod.yml up -d --build postgres redis backend ai-engine

echo "[REMOTE DEPLOY] Creando usuario SUPER_ADMIN (baldo2005_@outlook.com)..."
sleep 3
sudo docker exec app-backend-1 node src/scripts/seed_admin.js || true

echo "[REMOTE DEPLOY SUCCESS] Todos los contenedores del Backend están arriba y funcionando."
sudo docker ps
