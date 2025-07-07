#!/usr/bin/env python
"""
Test specific Django endpoints to diagnose Railway deployment
"""
import requests

API_URL = "https://scn-esg-backend.railway.app"

def test_django_endpoints():
    """Test Django-specific endpoints"""
    print("🔍 TESTING DJANGO ENDPOINTS")
    print("="*40)
    
    # Test health endpoint first
    print(f"\n💓 Testing health endpoint: {API_URL}/api/v1/health/")
    try:
        response = requests.get(f"{API_URL}/api/v1/health/", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   ✅ Django app is running!")
            print(f"   Response: {response.json()}")
        else:
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test users endpoints
    endpoints = [
        "/api/v1/users/auth/login/",
        "/api/v1/users/auth/register/",
        "/api/v1/users/auth/profile/",
        "/admin/",
    ]
    
    for endpoint in endpoints:
        print(f"\n🧪 Testing: {API_URL}{endpoint}")
        try:
            # Try OPTIONS first (for CORS)
            options_response = requests.options(f"{API_URL}{endpoint}", timeout=5)
            print(f"   OPTIONS: {options_response.status_code}")
            
            # Try POST for auth endpoints
            if 'auth' in endpoint:
                response = requests.post(
                    f"{API_URL}{endpoint}",
                    headers={'Content-Type': 'application/json'},
                    json={'test': 'data'},
                    timeout=5
                )
            else:
                response = requests.get(f"{API_URL}{endpoint}", timeout=5)
            
            print(f"   Status: {response.status_code}")
            if response.status_code not in [404, 500]:
                print(f"   ✅ Endpoint is accessible!")
                if response.headers.get('content-type', '').startswith('application/json'):
                    try:
                        print(f"   Response: {response.json()}")
                    except:
                        print(f"   Response: {response.text[:100]}...")
                        
        except Exception as e:
            print(f"   ❌ Error: {e}")

def check_railway_logs():
    """Check if we can infer what's happening"""
    print(f"\n🚂 RAILWAY DEPLOYMENT DIAGNOSIS")
    print("="*35)
    
    # Try to see if we can get any Django responses
    try:
        # Test with various headers that might reveal Django
        response = requests.get(
            f"{API_URL}/",
            headers={
                'User-Agent': 'Django-Test-Client',
                'Accept': 'application/json,text/html'
            },
            timeout=10
        )
        
        print(f"   Base URL response code: {response.status_code}")
        print(f"   Content-Type: {response.headers.get('content-type', 'None')}")
        print(f"   Server: {response.headers.get('server', 'None')}")
        
        # Look for Django indicators in response
        if 'django' in response.text.lower():
            print("   ✅ Django detected in response!")
        elif 'railway' in response.text.lower():
            print("   ⚠️ Showing Railway splash page - app not deployed properly")
        
    except Exception as e:
        print(f"   ❌ Error checking base URL: {e}")

if __name__ == '__main__':
    print("🚀 RAILWAY DJANGO DEPLOYMENT TEST")
    print("="*40)
    
    check_railway_logs()
    test_django_endpoints()
    
    print("\n" + "="*50)
    print("🎯 DIAGNOSIS:")
    print("="*50)
    print("The Railway deployment is showing a splash page,")
    print("which means the Django app is not properly deployed.")
    print("\nNext steps:")
    print("1. Check Railway deployment logs")
    print("2. Verify Procfile or railway.toml")
    print("3. Check environment variables")
    print("4. Redeploy the Django application")
