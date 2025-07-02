"""
Advanced carbon calculation utilities for Phase 4
Enhanced with industry benchmarking and predictive analytics
"""
from decimal import Decimal
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from django.db.models import Sum, Avg, Q
from django.utils import timezone


def calculate_monthly_trends(company, months=12) -> List[Dict]:
    """
    Calculate detailed monthly trends with predictions
    """
    from carbon.models import CarbonFootprint, OffsetPurchase
    from ewaste.models import EwasteEntry
    
    trends = []
    end_date = timezone.now()
    
    for i in range(months):
        month_start = end_date - timedelta(days=30 * (months - 1 - i))
        month_end = end_date - timedelta(days=30 * (months - 2 - i)) if i < months - 1 else end_date
        
        # Carbon footprint data
        footprints = CarbonFootprint.objects.filter(
            company=company,
            created_at__gte=month_start,
            created_at__lt=month_end
        ).aggregate(
            total_emissions=Sum('total_emissions'),
            scope1=Sum('scope1_emissions'),
            scope2=Sum('scope2_emissions'),
            scope3=Sum('scope3_emissions'),
        )
        
        # Offset purchases
        purchases = OffsetPurchase.objects.filter(
            company=company,
            purchase_date__gte=month_start,
            purchase_date__lt=month_end
        ).aggregate(
            total_offsets=Sum('total_co2_offset'),
            total_spent=Sum('total_price'),
        )
        
        # E-waste donations
        ewaste = EwasteEntry.objects.filter(
            company=company,
            created_at__gte=month_start,
            created_at__lt=month_end
        ).aggregate(
            devices_donated=Sum('quantity'),
            co2_saved=Sum('estimated_co2_saved'),
            credits_generated=Sum('carbon_credits_generated'),
        )
        
        # Calculate monthly carbon balance
        emissions = float(footprints['total_emissions'] or 0)
        offsets = float(purchases['total_offsets'] or 0)
        ewaste_credits = float(ewaste['credits_generated'] or 0)
        net_balance = emissions - (offsets + ewaste_credits)
        
        trends.append({
            'month': month_start.strftime('%Y-%m'),
            'date': month_start.isoformat(),
            'emissions': {
                'total': emissions,
                'scope1': float(footprints['scope1'] or 0),
                'scope2': float(footprints['scope2'] or 0),
                'scope3': float(footprints['scope3'] or 0),
            },
            'offsets': {
                'purchased': offsets,
                'spent': float(purchases['total_spent'] or 0),
                'ewaste_credits': ewaste_credits,
                'total': offsets + ewaste_credits,
            },
            'ewaste': {
                'devices_donated': ewaste['devices_donated'] or 0,
                'co2_saved': float(ewaste['co2_saved'] or 0),
            },
            'balance': {
                'net_emissions': net_balance,
                'neutrality_percentage': (offsets + ewaste_credits) / max(emissions, 1) * 100,
                'carbon_neutral': net_balance <= 0,
            }
        })
    
    return trends


