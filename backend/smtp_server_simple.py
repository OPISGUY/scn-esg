"""
Alternative SMTP Debug Server for Email Testing
Run: python backend/smtp_server_simple.py

Uses Python's built-in debugging SMTP server
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scn_esg_platform.settings')

import django
django.setup()

from django.core.management import execute_from_command_line

print("""
╔═══════════════════════════════════════════════════════════════════╗
║           SCN ESG Platform - SMTP Debug Server                   ║
║           (Using Django's Built-in SMTP Server)                  ║
╚═══════════════════════════════════════════════════════════════════╝

📡 SMTP Server Configuration:
   Host: localhost
   Port: 1025
   
✅ Emails will be printed to this console

🚀 Server Status: STARTING...

Press Ctrl+C to stop the server
═══════════════════════════════════════════════════════════════════
""")

# Start Django's development SMTP server
sys.argv = ['manage.py', 'runserver', '--noreload', '0.0.0.0:1025']
execute_from_command_line(['manage.py', 'sendtestemail', '--help'])
