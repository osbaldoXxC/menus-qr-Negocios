# MexxicanMX — Plataforma SaaS de Menús Digitales con QR

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%2B%20pgvector-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7%20Alpine-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![AWS](https://img.shields.io/badge/AWS-CloudFront%20%7C%20S3%20%7C%20EC2%20%7C%20EBS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

---

## 📌 Descripción General

**MexxicanMX** es una plataforma SaaS integral para la digitalización de experiencias gastronómicas. Proporciona a los comensales menús digitales interactivos mediante códigos QR dinámicos, recomendaciones basadas en IA con vectorización semántica (`pgvector`), y ofrece a restaurantes y administradores paneles completos para el control de inventario, personalización de cartas, pedidos, suscripciones y analíticas.

---

## 🌐 Entornos y Subdominios en Producción

Toda la infraestructura opera bajo el dominio institucional **`oamdevsol.site`** con cifrado SSL/TLS de extremo a extremo gestionado con **AWS Certificate Manager (ACM)**:

| Subdominio / URL | Origen en AWS | Capa CDN / Seguridad | Función Principal |
| :--- | :--- | :--- | :--- |
| [app.oamdevsol.site](https://app.oamdevsol.site) | Bucket S3: `oamdevsol-restaurant-256663926988` | CloudFront (HTTPS) | Menú comensales y dashboard de restaurantes (SPA React/Vite) |
| [panel.oamdevsol.site](https://panel.oamdevsol.site) | Bucket S3: `oamdevsol-admin-256663926988` | CloudFront (HTTPS) | Panel de control Super Admin (SPA React/Vite/Tailwind) |
| [cdn.oamdevsol.site](https://cdn.oamdevsol.site) | Bucket S3: `oamdevsol-assets-256663926988` | CloudFront (HTTPS) | CDN multimedia de fotografías en HD, banners y logotipos |
| [backend.oamdevsol.site](https://backend.oamdevsol.site) | EC2 (`32.192.61.156`) Nginx :80 ➔ Node :4000 | CloudFront (HTTPS Edge) | API REST, Auth JWT, Webhooks y endpoints de datos |

---

## 🏗️ Arquitectura Oficial de Despliegue en AWS

A continuación se muestra el diagrama arquitectónico estricto de la infraestructura en producción:

![Arquitectura AWS MexxicanMX](docs/img/aws_architecture.png)

### Flujo y Componentes de Infraestructura:
1. **DNS Externo & Certificados SSL:**
   - **Hostinger DNS Zone (`oamdevsol.site`):** Gestiona los registros `CNAME` hacia CloudFront y registro `A` hacia la Elastic IP de la instancia EC2.
   - **AWS Certificate Manager (ACM):** Certificado SSL Wildcard (`*.oamdevsol.site`) en `us-east-1` validado vía CNAME.
2. **Capa CDN & Frontends (Amazon CloudFront + S3):**
   - CloudFront realiza la terminación SSL/TLS en el borde y sirve los assets estáticos desde **3 Buckets S3 dedicados** con latencia ultra-baja.
3. **VPC y Cómputo Backend (Amazon EC2 + Docker Compose):**
   - **Instancia EC2 (t3.micro, Ubuntu 24.04 LTS):** Elastic IP dedicada `32.192.61.156` en VPC `10.0.0.0/16`.
   - **Nginx Reverse Proxy:** Recibe tráfico HTTP en el puerto 80 desde CloudFront preservando cabeceras reales (`Host`, `X-Real-IP`, cookies, etc.).
   - **Microservicios Docker:**
     - `app-backend-1`: Node.js 20 + Express REST API (puerto 4000).
     - `app-ml-service-1`: FastAPI Python (puerto 8000) para motor de recomendación e IA.
     - `mexxicanmx_db_prod`: PostgreSQL 16 con extensión `pgvector` y 20 tablas de contrato relacional verificadas.
     - `app-redis-1`: Redis Cache 7 (Alpine) para sesiones rápidas y tokens de revocación.
4. **Almacenamiento Persistente (Amazon EBS gp3):**
   - Volumen independiente de **20 GB** montado en `/mnt/ebs/postgres` (persistencia de datos indeleble) y `/mnt/ebs/redis`.
5. **Seguridad y Notificaciones:**
   - **AWS Secrets Manager:** Almacén seguro `mexxicanmx/production/api` para variables de entorno de producción sin secretos en el código.
   - **Resend API:** Servicio de correos transaccionales, OTP y notificaciones de soporte.

---

## 📂 Estructura del Repositorio

```text
menus-qr-Negocios/
├── admin/                 # SPA React/TypeScript del Super Admin
├── frontend/              # SPA React/TypeScript para Comensales y Restaurantes
├── backend/               # API REST en Node.js/Express
├── ai-engine/             # Motor complementario de IA
├── ml-service/            # Microservicio FastAPI para recomendaciones
├── db/                    # Contratos de PostgreSQL y esquemas DDL
├── docs/                  # Documentación técnica, ADRs y diagramas
│   ├── adr/               # Architecture Decision Records (ADR-001)
│   ├── img/               # Diagramas de arquitectura (PNG)
│   ├── *.drawio           # Diagramas editables (Draw.io)
│   └── aws_architecture.py# Script de generación Diagrams as Code
├── scripts/               # Scripts de mantenimiento y despliegue
├── compose.yml            # Orquestación Docker para desarrollo local
├── compose.prod.yml       # Orquestación Docker para producción
└── README.md              # Documentación principal
```

---

## 🚀 Inicio Rápido (Desarrollo Local)

### Requisitos
- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/)

### Ejecución
```bash
# Clonar repositorio
git clone https://github.com/osbaldoXxC/menus-qr-Negocios.git
cd menus-qr-Negocios

# Variables de entorno base
cp .env.example .env

# Levantar servicios
docker compose up -d
```

Accesos locales:
* **Frontend:** `http://localhost:3000`
* **Admin:** `http://localhost:5173`
* **Backend API:** `http://localhost:4000`
* **ML Service:** `http://localhost:8000`
* **PostgreSQL:** `localhost:5432`

---

## 📄 Documentación Técnica Formal
Para consultar el registro formal de decisiones arquitectónicas y justificaciones técnicas de la infraestructura en la nube, revisa el [ADR-001: Despliegue en AWS con S3, CloudFront y EC2 Docker](docs/adr/0001-despliegue-aws-cloudfront-ec2-s3.md).
