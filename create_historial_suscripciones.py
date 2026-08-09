import subprocess, json, time

INSTANCE = 'i-02a33324a3adc168f'
REGION = 'us-east-1'

sql = """
CREATE TABLE IF NOT EXISTS historial_suscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurante_id UUID NOT NULL REFERENCES restaurantes(id) ON DELETE CASCADE,
    plan_anterior VARCHAR(50),
    plan_nuevo VARCHAR(50) NOT NULL,
    fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    razon VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
"""

cmd_str = f"sudo docker exec mexxicanmx_db_prod psql -U admin_mexx -d mexxicanmx_db -c \"{sql.replace(chr(10), ' ')}\""

proc = subprocess.run(
    ['aws', 'ssm', 'send-command',
     '--instance-ids', INSTANCE,
     '--document-name', 'AWS-RunShellScript',
     '--parameters', json.dumps({'commands': [cmd_str]}),
     '--region', REGION],
    capture_output=True, text=True, encoding='utf-8', errors='ignore'
)
print('SEND STDOUT:', proc.stdout[:200])
print('SEND STDERR:', proc.stderr[:200])
cmd_id = json.loads(proc.stdout)['Command']['CommandId']
print('CMD ID:', cmd_id)

time.sleep(8)
out = subprocess.run(
    ['aws', 'ssm', 'get-command-invocation',
     '--command-id', cmd_id,
     '--instance-id', INSTANCE,
     '--region', REGION],
    capture_output=True, text=True, encoding='utf-8', errors='ignore'
)
data = json.loads(out.stdout)
print('STATUS:', data.get('Status'))
print('STDOUT:', data.get('StandardOutputContent',''))
print('STDERR:', data.get('StandardErrorContent',''))
