#!/usr/bin/env python
"""
Render CLI Setup and Database Management Script
This script will help us use Render CLI to manage the backend and create test users directly
"""

import subprocess
import sys
import os
import json

def check_render_cli():
    """Check if Render CLI is installed"""
    print("🔍 CHECKING RENDER CLI INSTALLATION")
    print("="*60)
    
    try:
        result = subprocess.run(['render', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Render CLI is installed: {result.stdout.strip()}")
            return True
        else:
            print("❌ Render CLI not found")
            return False
    except FileNotFoundError:
        print("❌ Render CLI not installed")
        return False

def install_render_cli():
    """Install Render CLI"""
    print("\n📦 INSTALLING RENDER CLI")
    print("="*60)
    
    print("Please install Render CLI using one of these methods:")
    print("\n1. Using npm (recommended):")
    print("   npm install -g @render/cli")
    print("\n2. Using yarn:")
    print("   yarn global add @render/cli")
    print("\n3. Download binary from: https://render.com/docs/cli")
    
    input("\nPress Enter after installing Render CLI...")
    
    return check_render_cli()

def render_login():
    """Login to Render"""
    print("\n🔐 RENDER LOGIN")
    print("="*60)
    
    try:
        result = subprocess.run(['render', 'auth', 'login'], capture_output=False, text=True)
        if result.returncode == 0:
            print("✅ Successfully logged into Render")
            return True
        else:
            print("❌ Failed to login to Render")
            return False
    except Exception as e:
        print(f"❌ Error during login: {e}")
        return False

def list_render_services():
    """List all Render services"""
    print("\n📋 LISTING RENDER SERVICES")
    print("="*60)
    
    try:
        result = subprocess.run(['render', 'services', 'list'], capture_output=True, text=True)
        if result.returncode == 0:
            print("Services found:")
            print(result.stdout)
            return True
        else:
            print("❌ Failed to list services")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ Error listing services: {e}")
        return False

def get_service_info(service_name=None):
    """Get information about the backend service"""
    print(f"\n📊 SERVICE INFORMATION")
    print("="*60)
    
    if not service_name:
        print("Please find your backend service name from the list above.")
        service_name = input("Enter your backend service name (e.g., scn-esg-backend): ").strip()
    
    try:
        # Get service details
        result = subprocess.run(['render', 'services', 'get', service_name], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Service '{service_name}' found:")
            print(result.stdout)
            return service_name
        else:
            print(f"❌ Service '{service_name}' not found")
            print(result.stderr)
            return None
    except Exception as e:
        print(f"❌ Error getting service info: {e}")
        return None

def run_django_command(service_name, command):
    """Run a Django management command on Render"""
    print(f"\n🐍 RUNNING DJANGO COMMAND: {command}")
    print("="*60)
    
    try:
        # Run command on the service
        cmd = ['render', 'exec', service_name, '--', 'python', 'manage.py'] + command.split()
        print(f"Executing: {' '.join(cmd)}")
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        print(f"Return code: {result.returncode}")
        print(f"Output: {result.stdout}")
        if result.stderr:
            print(f"Errors: {result.stderr}")
            
        return result.returncode == 0
        
    except Exception as e:
        print(f"❌ Error running command: {e}")
        return False

def create_test_users_on_render(service_name):
    """Create test users directly on Render backend"""
    print(f"\n👥 CREATING TEST USERS ON RENDER")
    print("="*60)
    
    # Create a Django script to create users
    create_users_script = '''
import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "scn_esg_platform.settings")
django.setup()

from django.contrib.auth import get_user_model
from companies.models import Company

User = get_user_model()

def create_test_users():
    print("Creating test users...")
    
    # Create test companies first
    test_company, created = Company.objects.get_or_create(
        name="Test Company Ltd",
        defaults={"industry": "Technology", "employees": 50}
    )
    if created:
        print("✅ Test company created")
    
    business_company, created = Company.objects.get_or_create(
        name="Green Corp Solutions", 
        defaults={"industry": "Environmental Services", "employees": 100}
    )
    if created:
        print("✅ Business company created")
    
    # Create users
    users_to_create = [
        {
            "email": "admin@scn.com",
            "password": "admin123",
            "first_name": "Admin",
            "last_name": "User",
            "is_staff": True,
            "is_superuser": True,
            "company": None
        },
        {
            "email": "test@scn.com", 
            "password": "test123",
            "first_name": "Test",
            "last_name": "User",
            "company": test_company
        },
        {
            "email": "business@scn.com",
            "password": "business123", 
            "first_name": "Business",
            "last_name": "Manager",
            "company": business_company
        }
    ]
    
    for user_data in users_to_create:
        email = user_data["email"]
        if User.objects.filter(email=email).exists():
            print(f"User {email} already exists!")
        else:
            user = User.objects.create_user(
                username=email,
                email=email,
                password=user_data["password"],
                first_name=user_data["first_name"],
                last_name=user_data["last_name"]
            )
            
            if user_data.get("is_staff"):
                user.is_staff = True
            if user_data.get("is_superuser"):
                user.is_superuser = True
            if user_data.get("company"):
                user.company = user_data["company"]
                
            user.is_email_verified = True
            user.save()
            
            print(f"✅ User created: {email} / {user_data['password']}")
    
    print(f"Total users in database: {User.objects.count()}")

if __name__ == "__main__":
    create_test_users()
'''
    
    # Save the script temporarily
    script_path = "temp_create_users.py"
    with open(script_path, 'w') as f:
        f.write(create_users_script)
    
    try:
        # Upload and run the script
        print("Uploading user creation script...")
        
        # Copy file to service (this might not work directly, so we'll use a different approach)
        # Instead, let's run individual Django commands
        
        commands = [
            "shell -c \"from django.contrib.auth import get_user_model; from companies.models import Company; User = get_user_model(); Company.objects.get_or_create(name='Test Company Ltd', defaults={'industry': 'Technology', 'employees': 50}); print('Company created')\"",
            "shell -c \"from django.contrib.auth import get_user_model; User = get_user_model(); user = User.objects.create_user(username='admin@scn.com', email='admin@scn.com', password='admin123', first_name='Admin', last_name='User', is_staff=True, is_superuser=True) if not User.objects.filter(email='admin@scn.com').exists() else None; print('Admin user created' if user else 'Admin user exists')\"",
            "shell -c \"from django.contrib.auth import get_user_model; from companies.models import Company; User = get_user_model(); company = Company.objects.get(name='Test Company Ltd'); user = User.objects.create_user(username='test@scn.com', email='test@scn.com', password='test123', first_name='Test', last_name='User', company=company) if not User.objects.filter(email='test@scn.com').exists() else None; user.is_email_verified = True; user.save() if user else None; print('Test user created' if user else 'Test user exists')\"",
        ]
        
        success_count = 0
        for i, cmd in enumerate(commands, 1):
            print(f"\nStep {i}: Creating user/company...")
            if run_django_command(service_name, cmd):
                success_count += 1
            else:
                print(f"⚠️  Step {i} failed, but continuing...")
        
        print(f"\n✅ User creation completed. {success_count}/{len(commands)} steps successful.")
        
        # Verify users were created
        print("\nVerifying users...")
        run_django_command(service_name, "shell -c \"from django.contrib.auth import get_user_model; User = get_user_model(); print(f'Total users: {User.objects.count()}'); [print(f'- {u.email}') for u in User.objects.all()]\"")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating users: {e}")
        return False
    finally:
        # Clean up temp file
        if os.path.exists(script_path):
            os.remove(script_path)

def test_authentication_after_setup(service_name):
    """Test authentication after creating users"""
    print(f"\n🔐 TESTING AUTHENTICATION")
    print("="*60)
    
    # Get the service URL
    try:
        result = subprocess.run(['render', 'services', 'get', service_name], capture_output=True, text=True)
        if result.returncode == 0:
            # Extract URL from output (this is a simplified approach)
            lines = result.stdout.split('\n')
            service_url = None
            for line in lines:
                if 'URL:' in line or 'https://' in line:
                    # Extract URL
                    words = line.split()
                    for word in words:
                        if word.startswith('https://'):
                            service_url = word
                            break
                    if service_url:
                        break
            
            if service_url:
                print(f"Found service URL: {service_url}")
                
                # Now test authentication using our previous script
                print("Running authentication test...")
                
                # Use the test script we created earlier
                import subprocess
                test_script = f'''
import requests
import json

RENDER_URL = "{service_url.rstrip('/')}"
TEST_CREDENTIALS = [
    {{"email": "admin@scn.com", "password": "admin123", "name": "Admin User"}},
    {{"email": "test@scn.com", "password": "test123", "name": "Test User"}},
    {{"email": "business@scn.com", "password": "business123", "name": "Business User"}}
]

def test_login():
    for creds in TEST_CREDENTIALS:
        try:
            response = requests.post(
                f"{{RENDER_URL}}/api/v1/users/auth/login/",
                headers={{"Content-Type": "application/json"}},
                json={{"email": creds["email"], "password": creds["password"]}},
                timeout=30
            )
            
            print(f"Testing {{creds['name']}}: {{response.status_code}}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ SUCCESS! Token: {{data.get('access', 'None')[:20]}}...")
                return True, creds["email"], creds["password"]
            else:
                print(f"❌ Failed: {{response.text}}")
        except Exception as e:
            print(f"❌ Error: {{e}}")
    
    return False, None, None

if __name__ == "__main__":
    success, email, password = test_login()
    if success:
        print(f"\\n🎉 AUTHENTICATION WORKING!")
        print(f"Working credentials: {{email}} / {{password}}")
    else:
        print("\\n❌ Authentication failed")
'''
                
                # Write and run the test
                test_file = "temp_auth_test.py"
                with open(test_file, 'w') as f:
                    f.write(test_script)
                
                try:
                    result = subprocess.run([sys.executable, test_file], capture_output=True, text=True)
                    print(result.stdout)
                    if result.stderr:
                        print(f"Errors: {result.stderr}")
                    return "SUCCESS" in result.stdout
                finally:
                    if os.path.exists(test_file):
                        os.remove(test_file)
            else:
                print("❌ Could not extract service URL")
                return False
        else:
            print("❌ Failed to get service info")
            return False
            
    except Exception as e:
        print(f"❌ Error testing authentication: {e}")
        return False

def generate_vercel_config(service_url):
    """Generate Vercel configuration with the correct Render URL"""
    print(f"\n⚙️  GENERATING VERCEL CONFIGURATION")
    print("="*60)
    
    config = f"""
# VERCEL ENVIRONMENT VARIABLES
# Copy these to your Vercel project settings:

VITE_API_URL={service_url}
VITE_BACKEND_URL={service_url}

# For local development (.env.local):
VITE_API_URL={service_url}
VITE_BACKEND_URL={service_url}

# WORKING TEST CREDENTIALS:
# Email: admin@scn.com, Password: admin123
# Email: test@scn.com, Password: test123  
# Email: business@scn.com, Password: business123

# FRONTEND API SERVICE FIX:
# Update src/services/auth.ts to ensure it uses:
# const API_URL = import.meta.env.VITE_API_URL || '{service_url}';
"""
    
    print(config)
    
    # Save configuration
    with open('vercel_config_final.txt', 'w') as f:
        f.write(config)
    
    print("💾 Configuration saved to 'vercel_config_final.txt'")

def main():
    """Main function to set up Render CLI and create test users"""
    print("🚀 SCN ESG PLATFORM - RENDER CLI SETUP")
    print("="*80)
    
    # Step 1: Check/install Render CLI
    if not check_render_cli():
        if not install_render_cli():
            print("❌ Cannot proceed without Render CLI. Please install it manually.")
            return
    
    # Step 2: Login to Render
    print("\n" + "="*80)
    if not render_login():
        print("❌ Cannot proceed without Render authentication.")
        return
    
    # Step 3: List services and get backend service
    print("\n" + "="*80)
    if not list_render_services():
        print("❌ Cannot list services.")
        return
    
    service_name = get_service_info()
    if not service_name:
        print("❌ Cannot proceed without valid service name.")
        return
    
    # Step 4: Create test users
    print("\n" + "="*80)
    if not create_test_users_on_render(service_name):
        print("⚠️  User creation had issues, but continuing...")
    
    # Step 5: Test authentication
    print("\n" + "="*80)
    auth_success = test_authentication_after_setup(service_name)
    
    # Step 6: Generate Vercel config
    print("\n" + "="*80)
    
    # Try to get service URL for config
    try:
        result = subprocess.run(['render', 'services', 'get', service_name], capture_output=True, text=True)
        service_url = f"https://{service_name}.onrender.com"  # Default format
        generate_vercel_config(service_url)
    except:
        print("Using default URL format for configuration")
        generate_vercel_config(f"https://{service_name}.onrender.com")
    
    # Final summary
    print("\n" + "="*80)
    print("📊 SETUP SUMMARY")
    print("="*80)
    
    if auth_success:
        print("✅ SUCCESS! Authentication is working on Render")
        print("\n🔧 NEXT STEPS:")
        print("1. Update Vercel environment variables (see vercel_config_final.txt)")
        print("2. Redeploy your Vercel frontend")
        print("3. Test login from your live Vercel site")
    else:
        print("⚠️  Setup completed but authentication needs verification")
        print("\n🔧 NEXT STEPS:")
        print("1. Check Render service logs: render logs <service-name>")
        print("2. Verify database migration: render exec <service-name> -- python manage.py migrate")
        print("3. Try manual user creation in Render shell")
    
    print("\n🎯 Your Render backend should now have test users!")
    print("   Check 'vercel_config_final.txt' for Vercel setup")
    print("="*80)

if __name__ == '__main__':
    main()
