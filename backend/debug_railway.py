#!/usr/bin/env python
"""
Debug script to check Railway deployment status
"""
import requests
import json

API_URL = "https://scn-esg-backend.railway.app"

def test_railway_deployment():
    """Test various aspects of the Railway deployment"""
    print("🚂 RAILWAY DEPLOYMENT DEBUG")
    print("="*50)
    
    print(f"Testing URL: {API_URL}")
    
    # Test basic connectivity
    print("\n1. 🌐 Basic Connectivity Test:")
    try:
        response = requests.get(API_URL, timeout=10)
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        print(f"   Content Length: {len(response.text)}")
        print(f"   Content Preview: {response.text[:500]}...")
        
        # Check if this is Django or Railway default
        if "Railway" in response.text and "Django" not in response.text:
            print("   ❌ This appears to be Railway's default page, not Django!")
        elif response.status_code == 200:
            print("   ✅ Got a response, checking if it's Django...")
    except Exception as e:
        print(f"   ❌ Connection failed: {e}")
    
    # Test Django-specific URLs
    print("\n2. 🐍 Django URL Testing:")
    django_urls = [
        "/admin/",
        "/api/",
        "/api/v1/",
        "/api/v1/health/",
        "/api/v1/auth/",
        "/api/v1/users/",
        "/api/v1/users/auth/",
        "/api/v1/users/auth/login/",
    ]
    
    for url in django_urls:
        try:
            resp = requests.get(f"{API_URL}{url}", timeout=5)
            status_indicator = "✅" if resp.status_code in [200, 301, 302, 405] else "❌" if resp.status_code == 404 else "⚠️"
            print(f"   {status_indicator} {url}: {resp.status_code}")
            
            # For login endpoint, try POST to see if it accepts the request
            if url.endswith("/login/") and resp.status_code == 405:  # Method not allowed
                try:
                    post_resp = requests.post(f"{API_URL}{url}", 
                                            json={"email": "test", "password": "test"}, 
                                            timeout=5)
                    print(f"      POST {url}: {post_resp.status_code}")
                except:
                    pass
                    
        except Exception as e:
            print(f"   ❌ {url}: ERROR ({e})")
    
    # Test CORS
    print("\n3. 🌍 CORS Testing:")
    try:
        cors_resp = requests.options(f"{API_URL}/api/v1/users/auth/login/", 
                                   headers={
                                       'Origin': 'https://example.com',
                                       'Access-Control-Request-Method': 'POST',
                                       'Access-Control-Request-Headers': 'Content-Type'
                                   }, timeout=5)
        print(f"   CORS Status: {cors_resp.status_code}")
        cors_headers = {k: v for k, v in cors_resp.headers.items() if 'access-control' in k.lower()}
        for header, value in cors_headers.items():
            print(f"   {header}: {value}")
    except Exception as e:
        print(f"   ❌ CORS test failed: {e}")
    
    print("\n" + "="*50)
    print("🔍 ANALYSIS & RECOMMENDATIONS:")
    print("="*50)
    
    # Provide specific recommendations based on findings
    print("Based on the test results:")
    print("1. Check Railway logs for Django startup errors")
    print("2. Verify environment variables are set in Railway")
    print("3. Ensure DATABASE_URL is configured")
    print("4. Check if migrations ran successfully")
    print("5. Verify the start command in railway.json")

if __name__ == '__main__':
    test_railway_deployment()
