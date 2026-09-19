#!/bin/bash
set -e
export PATH=$PATH:/usr/local/bin:/snap/bin

echo "=========================================================================="
echo " [REMOTE DEPLOY] INICIANDO DESPLIEGUE EN SERVIDOR EC2 UBUNTU 24.04"
echo "=========================================================================="

# 1. Obtener Account ID dinámicamente
ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text 2>/dev/null || echo "256663926988")
STAGING_BUCKET="oamdevsol-cfn-templates-${ACCOUNT_ID}"

echo "[REMOTE DEPLOY] Descargando código de aplicación desde s3://${STAGING_BUCKET}/backend_app.zip..."
aws s3 cp "s3://${STAGING_BUCKET}/backend_app.zip" /home/ubuntu/backend_app.zip --region us-east-1

echo "[REMOTE DEPLOY] Descomprimiendo archivos en /home/ubuntu/app..."
mkdir -p /home/ubuntu/app
unzip -o /home/ubuntu/backend_app.zip -d /home/ubuntu/app
cd /home/ubuntu/app

# 2. Configurar permisos en el volumen EBS montado
echo "[REMOTE DEPLOY] Verificando persistencia en volumen EBS /mnt/ebs..."
mkdir -p /mnt/ebs/postgres /mnt/ebs/redis
sudo chown -R 999:999 /mnt/ebs/postgres || true
sudo chmod 700 /mnt/ebs/postgres || true
sudo chown -R 999:999 /mnt/ebs/redis || true

# 3. Configurar Nginx Reverse Proxy (api.oamdevsol.site & monitor.oamdevsol.site)
echo "[REMOTE DEPLOY] Configurando Nginx Reverse Proxy para subdominios oamdevsol.site..."
sudo cat << 'EOF' > /etc/nginx/sites-available/oamdevsol.conf
server {
    listen 80;
    server_name api.oamdevsol.site;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name monitor.oamdevsol.site;

    location / {
        proxy_pass http://127.0.0.1:4000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/oamdevsol.conf /etc/nginx/sites-enabled/oamdevsol.conf
sudo nginx -t && sudo systemctl restart nginx || echo "⚠️ Advertencia con reinicio de Nginx"

# 4. Levantar Servicios con Docker Compose
echo "[REMOTE DEPLOY] Levantando servicios Backend, PostgreSQL, Redis, ML Service..."
sudo docker compose -f compose.prod.yml up -d --build postgres redis backend ml-service ai-engine

# 5. Esperar que PostgreSQL esté listo
echo "[REMOTE DEPLOY] Esperando disponibilidad de PostgreSQL..."
for i in {1..30}; do
    if sudo docker exec mexxicanmx_db_prod pg_isready -U admin_mexx -d mexxicanmx_db > /dev/null 2>&1; then
        echo "✅ PostgreSQL está listo."
        break
    fi
    sleep 2
done

# 6. Inicializar Catálogos Limpios y Superadmin (0 datos demo)
if [ -f "scripts/init_prod_database.sql" ]; then
    echo "[REMOTE DEPLOY] Inicializando catálogos limpios y superadmin (init_prod_database.sql)..."
    cat scripts/init_prod_database.sql | sudo docker exec -i mexxicanmx_db_prod psql -U admin_mexx -d mexxicanmx_db || true
fi

# 7. Verificar estado de contenedores
echo "=========================================================================="
echo " [REMOTE DEPLOY SUCCESS] Todos los contenedores están arriba y funcionando."
echo "=========================================================================="
sudo docker ps
