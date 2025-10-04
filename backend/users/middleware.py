"""
Email Verification Middleware
Blocks unverified users from accessing protected endpoints
"""

from django.http import JsonResponse
from django.conf import settings
from rest_framework import status
import re


class EmailVerificationMiddleware:
    """
    Middleware to enforce email verification for authenticated users
    Blocks access to protected endpoints if email is not verified
    """
    
    # Paths that don't require email verification
    EXEMPT_PATHS = [
        r'^/api/v1/users/auth/login/?$',
        r'^/api/v1/users/auth/register/?$',
        r'^/api/v1/users/auth/send-verification/?$',
        r'^/api/v1/users/auth/verify-email/.*/?$',
        r'^/api/v1/users/auth/resend-verification/?$',
        r'^/api/v1/users/auth/password-reset/?$',
        r'^/api/v1/users/auth/password-reset-confirm/.*/?$',
        r'^/api/v1/users/auth/health/?$',
        r'^/api/v1/users/auth/logout/?$',
        r'^/api/schema/.*',
        r'^/admin/.*',
        r'^/static/.*',
        r'^/media/.*',
        r'^/favicon.ico',
    ]
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.exempt_patterns = [re.compile(pattern) for pattern in self.EXEMPT_PATHS]
    
    def __call__(self, request):
        """
        Process request and check email verification status
        """
        # Check if path is exempt
        if self._is_exempt_path(request.path):
            return self.get_response(request)
        
        # Only check for authenticated users
        if request.user.is_authenticated:
            # Skip check for superusers
            if request.user.is_superuser:
                return self.get_response(request)
            
            # Skip check for demo user (for testing)
            if request.user.email == 'demo@scn.com':
                return self.get_response(request)
            
            # Check if email is verified
            if not getattr(request.user, 'is_email_verified', False):
                return JsonResponse(
                    {
                        'error': 'Email verification required',
                        'detail': 'Please verify your email address to access this feature',
                        'email': request.user.email,
                        'is_email_verified': False,
                        'verification_required': True,
                        'actions': {
                            'send_verification': '/api/v1/users/auth/send-verification/',
                            'resend_verification': '/api/v1/users/auth/resend-verification/'
                        }
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return self.get_response(request)
    
    def _is_exempt_path(self, path):
        """
        Check if path is exempt from email verification requirement
        """
        for pattern in self.exempt_patterns:
            if pattern.match(path):
                return True
        return False


class EmailVerificationRequiredMixin:
    """
    Mixin for views that require email verification
    Can be added to DRF viewsets or APIViews
    """
    
    def check_email_verified(self, request):
        """
        Check if user's email is verified
        Returns error response if not verified
        """
        if not request.user.is_authenticated:
            return None
        
        # Skip for superusers
        if request.user.is_superuser:
            return None
        
        # Skip for demo user
        if request.user.email == 'demo@scn.com':
            return None
        
        # Check verification status
        if not getattr(request.user, 'is_email_verified', False):
            return JsonResponse(
                {
                    'error': 'Email verification required',
                    'detail': 'Please verify your email address to access this feature',
                    'email': request.user.email,
                    'is_email_verified': False
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        return None
    
    def dispatch(self, request, *args, **kwargs):
        """
        Check email verification before processing request
        """
        error_response = self.check_email_verified(request)
        if error_response:
            return error_response
        
        return super().dispatch(request, *args, **kwargs)