def predict_carbon_trajectory(company, months_ahead=6) -> Dict:
    """
    Predict future carbon performance based on historical trends
    """
    trends = calculate_monthly_trends(company, 12)
    
    if len(trends) < 3:
        return {'error': 'Insufficient data for predictions'}
    
    # Calculate growth rates
    recent_trends = trends[-6:]  # Last 6 months
    
    emissions_growth = []
    offsets_growth = []
    
    for i in range(1, len(recent_trends)):
        prev_emissions = recent_trends[i-1]['emissions']['total']
        curr_emissions = recent_trends[i]['emissions']['total']
        
        if prev_emissions > 0:
            emissions_growth.append((curr_emissions - prev_emissions) / prev_emissions)
        
        prev_offsets = recent_trends[i-1]['offsets']['total']
        curr_offsets = recent_trends[i]['offsets']['total']
        
        if prev_offsets > 0:
            offsets_growth.append((curr_offsets - prev_offsets) / prev_offsets)
    
    # Calculate average growth rates
    avg_emissions_growth = sum(emissions_growth) / len(emissions_growth) if emissions_growth else 0
    avg_offsets_growth = sum(offsets_growth) / len(offsets_growth) if offsets_growth else 0.1  # Assume 10% default growth
    
    # Project future performance
    last_month = trends[-1]
    predictions = []
    
    current_emissions = last_month['emissions']['total']
    current_offsets = last_month['offsets']['total']
    
    for i in range(1, months_ahead + 1):
        future_emissions = current_emissions * (1 + avg_emissions_growth) ** i
        future_offsets = current_offsets * (1 + avg_offsets_growth) ** i
        
        neutrality_percentage = (future_offsets / max(future_emissions, 1)) * 100
        carbon_neutral_month = None
        
        if neutrality_percentage >= 100 and not carbon_neutral_month:
            carbon_neutral_month = i
        
        predictions.append({
            'month_offset': i,
            'projected_emissions': future_emissions,
            'projected_offsets': future_offsets,
            'neutrality_percentage': min(neutrality_percentage, 100),
            'carbon_neutral': neutrality_percentage >= 100,
        })
    
    return {
        'predictions': predictions,
        'trends': {
            'emissions_growth_rate': avg_emissions_growth * 100,  # Convert to percentage
            'offsets_growth_rate': avg_offsets_growth * 100,
        },
        'insights': {
            'carbon_neutral_in_months': next((p['month_offset'] for p in predictions if p['carbon_neutral']), None),
            'current_trajectory': 'improving' if avg_offsets_growth > abs(avg_emissions_growth) else 'needs_improvement',
        }
    }


def calculate_industry_benchmarks(company) -> Dict:
    """
    Calculate industry benchmarks and company positioning
    """
    from companies.models import Company
    from carbon.models import CarbonFootprint
    
    # Get industry peers
    industry_companies = Company.objects.filter(
        industry=company.industry
    ).exclude(id=company.id)
    
    if not industry_companies.exists():
        return {'error': 'No industry peers found for benchmarking'}
    
    # Calculate industry averages
    industry_footprints = CarbonFootprint.objects.filter(
        company__in=industry_companies,
        status='verified'
    ).aggregate(
        avg_total=Avg('total_emissions'),
        avg_scope1=Avg('scope1_emissions'),
        avg_scope2=Avg('scope2_emissions'),
        avg_scope3=Avg('scope3_emissions'),
    )
    
    # Get company's latest footprint
    company_footprint = CarbonFootprint.objects.filter(
        company=company,
        status='verified'
    ).order_by('-created_at').first()
    
    if not company_footprint:
        return {'error': 'No verified footprint found for company'}
    
    # Calculate company vs industry performance
    industry_avg_total = float(industry_footprints['avg_total'] or 0)
    company_total = float(company_footprint.total_emissions)
    
    # Calculate percentile ranking
    better_performers = CarbonFootprint.objects.filter(
        company__in=industry_companies,
        status='verified',
        total_emissions__lt=company_total
    ).count()
    
    total_industry_companies = industry_companies.count()
    percentile = (better_performers / total_industry_companies * 100) if total_industry_companies > 0 else 50
    
    # Performance indicators
    performance_vs_industry = ((company_total - industry_avg_total) / industry_avg_total * 100) if industry_avg_total > 0 else 0
    
    return {
        'industry': company.industry,
        'industry_size': total_industry_companies,
        'company_performance': {
            'total_emissions': company_total,
            'emissions_per_employee': company_total / (company.employees or 1),
            'percentile_ranking': round(100 - percentile, 1),  # Higher percentile = better performance
        },
        'industry_averages': {
            'total_emissions': industry_avg_total,
            'scope1_emissions': float(industry_footprints['avg_scope1'] or 0),
            'scope2_emissions': float(industry_footprints['avg_scope2'] or 0),
            'scope3_emissions': float(industry_footprints['avg_scope3'] or 0),
        },
        'comparison': {
            'vs_industry_average': round(performance_vs_industry, 1),
            'performance_category': (
                'top_performer' if percentile >= 75 else
                'above_average' if percentile >= 50 else
                'below_average' if percentile >= 25 else
                'needs_improvement'
            ),
        },
        'recommendations': generate_performance_recommendations(company_total, industry_avg_total, percentile)
    }


