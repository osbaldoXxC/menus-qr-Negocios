#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
node --check backend/src/index.js
python -m py_compile ml-service/main.py ai-engine/main.py
python scripts/validate_code_vs_schema.py --schema db/contract/schema.json --root .
python ml-service/test_recommendations.py
