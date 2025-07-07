#!/usr/bin/env python
"""
Comprehensive Railway 502 Error Diagnostic Script
This script helps diagnose why the Railway deployment is returning 502 errors
"""
import requests
import json
import time
from datetime import datetime

# Railway deployment URL
RAILWAY_URL = "https://scn-esg-production.up.railway.app"

def check_railway_status():
    """Check Railway deployment status and logs"""
    print("🚂 RAILWAY DEPLOYMENT DIAGNOSIS")
    print("="*50)
    
    print(f"🔍 Testing Railway URL: {RAILWAY_URL}")
    
    # Test basic connectivity
    try:
        response = requests.get(RAILWAY_URL, timeout=30)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response Headers: {dict(response.headers)}")
        print(f"   Response Body: {response.text[:500]}...")
        
        if response.status_code == 502:
            print("\n❌ 502 ERROR DETECTED!")
            print("This means the Railway edge can reach your app, but your Django app is not responding.")
            print("Common causes:")
            print("  1. Django app crashed during startup")
            print("  2. Missing environment variables")
            print("  3. Database connection issues")
            print("  4. Port binding issues")
            print("  5. Missing dependencies")
            
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT: Railway app is not responding within 30 seconds")
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Cannot reach Railway URL")
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {e}")

def test_django_requirements():
    """Test if all Django requirements are likely met"""
    print(f"\n📋 CHECKING DJANGO REQUIREMENTS")
    print("="*40)
    
    # Check if requirements.txt exists and what's in it
    try:
        with open('requirements.txt', 'r') as f:
            requirements = f.read()
            print("✅ requirements.txt found")
            print("Key packages found:")
            
            key_packages = ['django', 'djangorestframework', 'django-cors-headers', 
                          'psycopg2', 'gunicorn', 'whitenoise']
            
            for package in key_packages:
                if package.lower() in requirements.lower():
                    print(f"   ✅ {package}")
                else:
                    print(f"   ❌ {package} - MISSING!")
                    
    except FileNotFoundError:
        print("❌ requirements.txt not found!")

def check_railway_config():
    """Check Railway configuration files"""
    print(f"\n⚙️ CHECKING RAILWAY CONFIGURATION")
    print("="*40)
    
    # Check for Procfile or railway.json
    import os
    
    if os.path.exists('Procfile'):
        print("✅ Procfile found")
        with open('Procfile', 'r') as f:
            print(f"   Content: {f.read().strip()}")
    else:
        print("❌ Procfile not found")
        
    if os.path.exists('railway.json'):
        print("✅ railway.json found")
        with open('railway.json', 'r') as f:
            content = json.loads(f.read())
            print(f"   Content: {json.dumps(content, indent=2)}")
    else:
        print("❌ railway.json not found")
        
    if os.path.exists('nixpacks.toml'):
        print("✅ nixpacks.toml found")
        with open('nixpacks.toml', 'r') as f:
            print(f"   Content: {f.read()}")
    else:
        print("❌ nixpacks.toml not found")

def test_django_settings():
    """Test Django settings for production issues"""
    print(f"\n🔧 CHECKING DJANGO SETTINGS")
    print("="*35)
    
    try:
        # Try to import Django settings
        import os
        import sys
        
        # Add the current directory to Python path
        sys.path.append('.')
        
        # Set Django settings module
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scn_esg_platform.settings')
        
        import django
        django.setup()
        
        from django.conf import settings
        
        print("✅ Django settings loaded successfully")
        
        # Check critical settings
        print("🔍 Critical settings check:")
        
        print(f"   DEBUG: {getattr(settings, 'DEBUG', 'NOT SET')}")
        print(f"   ALLOWED_HOSTS: {getattr(settings, 'ALLOWED_HOSTS', 'NOT SET')}")
        print(f"   DATABASE ENGINE: {settings.DATABASES.get('default', {}).get('ENGINE', 'NOT SET')}")
        
        # Check for Railway-specific environment variables
        railway_vars = ['RAILWAY_ENVIRONMENT', 'PORT', 'DATABASE_URL']
        print("\n🚂 Railway environment variables:")
        for var in railway_vars:
            value = os.environ.get(var, 'NOT SET')
            if value != 'NOT SET':
                print(f"   ✅ {var}: {'*' * len(str(value))}")  # Hide actual values
            else:
                print(f"   ❌ {var}: NOT SET")
        
    except Exception as e:
        print(f"❌ Django settings error: {e}")
        print("This suggests Django cannot start properly")

