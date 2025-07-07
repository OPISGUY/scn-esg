#!/usr/bin/env python
"""
Debug script for production authentication issues.
This script creates test users and tests authentication in production.
"""
import os
import sys
import django

# Add the project directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scn_esg_platform.settings')
django.setup()

from django.contrib.auth import get_user_model, authenticate
from companies.models import Company
from django.db import connection

User = get_user_model()

def debug_database():
    """Debug database state and connectivity"""
    print("🔍 DEBUGGING PRODUCTION DATABASE")
    print("="*60)
    
    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✅ Database connection: OK")
    except Exception as e:
        print(f"❌ Database connection: FAILED - {e}")
        return False
    
    # Check existing users
    user_count = User.objects.count()
    print(f"📊 Total users in database: {user_count}")
    
    if user_count > 0:
        print("\n👥 Existing users:")
        for user in User.objects.all()[:10]:  # Show first 10 users
            print(f"   - {user.email} (active: {user.is_active}, verified: {user.is_email_verified})")
    
    # Check companies
    company_count = Company.objects.count()
    print(f"🏢 Total companies in database: {company_count}")
    
    return True

def create_production_test_users():
    """Create test users for production debugging"""
    print("\n🔧 CREATING TEST USERS")
    print("="*40)
    
    # Create test company
    test_company, created = Company.objects.get_or_create(
        name='Test Company Ltd',
        defaults={
            'industry': 'Technology',
            'employees': 50
        }
    )
    if created:
        print("✅ Test company created")
    else:
        print("📋 Test company already exists")
    
    # Create test users with known credentials
    test_users = [
        {
            'email': 'admin@test.com',
            'password': 'TestAdmin123!',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True
        },
        {
            'email': 'user@test.com',
            'password': 'TestUser123!',
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'sustainability_manager',
            'is_staff': False,
            'is_superuser': False
        }
    ]
    
    for user_data in test_users:
        email = user_data['email']
        
        if User.objects.filter(email=email).exists():
            print(f"📋 User {email} already exists")
            user = User.objects.get(email=email)
        else:
            user = User.objects.create_user(
                username=email,
                email=email,
                password=user_data['password'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                is_staff=user_data['is_staff'],
                is_superuser=user_data['is_superuser']
            )
            user.role = user_data['role']
            user.is_email_verified = True  # Skip email verification for testing
            user.company = test_company
            user.save()
            print(f"✅ User {email} created successfully")
        
        # Test authentication immediately
        auth_user = authenticate(username=email, password=user_data['password'])
        if auth_user:
            print(f"✅ Authentication test for {email}: SUCCESS")
        else:
            print(f"❌ Authentication test for {email}: FAILED")

def test_authentication():
    """Test authentication with various scenarios"""
    print("\n🔐 TESTING AUTHENTICATION")
    print("="*40)
    
    test_credentials = [
        ('admin@test.com', 'TestAdmin123!'),
        ('user@test.com', 'TestUser123!'),
        ('nonexistent@test.com', 'password'),
        ('admin@test.com', 'wrongpassword')
    ]
    
    for email, password in test_credentials:
        print(f"\n🧪 Testing: {email}")
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
            print(f"   User exists: ✅ (active: {user.is_active})")
        except User.DoesNotExist:
            print(f"   User exists: ❌")
            continue
        
        # Test authentication
        auth_user = authenticate(username=email, password=password)
        if auth_user:
            print(f"   Authentication: ✅")
        else:
            print(f"   Authentication: ❌")

def print_login_instructions():
    """Print login instructions for frontend testing"""
    print("\n" + "="*60)
    print("🎯 FRONTEND LOGIN TEST CREDENTIALS")
    print("="*60)
    print("Use these credentials to test login from the frontend:")
    print()
    print("1. Admin User:")
    print("   Email: admin@test.com")
    print("   Password: TestAdmin123!")
    print()
    print("2. Regular User:")
    print("   Email: user@test.com")
    print("   Password: TestUser123!")
    print()
    print("Frontend URL should point to your Railway backend:")
    print("Set VITE_API_URL to your Railway app URL")
    print("="*60)

def main():
    """Main debug function"""
    print("🚀 SCN ESG PLATFORM - PRODUCTION AUTH DEBUG")
    print("="*60)
    
    # Step 1: Debug database
    if not debug_database():
        return
    
    # Step 2: Create test users
    create_production_test_users()
    
    # Step 3: Test authentication
    test_authentication()
    
    # Step 4: Print instructions
    print_login_instructions()
    
    print("\n✅ Debug script completed successfully!")

if __name__ == '__main__':
    main()
