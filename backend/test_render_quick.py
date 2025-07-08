#!/usr/bin/env python
"""
Quick authentication test for Render backend
Run this after creating users with Render CLI
"""
import requests
import json

def test_render_authentication():
    """Test authentication with the credentials we just created"""
    
    # Get your service name
    service_name = input("Enter your Render service name (e.g., scn-esg-backend): ").strip()
    
    if not service_name:
        print("❌ Service name is required")
        return
    
    # Construct the URL
    render_url = f"https://{service_name}.onrender.com"
    
    print(f"\n🧪 TESTING AUTHENTICATION")
    print(f"Backend URL: {render_url}")
    print("="*60)
    
    # Test credentials
    test_users = [
        {"email": "admin@scn.com", "password": "admin123", "name": "Admin User"},
        {"email": "test@scn.com", "password": "test123", "name": "Test User"}
    ]
    
    # Test endpoints
    endpoints = [
        "/api/v1/users/auth/login/",  # Custom endpoint
        "/api/v1/auth/login/"         # JWT endpoint
    ]
    
    working_credentials = []
    
    for endpoint in endpoints:
        print(f"\n🔗 Testing endpoint: {endpoint}")
        
        for user in test_users:
            print(f"\n👤 Testing: {user['name']} ({user['email']})")
            
            try:
                response = requests.post(
                    f"{render_url}{endpoint}",
                    headers={"Content-Type": "application/json"},
                    json={"email": user["email"], "password": user["password"]},
                    timeout=30
                )
                
                print(f"   Status: {response.status_code}")
                
                if response.status_code == 200:
                    print("   ✅ LOGIN SUCCESS!")
                    try:
                        data = response.json()
                        if "access" in data:
                            print(f"   🎯 Access token received: {data['access'][:20]}...")
                            working_credentials.append({
                                "email": user["email"],
                                "password": user["password"],
                                "endpoint": endpoint,
                                "token": data["access"]
                            })
                    except:
                        print(f"   Response: {response.text}")
                        
                elif response.status_code == 401:
                    print("   ❌ Invalid credentials")
                elif response.status_code == 404:
                    print("   ❌ Endpoint not found")
                else:
                    print(f"   ⚠️  Status {response.status_code}: {response.text}")
                    
            except requests.exceptions.Timeout:
                print("   ❌ Request timeout - backend may be sleeping")
            except Exception as e:
                print(f"   ❌ Error: {e}")
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST RESULTS")
    print("="*60)
    
    if working_credentials:
        print("✅ AUTHENTICATION WORKING!")
        print(f"   Found {len(working_credentials)} working credential(s)")
        
        print("\n🔑 Working Credentials:")
        for cred in working_credentials:
            print(f"   Email: {cred['email']}")
            print(f"   Password: {cred['password']}")
            print(f"   Endpoint: {cred['endpoint']}")
            print(f"   Token: {cred['token'][:30]}...")
            print()
        
        print("🎯 VERCEL CONFIGURATION:")
        print(f"   Add this to Vercel environment variables:")
        print(f"   VITE_API_URL={render_url}")
        print("\n🚀 NEXT STEPS:")
        print("   1. Update Vercel environment variables")
        print("   2. Redeploy Vercel frontend")
        print("   3. Test login on your live site")
        
    else:
        print("❌ NO WORKING CREDENTIALS FOUND")
        print("\n🔧 TROUBLESHOOTING:")
        print("   1. Check if users were created: render exec <service> -- python manage.py shell")
        print("   2. Check Render logs: render logs <service>")
        print("   3. Verify service is running: render services get <service>")
        print("   4. Check database migrations: render exec <service> -- python manage.py migrate")
    
    print("="*60)

if __name__ == "__main__":
    print("🚀 SCN ESG PLATFORM - RENDER AUTHENTICATION TEST")
    print("="*60)
    test_render_authentication()
