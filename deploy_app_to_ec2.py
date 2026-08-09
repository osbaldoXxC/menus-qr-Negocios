import os
import sys
import zipfile
import subprocess
import json
import time

def safe_print(msg=""):
    text = str(msg) + "\n"
    try:
        sys.stdout.buffer.write(text.encode('utf-8', errors='replace'))
        sys.stdout.buffer.flush()
    except Exception:
        try:
            print(text.encode('ascii', errors='replace').decode('ascii'))
        except Exception:
            pass

REGION = "us-east-1"

def run_cmd(cmd, quiet_error=False):
    safe_print(f"\n[RUNNING] {cmd}")
    res = subprocess.run(cmd, shell=True, text=True, capture_output=True, encoding='utf-8', errors='replace')
    if res.returncode != 0:
        if not quiet_error:
            safe_print(f"[ERROR] {res.stderr}")
        return False, res.stderr or res.stdout
    return True, res.stdout

def deploy_backend_to_ec2():
    safe_print("\n==========================================================================")
    safe_print(" [DEPLOY] PROCESANDO DESPLIEGUE DEL BACKEND Y BASE DE DATOS EN EC2")
    safe_print("==========================================================================")

    # 1. Obtener ID de la instancia EC2
    _, stdout = run_cmd('aws ec2 describe-instances --filters "Name=tag:Name,Values=oamdevsol-backend-api" "Name=instance-state-name,Values=running" --region us-east-1 --query "Reservations[0].Instances[0].InstanceId"')
    instance_id = stdout.strip().strip('"')
    safe_print(f"[OK] Instancia EC2 detectada: {instance_id}")

    # 2. Obtener Bucket de Staging
    _, account_stdout = run_cmd('aws sts get-caller-identity --query "Account" --output text')
    account_id = account_stdout.strip()
    staging_bucket = f"oamdevsol-cfn-templates-{account_id}"

    # 3. Empaquetar proyecto backend en zip
    zip_filename = "backend_app.zip"
    safe_print(f"[PACKAGING] Creando archivo comprimido {zip_filename}...")
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root_dir in ['backend', 'ai-engine']:
            if os.path.exists(root_dir):
                for base, _, files in os.walk(root_dir):
                    if 'node_modules' in base or '.git' in base or 'dist' in base:
                        continue
                    for f in files:
                        full_path = os.path.join(base, f)
                        zipf.write(full_path, full_path)
        for single_file in ['compose.prod.yml', '.env']:
            if os.path.exists(single_file):
                zipf.write(single_file, single_file)

    # 4. Subir zip y script a S3 Staging Bucket
    s3_path = f"s3://{staging_bucket}/backend_app.zip"
    safe_print(f"[S3 UPLOAD] Subiendo {zip_filename} a {s3_path}...")
    run_cmd(f'aws s3 cp {zip_filename} {s3_path} --region {REGION}')

    s3_script_path = f"s3://{staging_bucket}/deploy_remote.sh"
    safe_print(f"[S3 UPLOAD] Subiendo scripts/deploy_remote.sh a {s3_script_path}...")
    run_cmd(f'aws s3 cp scripts/deploy_remote.sh {s3_script_path} --region {REGION}')

    # 5. Enviar comando SSM a EC2 para descargar y ejecutar deploy_remote.sh
    safe_print("[SSM EXECUTE] Desplegando e iniciando contenedores Docker en EC2 via SSM...")
    remote_cmd = f'export PATH=$PATH:/usr/local/bin && aws s3 cp {s3_script_path} /tmp/deploy_remote.sh --region {REGION} && bash /tmp/deploy_remote.sh'
    send_cmd = f'aws ssm send-command --instance-ids "{instance_id}" --document-name "AWS-RunShellScript" --parameters commands="{remote_cmd}" --region {REGION}'
    
    ok, stdout = run_cmd(send_cmd)
    if not ok:
        safe_print("[ERROR] Error al enviar comando SSM")
        return

    cmd_data = json.loads(stdout)
    command_id = cmd_data['Command']['CommandId']
    safe_print(f"[WAITING] Esperando finalización del despliegue en EC2 (Command ID: {command_id})...")

    # Polling del estado del comando SSM
    while True:
        time.sleep(5)
        _, inv_stdout = run_cmd(f'aws ssm get-command-invocation --command-id "{command_id}" --instance-id "{instance_id}" --region {REGION}', quiet_error=True)
        try:
            inv_data = json.loads(inv_stdout)
            status = inv_data.get('Status')
            safe_print(f"   Estado SSM: {status}...")
            if status in ['Success', 'Failed', 'Cancelled', 'TimedOut']:
                safe_print(f"\n[SSM RESULT] ({status}):")
                safe_print(inv_data.get('StandardOutputContent', ''))
                if inv_data.get('StandardErrorContent'):
                    safe_print("[SSM STDERR]:")
                    safe_print(inv_data.get('StandardErrorContent'))
                break
        except Exception:
            pass

    if os.path.exists(zip_filename):
        os.remove(zip_filename)

if __name__ == '__main__':
    deploy_backend_to_ec2()
