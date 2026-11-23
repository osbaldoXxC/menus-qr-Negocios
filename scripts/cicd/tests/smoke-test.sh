#!/usr/bin/env bash
# Pruebas de humo del backend de MexxicanMX en el entorno de liberación.
# Uso: bash scripts/cicd/tests/smoke-test.sh http://127.0.0.1:4000
set -uo pipefail

BASE_URL="${1:?Uso: smoke-test.sh <url-base>}"
BASE_URL="${BASE_URL%/}"
MAX_MS="${MAX_MS:-800}"
FAILS=0
PASSED=0

pass() { echo "OK    $1"; PASSED=$((PASSED + 1)); }
fail() { echo "FALLO $1"; FAILS=$((FAILS + 1)); }

status_of() { # método ruta [cuerpo-json]
  local method="$1" path="$2" body="${3:-}"
  if [ -n "$body" ]; then
    curl -s -o /dev/null -w '%{http_code}' --max-time 10 -X "$method" \
      -H 'Content-Type: application/json' -d "$body" "${BASE_URL}${path}" || echo 000
  else
    curl -s -o /dev/null -w '%{http_code}' --max-time 10 -X "$method" "${BASE_URL}${path}" || echo 000
  fi
}

# 1. /health responde 200 con estado UP y base de datos conectada
health_body=$(curl -s --max-time 10 "${BASE_URL}/health" || true)
if echo "$health_body" | grep -q '"status":"UP"' && echo "$health_body" | grep -q '"database":"connected"'; then
  pass "/health: servicio UP y base de datos conectada"
else
  fail "/health: respuesta inesperada -> ${health_body:-sin respuesta}"
fi

# 2. Ruta raíz de la API
code=$(status_of GET /)
[ "$code" = "200" ] && pass "GET / (200)" || fail "GET / devolvió ${code}, se esperaba 200"

# 3. Ruta protegida sin token debe rechazar (401)
code=$(status_of GET /api/menu/platillos)
[ "$code" = "401" ] && pass "GET /api/menu/platillos sin token (401)" || fail "GET /api/menu/platillos sin token devolvió ${code}, se esperaba 401"

# 4. Login con credenciales falsas: error de cliente, nunca error de servidor
code=$(status_of POST /api/auth/login '{"email":"no-existe@example.com","password":"incorrecta"}')
if [ "$code" -ge 400 ] 2>/dev/null && [ "$code" -lt 500 ]; then
  pass "POST /api/auth/login con credenciales falsas (${code})"
else
  fail "POST /api/auth/login con credenciales falsas devolvió ${code}, se esperaba 4xx"
fi

# 5. Ruta inexistente
code=$(status_of GET /api/no-existe)
[ "$code" = "404" ] && pass "Ruta inexistente (404)" || fail "Ruta inexistente devolvió ${code}, se esperaba 404"

# 6. Latencia de /health
secs=$(curl -s -o /dev/null -w '%{time_total}' --max-time 10 "${BASE_URL}/health" || echo 99)
ms=$(awk -v s="$secs" 'BEGIN { printf "%d", s * 1000 }')
if [ "$ms" -le "$MAX_MS" ]; then
  pass "Latencia de /health: ${ms} ms (límite ${MAX_MS} ms)"
else
  fail "Latencia de /health: ${ms} ms supera ${MAX_MS} ms"
fi

echo "---- Resultado: ${PASSED} correctas, ${FAILS} con fallo ----"
[ "$FAILS" -eq 0 ]
