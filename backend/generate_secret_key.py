#!/usr/bin/env python
"""
Generate a secure Django secret key for Railway deployment
"""
from django.core.management.utils import get_random_secret_key

def generate_secret_key():
    """Generate a new Django secret key"""
    key = get_random_secret_key()
    print("🔐 Generated Django Secret Key:")
    print("="*50)
    print(key)
    print("="*50)
    print("\n📋 Copy this key to Railway environment variables:")
    print(f"DJANGO_SECRET_KEY={key}")
    print("\n⚠️  Keep this key secret and secure!")

if __name__ == '__main__':
    generate_secret_key()
