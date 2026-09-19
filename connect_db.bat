@echo off
title Conectar a Base de Datos PostgreSQL via AWS SSM (Sin Llave .pem)
echo ==========================================================================
echo  🛢️ CONECTANDO A POSTGRESQL EN EC2 (Instance ID: i-02a33324a3adc168f)
echo ==========================================================================
echo.
echo Usando AWS SSM Session Manager (Sin requerir llave .pem)...
echo.
aws ssm start-session --target i-02a33324a3adc168f --region us-east-1 --document-name AWS-StartInteractiveCommand --parameters command="sudo docker exec -it mexxicanmx_db_prod psql -U admin_mexx -d mexxicanmx_db"
if errorlevel 1 (
    echo.
    echo Iniciando sesion interactiva SSM...
    aws ssm start-session --target i-02a33324a3adc168f --region us-east-1
)
pause
