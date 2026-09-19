# Script de PowerShell para conectarse a PostgreSQL mediante AWS SSM (Sin archivo .pem)
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " 🛢️ CONECTANDO A POSTGRESQL EN EC2 (AWS SSM - Sin Llave .pem)" -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Conectando al servidor i-02a33324a3adc168f..." -ForegroundColor Yellow

aws ssm start-session --target i-02a33324a3adc168f --region us-east-1 --document-name AWS-StartInteractiveCommand --parameters command="sudo docker exec -it mexxicanmx_db_prod psql -U admin_mexx -d mexxicanmx_db"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Abriendo terminal interactiva SSM..." -ForegroundColor Yellow
    aws ssm start-session --target i-02a33324a3adc168f --region us-east-1
}
