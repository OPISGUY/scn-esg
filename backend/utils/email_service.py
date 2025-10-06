"""
Email Service Layer for Verdant By SCN
Handles sending emails with retry logic, error handling, and            'subject': 'Verify Your Email - Verdant By SCN',logging
"""

import logging
import time
from datetime import datetime
from typing import Optional, List, Dict, Any
from django.conf import settings
from django.core.mail import EmailMultiAlternatives, send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails with retry logic and error handling"""
    
    DEFAULT_FROM_EMAIL = settings.DEFAULT_FROM_EMAIL
    MAX_RETRIES = 3
    RETRY_DELAY = 2  # seconds
    
    @staticmethod
    def _send_email_with_retry(
        subject: str,
        html_content: str,
        text_content: str,
        to_emails: List[str],
        from_email: Optional[str] = None,
        attachments: Optional[List] = None,
        max_retries: int = MAX_RETRIES
    ) -> bool:
        """
        Send email with retry logic
        
        Args:
            subject: Email subject
            html_content: HTML version of email
            text_content: Plain text version
            to_emails: List of recipient email addresses
            from_email: Sender email (defaults to DEFAULT_FROM_EMAIL)
            attachments: Optional list of attachments
            max_retries: Maximum number of retry attempts
            
        Returns:
            True if email sent successfully, False otherwise
        """
        from_email = from_email or EmailService.DEFAULT_FROM_EMAIL
        
        for attempt in range(max_retries):
            try:
                email = EmailMultiAlternatives(
                    subject=subject,
                    body=text_content,
                    from_email=from_email,
                    to=to_emails,
                )
                email.attach_alternative(html_content, "text/html")
                
                # Add attachments if provided
                if attachments:
                    for attachment in attachments:
                        email.attach(*attachment)
                
                result = email.send(fail_silently=False)
                
                if result == 1:
                    logger.info(f"Email sent successfully: {subject} to {', '.join(to_emails)}")
                    return True
                else:
                    logger.warning(f"Email send returned {result}: {subject}")
                    
            except Exception as e:
                logger.error(
                    f"Email send attempt {attempt + 1}/{max_retries} failed: {subject} to {to_emails}. "
                    f"Error: {str(e)}"
                )
                
                if attempt < max_retries - 1:
                    # Exponential backoff
                    delay = EmailService.RETRY_DELAY * (2 ** attempt)
                    logger.info(f"Retrying in {delay} seconds...")
                    time.sleep(delay)
                else:
                    logger.error(f"Email failed after {max_retries} attempts: {subject}")
                    return False
        
        return False
    
    @staticmethod
    def send_verification_email(user, verification_url: str) -> bool:
        """
        Send email verification email to user
        
        Args:
            user: User model instance
            verification_url: Full URL for email verification
            
        Returns:
            True if email sent successfully
        """
        context = {
            'user': user,
            'verification_url': verification_url,
            'current_year': datetime.now().year,
            'subject': 'Verify Your Email - Verdant By SCN'
        }
        
        try:
            html_content = render_to_string('emails/verification_email.html', context)
            text_content = render_to_string('emails/verification_email.txt', context)
            
            return EmailService._send_email_with_retry(
                subject='Verify Your Email - Verdant By SCN',
                html_content=html_content,
                text_content=text_content,
                to_emails=[user.email],
            )
        except Exception as e:
            logger.error(f"Failed to render verification email template: {str(e)}")
            return False
    
    @staticmethod
    def send_password_reset_email(user, reset_url: str) -> bool:
        """
        Send password reset email to user
        
        Args:
            user: User model instance
            reset_url: Full URL for password reset
            
        Returns:
            True if email sent successfully
        """
        context = {
            'user': user,
            'reset_url': reset_url,
            'current_year': datetime.now().year,
                        'subject': 'Password Reset Request - Verdant By SCN',
        }
        
        try:
            html_content = render_to_string('emails/password_reset.html', context)
            text_content = render_to_string('emails/password_reset.txt', context)
            
            return EmailService._send_email_with_retry(
                subject='Password Reset Request - Verdant By SCN',
                html_content=html_content,
                text_content=text_content,
                to_emails=[user.email],
            )
        except Exception as e:
            logger.error(f"Failed to render password reset email template: {str(e)}")
            return False
    
    @staticmethod
    def send_welcome_email(user, dashboard_url: str) -> bool:
        """
        Send welcome email after successful verification
        
        Args:
            user: User model instance
            dashboard_url: Full URL to dashboard
            
        Returns:
            True if email sent successfully
        """
        context = {
            'user': user,
            'dashboard_url': dashboard_url,
            'current_year': datetime.now().year,
            'subject': 'Welcome to Verdant By SCN!'
        }
        
        try:
            html_content = render_to_string('emails/welcome.html', context)
            # Generate plain text version by stripping HTML
            text_content = strip_tags(html_content)
            
            return EmailService._send_email_with_retry(
                subject='Welcome to Verdant By SCN!',
                html_content=html_content,
                text_content=text_content,
                to_emails=[user.email],
            )
        except Exception as e:
            logger.error(f"Failed to render welcome email template: {str(e)}")
            return False
    
    @staticmethod
    def send_team_invitation(
        inviter_name: str,
        company_name: str,
        invitation_url: str,
        recipient_email: str
    ) -> bool:
        """
        Send team invitation email
        
        Args:
            inviter_name: Name of person sending invitation
            company_name: Company name
            invitation_url: Full URL to accept invitation
            recipient_email: Email address of invitee
            
        Returns:
            True if email sent successfully
        """
        subject = f"{inviter_name} invited you to {company_name} on Verdant By SCN"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>You've been invited!</h2>
            <p><strong>{inviter_name}</strong> has invited you to join <strong>{company_name}</strong> on Verdant By SCN.</p>
            <p><a href="{invitation_url}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Accept Invitation</a></p>
            <p>Or copy this link: {invitation_url}</p>
            <p>If you don't want to join, you can safely ignore this email.</p>
        </body>
        </html>
        """
        
        text_content = f"""
        You've been invited!
        
        {inviter_name} has invited you to join {company_name} on Verdant By SCN.
        
        Click here to accept: {invitation_url}
        
        If you don't want to join, you can safely ignore this email.
        """
        
        return EmailService._send_email_with_retry(
            subject=subject,
            html_content=html_content,
            text_content=text_content,
            to_emails=[recipient_email],
        )
    
    @staticmethod
    def send_simple_email(
        subject: str,
        message: str,
        to_emails: List[str],
        html_message: Optional[str] = None
    ) -> bool:
        """
        Send a simple email (for testing or one-off messages)
        
        Args:
            subject: Email subject
            message: Plain text message
            to_emails: List of recipient emails
            html_message: Optional HTML version
            
        Returns:
            True if email sent successfully
        """
        try:
            if html_message:
                return EmailService._send_email_with_retry(
                    subject=subject,
                    html_content=html_message,
                    text_content=message,
                    to_emails=to_emails,
                )
            else:
                result = send_mail(
                    subject=subject,
                    message=message,
                    from_email=EmailService.DEFAULT_FROM_EMAIL,
                    recipient_list=to_emails,
                    fail_silently=False,
                )
                return result == len(to_emails)
        except Exception as e:
            logger.error(f"Failed to send simple email: {str(e)}")
            return False


# Convenience functions for easy import
def send_verification_email(user, verification_url: str) -> bool:
    """Send verification email - convenience wrapper"""
    return EmailService.send_verification_email(user, verification_url)


def send_password_reset_email(user, reset_url: str) -> bool:
    """Send password reset email - convenience wrapper"""
    return EmailService.send_password_reset_email(user, reset_url)


def send_welcome_email(user, dashboard_url: str) -> bool:
    """Send welcome email - convenience wrapper"""
    return EmailService.send_welcome_email(user, dashboard_url)


def send_team_invitation(inviter_name: str, company_name: str, invitation_url: str, recipient_email: str) -> bool:
    """Send team invitation - convenience wrapper"""
    return EmailService.send_team_invitation(inviter_name, company_name, invitation_url, recipient_email)
