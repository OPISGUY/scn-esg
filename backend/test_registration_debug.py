#!/usr/bin/env python3
"""
Registration Debug Test - SCN ESG Platform
Tests the exact registration scenario the user is experiencing
"""

import requests
import json
import uuid
from datetime import datetime

def test_registration_debug():
    """Test registration with different scenarios to identify the 500 error"""
    
    BASE_URL = "https://scn-esg-backend.onrender.com"
    
    print("🔍 REGISTRATION DEBUG TEST")
    print("=" * 50)
    
    # Test 1: Basic registration (should work)
    print("\n📝 Test 1: Basic Registration")
    test_email = f"debug_test_{int(datetime.now().timestamp())}@scn.com"
    basic_data = {
        "email": test_email,
        "password": "TestPassword123!",
        "first_name": "Debug",
        "last_name": "User"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/users/auth/register/",
            json=basic_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 201:
            print("   ✅ Basic registration works")
        else:
            print(f"   ❌ Error: {response.json()}")
    except Exception as e:
        print(f"   💥 Exception: {e}")
    
    # Test 2: Registration with company field
    print("\n📝 Test 2: Registration with Company")
    test_email2 = f"debug_company_{int(datetime.now().timestamp())}@scn.com"
    company_data = {
        "email": test_email2,
        "password": "TestPassword123!",
        "first_name": "Debug",
        "last_name": "User",
        "company": "Test Company"  # This might cause issues
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/users/auth/register/",
            json=company_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 201:
            print("   ✅ Company registration works")
        else:
            print(f"   ❌ Error: {response.json()}")
    except Exception as e:
        print(f"   💥 Exception: {e}")
    
    # Test 3: Registration with role field
    print("\n📝 Test 3: Registration with Role")
    test_email3 = f"debug_role_{int(datetime.now().timestamp())}@scn.com"
    role_data = {
        "email": test_email3,
        "password": "TestPassword123!",
        "first_name": "Debug",
        "last_name": "User",
        "role": "admin"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/users/auth/register/",
            json=role_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 201:
            print("   ✅ Role registration works")
        else:
            print(f"   ❌ Error: {response.json()}")
    except Exception as e:
        print(f"   💥 Exception: {e}")
    
    # Test 4: Test existing email (should return 400, not 500)
    print("\n📝 Test 4: Existing Email Test")
    existing_data = {
        "email": "business@scn.com",  # This email should exist
        "password": "TestPassword123!",
        "first_name": "Duplicate",
        "last_name": "User"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/users/auth/register/",
            json=existing_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 400:
            print("   ✅ Correctly rejects existing email")
            print(f"   📝 Response: {response.json()}")
        else:
            print(f"   ❌ Unexpected status: {response.json()}")
    except Exception as e:
        print(f"   💥 Exception: {e}")
    
    # Test 5: Test missing fields
    print("\n📝 Test 5: Missing Fields Test")
    missing_data = {
        "email": f"missing_test_{int(datetime.now().timestamp())}@scn.com",
        "password": "TestPassword123!"
        # Missing first_name and last_name
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/users/auth/register/",
            json=missing_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 400:
            print("   ✅ Correctly rejects missing fields")
            print(f"   📝 Response: {response.json()}")
        else:
            print(f"   ❌ Unexpected status: {response.json()}")
    except Exception as e:
        print(f"   💥 Exception: {e}")
    
    # Test 6: Test with all possible fields (simulating frontend form)
    print("\n📝 Test 6: Full Form Data Test")
    test_email4 = f"debug_full_{int(datetime.now().timestamp())}@scn.com"
    full_data = {
        "email": test_email4,
        "password": "TestPassword123!",
        "first_name": "Full",
        "last_name": "Test",
        "company": "",  # Empty company
        "role": "sustainability_manager"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/users/auth/register/",
            json=full_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 201:
            print("   ✅ Full form registration works")
        else:
            print(f"   ❌ Error: {response.json()}")
    except Exception as e:
        print(f"   💥 Exception: {e}")

    print("\n" + "=" * 50)
    print("📊 DEBUG TEST COMPLETE")
    print("🔍 If any test shows a 500 error, that's the cause!")

if __name__ == "__main__":
    test_registration_debug()
