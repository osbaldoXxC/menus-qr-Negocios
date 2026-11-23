#!/usr/bin/env bash
# Valida la sintaxis de todos los archivos .js de un directorio (node --check).
# Uso: bash scripts/cicd/pipeline/check-syntax.sh backend/src
set -euo pipefail

DIR="${1:?Uso: check-syntax.sh <directorio>}"
FAILS=0
COUNT=0

# Se omiten archivos *_old.js (respaldos sin uso, uno está corrupto)
while IFS= read -r -d '' file; do
  COUNT=$((COUNT + 1))
  if ! node --check "$file" 2>/tmp/syntax-error.txt; then
    echo "ERROR de sintaxis en ${file}"
    cat /tmp/syntax-error.txt
    FAILS=$((FAILS + 1))
  fi
done < <(find "$DIR" -type f -name '*.js' -not -path '*/node_modules/*' -not -name '*_old.js' -print0)

echo "Archivos revisados: ${COUNT}, con error: ${FAILS}"
[ "$FAILS" -eq 0 ]
