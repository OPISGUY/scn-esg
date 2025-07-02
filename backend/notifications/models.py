from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from companies.models import Company

User = get_user_model()


class NotificationTemplate(models.Model):
    """Email notification templates"""
    
    NOTIFICATION_TYPES = [
        ('carbon_neutral_achieved', 'Carbon Neutral Achieved'),
        ('milestone_reached', 'Sustainability Milestone Reached'),
        ('monthly_summary', 'Monthly Sustainability Summary'),
        ('offset_purchase_confirmation', 'Offset Purchase Confirmation'),
        ('ewaste_donation_confirmation', 'E-waste Donation Confirmation'),
        ('goal_progress_update', 'Goal Progress Update'),
        ('industry_benchmark_alert', 'Industry Benchmark Alert'),
    ]
    
    name = models.CharField(max_length=100)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES, unique=True)
    subject_template = models.CharField(max_length=200)
    html_template = models.TextField()
    text_template = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.notification_type})"


class NotificationPreference(models.Model):
    """User notification preferences"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Email preferences
    email_notifications_enabled = models.BooleanField(default=True)
    carbon_neutral_alerts = models.BooleanField(default=True)
    milestone_notifications = models.BooleanField(default=True)
    monthly_summaries = models.BooleanField(default=True)
    purchase_confirmations = models.BooleanField(default=True)
    benchmark_alerts = models.BooleanField(default=False)
    
    # Frequency preferences
    FREQUENCY_CHOICES = [
        ('immediate', 'Immediate'),
        ('daily', 'Daily Digest'),
        ('weekly', 'Weekly Digest'),
    ]
    
    notification_frequency = models.CharField(
        max_length=20, 
        choices=FREQUENCY_CHOICES, 
        default='immediate'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Preferences for {self.user.username}"


class NotificationLog(models.Model):
    """Log of sent notifications for audit and tracking"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('bounced', 'Bounced'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=50)
    subject = models.CharField(max_length=200)
    recipient_email = models.EmailField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    sent_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    # Context data (JSON field for flexible data storage)
    context_data = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.notification_type} to {self.recipient_email} - {self.status}"


class SustainabilityMilestone(models.Model):
    """Track sustainability milestones for notifications"""
    
    MILESTONE_TYPES = [
        ('carbon_neutral', 'Carbon Neutral Achieved'),
        ('offset_volume', 'Carbon Offset Volume Milestone'),
        ('ewaste_devices', 'E-waste Devices Milestone'),
        ('emissions_reduction', 'Emissions Reduction Milestone'),
        ('sustainability_score', 'Sustainability Score Milestone'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    milestone_type = models.CharField(max_length=30, choices=MILESTONE_TYPES)
    threshold_value = models.DecimalField(max_digits=12, decimal_places=2)
    current_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_achieved = models.BooleanField(default=False)
    achieved_at = models.DateTimeField(null=True, blank=True)
    
    # Notification settings
    notify_on_achievement = models.BooleanField(default=True)
    notification_sent = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['company', 'milestone_type', 'threshold_value']
    
    def __str__(self):
        return f"{self.company.name} - {self.milestone_type} ({self.threshold_value})"
    
    def check_achievement(self):
        """Check if milestone has been achieved"""
        if not self.is_achieved and self.current_value >= self.threshold_value:
            self.is_achieved = True
            self.achieved_at = timezone.now()
            self.save()
            return True
        return False


class NotificationMilestone(models.Model):
    """Model to track notification milestones"""
    
    MILESTONE_TYPES = [
        ('first_100_tons', 'First 100 Tons CO2e'),
        ('first_500_tons', 'First 500 Tons CO2e'),
        ('first_1000_tons', 'First 1000 Tons CO2e'),
        ('first_5000_tons', 'First 5000 Tons CO2e'),
        ('first_10000_tons', 'First 10000 Tons CO2e'),
        ('carbon_neutral', 'Carbon Neutral Achievement'),
        ('offset_purchase', 'First Offset Purchase'),
        ('ewaste_donation', 'First E-waste Donation'),
    ]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='notification_milestones')
    milestone_type = models.CharField(max_length=50, choices=MILESTONE_TYPES)
    achieved_at = models.DateTimeField()
    data = models.JSONField(default=dict)
    notification_sent = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['company', 'milestone_type']
    
    def __str__(self):
        return f"{self.company.name} - {self.milestone_type}"
