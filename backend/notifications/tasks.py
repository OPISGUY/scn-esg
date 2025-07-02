"""
Celery tasks for notifications and background processing
"""
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Avg
from companies.models import Company
from carbon.models import CarbonFootprint
from notifications.services import NotificationService
from notifications.models import NotificationMilestone


@shared_task
def check_carbon_milestones():
    """
    Check for carbon emission milestones and send notifications
    """
    companies = Company.objects.all()
    notification_service = NotificationService()
    
    for company in companies:
        try:
            # Get latest footprint
            latest_footprint = CarbonFootprint.objects.filter(
                company=company
            ).order_by('-created_at').first()
            
            if not latest_footprint:
                continue
            
            # Check for various milestones
            total_emissions = latest_footprint.total_emissions
            
            # Milestone thresholds
            milestones = [
                (100, 'first_100_tons'),
                (500, 'first_500_tons'),
                (1000, 'first_1000_tons'),
                (5000, 'first_5000_tons'),
                (10000, 'first_10000_tons'),
            ]
            
            for threshold, milestone_key in milestones:
                # Check if milestone already triggered
                milestone_exists = NotificationMilestone.objects.filter(
                    company=company,
                    milestone_type=milestone_key
                ).exists()
                
                if not milestone_exists and total_emissions >= threshold:
                    # Trigger milestone notification
                    notification_service.send_milestone_notification(
                        company=company,
                        milestone_type=milestone_key,
                        data={'total_emissions': float(total_emissions)}
                    )
                    
                    # Record milestone
                    NotificationMilestone.objects.create(
                        company=company,
                        milestone_type=milestone_key,
                        achieved_at=timezone.now(),
                        data={'total_emissions': float(total_emissions)}
                    )
        
        except Exception as e:
            print(f"Error checking milestones for company {company.id}: {str(e)}")
    
    return f"Processed {companies.count()} companies for milestone checks"


@shared_task
def send_monthly_reports():
    """
    Send monthly summary reports to companies
    """
    companies = Company.objects.all()
    notification_service = NotificationService()
    
    # Get current month data
    now = timezone.now()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    for company in companies:
        try:
            # Get monthly footprint data
            monthly_footprints = CarbonFootprint.objects.filter(
                company=company,
                created_at__gte=start_of_month
            )
            
            if monthly_footprints.exists():
                total_emissions = monthly_footprints.aggregate(
                    Sum('scope1_emissions'),
                    Sum('scope2_emissions'),
                    Sum('scope3_emissions')
                )
                
                monthly_data = {
                    'month': now.strftime('%B %Y'),
                    'total_scope_1': total_emissions['scope1_emissions__sum'] or 0,
                    'total_scope_2': total_emissions['scope2_emissions__sum'] or 0,
                    'total_scope_3': total_emissions['scope3_emissions__sum'] or 0,
                    'record_count': monthly_footprints.count()
                }
                
                monthly_data['total_emissions'] = (
                    monthly_data['total_scope_1'] + 
                    monthly_data['total_scope_2'] + 
                    monthly_data['total_scope_3']
                )
                
                # Send monthly summary
                notification_service.send_summary_notification(
                    company=company,
                    summary_type='monthly_report',
                    data=monthly_data
                )
        
        except Exception as e:
            print(f"Error sending monthly report for company {company.id}: {str(e)}")
    
    return f"Sent monthly reports to {companies.count()} companies"


@shared_task
def send_weekly_summaries():
    """
    Send weekly summary notifications
    """
    companies = Company.objects.all()
    notification_service = NotificationService()
    
    # Get current week data
    now = timezone.now()
    start_of_week = now - timedelta(days=now.weekday())
    start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
    
    for company in companies:
        try:
            # Get weekly footprint data
            weekly_footprints = CarbonFootprint.objects.filter(
                company=company,
                created_at__gte=start_of_week
            )
            
            if weekly_footprints.exists():
                weekly_data = {
                    'week_start': start_of_week.strftime('%B %d, %Y'),
                    'new_records': weekly_footprints.count(),
                    'total_emissions': sum(f.total_emissions for f in weekly_footprints)
                }
                
                # Send weekly summary
                notification_service.send_summary_notification(
                    company=company,
                    summary_type='weekly_summary',
                    data=weekly_data
                )
        
        except Exception as e:
            print(f"Error sending weekly summary for company {company.id}: {str(e)}")
    
    return f"Sent weekly summaries to {companies.count()} companies"


@shared_task
def cleanup_old_notifications():
    """
    Clean up old notification logs (older than 6 months)
    """
    from notifications.models import NotificationLog
    
    six_months_ago = timezone.now() - timedelta(days=180)
    
    deleted_count = NotificationLog.objects.filter(
        created_at__lt=six_months_ago
    ).delete()[0]
    
    return f"Cleaned up {deleted_count} old notification logs"


@shared_task
def check_data_quality():
    """
    Check data quality and send alerts if issues are found
    """
    from carbon.models import CarbonFootprint
    
    companies = Company.objects.all()
    issues_found = []
    
    for company in companies:
        # Check for missing recent data
        latest_footprint = CarbonFootprint.objects.filter(
            company=company
        ).order_by('-created_at').first()
        
        if latest_footprint:
            days_since_last = (timezone.now().date() - latest_footprint.created_at.date()).days
            if days_since_last > 30:  # No data for 30+ days
                issues_found.append({
                    'company': company.name,
                    'issue': 'No data submitted in 30+ days',
                    'last_date': latest_footprint.created_at.date()
                })
        
        # Check for anomalous values
        recent_footprints = CarbonFootprint.objects.filter(
            company=company,
            created_at__gte=timezone.now() - timedelta(days=90)
        )
        
        if recent_footprints.count() >= 3:
            avg_emissions = recent_footprints.aggregate(
                Avg('scope1_emissions'),
                Avg('scope2_emissions'),
                Avg('scope3_emissions')
            )
            
            for footprint in recent_footprints:
                # Check for values that are 5x the average
                if (footprint.scope1_emissions > 5 * (avg_emissions['scope1_emissions__avg'] or 0) or
                    footprint.scope2_emissions > 5 * (avg_emissions['scope2_emissions__avg'] or 0) or
                    footprint.scope3_emissions > 5 * (avg_emissions['scope3_emissions__avg'] or 0)):
                    
                    issues_found.append({
                        'company': company.name,
                        'issue': 'Anomalous emissions data detected',
                        'date': footprint.created_at.date(),
                        'total_emissions': footprint.total_emissions
                    })
    
    if issues_found:
        # Send alert to admin users
        # This would be implemented based on your admin notification requirements
        print(f"Data quality issues found: {len(issues_found)}")
        for issue in issues_found:
            print(f"- {issue}")
    
    return f"Data quality check completed. Found {len(issues_found)} issues."
