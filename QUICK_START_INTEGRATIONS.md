# 🚀 External Platform Integrations - Quick Start Card

## 🚧 Current Status: COMING SOON
- ✅ **13/13 files created**
- ✅ **Encryption key configured**
- ✅ **UI updated to show "Coming Soon"**
- ⚠️ **OAuth credentials needed before activation**

**Production Status:** Integration features are displayed as "Coming Soon" until OAuth credentials are configured.

---

## 📋 3-Minute Quick Start

### Option A: Test with Slack (Fastest - 5 min)
```bash
# 1. Get Slack credentials (5 minutes)
# Go to: https://api.slack.com/apps
# Create app → OAuth & Permissions → Copy Client ID & Secret

# 2. Add to backend/.env
SLACK_CLIENT_ID=your_client_id
SLACK_CLIENT_SECRET=your_client_secret

# 3. Run migrations
cd backend
python manage.py makemigrations integrations
python manage.py migrate
python manage.py seed_integration_providers

# 4. Start servers
python manage.py runserver  # Terminal 1
npm run dev                 # Terminal 2 (project root)

# 5. Test
# Visit: http://localhost:5173/integrations
# Click "Connect" on Slack → Authorize → Done! 🎉
```

### Option B: Full Setup (All Platforms)
```bash
# 1. Follow OAUTH_SETUP_GUIDE.md for each platform
# 2. Add all credentials to backend/.env
# 3. Run migrations (same as above)
# 4. Test each integration
```

---

## 🔗 Essential Links

| What | Where |
|------|-------|
| **Current Status** | `INTEGRATION_SETUP_STATUS.md` |
| **OAuth Setup** | `OAUTH_SETUP_GUIDE.md` |
| **Technical Docs** | `INTEGRATIONS_GUIDE.md` |
| **Quick Check** | Run: `python check_integration_setup.py` |

---

## 🎯 Get Credentials

| Platform | URL | Time |
|----------|-----|------|
| Slack | https://api.slack.com/apps | ~5 min |
| Xero | https://developer.xero.com/myapps | ~10 min |
| QuickBooks | https://developer.intuit.com | ~10 min |
| Salesforce | Setup → App Manager | ~15 min |

---

## 🔑 .env Template

```bash
# Already set ✅
INTEGRATION_ENCRYPTION_KEY=2_em8xf1vp_3e3rWG53dA3Oc0t3L_yrSoYVEVG1vw64=

# Add these (get from provider portals):
XERO_CLIENT_ID=
XERO_CLIENT_SECRET=

QUICKBOOKS_CLIENT_ID=
QUICKBOOKS_CLIENT_SECRET=

SALESFORCE_CLIENT_ID=
SALESFORCE_CLIENT_SECRET=

SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
```

---

## ✨ What You Get

- ✅ **8+ platform integrations** (Xero, QuickBooks, AWS, Salesforce, Slack, etc.)
- ✅ **OAuth 2.0 security** (industry standard)
- ✅ **Auto-sync** (every 60 min, configurable)
- ✅ **Data transformation** (financial → emissions)
- ✅ **Real-time webhooks** (for supported platforms)
- ✅ **Encrypted credentials** (bank-level security)
- ✅ **User-friendly UI** (connection management)

---

## 🎬 Demo Flow

```
User clicks "Connect Xero" 
  → Redirects to Xero OAuth page
  → User approves access
  → Redirects back to app
  → Connection shows "Active" 🟢
  → Auto-sync starts
  → Financial transactions → Carbon emissions
  → Data appears in dashboard
```

---

## 🐛 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| "Invalid redirect URI" | Set to: `http://localhost:5173/integrations/callback` |
| Credentials not working | Restart Django server after editing .env |
| No providers showing | Run: `python manage.py seed_integration_providers` |
| Can't connect | Check browser console for errors |

---

## 📞 Help

- **Setup issues**: See `OAUTH_SETUP_GUIDE.md`
- **Technical issues**: See `INTEGRATIONS_GUIDE.md`
- **Current status**: Run `python check_integration_setup.py`

---

**Ready to test?** Pick Slack (easiest) and follow Option A above! 🚀
