#!/usr/bin/env python3
"""
Check CORS configuration for the Render backend
"""
import requests
import json

RENDER_URL = "https://scn-esg-backend.onrender.com"

def test_cors_with_different_origins():
    """Test CORS with different possible Vercel origins"""
    print("🌐 TESTING CORS CONFIGURATION")
    print("="*60)
    
    # Test your actual Vercel URL and common alternatives
    test_origins = [
        "https://scn-esg-platform.vercel.app",  # Your actual Vercel URL
        "https://scn-esg-frontend.vercel.app",
        "https://scn-esg.vercel.app",
        "https://scn-esg-platform-fhyfe3og6-opisguys-projects.vercel.app",
        "https://localhost:3000",
        "https://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5173"
    ]
    
    login_endpoint = f"{RENDER_URL}/api/v1/users/auth/login/"
    
    for origin in test_origins:
        print(f"\n🔗 Testing origin: {origin}")
        
        try:
            # Test preflight OPTIONS request
            response = requests.options(
                login_endpoint,
                headers={
                    'Origin': origin,
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type'
                },
                timeout=10
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                cors_headers = {k: v for k, v in response.headers.items() 
                              if 'access-control' in k.lower()}
                print(f"   CORS Headers:")
                for header, value in cors_headers.items():
                    print(f"     {header}: {value}")
                    
                allowed_origin = response.headers.get('access-control-allow-origin', 'None')
                if allowed_origin == origin or allowed_origin == '*':
                    print(f"   ✅ CORS ALLOWED for {origin}")
                else:
                    print(f"   ❌ CORS BLOCKED for {origin} (server allows: {allowed_origin})")
            else:
                print(f"   ❌ Preflight failed with status {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Error testing {origin}: {e}")

def test_actual_login_with_cors():
    """Test actual login request with CORS headers"""
    print(f"\n🔐 TESTING ACTUAL LOGIN WITH CORS")
    print("="*60)
    
    # Test with your actual Vercel URL
    test_origin = "https://scn-esg-platform.vercel.app"
    
    try:
        response = requests.post(
            f"{RENDER_URL}/api/v1/users/auth/login/",
            headers={
                'Content-Type': 'application/json',
                'Origin': test_origin
            },
            json={
                'email': 'business@scn.com',
                'password': 'business123'
            },
            timeout=10
        )
        
        print(f"Login Status: {response.status_code}")
        print(f"CORS Headers in Response:")
        cors_headers = {k: v for k, v in response.headers.items() 
                       if 'access-control' in k.lower()}
        for header, value in cors_headers.items():
            print(f"  {header}: {value}")
            
        if response.status_code == 200:
            print("✅ Login successful with CORS!")
        else:
            print(f"❌ Login failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Login test failed: {e}")

if __name__ == '__main__':
    test_cors_with_different_origins()
    test_actual_login_with_cors()
