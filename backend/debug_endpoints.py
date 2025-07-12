#!/usr/bin/env python3
"""
Debug the 404 issue with onboarding endpoint
"""

import requests

def debug_endpoints():
    """Debug what endpoints are available"""
    
    BASE_URL = "https://scn-esg-backend.onrender.com"
    
    print("🔍 ENDPOINT DEBUG")
    print("=" * 50)
    
    # Test various endpoint URLs
    endpoints_to_test = [
        "/api/v1/users/auth/complete-onboarding/",
        "/api/v1/users/complete-onboarding/", 
        "/api/v1/complete-onboarding/",
        "/complete-onboarding/",
        "/api/v1/users/auth/health/",  # Known working endpoint
    ]
    
    for endpoint in endpoints_to_test:
        print(f"\n📝 Testing: {endpoint}")
        try:
            response = requests.get(f"{BASE_URL}{endpoint}")
            print(f"   Status: {response.status_code}")
            if response.status_code != 404:
                print(f"   Response: {response.text[:200]}")
        except Exception as e:
            print(f"   Error: {e}")

    print("\n" + "=" * 50)
    print("🔍 DEBUG COMPLETE")

if __name__ == "__main__":
    debug_endpoints()
