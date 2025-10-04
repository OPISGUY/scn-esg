# Self-Hosted Email Setup Guide

**Last Updated**: October 4, 2025  
**Platform**: SCN ESG Platform  
**Goal**: Cost-effective, self-hosted transactional email system

---

## Overview

This guide covers setting up a self-hosted email infrastructure for the SCN ESG platform, eliminating the need for paid services like SendGrid or AWS SES while maintaining reliability and deliverability.

---

## Architecture Options

### Recommended: Hybrid Approach

```
┌─────────────────────────────────────────────────────────────┐
│                    Environment Strategy                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Development  →  MailHog (Docker)                           │
│       │                  ↓                                   │
│       │          No actual delivery                          │
│       │          Web UI: http://localhost:8025              │
│       │          SMTP: localhost:1025                        │
│                                                              │
│  Staging      →  Postfix Relay + Test Domain                │
│       │                  ↓                                   │
│       │          Real emails to test@scnesg.dev             │
│       │          Test deliverability                         │
│                                                              │
│  Production   →  Option A: Postfix with upstream relay      │
│       │         Option B: Managed SMTP (Mailgun/Postmark)   │
│       └──────────────────↓                                  │
│                  Production domain: scnesg.com               │
│                  Full SPF/DKIM/DMARC                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 1: Development Setup with MailHog

### What is MailHog?

MailHog is a lightweight SMTP server designed for testing. It captures all outgoing emails and displays them in a web interface, perfect for development.

**Features**:
- ✅ Zero configuration
- ✅ Web UI to view emails
- ✅ No actual email delivery (safe for testing)
- ✅ Compatible with any SMTP client
- ✅ Runs in Docker

### Installation

#### Option A: Docker (Recommended)

Create `docker-compose.dev.yml` in project root:

```yaml
version: '3.8'

services:
  mailhog:
    image: mailhog/mailhog:latest
    container_name: scn-esg-mailhog
    ports:
      - "1025:1025"  # SMTP server
      - "8025:8025"  # Web UI
    environment:
      MH_STORAGE: memory
      MH_UI_WEB_PATH: mailhog
    networks:
      - scn-esg-dev

  postgres:
    image: postgres:15-alpine
    container_name: scn-esg-postgres-dev
    environment:
      POSTGRES_DB: scn_esg_dev
      POSTGRES_USER: scn_user
      POSTGRES_PASSWORD: dev_password_123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - scn-esg-dev

networks:
  scn-esg-dev:
    driver: bridge

volumes:
  postgres_data:
```

**Start MailHog**:
```powershell
# From project root
docker-compose -f docker-compose.dev.yml up -d mailhog

# Verify it's running
docker ps | findstr mailhog

# View logs
docker logs scn-esg-mailhog
```

**Access Web UI**: http://localhost:8025

#### Option B: Binary Installation (Windows)

```powershell
# Download MailHog binary
$mailhogUrl = "https://github.com/mailhog/MailHog/releases/download/v1.0.1/MailHog_windows_amd64.exe"
Invoke-WebRequest -Uri $mailhogUrl -OutFile "$HOME\MailHog.exe"

# Run MailHog
& "$HOME\MailHog.exe"
```

### Django Configuration for MailHog

Update `backend/scn_esg_platform/settings.py`:

```python
# Email Configuration - Development
if DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = 'localhost'
    EMAIL_PORT = 1025
    EMAIL_USE_TLS = False
    EMAIL_USE_SSL = False
    EMAIL_HOST_USER = ''
    EMAIL_HOST_PASSWORD = ''
else:
    # Production config (see Part 2)
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = os.getenv('EMAIL_HOST', 'localhost')
    EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
    EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
    EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
    EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')

# Email settings (all environments)
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'SCN ESG Platform <noreply@scnesg.com>')
SERVER_EMAIL = DEFAULT_FROM_EMAIL
EMAIL_SUBJECT_PREFIX = '[SCN ESG] '
EMAIL_TIMEOUT = 10  # seconds

