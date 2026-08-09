# Script de Despliegue Unificado para PowerShell (Infraestructura + Frontends)
$ErrorActionPreference = "Stop"

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "   DESPLIEGUE UNIFICADO MEXXICANMX / OAMDEVSOL (INFRAESTRUCTURA + CÓDIGO) " -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

# 1. Ejecutar deploy.py mediante Python
python deploy.py
