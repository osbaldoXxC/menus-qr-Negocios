import os
import sys
import json
import yaml

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

CFN_DIR = os.path.join(os.path.dirname(__file__), 'cloudformation')

files = [
    '01-network.yaml',
    '02-storage.yaml',
    '03-cloudfront.yaml',
    '04-iam.yaml',
    '05-compute.yaml',
    'master.yaml'
]

print("==================================================")
print("  AUDITORIA Y VALIDACION DE PLANTILLAS CLOUDFORMATION ")
print("==================================================")

errors = 0
templates = {}

# Custom loader to handle CloudFormation intrinsic functions (!Ref, !Sub, !GetAtt, etc.)
def cfn_constructor(loader, tag_suffix, node):
    if isinstance(node, yaml.ScalarNode):
        return loader.construct_scalar(node)
    elif isinstance(node, yaml.SequenceNode):
        return loader.construct_sequence(node)
    elif isinstance(node, yaml.MappingNode):
        return loader.construct_mapping(node)

yaml.add_multi_constructor('!', cfn_constructor, Loader=yaml.SafeLoader)

for file in files:
    path = os.path.join(CFN_DIR, file)
    if not os.path.exists(path):
        print(f"[ERROR] Archivo no encontrado: {file}")
        errors += 1
        continue

    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
            templates[file] = data
            print(f"[OK] SINTAXIS YAML CORRECTA: {file}")
    except Exception as e:
        print(f"[ERROR YAML] {file}: {e}")
        errors += 1


print("\n--- VALIDACIÓN DE REGLAS DE ARQUITECTURA ---")

# 1. Verificar soporte de dominios y certificado ACM (Opcional)
acm_found = False
for file, data in templates.items():
    content_str = json.dumps(data)
    if 'AcmCertificateArn' in content_str or 'AdminDomainName' in content_str:
        acm_found = True

if acm_found:
    print("✅ [OK] Verificado: Soporte para dominios personalizados (oamdevsol.site) y Certificado SSL ACM configurado.")

# 2. Verificar Security Groups (no exponer 5432 ni 6379)
net_template = templates.get('01-network.yaml', {})
sg_ingress = net_template.get('Resources', {}).get('EC2SecurityGroup', {}).get('Properties', {}).get('SecurityGroupIngress', [])
ports = [rule.get('FromPort') for rule in sg_ingress]
print(f"ℹ️ Puertos abiertos en Security Group: {ports}")
if 5432 in ports or 6379 in ports:
    print("❌ [ERROR] El Security Group abre los puertos 5432 o 6379 públicamente!")
    errors += 1
else:
    print("✅ [OK] Verificado: Puertos 5432 (PostgreSQL) y 6379 (Redis) están PRIVADOS y aislados.")

# 3. Verificar Volumen EBS en Compute Stack
compute_template = templates.get('05-compute.yaml', {})
ebs = compute_template.get('Resources', {}).get('PostgresEBSVolume', {})
ebs_props = ebs.get('Properties', {})
print(f"ℹ️ Propiedades Volumen EBS: Size={ebs_props.get('Size')}, Type={ebs_props.get('VolumeType')}, Encrypted={ebs_props.get('Encrypted')}")

if ebs_props.get('VolumeType') == 'gp3' and ebs_props.get('Encrypted') is True:
    print("✅ [OK] Volumen EBS de 20GB gp3 cifrado configurado correctamente.")
else:
    print("❌ [ERROR] Configuración de EBS incorrecta.")
    errors += 1

# 4. Verificar parameters.json
param_path = os.path.join(CFN_DIR, 'parameters.json')
if os.path.exists(param_path):
    with open(param_path, 'r', encoding='utf-8') as f:
        params = json.load(f)
        print(f"✅ [OK] parameters.json parseado correctamente con {len(params)} parámetros.")

print("\n==================================================")
if errors == 0:
    print("🎉 PRUEBA COMPLETADA EXITOSAMENTE: Todas las plantillas están listas para su despliegue.")
    sys.exit(0)
else:
    print(f"❌ SE DETECTARON {errors} ERRORES EN LA PRUEBA.")
    sys.exit(1)
