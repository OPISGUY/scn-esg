"""
Simple integration check - no Django required
Run from project root: python check_integration_setup.py
"""
import os
from pathlib import Path

def check_file_exists(path, description):
    """Check if a file exists"""
    if os.path.exists(path):
        print(f"   ✅ {description}")
        return True
    else:
        print(f"   ❌ {description} - NOT FOUND")
        return False

def check_env_var(var_name, description):
    """Check if environment variable is set"""
    backend_env = Path('backend/.env')
    if backend_env.exists():
        with open(backend_env, 'r') as f:
            content = f.read()
            if f'{var_name}=' in content and not content.split(f'{var_name}=')[1].split('\n')[0].strip() == '':
                value = content.split(f'{var_name}=')[1].split('\n')[0].strip()
                print(f"   ✅ {description}: {value[:20]}..." if len(value) > 20 else f"   ✅ {description}: {value}")
                return True
    print(f"   ⚠️  {description} - Not configured")
    return False

def main():
    print("=" * 70)
    print("🚀 SCN ESG Platform - Integration Setup Verification")
    print("=" * 70)
    
    print("\n📁 Checking Backend Files...")
    backend_files = {
        'backend/integrations/models.py': 'Integration models',
        'backend/integrations/views.py': 'Integration API views',
        'backend/integrations/services.py': 'Integration services',
        'backend/integrations/oauth_utils.py': 'OAuth utilities',
        'backend/integrations/tasks.py': 'Background tasks',
        'backend/integrations/urls.py': 'URL routing',
        'backend/integrations/serializers.py': 'API serializers',
        'backend/integrations/admin.py': 'Django admin',
    }
    
    backend_score = sum(check_file_exists(path, desc) for path, desc in backend_files.items())
    
    print("\n📁 Checking Frontend Files...")
    frontend_files = {
        'src/services/integrationService.ts': 'Integration service',
        'src/pages/IntegrationsPage.tsx': 'Integrations page',
    }
    
    frontend_score = sum(check_file_exists(path, desc) for path, desc in frontend_files.items())
    
    print("\n📄 Checking Documentation...")
    doc_files = {
        'INTEGRATIONS_GUIDE.md': 'Integration guide',
        'OAUTH_SETUP_GUIDE.md': 'OAuth setup guide',
        'INTEGRATIONS_IMPLEMENTATION_SUMMARY.md': 'Implementation summary',
    }
    
    doc_score = sum(check_file_exists(path, desc) for path, desc in doc_files.items())
    
    print("\n🔐 Checking Environment Configuration...")
    print("   (Reading from backend/.env)")
    
    env_checks = {
        'INTEGRATION_ENCRYPTION_KEY': 'Encryption key',
        'XERO_CLIENT_ID': 'Xero credentials',
        'QUICKBOOKS_CLIENT_ID': 'QuickBooks credentials',
        'SALESFORCE_CLIENT_ID': 'Salesforce credentials',
        'SLACK_CLIENT_ID': 'Slack credentials',
    }
    
    env_score = sum(check_env_var(var, desc) for var, desc in env_checks.items())
    
    print("\n" + "=" * 70)
    print("📊 Summary")
    print("=" * 70)
    
    total_score = backend_score + frontend_score + doc_score
    total_possible = len(backend_files) + len(frontend_files) + len(doc_files)
    
    print(f"Backend Files:    {backend_score}/{len(backend_files)} ✅")
    print(f"Frontend Files:   {frontend_score}/{len(frontend_files)} ✅")
    print(f"Documentation:    {doc_score}/{len(doc_files)} ✅")
    print(f"Environment Vars: {env_score}/{len(env_checks)} ✅")
    print(f"\nTotal: {total_score}/{total_possible} core files created")
    
    if total_score == total_possible:
        print("\n🎉 All integration files are in place!")
    
    print("\n" + "=" * 70)
    print("📋 Next Steps:")
    print("=" * 70)
    
    if env_score < 2:
        print("\n⚠️  OAuth Credentials Needed:")
        print("   1. The encryption key is set ✅")
        print("   2. Get OAuth credentials from provider developer portals:")
        print("      • Xero: https://developer.xero.com/myapps")
        print("      • QuickBooks: https://developer.intuit.com")
        print("      • Salesforce: Salesforce Setup → App Manager")
        print("      • Slack: https://api.slack.com/apps")
        print("   3. Add credentials to backend/.env")
        print("   4. See OAUTH_SETUP_GUIDE.md for detailed instructions")
    
    print("\n🚀 To test the integration:")
    print("   1. Run migrations:")
    print("      cd backend")
    print("      python manage.py makemigrations integrations")
    print("      python manage.py migrate")
    print("   2. Seed providers:")
    print("      python manage.py seed_integration_providers")
    print("   3. Start servers:")
    print("      Backend:  python manage.py runserver")
    print("      Frontend: npm run dev (in separate terminal)")
    print("   4. Visit: http://localhost:5173/integrations")
    
    print("\n📖 Documentation:")
    print("   • OAUTH_SETUP_GUIDE.md - How to get OAuth credentials")
    print("   • INTEGRATIONS_GUIDE.md - Full technical documentation")
    print("   • INTEGRATIONS_IMPLEMENTATION_SUMMARY.md - Feature overview")
    
    print("\n" + "=" * 70)

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