def create_simple_test_server():
    """Create a simple test to verify basic Python/Django functionality"""
    print(f"\n🧪 CREATING SIMPLE TEST SERVER")
    print("="*35)
    
    test_server_code = '''
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class TestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        response = {
            "status": "ok",
            "message": "Simple test server is working",
            "python_version": sys.version,
            "environment_vars": list(os.environ.keys())[:10]  # First 10 env vars
        }
        
        self.wfile.write(json.dumps(response, indent=2).encode())

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    server = HTTPServer(('0.0.0.0', port), TestHandler)
    print(f"Test server starting on port {port}")
    server.serve_forever()
'''
    
    with open('test_server.py', 'w') as f:
        f.write(test_server_code)
    
    print("✅ Created test_server.py")
    print("📝 You can deploy this simple server to test if basic Python works on Railway")

def generate_fix_recommendations():
    """Generate step-by-step fix recommendations"""
    print(f"\n🔧 STEP-BY-STEP FIX RECOMMENDATIONS")
    print("="*45)
    
    recommendations = [
        {
            "step": 1,
            "title": "Check Railway Logs",
            "description": "Go to Railway dashboard > Your project > Deployments > View logs",
            "action": "Look for error messages during startup"
        },
        {
            "step": 2,
            "title": "Verify Environment Variables",
            "description": "Check Railway dashboard > Your project > Variables",
            "action": "Ensure DATABASE_URL, SECRET_KEY, DEBUG=False are set"
        },
        {
            "step": 3,
            "title": "Check Start Command",
            "description": "Verify your app is starting with the correct command",
            "action": "Should be: gunicorn scn_esg_platform.wsgi:application --bind 0.0.0.0:$PORT"
        },
        {
            "step": 4,
            "title": "Database Migration",
            "description": "Django might be failing due to unmigrated database",
            "action": "Run migrations in Railway console or add to start script"
        },
        {
            "step": 5,
            "title": "Dependencies",
            "description": "Missing Python packages",
            "action": "Verify requirements.txt includes all necessary packages"
        }
    ]
    
    for rec in recommendations:
        print(f"\n🔸 STEP {rec['step']}: {rec['title']}")
        print(f"   Description: {rec['description']}")
        print(f"   Action: {rec['action']}")

def create_railway_startup_script():
    """Create a proper Railway startup script"""
    print(f"\n📝 CREATING RAILWAY STARTUP SCRIPT")
    print("="*40)
    
    startup_script = '''#!/bin/bash
echo "🚂 Starting Railway Django App..."

# Set environment
export DJANGO_SETTINGS_MODULE=scn_esg_platform.settings

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run database migrations
echo "🗃️ Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if needed (optional)
# python manage.py createsuperuser --noinput --email admin@example.com || echo "Superuser already exists"

# Start the server
echo "🚀 Starting Gunicorn server..."
exec gunicorn scn_esg_platform.wsgi:application \\
    --bind 0.0.0.0:$PORT \\
    --workers 2 \\
    --timeout 120 \\
    --log-level info \\
    --access-logfile - \\
    --error-logfile -
'''
    
    with open('start.sh', 'w') as f:
        f.write(startup_script)
    
    print("✅ Created start.sh script")
    print("📝 Make this executable and use as Railway start command")

if __name__ == '__main__':
    print("🚨 RAILWAY 502 ERROR DIAGNOSTIC TOOL")
    print("="*50)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*50)
    
    check_railway_status()
    test_django_requirements()
    check_railway_config()
    test_django_settings()
    create_simple_test_server()
    generate_fix_recommendations()
    create_railway_startup_script()
    
    print("\n" + "="*50)
    print("🎯 NEXT STEPS:")
    print("="*50)
    print("1. Run this diagnostic script: python diagnose_railway_502.py")
    print("2. Check Railway dashboard logs for specific error messages")
    print("3. Verify environment variables in Railway dashboard")
    print("4. Consider deploying the simple test_server.py first")
    print("5. Use the generated start.sh script for proper startup")
    print("\n💡 The 502 error means Railway can't reach your Django app.")
    print("   This is usually a startup issue, not a networking issue.")