def generate_performance_recommendations(company_emissions: float, industry_avg: float, percentile: float) -> List[str]:
    """
    Generate personalized recommendations based on performance
    """
    recommendations = []
    
    if percentile >= 75:
        recommendations.extend([
            "🌟 Excellent performance! Consider sharing best practices with industry peers.",
            "📈 Focus on maintaining current trajectory and continuous improvement.",
            "🎯 Set ambitious carbon negative goals to become an industry leader.",
        ])
    elif percentile >= 50:
        recommendations.extend([
            "✅ Good performance, but room for improvement exists.",
            "🔍 Analyze top performers in your industry for best practices.",
            "📊 Focus on scope 3 emissions reduction for maximum impact.",
        ])
    elif percentile >= 25:
        recommendations.extend([
            "⚠️ Below industry average - prioritize carbon reduction initiatives.",
            "🎯 Set specific reduction targets for each emission scope.",
            "💡 Consider energy efficiency audits and renewable energy adoption.",
        ])
    else:
        recommendations.extend([
            "🚨 Significant improvement needed to match industry standards.",
            "📋 Develop a comprehensive carbon reduction strategy.",
            "🤝 Consider partnering with sustainability consultants.",
            "⚡ Prioritize quick wins: LED lighting, equipment upgrades, remote work policies.",
        ])
    
    # Add specific recommendations based on company vs industry
    if company_emissions > industry_avg * 1.5:
        recommendations.append("🎯 Your emissions are significantly above industry average - focus on major operational changes.")
    elif company_emissions < industry_avg * 0.7:
        recommendations.append("🌱 You're performing well below industry average - consider carbon negative initiatives.")
    
    return recommendations


def calculate_carbon_roi(company) -> Dict:
    """
    Calculate return on investment for carbon initiatives
    """
    from carbon.models import OffsetPurchase
    from ewaste.models import EwasteEntry
    
    # Calculate total investment in carbon initiatives
    total_offset_investment = OffsetPurchase.objects.filter(
        company=company,
        status='completed'
    ).aggregate(
        total_spent=Sum('total_price'),
        total_co2_offset=Sum('total_co2_offset'),
    )
    
    # Calculate e-waste program value (estimated value of donated devices)
    ewaste_value = EwasteEntry.objects.filter(
        company=company
    ).aggregate(
        total_devices=Sum('quantity'),
        total_co2_saved=Sum('estimated_co2_saved'),
    )
    
    # Estimated costs and benefits
    total_spent = float(total_offset_investment['total_spent'] or 0)
    total_co2_offset = float(total_offset_investment['total_co2_offset'] or 0)
    total_co2_saved = float(ewaste_value['total_co2_saved'] or 0)
    
    # Estimate e-waste program costs (processing, logistics)
    estimated_ewaste_costs = ewaste_value['total_devices'] * 5 if ewaste_value['total_devices'] else 0  # $5 per device
    
    total_investment = total_spent + estimated_ewaste_costs
    total_co2_impact = total_co2_offset + total_co2_saved
    
    # Calculate metrics
    cost_per_tonne = total_investment / max(total_co2_impact, 1)
    
    # Estimated benefits (carbon pricing, reputation, compliance)
    carbon_price_benefit = total_co2_impact * 50  # $50 per tonne (estimated carbon price)
    reputation_benefit = total_investment * 0.3  # 30% reputation/marketing value
    compliance_benefit = total_investment * 0.2  # 20% compliance/risk mitigation value
    
    total_benefits = carbon_price_benefit + reputation_benefit + compliance_benefit
    roi_percentage = ((total_benefits - total_investment) / max(total_investment, 1)) * 100
    
    return {
        'investment': {
            'offset_purchases': total_spent,
            'ewaste_program': estimated_ewaste_costs,
            'total_investment': total_investment,
        },
        'impact': {
            'co2_offset_purchased': total_co2_offset,
            'co2_saved_ewaste': total_co2_saved,
            'total_co2_impact': total_co2_impact,
            'cost_per_tonne': cost_per_tonne,
        },
        'benefits': {
            'carbon_price_value': carbon_price_benefit,
            'reputation_value': reputation_benefit,
            'compliance_value': compliance_benefit,
            'total_estimated_benefits': total_benefits,
        },
        'roi': {
            'percentage': round(roi_percentage, 1),
            'payback_period_years': max(total_investment / (total_benefits / 5), 0.1) if total_benefits > 0 else float('inf'),
            'break_even': total_benefits >= total_investment,
        }
    }
