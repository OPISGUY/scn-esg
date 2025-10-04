# Email Setup Quickstart - MailHog

**Status**: ✅ Ready to start  
**Estimated Time**: 5-10 minutes  
**Prerequisites**: Docker Desktop installed

---

## What We're Setting Up

Self-hosted email testing infrastructure using **MailHog**:
- 📧 Catches all emails sent from Django
- 🌐 Web UI to view/test emails (http://localhost:8025)
- 🚀 Zero configuration needed
- 💰 Completely free
- 🔄 Automatic refresh on new emails

---

## Quick Start (3 Steps)

### Step 1: Start MailHog (30 seconds)

Open PowerShell in the project root and run:

```powershell
docker-compose -f docker-compose.dev.yml up -d mailhog
```

**Expected Output**:
```
Creating network "scn-esg_scn-esg-dev" with driver "bridge"
Creating scn-esg-mailhog ... done
```

**Verify it's running**:
```powershell
docker ps | Select-String mailhog
```

You should see:
```
scn-esg-mailhog   mailhog/mailhog:latest   0.0.0.0:1025->1025/tcp, 0.0.0.0:8025->8025/tcp
```

### Step 2: Open MailHog Web UI

Open your browser and go to:
```
http://localhost:8025
```

You should see the MailHog inbox interface (empty for now).

### Step 3: Test Email Sending

Run the test script:

```powershell
cd backend
python test_email.py
```

**Expected Output**:
```
======================================================================
SCN ESG Platform - Email Testing Suite
======================================================================

📡 Email Backend: django.core.mail.backends.smtp.EmailBackend
📧 SMTP Host: localhost:1025
✉️  From Address: SCN ESG Platform <noreply@scnesg.com>

======================================================================

📧 Testing simple email...
✅ Simple email sent successfully!
📬 Check MailHog UI at http://localhost:8025

📧 Testing HTML email...
✅ HTML email sent successfully!
📬 Check MailHog UI at http://localhost:8025

📧 Testing multiple recipients...
✅ Multi-recipient email sent successfully (3 emails)!
📬 Check MailHog UI at http://localhost:8025

📧 Testing password reset email...
✅ Password reset email sent successfully!
📬 Check MailHog UI at http://localhost:8025

======================================================================
✅ All tests complete!

📬 View all emails at: http://localhost:8025
   (MailHog Web Interface)
======================================================================
```

### Step 4: View Emails in MailHog

Refresh http://localhost:8025 and you should see **7 test emails**:

1. ✉️ Test Email from SCN ESG Platform (plain text)
2. ✉️ Welcome to SCN ESG Platform - Verify Your Email (HTML)
3. ✉️ Team Invitation - SCN ESG Platform (3 copies, one per recipient)
4. ✉️ Password Reset Request - SCN ESG Platform (HTML)

Click any email to view:
- 📱 HTML preview
- 📄 Plain text version
- 📋 Raw source
- 🔍 Headers

---

## MailHog Features

### Web UI (http://localhost:8025)
- **View all emails** in a Gmail-like interface
- **Search emails** by subject, sender, recipient
- **Delete emails** individually or clear all
- **Download emails** as .eml files
- **Real-time updates** when new emails arrive

### MailHog API (http://localhost:8025/api/)
- `GET /api/v1/messages` - List all messages
- `GET /api/v1/messages/{id}` - Get specific message
- `DELETE /api/v1/messages/{id}` - Delete message
- `DELETE /api/v1/messages` - Delete all messages

---

## Integration with Django

### Current Configuration (Already Done ✅)

**File**: `backend/scn_esg_platform/settings.py`

```python
if DEBUG:
    # MailHog for local development
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = os.getenv('EMAIL_HOST', 'localhost')
    EMAIL_PORT = int(os.getenv('EMAIL_PORT', '1025'))
    EMAIL_USE_TLS = False
    EMAIL_USE_SSL = False
    EMAIL_HOST_USER = ''
    EMAIL_HOST_PASSWORD = ''
else:
    # Production SMTP
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    # ... production config ...
```

**From Address**: `SCN ESG Platform <noreply@scnesg.com>`

---

## Useful Commands

### Start MailHog
```powershell
docker-compose -f docker-compose.dev.yml up -d mailhog
```

### Stop MailHog
```powershell
docker-compose -f docker-compose.dev.yml stop mailhog
```

### Restart MailHog
```powershell
docker-compose -f docker-compose.dev.yml restart mailhog
```

### View MailHog Logs
```powershell
docker-compose -f docker-compose.dev.yml logs -f mailhog
```

### Remove MailHog (Clean Up)
```powershell
docker-compose -f docker-compose.dev.yml down mailhog
```

### Clear All Emails via API
```powershell
Invoke-RestMethod -Method Delete -Uri http://localhost:8025/api/v1/messages
```

---

## Testing Email Templates

### Send Test Email from Django Shell

```powershell
cd backend
python manage.py shell
```

```python
from django.core.mail import send_mail
from django.conf import settings

send_mail(
    subject='Test from Django Shell',
    message='This is a test email sent from the Django shell.',
    from_email=settings.DEFAULT_FROM_EMAIL,
    recipient_list=['test@example.com'],
    fail_silently=False,
)
# Returns: 1 (success)
```

Check http://localhost:8025 to see the email!

### Send HTML Email

```python
from django.core.mail import EmailMultiAlternatives

email = EmailMultiAlternatives(
    subject='HTML Test Email',
    body='This is the plain text version.',
    from_email='SCN ESG Platform <noreply@scnesg.com>',
    to=['user@example.com'],
)

html_content = """
<html>
<body style="font-family: Arial, sans-serif;">
    <h1 style="color: #10b981;">Hello from SCN ESG!</h1>
    <p>This is an <strong>HTML email</strong> with styling.</p>
    <a href="https://scnesg.com" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Visit Our Platform
    </a>
</body>
</html>
"""

email.attach_alternative(html_content, "text/html")
email.send()
```

---

## Troubleshooting

### ⚠️ MailHog container won't start

**Check if port 1025 or 8025 is already in use**:
```powershell
netstat -ano | Select-String "1025"
netstat -ano | Select-String "8025"
```

If in use, stop the conflicting service or change ports in `docker-compose.dev.yml`:
```yaml
ports:
  - "2025:1025"  # Changed host port to 2025
  - "9025:8025"  # Changed host port to 9025
```

Then update `settings.py`:
```python
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '2025'))
```

### ⚠️ Emails not appearing in MailHog

**1. Verify MailHog is running**:
```powershell
docker ps | Select-String mailhog
```

**2. Check Django settings**:
```powershell
cd backend
python manage.py shell
```
```python
from django.conf import settings
print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
# Should show: localhost:1025
```

**3. Check MailHog logs**:
```powershell
docker-compose -f docker-compose.dev.yml logs mailhog
```

**4. Test SMTP connection manually**:
```powershell
telnet localhost 1025
# Type: EHLO test
# Type: QUIT
```

### ⚠️ Django says "Connection refused"

Ensure MailHog is running:
```powershell
docker-compose -f docker-compose.dev.yml up -d mailhog
```

Wait 5 seconds for MailHog to fully start, then retry.

### ⚠️ Port 8025 shows "Site can't be reached"

Try accessing with explicit localhost:
```
http://127.0.0.1:8025
```

Or check Docker container network:
```powershell
docker inspect scn-esg-mailhog | Select-String "IPAddress"
```

### ⚠️ Emails have wrong "From" address

Check `DEFAULT_FROM_EMAIL` in settings:
```python
# Should be:
DEFAULT_FROM_EMAIL = 'SCN ESG Platform <noreply@scnesg.com>'
```

---

## Next Steps

### ✅ Phase 1 Complete - MailHog Working

Now we can build the email verification system:

### Phase 2: Email Verification (Next)

**Tasks**:
1. Create email templates (`verification_email.html`)
2. Build email service layer (`utils/email_service.py`)
3. Add verification endpoints:
   - `POST /api/v1/auth/send-verification/`
   - `GET /api/v1/auth/verify-email/<token>/`
   - `POST /api/v1/auth/resend-verification/`
4. Add verification middleware (block unverified users)
5. Update frontend `EmailVerificationPage.tsx`

**Estimated Time**: 4-6 hours

### Phase 3: Password Reset (After Verification)

**Tasks**:
1. Password reset email template
2. Reset endpoints:
   - `POST /api/v1/auth/password-reset/`
   - `POST /api/v1/auth/password-reset-confirm/<token>/`
3. Frontend password reset flow

**Estimated Time**: 2-3 hours

---

## Production Deployment

Once verified in development, follow **SELF_HOSTED_EMAIL_GUIDE.md** Part 2 to set up Postfix for production.

**Production checklist**:
- [ ] Provision VPS ($5-10/month)
- [ ] Install Postfix
- [ ] Configure SPF, DKIM, DMARC DNS records
- [ ] Set up Let's Encrypt SSL
- [ ] Update Django settings for production SMTP
- [ ] Test deliverability to Gmail, Outlook, Yahoo

---

## Resources

- **MailHog GitHub**: https://github.com/mailhog/MailHog
- **MailHog Web UI**: http://localhost:8025
- **MailHog API Docs**: https://github.com/mailhog/MailHog/blob/master/docs/APIv1.md
- **Django Email Docs**: https://docs.djangoproject.com/en/4.2/topics/email/
- **Full Email Guide**: `SELF_HOSTED_EMAIL_GUIDE.md`

---

**Questions? Issues?**  
Check the troubleshooting section or review `SELF_HOSTED_EMAIL_GUIDE.md` for more detailed information.

---

**Status**: 🟢 Ready for Phase 2 Implementation  
**Last Updated**: 2025-01-XX
