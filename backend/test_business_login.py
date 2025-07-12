#!/usr/bin/env python3
"""
Quick test script to verify business@scn.com login functionality
"""
import requests
import json

RENDER_URL = 'https://scn-esg-backend.onrender.com'

def test_business_login():
    print('🔐 TESTING business@scn.com LOGIN')       
    print('='*50)
    
    # Test multiple possible endpoints
    endpoints = [
        '/api/v1/users/auth/login/',
        '/api/v1/auth/login/',
        'api/v1/users/auth/login/',  # Without leading slash
    ]
    
    for endpoint in endpoints:
        # Construct URL carefully to avoid double slashes
        if endpoint.startswith('/'):
            full_url = f'{RENDER_URL.rstrip("/")}{endpoint}'
        else:
            full_url = f'{RENDER_URL.rstrip("/")}/{endpoint}'
            
        print(f'\n🔗 Testing URL: {full_url}')
        
        try:
            response = requests.post(
                full_url,
                json={'email': 'business@scn.com', 'password': 'business123'},
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            print(f'   Status Code: {response.status_code}')  
            
            if response.status_code == 200:
                data = response.json()
                print('   ✅ LOGIN SUCCESSFUL!')
                print(f'   User ID: {data.get("user", {}).get("id")}')
                print(f'   Email: {data.get("user", {}).get("email")}')
                print(f'   Name: {data.get("user", {}).get("first_name")} {data.get("user", {}).get("last_name")}')
                token = data.get("access", "None")
                if token and len(token) > 30:
                    print(f'   Token: {token[:30]}...')
                else:
                    print(f'   Token: {token}')
                return True
            else:
                print(f'   ❌ LOGIN FAILED!')
                print(f'   Error: {response.text}')
                
        except requests.exceptions.RequestException as e:
            print(f'   ❌ CONNECTION ERROR: {e}')
        except Exception as e:
            print(f'   ❌ UNEXPECTED ERROR: {e}')
    
    return False

if __name__ == '__main__':
    test_business_login()
