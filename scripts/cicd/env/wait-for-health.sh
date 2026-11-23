#!/usr/bin/env bash
# Espera a que una URL responda 200 o agota el tiempo.
# Uso: bash wait-for-health.sh <url> [segundos]
set -uo pipefail

URL="${1:?Uso: wait-for-health.sh <url> [segundos]}"
TIMEOUT="${2:-120}"
START=$(date +%s)

while true; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$URL" || echo 000)
  if [ "$code" = "200" ]; then
    echo "OK: ${URL} respondió 200"
    exit 0
  fi
  if [ $(( $(date +%s) - START )) -ge "$TIMEOUT" ]; then
    echo "TIMEOUT: ${URL} no respondió 200 en ${TIMEOUT}s (último código: ${code})"
    exit 1
  fi
  sleep 3
done
