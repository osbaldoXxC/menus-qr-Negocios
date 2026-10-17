---
name: scope-guard
description: >-
  Delimitación estricta de alcance, prevención de cambios no solicitados, prohibición de migraciones arquitectónicas espontáneas y contención de modificaciones a los archivos mínimos requeridos por la tarea. Activar al iniciar cualquier implementación o refactorización.
---

# Scope Guard - MexxicanMX

Skill de protección de alcance y disciplina de ingeniería para asegurar que las intervenciones en MexxicanMX se mantengan estrictamente dentro de lo solicitado y aprobado.

## Procedencia y Licencia
- **Origen:** Adaptado de `grxkun/scope-guard`.
- **Licencia:** MIT.

## Principios de Contención

### 1. Declaración Previa de Archivos Afectados
- Antes de comenzar a editar, el agente debe listar explícitamente cuáles archivos serán creados o modificados.
- Si durante la implementación surge la necesidad de tocar un archivo fuera de la lista inicial, **el agente debe detenerse, explicar la razón al usuario y esperar autorización**.

### 2. Prohibición de Modificaciones Invasivas de Arquitectura
- Queda terminantemente prohibido proponer o implementar:
  - Migraciones a AWS ECS, ECR, Fargate o Kubernetes.
  - Reemplazo de PostgreSQL o Redis por otros motores.
  - Renombramiento de tablas de la base de datos o modelos de datos ya vigentes.
  - Reescribir módulos enteros bajo la premisa de "buenas prácticas" si no fue solicitado.

### 3. Delegación de Despliegue e Infraestructura
- Todo lo relativo a esquemas de BD (`PostgreSQL`/`pgvector`), variables de entorno, llaves y despliegue a AWS EC2/S3/CloudFront se delega exclusivamente a la skill oficial: `desplegando-mexxicanmx-aws`.

### 4. Checklist de Salida
- [ ] ¿El diff de Git contiene únicamente los cambios solicitados por el usuario?
- [ ] ¿Se mantuvieron intactas las pruebas y utilidades preexistentes?
- [ ] ¿Se evitó tocar archivos de configuración global o entornos ajenos?
