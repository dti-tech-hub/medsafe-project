import os
import requests
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv(os.path.join(BASE_DIR, "..", ".env"))

url = os.getenv("INSFORGE_BASE_URL")
api_key = os.getenv("INSFORGE_API_KEY")
headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

for path in ["/api/auth/config", "/api/auth/settings", "/api/auth/public-config"]:
    for method in ["PATCH", "PUT", "POST"]:
        r = requests.request(method, f"{url}{path}", headers=headers, json={"requireEmailVerification": False})
        print(method, path, r.status_code)
