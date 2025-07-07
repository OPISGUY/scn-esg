#!/usr/bin/env python
"""
Comprehensive test script for Railway + Vercel deployment
"""
import requests
import json
import time

# Configuration
RAILWAY_URL = "https://scn-esg-production.up.railway.app"
TEST_CREDENTIALS = [
    {'email': 'admin@test.com', 'password': 'TestAdmin123!'},
    {'email': 'user@test.com', 'password': 'TestUser123!'}
]

def test_railway_status():
    """Test if Railway is serving Django properly"""
    print("🚂 TESTING RAILWAY BACKEND")
    print("="*40)
    
    try:
        response = requests.get(RAILWAY_URL, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if "Railway" in response.text and "Django" not in response.text:
            print("❌ Railway is serving default page - Django not running!")
            print("   Fix: Check Railway environment variables and logs")
            return False
        elif response.status_code == 200:
            print("✅ Railway is responding (checking if Django...)")
            return True
    except Exception as e:
        print(f"❌ Railway connection failed: {e}")
        return False

def test_django_endpoints():
    """Test Django-specific endpoints"""
    print("\n🐍 TESTING DJANGO ENDPOINTS")
    print("="*40)
    
    endpoints = [
        ("/api/v1/health/", "Health check"),
        ("/admin/", "Django admin"),
        ("/api/v1/auth/login/", "JWT login"),
        ("/api/v1/users/auth/login/", "Custom login")
    ]
    
    django_working = False
    for endpoint, description in endpoints:
        try:
            response = requests.get(f"{RAILWAY_URL}{endpoint}", timeout=5)
            status_icon = "✅" if response.status_code in [200, 301, 302, 405] else "❌"
            print(f"{status_icon} {description}: {response.status_code}")
            
            if response.status_code in [200, 405]:  # 405 = Method not allowed (good for POST endpoints)
                django_working = True
                
        except Exception as e:
            print(f"❌ {description}: ERROR")
    
    return django_working

def test_cors_configuration():
    """Test CORS settings"""
    print("\n🌐 TESTING CORS CONFIGURATION")
    print("="*40)
    
    test_origins = [
        "https://scn-esg-platform.vercel.app",
        "https://your-app.vercel.app",
        "https://localhost:5173"
    ]
    
    for origin in test_origins:
        try:
            response = requests.options(
                f"{RAILWAY_URL}/api/v1/users/auth/login/",
                headers={
                    'Origin': origin,
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type'
                },
                timeout=5
            )
            
            allowed_origin = response.headers.get('access-control-allow-origin', '')
            if allowed_origin == origin or allowed_origin == '*':
                print(f"✅ CORS OK for {origin}")
            else:
                print(f"❌ CORS blocked for {origin} (allowed: {allowed_origin})")
                
        except Exception as e:
            print(f"❌ CORS test failed for {origin}: {e}")

def test_authentication():
    """Test authentication endpoints"""
    print("\n🔐 TESTING AUTHENTICATION")
    print("="*40)
    
    # Test both auth endpoints
    auth_endpoints = [
        "/api/v1/auth/login/",      # JWT endpoint
        "/api/v1/users/auth/login/" # Custom endpoint
    ]
    
    for endpoint in auth_endpoints:
        print(f"\nTesting {endpoint}:")
        
        for creds in TEST_CREDENTIALS:
            try:
                response = requests.post(
                    f"{RAILWAY_URL}{endpoint}",
                    headers={'Content-Type': 'application/json'},
                    json=creds,
                    timeout=10
                )
                
                if response.status_code == 200:
                    print(f"✅ Login successful for {creds['email']}")
                    data = response.json()
                    if 'access' in data or 'token' in data:
                        print("   Token received!")
                        return True
                elif response.status_code == 404:
                    print(f"❌ Endpoint not found: {endpoint}")
                elif response.status_code == 401:
                    print(f"⚠️  Endpoint works, but credentials invalid")
                else:
                    print(f"❌ Login failed ({response.status_code}): {response.text[:100]}")
                    
            except Exception as e:
                print(f"❌ Auth test failed: {e}")
    
    return False

def provide_recommendations():
    """Provide fix recommendations based on test results"""
    print("\n💡 RECOMMENDATIONS")
    print("="*40)
    print("Based on the test results above:")
    print()
    
    print("🔧 If Railway shows default page:")
    print("   1. Set DJANGO_SECRET_KEY in Railway environment")
    print("   2. Set DJANGO_DEBUG=False")
    print("   3. Set DJANGO_ALLOWED_HOSTS=scn-esg-backend.railway.app")
    print("   4. Check Railway logs for startup errors")
    print()
    
    print("🌐 If CORS is blocking:")
    print("   1. Set DJANGO_CORS_ALLOWED_ORIGINS in Railway")
    print("   2. Include your Vercel app URL")
    print("   3. Example: https://your-app.vercel.app")
    print()
    
    print("🔐 If authentication fails:")
    print("   1. Create test users with manage.py")
    print("   2. Check database connection")
    print("   3. Verify JWT settings")
    print()
    
    print("📋 Railway Environment Variables Needed:")
    print("   DJANGO_SECRET_KEY=v51$*ey59l%1=8+o1flwwd#6b7k%rv_nl7@0k4(^)9_sg#2ep#")
    print("   DJANGO_DEBUG=False")
    print("   DJANGO_ALLOWED_HOSTS=scn-esg-backend.railway.app")
    print("   DJANGO_CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app")

def main():
    """Run all tests"""
    print("🔍 RAILWAY + VERCEL DEPLOYMENT TESTER")
    print("="*50)
    
    # Run tests in sequence
    railway_ok = test_railway_status()
    
    if railway_ok:
        django_ok = test_django_endpoints()
        test_cors_configuration()
        
        if django_ok:
            auth_ok = test_authentication()
            if auth_ok:
                print("\n🎉 SUCCESS! Backend and frontend should work together!")
                return
    
    provide_recommendations()

if __name__ == '__main__':
    main()
