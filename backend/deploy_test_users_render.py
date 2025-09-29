#!/usr/bin/env python
"""
Deploy test users to Render backend
This script will create the test users on your live Render deployment
"""
import os
import sys
import django
import requests
import json

# Setup Django for local models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scn_esg_platform.settings')

# Try to setup Django (might fail if not in local environment)
try:
    django.setup()
    from django.contrib.auth import get_user_model
    from companies.models import Company
    LOCAL_DJANGO = True
    print("✅ Local Django setup successful")
except:
    LOCAL_DJANGO = False
    print("⚠️  Local Django not available - will use API registration")

RENDER_URL = "https://scn-esg-backend.onrender.com"

def create_users_via_api():
    """Create test users via API registration"""
    print("\n🚀 CREATING TEST USERS VIA API")
    print("="*60)
    
    # Test users to create
    test_users = [
        {
            "email": "admin@scn.com",
            "password": "AdminPassword123!",
            "first_name": "Admin",
            "last_name": "User",
            "role": "admin"
        },
        {
            "email": "test@scn.com",
            "password": "TestPassword123!",
            "first_name": "Test", 
            "last_name": "User",
            "role": "sustainability_manager"
        },
        {
            "email": "business@scn.com",
            "password": "BusinessPassword123!",
            "first_name": "Business",
            "last_name": "Manager", 
            "role": "decision_maker"
        }
    ]
    
    created_users = []
    
    for user_data in test_users:
        print(f"\n👤 Creating user: {user_data['email']}")
        
        try:
            response = requests.post(
                f"{RENDER_URL}/api/v1/users/auth/register/",
                headers={'Content-Type': 'application/json'},
                json=user_data,
                timeout=180
            )
            
            print(f"   📨 Status: {response.status_code}")
            
            if response.status_code in [200, 201]:
                print("   ✅ User created successfully!")
                try:
                    data = response.json()
                    created_users.append({
                        'email': user_data['email'],
                        'password': user_data['password'],
                        'access_token': data.get('access'),
                        'user_id': data.get('user', {}).get('id')
                    })
                    print(f"   🎯 Access token: {data.get('access', 'None')[:20]}...")
                except:
                    print(f"   📝 Response: {response.text}")
                    
            elif response.status_code == 400:
                try:
                    error_data = response.json()
                    if 'already exists' in str(error_data):
                        print("   ℹ️  User already exists - that's fine!")
                        created_users.append({
                            'email': user_data['email'],
                            'password': user_data['password'],
                            'exists': True
                        })
                    else:
                        print(f"   ❌ Validation error: {error_data}")
                except:
                    print(f"   ❌ Error: {response.text}")
                    
            else:
                print(f"   ❌ Failed: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Request failed: {e}")
    
    return created_users

def test_created_users(created_users):
    """Test login for all created users"""
    print("\n🔐 TESTING LOGIN FOR CREATED USERS")
    print("="*60)
    
    successful_logins = []
    
    for user in created_users:
        if user.get('exists'):
            # Test existing user
            email = user['email']
            password = user['password']
        else:
            # Test newly created user
            email = user['email']
            password = user['password']
        
        print(f"\n🧪 Testing login: {email}")
        
        try:
            response = requests.post(
                f"{RENDER_URL}/api/v1/users/auth/login/",
                headers={'Content-Type': 'application/json'},
                json={
                    'email': email,
                    'password': password
                },
                timeout=30
            )
            
            print(f"   📨 Status: {response.status_code}")
            
            if response.status_code == 200:
                print("   ✅ LOGIN SUCCESSFUL!")
                try:
                    data = response.json()
                    successful_logins.append({
                        'email': email,
                        'password': password,
                        'access_token': data.get('access'),
                        'user_data': data.get('user')
                    })
                    print(f"   🎯 Token received: {data.get('access', 'None')[:20]}...")
                except:
                    print(f"   📝 Response: {response.text}")
            else:
                print("   ❌ Login failed")
                try:
                    error_data = response.json()
                    print(f"   📝 Error: {error_data}")
                except:
                    print(f"   📝 Error: {response.text}")
                    
        except Exception as e:
            print(f"   ❌ Login test failed: {e}")
    
    return successful_logins

