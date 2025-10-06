# OAuth Credentials Quick Setup Guide

## � For Future Activation

**Status:** Integration infrastructure is complete and ready. Use this guide when you're ready to activate integration features by configuring OAuth credentials for each platform.

## �🔑 How to Get OAuth Credentials

Use this guide to quickly set up integrations for each platform.

---

## 📊 Xero (Accounting)

### Steps:
1. Go to https://developer.xero.com/myapps
2. Click **"New app"**
3. Fill in details:
   - **App name**: SCN ESG Platform
   - **Integration type**: Web app
   - **Company or application URL**: `https://yourdomain.com` (or `http://localhost:5173` for testing)
   - **OAuth 2.0 redirect URI**: `https://yourdomain.com/integrations/callback`
4. Click **"Create app"**
5. On the app page, find:
   - **Client ID** → Copy to `.env` as `XERO_CLIENT_ID`
   - **Client Secret** → Generate and copy to `.env` as `XERO_CLIENT_SECRET`

### Required Scopes:
- `accounting.transactions.read`
- `accounting.contacts.read`
- `accounting.settings.read`

### Testing:
Use Xero Demo Company for testing without affecting real data.

---

## 💰 QuickBooks (Accounting)

### Steps:
1. Go to https://developer.intuit.com
2. Sign in and go to **"My Apps"**
3. Click **"Create an app"**
4. Choose **"QuickBooks Online API"**
5. Fill in details:
   - **App name**: SCN ESG Platform
   - **Redirect URIs**: Add `http://localhost:5173/integrations/callback` and your production URL
6. Once created, go to **"Keys & credentials"**
7. Find:
   - **Client ID** → Copy to `.env` as `QUICKBOOKS_CLIENT_ID`
   - **Client Secret** → Copy to `.env` as `QUICKBOOKS_CLIENT_SECRET`

### Required Scopes:
- `com.intuit.quickbooks.accounting`

### Testing:
Use QuickBooks Sandbox for testing.

---

## ⚡ Salesforce (CRM)

### Steps:
1. Log in to your Salesforce org
2. Go to **Setup** (gear icon)
3. Search for **"App Manager"** in Quick Find
4. Click **"New Connected App"**
5. Fill in details:
   - **Connected App Name**: SCN ESG Platform
   - **API Name**: SCN_ESG_Platform
   - **Contact Email**: your@email.com
6. Enable **"Enable OAuth Settings"**
7. Add **Callback URL**: `http://localhost:5173/integrations/callback`
8. Select OAuth Scopes:
   - `Access and manage your data (api)`
   - `Perform requests on your behalf at any time (refresh_token, offline_access)`
9. Click **"Save"**
10. Wait 2-10 minutes for changes to take effect
11. Go back to the app and find:
    - **Consumer Key** → Copy to `.env` as `SALESFORCE_CLIENT_ID`
    - **Consumer Secret** → Click to reveal, copy to `.env` as `SALESFORCE_CLIENT_SECRET`

### Testing:
Use Salesforce Developer Edition (free) for testing.

---

## 💬 Slack (Communication)

### Steps:
1. Go to https://api.slack.com/apps
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Fill in:
   - **App Name**: SCN ESG Platform
   - **Workspace**: Select your workspace
5. Click **"Create App"**
6. Go to **"OAuth & Permissions"**
7. Add **Redirect URL**: `http://localhost:5173/integrations/callback`
8. Scroll to **"Scopes"** and add Bot Token Scopes:
   - `chat:write`
   - `chat:write.public`
   - `files:write`
9. Go to **"Basic Information"**
10. Find **"App Credentials"**:
    - **Client ID** → Copy to `.env` as `SLACK_CLIENT_ID`
    - **Client Secret** → Click "Show", copy to `.env` as `SLACK_CLIENT_SECRET`
11. Click **"Install to Workspace"** to test

### Testing:
Install to a test Slack workspace first.

---

## 👥 Microsoft Teams (Communication)

### Steps:
1. Go to https://portal.azure.com
2. Navigate to **"Azure Active Directory"** → **"App registrations"**
3. Click **"New registration"**
4. Fill in:
   - **Name**: SCN ESG Platform
   - **Supported account types**: Single tenant (or multitenant if needed)
   - **Redirect URI**: Web → `http://localhost:5173/integrations/callback`
5. Click **"Register"**
6. On the app page, find:
   - **Application (client) ID** → Copy to `.env` as `TEAMS_CLIENT_ID`
   - **Directory (tenant) ID** → Copy to `.env` as `AZURE_TENANT_ID`
