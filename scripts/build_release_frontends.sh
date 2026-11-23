#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

for frontend in frontend admin; do
  npm --prefix "$frontend" ci
  npm --prefix "$frontend" run build
done
