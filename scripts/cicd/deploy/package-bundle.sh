#!/usr/bin/env bash
# Empaqueta el bundle del backend (mismo contenido que usa deploy.yml).
# Uso: bash scripts/cicd/deploy/package-bundle.sh <sha>
# Salida: dist-release/backend_app-<sha>.zip
set -euo pipefail

SHA="${1:?Uso: package-bundle.sh <sha>}"
OUT_DIR="dist-release"
OUT="${OUT_DIR}/backend_app-${SHA}.zip"

mkdir -p "$OUT_DIR"
rm -f "$OUT"

ITEMS=()
for item in backend ml-service ai-engine db scripts compose.prod.yml package.json; do
  if [ -e "$item" ]; then
    ITEMS+=("$item")
  else
    echo "AVISO: no existe ${item}, se omite del bundle"
  fi
done

zip -q -r "$OUT" "${ITEMS[@]}" \
  -x '*/node_modules/*' '*/.env' '*/.env.*' '*/logs/*'

echo "Bundle creado: ${OUT} ($(du -h "$OUT" | cut -f1))"
