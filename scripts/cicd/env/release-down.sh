#!/usr/bin/env bash
# Destruye el entorno de liberación y sus datos temporales.
set -uo pipefail

PROJECT="${COMPOSE_PROJECT:-mexxican-release}"
COMPOSE_FILE="${COMPOSE_FILE:-compose.release.yml}"

docker compose -p "$PROJECT" -f "$COMPOSE_FILE" down -v --remove-orphans
echo "Entorno de liberación destruido"
