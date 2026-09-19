# MexxicanMX — Plataforma SaaS de Menús Digitales con QR

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![AWS](https://img.shields.io/badge/AWS-CloudFront%20%7C%20S3%20%7C%20EC2-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

---

## 📌 Descripción General

**MexxicanMX** es una solución SaaS integral diseñada para la digitalización y dinamización de menús en el sector gastronómico. Permite a los comensales explorar cartas interactivas mediante códigos QR inteligentes, mientras que los administradores y propietarios de restaurantes cuentan con herramientas en tiempo real para gestionar platillos, categorías, personalizaciones, suscripciones y analíticas.

---

## 🌐 Entornos en Producción

Toda la infraestructura opera bajo el dominio institucional **`oamdevsol.site`** con certificados SSL/TLS emitidos por AWS ACM:

| Servicio | URL Pública | Origen / Hosting | Propósito |
| :--- | :--- | :--- | :--- |
| **Frontend Clientes & Restaurantes** | [app.oamdevsol.site](https://app.oamdevsol.site) | AWS S3 + CloudFront | Menú público interactivo y dashboard de restaurantes |
| **Panel Super Admin** | [panel.oamdevsol.site](https://panel.oamdevsol.site) | AWS S3 + CloudFront | Gestión global de membresías, auditoría y control |
| **API REST Backend** | [backend.oamdevsol.site](https://backend.oamdevsol.site) | AWS EC2 (Docker) + CloudFront | Endpoints REST, autenticación JWT y lógica de negocio |
| **CDN de Imágenes** | [cdn.oamdevsol.site](https://cdn.oamdevsol.site) | AWS S3 + CloudFront | Almacenamiento y entrega de fotografías en alta fidelidad |

---

## 🏗️ Arquitectura del Sistema

La solución implementa una arquitectura desacoplada y de alta disponibilidad:

![Arquitectura AWS](docs/img/aws_architecture.png)

* **Edge / CDN:** **Amazon CloudFront** realiza la terminación SSL/TLS y almacena en caché los frontends estáticos en puntos de presencia globales (Edge Locations).
* **Frontends (SPA):** Compilados con **Vite + React + TypeScript** y alojados como sitios estáticos en **Amazon S3**.
* **Cómputo Backend:** Instancia **Amazon EC2 (t3.small)** ejecutando contenedores Docker coordinados mediante **Docker Compose**:
  * **Nginx Reverse Proxy:** Punto de entrada HTTP interno (puerto 80).
  * **API Service:** Node.js 20 con Express, Helmet, CORS y Rate Limiting.
  * **Motor IA / ML:** Servicios Python (`ai-engine` / `ml-service`) para recomendaciones.
* **Persistencia de Datos:** **PostgreSQL 16** con extensión `pgvector`, respaldado en un volumen desacoplado **Amazon EBS gp3 (20 GB)** montado en `/mnt/ebs/postgres`.

---

## 📂 Estructura del Repositorio

```text
menus-qr-Negocios/
├── admin/                 # SPA React/TypeScript del Super Admin
├── frontend/              # SPA React/TypeScript para Comensales y Restaurantes
├── backend/               # API REST en Node.js/Express
├── ai-engine/             # Microservicio de IA para procesamiento
├── ml-service/            # Servicio de Machine Learning y recomendaciones
├── db/                    # Contratos de base de datos y scripts de inicialización
├── docs/                  # Documentación formal, ADRs y diagramas de arquitectura
│   ├── adr/               # Registros de Decisiones de Arquitectura (ADR)
│   └── img/               # Diagramas e imágenes de arquitectura
├── scripts/               # Scripts automatizados de mantenimiento y despliegue
├── compose.yml            # Orquestación Docker para desarrollo local
├── compose.prod.yml       # Orquestación Docker para producción
└── README.md              # Documentación principal
```

---

## 🚀 Inicio Rápido (Desarrollo Local)

### Requisitos Previos
- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/)

### 1. Clonar el repositorio
```bash
git clone https://github.com/osbaldoXxC/menus-qr-Negocios.git
cd menus-qr-Negocios
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

### 3. Iniciar servicios con Docker Compose
```bash
docker compose up -d
```

Los servicios estarán accesibles localmente en:
* **Frontend:** `http://localhost:3000`
* **Admin:** `http://localhost:5173`
* **Backend API:** `http://localhost:4000`
* **PostgreSQL:** `localhost:5432`

---

## 🔒 Seguridad y Buenas Prácticas

- **Cero secretos en código:** Todas las credenciales sensibles se gestionan mediante variables de entorno e inyección desde **AWS Secrets Manager**.
- **Hardening HTTP:** Cabeceras estrictas vía `Helmet` (CSP, HSTS con precarga, X-Frame-Options: DENY).
- **Aislamiento de red:** La base de datos PostgreSQL y Redis residen en una red privada virtual de Docker (`private-net`), sin exposición a internet.
- **Protección Anti-Abuso:** Rate limiting diferenciado por tipo de servicio (autenticación estricta, menú público y panel de restaurante).

Para más detalles sobre las decisiones de diseño e infraestructura, consulta el [ADR-001: Arquitectura de Despliegue en AWS](docs/adr/0001-despliegue-aws-cloudfront-ec2-s3.md).

---

## 📄 Licencia y Derechos

Desarrollado para la plataforma **MexxicanMX** © 2026. Todos los derechos reservados.
