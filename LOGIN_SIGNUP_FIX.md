# Login/Signup Fix Guide

_Created: October 6, 2025_

## Problem Summary

Login and signup were broken due to:
1. **Render backend returning 503** - Service sleeping or down
2. **CORS misconfiguration** - `https://scn-esg.vercel.app` not in allowed origins

## Fixes Applied

### 1. ✅ CORS Configuration Fixed
Updated `backend/settings_render.py` to include proper CORS defaults:
```python
CORS_ALLOWED_ORIGINS = [
    origin.strip() 
    for origin in os.getenv('CORS_ALLOWED_ORIGINS', 'https://scn-esg.vercel.app,https://scn-esg-git-main.vercel.app').split(',') 
    if origin.strip()
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://scn-esg.*\.vercel\.app$",
]
```

### 2. ⚠️ Backend Service Status (Action Required)

The Render backend at `https://scn-esg-backend.onrender.com` is returning 503. You need to:

#### Option A: Wake Up Render Service
1. Log into [Render Dashboard](https://dashboard.render.com)
2. Find your `scn-esg-backend` service
3. Check if it's suspended or sleeping
4. Click "Resume" or trigger a manual deploy
5. Verify the service is running

#### Option B: Redeploy to Render
```powershell
# From repository root
.\deploy_render.ps1
```

#### Option C: Check Environment Variables
Ensure these are set in Render dashboard:
- `DJANGO_SECRET_KEY` - Your secret key (50+ characters)
- `DJANGO_DEBUG` - Set to `False`
- `CORS_ALLOWED_ORIGINS` - Can be empty now (defaults applied)
- `DJANGO_SETTINGS_MODULE` - Set to `settings_render`
- `GOOGLE_AI_API_KEY` - Your Gemini API key
- `DATABASE_URL` - Should be auto-set by Render PostgreSQL

### 3. ✅ Documentation Updated
- Removed Railway references from `AGENTS.md`
- Updated copilot instructions to reflect Render-only deployment

## Testing the Fix

### 1. Check Backend Health
```powershell
# Test if backend is responding
curl https://scn-esg-backend.onrender.com/api/v1/users/auth/health/
```

Expected response: `200 OK` with health status

### 2. Test Login from Frontend
1. Go to https://scn-esg.vercel.app/login
2. Open browser DevTools (F12) → Console
3. Try logging in with demo credentials:
   - Email: `demo@scn.com`
   - Password: `Demo1234!`
4. Check for CORS errors - should be gone

### 3. Verify CORS Headers
```powershell
curl -H "Origin: https://scn-esg.vercel.app" `
  -H "Access-Control-Request-Method: POST" `
  -H "Access-Control-Request-Headers: Content-Type,Authorization" `
  -X OPTIONS `
  https://scn-esg-backend.onrender.com/api/v1/users/auth/login/
```

Expected: Should include `Access-Control-Allow-Origin: https://scn-esg.vercel.app`

## Next Steps

1. **Wake up or redeploy Render backend** (see Option A or B above)
2. **Commit and deploy the CORS fix**:
   ```powershell
   git add backend/settings_render.py AGENTS.md .github/copilot-instructions.md
   git commit -m "fix: Update CORS configuration and remove Railway references"
   git push origin main
   ```
3. **Trigger Render redeploy** through dashboard or webhook
4. **Test login/signup** once backend is live

## Monitoring

After fix is deployed:
- Monitor Render logs for any startup errors
- Check Vercel Analytics for successful authentication events
- Verify no CORS errors in browser console

## Rollback Plan

If issues persist:
1. Check Render service logs in dashboard
2. Verify environment variables are set correctly
3. Test backend directly (not through frontend)
4. Review `backend/test_full_deployment.py` results

---

**Status**: CORS fix ready to deploy. Backend service needs to be woken up/redeployed.
