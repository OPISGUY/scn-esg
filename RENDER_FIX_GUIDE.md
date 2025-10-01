# Render User Creation & CORS Fix Guide

## Issue Summary
- ❌ Users cannot log in (401 errors)
- ❌ Registration blocked by CORS
- 🔍 Root Cause: Render database may have been reset, test users deleted

## Solution Steps

### Step 1: Check Render Environment Variables

Go to [Render Dashboard](https://dashboard.render.com) → Your Backend Service → Environment

**Verify these variables are set:**

```
DJANGO_CORS_ALLOWED_ORIGINS=https://scn-esg.vercel.app,http://localhost:5173
DJANGO_ALLOWED_HOSTS=.onrender.com,scn-esg-backend.onrender.com
DJANGO_SECRET_KEY=[your-secret-key]
DJANGO_DEBUG=False
DATABASE_URL=[automatically set by Render]
```

**If missing, add:**
```
DJANGO_CORS_ALLOWED_ORIGINS=https://scn-esg.vercel.app,http://localhost:5173
```

### Step 2: Create Test Users via Render Shell

1. Go to Render Dashboard → Your Backend Service
2. Click "Shell" tab
3. Run these commands:

```bash
# Navigate to backend directory (if needed)
cd backend

# Run the user creation script
python create_render_users.py
```

**Expected Output:**
```
✅ Created admin user: demo@scn.com / Demo1234!
✅ Created test user: test@scn.com / Test1234!
✅ Created business user: business@scn.com / Business123!
```

### Step 3: Redeploy Backend (if env vars changed)

If you updated environment variables:
1. Go to Render Dashboard → Your Backend Service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete (~2-5 minutes)

### Step 4: Test Login

Visit: https://scn-esg.vercel.app

Try logging in with:
- **Email:** `test@scn.com`
- **Password:** `Test1234!`

### Step 5: Test Registration

Try creating a new account:
1. Click "Sign Up"
2. Fill in the form
3. Submit

**If registration still fails with CORS error:**
- Double-check `DJANGO_CORS_ALLOWED_ORIGINS` includes `https://scn-esg.vercel.app`
- Redeploy the backend after adding the variable

---

## Alternative: Manual User Creation in Render Shell

If the script doesn't work, create users manually:

```python
# Open Render Shell and run:
python manage.py shell

# Then paste this:
from django.contrib.auth import get_user_model
from companies.models import Company

User = get_user_model()

# Create company
company = Company.objects.create(
    name='Test Company Ltd',
    industry='Technology',
    employees=50
)

# Create test user
user = User.objects.create_user(
    username='test@scn.com',
    email='test@scn.com',
    password='Test1234!',
    first_name='Test',
    last_name='User',
    company=company.name
)
user.is_email_verified = True
user.is_onboarding_complete = True
user.save()

print(f"✅ Created user: {user.email}")
exit()
```

---

## Troubleshooting

### CORS Error Persists
**Symptom:** "No 'Access-Control-Allow-Origin' header"

**Fix:**
1. Check Render environment variable: `DJANGO_CORS_ALLOWED_ORIGINS`
2. Must include: `https://scn-esg.vercel.app`
3. Redeploy after changing

### 401 Login Errors
**Symptom:** "Invalid credentials" or 401 responses

**Fix:**
1. Users don't exist - run user creation script
2. Or create users manually via Render shell

### Backend Not Responding
**Symptom:** Timeout or 502 errors

**Fix:**
1. Render free tier spins down after 15min inactivity
2. First request wakes it up (30-60 seconds)
3. Wait and retry

---

## Quick Check Commands

### Test Backend Health
Open browser to: https://scn-esg-backend.onrender.com/api/v1/health/

**Expected Response:**
```json
{
  "status": "healthy",
  "version": "7.0.0",
  "environment": "production"
}
```

### Test CORS from Browser Console
On https://scn-esg.vercel.app, open browser console:

```javascript
fetch('https://scn-esg-backend.onrender.com/api/v1/health/', {
  headers: { 'Origin': 'https://scn-esg.vercel.app' }
})
.then(r => r.json())
.then(console.log)
```

Should return the health check response without CORS errors.

---

## Files Created for Reference

- `backend/create_render_users.py` - Automated user creation script
- `backend/diagnose_render.py` - Diagnostic tool (requires Python locally)
- `RENDER_FIX_GUIDE.md` - This file

---

## After Fix Checklist

- [ ] Environment variables set in Render
- [ ] Backend redeployed (if env vars changed)
- [ ] Test users created via Render shell
- [ ] Health endpoint responding
- [ ] Login works with test@scn.com
- [ ] Registration works (new account creation)
- [ ] CORS errors gone

---

**Need Help?**
- Check Render deployment logs for errors
- Verify database connection in Render
- Ensure PostgreSQL service is running
