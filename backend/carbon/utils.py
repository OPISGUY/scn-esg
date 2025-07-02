"""
Carbon calculation utilities for ESG platform
"""
from decimal import Decimal
from typing import Dict, List
from django.db.models import Sum, Q
from django.contrib.auth import get_user_model

User = get_user_model()


def calculate_company_carbon_balance(company) -> Dict:
    """
    Calculate the complete carbon balance for a company
    """
    from carbon.models import CarbonFootprint, OffsetPurchase
    from ewaste.models import EwasteEntry
    
    # Get latest carbon footprint
    latest_footprint = CarbonFootprint.objects.filter(
        company=company,
        status='verified'
    ).order_by('-created_at').first()
    
    total_emissions = Decimal('0')
    if latest_footprint:
        total_emissions = latest_footprint.total_emissions
    
    # Calculate total offsets purchased
    purchased_offsets = OffsetPurchase.objects.filter(
        company=company,
        status='completed'
    ).aggregate(
        total_co2_offset=Sum('total_co2_offset')
    )['total_co2_offset'] or Decimal('0')
    
    # Calculate carbon credits from e-waste donations
    ewaste_credits = EwasteEntry.objects.filter(
        company=company,
        status__in=['processed', 'completed']
    ).aggregate(
        total_credits=Sum('carbon_credits_generated')
    )['total_credits'] or Decimal('0')
    
    # Calculate net carbon balance
    total_offsets = purchased_offsets + ewaste_credits
    net_emissions = total_emissions - total_offsets
    
    # Calculate carbon neutrality percentage
    neutrality_percentage = Decimal('0')
    if total_emissions > 0:
        neutrality_percentage = min((total_offsets / total_emissions) * 100, Decimal('100'))
    
    return {
        'gross_emissions': float(total_emissions),
        'purchased_offsets': float(purchased_offsets),
        'ewaste_credits': float(ewaste_credits),
        'total_offsets': float(total_offsets),
        'net_emissions': float(net_emissions),
        'neutrality_percentage': float(neutrality_percentage),
        'is_carbon_neutral': net_emissions <= 0,
        'latest_footprint_date': latest_footprint.created_at if latest_footprint else None,
    }


def calculate_carbon_footprint(data: Dict) -> Dict:
    """
    Calculate carbon footprint from input data
    Enhanced with industry-specific factors
    """
    # Industry-specific emission factors (tCO2e per employee per year)
    industry_factors = {
        'technology': Decimal('2.5'),
        'manufacturing': Decimal('8.2'),
        'finance': Decimal('1.8'),
        'healthcare': Decimal('3.4'),
        'retail': Decimal('4.1'),
        'construction': Decimal('6.7'),
        'transportation': Decimal('12.3'),
        'energy': Decimal('15.8'),
        'agriculture': Decimal('5.9'),
        'other': Decimal('4.0'),
    }
    
    # Get base values
    scope1 = Decimal(str(data.get('scope1_emissions', 0)))
    scope2 = Decimal(str(data.get('scope2_emissions', 0)))
    scope3 = Decimal(str(data.get('scope3_emissions', 0)))
    
    # If minimal data provided, estimate based on industry and employees
    if scope1 + scope2 + scope3 == 0:
        industry = data.get('industry', 'other').lower()
        employees = data.get('employees', 0)
        
        if employees > 0:
            industry_factor = industry_factors.get(industry, industry_factors['other'])
            estimated_total = industry_factor * Decimal(str(employees))
            
            # Typical distribution: Scope 1 (20%), Scope 2 (30%), Scope 3 (50%)
            scope1 = estimated_total * Decimal('0.20')
            scope2 = estimated_total * Decimal('0.30')
            scope3 = estimated_total * Decimal('0.50')
    
    total = scope1 + scope2 + scope3
    
    return {
        'scope1_emissions': float(scope1),
        'scope2_emissions': float(scope2),
        'scope3_emissions': float(scope3),
        'total_emissions': float(total),
        'calculation_method': 'estimated' if scope1 + scope2 + scope3 == total else 'provided',
    }


