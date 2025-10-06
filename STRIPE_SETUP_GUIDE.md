# Stripe Account Setup Guide for SCN ESG Platform

_Created: 5 October 2025_  
_Updated: 5 October 2025_  
_Status: Ready to Execute_  
_Estimated Time: 20-30 minutes_

---

## 🎯 What You'll Set Up

1. Stripe account (Test Mode - completely free)
2. **4 subscription products** (Free, Starter, Professional, Enterprise)
3. Webhook endpoint configuration
4. API keys for development

**Cost to set up: £0**  
**Cost until first paying customer: £0**  
**Per-transaction fee: 1.5% + 20p (only when customers pay you)**

---

## Task A1.1: Create Stripe Account

### Step-by-Step Instructions

#### 1. Create Stripe Account

**Action Required**: Visit https://stripe.com and create an account

**Information Needed**:
- Business name: **SCN ESG Platform**
- Business type: **SaaS / Software**
- Country: **United Kingdom**
- Business email: _(use your business email)_
- Phone number: _(for verification)_

**After Registration**:
1. Complete email verification
2. Complete phone verification
3. You'll land on the Stripe Dashboard

---

#### 2. Enable Test Mode

**Location**: Top right corner of Stripe Dashboard

**Action**: 
- Toggle the switch to **"Test mode"**
- You should see "Viewing test data" indicator
- All development work will use test mode

---

#### 3. Obtain API Keys

**Location**: Developers → API Keys (https://dashboard.stripe.com/test/apikeys)

**Keys to Copy**:

```bash
# Publishable Key (starts with pk_test_)
# This is safe to use in frontend code
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Secret Key (starts with sk_test_)
# This must ONLY be used in backend - NEVER commit to git!
STRIPE_SECRET_KEY=sk_test_...
```

**⚠️ SECURITY WARNING**: 
- Never commit secret keys to git
- Store in environment variables only
- Use different keys for test and live modes

---

#### 4. Enable Billing Product

**Location**: Home → Enable more features

**Action**:
1. Find "Billing" in the products list
2. Click "Enable"
3. This unlocks subscription management features

Or go directly to: Billing → Subscriptions

---

#### 5. Document Credentials

**Create a secure note** with the following information:

```
=== SCN ESG Platform - Stripe Credentials ===
Created: [Today's Date]

Account Email: [your email]
Account ID: acct_[your account id]
Country: United Kingdom

TEST MODE KEYS:
Publishable Key: pk_test_[copy from dashboard]
Secret Key: sk_test_[copy from dashboard]

LIVE MODE KEYS (will add later in Phase A3.10):
Publishable Key: pk_live_[not yet]
Secret Key: sk_live_[not yet]

Dashboard URL: https://dashboard.stripe.com
Test Dashboard: https://dashboard.stripe.com/test
```

**Where to Store**:
- Use a password manager (1Password, LastPass, Bitwarden)
- Or store in a secure local file (NOT in git repo)
- Share with team via secure channel only

---

### Verification Checklist

Complete the following to verify Task A1.1 is done:

- [ ] Stripe account created successfully
- [ ] Email verified
- [ ] Phone verified
- [ ] Can access Stripe Dashboard
- [ ] Test mode is enabled and active
- [ ] Publishable Key obtained and documented
- [ ] Secret Key obtained and documented
- [ ] Keys are stored securely (NOT in git)
- [ ] Billing product is enabled
- [ ] Can see Billing → Subscriptions in dashboard

---

### Next Steps

Once all verification items are checked:
1. Update `IMPLEMENTATION_TRACKER.md`:
   - Mark Task A1.1 as completed
   - Add completion date
   - Update progress percentage
2. Proceed to Task A1.2: Configure Stripe Products

---

### Troubleshooting

**Problem**: Can't verify phone number
- **Solution**: Try a different phone number or contact Stripe support

**Problem**: Dashboard looks different
- **Solution**: Stripe updates their UI frequently, look for similar menu items

**Problem**: Can't find API keys
- **Solution**: Go to Developers → API Keys, or use search bar in dashboard

**Problem**: Billing product not showing
- **Solution**: Refresh page, or go to Home and look for "Enable more features"

---

### Useful Stripe Resources

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Subscription Billing Guide](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe CLI Download](https://stripe.com/docs/stripe-cli)

---

## Ready to Proceed?

Once you've completed all steps above and checked all verification items, you're ready to move on to configuring the subscription products in the Stripe Dashboard!

**Estimated time for this task**: 30 minutes  
**Actual time taken**: _(update when complete)_
