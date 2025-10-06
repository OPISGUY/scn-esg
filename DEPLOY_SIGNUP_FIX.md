# Quick Deploy - Signup Fix Checklist

_Created: October 6, 2025_

## ✅ Changes Made (Ready to Commit)

### 1. Frontend Changes
- **vercel.json** - Added `VITE_STRIPE_PUBLISHABLE_KEY` placeholder
  
### 2. Backend Changes  
- **backend/settings_render.py** - Added Stripe configuration variables
- **backend/settings_render.py** - Added demo user seeding controls

### 3. Documentation
- **SIGNUP_FIX_STRIPE.md** - Complete troubleshooting guide
- **LOGIN_SIGNUP_FIX.md** - Login CORS fix documentation

## 🚀 Deployment Steps

### Step 1: Commit Changes
```powershell
git add vercel.json backend/settings_render.py SIGNUP_FIX_STRIPE.md LOGIN_SIGNUP_FIX.md
git commit -m "fix: Add Stripe configuration for signup flow and update CORS settings"
git push origin main
```

### Step 2: Configure Stripe Keys in Vercel

**Option A: Via Vercel Dashboard (Easiest)**
1. Go to https://vercel.com/your-project/settings/environment-variables
2. Add new variable:
   - **Name**: `VITE_STRIPE_PUBLISHABLE_KEY`
   - **Value**: Get from https://dashboard.stripe.com/test/apikeys (starts with `pk_test_`)
   - **Environment**: Production, Preview, Development (check all three)
3. Click "Save"

**Option B: Via Vercel CLI**
```powershell
vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
# Paste your pk_test_... key when prompted

vercel env add VITE_STRIPE_PUBLISHABLE_KEY preview
# Paste same key

vercel env add VITE_STRIPE_PUBLISHABLE_KEY development
# Paste same key
```

### Step 3: Configure Stripe Keys in Render

1. Go to https://dashboard.render.com
2. Select your `scn-esg-backend` service
3. Go to "Environment" tab
4. Add these variables:
   - **STRIPE_SECRET_KEY** = Your secret key from Stripe (starts with `sk_test_`)
   - **STRIPE_PUBLISHABLE_KEY** = Same publishable key as Vercel (starts with `pk_test_`)
   - **STRIPE_WEBHOOK_SECRET** = Leave empty for now (set up webhooks later)
5. Click "Save Changes"

### Step 4: Trigger Redeployment

**Vercel** (Frontend):
```powershell
# Either push a new commit or trigger manual redeploy
vercel --prod
```

**Render** (Backend):
- Render will auto-redeploy when you save environment variables
- Or click "Manual Deploy" → "Deploy latest commit"

### Step 5: Test Signup

1. Go to https://scn-esg.vercel.app
2. Click "Get Started" on any pricing tier
3. Fill out onboarding form
4. Click "Proceed to Checkout"
5. **Free tier**: Should create account and redirect to login
6. **Paid tier**: Should redirect to Stripe checkout

## 🧪 Testing Checklist

- [ ] No Stripe initialization errors in browser console
- [ ] Free tier signup creates account successfully
- [ ] Paid tier signup redirects to Stripe Checkout
- [ ] Test card (`4242 4242 4242 4242`) completes payment
- [ ] After payment, user is redirected back with success
- [ ] User can log in with new account

## 🔒 Getting Your Stripe Keys

If you don't have Stripe keys yet:

### 1. Create Stripe Account (5 minutes)
```
1. Go to https://stripe.com
2. Sign up with your email
3. Complete email verification
4. Select "Skip for now" on business details (you can update later)
```

### 2. Get Test Keys (2 minutes)
```
1. Toggle "Test mode" in top right corner
2. Go to Developers → API Keys
3. Copy both keys:
   - Publishable key: pk_test_...
   - Secret key: sk_test_...
```

### 3. Add to Platforms (3 minutes)
```
- Vercel: VITE_STRIPE_PUBLISHABLE_KEY = pk_test_...
- Render: STRIPE_SECRET_KEY = sk_test_...
```

## 🆘 Troubleshooting

### Error: "Stripe failed to initialize"
**Cause**: `VITE_STRIPE_PUBLISHABLE_KEY` not set or empty  
**Fix**: Add the key to Vercel environment variables and redeploy

### Error: "Failed to create checkout session"
**Cause**: Backend missing `STRIPE_SECRET_KEY`  
**Fix**: Add the key to Render environment variables

### Error: CORS still blocking requests
**Cause**: Backend not redeployed with CORS fix  
**Fix**: Trigger manual deploy in Render dashboard

### Signup works but can't log in
**Cause**: User created but email not verified  
**Fix**: Check backend logs, ensure email service is configured

## 📚 Related Guides

- **STRIPE_SETUP_GUIDE.md** - Complete Stripe setup (20 minutes)
- **STRIPE_TESTING_GUIDE.md** - Test card numbers and scenarios
- **SIGNUP_FIX_STRIPE.md** - Detailed technical explanation
- **DEPLOYMENT_GUIDE.md** - Full deployment procedures

## ⏱️ Estimated Time

- **If you have Stripe keys**: 5 minutes
- **If you need to create Stripe account**: 15 minutes
- **Full first-time setup**: 30 minutes

---

**Ready to deploy?** Start with Step 1 above! 🚀
