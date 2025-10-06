# 🚀 Stripe Payment Testing Guide

**Date**: October 5, 2025  
**Status**: ✅ Keys Configured - Ready to Test!

---

## ✅ Configuration Complete

Your Stripe keys have been successfully added to both `.env` files:

### Frontend (`.env`):
- ✅ `VITE_STRIPE_PUBLISHABLE_KEY` configured
- ✅ `VITE_API_URL` pointing to backend

### Backend (`backend/.env`):
- ✅ `STRIPE_SECRET_KEY` configured
- ✅ `STRIPE_PUBLISHABLE_KEY` configured
- ✅ `FRONTEND_URL` set to `http://localhost:5173`
- ⚠️ `STRIPE_WEBHOOK_SECRET` - Will be added after CLI setup

---

## 🧪 Testing Steps

### Step 1: Start Both Servers

#### Terminal 1 - Backend:
```powershell
cd backend
& "C:/Users/mexmc/Documents/scn esg/scn-esg/.venv/Scripts/Activate.ps1"
python manage.py runserver
```

**Expected output:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

#### Terminal 2 - Frontend:
```powershell
cd "C:\Users\mexmc\Documents\scn esg\scn-esg"
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### Step 2: Test Without Webhooks (Basic Flow)

1. **Open browser**: http://localhost:5173
2. **Scroll to Pricing Section** (or click "Pricing" in nav)
3. **You should see 4 tiers**: FREE, Starter, Professional, Enterprise

#### Test Case 1: FREE Tier
- Click "Get Started Free" on FREE tier
- Should redirect to `/signup`
- ✅ No payment required

#### Test Case 2: Starter Tier (£9.99)
- Click "Start Free Trial" on Starter tier
- **Expected**: Loading spinner appears
- **Then**: Redirects to Stripe Checkout page
- **Stripe Checkout should show**:
  - Amount: £9.99 (or converted if different currency selected)
  - Free trial: 14 days
  - SCN ESG Platform branding

#### Test with Stripe Test Cards:
Enter these details on Stripe Checkout:

**Success Card**:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/25`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Result**: Should redirect to `/checkout/success?session_id=cs_test_...`

**Declined Card** (optional test):
- Card: `4000 0000 0000 0002`
- **Result**: Payment declined, user stays on Stripe Checkout

---

### Step 3: Setup Webhook Forwarding (For Full Flow)

#### Terminal 3 - Stripe CLI:
```powershell
stripe listen --forward-to http://localhost:8000/api/v1/webhooks/stripe/
```

**Expected output:**
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

**Copy the `whsec_...` secret** and add it to `backend/.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

**Restart backend server** (Terminal 1) after adding the secret.

---

### Step 4: Test Complete Flow with Webhooks

Now repeat the Starter tier test:

1. Click "Start Free Trial"
2. Fill test card: `4242 4242 4242 4242`
3. Complete payment
4. **Watch Terminal 3** - You should see webhook events:
   ```
   --> checkout.session.completed
   --> customer.subscription.created
   --> invoice.payment_succeeded
   ```

5. **Check backend terminal** - Should log:
   ```
   Provisioning account for: test@example.com
   Creating subscription for tier: Starter
   ```

6. **Check database**:
   ```powershell
   cd backend
   python manage.py shell
   ```
   ```python
   from subscriptions.models import Subscription
   Subscription.objects.all()
   # Should show your new subscription
   ```

---

## 🎯 Test Checklist

### Basic Tests (No Webhooks Required):
- [ ] Landing page loads with 4 pricing tiers
- [ ] FREE tier button redirects to `/signup`
- [ ] Starter tier button opens Stripe Checkout
- [ ] Professional tier button opens Stripe Checkout
- [ ] Enterprise tier button opens email client
- [ ] Currency selector changes displayed prices
- [ ] Test card `4242...` completes payment
- [ ] Success page displays after payment
- [ ] Cancel button shows cancelled page

### Webhook Tests (Requires Stripe CLI):
- [ ] Stripe CLI forwarding webhooks to backend
- [ ] `checkout.session.completed` event received
- [ ] Subscription created in database
- [ ] User account provisioned
- [ ] Transaction logged
- [ ] Welcome email sent (check console output)

---

## 🐛 Troubleshooting

### Issue: "Stripe failed to initialize"
**Solution**: 
- Check `.env` file has `VITE_STRIPE_PUBLISHABLE_KEY`
- Restart frontend server: `Ctrl+C` then `npm run dev`
- Clear browser cache

### Issue: "Failed to create checkout session"
**Solutions**:
- Check backend is running on port 8000
- Check `backend/.env` has `STRIPE_SECRET_KEY`
- Verify API URL in frontend `.env`: `VITE_API_URL=http://localhost:8000/api/v1`
- Check backend logs for errors

