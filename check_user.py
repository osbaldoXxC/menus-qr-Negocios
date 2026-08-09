import subprocess
import json
import time

cmd = "sudo docker exec mexxicanmx_db_prod psql -U admin_mexx -d mexxicanmx_db -c \"SELECT email, rol, estado FROM restaurantes;\""

res = subprocess.run([
    "aws", "ssm", "send-command",
    "--instance-ids", "i-02a33324a3adc168f",
    "--document-name", "AWS-RunShellScript",
    "--parameters", f"commands=[{cmd!r}]",
    "--region", "us-east-1"
], capture_output=True, text=True)

data = json.loads(res.stdout)
cmd_id = data["Command"]["CommandId"]

time.sleep(3)

res_inv = subprocess.run([
    "aws", "ssm", "get-command-invocation",
    "--command-id", cmd_id,
    "--instance-id", "i-02a33324a3adc168f",
    "--region", "us-east-1"
], capture_output=True, text=True)

print("DATABASE CONTENT:", res_inv.stdout)
