from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from datetime import timedelta
from carbon.utils import get_dashboard_analytics
from carbon.advanced_utils import (
    calculate_monthly_trends, predict_carbon_trajectory,
    calculate_industry_benchmarks, calculate_carbon_roi
)


@method_decorator(ratelimit(key='user', rate='100/h', method='GET'), name='get')
@method_decorator(cache_page(60 * 10), name='get')  # Cache for 10 minutes
class DashboardAnalyticsView(APIView):
    """Dashboard analytics endpoint"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get comprehensive dashboard analytics"""
        if not request.user.company:
            return Response(
                {'error': 'User must be associated with a company'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        analytics = get_dashboard_analytics(request.user.company)
        return Response(analytics)


class TrendsAnalyticsView(APIView):
    """Enhanced trends analytics endpoint with predictions"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get advanced monthly trends data with predictions"""
        if not request.user.company:
            return Response(
                {'error': 'User must be associated with a company'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get months parameter (default 12)
        months = int(request.query_params.get('months', 12))
        months = min(months, 24)  # Limit to 24 months max
        
        # Get advanced trends with detailed breakdown
        trends = calculate_monthly_trends(request.user.company, months)
        
        # Get predictions for next 6 months
        predictions = predict_carbon_trajectory(request.user.company, 6)
        
        return Response({
            'trends': trends,
            'predictions': predictions,
            'summary': {
                'total_months': len(trends),
                'latest_month': trends[-1] if trends else None,
                'carbon_neutral_months': len([t for t in trends if t['balance']['carbon_neutral']]),
                'improvement_trend': self._calculate_improvement_trend(trends),
            }
        })
    
    def _calculate_improvement_trend(self, trends):
        """Calculate if company is improving over time"""
        if len(trends) < 2:
            return 'insufficient_data'
        
        recent_neutrality = trends[-3:] if len(trends) >= 3 else trends[-2:]
        avg_recent_neutrality = sum(t['balance']['neutrality_percentage'] for t in recent_neutrality) / len(recent_neutrality)
        
        older_neutrality = trends[:3] if len(trends) >= 6 else trends[:len(trends)//2]
        avg_older_neutrality = sum(t['balance']['neutrality_percentage'] for t in older_neutrality) / len(older_neutrality)
        
        if avg_recent_neutrality > avg_older_neutrality + 10:
            return 'improving'
        elif avg_recent_neutrality < avg_older_neutrality - 10:
            return 'declining'
        else:
            return 'stable'


class ImpactMetricsView(APIView):
    """Enhanced impact metrics endpoint with benchmarking and ROI"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get comprehensive impact metrics, benchmarks, and ROI analysis"""
        if not request.user.company:
            return Response(
                {'error': 'User must be associated with a company'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from carbon.models import CarbonFootprint, OffsetPurchase
        from ewaste.models import EwasteEntry
        from companies.models import Company
        
        company = request.user.company
        
        # Company's impact metrics
        total_emissions = CarbonFootprint.objects.filter(
            company=company, status='verified'
        ).aggregate(Sum('total_emissions'))['total_emissions__sum'] or 0
        
        total_offsets = OffsetPurchase.objects.filter(
            company=company, status='completed'
        ).aggregate(Sum('total_co2_offset'))['total_co2_offset__sum'] or 0
        
        total_ewaste_co2 = EwasteEntry.objects.filter(
            company=company
        ).aggregate(Sum('estimated_co2_saved'))['estimated_co2_saved__sum'] or 0
        
        total_devices = EwasteEntry.objects.filter(
            company=company
        ).aggregate(Sum('quantity'))['quantity__sum'] or 0
        
        # Get industry benchmarks
        benchmarks = calculate_industry_benchmarks(company)
        
        # Get ROI analysis
        roi_analysis = calculate_carbon_roi(company)
        
        # Industry benchmarking (enhanced)
        industry_companies = Company.objects.filter(
            industry=company.industry
        ).exclude(id=company.id).count()
        
        # Environmental impact equivalents
        trees_planted_equivalent = int(total_offsets * 40)  # ~40 trees per tonne CO2
        cars_off_road_equivalent = int(total_offsets / 4.6)  # Average car emits 4.6 tCO2/year
        
        # Enhanced sustainability scoring
        carbon_balance = total_offsets + total_ewaste_co2 - total_emissions
        sustainability_score = min(max((carbon_balance / max(total_emissions, 1)) * 50 + 50, 0), 100)
        
        response_data = {
            'company_metrics': {
                'total_emissions_tco2': float(total_emissions),
                'total_offsets_tco2': float(total_offsets),
                'total_ewaste_co2_saved': float(total_ewaste_co2),
                'total_devices_donated': total_devices,
                'net_carbon_impact': float(carbon_balance),
                'sustainability_score': round(sustainability_score, 1),
            },
            'environmental_equivalents': {
                'trees_planted_equivalent': trees_planted_equivalent,
                'cars_off_road_equivalent': cars_off_road_equivalent,
                'households_powered_equivalent': int(total_offsets * 0.85),  # Households powered for a year
                'plastic_bottles_recycled': int(total_devices * 50),  # Estimated equivalent
            },
            'sustainability_goals': {
                'carbon_neutral_progress': min((total_offsets + total_ewaste_co2) / max(total_emissions, 1) * 100, 100),
                'ewaste_diversion_impact': total_devices,
                'community_impact_score': min(total_devices / 10, 100),  # Simplified scoring
                'overall_sustainability_rating': (
                    'excellent' if sustainability_score >= 80 else
                    'good' if sustainability_score >= 60 else
                    'fair' if sustainability_score >= 40 else
                    'needs_improvement'
                ),
            },
            'roi_analysis': roi_analysis,
        }
        
        # Add benchmarks if available
        if 'error' not in benchmarks:
            response_data['industry_benchmarks'] = benchmarks
        
        return Response(response_data)


class RealTimeDashboardView(APIView):
    """Real-time dashboard analytics with live updates"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get real-time dashboard data"""
        if not request.user.company:
            return Response(
                {'error': 'User must be associated with a company'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get basic dashboard analytics
        dashboard_data = get_dashboard_analytics(request.user.company)
        
        # Add real-time enhancements
        from carbon.models import CarbonFootprint, OffsetPurchase
        from ewaste.models import EwasteEntry
        
        # Recent activity (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        recent_activity = {
            'new_footprints': CarbonFootprint.objects.filter(
                company=request.user.company,
                created_at__gte=thirty_days_ago
            ).count(),
            'recent_purchases': OffsetPurchase.objects.filter(
                company=request.user.company,
                purchase_date__gte=thirty_days_ago
            ).count(),
            'recent_donations': EwasteEntry.objects.filter(
                company=request.user.company,
                created_at__gte=thirty_days_ago
            ).count(),
        }
        
        # Quick insights
        latest_footprint = CarbonFootprint.objects.filter(
            company=request.user.company
        ).order_by('-created_at').first()
        
        carbon_balance = dashboard_data.get('carbon_balance', 0)
        insights = []
        
        if carbon_balance > 0:
            insights.append({
                'type': 'success',
                'title': 'Carbon Positive',
                'message': f'Your company has offset {carbon_balance:.1f} tCO2 more than emitted!'
            })
        elif carbon_balance < -50:
            insights.append({
                'type': 'warning',
                'title': 'High Emissions',
                'message': f'Consider purchasing {abs(carbon_balance):.1f} tCO2 in offsets to achieve neutrality.'
            })
        
        if recent_activity['recent_donations'] > 10:
            insights.append({
                'type': 'info',
                'title': 'Great E-waste Impact',
                'message': f'You\'ve donated {recent_activity["recent_donations"]} devices this month!'
            })
        
        dashboard_data.update({
            'real_time_data': {
                'last_updated': timezone.now().isoformat(),
                'recent_activity': recent_activity,
                'live_insights': insights,
                'quick_stats': {
                    'days_since_last_footprint': (
                        (timezone.now() - latest_footprint.created_at).days 
                        if latest_footprint else None
                    ),
                    'carbon_neutral_status': carbon_balance >= 0,
                    'monthly_target_progress': min(
                        (dashboard_data.get('total_offsets', 0) / 
                         max(dashboard_data.get('total_emissions', 1), 1)) * 100, 
                        100
                    ),
                }
            }
        })
        
        return Response(dashboard_data)


class BenchmarkingView(APIView):
    """Industry benchmarking and competitive analysis"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get detailed industry benchmarking analysis"""
        if not request.user.company:
            return Response(
                {'error': 'User must be associated with a company'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        benchmarks = calculate_industry_benchmarks(request.user.company)
        
        if 'error' in benchmarks:
            return Response(benchmarks, status=status.HTTP_404_NOT_FOUND)
        
        # Add competitive intelligence
        from companies.models import Company
        from carbon.models import CarbonFootprint
        
        # Get top performers in industry
        industry_companies = Company.objects.filter(
            industry=request.user.company.industry
        ).exclude(id=request.user.company.id)
        
        top_performers = []
        for company in industry_companies[:5]:  # Limit to top 5
            latest_footprint = CarbonFootprint.objects.filter(
                company=company,
                status='verified'
            ).order_by('-created_at').first()
            
            if latest_footprint:
                top_performers.append({
                    'company_name': company.name,
                    'employees': company.employees,
                    'emissions_per_employee': float(latest_footprint.total_emissions) / max(company.employees, 1),
                    'total_emissions': float(latest_footprint.total_emissions),
                })
        
        # Sort by emissions per employee
        top_performers.sort(key=lambda x: x['emissions_per_employee'])
        
        benchmarks['competitive_analysis'] = {
            'top_performers': top_performers[:3],  # Top 3 performers
            'improvement_opportunities': self._get_improvement_opportunities(benchmarks),
        }
        
        return Response(benchmarks)
    
    def _get_improvement_opportunities(self, benchmarks):
        """Generate specific improvement opportunities"""
        opportunities = []
        
        company_perf = benchmarks.get('company_performance', {})
        industry_avg = benchmarks.get('industry_averages', {})
        comparison = benchmarks.get('comparison', {})
        
        if comparison.get('vs_industry_average', 0) > 20:
            opportunities.append({
                'area': 'Overall Emissions',
                'impact': 'high',
                'description': 'Focus on comprehensive emissions reduction strategy',
                'potential_savings': f"{comparison['vs_industry_average']:.1f}% reduction opportunity"
            })
        
        # Scope-specific opportunities
        if industry_avg.get('scope1_emissions', 0) > 0:
            scope1_ratio = company_perf.get('total_emissions', 0) * 0.3  # Assume 30% scope 1
            if scope1_ratio > industry_avg['scope1_emissions'] * 1.2:
                opportunities.append({
                    'area': 'Direct Emissions (Scope 1)',
                    'impact': 'medium',
                    'description': 'Consider fuel efficiency improvements and equipment upgrades',
                    'potential_savings': '10-20% emissions reduction'
                })
        
        return opportunities


class PredictiveAnalyticsView(APIView):
    """Predictive analytics and forecasting"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get predictive analytics and carbon trajectory forecasts"""
        if not request.user.company:
            return Response(
                {'error': 'User must be associated with a company'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get prediction parameters
        months_ahead = int(request.query_params.get('months', 6))
        months_ahead = min(months_ahead, 12)  # Limit to 12 months
        
        # Get carbon trajectory predictions
        predictions = predict_carbon_trajectory(request.user.company, months_ahead)
        
        if 'error' in predictions:
            return Response(predictions, status=status.HTTP_400_BAD_REQUEST)
        
        # Add scenario analysis
        scenarios = self._generate_scenarios(request.user.company, months_ahead)
        
        # Add recommendations based on predictions
        recommendations = self._generate_predictive_recommendations(predictions)
        
        return Response({
            'predictions': predictions,
            'scenarios': scenarios,
            'recommendations': recommendations,
            'confidence_score': self._calculate_confidence_score(predictions),
        })
    
    def _generate_scenarios(self, company, months_ahead):
        """Generate different scenarios (conservative, optimistic, aggressive)"""
        base_predictions = predict_carbon_trajectory(company, months_ahead)
        
        if 'error' in base_predictions:
            return []
        
        scenarios = []
        base_growth = base_predictions.get('trends', {})
        
        # Conservative scenario (slower offset growth)
        conservative_offsets_growth = base_growth.get('offsets_growth_rate', 10) * 0.5
        scenarios.append({
            'name': 'Conservative',
            'description': 'Maintaining current pace of offset purchases',
            'carbon_neutral_months': base_predictions.get('insights', {}).get('carbon_neutral_in_months', None),
            'offset_growth_rate': conservative_offsets_growth,
        })
        
        # Aggressive scenario (accelerated offset purchases)
        aggressive_offsets_growth = base_growth.get('offsets_growth_rate', 10) * 2
        aggressive_neutral_months = max((base_predictions.get('insights', {}).get('carbon_neutral_in_months', 12) or 12) - 3, 1)
        scenarios.append({
            'name': 'Aggressive',
            'description': 'Doubling offset purchase investments',
            'carbon_neutral_months': aggressive_neutral_months,
            'offset_growth_rate': aggressive_offsets_growth,
        })
        
        return scenarios
    
    def _generate_predictive_recommendations(self, predictions):
        """Generate actionable recommendations based on predictions"""
        recommendations = []
        
        insights = predictions.get('insights', {})
        
        if insights.get('carbon_neutral_in_months'):
            months = insights['carbon_neutral_in_months']
            if months <= 6:
                recommendations.append({
                    'priority': 'high',
                    'action': 'Accelerate Current Strategy',
                    'description': f'You\'re on track to be carbon neutral in {months} months. Consider increasing investments to achieve it sooner.',
                })
            elif months <= 12:
                recommendations.append({
                    'priority': 'medium',
                    'action': 'Maintain Current Pace',
                    'description': f'Good progress! Carbon neutrality expected in {months} months with current strategy.',
                })
        else:
            recommendations.append({
                'priority': 'high',
                'action': 'Increase Offset Investments',
                'description': 'Current trajectory may not achieve carbon neutrality. Consider increasing offset purchases or e-waste initiatives.',
            })
        
        if insights.get('current_trajectory') == 'needs_improvement':
            recommendations.append({
                'priority': 'high',
                'action': 'Strategic Review Required',  
                'description': 'Current emissions trajectory is concerning. Consider comprehensive sustainability audit.',
            })
        
        return recommendations
    
    def _calculate_confidence_score(self, predictions):
        """Calculate confidence score for predictions"""
        # Simple confidence scoring based on data availability
        if 'error' in predictions:
            return 0
        
        prediction_data = predictions.get('predictions', [])
        if len(prediction_data) == 0:
            return 0
        
        # Higher confidence with more historical data and stable trends
        base_confidence = min(len(prediction_data) * 10, 80)  # Max 80% base confidence
        
        # Adjust based on trend stability
        trends = predictions.get('trends', {})
        emissions_growth = abs(trends.get('emissions_growth_rate', 0))
        offsets_growth = abs(trends.get('offsets_growth_rate', 0))
        
        # More stable trends = higher confidence
        if emissions_growth < 10 and offsets_growth < 50:  # Reasonable growth rates
            base_confidence += 10
        
        return min(base_confidence, 90)  # Cap at 90% confidence