7. Go to **"Certificates & secrets"**
8. Click **"New client secret"**
9. Add description and expiry, click **"Add"**
10. Copy the **Value** immediately → `.env` as `TEAMS_CLIENT_SECRET` (you can't view it again!)
11. Go to **"API permissions"**
12. Add permissions:
    - Microsoft Graph → Delegated → `ChannelMessage.Send`
    - Click **"Grant admin consent"**

### Testing:
Use a test Microsoft 365 tenant.

---

## ☁️ AWS (Cloud Provider)

### Steps:
1. Go to https://console.aws.amazon.com
2. Navigate to **IAM** → **Users**
3. Click **"Add users"**
4. Username: `scn-esg-integration`
5. Access type: **Programmatic access**
6. Click **"Next: Permissions"**
7. Attach policies:
   - `ReadOnlyAccess` (or more specific permissions)
   - `AWSCloudFormationReadOnlyAccess`
8. Click through to **"Create user"**
9. Download credentials:
   - **Access key ID** → Copy to `.env` as `AWS_ACCESS_KEY_ID`
   - **Secret access key** → Copy to `.env` as `AWS_SECRET_ACCESS_KEY`

### Required Permissions:
- EC2 read access
- CloudWatch read access
- Cost Explorer API access

---

## 🌐 Azure (Cloud Provider)

### Steps:
1. Follow same steps as Teams above (can use same app registration)
2. Add additional API permissions:
   - Azure Service Management → Delegated → `user_impersonation`
3. Ensure your Azure subscription is linked to the same tenant

---

## 🔵 Google Cloud (Cloud Provider)

### Steps:
1. Go to https://console.cloud.google.com
2. Select or create a project
3. Go to **"APIs & Services"** → **"Credentials"**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. Configure consent screen if prompted
6. Application type: **Web application**
7. Name: SCN ESG Platform
8. Authorized redirect URIs: `http://localhost:5173/integrations/callback`
9. Click **"Create"**
10. Copy:
    - **Client ID** → `.env` as `GOOGLE_CLOUD_CLIENT_ID`
    - **Client Secret** → `.env` as `GOOGLE_CLOUD_CLIENT_SECRET`
11. Enable required APIs:
    - Cloud Resource Manager API
    - Compute Engine API
    - Cloud Billing API

---

## ✅ Verification Checklist

After adding credentials to `.env`, verify:

```bash
# Check .env file has all keys
cat backend/.env | grep -E "(XERO|QUICKBOOKS|SALESFORCE|SLACK|AWS|AZURE|GOOGLE)"

# Restart Django server to pick up new environment variables
python manage.py runserver
```

### Test each integration:
1. Visit http://localhost:5173/integrations
2. Click "Connect" on a platform
3. Should redirect to OAuth authorization page
4. Approve access
5. Should redirect back with success message
6. Connection should show as "Active"

---

## 🔒 Security Best Practices

1. **Never commit `.env` to git** - Already in `.gitignore`
2. **Use different credentials for dev/production**
3. **Rotate secrets regularly** (quarterly recommended)
4. **Use minimum required scopes** for OAuth apps
5. **Monitor integration logs** for suspicious activity
6. **Revoke unused integrations** in provider admin panels

---

## 🆘 Troubleshooting

### "Invalid redirect URI"
- Ensure redirect URI in provider settings matches exactly
- Check for http vs https
- Check for trailing slashes

### "Invalid client credentials"
- Verify Client ID and Secret are correct
- Check for extra spaces when copying
- Ensure environment variables are loaded (restart server)

### "Insufficient permissions"
- Check OAuth scopes granted
- Admin consent may be required (Teams/Azure)
- User may need specific role in external platform

### "Token expired"
- Token refresh should happen automatically
- Check Celery tasks are running for token refresh
- May need to reconnect if refresh token expired

---

## 📞 Support Resources

- **Xero**: https://developer.xero.com/documentation/
- **QuickBooks**: https://developer.intuit.com/app/developer/qbo/docs/get-started
- **Salesforce**: https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/
- **Slack**: https://api.slack.com/docs
- **AWS**: https://docs.aws.amazon.com/
- **Azure**: https://docs.microsoft.com/en-us/azure/
- **Google Cloud**: https://cloud.google.com/docs

---

**Last Updated**: October 2025  
**Need Help?** Check `INTEGRATIONS_GUIDE.md` for detailed technical documentation
