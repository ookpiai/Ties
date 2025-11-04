"""
Simple test script to verify JWT token validation works
"""
import jwt
import requests
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# Get JWT secret from .env
JWT_SECRET = os.getenv('SUPABASE_JWT_SECRET')

# Create a test JWT token (mimicking what Supabase creates)
test_payload = {
    'sub': '12345678-1234-1234-1234-123456789012',  # Fake user ID
    'email': 'test@example.com',
    'role': 'authenticated',
    'iat': datetime.utcnow(),
    'exp': datetime.utcnow() + timedelta(hours=1)
}

# Sign the token with our JWT secret
test_token = jwt.encode(test_payload, JWT_SECRET, algorithm='HS256')

print("=" * 60)
print("JWT TOKEN VALIDATION TEST")
print("=" * 60)
print(f"\nGenerated test JWT token:")
print(f"{test_token[:50]}...{test_token[-50:]}\n")

# Test the backend endpoint
backend_url = "http://127.0.0.1:5001/api/auth/verify-token"
headers = {
    "Authorization": f"Bearer {test_token}",
    "Content-Type": "application/json"
}

print(f"Sending request to: {backend_url}")
print(f"Authorization header: Bearer {test_token[:20]}...\n")

try:
    response = requests.get(backend_url, headers=headers)

    print(f"Response Status Code: {response.status_code}")
    print(f"Response Body:")
    print(response.json())

    if response.status_code == 200:
        print("\n✅ SUCCESS! JWT validation is working correctly!")
        print("The backend can validate Supabase JWT tokens.")
    else:
        print(f"\n❌ FAILED! Expected 200, got {response.status_code}")

except requests.exceptions.ConnectionError:
    print("\n❌ ERROR: Could not connect to backend!")
    print("Make sure the Flask server is running on http://127.0.0.1:5001")
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")

print("\n" + "=" * 60)
