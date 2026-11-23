#!/usr/bin/env bash
# Ejecuta en la EC2 (vía AWS SSM) la liberación de un bundle ya subido a S3.
# Variables requeridas: INSTANCE_ID, RELEASE_BUCKET. Opcional: AWS_REGION.
# Uso: bash ssm-remote-release.sh <sha>
set -euo pipefail

SHA="${1:?Uso: ssm-remote-release.sh <sha>}"
: "${INSTANCE_ID:?Falta INSTANCE_ID}"
: "${RELEASE_BUCKET:?Falta RELEASE_BUCKET}"
REGION="${AWS_REGION:-us-east-1}"
KEY="releases/backend_app-${SHA}.zip"

REMOTE_CMD="set -e; \
aws s3 cp s3://${RELEASE_BUCKET}/${KEY} /home/ubuntu/backend_app.zip --region ${REGION} && \
unzip -oq /home/ubuntu/backend_app.zip -d /home/ubuntu/app && \
cd /home/ubuntu/app && \
sudo docker compose -f compose.prod.yml up -d --build backend ml-service ai-engine && \
for i in \$(seq 1 24); do curl -fs --max-time 5 http://localhost:4000/health >/dev/null && echo SALUD_OK && exit 0; sleep 5; done; \
echo SALUD_FALLO; exit 1"

PARAMS_FILE="$(mktemp)"
trap 'rm -f "$PARAMS_FILE"' EXIT
python3 -c 'import json,sys; print(json.dumps({"commands":[sys.argv[1]]}))' "$REMOTE_CMD" > "$PARAMS_FILE"

echo "==> Enviando liberación ${SHA} a ${INSTANCE_ID}"
COMMAND_ID=$(aws ssm send-command \
  --region "$REGION" \
  --instance-ids "$INSTANCE_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters "file://${PARAMS_FILE}" \
  --timeout-seconds 900 \
  --query "Command.CommandId" --output text)
echo "Command ID: ${COMMAND_ID}"

# 'wait' devuelve error si el comando falla; se revisa el estado final a mano
aws ssm wait command-executed --region "$REGION" --command-id "$COMMAND_ID" --instance-id "$INSTANCE_ID" || true

STATUS=$(aws ssm get-command-invocation --region "$REGION" --command-id "$COMMAND_ID" \
  --instance-id "$INSTANCE_ID" --query "Status" --output text)
echo "Estado final: ${STATUS}"
aws ssm get-command-invocation --region "$REGION" --command-id "$COMMAND_ID" \
  --instance-id "$INSTANCE_ID" --query "StandardOutputContent" --output text | tail -n 20

[ "$STATUS" = "Success" ]