def generate_test_credentials(successful_logins):
    """Generate test credentials file for frontend"""
    print("\n📋 GENERATING TEST CREDENTIALS")
    print("="*60)
    
    if not successful_logins:
        print("❌ No successful logins to generate credentials for")
        return
    
    credentials_content = f"""
# WORKING TEST CREDENTIALS FOR RENDER BACKEND
# Backend URL: {RENDER_URL}
# Generated: {__import__('time').strftime('%Y-%m-%d %H:%M:%S')}

## Use these credentials for testing your frontend:

"""
    
    for i, login in enumerate(successful_logins, 1):
        credentials_content += f"""
### Test User {i}:
- Email: {login['email']}
- Password: {login['password']}
- Sample Token: {login.get('access_token', 'N/A')[:50]}...

"""
    
    credentials_content += f"""
## Frontend Environment Variables:
```
VITE_API_URL={RENDER_URL}
VITE_BACKEND_URL={RENDER_URL}
```

## Frontend API Service Configuration:
```typescript
const API_BASE_URL = '{RENDER_URL}';
const LOGIN_ENDPOINT = '/api/v1/users/auth/login/';
```

## Sample Frontend Login Code:
```typescript
const loginUser = async (email: string, password: string) => {{
  try {{
    const response = await fetch('{RENDER_URL}/api/v1/users/auth/login/', {{
      method: 'POST',
      headers: {{
        'Content-Type': 'application/json',
      }},
      body: JSON.stringify({{ email, password }}),
    }});
    
    if (response.ok) {{
      const data = await response.json();
      return {{ success: true, data }};
    }} else {{
      const error = await response.json();
      return {{ success: false, error }};
    }}
  }} catch (error) {{
    return {{ success: false, error: 'Network error' }};
  }}
}};
```
"""
    
    try:
        with open('working_test_credentials.md', 'w') as f:
            f.write(credentials_content)
        print("💾 Credentials saved to 'working_test_credentials.md'")
        print(f"📝 {len(successful_logins)} working credential(s) documented")
    except Exception as e:
        print(f"❌ Failed to save credentials: {e}")
    
    # Also print to console
    print("\n" + "="*60)
    print("🔑 WORKING CREDENTIALS:")
    print("="*60)
    for login in successful_logins:
        print(f"Email: {login['email']}")
        print(f"Password: {login['password']}")
        print("-" * 30)

def main():
    """Main deployment function"""
    print("🚀 SCN ESG PLATFORM - RENDER USER DEPLOYMENT")
    print("="*80)
    print(f"🎯 Target Backend: {RENDER_URL}")
    print("="*80)
    
    # Step 1: Create users via API
    created_users = create_users_via_api()
    
    if not created_users:
        print("\n❌ No users were created. Please check backend status.")
        return
    
    # Step 2: Test login for created users
    successful_logins = test_created_users(created_users)
    
    # Step 3: Generate credentials documentation
    generate_test_credentials(successful_logins)
    
    # Summary
    print("\n" + "="*80)
    print("📊 DEPLOYMENT SUMMARY")
    print("="*80)
    
    if successful_logins:
        print(f"✅ SUCCESS! {len(successful_logins)} working user(s) created/verified")
        print("\n🎉 Your authentication should now work!")
        print("\n🔧 NEXT STEPS:")
        print("1. Check 'working_test_credentials.md' for exact credentials")
        print("2. Update your Vercel environment variables:")
        print(f"   VITE_API_URL={RENDER_URL}")
        print("3. Test login from your Vercel frontend")
        print("4. If still failing, check frontend API service configuration")
    else:
        print("❌ No working credentials created")
        print("\n🔧 TROUBLESHOOTING:")
        print("1. Check if Render backend is running")
        print("2. Verify database connection on Render")
        print("3. Check Render deployment logs")
    
    print("="*80)

if __name__ == '__main__':
    main()
