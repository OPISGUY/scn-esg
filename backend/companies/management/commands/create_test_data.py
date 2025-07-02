from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from companies.models import Company
from carbon.models import CarbonFootprint, OffsetPurchase, CarbonOffset
from ewaste.models import EwasteEntry
from decimal import Decimal
from datetime import date, timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Create comprehensive test data for ESG platform'

    def handle(self, *args, **options):
        # Create test company
        company, created = Company.objects.get_or_create(
            name='EcoTech Solutions',
            defaults={
                'industry': 'technology',
                'employees': 150,
            }
        )
        
        if created:
            self.stdout.write(f'Created company: {company.name}')
        
        # Create test user
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': 'test@ecotech.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'company': company,
                'role': 'admin',
            }
        )
        
        if created:
            user.set_password('testpass123')
            user.save()
            self.stdout.write(f'Created user: {user.username}')
        
        # Create carbon footprints (quarterly data)
        quarters = ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4']
        for quarter in quarters:
            footprint, created = CarbonFootprint.objects.get_or_create(
                company=company,
                reporting_period=quarter,
                defaults={
                    'scope1_emissions': Decimal(str(random.uniform(20, 40))),
                    'scope2_emissions': Decimal(str(random.uniform(30, 60))),
                    'scope3_emissions': Decimal(str(random.uniform(100, 150))),
                    'status': 'verified',
                }
            )
            if created:
                self.stdout.write(f'Created footprint: {quarter}')
        
        # Create e-waste entries
        device_types = ['laptop', 'desktop', 'monitor', 'tablet', 'smartphone']
        for i in range(10):
            device_type = random.choice(device_types)
            quantity = random.randint(1, 20)
            weight_per_device = {
                'laptop': 2.5, 'desktop': 8.0, 'monitor': 5.0, 
                'tablet': 0.7, 'smartphone': 0.2
            }
            
            entry, created = EwasteEntry.objects.get_or_create(
                company=company,
                device_type=device_type,
                quantity=quantity,
                weight_kg=Decimal(str(quantity * weight_per_device.get(device_type, 2.0))),
                donation_date=date.today() - timedelta(days=random.randint(1, 90)),
                defaults={
                    'status': random.choice(['pending', 'processed', 'completed']),
                }
            )
            if created:
                self.stdout.write(f'Created e-waste entry: {quantity} {device_type}(s)')
        
        # Create offset purchases
        offsets = CarbonOffset.objects.all()[:3]  # Use first 3 offsets
        for offset in offsets:
            purchase, created = OffsetPurchase.objects.get_or_create(
                company=company,
                offset=offset,
                quantity=random.randint(1, 10),
                defaults={
                    'status': 'completed',
                }
            )
            if created:
                self.stdout.write(f'Created purchase: {purchase.quantity} units of {offset.name}')
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created comprehensive test data!')
        )
        self.stdout.write(
            self.style.WARNING(f'Test user credentials: username=testuser, password=testpass123')
        )
