#!/usr/bin/env python
"""
Comprehensive authentication test for Render backend
Tests the exact credentials from create_test_users.py
"""
import requests
import json
import time

# CORRECT Render URL (not Railway!)
RENDER_URL = "https://scn-esg-backend.onrender.com"

# Test credentials from create_test_users.py
TEST_CREDENTIALS = [
    {
        'email': 'admin@scn.com',
        'password': 'admin123',
        'name': 'Admin User'
    },
    {
        'email': 'test@scn.com', 
        'password': 'test123',
        'name': 'Test User'
    },
    {
        'email': 'business@scn.com',
        'password': 'business123', 
        'name': 'Business User'
    }
]

def test_backend_health():
    """Test if Render backend is up and running"""
    print("🏥 TESTING RENDER BACKEND HEALTH")
    print("="*60)
    
    endpoints_to_test = [
        "/",
        "/api/v1/health/",
        "/admin/",
        "/api/v1/users/auth/health/"
    ]
    
    backend_healthy = False
    
    for endpoint in endpoints_to_test:
        try:
            print(f"\n🔗 Testing: {RENDER_URL}{endpoint}")
            response = requests.get(f"{RENDER_URL}{endpoint}", timeout=15)
            
            if response.status_code in [200, 301, 302, 405]:
                print(f"   ✅ Status: {response.status_code}")
                backend_healthy = True
                if response.headers.get('content-type', '').startswith('application/json'):
                    try:
                        data = response.json()
                        print(f"   📝 Response: {json.dumps(data, indent=2)}")
                    except:
                        pass
            else:
                print(f"   ⚠️  Status: {response.status_code}")
                
        except requests.exceptions.Timeout:
            print(f"   ❌ TIMEOUT - Backend may be sleeping")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    return backend_healthy

def wake_up_render_backend():
    """Wake up Render backend if it's sleeping"""
    print("\n🔄 WAKING UP RENDER BACKEND...")
    print("="*60)
    
    try:
        # Hit the health endpoint to wake it up
        print("Pinging backend to wake up...")
        response = requests.get(f"{RENDER_URL}/api/v1/health/", timeout=60)
        print(f"Wake-up response: {response.status_code}")
        
        # Wait a bit for the backend to fully start
        print("Waiting for backend to fully initialize...")
        time.sleep(10)
        
        return True
    except Exception as e:
        print(f"Failed to wake up backend: {e}")
        return False

def test_authentication_endpoints():
    """Test all authentication endpoints with correct credentials"""
    print("\n🔐 TESTING AUTHENTICATION ENDPOINTS")
    print("="*60)
    
    # Test different login endpoints
    login_endpoints = [
        "/api/v1/users/auth/login/",  # Custom auth endpoint
        "/api/v1/auth/login/",        # JWT endpoint
    ]
    
    successful_login = False
    
    for endpoint in login_endpoints:
        print(f"\n🧪 Testing endpoint: {endpoint}")
        
        for creds in TEST_CREDENTIALS:
            print(f"\n👤 Testing login: {creds['name']} ({creds['email']})")
            
            try:
                response = requests.post(
                    f"{RENDER_URL}{endpoint}",
                    headers={'Content-Type': 'application/json'},
                    json={
                        'email': creds['email'],
                        'password': creds['password']
                    },
                    timeout=30
                )
                
                print(f"   📨 Status: {response.status_code}")
                
                if response.status_code == 200:
                    print("   ✅ LOGIN SUCCESSFUL!")
                    try:
                        data = response.json()
                        print(f"   🎯 Has access token: {'access' in data}")
                        print(f"   🎯 Has user data: {'user' in data}")
                        print(f"   📝 Response: {json.dumps(data, indent=2)}")
                        successful_login = True
                        return True, endpoint, creds, data
                    except:
                        print(f"   📝 Response: {response.text}")
                        
                elif response.status_code == 401:
                    print("   ❌ Invalid credentials")
                    try:
                        error_data = response.json()
                        print(f"   📝 Error: {error_data}")
                    except:
                        print(f"   📝 Error: {response.text}")
                        
                elif response.status_code == 404:
                    print("   ❌ Endpoint not found")
                    
                elif response.status_code == 500:
                    print("   ❌ Server error")
                    print(f"   📝 Error: {response.text}")
                    
                else:
                    print(f"   ⚠️  Unexpected status: {response.status_code}")
                    print(f"   📝 Response: {response.text}")
                    
            except requests.exceptions.Timeout:
                print("   ❌ Request timeout")
            except Exception as e:
                print(f"   ❌ Request failed: {e}")
    
    return False, None, None, None

