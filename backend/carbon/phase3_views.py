# backend/carbon/phase3_views.py
"""
Phase 3 API Views: Proactive Guidance, Smart Calculations, Benchmarking

This module provides endpoints for:
- Completeness tracking and guidance
- Onboarding wizard
- Emission factor lookup
- Industry benchmarking
- Next action suggestions
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
from decimal import Decimal

from .models import CarbonFootprint
from companies.models import Company
from .guidance_service import GuidanceService
from .benchmarking_service import BenchmarkingService
from .emission_factors import EmissionFactor


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_completeness_score(request, footprint_id):
    """
    GET /api/v1/carbon/guidance/completeness/<uuid:footprint_id>/
    
    Calculate completeness score for a footprint
    
    Response:
    {
        "overall_score": 0.75,
        "scope1_score": 0.80,
        "scope2_score": 1.00,
        "scope3_score": 0.40,
        "missing_activities": ["natural_gas", "business_travel"],
        "completion_percentage": 75,
        "grade": "B",
        "meets_minimum": true
    }
    """
    footprint = get_object_or_404(CarbonFootprint, id=footprint_id, company__user=request.user)
    
    guidance_service = GuidanceService(footprint.company)
    completeness = guidance_service.calculate_completeness_score(footprint)
    
    return Response(completeness, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_missing_data_alerts(request, footprint_id):
    """
    GET /api/v1/carbon/guidance/missing-data/<uuid:footprint_id>/
    
    Get alerts for missing data with suggestions
    
    Response:
    {
        "alerts": [
            {
                "priority": "high",
                "scope": "scope2",
                "activity": "electricity",
                "message": "You haven't reported electricity usage yet.",
                "suggestion": "Upload your utility bill...",
                "action": "add_electricity"
            }
        ],
        "count": 3
    }
    """
    footprint = get_object_or_404(CarbonFootprint, id=footprint_id, company__user=request.user)
    
    guidance_service = GuidanceService(footprint.company)
    alerts = guidance_service.detect_missing_data(footprint)
    
    return Response({
        'alerts': alerts,
        'count': len(alerts),
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_onboarding_flow(request):
    """
    GET /api/v1/carbon/guidance/onboarding/
    
    Generate personalized onboarding wizard steps
    
    Response:
    {
        "steps": [
            {
                "step": 1,
                "title": "Welcome to Carbon Tracking",
                "description": "Let's set up your first footprint...",
                "questions": [...],
                "estimated_time": "5 minutes"
            }
        ],
        "total_steps": 6,
        "estimated_total_time": "20 minutes"
    }
    """
    # Get user's company
    try:
        company = Company.objects.get(user=request.user)
    except Company.DoesNotExist:
        return Response({
            'error': 'Company profile not found. Please set up your company first.',
        }, status=status.HTTP_404_NOT_FOUND)
    
    guidance_service = GuidanceService(company)
    steps = guidance_service.generate_onboarding_flow()
    
    total_time = sum(
        int(step.get('estimated_time', '0 minutes').split()[0])
        for step in steps
    )
    
    return Response({
        'steps': steps,
        'total_steps': len(steps),
        'estimated_total_time': f'{total_time} minutes',
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_seasonal_reminders(request):
    """
    GET /api/v1/carbon/guidance/reminders/
    
    Get time-appropriate reminders for data entry
    
    Response:
    {
        "reminders": [
            {
                "type": "monthly",
                "priority": "high",
                "title": "Time to Report March Data",
                "message": "The month of March just ended...",
                "action": "open_data_entry"
            }
        ],
        "count": 2
    }
    """
    try:
        company = Company.objects.get(user=request.user)
    except Company.DoesNotExist:
        return Response({
            'error': 'Company profile not found.',
        }, status=status.HTTP_404_NOT_FOUND)
    
    guidance_service = GuidanceService(company)
    reminders = guidance_service.generate_seasonal_reminders()
    
    return Response({
        'reminders': reminders,
        'count': len(reminders),
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_next_actions(request, footprint_id):
    """
    GET /api/v1/carbon/guidance/next-actions/<uuid:footprint_id>/
    
    Get smart suggestions for next actions
    
    Response:
    {
        "actions": [
            {
                "priority": "high",
                "title": "Add Electricity Data",
                "reason": "Electricity is missing...",
                "action": "add_electricity",
                "estimated_impact": "40-60% of total emissions",
                "icon": "⚡"
            }
        ],
        "count": 4
    }
    """
    footprint = get_object_or_404(CarbonFootprint, id=footprint_id, company__user=request.user)
    
    guidance_service = GuidanceService(footprint.company)
    actions = guidance_service.suggest_next_actions(footprint)
    
    return Response({
        'actions': actions,
        'count': len(actions),
    }, status=status.HTTP_200_OK)


# ========== EMISSION FACTOR ENDPOINTS ==========

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def lookup_emission_factor(request):
    """
    POST /api/v1/carbon/emission-factors/lookup/
    
    Look up emission factor based on activity, region, and time
    
    Request:
    {
        "activity_type": "electricity",
        "region_code": "US-CA",
        "year": 2025,
        "industry": "Technology",  # optional
        "sub_category": "grid_electricity"  # optional
    }
    
    Response:
    {
        "factor": {
            "activity_type": "electricity",
            "region_name": "California",
            "factor_value": 0.342,
            "unit": "kg CO2e/kWh",
            "year": 2025,
            "source": "California Air Resources Board",
            "confidence_level": "high"
        },
        "alternatives": [
            {
                "region_name": "United States (National Average)",
                "factor_value": 0.453,
                "year": 2025
            }
        ]
    }
    """
    activity_type = request.data.get('activity_type')
    region_code = request.data.get('region_code', '')
    year = request.data.get('year', 2025)
    industry = request.data.get('industry', '')
    sub_category = request.data.get('sub_category', '')
    
    if not activity_type:
        return Response({
            'error': 'activity_type is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Try to find exact match
    factor = EmissionFactor.objects.filter(
        activity_type=activity_type,
        region_code=region_code,
        year=year,
        is_active=True,
    ).first()
    
    if not factor and region_code:
        # Try without year constraint
        factor = EmissionFactor.objects.filter(
            activity_type=activity_type,
            region_code=region_code,
            is_active=True,
        ).order_by('-year').first()
    
    if not factor:
        # Fall back to global/default
        factor = EmissionFactor.objects.filter(
            activity_type=activity_type,
            region_type='global',
            is_active=True,
        ).order_by('-year').first()
    
    if not factor:
        return Response({
            'error': f'No emission factor found for {activity_type}',
            'suggestion': 'Try a different region or use the US national average',
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Track usage
    factor.increment_usage()
    
    # Get alternative factors for comparison
    alternatives = EmissionFactor.objects.filter(
        activity_type=activity_type,
        is_active=True,
    ).exclude(id=factor.id).order_by('-year')[:3]
    
    return Response({
        'factor': {
            'id': str(factor.id),
            'activity_type': factor.activity_type,
            'sub_category': factor.sub_category,
            'region_name': factor.region_name,
            'region_code': factor.region_code,
            'factor_value': float(factor.factor_value),
            'unit': factor.unit,
            'year': factor.year,
            'source': factor.source,
            'confidence_level': factor.confidence_level,
        },
        'alternatives': [
            {
                'id': str(alt.id),
                'region_name': alt.region_name,
                'factor_value': float(alt.factor_value),
                'unit': alt.unit,
                'year': alt.year,
            }
            for alt in alternatives
        ],
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_emission_factors(request):
    """
    GET /api/v1/carbon/emission-factors/
    
    List all available emission factors (paginated)
    
    Query params:
    - activity_type: filter by activity
    - region: filter by region
    - year: filter by year
    """
    factors = EmissionFactor.objects.filter(is_active=True)
    
    # Apply filters
    activity_type = request.query_params.get('activity_type')
    if activity_type:
        factors = factors.filter(activity_type=activity_type)
    
    region = request.query_params.get('region')
    if region:
        factors = factors.filter(
            Q(region_code__icontains=region) | Q(region_name__icontains=region)
        )
    
    year = request.query_params.get('year')
    if year:
        factors = factors.filter(year=year)
    
    # Limit to 50 results
    factors = factors[:50]
    
    return Response({
        'factors': [
            {
                'id': str(f.id),
                'activity_type': f.activity_type,
                'region_name': f.region_name,
                'factor_value': float(f.factor_value),
                'unit': f.unit,
                'year': f.year,
            }
            for f in factors
        ],
        'count': factors.count(),
    }, status=status.HTTP_200_OK)


# ========== BENCHMARKING ENDPOINTS ==========

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_peer_comparison(request, footprint_id):
    """
    GET /api/v1/carbon/benchmarking/compare/<uuid:footprint_id>/
    
    Compare footprint to industry peers
    
    Response:
    {
        "company_emissions": {...},
        "industry_average": {...},
        "comparison": {
            "total_vs_average": -33.3,
            "ranking_percentile": 25,
            "performance": "excellent"
        },
        "insights": [...]
    }
    """
    footprint = get_object_or_404(CarbonFootprint, id=footprint_id, company__user=request.user)
    
    benchmarking_service = BenchmarkingService(footprint.company)
    comparison = benchmarking_service.get_peer_comparison(footprint)
    
    return Response(comparison, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_improvement_opportunities(request, footprint_id):
    """
    GET /api/v1/carbon/benchmarking/opportunities/<uuid:footprint_id>/
    
    Get specific improvement opportunities based on peer comparison
    
    Response:
    {
        "opportunities": [
            {
                "scope": "scope2",
                "title": "Electricity Efficiency Improvement",
                "potential_reduction": 15.5,
                "actions": [...],
                "estimated_cost": "$10,000-$50,000",
                "priority": "high"
            }
        ],
        "count": 2
    }
    """
    footprint = get_object_or_404(CarbonFootprint, id=footprint_id, company__user=request.user)
    
    benchmarking_service = BenchmarkingService(footprint.company)
    opportunities = benchmarking_service.suggest_improvement_opportunities(footprint)
    
    return Response({
        'opportunities': opportunities,
        'count': len(opportunities),
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_industry_leaders(request):
    """
    GET /api/v1/carbon/benchmarking/leaders/
    
    Get anonymized examples of industry leaders
    
    Response:
    {
        "leaders": [
            {
                "rank": 1,
                "emissions_per_employee": 0.5,
                "vs_average": -67,
                "key_initiatives": [...]
            }
        ]
    }
    """
    try:
        company = Company.objects.get(user=request.user)
    except Company.DoesNotExist:
        return Response({
            'error': 'Company profile not found.',
        }, status=status.HTTP_404_NOT_FOUND)
    
    benchmarking_service = BenchmarkingService(company)
    leaders = benchmarking_service.get_industry_leaders(limit=5)
    
    return Response({
        'leaders': leaders,
        'count': len(leaders),
    }, status=status.HTTP_200_OK)
