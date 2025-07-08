#!/usr/bin/env python3
"""
Comprehensive test script for Render backend
Tests and creates test users on the live backend
"""

import requests
import json
import sys

# Render backend URL
BASE_URL = "https://scn-esg-backend.onrender.com"

def test_endpoint(url, method='GET', data=None, description=""):
    """Test an endpoint and return response"""
    try:
        print(f"\n{description}")
        print("-" * 50)
        
        if method == 'GET':
            response = requests.get(url, timeout=30)
        elif method == 'POST':
            response = requests.post(url, json=data, timeout=30)
        
        print(f"Status: {response.status_code}")
        
        try:
            json_response = response.json()
            print(f"Response: {json.dumps(json_response, indent=2)}")
            return response.status_code, json_response
        except:
            print(f"Response: {response.text}")
            return response.status_code, response.text
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None, str(e)
    except Exception as e:
        print(f"❌ Error: {e}")
        return None, str(e)

def create_test_users():
    """Create test users on the live backend"""
    print("\n" + "="*60)
    print("🔧 CREATING TEST USERS ON RENDER BACKEND")
    print("="*60)
    
    test_users = [
        {
            'email': 'admin@scn.com',
            'password': 'admin123',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin'
        },
        {
            'email': 'test@scn.com',
            'password': 'test123',
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'sustainability_manager'
        },
        {
            'email': 'business@scn.com',
            'password': 'business123',
            'first_name': 'Business',
            'last_name': 'Manager',
            'role': 'decision_maker'
        }
    ]
    
    created_users = []
    
    for user_data in test_users:
        print(f"\n📝 Creating user: {user_data['email']}")
        
        status_code, response = test_endpoint(
            f"{BASE_URL}/api/v1/auth/register/",
            method='POST',
            data=user_data,
            description=f"Creating {user_data['email']}"
        )
        
        if status_code == 201:
            print(f"✅ User {user_data['email']} created successfully")
            created_users.append(user_data)
        elif status_code == 400 and isinstance(response, dict) and 'already exists' in response.get('error', ''):
            print(f"ℹ️  User {user_data['email']} already exists")
            created_users.append(user_data)
        else:
            print(f"❌ Failed to create user {user_data['email']}")
    
    return created_users

def test_logins(users):
    """Test login for all created users"""
    print("\n" + "="*60)
    print("🔐 TESTING USER LOGINS")
    print("="*60)
    
    login_results = []
    
    for user in users:
        print(f"\n🔑 Testing login for: {user['email']}")
        
        login_data = {
            'email': user['email'],
            'password': user['password']
        }
        
        status_code, response = test_endpoint(
            f"{BASE_URL}/api/v1/auth/login/",
            method='POST',
            data=login_data,
            description=f"Login test for {user['email']}"
        )
        
        if status_code == 200:
            print(f"✅ Login successful for {user['email']}")
            login_results.append({'user': user['email'], 'status': 'success'})
        else:
            print(f"❌ Login failed for {user['email']}")
            login_results.append({'user': user['email'], 'status': 'failed', 'error': response})
    
    return login_results

def main():
    """Main test function"""
    print("🔍 COMPREHENSIVE RENDER BACKEND TEST")
    print("="*60)
    
    # Test basic endpoints first
    print("\n1. Testing basic endpoints...")
    test_endpoint(f"{BASE_URL}/", description="Testing root endpoint")
    test_endpoint(f"{BASE_URL}/api/v1/health/", description="Testing health endpoint")
    
    # Create test users
    created_users = create_test_users()
    
    # Test logins
    if created_users:
        login_results = test_logins(created_users)
        
        # Summary
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        
        successful_logins = [r for r in login_results if r['status'] == 'success']
        failed_logins = [r for r in login_results if r['status'] == 'failed']
        
        print(f"✅ Successful logins: {len(successful_logins)}")
        for result in successful_logins:
            print(f"   - {result['user']}")
        
        print(f"❌ Failed logins: {len(failed_logins)}")
        for result in failed_logins:
            print(f"   - {result['user']}")
        
        if len(successful_logins) == len(created_users):
            print("\n🎉 ALL TESTS PASSED! Backend is ready for production.")
            return True
        else:
            print("\n⚠️  Some login tests failed. Check the backend configuration.")
            return False
    else:
        print("\n❌ No users were created. Cannot test logins.")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
