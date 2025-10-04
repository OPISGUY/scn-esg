"""
AI-powered API views for Phase 5: Smart Data Management & Validation
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from django.shortcuts import get_object_or_404
import logging

from .models import CarbonFootprint
from companies.models import Company
from .ai_services import (
    AIDataValidator,
    AIBenchmarkingService, 
    AIActionPlanGenerator,
    AIPredictiveAnalytics
)

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='50/h', method='POST')
def ai_validate_emission_data(request):
    """
    AI-powered validation of carbon emission data
    """
    try:
        footprint_id = request.data.get('footprint_id')
        
        if footprint_id:
            # Get specific carbon footprint and verify ownership
            footprint = get_object_or_404(
                CarbonFootprint,
                id=footprint_id,
                company__users=request.user
            )
        else:
            # Get the most recent footprint for the user's company
            footprint = CarbonFootprint.objects.filter(
                company__users=request.user
            ).order_by('-created_at').first()
            
            if not footprint:
                return Response(
                    {'error': 'No carbon footprint data found. Please create a carbon footprint first.'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Initialize AI validator
        validator = AIDataValidator()
        
        # Get AI validation results
        validation_results = validator.validate_emission_data(footprint)
        
        # Add metadata
        validation_results['company_name'] = footprint.company.name
        validation_results['reporting_period'] = footprint.reporting_period
        validation_results['validated_at'] = footprint.created_at.isoformat()
        
        return Response(validation_results, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"AI validation error: {str(e)}")
        return Response(
            {'error': f'Validation service error: {str(e)}'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='30/h', method='POST')
def ai_suggest_emission_factors(request):
    """
    AI-powered emission factor suggestions based on activity descriptions
    """
    try:
        activity_description = request.data.get('activity_description', '').strip()
        industry = request.data.get('industry', '')
        
        if not activity_description:
            return Response(
                {'error': 'activity_description is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Initialize AI validator
        validator = AIDataValidator()
        
        # Get AI suggestions
        suggestions = validator.suggest_emission_factors(activity_description, industry)
        
        # Add metadata
        suggestions['query'] = activity_description
        suggestions['industry'] = industry
        suggestions['generated_at'] = logger.info('AI emission factor suggestion generated')
        
        return Response(suggestions, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"AI emission factor suggestion error: {str(e)}")
        return Response(
            {'error': 'Suggestion service temporarily unavailable'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='20/h', method='GET')
@cache_page(60 * 60 * 6)  # Cache for 6 hours
def ai_benchmark_company(request):
    """
    AI-powered company benchmarking against industry peers
    """
    try:
        # Get user's company
        company = request.user.company
        if not company:
            return Response(
                {'error': 'User must be associated with a company'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Initialize AI benchmarking service
        benchmarking_service = AIBenchmarkingService()
        
        # Get benchmark results
        benchmark_results = benchmarking_service.benchmark_company_performance(company)
        
        if 'error' in benchmark_results:
            return Response(benchmark_results, status=status.HTTP_400_BAD_REQUEST)
        
        # Add metadata
        benchmark_results['company_name'] = company.name
        benchmark_results['industry'] = company.industry
        benchmark_results['generated_at'] = logger.info('AI benchmark generated')
        
        return Response(benchmark_results, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"AI benchmarking error: {str(e)}")
        return Response(
            {'error': 'Benchmarking service temporarily unavailable'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='10/h', method='POST')
def ai_generate_action_plan(request):
    """
    Generate AI-powered sustainability action plan
    """
    try:
        # Get user's company
        company = request.user.company
        if not company:
            return Response(
                {'error': 'User must be associated with a company'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Initialize AI action plan generator
        action_plan_generator = AIActionPlanGenerator()
        
        # Generate action plan
        action_plan = action_plan_generator.generate_action_plan(company)
        
        if 'error' in action_plan:
            return Response(action_plan, status=status.HTTP_400_BAD_REQUEST)
        
        # Add metadata
        action_plan['company_name'] = company.name
        action_plan['industry'] = company.industry
        action_plan['generated_at'] = logger.info('AI action plan generated')
        
        return Response(action_plan, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"AI action plan generation error: {str(e)}")
        return Response(
            {'error': 'Action plan service temporarily unavailable'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='5/h', method='POST')  # Lower rate limit for expensive operation
def ai_predict_carbon_trajectory(request):
    """
    AI-powered carbon emission trajectory prediction
    """
    try:
        # Get user's company
        company = request.user.company
        if not company:
            return Response(
                {'error': 'User must be associated with a company'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get optional growth plans from request
        growth_plans = request.data.get('growth_plans', {})
        
        # Initialize AI predictive analytics
        predictive_service = AIPredictiveAnalytics()
        
        # Generate trajectory prediction
        trajectory = predictive_service.predict_carbon_trajectory(company, growth_plans)
        
        if 'error' in trajectory:
            return Response(trajectory, status=status.HTTP_400_BAD_REQUEST)
        
        # Add metadata
        trajectory['company_name'] = company.name
        trajectory['industry'] = company.industry
        trajectory['generated_at'] = logger.info('AI trajectory prediction generated')
        
        return Response(trajectory, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"AI trajectory prediction error: {str(e)}")
        return Response(
            {'error': 'Prediction service temporarily unavailable'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_service_health(request):
    """
    Check AI service health and configuration
    """
    try:
        from django.conf import settings
        
        health_status = {
            'ai_features_enabled': getattr(settings, 'ENABLE_AI_FEATURES', False),
            'gemini_configured': bool(getattr(settings, 'GEMINI_API_KEY', None)),
            'cache_backend': settings.CACHES['default']['BACKEND'],
            'services': {
                'data_validation': True,
                'emission_factors': True,
                'benchmarking': True,
                'action_planning': True,
                'trajectory_prediction': True
            },
            'rate_limits': {
                'validation': '50/hour',
                'suggestions': '30/hour', 
                'benchmarking': '20/hour',
                'action_plans': '10/hour',
                'predictions': '5/hour'
            }
        }
        
        return Response(health_status, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"AI health check error: {str(e)}")
        return Response(
            {'error': 'Health check failed'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='100/h', method='POST')
def ai_conversational_data_entry(request):
    """
    AI-powered conversational data entry assistance
    """
    try:
        user_input = request.data.get('user_input', '').strip()
        context = request.data.get('context', 'carbon_footprint')
        
        if not user_input:
            return Response(
                {'error': 'user_input is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # This is a simplified version - in production you'd have more sophisticated NLP
        from .ai_services import GeminiAIService
        ai_service = GeminiAIService()
        
        prompt = f"""
        The user is entering carbon footprint data and said: "{user_input}"
        Context: {context}
        
        Help interpret this input and suggest structured data fields:
        
        If they mentioned:
        - Energy consumption: Extract kWh, fuel types, amounts
        - Transportation: Extract distance, vehicle types, fuel consumption
        - Manufacturing: Extract materials, processes, quantities
        - Waste: Extract types, amounts, disposal methods
        
        Respond with:
        1. Interpreted data fields and values
        2. Suggested emission factors
        3. Missing information needed
        4. Validation questions to ask
        
        Format as JSON with clear field mappings.
        """
        
        response = ai_service._call_gemini(prompt)
        
        return Response(response, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Conversational data entry error: {str(e)}")
        return Response(
            {'error': 'Conversational service temporarily unavailable'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
