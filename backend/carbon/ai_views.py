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
from django.utils import timezone
from django.db import models
from decimal import Decimal
import logging

from .models import CarbonFootprint, ConversationSession, UploadedDocument
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
    DEPRECATED: Use ai_extract_from_conversation instead.
    Legacy endpoint for backward compatibility.
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


# ============================================================================
# Smart Data Entry System - Phase 1 MVP Endpoints
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='100/h', method='POST')
def ai_extract_from_conversation(request):
    """
    Phase 1 MVP: Context-aware conversational data extraction
    
    Extract emissions data from natural language input with full context awareness.
    """
    try:
        from .ai_services import ConversationalAIService
        from .models import ConversationSession, ConversationMessage
        import time
        
        # Get request data
        message = request.data.get('message', '').strip()
        conversation_history = request.data.get('conversation_history', [])
        footprint_id = request.data.get('current_footprint_id')
        session_id = request.data.get('session_id')
        company_id = request.data.get('company_id')
        
        if not message:
            return Response(
                {'error': 'message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get user's company
        if not request.user.company:
            return Response(
                {'error': 'User must be associated with a company'},
                status=status.HTTP_400_BAD_REQUEST
            )
        company = request.user.company
        
        # Get or create conversation session
        if session_id:
            session = get_object_or_404(
                ConversationSession,
                id=session_id,
                company=company
            )
        else:
            # Create new session
            session = ConversationSession.objects.create(
                company=company,
                created_by=request.user,
                status='active',
                title=f"Conversation {timezone.now().strftime('%Y-%m-%d %H:%M')}"
            )
            session.participants.add(request.user)
        
        # Get current footprint
        current_footprint = None
        if footprint_id:
            current_footprint = get_object_or_404(
                CarbonFootprint,
                id=footprint_id,
                company=company
            )
        elif session.footprint:
            current_footprint = session.footprint
        else:
            # Get most recent footprint
            current_footprint = company.carbon_footprints.order_by('-created_at').first()
        
        # Build company context
        company_context = {
            'name': company.name,
            'industry': company.industry,
            'employees': company.employees,
        }
        
        # Save user message
        start_time = time.time()
        user_message = ConversationMessage.objects.create(
            session=session,
            author=request.user,
            role='user',
            content=message
        )
        
        # Call AI service
        ai_service = ConversationalAIService()
        extraction_result = ai_service.extract_from_conversation(
            user_message=message,
            conversation_history=conversation_history,
            current_footprint=current_footprint,
            company_context=company_context
        )
        
        processing_time = int((time.time() - start_time) * 1000)
        
        # Save AI response message
        ai_message = ConversationMessage.objects.create(
            session=session,
            role='assistant',
            content=extraction_result.get('ai_response', 'Processing...'),
            extracted_data=extraction_result.get('extracted_data'),
            confidence_score=extraction_result.get('extracted_data', {}).get('confidence', 0) * 100 if extraction_result.get('extracted_data') else None,
            processed_at=timezone.now(),
            processing_time_ms=processing_time
        )
        
        # Update session statistics
        if extraction_result.get('extracted_data'):
            session.data_entries_count += 1
            
            # Calculate emissions added
            emissions_added = extraction_result['extracted_data'].get('calculated_emissions', 0)
            if emissions_added:
                session.total_emissions_added += Decimal(str(emissions_added))
            
            # Update average confidence
            if session.data_entries_count > 0:
                messages_with_data = session.messages.filter(
                    extracted_data__isnull=False,
                    confidence_score__isnull=False
                )
                if messages_with_data.exists():
                    avg_confidence = messages_with_data.aggregate(
                        models.Avg('confidence_score')
                    )['confidence_score__avg']
                    session.average_confidence = avg_confidence or 0
            
            session.save()
        
        # Prepare response
        response_data = {
            'success': True,
            'session_id': str(session.id),
            'message_id': str(ai_message.id),
            'extracted_data': extraction_result.get('extracted_data'),
            'validation': extraction_result.get('validation', {}),
            'ai_response': extraction_result.get('ai_response'),
            'clarifying_questions': extraction_result.get('clarifying_questions', []),
            'suggested_actions': extraction_result.get('suggested_actions', []),
            'processing_time_ms': processing_time,
            'session_summary': session.get_summary()
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Conversational extraction error: {str(e)}", exc_info=True)
        return Response(
            {'error': f'Extraction service error: {str(e)}'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='100/h', method='POST')
def ai_update_with_context(request):
    """
    Phase 1 MVP: Context-aware footprint updates
    
    Update carbon footprint with extracted data while maintaining full audit trail.
    """
    try:
        from decimal import Decimal
        
        # Get request data
        footprint_id = request.data.get('footprint_id')
        update_data = request.data.get('update_data', {})
        message_id = request.data.get('conversation_message_id')
        user_confirmed = request.data.get('user_confirmed', False)
        
        if not footprint_id or not update_data:
            return Response(
                {'error': 'footprint_id and update_data are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get footprint and verify ownership
        if not request.user.company:
            return Response(
                {'error': 'User must be associated with a company'},
                status=status.HTTP_400_BAD_REQUEST
            )
        footprint = get_object_or_404(
            CarbonFootprint,
            id=footprint_id,
            company=request.user.company
        )
        
        # Store previous values for audit trail
        previous_values = {
            'scope1_emissions': float(footprint.scope1_emissions),
            'scope2_emissions': float(footprint.scope2_emissions),
            'scope3_emissions': float(footprint.scope3_emissions),
            'total_emissions': float(footprint.total_emissions)
        }
        
        # Apply updates
        changes = {}
        for field, field_data in update_data.items():
            if field in ['scope1_emissions', 'scope2_emissions', 'scope3_emissions']:
                operation = field_data.get('operation', 'add')
                value = Decimal(str(field_data.get('value', 0)))
                
                current_value = getattr(footprint, field)
                
                if operation == 'add':
                    new_value = current_value + value
                elif operation == 'subtract':
                    new_value = current_value - value
                elif operation == 'set':
                    new_value = value
                else:
                    continue
                
                setattr(footprint, field, new_value)
                changes[field] = {
                    'previous': float(current_value),
                    'new': float(new_value),
                    'change': float(new_value - current_value),
                    'operation': operation,
                    'metadata': field_data.get('metadata', {})
                }
        
        # Save footprint (auto-calculates total)
        footprint.save()
        
        # Update conversation message if provided
        if message_id:
            try:
                from .models import ConversationMessage
                message = ConversationMessage.objects.get(id=message_id)
                message.footprint_updated = True
                message.footprint_changes = changes
                message.validation_status = 'validated' if user_confirmed else 'pending'
                if user_confirmed:
                    message.validated_by = request.user
                message.save()
            except ConversationMessage.DoesNotExist:
                pass
        
        # Prepare response
        response_data = {
            'success': True,
            'updated_footprint': {
                'id': str(footprint.id),
                'scope1_emissions': float(footprint.scope1_emissions),
                'scope2_emissions': float(footprint.scope2_emissions),
                'scope3_emissions': float(footprint.scope3_emissions),
                'total_emissions': float(footprint.total_emissions),
                'last_updated': footprint.created_at.isoformat()
            },
            'changes': changes,
            'audit_trail': {
                'changed_by': request.user.username,
                'changed_at': timezone.now().isoformat(),
                'source': 'smart_data_entry',
                'message_id': message_id,
                'user_confirmed': user_confirmed
            }
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Context-aware update error: {str(e)}", exc_info=True)
        return Response(
            {'error': f'Update service error: {str(e)}'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def conversation_session(request, session_id=None):
    """
    Manage conversation sessions
    
    GET: Retrieve session details and message history
    POST: Create new session
    """
    from .models import ConversationSession, ConversationMessage
    from .serializers import ConversationSessionSerializer, ConversationMessageSerializer
    
    if request.method == 'GET':
        if not session_id:
            return Response(
                {'error': 'session_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            session = ConversationSession.objects.get(
                id=session_id,
                company__users=request.user
            )
            
            messages = session.messages.all()
            
            response_data = {
                'session_id': str(session.id),
                'company_id': str(session.company.id),
                'footprint_id': str(session.footprint.id) if session.footprint else None,
                'created_at': session.created_at.isoformat(),
                'updated_at': session.updated_at.isoformat(),
                'status': session.status,
                'participants': [
                    {
                        'user_id': str(p.id),
                        'username': p.username,
                        'email': p.email
                    }
                    for p in session.participants.all()
                ],
                'messages': [
                    {
                        'id': str(msg.id),
                        'role': msg.role,
                        'content': msg.content,
                        'author': msg.author.username if msg.author else 'AI',
                        'timestamp': msg.created_at.isoformat(),
                        'extracted_data': msg.extracted_data,
                        'confidence_score': float(msg.confidence_score) if msg.confidence_score else None,
                        'footprint_updated': msg.footprint_updated
                    }
                    for msg in messages
                ],
                'summary': session.get_summary()
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except ConversationSession.DoesNotExist:
            return Response(
                {'error': 'Session not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    elif request.method == 'POST':
        # Create new session
        try:
            company = request.user.company
        except AttributeError:
            return Response(
                {'error': 'User must be associated with a company'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        footprint_id = request.data.get('footprint_id')
        footprint = None
        
        if footprint_id:
            footprint = get_object_or_404(
                CarbonFootprint,
                id=footprint_id,
                company=company
            )
        
        session = ConversationSession.objects.create(
            company=company,
            footprint=footprint,
            created_by=request.user,
            status='active',
            title=request.data.get('title', f"Conversation {timezone.now().strftime('%Y-%m-%d %H:%M')}")
        )
        session.participants.add(request.user)
        
        return Response(
            {
                'session_id': str(session.id),
                'created_at': session.created_at.isoformat(),
                'status': session.status
            },
            status=status.HTTP_201_CREATED
        )


# ============================================================
# Phase 2: Multi-Modal Document Upload with AI Extraction
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='30/h', method='POST')
def upload_document(request):
    """
    Upload a document (utility bill, meter photo, receipt) for AI extraction
    
    Accepts multipart/form-data with:
    - file: The document file (PDF, JPG, PNG)
    - document_type: One of: utility_bill, fuel_receipt, travel_receipt, invoice, meter_photo, other
    - conversation_session_id (optional): Link to existing conversation
    - footprint_id (optional): Link to specific footprint
    
    Returns:
    - document_id: UUID of created document
    - extraction_status: pending | processing | completed | failed
    - file_name, file_size, mime_type
    """
    try:
        # Validate company association
        try:
            company = request.user.company
        except AttributeError:
            return Response(
                {'error': 'User must be associated with a company'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file presence
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided. Include file in multipart/form-data.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        uploaded_file = request.FILES['file']
        
        # Validate file type
        allowed_types = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png'
        ]
        if uploaded_file.content_type not in allowed_types:
            return Response(
                {
                    'error': f'Unsupported file type: {uploaded_file.content_type}',
                    'allowed_types': allowed_types
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (4MB limit per Gemini Vision spec)
        max_size = 4 * 1024 * 1024  # 4MB in bytes
        if uploaded_file.size > max_size:
            return Response(
                {
                    'error': f'File too large: {uploaded_file.size} bytes',
                    'max_size': max_size,
                    'max_size_display': '4MB'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get document type
        document_type = request.data.get('document_type', 'other')
        valid_types = ['utility_bill', 'fuel_receipt', 'travel_receipt', 'invoice', 'meter_photo', 'other']
        if document_type not in valid_types:
            return Response(
                {
                    'error': f'Invalid document_type: {document_type}',
                    'valid_types': valid_types
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get optional relationships
        conversation_session = None
        footprint = None
        
        session_id = request.data.get('conversation_session_id')
        if session_id:
            conversation_session = get_object_or_404(
                ConversationSession,
                id=session_id,
                company=company
            )
        
        footprint_id = request.data.get('footprint_id')
        if footprint_id:
            footprint = get_object_or_404(
                CarbonFootprint,
                id=footprint_id,
                company=company
            )
        
        # Create UploadedDocument instance
        document = UploadedDocument.objects.create(
            company=company,
            uploaded_by=request.user,
            conversation_session=conversation_session,
            file=uploaded_file,
            file_name=uploaded_file.name,
            file_size=uploaded_file.size,
            mime_type=uploaded_file.content_type,
            document_type=document_type,
            extraction_status='pending',
            footprint=footprint
        )
        
        # Trigger AI extraction (synchronous for now - can be made async with Celery later)
        try:
            from .ai_services import GeminiVisionService
            from .models import DocumentExtractionField
            
            vision_service = GeminiVisionService()
            document.extraction_status = 'processing'
            document.save(update_fields=['extraction_status'])
            
            # Read file data
            document.file.seek(0)
            file_data = document.file.read()
            
            # Choose extraction method based on document type
            if document_type == 'utility_bill':
                result = vision_service.extract_from_utility_bill(
                    file_data,
                    uploaded_file.content_type,
                    document_type
                )
            elif document_type == 'meter_photo':
                result = vision_service.read_meter_photo(
                    file_data,
                    meter_type='electricity'  # TODO: Make this dynamic
                )
            elif document_type in ['fuel_receipt', 'travel_receipt']:
                result = vision_service.extract_from_fuel_receipt(
                    file_data,
                    uploaded_file.content_type
                )
            else:
                # Generic extraction for invoices and other types
                result = vision_service.extract_from_utility_bill(
                    file_data,
                    uploaded_file.content_type,
                    document_type
                )
            
            # Update document with extraction results
            if result.get('success'):
                document.extraction_status = 'completed'
                document.extracted_data = result.get('extracted_data', {})
                document.confidence_score = Decimal(str(result.get('confidence_score', 0)))
                document.processing_time_ms = result.get('processing_time_ms', 0)
                document.gemini_model_used = 'gemini-2.0-flash-exp'
                
                # Create DocumentExtractionField instances for each extracted field
                for field_name, field_value in document.extracted_data.items():
                    if field_value is not None:
                        # Determine field type
                        field_type = 'text'
                        if isinstance(field_value, (int, float)):
                            field_type = 'number'
                        elif 'date' in field_name.lower():
                            field_type = 'date'
                        elif 'cost' in field_name.lower() or 'price' in field_name.lower():
                            field_type = 'currency'
                        
                        DocumentExtractionField.objects.create(
                            document=document,
                            field_name=field_name,
                            field_value=str(field_value),
                            field_type=field_type,
                            confidence=document.confidence_score
                        )
                
                logger.info(
                    f"Document extraction completed: {document.id} "
                    f"(confidence: {document.confidence_score}%)"
                )
            else:
                document.extraction_status = 'failed'
                document.extraction_error = result.get('error', 'Unknown extraction error')
                logger.error(f"Document extraction failed: {document.id} - {document.extraction_error}")
            
            document.save()
            
        except Exception as e:
            document.extraction_status = 'failed'
            document.extraction_error = str(e)
            document.save()
            logger.error(f"Document extraction exception: {document.id} - {str(e)}", exc_info=True)
        
        logger.info(
            f"Document uploaded: {document.id} by {request.user.email} "
            f"({document.file_name}, {document.document_type})"
        )
        
        return Response(
            {
                'document_id': str(document.id),
                'file_name': document.file_name,
                'file_size': document.file_size,
                'file_size_display': document.get_file_size_display(),
                'mime_type': document.mime_type,
                'document_type': document.document_type,
                'extraction_status': document.extraction_status,
                'created_at': document.created_at.isoformat(),
                'message': 'Document uploaded successfully. Extraction will begin shortly.'
            },
            status=status.HTTP_201_CREATED
        )
        
    except Exception as e:
        logger.error(f"Document upload error: {str(e)}", exc_info=True)
        return Response(
            {'error': f'Upload failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='60/h', method='GET')
def get_document(request, document_id):
    """
    Retrieve document details with extraction results
    
    GET /api/v1/carbon/ai/documents/<uuid:document_id>/
    
    Returns:
    - document_id, file_name, document_type, extraction_status
    - extracted_data: Full extraction results
    - extracted_fields: Array of individual fields with confidence scores
    - confidence_score: Overall extraction confidence
    - user_validated: Whether user has reviewed/approved
    - applied_to_footprint: Whether data has been applied
    """
    try:
        # Get company
        try:
            company = request.user.company
        except AttributeError:
            return Response(
                {'error': 'User must be associated with a company'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get document (verify company ownership)
        document = get_object_or_404(
            UploadedDocument,
            id=document_id,
            company=company
        )
        
        # Serialize document with all nested fields
        from .serializers import UploadedDocumentSerializer
        serializer = UploadedDocumentSerializer(document, context={'request': request})
        
        logger.info(f"Document retrieved: {document.id} by {request.user.email}")
        
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Document retrieval error: {str(e)}", exc_info=True)
        return Response(
            {'error': f'Failed to retrieve document: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='60/h', method='POST')
def validate_document(request, document_id):
    """
    User validates or corrects extracted document data
    
    POST /api/v1/carbon/ai/documents/<uuid:document_id>/validate/
    
    Request Body:
    {
        "approve": true | false,
        "corrections": {
            "kwh_consumed": "5500",  // New value for field
            "billing_period_start": "2024-12-01"
        },
        "notes": "Corrected kWh based on actual meter reading"
    }
    
    Returns:
    - Updated document with user_validated = true
    - Applied corrections to extracted_fields
    - Ready for apply-to-footprint step
    """
    try:
        # Get company
        try:
            company = request.user.company
        except AttributeError:
            return Response(
                {'error': 'User must be associated with a company'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get document
        document = get_object_or_404(
            UploadedDocument,
            id=document_id,
            company=company
        )
        
        # Check if extraction completed
        if document.extraction_status != 'completed':
            return Response(
                {
                    'error': f'Cannot validate document with status: {document.extraction_status}',
                    'current_status': document.extraction_status
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        approve = request.data.get('approve', False)
        corrections = request.data.get('corrections', {})
        notes = request.data.get('notes', '')
        
        # Apply corrections to extracted fields
        from .models import DocumentExtractionField
        
        if corrections:
            for field_name, new_value in corrections.items():
                # Find the extraction field
                try:
                    field = DocumentExtractionField.objects.get(
                        document=document,
                        field_name=field_name
                    )
                    # Apply correction
                    field.apply_correction(new_value, request.user)
                    
                except DocumentExtractionField.DoesNotExist:
                    # Create new field if it doesn't exist
                    DocumentExtractionField.objects.create(
                        document=document,
                        field_name=field_name,
                        field_value=str(new_value),
                        field_type='text',
                        confidence=Decimal('100.00'),
                        user_corrected=True,
                        original_value=None
                    )
            
            # Update extracted_data JSON with corrections
            if document.extracted_data:
                document.extracted_data.update(corrections)
            else:
                document.extracted_data = corrections
        
        # Mark as validated
        document.user_validated = approve
        document.validated_by = request.user
        document.validated_at = timezone.now()
        
        # Store corrections and notes
        if corrections or notes:
            document.user_corrections = {
                'corrections': corrections,
                'notes': notes,
                'corrected_at': timezone.now().isoformat()
            }
        
        document.save()
        
        logger.info(
            f"Document validated: {document.id} by {request.user.email} "
            f"(approved: {approve}, corrections: {len(corrections)})"
        )
        
        # Return updated document
        from .serializers import UploadedDocumentSerializer
        serializer = UploadedDocumentSerializer(document, context={'request': request})
        
        return Response(
            {
                'success': True,
                'message': 'Document validation saved successfully',
                'approved': approve,
                'corrections_applied': len(corrections),
                'document': serializer.data
            },
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        logger.error(f"Document validation error: {str(e)}", exc_info=True)
        return Response(
            {'error': f'Validation failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='60/h', method='POST')
def apply_document_to_footprint(request, document_id):
    """
    Apply validated document extraction data to carbon footprint
    
    POST /api/v1/carbon/ai/documents/<uuid:document_id>/apply/
    
    Request Body:
    {
        "footprint_id": "uuid",  // Optional: if not set, uses document.footprint or creates new
        "create_conversation_message": true  // Add entry to conversation thread
    }
    
    Returns:
    - Updated footprint with new emissions data
    - Document marked as applied_to_footprint = true
    - Change summary showing before/after values
    """
    try:
        # Get company
        try:
            company = request.user.company
        except AttributeError:
            return Response(
                {'error': 'User must be associated with a company'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get document
        document = get_object_or_404(
            UploadedDocument,
            id=document_id,
            company=company
        )
        
        # Validation checks
        if document.extraction_status != 'completed':
            return Response(
                {'error': f'Cannot apply document with status: {document.extraction_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not document.user_validated:
            return Response(
                {'error': 'Document must be validated before applying to footprint'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if document.applied_to_footprint:
            return Response(
                {'error': 'Document has already been applied to footprint'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create footprint
        footprint_id = request.data.get('footprint_id')
        if footprint_id:
            footprint = get_object_or_404(
                CarbonFootprint,
                id=footprint_id,
                company=company
            )
        elif document.footprint:
            footprint = document.footprint
        else:
            # Create new footprint for current period
            from datetime import datetime
            current_period = datetime.now().strftime('%Y-%m')
            footprint = CarbonFootprint.objects.create(
                company=company,
                reporting_period=current_period,
                created_by=request.user
            )
        
        # Extract emissions data and apply to footprint
        extracted_data = document.extracted_data or {}
        
        # Store original values for change tracking
        original_scope1 = footprint.scope1_emissions or Decimal('0')
        original_scope2 = footprint.scope2_emissions or Decimal('0')
        original_scope3 = footprint.scope3_emissions or Decimal('0')
        
        # Determine scope and calculate emissions based on document type
        emissions_added = Decimal('0')
        scope_updated = None
        
        if document.document_type == 'utility_bill':
            # Electricity/gas bills → Scope 2 (electricity) or Scope 1 (gas)
            utility_type = extracted_data.get('utility_type', 'electricity')
            
            if utility_type == 'electricity':
                kwh = Decimal(str(extracted_data.get('kwh_consumed', 0)))
                # Use emission factor (0.453 kg CO2/kWh US average)
                emissions_added = kwh * Decimal('0.453') / Decimal('1000')  # Convert to tCO2e
                footprint.scope2_emissions = (footprint.scope2_emissions or Decimal('0')) + emissions_added
                scope_updated = 'scope2'
                
            elif utility_type == 'gas':
                cubic_meters = Decimal(str(extracted_data.get('cubic_meters_gas', 0)))
                # Use emission factor (0.184 kg CO2/kWh for natural gas)
                emissions_added = cubic_meters * Decimal('10.55') * Decimal('0.184') / Decimal('1000')
                footprint.scope1_emissions = (footprint.scope1_emissions or Decimal('0')) + emissions_added
                scope_updated = 'scope1'
        
        elif document.document_type == 'fuel_receipt':
            # Fuel receipts → Scope 1
            fuel_type = extracted_data.get('fuel_type', 'gasoline')
            quantity = Decimal(str(extracted_data.get('quantity', 0)))
            
            if fuel_type == 'gasoline':
                # 8.89 kg CO2/gallon
                emissions_added = quantity * Decimal('8.89') / Decimal('1000')
            elif fuel_type == 'diesel':
                # 10.18 kg CO2/gallon
                emissions_added = quantity * Decimal('10.18') / Decimal('1000')
            
            footprint.scope1_emissions = (footprint.scope1_emissions or Decimal('0')) + emissions_added
            scope_updated = 'scope1'
        
        elif document.document_type == 'travel_receipt':
            # Travel receipts → Scope 3
            emissions_added = Decimal(str(extracted_data.get('emissions_estimate', 0)))
            footprint.scope3_emissions = (footprint.scope3_emissions or Decimal('0')) + emissions_added
            scope_updated = 'scope3'
        
        # Update total emissions
        footprint.total_emissions = (
            (footprint.scope1_emissions or Decimal('0')) +
            (footprint.scope2_emissions or Decimal('0')) +
            (footprint.scope3_emissions or Decimal('0'))
        )
        
        footprint.save()
        
        # Mark document as applied
        document.applied_to_footprint = True
        document.footprint = footprint
        document.save()
        
        # Create conversation message if requested
        create_message = request.data.get('create_conversation_message', False)
        if create_message and document.conversation_session:
            from .models import ConversationMessage
            ConversationMessage.objects.create(
                session=document.conversation_session,
                author=request.user,
                role='system',
                content=f"Applied document {document.file_name} to footprint",
                extracted_data=extracted_data,
                confidence_score=document.confidence_score,
                footprint_updated=True
            )
        
        logger.info(
            f"Document applied to footprint: {document.id} → {footprint.id} "
            f"(+{emissions_added} tCO2e in {scope_updated})"
        )
        
        return Response(
            {
                'success': True,
                'message': 'Document data successfully applied to footprint',
                'footprint_id': str(footprint.id),
                'emissions_added': float(emissions_added),
                'scope_updated': scope_updated,
                'change_summary': {
                    'scope1': {
                        'before': float(original_scope1),
                        'after': float(footprint.scope1_emissions or Decimal('0')),
                        'change': float((footprint.scope1_emissions or Decimal('0')) - original_scope1)
                    },
                    'scope2': {
                        'before': float(original_scope2),
                        'after': float(footprint.scope2_emissions or Decimal('0')),
                        'change': float((footprint.scope2_emissions or Decimal('0')) - original_scope2)
                    },
                    'scope3': {
                        'before': float(original_scope3),
                        'after': float(footprint.scope3_emissions or Decimal('0')),
                        'change': float((footprint.scope3_emissions or Decimal('0')) - original_scope3)
                    },
                    'total': {
                        'before': float(original_scope1 + original_scope2 + original_scope3),
                        'after': float(footprint.total_emissions or Decimal('0')),
                        'change': float(emissions_added)
                    }
                }
            },
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        logger.error(f"Apply document error: {str(e)}", exc_info=True)
        return Response(
            {'error': f'Failed to apply document to footprint: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== PREDICTION API ENDPOINTS (Phase 3 Week 1) ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='60/h', method='POST')
def ai_predict_next_value(request):
    """
    Predict next emissions value for a specific activity type
    
    Request body:
    - company_id: int (required) - Company ID for predictions
    - activity_type: str (required) - Activity type (e.g., 'electricity', 'gasoline')
    - target_period: date (required) - Target date for prediction (YYYY-MM-DD)
    - footprint_id: int (optional) - Specific footprint ID to use
    
    Response:
    - success: bool
    - predicted_value: decimal
    - confidence_score: float (0-1)
    - confidence_interval: {lower, upper}
    - reasoning: str
    - Additional metadata
    """
    from .prediction_service import PredictionService
    from .serializers import PredictionRequestSerializer, PredictionResponseSerializer
    from datetime import datetime
    
    try:
        # Validate request data
        request_serializer = PredictionRequestSerializer(data=request.data)
        if not request_serializer.is_valid():
            return Response(
                {
                    'success': False,
                    'message': 'Invalid request parameters',
                    'errors': request_serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        validated_data = request_serializer.validated_data
        company_id = validated_data['company_id']
        activity_type = validated_data['activity_type']
        target_period = validated_data['target_period']
        footprint_id = validated_data.get('footprint_id')
        
        # Verify company access
        company = get_object_or_404(
            Company,
            id=company_id,
            users=request.user
        )
        
        logger.info(
            f"Prediction request: user={request.user.id}, company={company_id}, "
            f"activity={activity_type}, target={target_period}"
        )
        
        # Make prediction
        prediction_service = PredictionService()
        result = prediction_service.predict_next_value(
            company_id=company_id,
            activity_type=activity_type,
            target_period=target_period,
            footprint_id=footprint_id
        )
        
        # Serialize response
        response_serializer = PredictionResponseSerializer(data=result)
        if response_serializer.is_valid():
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        else:
            logger.warning(f"Prediction response serialization failed: {response_serializer.errors}")
            return Response(result, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        return Response(
            {
                'success': False,
                'message': f'Prediction failed: {str(e)}'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='60/h', method='POST')
def ai_predict_seasonal_patterns(request):
    """
    Analyze seasonal patterns in emissions data
    
    Request body:
    - company_id: int (required) - Company ID for analysis
    - activity_type: str (required) - Activity type to analyze
    - footprint_id: int (optional) - Specific footprint ID to use
    
    Response:
    - success: bool
    - pattern_detected: bool
    - pattern_description: str
    - monthly_factors: list of {month, month_name, factor, average_value}
    - peak_month: str
    - low_month: str
    - pattern_strength: float (0-1)
    """
    from .prediction_service import PredictionService
    from .serializers import PredictionRequestSerializer, SeasonalPatternSerializer
    
    try:
        # Validate request data (we only need company_id and activity_type)
        company_id = request.data.get('company_id')
        activity_type = request.data.get('activity_type', '').strip().lower()
        footprint_id = request.data.get('footprint_id')
        
        if not company_id or not activity_type:
            return Response(
                {
                    'success': False,
                    'message': 'company_id and activity_type are required'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify company access
        company = get_object_or_404(
            Company,
            id=company_id,
            users=request.user
        )
        
        logger.info(
            f"Seasonal pattern request: user={request.user.id}, company={company_id}, "
            f"activity={activity_type}"
        )
        
        # Analyze seasonal patterns
        prediction_service = PredictionService()
        result = prediction_service.detect_seasonal_patterns(
            company_id=company_id,
            activity_type=activity_type,
            footprint_id=footprint_id
        )
        
        # Serialize response
        response_serializer = SeasonalPatternSerializer(data=result)
        if response_serializer.is_valid():
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        else:
            logger.warning(f"Seasonal pattern response serialization failed: {response_serializer.errors}")
            return Response(result, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Seasonal pattern analysis error: {str(e)}", exc_info=True)
        return Response(
            {
                'success': False,
                'message': f'Seasonal pattern analysis failed: {str(e)}'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@ratelimit(key='user', rate='60/h', method='POST')
def ai_predict_growth_trend(request):
    """
    Calculate growth trend for emissions activity
    
    Request body:
    - company_id: int (required) - Company ID for analysis
    - activity_type: str (required) - Activity type to analyze
    - footprint_id: int (optional) - Specific footprint ID to use
    
    Response:
    - success: bool
    - annual_growth_rate: float (percentage)
    - trend_direction: str ('increasing', 'decreasing', 'stable')
    - trend_significance: float (0-1)
    - trend_confidence: float (0-1)
    - monthly_growth_rates: list of {month, growth_rate}
    - reasoning: str
    """
    from .prediction_service import PredictionService
    from .serializers import PredictionRequestSerializer, GrowthTrendSerializer
    
    try:
        # Validate request data
        company_id = request.data.get('company_id')
        activity_type = request.data.get('activity_type', '').strip().lower()
        footprint_id = request.data.get('footprint_id')
        
        if not company_id or not activity_type:
            return Response(
                {
                    'success': False,
                    'message': 'company_id and activity_type are required'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify company access
        company = get_object_or_404(
            Company,
            id=company_id,
            users=request.user
        )
        
        logger.info(
            f"Growth trend request: user={request.user.id}, company={company_id}, "
            f"activity={activity_type}"
        )
        
        # Calculate growth trend
        prediction_service = PredictionService()
        result = prediction_service.calculate_growth_trend(
            company_id=company_id,
            activity_type=activity_type,
            footprint_id=footprint_id
        )
        
        # Serialize response
        response_serializer = GrowthTrendSerializer(data=result)
        if response_serializer.is_valid():
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        else:
            logger.warning(f"Growth trend response serialization failed: {response_serializer.errors}")
            return Response(result, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Growth trend analysis error: {str(e)}", exc_info=True)
        return Response(
            {
                'success': False,
                'message': f'Growth trend analysis failed: {str(e)}'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
