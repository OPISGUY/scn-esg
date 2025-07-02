from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Count, Avg
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from django.core.cache import cache
from datetime import timedelta

from .models import CSRDAssessment, ESRSDataPoint, ComplianceAction, RegulatoryUpdate, ESRSDatapointCatalog
from .serializers import (
    CSRDAssessmentSerializer, CSRDAssessmentCreateSerializer,
    ESRSDataPointSerializer, ComplianceActionSerializer, RegulatoryUpdateSerializer,
    ESRSDatapointCatalogSerializer
)
from .ai_services import CSRDAIService, ComplianceNotificationService
from .services import ESRSDatapointService, RegulatoryUpdateService
from companies.models import Company
from carbon.models import CarbonFootprint
import logging

logger = logging.getLogger(__name__)


class CSRDAssessmentViewSet(viewsets.ModelViewSet):
    """CSRD Assessment Management"""
    
    serializer_class = CSRDAssessmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return CSRDAssessment.objects.all()
        return CSRDAssessment.objects.filter(company__users=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CSRDAssessmentCreateSerializer
        return CSRDAssessmentSerializer
    
    @method_decorator(ratelimit(key='user', rate='10/h', method='POST'))
    def create(self, request, *args, **kwargs):
        """Create new CSRD assessment"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assessment = serializer.save()
        
        # Trigger AI analysis
        self._trigger_ai_analysis(assessment)
        
        return Response(
            CSRDAssessmentSerializer(assessment).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    @method_decorator(ratelimit(key='user', rate='5/h', method='POST'))
    def run_ai_analysis(self, request, pk=None):
        """Run AI analysis for CSRD readiness"""
        assessment = self.get_object()
        
        try:
            ai_service = CSRDAIService()
            
            # Prepare data for AI analysis
            company = assessment.company
            carbon_data = self._get_company_carbon_data(company)
            
            analysis_data = {
                'industry': company.industry,
                'company_size': assessment.company_size,
                'employee_count': assessment.employee_count,
                'annual_revenue_eur': float(assessment.annual_revenue_eur) if assessment.annual_revenue_eur else 0,
                'has_eu_operations': assessment.has_eu_operations,
                'is_listed_company': assessment.is_listed_company,
                'csrd_applicable': assessment.csrd_applicable,
                'first_reporting_year': assessment.first_reporting_year,
                'has_carbon_data': carbon_data['has_data'],
                'has_ewaste_data': company.ewasteentry_set.exists(),
                'has_social_data': False,  # Add social data check when implemented
                'has_governance_data': False,  # Add governance data check when implemented
            }
            
            # Run AI analysis
            analysis_result = ai_service.analyze_csrd_readiness(analysis_data)
            
            # Update assessment with AI results
            assessment.overall_readiness_score = analysis_result.get('overall_readiness_score', 0)
            assessment.gap_analysis = analysis_result.get('gap_analysis', {})
            assessment.priority_actions = analysis_result.get('priority_actions', [])
            assessment.compliance_timeline = analysis_result.get('compliance_timeline', {})
            assessment.ai_recommendations = f"Analysis completed on {timezone.now().strftime('%Y-%m-%d')}"
            assessment.save()
            
            # Create ESRS datapoints if not exist
            self._create_esrs_datapoints(assessment, analysis_result.get('gap_analysis', {}))
            
            # Create compliance actions
            self._create_compliance_actions(assessment, analysis_result.get('priority_actions', []))
            
            return Response({
                'message': 'AI analysis completed successfully',
                'readiness_score': assessment.overall_readiness_score,
                'summary': {
                    'total_datapoints': assessment.esrs_datapoints.count(),
                    'completed_datapoints': assessment.esrs_datapoints.filter(data_availability='available').count(),
                    'high_priority_actions': assessment.compliance_actions.filter(priority__in=['critical', 'high']).count()
                }
            })
            
        except Exception as e:
            logger.error(f"Error in AI analysis: {str(e)}")
            return Response(
                {'error': 'Failed to complete AI analysis', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def materiality_questionnaire(self, request, pk=None):
        """Generate materiality assessment questionnaire"""
        assessment = self.get_object()
        
        # Check cache first
        cache_key = f"materiality_questions_{assessment.company.industry}_{assessment.company_size}"
        questions = cache.get(cache_key)
        
        if not questions:
            try:
                ai_service = CSRDAIService()
                company_profile = {
                    'industry': assessment.company.industry,
                    'employee_count': assessment.employee_count,
                    'company_size': assessment.company_size
                }
                questions = ai_service.generate_materiality_assessment(company_profile)
                
                # Cache for 1 hour
                cache.set(cache_key, questions, 3600)
                
            except Exception as e:
                logger.error(f"Error generating materiality questions: {str(e)}")
                return Response(
                    {'error': 'Failed to generate questionnaire'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response({'questions': questions})
    
    @action(detail=True, methods=['post'])
    def submit_materiality_responses(self, request, pk=None):
        """Submit materiality assessment responses"""
        assessment = self.get_object()
        responses = request.data.get('responses', {})
        
        # Update ESRS datapoints based on materiality responses
        for question_id, response in responses.items():
            esrs_category = question_id.split('_')[0]
            
            # Find or create datapoint
            datapoint, created = ESRSDataPoint.objects.get_or_create(
                assessment=assessment,
                datapoint_code=question_id,
                defaults={
                    'esrs_category': esrs_category,
                    'datapoint_name': f"Materiality Assessment - {question_id}",
                    'description': f"Response to materiality question {question_id}"
                }
            )
            
            # Set materiality level based on response
            if response == 'Yes':
                datapoint.materiality_level = 'high'
            elif response == 'Partially':
                datapoint.materiality_level = 'medium'
            elif response == 'No':
                datapoint.materiality_level = 'low'
            else:
                datapoint.materiality_level = 'not_material'
            
            datapoint.materiality_justification = f"Materiality assessment response: {response}"
            datapoint.save()
        
        # Recalculate readiness score
        self._recalculate_readiness_score(assessment)
        
        return Response({
            'message': 'Materiality responses submitted successfully',
            'updated_datapoints': len(responses)
        })
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get compliance dashboard statistics"""
        user = request.user
        
        if user.is_superuser:
            assessments = CSRDAssessment.objects.all()
        else:
            assessments = CSRDAssessment.objects.filter(company__users=user)
        
        stats = {
            'total_assessments': assessments.count(),
            'completed_assessments': assessments.filter(status='completed').count(),
            'csrd_applicable_companies': assessments.filter(csrd_applicable=True).count(),
            'average_readiness_score': assessments.aggregate(Avg('overall_readiness_score'))['overall_readiness_score__avg'] or 0,
            'high_priority_actions': ComplianceAction.objects.filter(
                assessment__in=assessments,
                priority__in=['critical', 'high'],
                status__in=['pending', 'in_progress']
            ).count(),
            'upcoming_deadlines': ComplianceAction.objects.filter(
                assessment__in=assessments,
                due_date__gte=timezone.now().date(),
                due_date__lte=timezone.now().date() + timezone.timedelta(days=30)
            ).count()
        }
        
        return Response(stats)
    
    def _trigger_ai_analysis(self, assessment):
        """Trigger AI analysis in background"""
        # For now, run synchronously. In production, use Celery task
        try:
            self.run_ai_analysis(self.request, pk=assessment.pk)
        except Exception as e:
            logger.error(f"Failed to trigger AI analysis: {str(e)}")
    
    def _get_company_carbon_data(self, company):
        """Get company carbon footprint data"""
        latest_footprint = CarbonFootprint.objects.filter(company=company).order_by('-created_at').first()
        
        if latest_footprint:
            return {
                'has_data': True,
                'total': float(latest_footprint.total_emissions),
                'scope1': float(latest_footprint.scope1_emissions),
                'scope2': float(latest_footprint.scope2_emissions),
                'scope3': float(latest_footprint.scope3_emissions)
            }
        return {'has_data': False}
    
    def _create_esrs_datapoints(self, assessment, gap_analysis):
        """Create ESRS datapoints based on gap analysis"""
        esrs_mapping = {
            'E1_climate': ('E1', 'Climate Change'),
            'E2_pollution': ('E2', 'Pollution'),
            'E3_water': ('E3', 'Water and Marine Resources'),
            'E4_biodiversity': ('E4', 'Biodiversity and Ecosystems'),
            'E5_circular': ('E5', 'Circular Economy'),
            'S1_workforce': ('S1', 'Own Workforce'),
            'S2_value_chain': ('S2', 'Value Chain Workers'),
            'S3_communities': ('S3', 'Affected Communities'),
            'S4_consumers': ('S4', 'Consumers and End-Users'),
            'G1_governance': ('G1', 'Business Conduct')
        }
        
        for category_key, category_data in gap_analysis.items():
            if category_key in esrs_mapping:
                category_code, category_name = esrs_mapping[category_key]
                
                # Create main category datapoint if not exists
                datapoint, created = ESRSDataPoint.objects.get_or_create(
                    assessment=assessment,
                    datapoint_code=f"{category_code}-MAIN",
                    defaults={
                        'esrs_category': category_code,
                        'datapoint_name': f"{category_name} - Main Assessment",
                        'description': f"Primary datapoint for {category_name}",
                        'materiality_level': category_data.get('priority', 'medium'),
                        'data_availability': 'available' if category_data.get('score', 0) > 70 else 'missing'
                    }
                )
    
    def _create_compliance_actions(self, assessment, priority_actions):
        """Create compliance actions from AI recommendations"""
        for action_data in priority_actions[:10]:  # Limit to top 10 actions
            ComplianceAction.objects.get_or_create(
                assessment=assessment,
                title=action_data.get('action', 'Action Required'),
                defaults={
                    'description': action_data.get('action', 'Action Required'),
                    'priority': action_data.get('priority', 'medium'),
                    'assigned_department': action_data.get('department', 'Sustainability'),
                    'estimated_hours': self._estimate_hours_from_timeline(action_data.get('timeline', ''))
                }
            )
    
    def _estimate_hours_from_timeline(self, timeline_str):
        """Estimate hours from timeline string"""
        if 'week' in timeline_str.lower():
            try:
                weeks = int(''.join(filter(str.isdigit, timeline_str)))
                return weeks * 40  # 40 hours per week
            except:
                return 40
        return 40
    
    def _recalculate_readiness_score(self, assessment):
        """Recalculate overall readiness score"""
        datapoints = assessment.esrs_datapoints.all()
        if not datapoints.exists():
            return
        
        # Simple scoring based on data availability
        available_count = datapoints.filter(data_availability='available').count()
        total_count = datapoints.count()
        
        if total_count > 0:
            score = int((available_count / total_count) * 100)
            assessment.overall_readiness_score = score
            assessment.save()


class ComplianceActionViewSet(viewsets.ModelViewSet):
    """Compliance Action Management"""
    
    serializer_class = ComplianceActionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return ComplianceAction.objects.all()
        return ComplianceAction.objects.filter(assessment__company__users=user)
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Update action progress"""
        action = self.get_object()
        progress = request.data.get('progress', 0)
        notes = request.data.get('notes', '')
        
        action.progress_percentage = min(100, max(0, progress))
        if notes:
            action.notes = f"{action.notes}\n{timezone.now().strftime('%Y-%m-%d')}: {notes}" if action.notes else notes
        
        if progress >= 100:
            action.status = 'completed'
            action.completed_at = timezone.now()
        elif progress > 0:
            action.status = 'in_progress'
        
        action.save()
        
        return Response({
            'message': 'Progress updated successfully',
            'current_progress': action.progress_percentage,
            'status': action.status
        })


class RegulatoryUpdateViewSet(viewsets.ModelViewSet):
    """Regulatory Update Management"""
    
    serializer_class = RegulatoryUpdateSerializer
    permission_classes = [IsAuthenticated]
    queryset = RegulatoryUpdate.objects.all()
    
    @action(detail=True, methods=['post'])
    @method_decorator(ratelimit(key='user', rate='5/h', method='POST'))
    def analyze_impact(self, request, pk=None):
        """Analyze regulatory update impact using AI"""
        update = self.get_object()
        
        try:
            ai_service = CSRDAIService()
            
            # Get companies for impact analysis
            companies = list(Company.objects.values('id', 'name', 'industry', 'employees')[:20])
            
            # Run AI analysis
            analysis = ai_service.analyze_regulatory_update(
                update.description,
                companies
            )
            
            # Update the regulatory update with AI analysis
            update.ai_impact_analysis = analysis.get('summary', '')
            update.affected_datapoints = analysis.get('affected_esrs', [])
            update.recommended_actions = analysis.get('recommended_actions', [])
            update.save()
            
            # Notify affected companies (implementation depends on notification system)
            affected_company_ids = [c['company_id'] for c in analysis.get('company_impact_analysis', []) if c.get('impact_level') in ['high', 'medium']]
            
            return Response({
                'message': 'Impact analysis completed',
                'analysis': analysis,
                'affected_companies': len(affected_company_ids)
            })
            
        except Exception as e:
            logger.error(f"Error analyzing regulatory update: {str(e)}")
            return Response(
                {'error': 'Failed to analyze impact'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get regulatory updates statistics"""
        try:
            regulatory_service = RegulatoryUpdateService()
            stats = {
                'total_updates': RegulatoryUpdate.objects.count(),
                'recent_updates': RegulatoryUpdate.objects.filter(
                    published_date__gte=timezone.now().date() - timedelta(days=30)
                ).count(),
                'high_impact_updates': RegulatoryUpdate.objects.filter(
                    impact_assessment__icontains='high'
                ).count(),
                'sources': {}
            }
            
            # Count by source
            sources = RegulatoryUpdate.objects.values('source').annotate(
                count=Count('id')
            )
            stats['sources'] = {item['source']: item['count'] for item in sources}
            
            return Response(stats)
            
        except Exception as e:
            logger.error(f"Error getting regulatory stats: {str(e)}")
            return Response(
                {'error': 'Failed to get statistics'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    @method_decorator(ratelimit(key='user', rate='2/h', method='POST'))
    def sync(self, request):
        """Manually trigger regulatory updates sync"""
        try:
            regulatory_service = RegulatoryUpdateService()
            results = regulatory_service.monitor_regulatory_changes()
            
            return Response({
                'message': 'Sync completed successfully',
                'created_count': results['created_count'],
                'efrag_updates': len(results['efrag_updates']),
                'eur_lex_updates': len(results['eur_lex_updates']),
                'errors': results['errors']
            })
            
        except Exception as e:
            logger.error(f"Error syncing regulatory updates: {str(e)}")
            return Response(
                {'error': 'Failed to sync updates'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ESRSDataPointEnhancedViewSet(viewsets.ModelViewSet):
    """Enhanced ESRS Data Point Management with hierarchy support"""
    
    serializer_class = ESRSDataPointSerializer
    permission_classes = [IsAuthenticated]
    queryset = ESRSDataPoint.objects.all()
    
    @action(detail=False, methods=['get'])
    def hierarchy(self, request):
        """Get ESRS datapoints organized by standard and section"""
        try:
            datapoint_service = ESRSDatapointService()
            hierarchy = datapoint_service.get_datapoint_hierarchy()
            
            return Response(hierarchy)
            
        except Exception as e:
            logger.error(f"Error getting datapoint hierarchy: {str(e)}")
            return Response(
                {'error': 'Failed to get hierarchy'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search datapoints by query and category"""
        try:
            query = request.query_params.get('q', '')
            category = request.query_params.get('category', None)
            
            if not query:
                return Response({'error': 'Query parameter required'}, status=400)
            
            datapoint_service = ESRSDatapointService()
            results = datapoint_service.search_datapoints(query, category)
            
            serializer = self.get_serializer(results, many=True)
            return Response({
                'results': serializer.data,
                'count': len(results)
            })
            
        except Exception as e:
            logger.error(f"Error searching datapoints: {str(e)}")
            return Response(
                {'error': 'Failed to search datapoints'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get datapoints statistics"""
        try:
            datapoint_service = ESRSDatapointService()
            stats = datapoint_service.get_datapoints_count()
            
            return Response(stats)
            
        except Exception as e:
            logger.error(f"Error getting datapoint stats: {str(e)}")
            return Response(
                {'error': 'Failed to get statistics'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    @method_decorator(ratelimit(key='user', rate='1/h', method='POST'))
    def sync_datapoints(self, request):
        """Trigger ESRS datapoints synchronization"""
        try:
            # This would trigger the management command
            from django.core.management import call_command
            
            source = request.data.get('source', 'efrag')
            update_existing = request.data.get('update_existing', False)
            
            # Run sync command
            call_command('sync_esrs_datapoints', 
                        source=source, 
                        update_existing=update_existing)
            
            return Response({
                'message': 'Datapoint sync completed successfully',
                'source': source
            })
            
        except Exception as e:
            logger.error(f"Error syncing datapoints: {str(e)}")
            return Response(
                {'error': 'Failed to sync datapoints'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ESRSDatapointCatalogViewSet(viewsets.ModelViewSet):
    """ESRS Datapoint Catalog Management"""
    
    serializer_class = ESRSDatapointCatalogSerializer
    permission_classes = [IsAuthenticated]
    queryset = ESRSDatapointCatalog.objects.all()
    filterset_fields = ['standard', 'category', 'mandatory', 'data_type']
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['standard', 'code', 'name', 'mandatory']
    ordering = ['standard', 'disclosure_requirement', 'code']
    
    @action(detail=False, methods=['get'])
    def hierarchy(self, request):
        """Get datapoints organized by hierarchy"""
        try:
            datapoint_service = ESRSDatapointService()
            hierarchy = datapoint_service.get_datapoint_hierarchy()
            
            return Response(hierarchy)
            
        except Exception as e:
            logger.error(f"Error getting datapoint hierarchy: {str(e)}")
            return Response(
                {'error': 'Failed to get hierarchy'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def search_catalog(self, request):
        """Search catalog datapoints by query and category"""
        try:
            query = request.query_params.get('q', '')
            category = request.query_params.get('category', None)
            
            if not query:
                return Response({'error': 'Query parameter required'}, status=400)
            
            datapoint_service = ESRSDatapointService()
            results = datapoint_service.search_datapoints(query, category)
            
            serializer = self.get_serializer(results, many=True)
            return Response({
                'results': serializer.data,
                'count': len(results)
            })
            
        except Exception as e:
            logger.error(f"Error searching catalog datapoints: {str(e)}")
            return Response(
                {'error': 'Failed to search datapoints'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get catalog statistics"""
        try:
            datapoint_service = ESRSDatapointService()
            stats = datapoint_service.get_datapoints_count()
            
            return Response(stats)
            
        except Exception as e:
            logger.error(f"Error getting catalog stats: {str(e)}")
            return Response(
                {'error': 'Failed to get statistics'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    @method_decorator(ratelimit(key='user', rate='1/h', method='POST'))
    def sync_datapoints(self, request):
        """Trigger ESRS datapoints synchronization"""
        try:
            from django.core.management import call_command
            
            source = request.data.get('source', 'efrag')
            update_existing = request.data.get('update_existing', False)
            
            # Run sync command
            call_command('sync_esrs_datapoints', 
                        source=source, 
                        update_existing=update_existing)
            
            # Get updated stats
            datapoint_service = ESRSDatapointService()
            stats = datapoint_service.get_datapoints_count()
            
            return Response({
                'message': 'Datapoint sync completed successfully',
                'source': source,
                'stats': stats
            })
            
        except Exception as e:
            logger.error(f"Error syncing datapoints: {str(e)}")
            return Response(
                {'error': 'Failed to sync datapoints'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ComplianceReportingViewSet(viewsets.ViewSet):
    """Compliance reporting and analytics"""
    
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def datapoint_coverage(self, request):
        """Generate datapoint coverage report"""
        try:
            from .services import ComplianceReportingService
            reporting_service = ComplianceReportingService()
            
            report = reporting_service.generate_datapoint_coverage_report()
            return Response(report)
            
        except Exception as e:
            logger.error(f"Error generating coverage report: {str(e)}")
            return Response(
                {'error': 'Failed to generate report'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def readiness_summary(self, request):
        """Generate compliance readiness summary"""
        try:
            from .services import ComplianceReportingService
            reporting_service = ComplianceReportingService()
            
            report = reporting_service.generate_compliance_readiness_report()
            return Response(report)
            
        except Exception as e:
            logger.error(f"Error generating readiness report: {str(e)}")
            return Response(
                {'error': 'Failed to generate report'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
