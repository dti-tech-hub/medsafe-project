import os
import requests
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv(os.path.join(BASE_DIR, "..", ".env"))

url = os.getenv("INSFORGE_BASE_URL")
anon_key = os.getenv("INSFORGE_ANON_KEY")
api_key = os.getenv("INSFORGE_API_KEY")

# Send verification
r1 = requests.post(
    f"{url}/api/auth/email/send-verification",
    headers={"Authorization": f"Bearer {anon_key}", "Content-Type": "application/json"},
    json={"email": "admin@medsafe.org"}
)
print("send-verification:", r1.status_code, r1.text)
