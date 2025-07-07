import secrets
import hashlib
from datetime import timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()


def generate_verification_token():
    """Generate a secure random token for email verification"""
    return secrets.token_urlsafe(32)


def send_verification_email(user, request=None):
    """Send email verification to user"""
    try:
        # Generate verification token
        token = generate_verification_token()
        user.email_verification_token = token
        user.email_verification_sent_at = timezone.now()
        user.save()
        
        # Build verification URL
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        verification_url = f"{frontend_url}/verify-email?token={token}&email={user.email}"
        
        # Render email template
        context = {
            'user': user,
            'verification_url': verification_url,
            'frontend_url': frontend_url,
        }
        
        html_message = render_to_string('email/verification.html', context)
        plain_message = f"""
Hi {user.first_name},

Welcome to SCN ESG Platform! Please verify your email address by clicking the link below:

{verification_url}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

Best regards,
SCN ESG Platform Team
        """
        
        # Send email
        send_mail(
            subject='Verify Your SCN ESG Platform Account',
            message=plain_message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        return True
        
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        return False


@api_view(['POST'])
@permission_classes([AllowAny])
def send_verification_email_view(request):
    """API endpoint to send/resend verification email"""
    try:
        email = request.data.get('email')
        if not email:
            return Response({
                'error': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'error': 'User with this email does not exist'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if user.is_email_verified:
            return Response({
                'message': 'Email is already verified'
            }, status=status.HTTP_200_OK)
        
        # Check if we can send another email (rate limiting)
        if user.email_verification_sent_at:
            time_since_last = timezone.now() - user.email_verification_sent_at
            if time_since_last < timedelta(minutes=1):  # 1 minute rate limit
                return Response({
                    'error': 'Please wait before requesting another verification email'
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Send verification email
        if send_verification_email(user, request):
            return Response({
                'message': 'Verification email sent successfully'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Failed to send verification email'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({
            'error': 'Failed to send verification email',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """API endpoint to verify email with token"""
    try:
        token = request.data.get('token')
        email = request.data.get('email')
        
        if not token or not email:
            return Response({
                'error': 'Token and email are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid verification link'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already verified
        if user.is_email_verified:
            return Response({
                'message': 'Email is already verified'
            }, status=status.HTTP_200_OK)
        
        # Verify token
        if not user.email_verification_token or user.email_verification_token != token:
            return Response({
                'error': 'Invalid verification token'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if token is expired (24 hours)
        if user.email_verification_sent_at:
            time_since_sent = timezone.now() - user.email_verification_sent_at
            if time_since_sent > timedelta(hours=24):
                return Response({
                    'error': 'Verification token has expired'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark as verified
        user.is_email_verified = True
        user.email_verification_token = None
        user.email_verification_sent_at = None
        user.save()
        
        return Response({
            'message': 'Email verified successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Email verification failed',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """API endpoint to request password reset"""
    try:
        email = request.data.get('email')
        if not email:
            return Response({
                'error': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal if user exists or not for security
            return Response({
                'message': 'If an account with this email exists, a password reset link has been sent'
            }, status=status.HTTP_200_OK)
        
        # Check rate limiting
        if user.password_reset_sent_at:
            time_since_last = timezone.now() - user.password_reset_sent_at
            if time_since_last < timedelta(minutes=5):  # 5 minute rate limit
                return Response({
                    'error': 'Please wait before requesting another password reset'
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Generate reset token
        token = generate_verification_token()
        user.password_reset_token = token
        user.password_reset_sent_at = timezone.now()
        user.save()
        
        # Build reset URL
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        reset_url = f"{frontend_url}/reset-password?token={token}&email={email}"
        
        # Send password reset email
        try:
            send_mail(
                subject='Reset Your SCN ESG Platform Password',
                message=f"""
Hi {user.first_name},

You requested a password reset for your SCN ESG Platform account.

Click the link below to reset your password:
{reset_url}

This link will expire in 2 hours for security reasons.

If you didn't request this reset, please ignore this email.

Best regards,
SCN ESG Platform Team
                """,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send password reset email: {e}")
        
        return Response({
            'message': 'If an account with this email exists, a password reset link has been sent'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Password reset request failed',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """API endpoint to reset password with token"""
    try:
        token = request.data.get('token')
        email = request.data.get('email')
        new_password = request.data.get('password')
        
        if not all([token, email, new_password]):
            return Response({
                'error': 'Token, email, and new password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid reset link'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify token
        if not user.password_reset_token or user.password_reset_token != token:
            return Response({
                'error': 'Invalid reset token'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if token is expired (2 hours)
        if user.password_reset_sent_at:
            time_since_sent = timezone.now() - user.password_reset_sent_at
            if time_since_sent > timedelta(hours=2):
                return Response({
                    'error': 'Reset token has expired'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate password strength
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({
                'error': 'Password validation failed',
                'details': list(e.messages)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Reset password
        user.set_password(new_password)
        user.password_reset_token = None
        user.password_reset_sent_at = None
        user.save()
        
        return Response({
            'message': 'Password reset successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Password reset failed',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
