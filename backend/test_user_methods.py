import os
import requests
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv(os.path.join(BASE_DIR, "..", ".env"))

url = os.getenv("INSFORGE_BASE_URL")
api_key = os.getenv("INSFORGE_API_KEY")
headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

r = requests.get(f"{url}/api/auth/users", headers=headers)
user = r.json()["data"][0]
uid = user["id"]
print("User id:", uid)

for method in ["PUT", "POST", "PATCH"]:
    res = requests.request(method, f"{url}/api/auth/users/{uid}", headers=headers, json={"emailVerified": True})
    print(method, f"/api/auth/users/{uid}", res.status_code)
