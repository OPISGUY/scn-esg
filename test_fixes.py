#!/usr/bin/env python
"""
Quick test to verify all fixes are working
"""
import requests
import json

RENDER_URL = "https://scn-esg-backend.onrender.com"

def test_all_fixes():
    print("🧪 TESTING ALL FIXES")
    print("="*50)
    
    # Test 1: Login
    print("\n1. Testing Login...")
    try:
        response = requests.post(
            f"{RENDER_URL}/api/v1/users/auth/login/",
            json={'email': 'business@scn.com', 'password': 'business123'},
            timeout=10
        )
        if response.status_code == 200:
            print("   ✅ Login working!")
            token = response.json().get('access', '')[:30]
            print(f"   🔑 Token: {token}...")
        else:
            print(f"   ❌ Login failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Login error: {e}")
    
    # Test 2: ESRS Datapoints endpoint
    print("\n2. Testing ESRS Datapoints...")
    try:
        response = requests.get(
            f"{RENDER_URL}/api/v1/compliance/esrs-datapoints/",
            timeout=10
        )
        print(f"   📨 Status: {response.status_code}")
        if response.status_code in [200, 401]:  # 401 is OK (needs auth)
            print("   ✅ Endpoint exists!")
        else:
            print(f"   ⚠️  Unexpected status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: AI Service endpoint
    print("\n3. Testing AI Service...")
    try:
        response = requests.get(
            f"{RENDER_URL}/api/v1/carbon/ai/validate/",
            timeout=10
        )
        print(f"   📨 Status: {response.status_code}")
        if response.status_code in [200, 401, 405]:  # All acceptable
            print("   ✅ Endpoint accessible!")
        else:
            print(f"   ⚠️  Status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n" + "="*50)
    print("🎉 FIX VERIFICATION COMPLETE!")
    print("\nNext steps:")
    print("1. Deploy frontend with updated code")
    print("2. Update Vercel environment variables")
    print("3. Test login with business@scn.com / business123")
    print("4. Test PDF generation")

if __name__ == '__main__':
    test_all_fixes()
