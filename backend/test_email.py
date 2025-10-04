#!/usr/bin/env python
"""
Test email sending via MailHog or configured SMTP
Run: python backend/test_email.py
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scn_esg_platform.settings')
django.setup()

from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings


def test_simple_email():
    """Test simple text email"""
    print("📧 Testing simple email...")
    
    try:
        result = send_mail(
            subject='Test Email from SCN ESG Platform',
            message='This is a test email. If you can read this, email sending is working correctly!',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['test@example.com'],
            fail_silently=False,
        )
        if result == 1:
            print("✅ Simple email sent successfully!")
            if 'localhost' in settings.EMAIL_HOST:
                print("📬 Check MailHog UI at http://localhost:8025")
        else:
            print("⚠️  Email may not have been sent (returned 0)")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        import traceback
        traceback.print_exc()


def test_html_email():
    """Test HTML email with inline CSS"""
    print("\n📧 Testing HTML email...")
    
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background-color: #f4f7fa;
                padding: 20px;
                margin: 0;
            }
            .container {
                background-color: white;
                padding: 0;
                border-radius: 12px;
                max-width: 600px;
                margin: 0 auto;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
            }
            .content {
                padding: 40px 30px;
                color: #374151;
                line-height: 1.6;
            }
            .content h2 {
                color: #1f2937;
                font-size: 22px;
                margin-top: 0;
            }
            .button {
                display: inline-block;
                background-color: #10b981;
                color: white;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 8px;
                margin: 20px 0;
                font-weight: 600;
                transition: background-color 0.3s;
            }
            .button:hover {
                background-color: #059669;
            }
            .code-box {
                background-color: #f3f4f6;
                padding: 16px;
                border-left: 4px solid #10b981;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                word-break: break-all;
                margin: 20px 0;
            }
            .info-box {
                background-color: #dbeafe;
                border-left: 4px solid #3b82f6;
                padding: 16px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                color: #6b7280;
                font-size: 13px;
                margin-top: 40px;
                padding-top: 30px;
                border-top: 1px solid #e5e7eb;
            }
            .footer p {
                margin: 5px 0;
            }
            .footer a {
                color: #10b981;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌿 SCN ESG Platform</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Sustainable Business Intelligence</p>
            </div>
            <div class="content">
                <h2>Welcome to SCN ESG Platform!</h2>
                <p>Thank you for joining our sustainability revolution. We're excited to help you track, analyze, and reduce your organization's carbon footprint.</p>
                
                <p>To get started, please verify your email address by clicking the button below:</p>
                
                <center>
                    <a href="https://scnesg.com/verify?token=abc123xyz789" class="button">
                        ✓ Verify Email Address
                    </a>
                </center>
                
                <p>Or copy and paste this link into your browser:</p>
                <div class="code-box">
                    https://scnesg.com/verify?token=abc123xyz789
                </div>
                
                <div class="info-box">
                    <strong>⏰ Important:</strong> This verification link will expire in <strong>24 hours</strong> for security reasons.
                </div>
                
                <p>Once verified, you'll be able to:</p>
                <ul style="line-height: 2;">
                    <li>📊 Calculate your carbon footprint using GHG Protocol</li>
                    <li>🌱 Track Scope 1, 2, and 3 emissions</li>
                    <li>📈 Generate compliance reports (CSRD, ESRS, CDP)</li>
                    <li>🤖 Get AI-powered sustainability insights</li>
                    <li>💚 Purchase carbon offsets and achieve net-zero</li>
                </ul>
                
                <p>Need help? Our support team is here for you:</p>
                <p>📧 Email: <a href="mailto:support@scnesg.com" style="color: #10b981; text-decoration: none;">support@scnesg.com</a><br>
                📚 Documentation: <a href="https://docs.scnesg.com" style="color: #10b981; text-decoration: none;">docs.scnesg.com</a></p>
            </div>
            <div class="footer">
                <p><strong>SCN ESG Platform</strong></p>
                <p>© 2025 SCN Limited. All rights reserved.</p>
                <p style="margin-top: 15px;">
                    <a href="https://scnesg.com/privacy">Privacy Policy</a> |
                    <a href="https://scnesg.com/terms">Terms of Service</a> |
                    <a href="https://scnesg.com/unsubscribe">Unsubscribe</a>
                </p>
                <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
                    If you didn't create an account on SCN ESG Platform, please ignore this email or 
                    <a href="mailto:security@scnesg.com" style="color: #9ca3af;">contact our security team</a>.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = """
    Welcome to SCN ESG Platform!

    Thank you for joining our sustainability revolution. We're excited to help you track, 
    analyze, and reduce your organization's carbon footprint.

    VERIFY YOUR EMAIL
    
    Please verify your email address by clicking this link:
    https://scnesg.com/verify?token=abc123xyz789
    
    This link will expire in 24 hours for security reasons.

    WHAT YOU CAN DO

    Once verified, you'll be able to:
    - Calculate your carbon footprint using GHG Protocol
    - Track Scope 1, 2, and 3 emissions
    - Generate compliance reports (CSRD, ESRS, CDP)
    - Get AI-powered sustainability insights
    - Purchase carbon offsets and achieve net-zero

    NEED HELP?

    Email: support@scnesg.com
    Documentation: docs.scnesg.com

    ---
    © 2025 SCN Limited. All rights reserved.
    
    If you didn't create an account, please ignore this email.
    """
    
    try:
        email = EmailMultiAlternatives(
            subject='Welcome to SCN ESG Platform - Verify Your Email',
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=['newuser@example.com'],
        )
        email.attach_alternative(html_content, "text/html")
        result = email.send(fail_silently=False)
        
        if result == 1:
            print("✅ HTML email sent successfully!")
            if 'localhost' in settings.EMAIL_HOST:
                print("📬 Check MailHog UI at http://localhost:8025")
        else:
            print("⚠️  Email may not have been sent (returned 0)")
    except Exception as e:
        print(f"❌ Failed to send HTML email: {e}")
        import traceback
        traceback.print_exc()


def test_multiple_recipients():
    """Test sending to multiple recipients"""
    print("\n📧 Testing multiple recipients...")
    
    try:
        result = send_mail(
            subject='Team Invitation - SCN ESG Platform',
            message='You have been invited to join TechCorp on SCN ESG Platform. Click here to accept: https://scnesg.com/invitations/accept/token123',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[
                'user1@example.com',
                'user2@example.com',
                'user3@example.com',
            ],
            fail_silently=False,
        )
        if result == 3:
            print("✅ Multi-recipient email sent successfully (3 emails)!")
            if 'localhost' in settings.EMAIL_HOST:
                print("📬 Check MailHog UI at http://localhost:8025")
        else:
            print(f"⚠️  Expected 3 emails, sent {result}")
    except Exception as e:
        print(f"❌ Failed to send multi-recipient email: {e}")
        import traceback
        traceback.print_exc()


def test_password_reset():
    """Test password reset email"""
    print("\n📧 Testing password reset email...")
    
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f7fa; padding: 20px; }
            .container { background-color: white; padding: 0; border-radius: 12px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 20px; text-align: center; }
            .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
            .button { display: inline-block; background-color: #ef4444; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
            .code-box { background-color: #f3f4f6; padding: 16px; border-left: 4px solid #ef4444; font-family: monospace; font-size: 14px; word-break: break-all; margin: 20px 0; }
            .warning-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 13px; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔒 Password Reset Request</h1>
            </div>
            <div class="content">
                <h2>Reset Your Password</h2>
                <p>We received a request to reset your password for your SCN ESG Platform account.</p>
                
                <p>Click the button below to choose a new password:</p>
                
                <center>
                    <a href="https://scnesg.com/reset-password?token=reset456def" class="button">
                        Reset Password
                    </a>
                </center>
                
                <p>Or copy and paste this link:</p>
                <div class="code-box">
                    https://scnesg.com/reset-password?token=reset456def
                </div>
                
                <div class="warning-box">
                    <strong>⚠️ Security Notice:</strong> This link will expire in <strong>2 hours</strong>. If you didn't request a password reset, please ignore this email or contact our security team immediately.
                </div>
                
                <p><strong>Password Requirements:</strong></p>
                <ul>
                    <li>At least 8 characters long</li>
                    <li>Contains uppercase and lowercase letters</li>
                    <li>Contains at least one number</li>
                    <li>Avoid common passwords</li>
                </ul>
            </div>
            <div class="footer">
                <p>© 2025 SCN Limited</p>
                <p style="margin-top: 10px; font-size: 12px;">
                    If you didn't request this, your account is still secure. 
                    <a href="mailto:security@scnesg.com" style="color: #ef4444;">Contact security</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = """
    Password Reset Request - SCN ESG Platform

    We received a request to reset your password.

    Click this link to reset your password:
    https://scnesg.com/reset-password?token=reset456def

    This link will expire in 2 hours.

    If you didn't request this, please ignore this email or contact security@scnesg.com

    Password Requirements:
    - At least 8 characters
    - Uppercase and lowercase letters
    - At least one number

    © 2025 SCN Limited
    """
    
    try:
        email = EmailMultiAlternatives(
            subject='Password Reset Request - SCN ESG Platform',
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=['user@example.com'],
        )
        email.attach_alternative(html_content, "text/html")
        result = email.send(fail_silently=False)
        
        if result == 1:
            print("✅ Password reset email sent successfully!")
            if 'localhost' in settings.EMAIL_HOST:
                print("📬 Check MailHog UI at http://localhost:8025")
        else:
            print("⚠️  Email may not have been sent")
    except Exception as e:
        print(f"❌ Failed to send password reset email: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    print("=" * 70)
    print("SCN ESG Platform - Email Testing Suite")
    print("=" * 70)
    print(f"\n📡 Email Backend: {settings.EMAIL_BACKEND}")
    print(f"📧 SMTP Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
    print(f"✉️  From Address: {settings.DEFAULT_FROM_EMAIL}")
    print(f"🔒 TLS Enabled: {getattr(settings, 'EMAIL_USE_TLS', False)}")
    print(f"🔐 SSL Enabled: {getattr(settings, 'EMAIL_USE_SSL', False)}")
    
    if hasattr(settings, 'EMAIL_HOST_USER') and settings.EMAIL_HOST_USER:
        print(f"👤 SMTP User: {settings.EMAIL_HOST_USER}")
    
    print("\n" + "=" * 70 + "\n")
    
    # Run all tests
    test_simple_email()
    test_html_email()
    test_multiple_recipients()
    test_password_reset()
    
    print("\n" + "=" * 70)
    print("✅ All tests complete!")
    if 'localhost' in settings.EMAIL_HOST:
        print("\n📬 View all emails at: http://localhost:8025")
        print("   (MailHog Web Interface)")
    print("=" * 70)