def calculate_ewaste_impact(device_type: str, quantity: int, weight_kg: Decimal) -> Dict:
    """
    Calculate environmental impact of e-waste donation
    """
    # Enhanced CO2 savings factors (kg CO2 saved per kg of device)
    co2_factors = {
        'laptop': Decimal('0.35'),      # Updated factor
        'desktop': Decimal('0.28'),     # Updated factor
        'monitor': Decimal('0.22'),     # Updated factor
        'tablet': Decimal('0.45'),      # Updated factor
        'smartphone': Decimal('0.58'),  # Updated factor
        'printer': Decimal('0.18'),     # Updated factor
        'server': Decimal('0.25'),      # Updated factor
        'other': Decimal('0.25'),       # Updated factor
    }
    
    # Students supported calculation (devices per student)
    students_per_device = {
        'laptop': 1,        # 1 laptop = 1 student
        'desktop': 1,       # 1 desktop = 1 student
        'monitor': 0.5,     # 2 monitors = 1 student
        'tablet': 0.8,      # 1.25 tablets = 1 student
        'smartphone': 0.3,  # 3.33 smartphones = 1 student
        'printer': 0.1,     # 10 printers = 1 student
        'server': 5,        # 1 server = 5 students
        'other': 0.5,       # 2 other devices = 1 student
    }
    
    factor = co2_factors.get(device_type, co2_factors['other'])
    co2_saved = weight_kg * factor
    
    # Carbon credits are 85% of CO2 saved (accounting for processing)
    carbon_credits = co2_saved * Decimal('0.85')
    
    # Calculate students supported
    student_factor = students_per_device.get(device_type, students_per_device['other'])
    students_supported = int(quantity * student_factor)
    
    return {
        'estimated_co2_saved': float(co2_saved),
        'carbon_credits_generated': float(carbon_credits),
        'students_supported': students_supported,
        'environmental_impact_score': float(co2_saved * Decimal('10')),  # Impact score (0-100)
    }


def get_dashboard_analytics(company) -> Dict:
    """
    Calculate comprehensive dashboard analytics for a company
    """
    from carbon.models import CarbonFootprint, OffsetPurchase
    from ewaste.models import EwasteEntry
    
    # Carbon balance
    carbon_balance = calculate_company_carbon_balance(company)
    
    # E-waste statistics
    ewaste_stats = EwasteEntry.objects.filter(company=company).aggregate(
        total_devices=Sum('quantity'),
        total_weight=Sum('weight_kg'),
        total_co2_saved=Sum('estimated_co2_saved'),
        total_students=Sum('quantity')  # Simplified calculation
    )
    
    # Recent activity
    recent_footprints = CarbonFootprint.objects.filter(
        company=company
    ).order_by('-created_at')[:5]
    
    recent_purchases = OffsetPurchase.objects.filter(
        company=company
    ).order_by('-purchase_date')[:5]
    
    recent_ewaste = EwasteEntry.objects.filter(
        company=company
    ).order_by('-created_at')[:5]
    
    return {
        'carbon_balance': carbon_balance,
        'ewaste_stats': {
            'total_devices_donated': ewaste_stats['total_devices'] or 0,
            'total_weight_kg': float(ewaste_stats['total_weight'] or 0),
            'total_co2_saved': float(ewaste_stats['total_co2_saved'] or 0),
            'estimated_students_supported': ewaste_stats['total_students'] or 0,
        },
        'recent_activity': {
            'recent_footprints': [
                {
                    'id': str(fp.id),
                    'period': fp.reporting_period,
                    'total_emissions': float(fp.total_emissions),
                    'status': fp.status,
                    'created_at': fp.created_at.isoformat(),
                } for fp in recent_footprints
            ],
            'recent_purchases': [
                {
                    'id': str(op.id),
                    'offset_name': op.offset.name,
                    'quantity': op.quantity,
                    'total_price': float(op.total_price),
                    'purchase_date': op.purchase_date.isoformat(),
                } for op in recent_purchases
            ],
            'recent_ewaste': [
                {
                    'id': str(ew.id),
                    'device_type': ew.device_type,
                    'quantity': ew.quantity,
                    'co2_saved': float(ew.estimated_co2_saved),
                    'created_at': ew.created_at.isoformat(),
                } for ew in recent_ewaste
            ],
        },
        'summary_metrics': {
            'carbon_neutral_progress': carbon_balance['neutrality_percentage'],
            'total_environmental_impact': float(ewaste_stats['total_co2_saved'] or 0) + carbon_balance['total_offsets'],
            'sustainability_score': min(carbon_balance['neutrality_percentage'] + 10, 100),  # Bonus for e-waste
        }
    }
