import boto3
import time
import sys

ssm = boto3.client('ssm', region_name='us-east-1')
instance_id = 'i-02a33324a3adc168f'

print("Fetching docker logs from EC2 app-backend-1...")
res = ssm.send_command(
    InstanceIds=[instance_id],
    DocumentName='AWS-RunShellScript',
    Parameters={'commands': [
        'sudo docker logs --tail 50 app-backend-1'
    ]}
)

cmd_id = res['Command']['CommandId']
time.sleep(3)

out = ssm.get_command_invocation(CommandId=cmd_id, InstanceId=instance_id)
print("=== DOCKER LOGS OUTPUT ===")
print(out.get('StandardOutputContent', ''))
print("=== DOCKER LOGS ERRORS ===")
print(out.get('StandardErrorContent', ''))
