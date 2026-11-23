#!/usr/bin/env bash
# Sube el bundle a S3, registra la versión actual/anterior y libera en la EC2.
# Variables requeridas: INSTANCE_ID, RELEASE_BUCKET. Opcional: AWS_REGION.
# Uso: bash scripts/cicd/deploy/ssm-deploy.sh <sha>
set -euo pipefail

SHA="${1:?Uso: ssm-deploy.sh <sha>}"
: "${RELEASE_BUCKET:?Falta RELEASE_BUCKET}"
REGION="${AWS_REGION:-us-east-1}"
HERE="$(cd "$(dirname "$0")" && pwd)"

bash "${HERE}/package-bundle.sh" "$SHA"

echo "==> Subiendo bundle a s3://${RELEASE_BUCKET}/releases/"
aws s3 cp "dist-release/backend_app-${SHA}.zip" \
  "s3://${RELEASE_BUCKET}/releases/backend_app-${SHA}.zip" --region "$REGION"

# Guardar la versión vigente como "anterior" antes de reemplazarla
CURRENT=$(aws s3 cp "s3://${RELEASE_BUCKET}/releases/CURRENT" - --region "$REGION" 2>/dev/null || true)
if [ -n "$CURRENT" ] && [ "$CURRENT" != "$SHA" ]; then
  printf '%s' "$CURRENT" | aws s3 cp - "s3://${RELEASE_BUCKET}/releases/PREVIOUS" --region "$REGION"
  echo "Versión anterior registrada: ${CURRENT}"
fi

bash "${HERE}/ssm-remote-release.sh" "$SHA"

printf '%s' "$SHA" | aws s3 cp - "s3://${RELEASE_BUCKET}/releases/CURRENT" --region "$REGION"
echo "Despliegue exitoso. Versión vigente: ${SHA}"
