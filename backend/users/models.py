import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """Custom User model for ESG platform"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    company = models.ForeignKey(
        'companies.Company', 
        on_delete=models.CASCADE, 
        blank=True, 
        null=True,
        related_name='users'
    )
    role = models.CharField(
        max_length=50, 
        choices=[
            ('admin', 'Administrator'),
            ('sustainability_manager', 'Sustainability Manager'),
            ('decision_maker', 'Decision Maker'),
            ('viewer', 'Viewer'),
        ],
        default='sustainability_manager'
    )
    
    # Email verification fields
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=255, blank=True, null=True)
    email_verification_sent_at = models.DateTimeField(blank=True, null=True)
    
    # Password reset fields
    password_reset_token = models.CharField(max_length=255, blank=True, null=True)
    password_reset_sent_at = models.DateTimeField(blank=True, null=True)
    
    # User preferences
    is_onboarding_complete = models.BooleanField(default=False)
    dashboard_preferences = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    last_login_at = models.DateTimeField(blank=True, null=True)
    
    # Use email as username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        ordering = ['email']
    
    def __str__(self):
        return self.email

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def can_access_feature(self, feature):
        """Check if user role can access a specific feature"""
        permissions = {
            'admin': ['all'],
            'sustainability_manager': ['carbon_tracking', 'ewaste_tracking', 'reports', 'compliance'],
            'decision_maker': ['dashboard', 'reports', 'analytics'],
            'viewer': ['dashboard', 'reports']
        }
        
        user_permissions = permissions.get(self.role, [])
        return 'all' in user_permissions or feature in user_permissions
