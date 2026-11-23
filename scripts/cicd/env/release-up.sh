#!/usr/bin/env bash
# Genera el entorno de liberación: PostgreSQL (pgvector) + Redis + backend.
# Uso (desde la raíz del repo): bash scripts/cicd/env/release-up.sh
set -euo pipefail

PROJECT="${COMPOSE_PROJECT:-mexxican-release}"
COMPOSE_FILE="${COMPOSE_FILE:-compose.release.yml}"
TIMEOUT="${TIMEOUT:-180}"

command -v docker >/dev/null || { echo "Docker no está instalado"; exit 1; }
[ -f "$COMPOSE_FILE" ] || { echo "No existe ${COMPOSE_FILE}; ejecuta desde la raíz del repo"; exit 1; }

echo "==> Limpiando restos de ejecuciones anteriores"
docker compose -p "$PROJECT" -f "$COMPOSE_FILE" down -v --remove-orphans >/dev/null 2>&1 || true

echo "==> Construyendo y levantando el entorno (${PROJECT})"
docker compose -p "$PROJECT" -f "$COMPOSE_FILE" up -d --build

echo "==> Esperando a que el backend esté sano"
bash "$(dirname "$0")/wait-for-health.sh" http://127.0.0.1:4000/health "$TIMEOUT"

docker compose -p "$PROJECT" -f "$COMPOSE_FILE" ps
echo "Entorno de liberación listo en http://127.0.0.1:4000"
