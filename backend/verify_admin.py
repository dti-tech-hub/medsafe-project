import os
import requests
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv(os.path.join(BASE_DIR, "..", ".env"))

url = os.getenv("INSFORGE_BASE_URL")
key = os.getenv("INSFORGE_API_KEY")
headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json", "Accept": "application/json"}

sql = "UPDATE auth.users SET \"emailVerified\" = true WHERE email = 'admin@medsafe.org' RETURNING id, email, \"emailVerified\";"
# Try possible SQL endpoints
for ep in ["/api/database/sql", "/api/database/query"]:
    res = requests.post(f"{url}{ep}", headers=headers, json={"query": sql})
    print(ep, res.status_code, res.text)