def test_cors_headers():
    """Test CORS headers for Vercel frontend"""
    print("\n🌐 TESTING CORS CONFIGURATION")
    print("="*60)
    
    # Test preflight request
    try:
        response = requests.options(
            f"{RENDER_URL}/api/v1/users/auth/login/",
            headers={
                'Origin': 'https://scn-esg-frontend.vercel.app',  # Your Vercel domain
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type',
            },
            timeout=15
        )
        
        print(f"📨 Preflight Status: {response.status_code}")
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
            'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
        }
        
        print("📋 CORS Headers:")
        for header, value in cors_headers.items():
            status = "✅" if value else "❌"
            print(f"   {status} {header}: {value}")
            
        return all(cors_headers.values())
        
    except Exception as e:
        print(f"❌ CORS test failed: {e}")
        return False

def create_test_verification():
    """Verify test users exist and are properly configured"""
    print("\n👥 TESTING USER CREATION")
    print("="*60)
    
    try:
        # Try to register a new test user to see if registration works
        test_user_data = {
            "email": f"test_{int(time.time())}@scn.com",
            "password": "TestPassword123!",
            "first_name": "Test",
            "last_name": "User"
        }
        
        response = requests.post(
            f"{RENDER_URL}/api/v1/users/auth/register/",
            headers={'Content-Type': 'application/json'},
            json=test_user_data,
            timeout=30
        )
        
        print(f"📨 Registration Status: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print("✅ Registration working!")
            try:
                data = response.json()
                print(f"📝 Response: {json.dumps(data, indent=2)}")
            except:
                print(f"📝 Response: {response.text}")
        else:
            print("❌ Registration failed")
            print(f"📝 Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Registration test failed: {e}")

def generate_frontend_config():
    """Generate correct environment variables for Vercel frontend"""
    print("\n⚙️  FRONTEND CONFIGURATION")
    print("="*60)
    
    config = f"""
# Add these environment variables to your Vercel deployment:

VITE_API_URL={RENDER_URL}
VITE_BACKEND_URL={RENDER_URL}
NEXT_PUBLIC_API_URL={RENDER_URL}
NEXT_PUBLIC_BACKEND_URL={RENDER_URL}

# For local development (.env.local):
VITE_API_URL={RENDER_URL}
VITE_BACKEND_URL={RENDER_URL}
"""
    
    print(config)
    
    # Save to file
    try:
        with open('vercel_env_config.txt', 'w') as f:
            f.write(config)
        print("\n💾 Configuration saved to 'vercel_env_config.txt'")
    except:
        pass

def main():
    """Main test function"""
    print("🚀 SCN ESG PLATFORM - RENDER AUTHENTICATION TEST")
    print("="*80)
    print(f"🎯 Testing Render Backend: {RENDER_URL}")
    print(f"📅 Test Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)
    
    # Step 1: Check if backend is healthy
    if not test_backend_health():
        print("\n⚠️  Backend appears to be sleeping or down. Attempting to wake up...")
        if not wake_up_render_backend():
            print("❌ Failed to wake up backend. Please check Render deployment.")
            return
    
    # Step 2: Test authentication
    success, endpoint, creds, token_data = test_authentication_endpoints()
    
    # Step 3: Test CORS
    cors_ok = test_cors_headers()
    
    # Step 4: Test user creation
    create_test_verification()
    
    # Step 5: Generate frontend config
    generate_frontend_config()
    
    # Summary
    print("\n" + "="*80)
    print("📊 TEST SUMMARY")
    print("="*80)
    
    if success:
        print("✅ AUTHENTICATION WORKING!")
        print(f"   🎯 Working endpoint: {endpoint}")
        print(f"   👤 Working credentials: {creds['email']}")
        print("   🔑 Token received successfully")
        print("\n🎉 Your backend authentication is working!")
        print("   The issue is likely in the frontend configuration.")
    else:
        print("❌ AUTHENTICATION FAILED!")
        print("   🔍 Possible issues:")
        print("   - Backend is down/sleeping")
        print("   - Test users don't exist")
        print("   - Authentication endpoints not working")
        print("   - Database connection issues")
    
    if cors_ok:
        print("✅ CORS configuration looks good")
    else:
        print("❌ CORS configuration needs fixing")
    
    print("\n🔧 NEXT STEPS:")
    if success:
        print("1. Update Vercel environment variables (see vercel_env_config.txt)")
        print("2. Check frontend API service configuration")
        print("3. Verify frontend is using correct login endpoint")
    else:
        print("1. Run create_test_users.py on Render to create test users")
        print("2. Check Render deployment logs")
        print("3. Verify database connection on Render")
    
    print("="*80)

if __name__ == '__main__':
    main()
