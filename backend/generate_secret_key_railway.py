#!/usr/bin/env python
"""
Generate a secure Django secret key for Railway deployment
"""
import secrets
import string

def generate_django_secret_key():
    """Generate a secure 50-character secret key for Django"""
    characters = string.ascii_letters + string.digits + '!@#$%^&*(-_=+)'
    return ''.join(secrets.choice(characters) for _ in range(50))

if __name__ == '__main__':
    print("🔐 Django Secret Key Generator")
    print("="*40)
    
    secret_key = generate_django_secret_key()
    
    print(f"Your secure secret key:")
    print(f"DJANGO_SECRET_KEY={secret_key}")
    print("\n🚨 IMPORTANT:")
    print("1. Copy this key to Railway dashboard > Variables")
    print("2. Never share this key publicly")
    print("3. Use this exact key in your Railway environment variables")
    print("\n✅ Add this to Railway:")
    print(f"Variable Name: DJANGO_SECRET_KEY")
    print(f"Variable Value: {secret_key}")
