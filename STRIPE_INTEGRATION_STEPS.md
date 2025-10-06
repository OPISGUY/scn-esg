# Stripe Integration Implementation Steps

_Created: 5 October 2025_  
_Status: Ready to Execute_

---

## 🎯 Overview

You mentioned Stripe is in sandbox mode (Test Mode) - Perfect! We'll integrate:
1. Stripe Python SDK (backend)
2. Stripe.js (frontend)
3. Stripe CLI (local webhook testing)

---

## Step 1: Install Stripe CLI (Windows)

### Option A: Using Scoop (Recommended)
```powershell
# If you don't have Scoop, install it first:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Then install Stripe CLI:
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

### Option B: Using Chocolatey
```powershell
choco install stripe-cli
```

### Option C: Direct Download
1. Download from: https://github.com/stripe/stripe-cli/releases/latest
2. Extract `stripe.exe` to a folder (e.g., `C:\stripe\`)
3. Add folder to PATH

### Verify Installation
```powershell
stripe --version
```

---

## Step 2: Login to Stripe CLI

```powershell
stripe login
```

This will:
1. Open browser for authentication
2. Connect CLI to your Stripe account
3. Store credentials locally

---

## Step 3: Install Stripe Python SDK (Backend)

I'll run this now:

```powershell
cd backend
pip install stripe
```

---

## Step 4: Configure FREE Tier in Your Plan

Before I implement, I need to know the FREE tier features. Based on your decision to add a free tier, here's what I'll implement:

### Proposed FREE Tier Features:
- ✅ Basic carbon tracking (20 data points/month)
- ✅ E-waste tracking (50 items)
- ✅ Basic ESG dashboard
- ✅ Monthly report (PDF, 1 per month)
- ❌ NO AI features
- ❌ NO CSRD compliance tools
- ❌ NO carbon credit marketplace
- ❌ Email support only (community forum)

**Limits:**
- 1 user
- 25 MB storage
- 6 months data retention

**Does this match what you want for FREE tier?**

---

## Step 5: Implementation Plan

Once you confirm the FREE tier features, I'll implement:

### Backend (Django):
1. ✅ Create `backend/payments/` Django app
2. ✅ Install Stripe SDK
3. ✅ Create models: SubscriptionTier, Subscription, Transaction
4. ✅ Create Stripe service layer
5. ✅ Create API endpoints:
   - `GET /api/v1/subscriptions/tiers/` - List tiers (including FREE)
   - `POST /api/v1/subscriptions/create-checkout-session/` - Start payment
   - `POST /api/v1/webhooks/stripe/` - Handle webhooks
   - `GET /api/v1/subscriptions/current/` - Get user's subscription
6. ✅ Create webhook handlers
7. ✅ Create user provisioning logic

### Frontend (React):
1. ✅ Install Stripe.js
2. ✅ Update PricingSection to show 4 tiers (FREE + 3 paid)
3. ✅ Create checkout flow components
4. ✅ Connect "Start Free Trial" buttons to Stripe
5. ✅ Create subscription management UI

---

## Step 6: What I Need From You

Please provide these from your Stripe dashboard:

### A. API Keys
- Test Publishable Key: `pk_test_...`
- Test Secret Key: `sk_test_...`

### B. Product/Price IDs
After you create 4 products in Stripe dashboard:
- FREE tier Price ID: `price_...`
- Starter tier Price ID: `price_...`
- Professional tier Price ID: `price_...`
- Enterprise tier Price ID: `price_...`

### C. Webhook Secret
- Signing Secret: `whsec_...`

---

## Step 7: Testing Webhooks Locally

Once implemented, we'll test with Stripe CLI:

```powershell
# Forward webhooks to local Django server
stripe listen --forward-to http://localhost:8000/api/v1/webhooks/stripe/

# In another terminal, trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

---

## Next Actions

**Please do the following:**

1. **Install Stripe CLI** (choose one method above)
2. **Login to Stripe CLI**: `stripe login`
3. **Share your Price IDs** with me (just the IDs, not secret keys)
4. **Confirm FREE tier features** (or tell me what you want)

Then tell me: **"Ready to implement"** and I'll start building the full integration!

---

## Questions?

- **Q: Do I need to create products in Stripe first?**
  - A: Yes, follow `STRIPE_SETUP_GUIDE.md` to create 4 products

- **Q: Can I test without real cards?**
  - A: Yes! Use test card: `4242 4242 4242 4242`

- **Q: Will this work with my sandbox account?**
  - A: Perfect! That's exactly what we want (Test Mode)

Let me know when you're ready! 🚀
