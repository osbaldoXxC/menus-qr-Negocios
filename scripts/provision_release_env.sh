#!/bin/bash
# ==============================================================================
# Script de Generación del Entorno de Liberación y Despliegue (AWS CloudFormation + OIDC)
# Caso de Estudio: MexxicanMX (oamdevsol.site)
# ==============================================================================
set -e

ENVIRONMENT_NAME="${1:-oamdevsol}"
AWS_REGION="${AWS_REGION:-us-east-1}"
STACK_NAME="${ENVIRONMENT_NAME}-master-stack"

echo "=========================================================================="
echo " [1/4] VERIFICANDO CREDENCIALES AWS Y HERRAMIENTAS DE LIBERACIÓN"
echo "=========================================================================="
aws --version
ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
echo "✅ Cuenta AWS detectada: ${ACCOUNT_ID} | Región: ${AWS_REGION}"

CFN_BUCKET="${ENVIRONMENT_NAME}-cfn-templates-${ACCOUNT_ID}"

echo "=========================================================================="
echo " [2/4] CREANDO BUCKET S3 DE ARTEFACTOS DE LIBERACIÓN (${CFN_BUCKET})"
echo "=========================================================================="
if ! aws s3api head-bucket --bucket "${CFN_BUCKET}" 2>/dev/null; then
  aws s3 mb "s3://${CFN_BUCKET}" --region "${AWS_REGION}"
  aws s3api put-bucket-versioning \
    --bucket "${CFN_BUCKET}" \
    --versioning-configuration Status=Enabled
  echo "✅ Bucket de plantillas y artefactos creado con versionamiento activo."
else
  echo "ℹ️ El bucket ${CFN_BUCKET} ya existe."
fi

echo "=========================================================================="
echo " [3/4] EMPAQUETANDO Y VALIDANDO PLANTILLAS DE INFRAESTRUCTURA (IaC)"
echo "=========================================================================="
for template in cloudformation/*.yaml; do
  echo "Validando sintaxis de ${template}..."
  aws cloudformation validate-template --template-body "file://${template}" > /dev/null
done

aws cloudformation package \
  --template-file cloudformation/master.yaml \
  --s3-bucket "${CFN_BUCKET}" \
  --output-template-file cloudformation/packaged-master.yaml \
  --region "${AWS_REGION}"

echo "=========================================================================="
echo " [4/4] APROVISIONANDO ENTORNO DE LIBERACIÓN EN AWS CLOUDFORMATION"
echo "=========================================================================="
aws cloudformation deploy \
  --template-file cloudformation/packaged-master.yaml \
  --stack-name "${STACK_NAME}" \
  --parameter-overrides file://cloudformation/parameters.json \
  --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
  --region "${AWS_REGION}"

echo "✅ Entorno de liberación y despliegue aprovisionado exitosamente."
aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --query "Stacks[0].Outputs" \
  --output table
