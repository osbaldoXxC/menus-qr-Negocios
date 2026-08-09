import os
import sys
import json
import subprocess
import time

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='backslashreplace')
        sys.stderr.reconfigure(encoding='utf-8', errors='backslashreplace')
    except Exception:
        pass

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
CFN_DIR = os.path.join(PROJECT_ROOT, 'cloudformation')
PARAMETERS_FILE = os.path.join(CFN_DIR, 'parameters.json')
MASTER_TEMPLATE = os.path.join(CFN_DIR, 'master.yaml')

STACK_NAME = "oamdevsol-stack"
REGION = os.getenv("AWS_REGION", "us-east-1")

def run_cmd(cmd, cwd=PROJECT_ROOT, check=True):
    print(f"\n🚀 [EJECUTANDO] {cmd}")
    res = subprocess.run(cmd, shell=True, cwd=cwd, text=True, capture_output=False)
    if check and res.returncode != 0:
        print(f"❌ Error al ejecutar comando: {cmd}")
        sys.exit(res.returncode)
    return res.returncode

def get_cmd_output(cmd, cwd=PROJECT_ROOT):
    res = subprocess.run(cmd, shell=True, cwd=cwd, text=True, capture_output=True)
    if res.returncode == 0:
        return res.stdout.strip()
    return ""

