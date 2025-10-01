"""
Test the Render deployment to diagnose issues
"""

import requests
import json

BACKEND_URL = "https://scn-esg-backend.onrender.com"

def test_health():
    """Test health endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/api/v1/health/", timeout=30)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   ✅ Response: {response.json()}")
        else:
            print(f"   ❌ Response: {response.text[:200]}")
        return response.status_code == 200
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_cors():
    """Test CORS configuration"""
    print("\n🔍 Testing CORS headers...")
    try:
        headers = {
            'Origin': 'https://scn-esg.vercel.app',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type,authorization'
        }
        response = requests.options(
            f"{BACKEND_URL}/api/v1/users/auth/login/",
            headers=headers,
            timeout=30
        )
        print(f"   Status: {response.status_code}")
        print(f"   Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'NOT SET')}")
        print(f"   Access-Control-Allow-Methods: {response.headers.get('Access-Control-Allow-Methods', 'NOT SET')}")
        print(f"   Access-Control-Allow-Headers: {response.headers.get('Access-Control-Allow-Headers', 'NOT SET')}")
        
        if 'Access-Control-Allow-Origin' in response.headers:
            print(f"   ✅ CORS is configured")
            return True
        else:
            print(f"   ❌ CORS headers missing")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_registration():
    """Test registration endpoint"""
    print("\n🔍 Testing registration endpoint...")
    try:
        test_data = {
            "email": f"testuser{int(requests.get('http://worldtimeapi.org/api/timezone/Etc/UTC').json()['unixtime'])}@test.com",
            "password": "TestPass123!",
            "first_name": "Test",
            "last_name": "User",
            "company": "Test Company"
        }
        
        headers = {
            'Content-Type': 'application/json',
            'Origin': 'https://scn-esg.vercel.app'
        }
        
        response = requests.post(
            f"{BACKEND_URL}/api/v1/users/auth/register/",
            json=test_data,
            headers=headers,
            timeout=30
        )
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 201:
            print(f"   ✅ Registration successful")
            print(f"   Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print(f"   ❌ Registration failed")
            print(f"   Response: {response.text[:500]}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_login():
    """Test login with known credentials"""
    print("\n🔍 Testing login endpoint...")
    test_accounts = [
        {"email": "demo@scn.com", "password": "Demo1234!"},
        {"email": "test@scn.com", "password": "Test1234!"},
        {"email": "business@scn.com", "password": "Business123!"}
    ]
    
    for account in test_accounts:
        print(f"\n   Trying {account['email']}...")
        try:
            headers = {
                'Content-Type': 'application/json',
                'Origin': 'https://scn-esg.vercel.app'
            }
            
            response = requests.post(
                f"{BACKEND_URL}/api/v1/users/auth/login/",
                json=account,
                headers=headers,
                timeout=30
            )
            print(f"      Status: {response.status_code}")
            
            if response.status_code == 200:
                print(f"      ✅ Login successful")
                data = response.json()
                print(f"      Has access_token: {'access' in data}")
                print(f"      Has refresh_token: {'refresh' in data}")
                return True
            else:
                print(f"      ❌ Login failed: {response.text[:200]}")
        except Exception as e:
            print(f"      ❌ Error: {e}")
    
    return False

def main():
    print("=" * 70)
    print("🔧 SCN ESG RENDER DEPLOYMENT DIAGNOSTICS")
    print("=" * 70)
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 70)
    
    results = {
        'health': test_health(),
        'cors': test_cors(),
        'login': test_login(),
        'registration': test_registration()
    }
    
    print("\n" + "=" * 70)
    print("📊 RESULTS SUMMARY")
    print("=" * 70)
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   {test_name.upper()}: {status}")
    
    all_passed = all(results.values())
    print("=" * 70)
    if all_passed:
        print("✅ ALL TESTS PASSED - Backend is healthy!")
    else:
        print("❌ SOME TESTS FAILED - Check issues above")
        print("\n💡 RECOMMENDED ACTIONS:")
        if not results['health']:
            print("   1. Check if Render service is running")
            print("   2. Check Render deployment logs")
        if not results['cors']:
            print("   3. Verify DJANGO_CORS_ALLOWED_ORIGINS environment variable")
            print("      Should include: https://scn-esg.vercel.app")
        if not results['login']:
            print("   4. Run: python backend/create_render_users.py")
            print("      Or use Render shell to create users")
    print("=" * 70)

if __name__ == '__main__':
    main()
