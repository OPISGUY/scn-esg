#!/usr/bin/env python
"""
Quick test script for Render backend registration issue
"""
import requests
import json

# Test registration with minimal data
RENDER_URL = "https://scn-esg-backend.onrender.com"

def test_backend_endpoints():
    print("🔍 TESTING RENDER BACKEND ENDPOINTS")
    print("="*50)
    
    # Test 1: Root endpoint
    print("\n1. Testing root endpoint...")
    try:
        response = requests.get(f"{RENDER_URL}/")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 2: Health endpoint
    print("\n2. Testing health endpoint...")
    try:
        response = requests.get(f"{RENDER_URL}/api/v1/health/")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 3: Registration endpoint with minimal data
    print("\n3. Testing registration endpoint...")
    try:
        registration_data = {
            "email": "test@example.com",
            "password": "TestPassword123!",
            "first_name": "Test",
            "last_name": "User"
        }
        
        response = requests.post(
            f"{RENDER_URL}/api/v1/users/auth/register/",
            json=registration_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Status: {response.status_code}")
        if response.status_code == 500:
            print(f"   Error Response: {response.text}")
        else:
            print(f"   Response: {response.json()}")
            
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 4: Try login with existing test user
    print("\n4. Testing login with existing test user...")
    try:
        login_data = {
            "email": "admin@scn.com",
            "password": "admin123"
        }
        
        response = requests.post(
            f"{RENDER_URL}/api/v1/users/auth/login/",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Login successful! User: {result.get('user', {}).get('email')}")
        else:
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"   Error: {e}")

if __name__ == '__main__':
    test_backend_endpoints()
