# ✅ Railway + Vercel Deployment Checklist

## 🎯 Current Issue
Railway is serving the default Railway page instead of your Django application. This means the Django app failed to start.

## 🔧 Step-by-Step Fix

### 1. Railway Environment Variables (CRITICAL ⚠️)

Go to your Railway project dashboard → Variables tab and add:

```
DJANGO_SECRET_KEY=v51$*ey59l%1=8+o1flwwd#6b7k%rv_nl7@0k4(^)9_sg#2ep#
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=scn-esg-backend.railway.app,*.railway.app
DJANGO_CORS_ALLOWED_ORIGINS=https://scn-esg-platform.vercel.app
```

**Note**: Replace `scn-esg-platform.vercel.app` with your actual Vercel app URL.

### 2. Vercel Environment Variables (COMPLETED ✅)

Already fixed in `vercel.json`:
- ✅ VITE_API_URL=https://scn-esg-backend.railway.app
- ✅ VITE_APP_NAME=SCN ESG Platform  
- ✅ VITE_ENVIRONMENT=production

### 3. Redeploy Both Services

After setting Railway environment variables:
1. **Railway**: Should auto-redeploy when env vars are saved
2. **Vercel**: Push your code changes to trigger redeploy

### 4. Test the Connection

Run this command to test:
```bash
python test_full_deployment.py
```

## 🔍 What to Expect After Fix

✅ Railway should serve Django (not the Railway default page)  
✅ `/api/v1/health/` should return JSON health status  
✅ `/api/v1/users/auth/login/` should accept POST requests  
✅ CORS should allow your Vercel domain  
✅ Login should work from your frontend  

## 🚨 Common Issues After Environment Variable Setup

### If Django still won't start:
1. Check Railway build logs
2. Verify DATABASE_URL is set automatically by Railway
3. Ensure all requirements are in requirements.txt

### If login still fails:
1. Create test users: `python manage.py createsuperuser`
2. Check JWT token settings
3. Verify user model compatibility

### If CORS still blocks:
1. Double-check your Vercel URL in DJANGO_CORS_ALLOWED_ORIGINS
2. Ensure no typos in the URL (https:// prefix required)

## 📱 Frontend Connection Test

After Railway fixes, test from browser console on your Vercel app:

```javascript
fetch('https://scn-esg-backend.railway.app/api/v1/health/')
  .then(r => r.json())
  .then(console.log)
```

Should return: `{"status": "healthy", "version": "7.0.0", "environment": "production"}`

## 🎉 Success Indicators

- ✅ Railway URL shows Django content (not Railway ASCII art)
- ✅ Health endpoint returns JSON
- ✅ Login from Vercel frontend works
- ✅ No CORS errors in browser console

---

**Need Help?** Run `python test_full_deployment.py` for detailed diagnostics.
