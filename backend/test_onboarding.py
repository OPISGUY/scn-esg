#!/usr/bin/env python3
"""
Test the onboarding completion endpoint
"""

import requests
import json

def test_onboarding_endpoint():
    """Test the complete onboarding endpoint"""
    
    BASE_URL = "https://scn-esg-backend.onrender.com"
    
    print("🧪 ONBOARDING ENDPOINT TEST")
    print("=" * 50)
    
    # First, try to login to get a token
    print("\n🔐 Step 1: Login to get access token")
    login_data = {
        "email": "business@scn.com",
        "password": "business123"
    }
    
    try:
        login_response = requests.post(
            f"{BASE_URL}/api/v1/users/auth/login/",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Login Status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            access_token = login_result.get('access')
            print("   ✅ Login successful")
            
            # Test the onboarding endpoint
            print("\n📝 Step 2: Test onboarding completion")
            onboarding_data = {
                "company_name": "Test ESG Company",
                "industry": "Technology",
                "employees": 250,
                "sustainability_goals": ["net_zero", "circular_economy"],
                "reporting_requirements": ["csrd", "gri"],
                "challenges": ["data_collection", "stakeholder_engagement"]
            }
            
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}"
            }
            
            onboarding_response = requests.post(
                f"{BASE_URL}/api/v1/users/auth/complete-onboarding/",
                json=onboarding_data,
                headers=headers
            )
            
            print(f"   Onboarding Status: {onboarding_response.status_code}")
            
            if onboarding_response.status_code == 200:
                print("   ✅ Onboarding completion works!")
                result = onboarding_response.json()
                print(f"   📝 Response: {json.dumps(result, indent=2)}")
            else:
                print(f"   ❌ Onboarding failed: {onboarding_response.text}")
                
        else:
            print(f"   ❌ Login failed: {login_response.text}")
            
    except Exception as e:
        print(f"   💥 Exception: {e}")

    print("\n" + "=" * 50)
    print("🏁 ONBOARDING TEST COMPLETE")

if __name__ == "__main__":
    test_onboarding_endpoint()