### Issue: "Webhook not received"
**Solutions**:
- Ensure Stripe CLI is running: `stripe listen...`
- Copy webhook secret to `backend/.env`
- Restart backend server after adding secret
- Check firewall isn't blocking localhost:8000

### Issue: "CORS error" in browser console
**Solution**:
- Check `backend/.env` has:
  ```
  DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
  ```
- Restart backend server

### Issue: Currency conversion not working
**Check**:
- `CurrencySelector` component should be visible above pricing cards
- Prices should update when clicking GBP/USD/EUR
- Backend has correct conversion rates

---

## 📊 Expected API Responses

### Create Checkout Session:
**Request**:
```http
POST http://localhost:8000/api/v1/subscriptions/create_checkout_session/
Content-Type: application/json

{
  "tier_id": "starter",
  "currency": "gbp",
  "billing_cycle": "monthly",
  "success_url": "http://localhost:5173/checkout/success?session_id={CHECKOUT_SESSION_ID}",
  "cancel_url": "http://localhost:5173/checkout/cancelled"
}
```

**Response (Success)**:
```json
{
  "session_id": "cs_test_a1b2c3d4e5f6g7h8i9j0",
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Response (Error)**:
```json
{
  "error": "Invalid tier_id"
}
```

---

## 🎨 Visual Testing

### Landing Page - Pricing Section:
```
┌─────────────────────────────────────────────────────────────┐
│                    Choose Your Plan                         │
│         Start with a 14-day free trial. No credit card.     │
│                                                              │
│  ┌──────┐  ┌──────┐  ┌──────────┐  ┌──────┐               │
│  │ FREE │  │START │  │PROF ⭐  │  │ ENT  │               │
│  │ £0   │  │£9.99 │  │ £19.99   │  │ £30  │               │
│  │      │  │      │  │          │  │/user │               │
│  └──────┘  └──────┘  └──────────┘  └──────┘               │
└─────────────────────────────────────────────────────────────┘
```

### Checkout Flow:
```
Landing Page
    ↓
[Click "Start Free Trial"]
    ↓
Stripe Checkout
    ↓
[Enter Card: 4242 4242 4242 4242]
    ↓
Success Page
    ↓
[Click "Go to Dashboard"]
    ↓
Login Page
```

---

## 🔍 What to Watch For

### Browser Console (F12):
- Should see: `"Stripe.js loaded successfully"`
- No CORS errors
- No 404 errors for API calls

### Backend Terminal:
- `POST /api/v1/subscriptions/create_checkout_session/` → 200 OK
- `POST /api/v1/webhooks/stripe/` → 200 OK (after webhook setup)
- No 500 errors

### Stripe CLI Terminal:
- Should show each webhook event
- All should return `200 OK`
- Look for `checkout.session.completed`

---

## 💰 Test Card Library

### Basic Cards:
| Purpose | Number | Result |
|---------|--------|--------|
| Success | 4242 4242 4242 4242 | ✅ Payment succeeds |
| Decline | 4000 0000 0000 0002 | ❌ Card declined |
| Insufficient Funds | 4000 0000 0000 9995 | ❌ Insufficient funds |

### 3D Secure (Authentication Required):
| Number | Result |
|--------|--------|
| 4000 0025 0000 3155 | ✅ Authentication succeeds |
| 4000 0000 0000 9235 | ❌ Authentication fails |

### More test cards: https://stripe.com/docs/testing

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ All 4 pricing tiers display correctly
2. ✅ Currency selector changes prices
3. ✅ Clicking tier button loads Stripe Checkout
4. ✅ Test payment succeeds and shows success page
5. ✅ Webhook events appear in Stripe CLI
6. ✅ Subscription created in Django database
7. ✅ No errors in any terminal

---

## 📝 Next Steps After Testing

Once basic flow works:

1. **Test all tiers**: FREE, Starter, Professional
2. **Test currency conversion**: GBP → USD → EUR
3. **Test cancellation**: User cancels on Stripe page
4. **Test webhooks**: Verify subscription status updates
5. **Create test user account**: Complete signup flow
6. **Test login**: Use new account credentials
7. **View subscription in dashboard** (once SubscriptionManagement component is built)

---

## 🆘 Get Help

If you encounter issues:

1. **Check this guide** - Most issues have solutions above
2. **Review logs** - Backend terminal shows detailed errors
3. **Browser DevTools** - Check Network tab for API calls
4. **Stripe Dashboard** - View test payments at https://dashboard.stripe.com/test/payments

---

**Ready to test!** 🚀

Start with Step 1 (boot both servers) and work through the checklist.
