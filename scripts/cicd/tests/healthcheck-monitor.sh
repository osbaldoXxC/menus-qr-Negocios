#!/usr/bin/env bash
# Monitoreo de disponibilidad para la EC2: ejecutar cada minuto con cron.
#   * * * * * bash /home/ubuntu/app/scripts/cicd/tests/healthcheck-monitor.sh
# Registra cada resultado y alerta tras 2 fallos consecutivos.
set -uo pipefail

URL="${1:-http://localhost:4000/health}"
STATE_FILE="${STATE_FILE:-/tmp/mexxican-health-fails}"
LOG_FILE="${LOG_FILE:-/var/log/mexxican-health.log}"

code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$URL" || echo 000)
now=$(date -u +%FT%TZ)

if [ "$code" = "200" ]; then
  echo "${now} OK ${code}" >> "$LOG_FILE" 2>/dev/null || true
  echo 0 > "$STATE_FILE"
  exit 0
fi

fails=$(( $(cat "$STATE_FILE" 2>/dev/null || echo 0) + 1 ))
echo "$fails" > "$STATE_FILE"
echo "${now} FALLO ${code} (consecutivos: ${fails})" >> "$LOG_FILE" 2>/dev/null || true

if [ "$fails" -ge 2 ]; then
  echo "ALERTA: ${URL} no responde (${fails} fallos consecutivos)" >&2
  exit 2
fi
