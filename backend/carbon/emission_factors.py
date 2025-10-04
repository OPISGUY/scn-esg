# backend/carbon/emission_factors.py
"""
Emission Factor Library for Smart Calculations

This module provides region-specific, industry-specific, and time-based emission factors
for accurate carbon footprint calculations.

Sources:
- US EPA eGRID (electricity grid emission factors)
- UK BEIS/DESNZ (Department for Energy Security and Net Zero)
- EU EEA (European Environment Agency)
- IPCC Guidelines for National Greenhouse Gas Inventories
- GHG Protocol emission factor databases
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class EmissionFactor(models.Model):
    """
    Stores emission factors for various activities, regions, and time periods
    
    Examples:
    - Electricity in California: 0.342 kg CO2/kWh (2025)
    - Electricity in Texas: 0.486 kg CO2/kWh (2025)
    - Natural gas combustion: 0.184 kg CO2/kWh (universal)
    - Gasoline combustion: 8.89 kg CO2/gallon (US)
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Activity classification
    activity_type = models.CharField(
        max_length=100,
        help_text="Type of activity: electricity, natural_gas, vehicle_fuel, etc."
    )
    sub_category = models.CharField(
        max_length=100,
        blank=True,
        help_text="Sub-category: grid_electricity, diesel, gasoline, etc."
    )
    
    # Geographic scope
    region_type = models.CharField(
        max_length=50,
        choices=[
            ('global', 'Global'),
            ('country', 'Country'),
            ('state', 'State/Province'),
            ('city', 'City'),
            ('utility', 'Utility Provider'),
        ],
        default='global'
    )
    region_code = models.CharField(
        max_length=50,
        blank=True,
        help_text="ISO country code, state abbreviation, or custom identifier"
    )
    region_name = models.CharField(
        max_length=200,
        help_text="Human-readable region name"
    )
    
    # Industry specificity
    industry_sector = models.CharField(
        max_length=100,
        blank=True,
        help_text="Industry sector if factor is industry-specific"
    )
    
    # Temporal validity
    year = models.IntegerField(
        validators=[MinValueValidator(2000), MaxValueValidator(2100)],
        help_text="Year this factor applies to"
    )
    valid_from = models.DateField(
        null=True,
        blank=True,
        help_text="Start date of validity period"
    )
    valid_until = models.DateField(
        null=True,
        blank=True,
        help_text="End date of validity period"
    )
    
    # Emission factor value
    factor_value = models.DecimalField(
        max_digits=12,
        decimal_places=6,
        validators=[MinValueValidator(0)],
        help_text="Emission factor value"
    )
    unit = models.CharField(
        max_length=50,
        help_text="Unit of emission factor (e.g., kg CO2/kWh, kg CO2e/gallon)"
    )
    
    # Greenhouse gas composition (for CO2e calculations)
    co2_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=100.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Percentage of emissions that are CO2"
    )
    ch4_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Percentage of emissions that are CH4 (methane)"
    )
    n2o_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Percentage of emissions that are N2O (nitrous oxide)"
    )
    
    # Metadata
    source = models.CharField(
        max_length=200,
        help_text="Data source (EPA, BEIS, EEA, etc.)"
    )
    source_url = models.URLField(
        blank=True,
        help_text="URL to original data source"
    )
    methodology = models.TextField(
        blank=True,
        help_text="Calculation methodology or notes"
    )
    confidence_level = models.CharField(
        max_length=20,
        choices=[
            ('high', 'High'),
            ('medium', 'Medium'),
            ('low', 'Low'),
            ('estimated', 'Estimated'),
        ],
        default='high'
    )
    
    # Usage tracking
    usage_count = models.IntegerField(
        default=0,
        help_text="Number of times this factor has been used in calculations"
    )
    is_default = models.BooleanField(
        default=False,
        help_text="Whether this is the default factor for this activity/region"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this factor is currently active and should be used"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-year', 'region_type', 'region_code', 'activity_type']
        indexes = [
            models.Index(fields=['activity_type', 'region_code', 'year']),
            models.Index(fields=['region_type', 'region_code']),
            models.Index(fields=['is_active', 'is_default']),
        ]
        unique_together = [
            ['activity_type', 'sub_category', 'region_code', 'year', 'industry_sector']
        ]
    
    def __str__(self):
        region_str = f" ({self.region_name})" if self.region_name != "Global" else ""
        industry_str = f" - {self.industry_sector}" if self.industry_sector else ""
        return f"{self.activity_type}{region_str}: {self.factor_value} {self.unit} ({self.year}){industry_str}"
    
    def increment_usage(self):
        """Track usage of this emission factor"""
        self.usage_count += 1
        self.save(update_fields=['usage_count'])


# Pre-defined emission factors (to be loaded as fixtures)
EMISSION_FACTOR_DATA = {
    # ========== ELECTRICITY (SCOPE 2) ==========
    'electricity': {
        'US_national': {
            'region_type': 'country',
            'region_code': 'US',
            'region_name': 'United States (National Average)',
            'factor_value': 0.4532,  # kg CO2e/kWh
            'unit': 'kg CO2e/kWh',
            'year': 2025,
            'source': 'US EPA eGRID 2024',
            'source_url': 'https://www.epa.gov/egrid',
            'confidence_level': 'high',
        },
        'US_California': {
            'region_type': 'state',
            'region_code': 'US-CA',
            'region_name': 'California',
            'factor_value': 0.342,
            'unit': 'kg CO2e/kWh',
            'year': 2025,
            'source': 'California Air Resources Board',
            'confidence_level': 'high',
        },
        'US_Texas': {
            'region_type': 'state',
            'region_code': 'US-TX',
            'region_name': 'Texas',
            'factor_value': 0.486,
            'unit': 'kg CO2e/kWh',
            'year': 2025,
            'source': 'ERCOT / EPA eGRID',
            'confidence_level': 'high',
        },
        'US_New_York': {
            'region_type': 'state',
            'region_code': 'US-NY',
            'region_name': 'New York',
            'factor_value': 0.293,
            'unit': 'kg CO2e/kWh',
            'year': 2025,
            'source': 'NYISO / EPA eGRID',
            'confidence_level': 'high',
        },
        'UK_national': {
            'region_type': 'country',
            'region_code': 'GB',
            'region_name': 'United Kingdom',
            'factor_value': 0.233,
            'unit': 'kg CO2e/kWh',
            'year': 2025,
            'source': 'UK DESNZ (Department for Energy Security and Net Zero)',
            'confidence_level': 'high',
        },
        'EU_Germany': {
            'region_type': 'country',
            'region_code': 'DE',
            'region_name': 'Germany',
            'factor_value': 0.420,
            'unit': 'kg CO2e/kWh',
            'year': 2025,
            'source': 'European Environment Agency',
            'confidence_level': 'high',
        },
        'EU_France': {
            'region_type': 'country',
            'region_code': 'FR',
            'region_name': 'France',
            'factor_value': 0.079,  # Very low due to nuclear power
            'unit': 'kg CO2e/kWh',
            'year': 2025,
            'source': 'European Environment Agency',
            'confidence_level': 'high',
        },
    },
    
    # ========== NATURAL GAS (SCOPE 1) ==========
    'natural_gas': {
        'global_combustion': {
            'region_type': 'global',
            'region_code': '',
            'region_name': 'Global',
            'factor_value': 0.184,  # kg CO2/kWh
            'unit': 'kg CO2/kWh',
            'year': 2025,
            'source': 'IPCC Guidelines',
            'confidence_level': 'high',
        },
        'global_upstream': {
            'region_type': 'global',
            'region_code': '',
            'region_name': 'Global',
            'sub_category': 'upstream_leakage',
            'factor_value': 0.030,  # kg CO2e/kWh (methane leakage)
            'unit': 'kg CO2e/kWh',
            'year': 2025,
            'source': 'IPCC Guidelines',
            'confidence_level': 'medium',
            'ch4_percentage': 85.00,
            'co2_percentage': 15.00,
        },
    },
    
    # ========== VEHICLE FUEL (SCOPE 1) ==========
    'vehicle_fuel': {
        'gasoline_US': {
            'region_type': 'country',
            'region_code': 'US',
            'region_name': 'United States',
            'sub_category': 'gasoline',
            'factor_value': 8.89,  # kg CO2/gallon
            'unit': 'kg CO2/gallon',
            'year': 2025,
            'source': 'US EPA',
            'confidence_level': 'high',
        },
        'diesel_US': {
            'region_type': 'country',
            'region_code': 'US',
            'region_name': 'United States',
            'sub_category': 'diesel',
            'factor_value': 10.21,  # kg CO2/gallon
            'unit': 'kg CO2/gallon',
            'year': 2025,
            'source': 'US EPA',
            'confidence_level': 'high',
        },
        'gasoline_by_mile': {
            'region_type': 'global',
            'region_code': '',
            'region_name': 'Global',
            'sub_category': 'gasoline_vehicle',
            'factor_value': 0.368,  # kg CO2/mile (average car)
            'unit': 'kg CO2/mile',
            'year': 2025,
            'source': 'IPCC Guidelines',
            'confidence_level': 'medium',
        },
        'diesel_by_mile': {
            'region_type': 'global',
            'region_code': '',
            'region_name': 'Global',
            'sub_category': 'diesel_vehicle',
            'factor_value': 0.398,  # kg CO2/mile (average car)
            'unit': 'kg CO2/mile',
            'year': 2025,
            'source': 'IPCC Guidelines',
            'confidence_level': 'medium',
        },
    },
    
    # ========== AIR TRAVEL (SCOPE 3) ==========
    'air_travel': {
        'domestic_short': {
            'region_type': 'global',
            'region_code': '',
            'region_name': 'Global',
            'sub_category': 'domestic_short_haul',
            'factor_value': 0.255,  # kg CO2e/passenger-mile
            'unit': 'kg CO2e/passenger-mile',
            'year': 2025,
            'source': 'ICAO Carbon Emissions Calculator',
            'confidence_level': 'high',
        },
        'international_long': {
            'region_type': 'global',
            'region_code': '',
            'region_name': 'Global',
            'sub_category': 'international_long_haul',
            'factor_value': 0.195,  # kg CO2e/passenger-mile (more efficient per mile)
            'unit': 'kg CO2e/passenger-mile',
            'year': 2025,
            'source': 'ICAO Carbon Emissions Calculator',
            'confidence_level': 'high',
        },
    },
}


def load_default_emission_factors():
    """
    Load default emission factors into database
    This should be called during initial setup or migration
    """
    from django.db import transaction
    
    with transaction.atomic():
        for activity_type, factors in EMISSION_FACTOR_DATA.items():
            for key, data in factors.items():
                # Check if factor already exists
                existing = EmissionFactor.objects.filter(
                    activity_type=activity_type,
                    region_code=data['region_code'],
                    year=data['year'],
                    sub_category=data.get('sub_category', '')
                ).first()
                
                if not existing:
                    EmissionFactor.objects.create(
                        activity_type=activity_type,
                        sub_category=data.get('sub_category', ''),
                        region_type=data['region_type'],
                        region_code=data['region_code'],
                        region_name=data['region_name'],
                        year=data['year'],
                        factor_value=data['factor_value'],
                        unit=data['unit'],
                        source=data['source'],
                        source_url=data.get('source_url', ''),
                        confidence_level=data['confidence_level'],
                        co2_percentage=data.get('co2_percentage', 100.00),
                        ch4_percentage=data.get('ch4_percentage', 0.00),
                        n2o_percentage=data.get('n2o_percentage', 0.00),
                        is_default=True,
                        is_active=True,
                    )
                    print(f"✅ Created emission factor: {activity_type} - {data['region_name']}")
                else:
                    print(f"ℹ️  Emission factor already exists: {activity_type} - {data['region_name']}")
