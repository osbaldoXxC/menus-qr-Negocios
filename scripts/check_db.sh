#!/bin/bash
echo "=== TABLAS EN POSTGRES ==="
sudo docker exec mexxicanmx_db_prod psql -U admin_mexx -d mexxicanmx_db -c "\dt"
echo "=== COLUMNAS DE RESTAURANTES ==="
sudo docker exec mexxicanmx_db_prod psql -U admin_mexx -d mexxicanmx_db -c "\d restaurantes" 2>/dev/null || echo "TABLA restaurantes NO EXISTE"
echo "=== CONTENEDORES DOCKER ==="
sudo docker ps
