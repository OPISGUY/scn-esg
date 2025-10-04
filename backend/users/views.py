from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from .serializers import UserSerializer
from utils.email_service import send_verification_email, send_password_reset_email, send_welcome_email
from utils.tokens import (
    generate_verification_token,
    check_verification_token,
    generate_password_reset_token,
    check_password_reset_token
)
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User CRUD operations"""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter users based on permissions"""
        user = self.request.user
        if user.is_superuser:
            return User.objects.all()
        elif user.company:
            return User.objects.filter(company=user.company)
        else:
            return User.objects.filter(id=user.id)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_verification_email_view(request):
    """
    Send or resend email verification email to authenticated user
    POST /api/v1/auth/send-verification/
    """
    user = request.user
    
    # Check if already verified
    if user.is_email_verified:
        return Response(
            {'detail': 'Email is already verified'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check rate limiting (max 3 emails per hour)
    if user.email_verification_sent_at:
        time_since_last = timezone.now() - user.email_verification_sent_at
        if time_since_last.total_seconds() < 1200:  # 20 minutes
            remaining = 1200 - int(time_since_last.total_seconds())
            return Response(
                {
                    'detail': f'Please wait {remaining // 60} minutes before requesting another verification email',
                    'retry_after': remaining
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
    
    # Generate token
    token = generate_verification_token(user)
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    
    # Build verification URL
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    verification_url = f"{frontend_url}/verify-email/{uidb64}/{token}/"
    
    # Send email
    email_sent = send_verification_email(user, verification_url)
    
    if email_sent:
        # Update user
        user.email_verification_token = token
        user.email_verification_sent_at = timezone.now()
        user.save()
        
        logger.info(f"Verification email sent to {user.email}")
        
        return Response({
            'detail': 'Verification email sent successfully',
            'email': user.email,
            'sent_at': user.email_verification_sent_at.isoformat()
        })
    else:
        logger.error(f"Failed to send verification email to {user.email}")
        return Response(
            {'detail': 'Failed to send verification email. Please try again later.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email_view(request, uidb64, token):
    """
    Verify user's email address with token
    GET /api/v1/auth/verify-email/<uidb64>/<token>/
    """
    try:
        # Decode user ID
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response(
            {'detail': 'Invalid verification link'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if already verified
    if user.is_email_verified:
        return Response({
            'detail': 'Email is already verified',
            'email': user.email,
            'verified_at': user.email_verified_at.isoformat() if user.email_verified_at else None
        })
    
    # Verify token
    if check_verification_token(user, token):
        # Mark as verified
        user.is_email_verified = True
        user.email_verified_at = timezone.now()
        user.email_verification_token = None  # Invalidate token
        user.save()
        
        logger.info(f"Email verified for user {user.email}")
        
        # Send welcome email
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        dashboard_url = f"{frontend_url}/dashboard"
        send_welcome_email(user, dashboard_url)
        
        return Response({
            'detail': 'Email verified successfully',
            'email': user.email,
            'verified_at': user.email_verified_at.isoformat()
        })
    else:
        logger.warning(f"Invalid or expired verification token for {user.email}")
        return Response(
            {
                'detail': 'Verification link is invalid or has expired',
                'can_resend': True
            },
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request_view(request):
    """
    Request password reset email
    POST /api/v1/auth/password-reset/
    Body: {"email": "user@example.com"}
    """
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'detail': 'Email address is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
        
        # Check rate limiting (max 3 emails per hour)
        if user.password_reset_sent_at:
            time_since_last = timezone.now() - user.password_reset_sent_at
            if time_since_last.total_seconds() < 1200:  # 20 minutes
                remaining = 1200 - int(time_since_last.total_seconds())
                return Response(
                    {
                        'detail': f'Please wait {remaining // 60} minutes before requesting another reset',
                        'retry_after': remaining
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
        
        # Generate token
        token = generate_password_reset_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Build reset URL
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        reset_url = f"{frontend_url}/reset-password/{uidb64}/{token}/"
        
        # Send email
        email_sent = send_password_reset_email(user, reset_url)
        
        if email_sent:
            user.password_reset_token = token
            user.password_reset_sent_at = timezone.now()
            user.save()
            
            logger.info(f"Password reset email sent to {user.email}")
    
    except User.DoesNotExist:
        # Don't reveal if user exists or not (security)
        logger.warning(f"Password reset requested for non-existent email: {email}")
    
    # Always return success to prevent email enumeration
    return Response({
        'detail': 'If an account exists with this email, a password reset link has been sent'
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm_view(request, uidb64, token):
    """
    Confirm password reset with token and new password
    POST /api/v1/auth/password-reset-confirm/<uidb64>/<token>/
    Body: {"new_password": "newpass123"}
    """
    new_password = request.data.get('new_password')
    
    if not new_password:
        return Response(
            {'detail': 'New password is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(new_password) < 8:
        return Response(
            {'detail': 'Password must be at least 8 characters long'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Decode user ID
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response(
            {'detail': 'Invalid reset link'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verify token
    if check_password_reset_token(user, token):
        # Set new password
        user.set_password(new_password)
        user.password_reset_token = None  # Invalidate token
        user.save()
        
        logger.info(f"Password reset successful for {user.email}")
        
        return Response({
            'detail': 'Password has been reset successfully',
            'email': user.email
        })
    else:
        logger.warning(f"Invalid or expired password reset token for {user.email}")
        return Response(
            {
                'detail': 'Reset link is invalid or has expired',
                'can_request_new': True
            },
            status=status.HTTP_400_BAD_REQUEST
        )
