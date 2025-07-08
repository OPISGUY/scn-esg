# URGENT: Frontend API URL Update Required

## 🚨 Problem
Your Vercel frontend is still pointing to the old Railway backend:
```
https://scn-esg-production.up.railway.app
```

## ✅ Solution
Update Vercel environment variables to point to your new Render backend:

### 1. Update Vercel Environment Variables

Go to your Vercel dashboard and update:

```
VITE_API_URL=https://scn-esg-backend.onrender.com
```

### 2. Redeploy Vercel Frontend

```bash
# Commit the updated .env.production file
git add .
git commit -m "Update frontend API URL from Railway to Render"
git push origin main

# This will trigger automatic Vercel deployment
```

### 3. Alternative: Update Directly in Vercel Dashboard

1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Find `VITE_API_URL`
3. Update value to: `https://scn-esg-backend.onrender.com`
4. Redeploy

### 4. Also Update CORS in Backend

Update your Render backend environment variables:
```
CORS_ALLOWED_ORIGINS=https://scn-esg.vercel.app
```

## 🎯 What Your Render Backend URL Should Be

Replace `scn-esg-backend` with your actual Render service name:
- Backend API: `https://your-service-name.onrender.com`
- Admin Panel: `https://your-service-name.onrender.com/admin/`

## 🔍 How to Find Your Render URL

1. Go to Render dashboard
2. Click on your web service
3. Copy the URL from the top of the page (something like `https://scn-esg-backend.onrender.com`)

This will fix the CORS errors and connect your frontend to the working backend!
