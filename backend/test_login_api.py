#!/usr/bin/env python
"""
Direct API test for the login endpoint.
Tests the login API directly without going through the frontend.
"""
import requests
import json
import sys

def test_login_api(base_url, email, password):
    """Test the login API endpoint directly"""
    print(f"🧪 Testing login API: {email}")
    print(f"📡 Base URL: {base_url}")
    
    login_url = f"{base_url}/api/v1/users/auth/login/"
    
    payload = {
        "email": email,
        "password": password
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print(f"📤 Sending POST request to: {login_url}")
        print(f"📋 Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(login_url, json=payload, headers=headers, timeout=30)
        
        print(f"📨 Response Status: {response.status_code}")
        print(f"📄 Response Headers: {dict(response.headers)}")
        
        try:
            response_data = response.json()
            print(f"📝 Response Body: {json.dumps(response_data, indent=2)}")
        except:
            print(f"📝 Response Body (raw): {response.text}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            return True
        else:
            print("❌ Login failed!")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

def test_health_endpoint(base_url):
    """Test the health endpoint to verify API connectivity"""
    print(f"🏥 Testing health endpoint")
    
    health_url = f"{base_url}/api/v1/users/auth/health/"
    
    try:
        response = requests.get(health_url, timeout=10)
        print(f"📨 Health Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"📝 Health Response: {json.dumps(data, indent=2)}")
            except:
                print(f"📝 Health Response (raw): {response.text}")
            return True
        else:
            print(f"❌ Health check failed: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check request failed: {e}")
        return False

def main():
    """Main test function"""
    # Check if URL is provided as argument
    if len(sys.argv) > 1:
        base_url = sys.argv[1].rstrip('/')
    else:
        print("Please provide your Railway app URL as an argument")
        print("Example: python test_login_api.py https://your-app.railway.app")
        return
    
    print("🚀 DIRECT API LOGIN TEST")
    print("="*60)
    
    # Test health endpoint first
    if not test_health_endpoint(base_url):
        print("❌ Cannot reach API, aborting login tests")
        return
    
    print("\n" + "="*60)
    
    # Test login with known credentials
    test_credentials = [
        ('admin@test.com', 'TestAdmin123!'),
        ('user@test.com', 'TestUser123!'),
        ('invalid@test.com', 'wrongpassword')
    ]
    
    for email, password in test_credentials:
        print("\n" + "-"*40)
        success = test_login_api(base_url, email, password)
        if success:
            print("✅ This credential works for frontend testing!")
        print("-"*40)

if __name__ == '__main__':
    main()
