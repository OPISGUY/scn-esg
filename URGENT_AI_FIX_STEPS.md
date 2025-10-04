# 🚨 URGENT: AI 404 Fix - Step by Step

**Problem**: Production is still showing 404 errors because it's using an old build with the wrong URL.

**URL in error logs**: `https://scn-esg-backend.onrender.com/carbon/ai/extract-from-conversation/`
**Correct URL should be**: `https://scn-esg-backend.onrender.com/api/v1/carbon/ai/extract-from-conversation/`

---

## ⚡ Quick Fix (5 minutes total)

### Step 1: Update Vercel Environment Variable (2 min)

1. Open: https://vercel.com/opisguys-projects/scn-esg/settings/environment-variables
2. Find the variable named: **`VITE_API_URL`**
3. Click **Edit** (pencil icon)
4. Change the value:
   - **OLD**: `https://scn-esg-backend.onrender.com`
   - **NEW**: `https://scn-esg-backend.onrender.com/api/v1`
5. Make sure it's selected for: **Production**, **Preview**, **Development**
6. Click **Save**

### Step 2: Trigger Redeploy (1 min)

**Option A - Automatic (via Git)**:
```powershell
cd "C:\Users\mexmc\Documents\scn esg\scn-esg"
git add .env .env.production AI_API_FIX_GUIDE.md URGENT_AI_FIX_STEPS.md
git commit -m "fix: Add /api/v1 prefix to VITE_API_URL"
git push origin main
```

**Option B - Manual (via Vercel Dashboard)**:
1. Go to: https://vercel.com/opisguys-projects/scn-esg/deployments
2. Find the latest deployment
3. Click the **three dots** (...) menu
4. Select **"Redeploy"**
5. Check **"Use existing Build Cache"** = NO (unchecked)
6. Click **Redeploy**

### Step 3: Wait for Deployment (1-2 min)

- Watch the Vercel deployment page
- Wait for status to show **"Ready"** with green checkmark ✅
- Usually takes 1-2 minutes

### Step 4: Verify the Fix (1 min)

1. **Hard refresh** your browser: `Ctrl + Shift + R` (to clear cache)
2. Open browser **DevTools** (F12)
3. Go to **Network** tab
4. Navigate to AI Conversational Data Entry page
5. Send a test message
6. Look at the Network request - URL should now show:
   ```
   POST https://scn-esg-backend.onrender.com/api/v1/carbon/ai/extract-from-conversation/
   ```
7. Status should be **200 OK** (not 404)

---

## 🔍 Why This Happened

The production build was compiled with the old `VITE_API_URL` that didn't include `/api/v1`. 

Vite **bundles environment variables at build time**, so:
- ❌ Changing `.env` files locally doesn't affect deployed builds
- ✅ Need to update Vercel environment variable **AND** redeploy

---

## ✅ Success Checklist

- [ ] Vercel environment variable updated to include `/api/v1`
- [ ] New deployment triggered (via Git push or manual redeploy)
- [ ] Deployment shows "Ready" status
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Network tab shows correct URL with `/api/v1`
- [ ] AI request returns 200 OK
- [ ] AI conversational feature works without errors

---

## 🆘 Troubleshooting

### Still seeing 404 after redeploy?

**Check 1**: Is the new deployment live?
- Go to Vercel dashboard
- Verify the latest deployment is marked as "Current"

**Check 2**: Did you hard refresh?
- Browser cache can show old code
- Use `Ctrl + Shift + R` to force reload
- Or open in incognito/private window

**Check 3**: Is environment variable set correctly?
- Go to Vercel → Settings → Environment Variables
- VITE_API_URL should end with `/api/v1`
- Should be applied to Production environment

### Seeing 401 Unauthorized instead?

✅ **This is good!** It means the endpoint is found (no more 404)
- Make sure you're logged in
- Check that access token is in localStorage

### Seeing CORS errors?

- Check backend `CORS_ALLOWED_ORIGINS` includes your Vercel domain
- Should be in backend environment variables on Render

---

## 📝 What We Changed

1. **`.env`** (local dev) - Created with `http://localhost:8000/api/v1`
2. **`.env.production`** - Updated to `https://scn-esg-backend.onrender.com/api/v1`
3. **Vercel Environment Variable** - Needs manual update (Step 1 above)

---

**Time Required**: ~5 minutes
**Last Updated**: October 5, 2025 - Force rebuild triggered
**Next**: Follow Step 1 above to update Vercel environment variable
