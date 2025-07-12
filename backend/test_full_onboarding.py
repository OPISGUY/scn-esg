#!/usr/bin/env python3
"""
Quick test for onboarding with a new user
"""

import requests
import json
from datetime import datetime

def test_full_onboarding_flow():
    """Test the complete onboarding flow with a new user"""
    
    BASE_URL = "https://scn-esg-backend.onrender.com"
    
    print("🚀 FULL ONBOARDING FLOW TEST")
    print("=" * 50)
    
    # Step 1: Register a new user
    print("\n📝 Step 1: Register new user")
    test_email = f"onboarding_test_{int(datetime.now().timestamp())}@test.com"
    registration_data = {
        "email": test_email,
        "password": "TestPassword123!",
        "first_name": "Onboarding",
        "last_name": "Test"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/users/auth/register/",
            json=registration_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Registration Status: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            token = data.get('access')
            user_data = data.get('user')
            print("   ✅ Registration successful")
            print(f"   👤 User ID: {user_data.get('id')}")
            print(f"   🔑 Token: {token[:50]}...")
        else:
            print(f"   ❌ Registration failed: {response.json()}")
            return
    except Exception as e:
        print(f"   💥 Registration exception: {e}")
        return
    
    # Step 2: Complete onboarding
    print("\n📝 Step 2: Complete onboarding")
    onboarding_data = {
        "company_name": "Onboarding Test Company",
        "industry": "Technology",
        "employees": 150,
        "sustainability_goals": ["carbon_neutral", "renewable_energy"],
        "reporting_requirements": ["csrd", "ghg_protocol"],
        "challenges": ["data_collection", "team_engagement"]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/users/complete-onboarding/",
            json=onboarding_data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            }
        )
        print(f"   Onboarding Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Onboarding completion successful")
            print(f"   📝 Updated user: {data.get('user', {}).get('company')}")
            print(f"   🏢 Company created: {data.get('user', {}).get('company_data')}")
            print(f"   ✅ Onboarding complete: {data.get('user', {}).get('is_onboarding_complete')}")
        else:
            print(f"   ❌ Onboarding failed: {response.json()}")
    except Exception as e:
        print(f"   💥 Onboarding exception: {e}")

    print("\n" + "=" * 50)
    print("📊 FULL ONBOARDING TEST COMPLETE")

if __name__ == "__main__":
    test_full_onboarding_flow()
