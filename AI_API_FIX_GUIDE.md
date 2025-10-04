# AI API 404 Error Fix Guide

**Issue**: AI conversational features returning 404 errors on production.

**Root Cause**: The frontend `VITE_API_URL` environment variable was missing the `/api/v1` path prefix required by Django.

## What Was Broken

Frontend was calling:
```
https://scn-esg-backend.onrender.com/carbon/ai/extract-from-conversation/
```

But Django expects:
```
https://scn-esg-backend.onrender.com/api/v1/carbon/ai/extract-from-conversation/
```

## Files Fixed

1. **`.env.production`** - Updated `VITE_API_URL` to include `/api/v1`
2. **`.env`** (new) - Created for local development with correct URL

## How to Deploy the Fix

### Step 1: Update Vercel Environment Variable

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project: `scn-esg`
3. Go to **Settings** → **Environment Variables**
4. Find `VITE_API_URL`
5. Update value from:
   ```
   https://scn-esg-backend.onrender.com
   ```
   to:
   ```
   https://scn-esg-backend.onrender.com/api/v1
   ```
6. Select all environments: Production, Preview, Development
7. Click **Save**

### Step 2: Redeploy Frontend

Option A: **Trigger via Git Push**
```powershell
git add .env.production
git commit -m "fix: Add /api/v1 prefix to VITE_API_URL for AI endpoints"
git push origin main
```

Option B: **Manual Redeploy in Vercel**
1. Go to **Deployments** tab
2. Click **...** menu on latest deployment
3. Select **Redeploy**

### Step 3: Verify the Fix

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Navigate to a page with AI features (Conversational Data Entry)
4. Send a test message
5. Check the network request URL - should now show:
   ```
   https://scn-esg-backend.onrender.com/api/v1/carbon/ai/extract-from-conversation/
   ```
6. Verify response is **200 OK** (not 404)

## Testing Locally

Before deploying, test locally:

```powershell
# 1. Start backend (in one terminal)
cd backend
python manage.py runserver

# 2. Start frontend (in another terminal)
npm run dev

# 3. Test AI features
# - Navigate to Conversational Data Entry
# - Send a test message
# - Check DevTools Network tab for correct URL
```

## Environment Variable Reference

| Environment | File | VITE_API_URL Value |
|------------|------|-------------------|
| Development | `.env` | `http://localhost:8000/api/v1` |
| Production | `.env.production` | `https://scn-esg-backend.onrender.com/api/v1` |
| Vercel | Dashboard | `https://scn-esg-backend.onrender.com/api/v1` |

## Common Issues

### Issue: Still getting 404 after fix
**Solution**: Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: Different error after fix (401 Unauthorized)
**Solution**: This is expected if not logged in. Make sure you're authenticated.

### Issue: CORS errors
**Solution**: Check that `CORS_ALLOWED_ORIGINS` on backend includes your Vercel domain.

## Related Files

- `src/utils/api.ts` - `buildApiUrl()` function that constructs API URLs
- `src/services/conversationalAIService.ts` - AI service that calls the API
- `backend/carbon/urls.py` - Backend URL routing (line 30)
- `backend/scn_esg_platform/urls.py` - Main URL config (line 63)

## API Endpoint Verification

Test the endpoint directly:

```bash
# Without auth (should return 401)
curl https://scn-esg-backend.onrender.com/api/v1/carbon/ai/extract-from-conversation/ \
  -X OPTIONS

# Expected response:
{"detail":"Authentication credentials were not provided."}

# This confirms the endpoint exists!
```

## Prevention

To prevent this issue in the future:

1. **Always include `/api/v1` in `VITE_API_URL`** - Django routes require this prefix
2. **Test API calls locally before deploying** - Catch URL issues early
3. **Document environment variables** - Keep this guide updated
4. **Use environment variable validation** - Consider adding startup checks

## Success Criteria

✅ AI conversational data entry works without errors
✅ Network tab shows 200 OK responses from AI endpoints
✅ No more 404 errors in console
✅ Data extraction completes successfully

---

**Last Updated**: October 4, 2025
**Fixed By**: GitHub Copilot
**Related Issue**: AI services returning 404 on production
