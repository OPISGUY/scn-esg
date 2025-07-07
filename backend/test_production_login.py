#!/usr/bin/env python
"""
Test login API directly to verify it's working
"""
import requests
import json

# Test the API with the test credentials we created
API_URL = "https://scn-esg-production.up.railway.app"  # Correct Railway URL

def test_login_api():
    """Test the login API endpoint directly"""
    print("🔍 TESTING LOGIN API DIRECTLY")
    print("="*50)
    
    # Test credentials from our debug script
    test_users = [
        {
            'email': 'admin@test.com',
            'password': 'TestAdmin123!'
        },
        {
            'email': 'user@test.com',
            'password': 'TestUser123!'
        }
    ]
    
    # Test both possible endpoints
    endpoints = [
        "/api/v1/auth/login/",  # JWT endpoint
        "/api/v1/users/auth/login/"  # Custom auth endpoint
    ]
    
    for endpoint in endpoints:
        print(f"\n🔗 Testing endpoint: {endpoint}")
        
        for user in test_users:
            print(f"\n🧪 Testing login for: {user['email']}")
            
            try:
                response = requests.post(
                    f"{API_URL}{endpoint}",
                    headers={
                        'Content-Type': 'application/json',
                    },
                    json={
                        'email': user['email'],
                        'password': user['password']
                    },
                    timeout=10
                )
                
                print(f"   Status Code: {response.status_code}")
                print(f"   Response Headers: {dict(response.headers)}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"   ✅ Login successful!")
                    print(f"   User: {data.get('user', {}).get('email', 'Unknown')}")
                    print(f"   Access token received: {'access' in data}")
                    print(f"   Response data: {data}")
                else:
                    print(f"   ❌ Login failed")
                    try:
                        error_data = response.json()
                        print(f"   Error: {error_data}")
                    except:
                        print(f"   Raw response: {response.text}")
                        
            except requests.exceptions.RequestException as e:
                print(f"   ❌ Network error: {e}")
            except Exception as e:
                print(f"   ❌ Unexpected error: {e}")

def test_cors_preflight():
    """Test CORS preflight request"""
    print(f"\n🌐 TESTING CORS PREFLIGHT")
    print("="*30)
    
    try:
        response = requests.options(
            f"{API_URL}/api/v1/users/auth/login/",
            headers={
                'Origin': 'https://scn-esg-platform-fhyfe3og6-opisguys-projects.vercel.app',  # Your actual Vercel deployment URL
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            },
            timeout=10
        )
        
        print(f"   Status Code: {response.status_code}")
        print(f"   CORS Headers:")
        cors_headers = {k: v for k, v in response.headers.items() if 'access-control' in k.lower()}
        for header, value in cors_headers.items():
            print(f"     {header}: {value}")
            
    except Exception as e:
        print(f"   ❌ CORS test failed: {e}")

def test_api_health():
    """Test if the API is accessible"""
    print(f"\n💓 TESTING API HEALTH")
    print("="*25)
    
    try:
        response = requests.get(f"{API_URL}/", timeout=10)
        print(f"   Root URL Status Code: {response.status_code}")
        print(f"   Root Response: {response.text[:200]}...")
        
        # Test health endpoint
        health_response = requests.get(f"{API_URL}/api/v1/health/", timeout=10)
        print(f"   Health endpoint Status Code: {health_response.status_code}")
        if health_response.status_code == 200:
            print(f"   Health Response: {health_response.json()}")
        
        # Test various other endpoints to see what's available
        test_endpoints = [
            "/api/v1/",
            "/api/",
            "/admin/",
            "/api/v1/auth/",
            "/api/v1/users/"
        ]
        
        print(f"\n   Testing various endpoints:")
        for endpoint in test_endpoints:
            try:
                resp = requests.get(f"{API_URL}{endpoint}", timeout=5)
                print(f"     {endpoint}: {resp.status_code}")
            except:
                print(f"     {endpoint}: ERROR")
                
    except Exception as e:
        print(f"   ❌ Health check failed: {e}")

if __name__ == '__main__':
    print("🚀 SCN ESG PLATFORM - API LOGIN TEST")
    print("="*50)
    
    test_api_health()
    test_cors_preflight()
    test_login_api()
    
    print("\n" + "="*50)
    print("🎯 DEBUGGING RECOMMENDATIONS:")
    print("="*50)
    print("1. Check if Railway app is running")
    print("2. Verify CORS settings in Django")
    print("3. Check Vercel environment variables")
    print("4. Test login from browser dev tools")
    print("5. Check network requests in browser")
