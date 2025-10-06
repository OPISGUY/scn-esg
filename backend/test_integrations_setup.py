"""
Quick test script to verify integrations setup
Run from backend directory: python test_integrations_setup.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scn_esg_platform.settings')
django.setup()

from integrations.models import IntegrationProvider, IntegrationConnection
from django.conf import settings

def test_encryption_key():
    """Test if encryption key is set"""
    print("🔑 Testing Encryption Key...")
    key = getattr(settings, 'INTEGRATION_ENCRYPTION_KEY', None)
    if key:
        print(f"   ✅ Encryption key is set: {key[:10]}...{key[-10:]}")
        return True
    else:
        print("   ❌ INTEGRATION_ENCRYPTION_KEY not found in settings")
        return False

def test_providers_seeded():
    """Test if providers are seeded in database"""
    print("\n🌱 Testing Providers...")
    count = IntegrationProvider.objects.count()
    if count > 0:
        print(f"   ✅ Found {count} integration providers:")
        for provider in IntegrationProvider.objects.all():
            status = "🟢" if provider.is_active else "🔴"
            beta = "🔶 BETA" if provider.is_beta else ""
            print(f"      {status} {provider.display_name} ({provider.category}) {beta}")
        return True
    else:
        print("   ❌ No providers found. Run: python manage.py seed_integration_providers")
        return False

def test_oauth_credentials():
    """Test if OAuth credentials are configured"""
    print("\n🔐 Testing OAuth Credentials...")
    
    credentials_to_check = {
        'Xero': ['XERO_CLIENT_ID', 'XERO_CLIENT_SECRET'],
        'QuickBooks': ['QUICKBOOKS_CLIENT_ID', 'QUICKBOOKS_CLIENT_SECRET'],
        'Salesforce': ['SALESFORCE_CLIENT_ID', 'SALESFORCE_CLIENT_SECRET'],
        'Slack': ['SLACK_CLIENT_ID', 'SLACK_CLIENT_SECRET'],
        'AWS': ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
    }
    
    configured = []
    missing = []
    
    for platform, keys in credentials_to_check.items():
        all_set = all(os.getenv(key) for key in keys)
        if all_set:
            configured.append(platform)
            print(f"   ✅ {platform} credentials configured")
        else:
            missing.append(platform)
            print(f"   ⚠️  {platform} credentials missing")
    
    print(f"\n   Summary: {len(configured)}/{len(credentials_to_check)} platforms configured")
    if missing:
        print(f"   Missing: {', '.join(missing)}")
        print(f"   See OAUTH_SETUP_GUIDE.md for setup instructions")
    
    return len(configured) > 0

def test_connections():
    """Test if any connections exist"""
    print("\n🔗 Testing Connections...")
    count = IntegrationConnection.objects.count()
    if count > 0:
        print(f"   ✅ Found {count} active connections:")
        for conn in IntegrationConnection.objects.all():
            status_emoji = {
                'active': '🟢',
                'error': '🔴',
                'expired': '🟡',
                'disconnected': '⚫',
                'pending': '🔵'
            }.get(conn.status, '⚪')
            print(f"      {status_emoji} {conn.provider.display_name} - {conn.status}")
        return True
    else:
        print("   ℹ️  No connections yet (this is normal for new setup)")
        print("   Visit /integrations page to connect platforms")
        return True

def test_app_in_settings():
    """Test if integrations app is in INSTALLED_APPS"""
    print("\n⚙️  Testing Django Configuration...")
    if 'integrations' in settings.INSTALLED_APPS:
        print("   ✅ 'integrations' app is in INSTALLED_APPS")
        return True
    else:
        print("   ❌ 'integrations' app not in INSTALLED_APPS")
        print("   Add 'integrations' to INSTALLED_APPS in settings.py")
        return False

def main():
    print("=" * 60)
    print("🚀 SCN ESG Platform - Integrations Setup Test")
    print("=" * 60)
    
    results = {
        'Django Configuration': test_app_in_settings(),
        'Encryption Key': test_encryption_key(),
        'Providers Seeded': test_providers_seeded(),
        'OAuth Credentials': test_oauth_credentials(),
        'Connections': test_connections(),
    }
    
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test}")
    
    print(f"\n{passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Your integration setup is complete!")
        print("\nNext steps:")
        print("1. Start Django server: python manage.py runserver")
        print("2. Start frontend: npm run dev")
        print("3. Visit http://localhost:5173/integrations")
        print("4. Click 'Connect' on any platform to test OAuth flow")
    else:
        print("\n⚠️  Some tests failed. Please review the output above.")
        print("\nFor help, see:")
        print("- INTEGRATIONS_GUIDE.md (technical details)")
        print("- OAUTH_SETUP_GUIDE.md (OAuth credential setup)")

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error running tests: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
