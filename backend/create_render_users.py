"""
Quick script to create test users on Render deployment.
Run this after deployment or database reset.
"""

import os
import sys
import django

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scn_esg_platform.settings')
django.setup()

from django.contrib.auth import get_user_model
from companies.models import Company

User = get_user_model()

def create_test_users():
    """Create demo and test user accounts"""
    
    print("🔧 Creating test users for SCN ESG Platform...")
    print(f"📍 Database: {os.getenv('DATABASE_URL', 'SQLite (local)')[:50]}...")
    print()
    
    # Create test company
    company, created = Company.objects.get_or_create(
        name='Test Company Ltd',
        defaults={
            'industry': 'Technology',
            'employees': 50,
            'annual_revenue': 5000000
        }
    )
    if created:
        print(f"✅ Created company: {company.name}")
    else:
        print(f"ℹ️  Company already exists: {company.name}")
    
    # Create demo admin user
    demo_email = 'demo@scn.com'
    if not User.objects.filter(email=demo_email).exists():
        demo_user = User.objects.create_user(
            username=demo_email,
            email=demo_email,
            password='Demo1234!',
            first_name='Demo',
            last_name='Admin',
            is_staff=True,
            is_superuser=True
        )
        demo_user.is_email_verified = True
        demo_user.is_onboarding_complete = True
        demo_user.save()
        print(f"✅ Created admin user: {demo_email} / Demo1234!")
    else:
        print(f"ℹ️  User already exists: {demo_email}")
    
    # Create test regular user
    test_email = 'test@scn.com'
    if not User.objects.filter(email=test_email).exists():
        test_user = User.objects.create_user(
            username=test_email,
            email=test_email,
            password='Test1234!',
            first_name='Test',
            last_name='User',
            company=company.name
        )
        test_user.is_email_verified = True
        test_user.is_onboarding_complete = True
        test_user.role = 'sustainability_manager'
        test_user.save()
        print(f"✅ Created test user: {test_email} / Test1234!")
    else:
        print(f"ℹ️  User already exists: {test_email}")
    
    # Create business user
    business_email = 'business@scn.com'
    if not User.objects.filter(email=business_email).exists():
        business_user = User.objects.create_user(
            username=business_email,
            email=business_email,
            password='Business123!',
            first_name='Business',
            last_name='User',
            company=company.name
        )
        business_user.is_email_verified = True
        business_user.is_onboarding_complete = True
        business_user.role = 'decision_maker'
        business_user.save()
        print(f"✅ Created business user: {business_email} / Business123!")
    else:
        print(f"ℹ️  User already exists: {business_email}")
    
    print()
    print("=" * 60)
    print("✅ USER CREATION COMPLETE!")
    print("=" * 60)
    print()
    print("📋 Test Credentials:")
    print(f"   Admin:    demo@scn.com / Demo1234!")
    print(f"   Manager:  test@scn.com / Test1234!")
    print(f"   Business: business@scn.com / Business123!")
    print()
    print(f"🌐 Frontend: https://scn-esg.vercel.app")
    print(f"🔧 Backend:  https://scn-esg-backend.onrender.com")
    print()
    print("Total users in database:", User.objects.count())
    print()

if __name__ == '__main__':
    try:
        create_test_users()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
