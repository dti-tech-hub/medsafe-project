import os
import requests
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv(os.path.join(BASE_DIR, "..", ".env"))

INSFORGE_BASE_URL = os.getenv("INSFORGE_BASE_URL", "").rstrip("/")
INSFORGE_API_KEY = os.getenv("INSFORGE_API_KEY", "")
INSFORGE_ANON_KEY = os.getenv("INSFORGE_ANON_KEY", "")

def create_admin():
    email = "admin@medsafe.org"
    password = "Admin@1234"

    print(f"Creating user {email} via InsForge auth API...")
    
    # Try admin API first
    headers = {
        "Authorization": f"Bearer {INSFORGE_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    
    # Check if user already exists
    res = requests.get(f"{INSFORGE_BASE_URL}/api/auth/users", headers=headers, timeout=20)
    if res.ok:
        users = res.json().get("data", []) if isinstance(res.json(), dict) else res.json()
        for u in users:
            if u.get("email", "").lower() == email.lower():
                print(f"User {email} already exists (id={u.get('id')}).")
                return

    # Create via admin endpoint
    res = requests.post(
        f"{INSFORGE_BASE_URL}/api/auth/users",
        headers=headers,
        json={"email": email, "password": password, "emailVerified": True},
        timeout=20,
    )
    if res.ok:
        print("Admin user created successfully via Admin API:", res.json())
        return

    # If admin endpoint differs, try signup endpoint
    print(f"Admin API returned {res.status_code}, trying signup...")
    signup_headers = {
        "Authorization": f"Bearer {INSFORGE_ANON_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    res = requests.post(
        f"{INSFORGE_BASE_URL}/api/auth/signup",
        headers=signup_headers,
        json={"email": email, "password": password},
        timeout=20,
    )
    if res.ok:
        print("Admin user created successfully via Signup API:", res.json())
    else:
        print("Signup failed:", res.status_code, res.text)

if __name__ == "__main__":
    create_admin()
