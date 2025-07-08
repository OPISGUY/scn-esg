#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scn_esg_platform.settings')
django.setup()

from django.contrib.auth import get_user_model
from companies.models import Company

User = get_user_model()

def create_test_users():
    print("Creating test users...")
    
    # Create test companies first
    test_company, created = Company.objects.get_or_create(
        name='Test Company Ltd',
        defaults={
            'industry': 'Technology',
            'employees': 50
        }
    )
    if created:
        print("✅ Test company created")
    
    business_company, created = Company.objects.get_or_create(
        name='Green Corp Solutions',
        defaults={
            'industry': 'Environmental Services',
            'employees': 100
        }
    )
    if created:
        print("✅ Business company created")
    
    # Check if users already exist
    if User.objects.filter(email='admin@scn.com').exists():
        print("Admin user already exists!")
    else:
        # Create admin user with properly hashed password
        admin_user = User.objects.create_user(
            username='admin@scn.com',
            email='admin@scn.com',
            password='admin123',  # This will be properly hashed by create_user
            first_name='Admin',
            last_name='User',
            is_staff=True,
            is_superuser=True
        )
        admin_user.is_email_verified = True
        admin_user.save()
        print("✅ Admin user created: admin@scn.com / admin123")

    if User.objects.filter(email='test@scn.com').exists():
        print("Test user already exists!")
    else:
        # Create regular test user
        test_user = User.objects.create_user(
            username='test@scn.com',
            email='test@scn.com',
            first_name='Test',
            last_name='User',
            password='test123',
            company=test_company
        )
        test_user.is_email_verified = True
        test_user.save()
        print("✅ Test user created: test@scn.com / test123")

    if User.objects.filter(email='business@scn.com').exists():
        print("Business user already exists!")
    else:
        # Create business user
        business_user = User.objects.create_user(
            username='business@scn.com',
            email='business@scn.com',
            first_name='Business',
            last_name='Manager',
            password='business123',
            company=business_company
        )
        business_user.is_email_verified = True
        business_user.save()
        print("✅ Business user created: business@scn.com / business123")

    print("\n" + "="*60)
    print("🔑 TEST LOGIN CREDENTIALS:")
    print("="*60)
    print("1. Admin User:")
    print("   Email: admin@scn.com")
    print("   Password: admin123")
    print("   Access: Full admin access")
    print()
    print("2. Regular User:")
    print("   Email: test@scn.com")
    print("   Password: test123")
    print("   Access: Standard user access")
    print()
    print("3. Business User:")
    print("   Email: business@scn.com")
    print("   Password: business123")
    print("   Access: Standard user access")
    print("="*60)
    print(f"Total users in database: {User.objects.count()}")

if __name__ == '__main__':
    create_test_users()
