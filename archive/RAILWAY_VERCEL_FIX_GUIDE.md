# 🚀 Railway + Vercel Deployment Fix Guide

## 🔍 Current Issues Identified

1. **Railway Backend**: Django app not starting (showing Railway default page)
2. **Vercel Frontend**: Missing VITE_API_URL environment variable
3. **CORS**: Not configured for Vercel domain

## ✅ Step-by-Step Fix

### 1. Fix Vercel Configuration (COMPLETED ✅)

The `vercel.json` has been updated to include the API URL environment variable.

### 2. Fix Railway Backend Configuration

#### A. Set Environment Variables in Railway Dashboard

Go to your Railway project dashboard and set these environment variables:

```bash
# Required Django Configuration
DJANGO_SECRET_KEY=your-super-secret-key-here-min-50-chars-long-random-string
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=scn-esg-backend.railway.app,*.railway.app
DJANGO_CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://scn-esg-platform.vercel.app

# Database (Railway provides this automatically)
DATABASE_URL=(Railway will set this automatically)

# AI Integration (if using AI features)
GOOGLE_AI_API_KEY=your-gemini-api-key-here

# Port (Railway sets this automatically)
PORT=(Railway will set this automatically)
```

#### B. Update CORS Configuration

The current CORS settings need to include your Vercel domain. The backend is currently only allowing `https://railway.com`.

### 3. Test and Verify

After making these changes:

1. **Redeploy Railway**: The environment variable changes should trigger a redeploy
2. **Redeploy Vercel**: Push changes to trigger Vercel redeploy
3. **Test Connection**: Use the test scripts to verify

## 🛠️ Quick Fix Commands

### Generate a Django Secret Key
```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Test Railway Deployment
```bash
python debug_railway.py
```

### Test Login After Fix
```bash
python test_production_login.py
```

## 🔧 Railway Environment Variables Template

Copy these exact values to Railway (replace placeholders):

```
DJANGO_SECRET_KEY=django-insecure-REPLACE-WITH-50-CHAR-RANDOM-STRING
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=scn-esg-backend.railway.app,*.railway.app
DJANGO_CORS_ALLOWED_ORIGINS=https://YOUR-VERCEL-APP.vercel.app
```

## 🌐 Vercel Environment Variables Template

In Vercel dashboard, set:

```
VITE_API_URL=https://scn-esg-backend.railway.app
VITE_APP_NAME=SCN ESG Platform
VITE_ENVIRONMENT=production
```

## 🔍 Troubleshooting

If issues persist:

1. **Check Railway Logs**: Look for Django startup errors
2. **Verify Database**: Ensure DATABASE_URL is set by Railway
3. **Test Locally**: Run Django locally with production settings
4. **Check DNS**: Ensure railway.app domain is accessible

## 📝 Next Steps

1. Set the environment variables in Railway
2. Update CORS origins to include your Vercel domain
3. Redeploy both services
4. Test the connection
