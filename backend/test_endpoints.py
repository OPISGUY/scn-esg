#!/usr/bin/env python
"""
Test different API endpoint patterns to find the correct one
"""
import requests

API_URL = "https://scn-esg-backend.railway.app"

def test_different_endpoints():
    """Test various endpoint patterns"""
    print("🔍 TESTING DIFFERENT ENDPOINT PATTERNS")
    print("="*50)
    
    # Different possible endpoint patterns
    endpoints_to_test = [
        "/api/v1/users/auth/login/",
        "/api/auth/login/",
        "/auth/login/",
        "/users/auth/login/",
        "/login/",
        "/api/v1/auth/login/",
        "/api/login/",
    ]
    
    for endpoint in endpoints_to_test:
        print(f"\n🧪 Testing: {API_URL}{endpoint}")
        
        try:
            response = requests.post(
                f"{API_URL}{endpoint}",
                headers={'Content-Type': 'application/json'},
                json={'email': 'test@test.com', 'password': 'test'},
                timeout=5
            )
            
            print(f"   Status: {response.status_code}")
            if response.status_code != 404:
                print(f"   Response: {response.text[:100]}...")
                if response.status_code == 400:
                    print("   ✅ Found valid endpoint! (400 = validation error expected)")
                elif response.status_code == 401:
                    print("   ✅ Found valid endpoint! (401 = invalid credentials expected)")
                    
        except Exception as e:
            print(f"   Error: {e}")

def test_api_routes():
    """Test what routes are available"""
    print(f"\n🗺️ TESTING AVAILABLE ROUTES")
    print("="*30)
    
    routes_to_test = [
        "/",
        "/admin/",
        "/api/",
        "/api/v1/",
        "/api/v1/users/",
        "/docs/",
        "/swagger/",
    ]
    
    for route in routes_to_test:
        try:
            response = requests.get(f"{API_URL}{route}", timeout=5)
            print(f"   {route}: {response.status_code}")
            if response.status_code == 200 and len(response.text) > 50:
                print(f"     Content preview: {response.text[:100]}...")
        except Exception as e:
            print(f"   {route}: Error - {e}")

if __name__ == '__main__':
    test_api_routes()
    test_different_endpoints()
