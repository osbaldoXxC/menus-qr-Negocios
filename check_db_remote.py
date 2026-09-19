import subprocess
import json
import time

INSTANCE_ID = "i-02a33324a3adc168f"
REGION = "us-east-1"

def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding='utf-8', errors='ignore')
    return r.stdout.strip(), r.stderr.strip()

cmd_list = [
    "export PATH=$PATH:/usr/local/bin",
    "aws s3 cp s3://oamdevsol-cfn-templates-825765395825/check_db.sh /tmp/check_db.sh --region us-east-1",
    "bash /tmp/check_db.sh"
]
joined = " && ".join(cmd_list)

import subprocess as sp

proc = sp.run(
    ["aws", "ssm", "send-command",
     "--instance-ids", INSTANCE_ID,
     "--document-name", "AWS-RunShellScript",
     "--parameters", json.dumps({"commands": [joined]}),
     "--region", REGION],
    capture_output=True, text=True, encoding='utf-8', errors='ignore'
)
stdout = proc.stdout.strip()
stderr = proc.stderr.strip()
print("SEND:", stdout[:200] if stdout else stderr[:200])

data = json.loads(stdout)
command_id = data["Command"]["CommandId"]
print(f"Command ID: {command_id}")

# Poll for result
for _ in range(20):
    time.sleep(5)
    out, _ = run(f'aws ssm get-command-invocation --command-id "{command_id}" --instance-id "{INSTANCE_ID}" --region {REGION}')
    try:
        inv = json.loads(out)
        status = inv.get("Status", "")
        print(f"Status: {status}")
        if status in ["Success", "Failed", "Cancelled"]:
            print("=== STDOUT ===")
            print(inv.get("StandardOutputContent", ""))
            print("=== STDERR ===")
            print(inv.get("StandardErrorContent", ""))
            break
    except:
        pass
