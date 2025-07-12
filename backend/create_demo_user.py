#!/usr/bin/env python3
"""
Create demo user and fix onboarding status
"""

import requests
import json

def create_demo_user():
    """Create or update the demo user"""
    
    BASE_URL = "https://scn-esg-backend.onrender.com"
    
    print("🎭 DEMO USER SETUP")
    print("=" * 50)
    
    # Register demo user with known credentials
    demo_data = {
        "email": "demo@scn.com",  # Use different email to avoid conflicts
        "password": "DemoPassword123!",
        "first_name": "Demo",
        "last_name": "User"
    }
    
    print("\n📝 Creating demo user...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/users/auth/register/",
            json=demo_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            data = response.json()
            print("   ✅ Demo user created successfully")
            print(f"   📧 Email: demo@scn.com")
            print(f"   🔑 Password: DemoPassword123!")
            
            # Complete onboarding for demo user
            token = data.get('access')
            complete_demo_onboarding(token)
            
        else:
            print(f"   ❌ Failed: {response.json()}")
            
    except Exception as e:
        print(f"   💥 Exception: {e}")

def complete_demo_onboarding(token):
    """Complete onboarding for demo user with sample data"""
    
    BASE_URL = "https://scn-esg-backend.onrender.com"
    
    print("\n🚀 Completing demo user onboarding...")
    
    demo_onboarding = {
        "company_name": "SCN Demo Company",
        "industry": "Technology",
        "employees": 500,
        "sustainability_goals": ["carbon_neutral", "renewable_energy", "waste_reduction"],
        "reporting_requirements": ["csrd", "ghg_protocol", "tcfd"],
        "challenges": ["data_collection", "team_engagement", "budget_constraints"]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/users/auth/complete-onboarding/",
            json=demo_onboarding,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            }
        )
        
        if response.status_code == 200:
            print("   ✅ Demo onboarding completed")
        else:
            print(f"   ❌ Onboarding failed: {response.json()}")
            
    except Exception as e:
        print(f"   💥 Exception: {e}")

if __name__ == "__main__":
    create_demo_user()
