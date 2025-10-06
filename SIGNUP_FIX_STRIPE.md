# Signup Fix - Stripe Configuration Required

_Created: October 6, 2025_

## 🚨 Problem

Signup is broken because Stripe publishable key is missing:
```
Stripe publishable key not found. Set VITE_STRIPE_PUBLISHABLE_KEY in .env
Checkout error: Error: Stripe failed to initialize
```

## 🔍 Root Cause

The signup flow in `PricingSection.tsx` uses Stripe for ALL tiers (including free), but `VITE_STRIPE_PUBLISHABLE_KEY` is not set in Vercel environment variables.

## ✅ Solution

You need to add your Stripe publishable key to Vercel. Here are your options:

### Option A: Quick Fix with Test Key (Recommended for Development)

1. **Get Stripe Test Key**:
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy your **Publishable key** (starts with `pk_test_`)
   - DO NOT use the Secret key on the frontend!

2. **Add to Vercel**:
   ```bash
   # Option 1: Via Vercel CLI
   vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
   # When prompted, paste: pk_test_your_key_here
   
   # Option 2: Via Vercel Dashboard
   # Go to: https://vercel.com/your-project/settings/environment-variables
   # Add: VITE_STRIPE_PUBLISHABLE_KEY = pk_test_your_key_here
   ```

3. **Redeploy**:
   ```bash
   git add vercel.json
   git commit -m "chore: Add Stripe key placeholder to vercel.json"
   git push origin main
   ```

4. **Update the key in Vercel dashboard** with your actual Stripe key

### Option B: Remove Stripe Requirement for Free Tier (Alternative)

If you don't want to set up Stripe yet, we can modify the free tier signup to bypass Stripe entirely.

**Current flow**:
1. User clicks "Free" plan → Opens onboarding modal
2. User fills data → Calls `handleOnboardingComplete()`
3. Code checks if tier === 'free' → Creates account directly (no Stripe)
4. **BUT** Stripe still initializes on page load, causing the error

**Fix**: Move Stripe initialization to only happen when needed (paid tiers).

## 📋 Files Updated

### 1. ✅ vercel.json
Added `VITE_STRIPE_PUBLISHABLE_KEY` placeholder to environment variables:
```json
"env": {
  "VITE_STRIPE_PUBLISHABLE_KEY": ""
}
```

**Note**: The empty string is intentional - you must set the actual value in Vercel dashboard.

## 🔧 Backend Requirements

The backend also needs Stripe configuration. Check that Render has these environment variables:

```bash
# Required on Render backend
STRIPE_SECRET_KEY=sk_test_your_secret_key_here  # From Stripe dashboard
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret  # From Stripe webhooks
```

### How to Set Backend Vars:

1. Log into [Render Dashboard](https://dashboard.render.com)
2. Find `scn-esg-backend` service
3. Go to "Environment" tab
4. Add:
   - `STRIPE_SECRET_KEY` = Your secret key from https://dashboard.stripe.com/test/apikeys
   - `STRIPE_WEBHOOK_SECRET` = Your webhook secret (see STRIPE_SETUP_GUIDE.md)

## 🧪 Testing Steps

### Test Free Tier Signup (Should work without Stripe once key is added)
1. Go to https://scn-esg.vercel.app
2. Click "Get Started" on Free tier
3. Fill out onboarding form
4. Click "Proceed to Checkout"
5. Should create account and redirect to login

### Test Paid Tier Signup (Requires full Stripe setup)
1. Click "Get Started" on Starter tier ($9.99)
2. Fill out onboarding form
3. Should redirect to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
5. Should create subscription and account

## 📚 Related Documentation

- **STRIPE_SETUP_GUIDE.md** - Complete Stripe account setup
- **STRIPE_TESTING_GUIDE.md** - How to test Stripe integration
- **FRONTEND_SUBSCRIPTION_IMPLEMENTATION.md** - Subscription flow architecture

## 🚀 Quick Deploy Checklist

- [x] Updated `vercel.json` with Stripe key placeholder
- [ ] **ACTION REQUIRED**: Add `VITE_STRIPE_PUBLISHABLE_KEY` to Vercel dashboard
- [ ] **ACTION REQUIRED**: Add `STRIPE_SECRET_KEY` to Render dashboard
- [ ] Commit and push changes
- [ ] Test free tier signup
- [ ] Test paid tier signup (after full Stripe setup)

## 🔒 Security Notes

- ✅ **Publishable key** (`pk_test_` or `pk_live_`) - Safe for frontend/public use
- ⚠️ **Secret key** (`sk_test_` or `sk_live_`) - Backend ONLY, never expose
- 🔐 **Webhook secret** (`whsec_`) - Backend ONLY, for webhook verification

## 🆘 If You Don't Have Stripe Yet

Follow `STRIPE_SETUP_GUIDE.md` to create a free Stripe account (takes 20 minutes):

```bash
# Quick reference
1. Create account at https://stripe.com
2. Enable Test Mode
3. Get API keys from https://dashboard.stripe.com/test/apikeys
4. Copy pk_test_... key to Vercel
5. Copy sk_test_... key to Render
```

---

**Next Step**: Add your Stripe publishable key to Vercel dashboard, then redeploy! 🚀
