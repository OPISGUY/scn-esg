"""
Email notification service for ESG Platform
Handles milestone notifications, monthly summaries, and alerts
"""
import logging
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template import Template, Context
from django.conf import settings
from django.utils import timezone
from django.db.models import Sum
from typing import List, Dict, Optional
from .models import NotificationTemplate, NotificationPreference, NotificationLog, SustainabilityMilestone

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for handling all types of notifications"""
    
    def __init__(self):
        self.from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'hello@donatecomputers.uk')
    
    def send_notification(self, user, notification_type: str, context: Dict) -> bool:
        """Send a notification to a user"""
        try:
            # Check user preferences
            preferences = self._get_user_preferences(user)
            if not preferences.email_notifications_enabled:
                logger.info(f"Email notifications disabled for user {user.username}")
                return False
            
            # Check specific notification type preferences
            if not self._should_send_notification(preferences, notification_type):
                logger.info(f"Notification type {notification_type} disabled for user {user.username}")
                return False
            
            # Get notification template
            template = self._get_notification_template(notification_type)
            if not template:
                logger.error(f"No template found for notification type: {notification_type}")
                return False
            
            # Render templates
            subject = self._render_template(template.subject_template, context)
            html_content = self._render_template(template.html_template, context)
            text_content = self._render_template(template.text_template, context)
            
            # Create notification log
            log = NotificationLog.objects.create(
                user=user,
                company=user.company,
                notification_type=notification_type,
                subject=subject,
                recipient_email=user.email,
                context_data=context,
                status='pending'
            )
            
            # Send email
            success = self._send_email(
                recipient_email=user.email,
                subject=subject,
                html_content=html_content,
                text_content=text_content
            )
            
            # Update log
            if success:
                log.status = 'sent'
                log.sent_at = timezone.now()
                logger.info(f"Notification sent successfully to {user.email}")
            else:
                log.status = 'failed'
                log.error_message = "Failed to send email"
                logger.error(f"Failed to send notification to {user.email}")
            
            log.save()
            return success
            
        except Exception as e:
            logger.error(f"Error sending notification: {str(e)}")
            return False
    
    def send_milestone_notification(self, company, milestone_type: str, data: Dict) -> bool:
        """Send milestone achievement notification"""
        try:
            # Get all company users who want milestone notifications
            users = company.users.filter(is_active=True)
            notifications_sent = 0
            
            for user in users:
                context = {
                    'user_name': user.get_full_name() or user.username,
                    'company_name': company.name,
                    'milestone_type': milestone_type,
                    'data': data,
                    'achievement_date': timezone.now().strftime('%B %d, %Y'),
                }
                
                if self.send_notification(user, 'milestone_achievement', context):
                    notifications_sent += 1
            
            logger.info(f"Sent {notifications_sent} milestone notifications for {company.name}")
            return notifications_sent > 0
            
        except Exception as e:
            logger.error(f"Error sending milestone notifications: {str(e)}")
            return False
    
    def send_summary_notification(self, company, summary_type: str, data: Dict) -> bool:
        """Send summary notification (weekly/monthly)"""
        try:
            # Get all company users who want summary notifications
            users = company.users.filter(is_active=True)
            notifications_sent = 0
            
            for user in users:
                context = {
                    'user_name': user.get_full_name() or user.username,
                    'company_name': company.name,
                    'summary_type': summary_type,
                    'data': data,
                    'report_date': timezone.now().strftime('%B %d, %Y'),
                }
                
                if self.send_notification(user, summary_type, context):
                    notifications_sent += 1
            
            logger.info(f"Sent {notifications_sent} {summary_type} notifications for {company.name}")
            return notifications_sent > 0
            
        except Exception as e:
            logger.error(f"Error sending {summary_type} notifications: {str(e)}")
            return False
    
    def send_alert_notification(self, company, alert_type: str, data: Dict) -> bool:
        """Send alert notification"""
        try:
            # Get all company users who want alert notifications
            users = company.users.filter(is_active=True)
            notifications_sent = 0
            
            for user in users:
                context = {
                    'user_name': user.get_full_name() or user.username,
                    'company_name': company.name,
                    'alert_type': alert_type,
                    'data': data,
                    'alert_date': timezone.now().strftime('%B %d, %Y'),
                }
                
                if self.send_notification(user, 'data_quality_alert', context):
                    notifications_sent += 1
            
            logger.info(f"Sent {notifications_sent} alert notifications for {company.name}")
            return notifications_sent > 0
            
        except Exception as e:
            logger.error(f"Error sending alert notifications: {str(e)}")
            return False
    
    def check_and_notify_milestones(self, company) -> List[str]:
        """Check for achieved milestones and send notifications"""
        notifications_sent = []
        
        # Update milestone values
        self._update_milestone_values(company)
        
        # Check for newly achieved milestones
        achieved_milestones = SustainabilityMilestone.objects.filter(
            company=company,
            is_achieved=True,
            notify_on_achievement=True,
            notification_sent=False
        )
        
        for milestone in achieved_milestones:
            # Send notifications to all company users
            company_users = company.users.filter(is_active=True)
            
            context = {
                'company_name': company.name,
                'milestone_type': milestone.get_milestone_type_display(),
                'threshold_value': milestone.threshold_value,
                'current_value': milestone.current_value,
                'achieved_date': milestone.achieved_at,
            }
            
            for user in company_users:
                if self.send_notification(user, 'milestone_reached', context):
                    notifications_sent.append(f"{milestone.milestone_type} to {user.email}")
            
            # Mark as notified
            milestone.notification_sent = True
            milestone.save()
        
        return notifications_sent
    
    def send_monthly_summary(self, company) -> bool:
        """Send monthly sustainability summary"""
        from carbon.models import CarbonFootprint, OffsetPurchase
        from ewaste.models import EwasteEntry
        from carbon.advanced_utils import calculate_monthly_trends
        
        # Get monthly data
        trends = calculate_monthly_trends(company, 2)  # Current and previous month
        
        if len(trends) < 1:
            logger.warning(f"Insufficient data for monthly summary for {company.name}")
            return False
        
        current_month = trends[-1]
        previous_month = trends[-2] if len(trends) > 1 else None
        
        # Calculate changes
        context = {
            'company_name': company.name,
            'month': current_month['month'],
            'current_month_data': current_month,
            'previous_month_data': previous_month,
            'improvements': self._calculate_improvements(current_month, previous_month),
            'recommendations': self._generate_monthly_recommendations(current_month),
        }
        
        # Send to all company users who want monthly summaries
        company_users = company.users.filter(is_active=True)
        success_count = 0
        
        for user in company_users:
            if self.send_notification(user, 'monthly_summary', context):
                success_count += 1
        
        logger.info(f"Monthly summary sent to {success_count} users for {company.name}")
        return success_count > 0
    
    def send_carbon_neutral_achievement(self, company) -> bool:
        """Send carbon neutral achievement notification"""
        from carbon.models import CarbonFootprint, OffsetPurchase
        from ewaste.models import EwasteEntry
        
        # Calculate current carbon balance
        total_emissions = CarbonFootprint.objects.filter(
            company=company, status='verified'
        ).aggregate(Sum('total_emissions'))['total_emissions__sum'] or 0
        
        total_offsets = OffsetPurchase.objects.filter(
            company=company, status='completed'
        ).aggregate(Sum('total_co2_offset'))['total_co2_offset__sum'] or 0
        
        total_ewaste_credits = EwasteEntry.objects.filter(
            company=company
        ).aggregate(Sum('carbon_credits_generated'))['carbon_credits_generated__sum'] or 0
        
        carbon_balance = (total_offsets + total_ewaste_credits) - total_emissions
        
        if carbon_balance < 0:
            logger.warning(f"Company {company.name} is not carbon neutral")
            return False
        
        context = {
            'company_name': company.name,
            'total_emissions': total_emissions,
            'total_offsets': total_offsets,
            'ewaste_credits': total_ewaste_credits,
            'carbon_balance': carbon_balance,
            'achievement_date': timezone.now(),
        }
        
        # Send to all company users
        company_users = company.users.filter(is_active=True)
        success_count = 0
        
        for user in company_users:
            if self.send_notification(user, 'carbon_neutral_achieved', context):
                success_count += 1
        
        logger.info(f"Carbon neutral achievement sent to {success_count} users for {company.name}")
        return success_count > 0
    
    def _get_user_preferences(self, user) -> NotificationPreference:
        """Get or create user notification preferences"""
        preferences, created = NotificationPreference.objects.get_or_create(
            user=user,
            defaults={
                'email_notifications_enabled': True,
                'carbon_neutral_alerts': True,
                'milestone_notifications': True,
                'monthly_summaries': True,
                'purchase_confirmations': True,
            }
        )
        return preferences
    
    def _should_send_notification(self, preferences: NotificationPreference, notification_type: str) -> bool:
        """Check if notification should be sent based on user preferences"""
        type_mapping = {
            'carbon_neutral_achieved': preferences.carbon_neutral_alerts,
            'milestone_reached': preferences.milestone_notifications,
            'monthly_summary': preferences.monthly_summaries,
            'offset_purchase_confirmation': preferences.purchase_confirmations,
            'ewaste_donation_confirmation': preferences.purchase_confirmations,
            'industry_benchmark_alert': preferences.benchmark_alerts,
        }
        
        return type_mapping.get(notification_type, True)
    
    def _get_notification_template(self, notification_type: str) -> Optional[NotificationTemplate]:
        """Get notification template by type"""
        try:
            return NotificationTemplate.objects.get(
                notification_type=notification_type,
                is_active=True
            )
        except NotificationTemplate.DoesNotExist:
            return None
    
    def _render_template(self, template_string: str, context: Dict) -> str:
        """Render Django template string with context"""
        template = Template(template_string)
        return template.render(Context(context))
    
    def _send_email(self, recipient_email: str, subject: str, html_content: str, text_content: str) -> bool:
        """Send actual email"""
        try:
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=self.from_email,
                to=[recipient_email]
            )
            msg.attach_alternative(html_content, "text/html")
            msg.send()
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {recipient_email}: {str(e)}")
            return False
    
    def _update_milestone_values(self, company):
        """Update current values for all company milestones"""
        from carbon.models import CarbonFootprint, OffsetPurchase
        from ewaste.models import EwasteEntry
        
        milestones = SustainabilityMilestone.objects.filter(
            company=company,
            is_achieved=False
        )
        
        for milestone in milestones:
            current_value = 0
            
            if milestone.milestone_type == 'carbon_neutral':
                # Check if carbon neutral (balance >= 0)
                total_emissions = CarbonFootprint.objects.filter(
                    company=company, status='verified'
                ).aggregate(Sum('total_emissions'))['total_emissions__sum'] or 0
                
                total_offsets = OffsetPurchase.objects.filter(
                    company=company, status='completed'
                ).aggregate(Sum('total_co2_offset'))['total_co2_offset__sum'] or 0
                
                total_ewaste = EwasteEntry.objects.filter(
                    company=company
                ).aggregate(Sum('carbon_credits_generated'))['carbon_credits_generated__sum'] or 0
                
                current_value = (total_offsets + total_ewaste) - total_emissions
                
            elif milestone.milestone_type == 'offset_volume':
                current_value = OffsetPurchase.objects.filter(
                    company=company, status='completed'
                ).aggregate(Sum('total_co2_offset'))['total_co2_offset__sum'] or 0
                
            elif milestone.milestone_type == 'ewaste_devices':
                current_value = EwasteEntry.objects.filter(
                    company=company
                ).aggregate(Sum('quantity'))['quantity__sum'] or 0
            
            # Update milestone
            milestone.current_value = current_value
            milestone.save()
            
            # Check if achieved
            milestone.check_achievement()
    
    def _calculate_improvements(self, current_month: Dict, previous_month: Optional[Dict]) -> Dict:
        """Calculate month-over-month improvements"""
        if not previous_month:
            return {}
        
        improvements = {}
        
        # Emissions change
        current_emissions = current_month['emissions']['total']
        previous_emissions = previous_month['emissions']['total']
        
        if previous_emissions > 0:
            emissions_change = ((current_emissions - previous_emissions) / previous_emissions) * 100
            improvements['emissions_change'] = {
                'percentage': round(emissions_change, 1),
                'direction': 'decreased' if emissions_change < 0 else 'increased',
                'is_improvement': emissions_change < 0
            }
        
        # Offsets change
        current_offsets = current_month['offsets']['total']
        previous_offsets = previous_month['offsets']['total']
        
        if previous_offsets > 0:
            offsets_change = ((current_offsets - previous_offsets) / previous_offsets) * 100
            improvements['offsets_change'] = {
                'percentage': round(offsets_change, 1),
                'direction': 'increased' if offsets_change > 0 else 'decreased',
                'is_improvement': offsets_change > 0
            }
        
        # Carbon balance improvement
        current_balance = current_month['balance']['neutrality_percentage']
        previous_balance = previous_month['balance']['neutrality_percentage']
        
        balance_change = current_balance - previous_balance
        improvements['balance_change'] = {
            'percentage': round(balance_change, 1),
            'direction': 'improved' if balance_change > 0 else 'declined',
            'is_improvement': balance_change > 0
        }
        
        return improvements
    
    def _generate_monthly_recommendations(self, current_month: Dict) -> List[str]:
        """Generate recommendations based on monthly performance"""
        recommendations = []
        
        neutrality_percentage = current_month['balance']['neutrality_percentage']
        net_emissions = current_month['balance']['net_emissions']
        
        if neutrality_percentage < 50:
            recommendations.append("Consider increasing carbon offset purchases to improve your carbon neutrality.")
        elif neutrality_percentage < 80:
            recommendations.append("You're making good progress! A few more offset purchases could get you to carbon neutral.")
        elif neutrality_percentage >= 100:
            recommendations.append("Congratulations! You've achieved carbon neutrality this month.")
        
        if current_month['ewaste']['devices_donated'] < 5:
            recommendations.append("Consider increasing e-waste donations to boost your sustainability impact.")
        
        if net_emissions > 10:
            recommendations.append("Focus on reducing direct emissions through energy efficiency improvements.")
        
        return recommendations


# Global instance
notification_service = NotificationService()
