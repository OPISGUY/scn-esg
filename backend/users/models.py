import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """Custom User model for ESG platform"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
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
            ('admin', 'Admin'),
            ('manager', 'Manager'),
            ('user', 'User'),
        ],
        default='user'
    )
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['email']
    
    def __str__(self):
        return self.email
