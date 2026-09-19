#!/bin/bash
# Script para conectarse a la Base de Datos PostgreSQL en el servidor EC2
echo "=================================================="
echo " 🛢️  Conectando a PostgreSQL (mexxicanmx_db)..."
echo "=================================================="
sudo docker exec -it mexxicanmx_db_prod psql -U admin_mexx -d mexxicanmx_db
