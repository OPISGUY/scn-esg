from django.core.management.base import BaseCommand
from carbon.models import CarbonOffset
from decimal import Decimal


class Command(BaseCommand):
    help = 'Create initial carbon offset marketplace data'

    def handle(self, *args, **options):
        # Create sample carbon offsets
        offsets_data = [
            {
                'name': 'Renewable Energy Credits - Wind Farm',
                'type': 'Wind Energy',
                'price_per_tonne': Decimal('15.50'),
                'co2_offset_per_unit': Decimal('1.0'),
                'description': 'Support wind energy projects that replace fossil fuel-based electricity generation.',
                'available_quantity': 1000,
                'category': 'renewable',
                'verification_standard': 'Verified Carbon Standard (VCS)',
            },
            {
                'name': 'Forest Conservation - Amazon Basin',
                'type': 'Forest Protection',
                'price_per_tonne': Decimal('22.00'),
                'co2_offset_per_unit': Decimal('1.0'),
                'description': 'Protect existing forests from deforestation and degradation.',
                'available_quantity': 500,
                'category': 'forestry',
                'verification_standard': 'Forest Stewardship Council (FSC)',
            },
            {
                'name': 'Methane Capture - Landfill Gas',
                'type': 'Methane Reduction',
                'price_per_tonne': Decimal('18.75'),
                'co2_offset_per_unit': Decimal('1.0'),
                'description': 'Capture and destroy methane emissions from landfills.',
                'available_quantity': 750,
                'category': 'methane',
                'verification_standard': 'Climate Action Reserve (CAR)',
            },
            {
                'name': 'Reforestation - Tropical Restoration',
                'type': 'Tree Planting',
                'price_per_tonne': Decimal('25.00'),
                'co2_offset_per_unit': Decimal('1.0'),
                'description': 'Plant native trees in degraded tropical landscapes.',
                'available_quantity': 300,
                'category': 'forestry',
                'verification_standard': 'Gold Standard',
            },
            {
                'name': 'Solar Energy Projects - Developing Countries',
                'type': 'Solar Energy',
                'price_per_tonne': Decimal('16.25'),
                'co2_offset_per_unit': Decimal('1.0'),
                'description': 'Support solar energy infrastructure in developing regions.',
                'available_quantity': 1200,
                'category': 'renewable',
                'verification_standard': 'CDM (Clean Development Mechanism)',
            },
            {
                'name': 'Carbon Capture Technology',
                'type': 'Direct Air Capture',
                'price_per_tonne': Decimal('45.00'),
                'co2_offset_per_unit': Decimal('1.0'),
                'description': 'Advanced technology to remove CO2 directly from the atmosphere.',
                'available_quantity': 100,
                'category': 'technology',
                'verification_standard': 'Verified Carbon Standard (VCS)',
            },
        ]

        created_count = 0
        for offset_data in offsets_data:
            offset, created = CarbonOffset.objects.get_or_create(
                name=offset_data['name'],
                defaults=offset_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created offset: {offset.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Offset already exists: {offset.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} carbon offsets')
        )
