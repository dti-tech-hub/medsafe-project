import os
import requests
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv(os.path.join(BASE_DIR, "..", ".env"))

url = os.getenv("INSFORGE_BASE_URL")
api_key = os.getenv("INSFORGE_API_KEY")
headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

# First delete admin@medsafe.org to re-create with right field
# Let's check delete
r = requests.delete(f"{url}/api/auth/users/f1f63f53-2144-4d73-baac-ca85974d5968", headers=headers)
print("DELETE user:", r.status_code, r.text)