# Email verification settings
EMAIL_VERIFICATION_TIMEOUT = 24 * 60 * 60  # 24 hours
PASSWORD_RESET_TIMEOUT = 2 * 60 * 60  # 2 hours
```

### Testing MailHog

Create `backend/test_email.py`:

```python
#!/usr/bin/env python
"""
Test email sending via MailHog
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
from django.template.loader import render_to_string
from django.conf import settings


def test_simple_email():
    """Test simple text email"""
    print("📧 Testing simple email...")
    
    try:
        send_mail(
            subject='Test Email from SCN ESG Platform',
            message='This is a test email sent via MailHog.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['test@example.com'],
            fail_silently=False,
        )
        print("✅ Simple email sent successfully!")
        print("📬 Check MailHog UI at http://localhost:8025")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")


def test_html_email():
    """Test HTML email with inline CSS"""
    print("\n📧 Testing HTML email...")
    
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
            .container { background-color: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { padding: 20px; color: #333; }
            .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🌿 SCN ESG Platform</h1>
            </div>
            <div class="content">
                <h2>Welcome to SCN ESG Platform!</h2>
                <p>This is a test HTML email with beautiful styling.</p>
                <p>Click the button below to verify your email address:</p>
                <center>
                    <a href="https://scnesg.com/verify?token=abc123" class="button">Verify Email Address</a>
                </center>
                <p>Or copy and paste this link into your browser:</p>
                <p style="background-color: #f9f9f9; padding: 10px; border-left: 3px solid #10b981; font-family: monospace;">
                    https://scnesg.com/verify?token=abc123
                </p>
                <p>This link will expire in 24 hours.</p>
            </div>
            <div class="footer">
                <p>© 2025 SCN ESG Platform. All rights reserved.</p>
                <p>If you didn't request this email, please ignore it.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = """
    Welcome to SCN ESG Platform!
    
    Please verify your email address by clicking this link:
    https://scnesg.com/verify?token=abc123
    
    This link will expire in 24 hours.
    
    © 2025 SCN ESG Platform
    """
    
    try:
        email = EmailMultiAlternatives(
            subject='Welcome to SCN ESG Platform - Verify Your Email',
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=['newuser@example.com'],
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
        
        print("✅ HTML email sent successfully!")
        print("📬 Check MailHog UI at http://localhost:8025")
    except Exception as e:
        print(f"❌ Failed to send HTML email: {e}")


def test_multiple_recipients():
    """Test sending to multiple recipients"""
    print("\n📧 Testing multiple recipients...")
    
    try:
        send_mail(
            subject='Team Invitation - SCN ESG Platform',
            message='You have been invited to join TechCorp on SCN ESG Platform.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[
                'user1@example.com',
                'user2@example.com',
                'user3@example.com',
            ],
            fail_silently=False,
        )
        print("✅ Multi-recipient email sent successfully!")
        print("📬 Check MailHog UI at http://localhost:8025")
    except Exception as e:
        print(f"❌ Failed to send multi-recipient email: {e}")


if __name__ == '__main__':
    print("=" * 60)
    print("SCN ESG Platform - Email Testing Suite")
    print("=" * 60)
    print(f"\n📡 Email Backend: {settings.EMAIL_BACKEND}")
    print(f"📧 SMTP Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
    print(f"✉️  From Address: {settings.DEFAULT_FROM_EMAIL}")
    print(f"🔒 TLS Enabled: {settings.EMAIL_USE_TLS}")
    print("\n" + "=" * 60 + "\n")
    
    test_simple_email()
    test_html_email()
    test_multiple_recipients()
    
    print("\n" + "=" * 60)
    print("✅ All tests complete!")
    print("📬 View emails at: http://localhost:8025")
    print("=" * 60)
```

**Run tests**:
```powershell
# Make sure MailHog is running
docker ps | findstr mailhog

# Run email tests
python backend/test_email.py

# Open MailHog UI
Start-Process "http://localhost:8025"
```

---

## Part 2: Production Setup with Postfix

### Prerequisites

- VPS with static IP (DigitalOcean, Linode, Vultr, Hetzner)
- Domain name (e.g., scnesg.com)
- Root or sudo access
- Basic Linux knowledge

### Option A: Postfix Relay (Recommended for Startups)

This setup uses Postfix to relay through an upstream SMTP provider with better reputation.

**Advantages**:
- ✅ Better deliverability than direct sending
- ✅ No IP reputation warm-up needed
- ✅ Fallback if your IP gets blacklisted
- ✅ Still much cheaper than SendGrid

**Upstream Relay Options**:
- **Mailgun**: 5,000 emails/month free, then $0.80/1000
- **Postmark**: $10/month for 10,000 emails
- **Amazon SES**: $0.10/1000 emails
- **Sendinblue**: 300 emails/day free

### Option B: Direct Postfix Sending

Send emails directly from your server without relay.

**Requirements**:
- Dedicated IP with good reputation
- PTR (reverse DNS) record
- SPF, DKIM, DMARC records
- IP warm-up process (gradual sending increase)
- Monitoring for blacklists

### Installation (Ubuntu 22.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Postfix and required packages
sudo apt install -y postfix postfix-pcre opendkim opendkim-tools mailutils

# During installation, select:
# - General type: Internet Site
# - System mail name: mail.scnesg.com
```

### Basic Postfix Configuration

Edit `/etc/postfix/main.cf`:

```conf
# Basic settings
myhostname = mail.scnesg.com
mydomain = scnesg.com
myorigin = $mydomain
mydestination = localhost
relayhost =

# Network settings
inet_interfaces = all
inet_protocols = ipv4

# TLS settings
smtp_tls_security_level = may
smtp_tls_CAfile = /etc/ssl/certs/ca-certificates.crt
smtp_tls_session_cache_database = btree:${data_directory}/smtp_scache

smtpd_tls_security_level = may
smtpd_tls_cert_file = /etc/letsencrypt/live/mail.scnesg.com/fullchain.pem
smtpd_tls_key_file = /etc/letsencrypt/live/mail.scnesg.com/privkey.pem
smtpd_tls_session_cache_database = btree:${data_directory}/smtpd_scache

# Authentication (for Django to connect)
smtpd_sasl_auth_enable = yes
smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
smtpd_sasl_authenticated_header = yes

# Restrictions
smtpd_recipient_restrictions =
    permit_sasl_authenticated,
    permit_mynetworks,
    reject_unauth_destination

# DKIM and DMARC
milter_default_action = accept
milter_protocol = 6
smtpd_milters = inet:localhost:8891
non_smtpd_milters = inet:localhost:8891
```

### SSL/TLS Certificates with Let's Encrypt

```bash
# Install certbot
sudo apt install -y certbot

# Get certificate
sudo certbot certonly --standalone -d mail.scnesg.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### DKIM Setup

```bash
# Generate DKIM keys
sudo mkdir -p /etc/opendkim/keys/scnesg.com
cd /etc/opendkim/keys/scnesg.com
sudo opendkim-genkey -s mail -d scnesg.com
sudo chown opendkim:opendkim mail.private

# Configure OpenDKIM
sudo nano /etc/opendkim.conf
```

Add to `/etc/opendkim.conf`:

```conf
Syslog yes
SyslogSuccess yes
LogWhy yes

UMask 002
Mode sv
Socket inet:8891@localhost

Domain scnesg.com
KeyFile /etc/opendkim/keys/scnesg.com/mail.private
Selector mail

Canonicalization relaxed/simple
```

### DNS Records

Add these to your DNS (e.g., at Cloudflare, Namecheap):

```dns
# A record for mail server
mail.scnesg.com.    A    203.0.113.10

# MX record
scnesg.com.         MX   10 mail.scnesg.com.

# SPF record
scnesg.com.         TXT  "v=spf1 mx ip4:203.0.113.10 ~all"

# DKIM record (get from /etc/opendkim/keys/scnesg.com/mail.txt)
mail._domainkey.scnesg.com.  TXT  "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..."

# DMARC record
_dmarc.scnesg.com.  TXT  "v=DMARC1; p=quarantine; rua=mailto:dmarc@scnesg.com; ruf=mailto:dmarc@scnesg.com; fo=1"
```

### Django Production Configuration

Update `backend/scn_esg_platform/settings.py`:

```python
# Email Configuration - Production
if not DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = os.getenv('EMAIL_HOST', 'mail.scnesg.com')
    EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
    EMAIL_USE_TLS = True
    EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'django@scnesg.com')
    EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
    EMAIL_TIMEOUT = 30

DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'SCN ESG Platform <noreply@scnesg.com>')
SERVER_EMAIL = 'errors@scnesg.com'  # For error emails
ADMINS = [('Admin', 'admin@scnesg.com')]
```

### Environment Variables (Production)

Add to Render/Railway/Vercel:

```bash
EMAIL_HOST=mail.scnesg.com
EMAIL_PORT=587
EMAIL_HOST_USER=django@scnesg.com
EMAIL_HOST_PASSWORD=your_secure_password
DEFAULT_FROM_EMAIL=SCN ESG Platform <noreply@scnesg.com>
```

---

## Part 3: Testing & Monitoring

### Deliverability Testing

```bash
# Test sending from server
echo "Test email from Postfix" | mail -s "Test" your.email@gmail.com

# Check mail logs
sudo tail -f /var/log/mail.log

# Test SMTP connection
telnet mail.scnesg.com 587
```

### Online Tools

1. **Mail Tester**: https://www.mail-tester.com/
   - Send email to provided address
   - Get spam score and recommendations

2. **MX Toolbox**: https://mxtoolbox.com/
   - Check DNS records (SPF, DKIM, DMARC)
   - Verify MX configuration
   - Check blacklists

3. **DKIM Validator**: https://dkimvalidator.com/
   - Verify DKIM signature
   - Check alignment

### Monitoring Script

Create `backend/monitor_email.py`:

```python
#!/usr/bin/env python
"""
Monitor email sending health
Run as cron job: */15 * * * * /path/to/monitor_email.py
"""

import subprocess
import re
from datetime import datetime

def check_postfix_queue():
    """Check mail queue size"""
    result = subprocess.run(['mailq'], capture_output=True, text=True)
    output = result.stdout
    
    if 'Mail queue is empty' in output:
        print(f"✅ [{datetime.now()}] Mail queue is empty")
        return 0
    else:
        match = re.search(r'(\d+) Request', output)
        if match:
            count = int(match.group(1))
            print(f"⚠️ [{datetime.now()}] {count} emails in queue")
            return count
    return 0

def check_postfix_status():
    """Check if Postfix is running"""
    result = subprocess.run(['systemctl', 'is-active', 'postfix'], capture_output=True, text=True)
    status = result.stdout.strip()
    
    if status == 'active':
        print(f"✅ [{datetime.now()}] Postfix is running")
        return True
    else:
        print(f"❌ [{datetime.now()}] Postfix is NOT running!")
        # Auto-restart
        subprocess.run(['sudo', 'systemctl', 'restart', 'postfix'])
        return False

if __name__ == '__main__':
    check_postfix_status()
    queue_size = check_postfix_queue()
    
    # Alert if queue too large
    if queue_size > 100:
        print(f"🚨 ALERT: Large mail queue ({queue_size} emails)")
        # Send alert (implement your alerting)
```

---

## Part 4: Cost Comparison

### Self-Hosted vs Managed Services

| Solution | Setup Cost | Monthly Cost (10k emails) | Effort |
|----------|-----------|---------------------------|--------|
| **MailHog (Dev)** | $0 | $0 | Low |
| **Postfix (Self-Hosted)** | 2-3 hours | $5-10 VPS | Medium |
| **Postfix + Relay (Hybrid)** | 3-4 hours | $5 VPS + $10 relay | Medium |
| **SendGrid** | 0 hours | $20 | None |
| **Mailgun** | 0 hours | $8 (pay-as-you-go) | None |
| **Amazon SES** | 1 hour | $1 | Low |
| **Postmark** | 0 hours | $10 | None |

### Recommendation by Scale

- **< 1,000 emails/month**: Self-hosted Postfix (FREE after VPS)
- **1,000 - 10,000 emails/month**: Postfix + Mailgun relay ($5-15/month)
- **10,000+ emails/month**: Managed service (SendGrid, Postmark)

---

## Part 5: Troubleshooting

### Common Issues

#### Email not sending from Django

```python
# Test directly in Django shell
python manage.py shell

from django.core.mail import send_mail
send_mail('Test', 'Body', 'noreply@scnesg.com', ['test@gmail.com'])
```

Check:
- `EMAIL_HOST` and `EMAIL_PORT` correct?
- Firewall blocking port 587?
- TLS certificate valid?
- Authentication credentials correct?

#### Emails going to spam

**Fixes**:
1. Verify SPF, DKIM, DMARC records
2. Check IP not on blacklists (MX Toolbox)
3. Add unsubscribe link to emails
4. Warm up IP gradually (10, 50, 100, 500 emails/day)
5. Use proper From name and address
6. Avoid spam trigger words ("free", "winner", etc.)

#### High bounce rate

**Causes**:
- Invalid recipient addresses
- Domain doesn't exist
- Mailbox full
- Greylisting (temporary rejection)

**Solutions**:
- Validate email addresses before sending
- Implement bounce handling
- Retry failed deliveries with exponential backoff
- Remove invalid addresses from database

---

## Part 6: Next Steps

Once email infrastructure is ready:

1. ✅ Implement email verification flow (Phase 2)
2. ✅ Create HTML email templates
3. ✅ Add password reset functionality
4. ✅ Set up email logging and monitoring
5. ✅ Test deliverability to major providers
6. ✅ Document for team and admins

---

## Conclusion

Self-hosted email with MailHog (dev) and Postfix (prod) provides a cost-effective solution for the SCN ESG platform. This approach offers:

- ✅ **Cost Savings**: $5-15/month vs $20-50/month for managed services
- ✅ **Control**: Full customization and debugging access
- ✅ **Privacy**: Email content stays on your infrastructure
- ✅ **Scalability**: Can handle thousands of emails/month

For production deployment, the hybrid approach (Postfix + upstream relay) balances cost, control, and deliverability.

**Ready to implement!** 🚀
