# 🔐 SCN ESG Platform Authentication Recovery Guide

## Overview
This guide documents the exact working configuration and troubleshooting steps for the SCN ESG Platform authentication system. Use this when authentication breaks or stops working.

## ✅ Working Configuration (As of July 12, 2025)

### Backend Configuration
- **Service**: Render.com
- **URL**: `https://scn-esg-backend.onrender.com`
- **Status**: ✅ Healthy and responding
- **Authentication Endpoint**: `/api/v1/users/auth/login/`

### Frontend Configuration
- **Service**: Vercel
- **URL**: `https://scn-esg-platform.vercel.app`
- **Environment Variable**: `VITE_API_URL=https://scn-esg-backend.onrender.com` (⚠️ **NO TRAILING SLASH**)

### Working Test Credentials
```
Email: business@scn.com
Password: business123
```

### CORS Configuration
- **Status**: ✅ Properly configured
- **Allowed Origins**: 
  - `https://scn-esg-platform.vercel.app`
  - `https://scn-esg-frontend.vercel.app`
  - `https://scn-esg.vercel.app`
  - `http://localhost:5173`
- **Allowed Methods**: `DELETE, GET, OPTIONS, PATCH, POST, PUT`
- **Allowed Headers**: `accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with`

---

## 🚨 Common Issues & Solutions

### Issue 1: "Failed to fetch" / 404 Errors
**Symptoms:**
- Browser console shows: `Failed to fetch`
- Network tab shows 404 errors
- URL contains double slashes: `//api/v1/users/auth/login/`

**Root Cause:** Environment variable has trailing slash
**Solution:**
1. Check Vercel environment variables
2. Ensure `VITE_API_URL=https://scn-esg-backend.onrender.com` (NO trailing slash)
3. Redeploy Vercel frontend

### Issue 2: "Invalid credentials" 
**Symptoms:**
- HTTP 401 Unauthorized
- Response: `{"error": "Invalid credentials"}`

**Root Cause:** Test user accounts deleted/missing
**Solution:**
1. Run user recreation script:
   ```bash
   cd backend
   python deploy_test_users_render.py
   ```
2. Verify creation was successful (should show "✅ User created successfully!")

### Issue 3: CORS Policy Blocking
**Symptoms:**
- `Access to fetch... has been blocked by CORS policy`
- No `Access-Control-Allow-Origin` header

**Root Cause:** Frontend URL not in CORS whitelist or invalid endpoint
**Solution:**
1. Check CORS configuration with: `python test_cors_debug.py`
2. Verify your Vercel URL is in the allowed origins list
3. Check for URL construction issues (double slashes)

---

## 🛠️ Diagnostic Tools

### 1. Backend Health Check
```bash
curl https://scn-esg-backend.onrender.com/api/v1/health/
```
**Expected Response:** `{"status": "healthy", "version": "7.0.0"}`

### 2. Authentication Test (Python)
```bash
cd backend
python test_business_login.py
```
**Expected Output:** `✅ LOGIN SUCCESSFUL!`

### 3. CORS Configuration Test
```bash
cd backend  
python test_cors_debug.py
```
**Expected Output:** `✅ CORS ALLOWED for https://scn-esg-platform.vercel.app`

### 4. User Account Recreation
```bash
cd backend
python deploy_test_users_render.py
```
**Expected Output:** `✅ User created successfully!`

---

## 📋 Step-by-Step Recovery Process

### When Authentication Completely Breaks:

1. **Verify Backend Health**
   ```bash
   curl https://scn-esg-backend.onrender.com/
   ```

2. **Check Environment Variables**
   - Vercel Dashboard → Project Settings → Environment Variables
   - Ensure: `VITE_API_URL=https://scn-esg-backend.onrender.com`
   - ⚠️ **NO TRAILING SLASH**

3. **Test CORS Configuration**
   ```bash
   cd backend
   python test_cors_debug.py
   ```

4. **Recreate Test Users**
   ```bash
   cd backend
   python deploy_test_users_render.py
   ```

5. **Test Login Endpoint**
   ```bash
   cd backend
   python test_business_login.py
   ```

6. **Clear Browser Cache & Test**
   - Hard refresh: `Ctrl+F5`
   - Test login with: `business@scn.com` / `business123`

---

## 🔧 File Locations

### Key Configuration Files
- **Vercel Config**: `vercel.json`
- **Environment**: `.env.production`
- **Auth Context**: `src/contexts/AuthContext.tsx`
- **Auth Service**: `src/services/auth.ts`

### Test Scripts
- **Business Login Test**: `backend/test_business_login.py`
- **CORS Debug**: `backend/test_cors_debug.py`
- **User Creation**: `backend/deploy_test_users_render.py`
- **Full Auth Suite**: `backend/test_render_auth_fix.py`

---

## 📊 Verification Checklist

- [ ] Backend responds to health check
- [ ] VITE_API_URL has no trailing slash
- [ ] CORS allows your Vercel domain
- [ ] Test user account exists and works
- [ ] Frontend can reach backend without double slashes
- [ ] Login returns 200 with JWT token

---

## 🎯 Working URL Construction

### ✅ Correct
```
Base: https://scn-esg-backend.onrender.com
Endpoint: /api/v1/users/auth/login/
Result: https://scn-esg-backend.onrender.com/api/v1/users/auth/login/
```

### ❌ Incorrect (Double Slash)
```
Base: https://scn-esg-backend.onrender.com/
Endpoint: /api/v1/users/auth/login/
Result: https://scn-esg-backend.onrender.com//api/v1/users/auth/login/
```

---

## 📞 Emergency Recovery Commands

If everything is broken, run these in sequence:

```bash
# 1. Test backend
curl https://scn-esg-backend.onrender.com/api/v1/health/

# 2. Recreate users
cd backend && python deploy_test_users_render.py

# 3. Test authentication
python test_business_login.py

# 4. Test CORS
python test_cors_debug.py

# 5. Redeploy frontend
git add . && git commit -m "Fix auth" && git push origin main
```

---

## 📝 Notes
- **User accounts may get deleted** periodically - recreation script handles this
- **Environment variables are critical** - trailing slashes break everything
- **CORS is properly configured** - URL construction issues cause CORS errors
- **Both services are stable** - issues are usually configuration/credentials

**Last Verified:** July 12, 2025  
**Status:** ✅ Fully Working Configuration