def main():
    print("==========================================================================")
    print("   DESPLIEGUE UNIFICADO MEXXICANMX / OAMDEVSOL (INFRAESTRUCTURA + CÓDIGO) ")
    print("==========================================================================")

    # 1. Verificar credenciales AWS
    print("\n🔍 1. Verificando credenciales de AWS CLI...")
    caller = get_cmd_output(f"aws sts get-caller-identity --region {REGION}")
    if not caller:
        print("❌ Error: No se detectaron credenciales configuradas de AWS CLI.")
        print("💡 Ejecuta 'aws configure' o define AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY.")
        sys.exit(1)
    print(f"✅ Credenciales AWS detectadas correctamente.")

    # 2. Cargar Parámetros
    print("\n📦 2. Cargando parámetros desde parameters.json...")
    if not os.path.exists(PARAMETERS_FILE):
        print(f"❌ No se encontró {PARAMETERS_FILE}")
        sys.exit(1)

    with open(PARAMETERS_FILE, 'r', encoding='utf-8') as f:
        params_list = json.load(f)

    param_overrides = []
    for item in params_list:
        k = item["ParameterKey"]
        v = item["ParameterValue"]
        if v:
            param_overrides.append(f'{k}="{v}"')

    override_str = " ".join(param_overrides)

    # 3. Empaquetar y Desplegar Infraestructura CloudFormation (Nested Stacks)
    account_id = get_cmd_output(f"aws sts get-caller-identity --query \"Account\" --output text --region {REGION}")
    staging_bucket = f"oamdevsol-cfn-templates-{account_id}"

    print(f"\n☁️ 3a. Asegurando Bucket de Staging para Plantillas CloudFormation (s3://{staging_bucket})...")
    get_cmd_output(f"aws s3 mb s3://{staging_bucket} --region {REGION}")

    # Verificar si el stack está en ROLLBACK_COMPLETE y eliminarlo automáticamente
    stack_status = get_cmd_output(f"aws cloudformation describe-stacks --stack-name {STACK_NAME} --query \"Stacks[0].StackStatus\" --output text --region {REGION}")
    if "ROLLBACK_COMPLETE" in stack_status:
        print(f"⚠️ El stack '{STACK_NAME}' está en estado ROLLBACK_COMPLETE. Eliminándolo para reiniciar despliegue...")
        run_cmd(f"aws cloudformation delete-stack --stack-name {STACK_NAME} --region {REGION}")
        run_cmd(f"aws cloudformation wait stack-delete-complete --stack-name {STACK_NAME} --region {REGION}")

    packaged_template = os.path.join(CFN_DIR, 'packaged-master.yaml')
    print(f"📦 3b. Empaquetando plantillas anidadas (aws cloudformation package)...")
    package_cmd = (
        f"aws cloudformation package "
        f"--template-file \"{MASTER_TEMPLATE}\" "
        f"--s3-bucket {staging_bucket} "
        f"--output-template-file \"{packaged_template}\" "
        f"--region {REGION}"
    )
    run_cmd(package_cmd)

    print(f"\n🌐 3c. Desplegando Master Stack '{STACK_NAME}' en AWS CloudFormation ({REGION})...")
    deploy_cmd = (
        f"aws cloudformation deploy "
        f"--template-file \"{packaged_template}\" "
        f"--stack-name {STACK_NAME} "
        f"--capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM "
        f"--region {REGION} "
        f"--parameter-overrides {override_str}"
    )
    run_cmd(deploy_cmd)
    print("✅ Infraestructura CloudFormation desplegada exitosamente.")

    # 4. Obtener Outputs del Stack
    print("\n📊 4. Recuperando outputs de la infraestructura...")
    outputs_json = get_cmd_output(
        f"aws cloudformation describe-stacks --stack-name {STACK_NAME} --region {REGION} --query \"Stacks[0].Outputs\""
    )
    
    outputs = {}
    if outputs_json:
        try:
            items = json.loads(outputs_json)
            for item in items:
                outputs[item["OutputKey"]] = item["OutputValue"]
        except Exception as e:
            print(f"⚠️ Error al parsear outputs: {e}")

    elastic_ip = outputs.get("BackendPublicIP", "Pendiente")
    admin_cdn = outputs.get("AdminCDN", "Pendiente")
    restaurant_cdn = outputs.get("RestaurantCDN", "Pendiente")
    assets_cdn = outputs.get("AssetsCDN", "Pendiente")

    # Nombres de Buckets según convenciones de CloudFormation
    bucket_prefix = next((item["ParameterValue"] for item in params_list if item["ParameterKey"] == "BucketPrefix"), "oamdevsol")
    admin_bucket = f"{bucket_prefix}-admin-{account_id}"
    restaurant_bucket = f"{bucket_prefix}-restaurant-{account_id}"
    images_bucket = f"{bucket_prefix}-assets-{account_id}"

    # 5. Compilar Frontends con Variables de Entorno de Producción
    print("\n🛠️ 5. Compilando aplicaciones Frontend (Admin y Restaurantes)...")
    
    api_url = f"https://api.oamdevsol.site"
    public_menu_url = f"https://mexxicanmx.oamdevsol.site/menu"

    build_env = f"set VITE_API_URL={api_url}&& set VITE_PUBLIC_MENU_URL={public_menu_url}&&" if sys.platform == "win32" else f"VITE_API_URL={api_url} VITE_PUBLIC_MENU_URL={public_menu_url}"

    # Compilar Admin
    print(f"  -> Compilando Admin Panel (admin) con VITE_API_URL={api_url}...")
    run_cmd("npm install", cwd=os.path.join(PROJECT_ROOT, "admin"))
    run_cmd(f"{build_env} npm run build", cwd=os.path.join(PROJECT_ROOT, "admin"))

    # Compilar Frontend Restaurantes
    print(f"  -> Compilando Panel Restaurantes (frontend) con VITE_API_URL={api_url}...")
    run_cmd("npm install", cwd=os.path.join(PROJECT_ROOT, "frontend"))
    run_cmd(f"{build_env} npm run build", cwd=os.path.join(PROJECT_ROOT, "frontend"))

    # 6. Sincronizar archivos a Buckets S3
    print("\n☁️ 6. Sincronizando estáticos con S3...")
    admin_dist = os.path.join(PROJECT_ROOT, "admin", "dist")
    frontend_dist = os.path.join(PROJECT_ROOT, "frontend", "dist")

    if os.path.exists(admin_dist):
        print(f"  -> Subiendo Admin a s3://{admin_bucket}/...")
        run_cmd(f"aws s3 sync \"{admin_dist}\" s3://{admin_bucket} --delete --region {REGION}")

    if os.path.exists(frontend_dist):
        print(f"  -> Subiendo Panel Restaurantes a s3://{restaurant_bucket}/...")
        run_cmd(f"aws s3 sync \"{frontend_dist}\" s3://{restaurant_bucket} --delete --region {REGION}")

    # 7. Despliegue de Contenedores Docker (PostgreSQL, Redis, Backend, AI Engine) en EC2
    try:
        from deploy_app_to_ec2 import deploy_backend_to_ec2
        deploy_backend_to_ec2()
    except Exception as e:
        print(f"⚠️ Error al desplegar contenedores en EC2: {e}")
    print("\n==========================================================================")
    print(" 🎉 DESPLIEGUE COMPLETADO EXITOSAMENTE")
    print("==========================================================================")
    print(f"📌 IP Pública EC2 Backend API: {elastic_ip}")
    print(f"📌 Bucket Admin S3:            s3://{admin_bucket}")
    print(f"📌 Bucket Restaurantes S3:     s3://{restaurant_bucket}")
    print(f"📌 Bucket Imágenes S3:         s3://{images_bucket}")
    print(f"📌 CloudFront Admin CDN:       https://{admin_cdn}")
    print(f"📌 CloudFront Restaurante CDN: https://{restaurant_cdn}")
    print(f"📌 CloudFront Imágenes CDN:    https://{assets_cdn}")
    print("--------------------------------------------------------------------------")
    print("🌐 CONFIGURACIÓN REQUERIDA EN HOSTINGER DNS (Zona: oamdevsol.site):")
    print("--------------------------------------------------------------------------")
    print(f" 1. Tipo: CNAME | Nombre: admin        | Valor: {admin_cdn}")
    print(f" 2. Tipo: CNAME | Nombre: mexxicanmx   | Valor: {restaurant_cdn}")
    print(f" 3. Tipo: CNAME | Nombre: images       | Valor: {assets_cdn}")
    print(f" 4. Tipo: A     | Nombre: api          | Valor: {elastic_ip}")
    print(f" 5. Tipo: A     | Nombre: monitor      | Valor: {elastic_ip}")
    print("==========================================================================\n")

if __name__ == "__main__":
    main()
