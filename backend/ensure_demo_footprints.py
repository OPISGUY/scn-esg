#!/usr/bin/env python
"""
Ensure demo users have carbon footprints for testing
Run this on the backend after deployment
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scn_esg_platform.settings')
django.setup()

from django.contrib.auth import get_user_model
from carbon.models import CarbonFootprint
from datetime import datetime

User = get_user_model()

def ensure_demo_footprints():
    """Ensure all demo users have at least one carbon footprint"""
    
    demo_emails = ['demo@scn.com', 'test@scn.com', 'business@scn.com']
    
    print("🔍 Checking demo user footprints...")
    print("=" * 60)
    
    for email in demo_emails:
        try:
            user = User.objects.get(email=email)
            print(f"\n📧 User: {email}")
            print(f"   Company: {user.company.name if user.company else 'NO COMPANY!'}")
            
            if not user.company:
                print(f"   ⚠️  WARNING: User has no company - cannot create footprint")
                continue
            
            # Check existing footprints
            footprints = CarbonFootprint.objects.filter(company=user.company)
            count = footprints.count()
            print(f"   Existing footprints: {count}")
            
            if count == 0:
                # Create a draft footprint
                footprint = CarbonFootprint.objects.create(
                    company=user.company,
                    reporting_period=str(datetime.now().year),
                    scope1_emissions=100.0,  # Sample data
                    scope2_emissions=200.0,
                    scope3_emissions=300.0,
                    status='draft',
                    notes='Auto-generated demo footprint'
                )
                print(f"   ✅ Created new footprint: {footprint.id}")
            else:
                latest = footprints.order_by('-created_at').first()
                print(f"   ✅ Latest footprint: {latest.id}")
                print(f"      Period: {latest.reporting_period}")
                print(f"      Status: {latest.status}")
                print(f"      Total: {latest.total_emissions} tCO2e")
                
        except User.DoesNotExist:
            print(f"\n❌ User {email} not found")
        except Exception as e:
            print(f"\n💥 Error for {email}: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Demo footprint check complete")

if __name__ == '__main__':
    ensure_demo_footprints()
