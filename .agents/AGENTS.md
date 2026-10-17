# Contexto del Proyecto: MexxicanMX

SaaS de menús digitales interactivos con QR para restaurantes.
Stack: React + Node.js (Express) + Python/FastAPI (ml-service con pgvector) + PostgreSQL 16 + Redis + AWS S3/CloudFront.
Producción: Instancia única AWS EC2 con Docker Compose (sin ECS/ECR/Fargate).
Seguridad base: Access token JWT (15 min) + Refresh token (7 días hasheado en BD), cookies HttpOnly/Secure, RBAC por middleware, soft-delete vía deleted_at.

## Sistema de Reglas y Skills (.agents/)
- **Gobernanza:** `rules/00-modularidad.md` a `rules/10-frontend-accesibilidad.md` (separación, auditoría, seguridad, git-flow, testing, calidad, caché, colas, scope, performance, accesibilidad).
- **Enrutamiento Automático:** `rules/11-skill-routing.md` mapea automáticamente cada solicitud del usuario a las skills especializadas en `.agents/skills/`.
- **Especialización por Skills:** `rules/12-playwright-e2e.md` a `rules/22-security-audit.md` regulan la activación de pruebas, calidad, caché, colas, scope, UI y seguridad.
