import subprocess, json, time

INSTANCE = 'i-02a33324a3adc168f'
REGION = 'us-east-1'

sql = "ALTER TABLE restaurantes ADD COLUMN IF NOT EXISTS nombre_dueno VARCHAR(255) DEFAULT '';"

cmd_str = f"sudo docker exec mexxicanmx_db_prod psql -U admin_mexx -d mexxicanmx_db -c \"{sql}\""

proc = subprocess.run(
    ['aws', 'ssm', 'send-command',
     '--instance-ids', INSTANCE,
     '--document-name', 'AWS-RunShellScript',
     '--parameters', json.dumps({'commands': [cmd_str]}),
     '--region', REGION],
    capture_output=True, text=True, encoding='utf-8', errors='ignore'
)
print(proc.stderr[:300] if proc.returncode != 0 else '')
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
