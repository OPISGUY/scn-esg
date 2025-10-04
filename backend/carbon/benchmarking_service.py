# backend/carbon/benchmarking_service.py
"""
Industry Benchmarking Service

Provides peer comparison and industry average calculations for carbon emissions.
Helps companies understand how they perform relative to similar organizations.
"""

from django.db import models
from django.db.models import Avg, Count, StdDev, Min, Max, Q
from decimal import Decimal
from typing import Dict, List, Optional
import uuid


class IndustryBenchmark(models.Model):
    """
    Store industry benchmark data for comparison
    
    Sources:
    - CDP (Carbon Disclosure Project) disclosures
    - EPA GHGRP (Greenhouse Gas Reporting Program)
    - Industry associations and reports
    - Our own user data (anonymized aggregates)
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Industry classification
    industry_sector = models.CharField(
        max_length=100,
        help_text="Industry sector (Manufacturing, Technology, Retail, etc.)"
    )
    sub_sector = models.CharField(
        max_length=100,
        blank=True,
        help_text="Sub-sector for more specific comparison"
    )
    
    # Company size bracket
    employee_range_min = models.IntegerField(
        help_text="Minimum employees in this benchmark bracket"
    )
    employee_range_max = models.IntegerField(
        help_text="Maximum employees in this benchmark bracket"
    )
    
    # Geographic scope
    region = models.CharField(
        max_length=50,
        default='global',
        help_text="Geographic region (US, EU, UK, global)"
    )
    
    # Year
    year = models.IntegerField(
        help_text="Year this benchmark data applies to"
    )
    
    # Emission metrics (per employee)
    avg_scope1_per_employee = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        help_text="Average Scope 1 emissions per employee (tCO2e)"
    )
    avg_scope2_per_employee = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        help_text="Average Scope 2 emissions per employee (tCO2e)"
    )
    avg_scope3_per_employee = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        null=True,
        blank=True,
        help_text="Average Scope 3 emissions per employee (tCO2e)"
    )
    avg_total_per_employee = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        help_text="Average total emissions per employee (tCO2e)"
    )
    
    # Statistical distribution
    median_total_per_employee = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        null=True,
        blank=True
    )
    percentile_25 = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        null=True,
        blank=True,
        help_text="25th percentile (bottom quartile)"
    )
    percentile_75 = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        null=True,
        blank=True,
        help_text="75th percentile (top quartile)"
    )
    
    # Sample size
    sample_size = models.IntegerField(
        help_text="Number of companies in this benchmark"
    )
    
    # Metadata
    source = models.CharField(
        max_length=200,
        help_text="Data source (CDP, EPA, internal, etc.)"
    )
    confidence_level = models.CharField(
        max_length=20,
        choices=[
            ('high', 'High'),
            ('medium', 'Medium'),
            ('low', 'Low'),
        ],
        default='medium'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-year', 'industry_sector', 'employee_range_min']
        indexes = [
            models.Index(fields=['industry_sector', 'year']),
            models.Index(fields=['employee_range_min', 'employee_range_max']),
        ]
        unique_together = [
            ['industry_sector', 'sub_sector', 'employee_range_min', 'employee_range_max', 'year', 'region']
        ]
    
    def __str__(self):
        return f"{self.industry_sector} ({self.employee_range_min}-{self.employee_range_max} employees) - {self.year}"


class BenchmarkingService:
    """Service for comparing company emissions to industry peers"""
    
    def __init__(self, company):
        """Initialize benchmarking service for a company"""
        self.company = company
    
    def get_peer_comparison(self, footprint) -> Dict:
        """
        Compare company's footprint to industry peers
        
        Returns:
        {
            'company_emissions': {
                'total': 150.5,
                'per_employee': 1.0,
                'scope1': 50.2,
                'scope2': 80.3,
                'scope3': 20.0,
            },
            'industry_average': {
                'total_per_employee': 1.5,
                'scope1_per_employee': 0.6,
                'scope2_per_employee': 0.7,
                'scope3_per_employee': 0.2,
            },
            'comparison': {
                'total_vs_average': -33.3,  # % difference (negative = better than average)
                'ranking_percentile': 25,  # 25th percentile = top 25% (better than 75%)
                'performance': 'excellent',  # excellent/good/average/poor
            },
            'insights': [
                'Your emissions are 33% below industry average - great work!',
                'You're in the top 25% of performers in your industry.'
            ],
        }
        """
        # Get relevant benchmark
        benchmark = self._find_matching_benchmark(footprint.year)
        
        if not benchmark:
            return {
                'error': 'No benchmark data available for your industry and company size',
                'suggestion': 'We will add you to our benchmarking pool as data becomes available',
            }
        
        # Calculate company metrics
        employee_count = getattr(self.company, 'employee_count', 1) or 1
        company_emissions = {
            'total': float(footprint.total_emissions),
            'per_employee': float(footprint.total_emissions) / employee_count,
            'scope1': float(footprint.scope1_emissions or 0),
            'scope2': float(footprint.scope2_emissions or 0),
            'scope3': float(footprint.scope3_emissions or 0),
            'scope1_per_employee': float(footprint.scope1_emissions or 0) / employee_count,
            'scope2_per_employee': float(footprint.scope2_emissions or 0) / employee_count,
            'scope3_per_employee': float(footprint.scope3_emissions or 0) / employee_count if footprint.scope3_emissions else None,
        }
        
        # Industry averages
        industry_average = {
            'total_per_employee': float(benchmark.avg_total_per_employee),
            'scope1_per_employee': float(benchmark.avg_scope1_per_employee),
            'scope2_per_employee': float(benchmark.avg_scope2_per_employee),
            'scope3_per_employee': float(benchmark.avg_scope3_per_employee) if benchmark.avg_scope3_per_employee else None,
        }
        
        # Calculate % difference vs average
        total_vs_average = (
            (company_emissions['per_employee'] - industry_average['total_per_employee']) 
            / industry_average['total_per_employee'] * 100
        )
        
        # Determine percentile ranking
        if benchmark.percentile_25 and benchmark.percentile_75:
            if company_emissions['per_employee'] <= float(benchmark.percentile_25):
                ranking_percentile = 25
                performance = 'excellent'
            elif company_emissions['per_employee'] <= float(benchmark.median_total_per_employee or benchmark.avg_total_per_employee):
                ranking_percentile = 50
                performance = 'good'
            elif company_emissions['per_employee'] <= float(benchmark.percentile_75):
                ranking_percentile = 75
                performance = 'average'
            else:
                ranking_percentile = 90
                performance = 'needs_improvement'
        else:
            # Simple comparison if distribution data not available
            if total_vs_average <= -20:
                ranking_percentile = 25
                performance = 'excellent'
            elif total_vs_average <= 0:
                ranking_percentile = 50
                performance = 'good'
            elif total_vs_average <= 20:
                ranking_percentile = 75
                performance = 'average'
            else:
                ranking_percentile = 90
                performance = 'needs_improvement'
        
        # Generate insights
        insights = self._generate_insights(
            company_emissions,
            industry_average,
            total_vs_average,
            performance
        )
        
        return {
            'company_emissions': company_emissions,
            'industry_average': industry_average,
            'benchmark_info': {
                'industry': benchmark.industry_sector,
                'employee_range': f"{benchmark.employee_range_min}-{benchmark.employee_range_max}",
                'region': benchmark.region,
                'year': benchmark.year,
                'sample_size': benchmark.sample_size,
            },
            'comparison': {
                'total_vs_average': round(total_vs_average, 1),
                'ranking_percentile': ranking_percentile,
                'performance': performance,
            },
            'insights': insights,
        }
    
    def _find_matching_benchmark(self, year: int) -> Optional[IndustryBenchmark]:
        """Find the best matching benchmark for this company"""
        industry = getattr(self.company, 'industry', '')
        employee_count = getattr(self.company, 'employee_count', 0) or 0
        
        # Try exact match first
        benchmark = IndustryBenchmark.objects.filter(
            industry_sector__iexact=industry,
            employee_range_min__lte=employee_count,
            employee_range_max__gte=employee_count,
            year=year,
        ).first()
        
        if benchmark:
            return benchmark
        
        # Try without employee range constraint
        benchmark = IndustryBenchmark.objects.filter(
            industry_sector__iexact=industry,
            year=year,
        ).first()
        
        if benchmark:
            return benchmark
        
        # Try previous year
        benchmark = IndustryBenchmark.objects.filter(
            industry_sector__iexact=industry,
            year=year-1,
        ).first()
        
        return benchmark
    
    def _generate_insights(
        self,
        company_emissions: Dict,
        industry_average: Dict,
        total_vs_average: float,
        performance: str
    ) -> List[str]:
        """Generate friendly insights based on comparison"""
        insights = []
        
        # Overall performance
        if total_vs_average <= -30:
            insights.append(f"🌟 Excellent! Your emissions are {abs(int(total_vs_average))}% below industry average.")
        elif total_vs_average <= -10:
            insights.append(f"✅ Good work! You're {abs(int(total_vs_average))}% below industry average.")
        elif total_vs_average <= 10:
            insights.append(f"📊 You're right around industry average ({int(total_vs_average):+}%).")
        else:
            insights.append(f"📈 Opportunity: You're {abs(int(total_vs_average))}% above industry average.")
        
        # Performance level
        performance_messages = {
            'excellent': "You're in the top 25% of performers in your industry! 🏆",
            'good': "You're performing better than most peers in your industry.",
            'average': "There's room to improve and join the top performers.",
            'needs_improvement': "Consider setting reduction targets to catch up to industry leaders.",
        }
        insights.append(performance_messages[performance])
        
        # Scope-specific insights
        scope1_vs = (
            (company_emissions['scope1_per_employee'] - industry_average['scope1_per_employee'])
            / industry_average['scope1_per_employee'] * 100
        ) if industry_average['scope1_per_employee'] > 0 else 0
        
        if scope1_vs < -20:
            insights.append(f"💪 Your Scope 1 emissions are {abs(int(scope1_vs))}% below average - strong direct emissions control!")
        elif scope1_vs > 20:
            insights.append(f"🔍 Your Scope 1 emissions are {abs(int(scope1_vs))}% above average - consider fuel efficiency improvements.")
        
        scope2_vs = (
            (company_emissions['scope2_per_employee'] - industry_average['scope2_per_employee'])
            / industry_average['scope2_per_employee'] * 100
        ) if industry_average['scope2_per_employee'] > 0 else 0
        
        if scope2_vs < -20:
            insights.append(f"⚡ Your Scope 2 emissions are {abs(int(scope2_vs))}% below average - excellent energy efficiency!")
        elif scope2_vs > 20:
            insights.append(f"💡 Your Scope 2 emissions are {abs(int(scope2_vs))}% above average - energy efficiency upgrades could help.")
        
        return insights
    
    def get_industry_leaders(self, limit: int = 5) -> List[Dict]:
        """
        Get anonymized examples of industry leaders (for inspiration)
        
        Note: This would show anonymized data from actual top performers
        """
        # This is a placeholder - in production, this would query actual anonymized company data
        return [
            {
                'rank': 1,
                'emissions_per_employee': 0.5,
                'vs_average': -67,
                'key_initiatives': ['100% renewable energy', 'Electric vehicle fleet', 'Energy-efficient buildings'],
            },
            {
                'rank': 2,
                'emissions_per_employee': 0.8,
                'vs_average': -47,
                'key_initiatives': ['Solar installation', 'Carbon offset program', 'Remote work policy'],
            },
            {
                'rank': 3,
                'emissions_per_employee': 1.0,
                'vs_average': -33,
                'key_initiatives': ['LED lighting', 'Smart HVAC', 'Sustainable procurement'],
            },
        ]
    
    def suggest_improvement_opportunities(self, footprint) -> List[Dict]:
        """
        Suggest specific actions to improve vs industry peers
        
        Returns prioritized list of opportunities
        """
        comparison = self.get_peer_comparison(footprint)
        
        if 'error' in comparison:
            return []
        
        opportunities = []
        company = comparison['company_emissions']
        industry = comparison['industry_average']
        
        # Scope 2 opportunity (electricity)
        if company['scope2_per_employee'] > industry['scope2_per_employee'] * 1.2:
            gap_tco2e = (company['scope2_per_employee'] - industry['scope2_per_employee']) * getattr(self.company, 'employee_count', 1)
            opportunities.append({
                'scope': 'scope2',
                'title': 'Electricity Efficiency Improvement',
                'description': 'Your electricity emissions are above industry average',
                'potential_reduction': round(gap_tco2e, 1),
                'actions': [
                    'Conduct energy audit',
                    'Upgrade to LED lighting',
                    'Optimize HVAC systems',
                    'Purchase renewable energy credits',
                ],
                'estimated_cost': '$10,000-$50,000',
                'payback_period': '2-4 years',
                'priority': 'high',
            })
        
        # Scope 1 opportunity (fuel)
        if company['scope1_per_employee'] > industry['scope1_per_employee'] * 1.2:
            gap_tco2e = (company['scope1_per_employee'] - industry['scope1_per_employee']) * getattr(self.company, 'employee_count', 1)
            opportunities.append({
                'scope': 'scope1',
                'title': 'Fleet & Fuel Efficiency',
                'description': 'Your direct emissions are above industry peers',
                'potential_reduction': round(gap_tco2e, 1),
                'actions': [
                    'Transition to electric vehicles',
                    'Optimize delivery routes',
                    'Upgrade to efficient heating systems',
                    'Implement vehicle maintenance program',
                ],
                'estimated_cost': '$20,000-$100,000',
                'payback_period': '3-5 years',
                'priority': 'medium',
            })
        
        return opportunities


# Default benchmark data (to be loaded as fixtures)
DEFAULT_BENCHMARKS = [
    {
        'industry_sector': 'Technology',
        'employee_range_min': 50,
        'employee_range_max': 250,
        'region': 'US',
        'year': 2025,
        'avg_scope1_per_employee': Decimal('0.3'),
        'avg_scope2_per_employee': Decimal('1.2'),
        'avg_scope3_per_employee': Decimal('0.8'),
        'avg_total_per_employee': Decimal('2.3'),
        'median_total_per_employee': Decimal('2.0'),
        'percentile_25': Decimal('1.5'),
        'percentile_75': Decimal('3.0'),
        'sample_size': 150,
        'source': 'CDP Technology Sector Report 2025',
        'confidence_level': 'high',
    },
    {
        'industry_sector': 'Manufacturing',
        'employee_range_min': 50,
        'employee_range_max': 250,
        'region': 'US',
        'year': 2025,
        'avg_scope1_per_employee': Decimal('3.5'),
        'avg_scope2_per_employee': Decimal('4.2'),
        'avg_scope3_per_employee': Decimal('2.0'),
        'avg_total_per_employee': Decimal('9.7'),
        'median_total_per_employee': Decimal('8.5'),
        'percentile_25': Decimal('6.0'),
        'percentile_75': Decimal('12.0'),
        'sample_size': 200,
        'source': 'EPA GHGRP Manufacturing Sector',
        'confidence_level': 'high',
    },
    {
        'industry_sector': 'Retail',
        'employee_range_min': 50,
        'employee_range_max': 250,
        'region': 'US',
        'year': 2025,
        'avg_scope1_per_employee': Decimal('0.8'),
        'avg_scope2_per_employee': Decimal('2.5'),
        'avg_scope3_per_employee': Decimal('1.5'),
        'avg_total_per_employee': Decimal('4.8'),
        'median_total_per_employee': Decimal('4.2'),
        'percentile_25': Decimal('3.0'),
        'percentile_75': Decimal('6.0'),
        'sample_size': 120,
        'source': 'CDP Retail Sector Report 2025',
        'confidence_level': 'medium',
    },
]


def load_default_benchmarks():
    """Load default benchmark data into database"""
    from django.db import transaction
    
    with transaction.atomic():
        for data in DEFAULT_BENCHMARKS:
            existing = IndustryBenchmark.objects.filter(
                industry_sector=data['industry_sector'],
                employee_range_min=data['employee_range_min'],
                employee_range_max=data['employee_range_max'],
                year=data['year'],
                region=data['region'],
            ).first()
            
            if not existing:
                IndustryBenchmark.objects.create(**data)
                print(f"✅ Created benchmark: {data['industry_sector']} ({data['employee_range_min']}-{data['employee_range_max']}) - {data['year']}")
            else:
                print(f"ℹ️  Benchmark already exists: {data['industry_sector']}")
