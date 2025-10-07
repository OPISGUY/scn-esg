"""
Pytest configuration for Django tests
"""
import os
import sys
import django
from pathlib import Path

def pytest_configure(config):
    """Configure Django settings for pytest"""
    # Add backend directory to Python path
    backend_dir = Path(__file__).parent / 'backend'
    sys.path.insert(0, str(backend_dir))
    
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scn_esg_platform.settings')
    django.setup()
