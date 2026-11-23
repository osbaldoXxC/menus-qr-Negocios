#!/usr/bin/env bash
# Regresa la EC2 a la versión registrada como PREVIOUS en S3.
# Variables requeridas: INSTANCE_ID, RELEASE_BUCKET. Opcional: AWS_REGION.
set -euo pipefail

: "${RELEASE_BUCKET:?Falta RELEASE_BUCKET}"
REGION="${AWS_REGION:-us-east-1}"
HERE="$(cd "$(dirname "$0")" && pwd)"

PREVIOUS=$(aws s3 cp "s3://${RELEASE_BUCKET}/releases/PREVIOUS" - --region "$REGION" 2>/dev/null || true)
if [ -z "$PREVIOUS" ]; then
  echo "No hay versión anterior registrada; el retroceso requiere intervención manual"
  exit 1
fi

echo "==> Retrocediendo a ${PREVIOUS}"
bash "${HERE}/ssm-remote-release.sh" "$PREVIOUS"

printf '%s' "$PREVIOUS" | aws s3 cp - "s3://${RELEASE_BUCKET}/releases/CURRENT" --region "$REGION"
echo "Retroceso exitoso a ${PREVIOUS}"
