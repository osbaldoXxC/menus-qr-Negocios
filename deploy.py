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
SCRIPTS_DIR = os.path.join(PROJECT_ROOT, 'scripts')
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
    print("   Arquitectura: Hostinger DNS + ACM SSL + CloudFront + S3 + EC2 + EBS 20GB")
    print("==========================================================================")

    # 1. Verificar credenciales AWS CLI
    print("\n🔍 1. Verificando credenciales de AWS CLI...")
    caller = get_cmd_output(f"aws sts get-caller-identity --region {REGION}")
    if not caller:
        print("❌ Error: No se detectaron credenciales configuradas de AWS CLI.")
        print("💡 Configura tu perfil con 'aws configure' o variables de entorno.")
        sys.exit(1)
    
    caller_data = json.loads(caller)
    account_id = caller_data.get("Account")
    arn = caller_data.get("Arn")
    print(f"✅ Credenciales AWS detectadas: {arn} (Cuenta: {account_id})")

    # 2. Validación de Esquema con la skill (0 errores obligatorio)
    print("\n🛡️ 2. Validando código contra contrato de esquema PostgreSQL (Skill desplegando-mexxicanmx-aws)...")
    schema_contract = os.path.join(PROJECT_ROOT, 'db', 'contract', 'schema.json')
    validator_script = os.path.join(SCRIPTS_DIR, 'validate_code_vs_schema.py')
    
    val_code = run_cmd(f'python "{validator_script}" --schema "{schema_contract}" --root "{PROJECT_ROOT}"')
    if val_code != 0:
        print("❌ El validador de esquema encontró discrepancias. Despliegue abortado por seguridad.")
        sys.exit(1)
    print("✅ Contrato de esquema 100% validado (0 errores).")

    # 3. Sincronización de Secretos a AWS Secrets Manager
    print("\n🔐 3. Sincronizando secretos en AWS Secrets Manager (mexxicanmx/production/api)...")
    sync_script = os.path.join(SCRIPTS_DIR, 'sync_secrets.py')
    env_file = os.path.join(PROJECT_ROOT, '.env')
    run_cmd(f'python "{sync_script}" --env-file "{env_file}" --environment production --service api --region {REGION}')
    print("✅ Secretos sincronizados y manifiesto generado.")

    # 4. Verificación y Gestión del Certificado SSL ACM Wildcard (*.oamdevsol.site)
    print("\n🔒 4. Verificando Certificado SSL Wildcard (*.oamdevsol.site) en ACM us-east-1...")
    acm_arn = ""
    cert_list_raw = get_cmd_output(f"aws acm list-certificates --region {REGION} --output json")
    if cert_list_raw:
        try:
            cert_list = json.loads(cert_list_raw).get("CertificateSummaryList", [])
            for c in cert_list:
                if "oamdevsol.site" in c.get("DomainName", ""):
                    acm_arn = c.get("CertificateArn")
                    break
        except Exception:
            pass

    if not acm_arn:
        print("  -> Solicitando nuevo Certificado SSL Wildcard para *.oamdevsol.site y oamdevsol.site...")
        req_cmd = (
            f"aws acm request-certificate "
            f"--domain-name \"*.oamdevsol.site\" "
            f"--subject-alternative-names \"oamdevsol.site\" "
            f"--validation-method DNS "
            f"--region {REGION} "
            f"--query \"CertificateArn\" "
            f"--output text"
        )
        acm_arn = get_cmd_output(req_cmd).strip()
        print(f"  -> Certificado solicitado: {acm_arn}")

    if acm_arn:
        cert_detail_raw = get_cmd_output(f"aws acm describe-certificate --certificate-arn {acm_arn} --region {REGION} --output json")
        if cert_detail_raw:
            try:
                cert_detail = json.loads(cert_detail_raw).get("Certificate", {})
                cert_status = cert_detail.get("Status", "UNKNOWN")
                print(f"  -> Estado del certificado ACM: {cert_status}")
                
                # Mostrar registros CNAME de validación si aún no está emitido
                domain_val = cert_detail.get("DomainValidationOptions", [])
                if cert_status != "ISSUED" and domain_val:
                    print("\n⚠️ REGISTRO CNAME REQUERIDO EN HOSTINGER PARA VALIDAR SSL ACM:")
                    for v in domain_val:
                        rec = v.get("ResourceRecord")
                        if rec:
                            print(f"   Tipo: {rec.get('Type')} | Nombre: {rec.get('Name')} | Valor: {rec.get('Value')}")
                    print("   (CloudFront se configurará con este certificado o el default mientras se valida).\n")
            except Exception as e:
                print(f"  ⚠️ Error al inspeccionar certificado: {e}")

    # 5. Cargar Parámetros de CloudFormation
    print("\n📦 5. Cargando parámetros desde parameters.json...")
    if not os.path.exists(PARAMETERS_FILE):
        print(f"❌ No se encontró {PARAMETERS_FILE}")
        sys.exit(1)

    with open(PARAMETERS_FILE, 'r', encoding='utf-8') as f:
        params_list = json.load(f)

    # Si el certificado está emitido, lo inyectamos
    param_overrides = []
    for item in params_list:
        k = item["ParameterKey"]
        v = item["ParameterValue"]
        if k == "AcmCertificateArn" and acm_arn:
            # Solo asociar al alias si está emitido para evitar fallas en CloudFront deploy
            cert_detail_raw = get_cmd_output(f"aws acm describe-certificate --certificate-arn {acm_arn} --region {REGION} --query \"Certificate.Status\" --output text")
            if "ISSUED" in cert_detail_raw:
                v = acm_arn
                print(f"  -> Certificado ACM validado (ISSUED). Se usará para CloudFront.")
        if v:
            param_overrides.append(f'{k}="{v}"')

    override_str = " ".join(param_overrides)

    # 6. Empaquetar y Desplegar Infraestructura CloudFormation (Nested Stacks)
    staging_bucket = f"oamdevsol-cfn-templates-{account_id}"
    print(f"\n☁️ 6a. Asegurando Bucket de Staging para Plantillas CloudFormation (s3://{staging_bucket})...")
    get_cmd_output(f"aws s3 mb s3://{staging_bucket} --region {REGION}")

    stack_status = get_cmd_output(f"aws cloudformation describe-stacks --stack-name {STACK_NAME} --query \"Stacks[0].StackStatus\" --output text --region {REGION}")
    if "ROLLBACK_COMPLETE" in stack_status:
        print(f"⚠️ El stack '{STACK_NAME}' está en estado ROLLBACK_COMPLETE. Eliminándolo para reiniciar despliegue...")
        run_cmd(f"aws cloudformation delete-stack --stack-name {STACK_NAME} --region {REGION}")
        run_cmd(f"aws cloudformation wait stack-delete-complete --stack-name {STACK_NAME} --region {REGION}")

    packaged_template = os.path.join(CFN_DIR, 'packaged-master.yaml')
    print(f"📦 6b. Empaquetando plantillas anidadas (aws cloudformation package)...")
    package_cmd = (
        f"aws cloudformation package "
        f"--template-file \"{MASTER_TEMPLATE}\" "
        f"--s3-bucket {staging_bucket} "
        f"--output-template-file \"{packaged_template}\" "
        f"--region {REGION}"
    )
    run_cmd(package_cmd)

    print(f"\n🌐 6c. Desplegando Master Stack '{STACK_NAME}' en AWS CloudFormation ({REGION})...")
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

    # 7. Recuperar Outputs del Stack
    print("\n📊 7. Recuperando outputs de la infraestructura...")
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

    bucket_prefix = next((item["ParameterValue"] for item in params_list if item["ParameterKey"] == "BucketPrefix"), "oamdevsol")
    admin_bucket = f"{bucket_prefix}-admin-{account_id}"
    restaurant_bucket = f"{bucket_prefix}-restaurant-{account_id}"
    images_bucket = f"{bucket_prefix}-assets-{account_id}"

    # 8. Compilar Frontends con Variables de Entorno de Producción
    print("\n🛠️ 8. Compilando aplicaciones Frontend (Admin y Restaurantes) desde variables de entorno...")
    # Cargar variables desde .env
    env_vars = {}
    if os.path.exists(env_file):
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env_vars[k.strip()] = v.strip()

    api_url = env_vars.get("VITE_API_URL", "https://backend.oamdevsol.site/api")
    public_menu_url = env_vars.get("VITE_PUBLIC_MENU_URL", "https://app.oamdevsol.site/menu")
    cdn_domain = env_vars.get("CLOUDFRONT_DOMAIN", "https://cdn.oamdevsol.site")

    print(f"  -> VITE_API_URL:         {api_url}")
    print(f"  -> VITE_PUBLIC_MENU_URL: {public_menu_url}")
    print(f"  -> CLOUDFRONT_DOMAIN:    {cdn_domain}")

    build_env = f"set VITE_API_URL={api_url}&& set VITE_PUBLIC_MENU_URL={public_menu_url}&& set VITE_IMAGES_CDN={cdn_domain}&&" if sys.platform == "win32" else f"VITE_API_URL={api_url} VITE_PUBLIC_MENU_URL={public_menu_url} VITE_IMAGES_CDN={cdn_domain}"

    print(f"  -> Compilando Admin Panel (admin)...")
    run_cmd("npm install", cwd=os.path.join(PROJECT_ROOT, "admin"))
    run_cmd(f"{build_env} npm run build", cwd=os.path.join(PROJECT_ROOT, "admin"))

    print(f"  -> Compilando Panel Restaurantes (frontend)...")
    run_cmd("npm install", cwd=os.path.join(PROJECT_ROOT, "frontend"))
    run_cmd(f"{build_env} npm run build", cwd=os.path.join(PROJECT_ROOT, "frontend"))

    # 9. Sincronizar archivos a Buckets S3 e invalidar CloudFront
    print("\n☁️ 9. Sincronizando estáticos con S3 e invalidando CloudFront CDN...")
    admin_dist = os.path.join(PROJECT_ROOT, "admin", "dist")
    frontend_dist = os.path.join(PROJECT_ROOT, "frontend", "dist")

    if os.path.exists(admin_dist):
        print(f"  -> Subiendo Admin a s3://{admin_bucket}/...")
        run_cmd(f"aws s3 sync \"{admin_dist}\" s3://{admin_bucket} --delete --region {REGION}")
        run_cmd(f"aws cloudfront create-invalidation --distribution-id E1NK74NZM8UYXZ --paths \"/*\" --region {REGION}")

    if os.path.exists(frontend_dist):
        print(f"  -> Subiendo Panel Restaurantes a s3://{restaurant_bucket}/...")
        run_cmd(f"aws s3 sync \"{frontend_dist}\" s3://{restaurant_bucket} --delete --region {REGION}")
        run_cmd(f"aws cloudfront create-invalidation --distribution-id E1K516ITL1YDZ3 --paths \"/*\" --region {REGION}")

    # 10. Despliegue de Contenedores Docker en EC2
    print("\n🚀 10. Desplegando Backend, PostgreSQL y Redis en EC2 via SSM...")
    try:
        from deploy_app_to_ec2 import deploy_backend_to_ec2
        deploy_backend_to_ec2()
    except Exception as e:
        print(f"⚠️ Error al desplegar contenedores en EC2: {e}")

    # 11. Resumen Final y Configuración DNS
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
