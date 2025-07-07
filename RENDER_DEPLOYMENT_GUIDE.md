# 🚀 Render Deployment Guide for ESG Platform

## Quick Setup (5 minutes)

### 1. Sign Up & Connect Repository
1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub account
3. Click "New +" → "Web Service"
4. Select your repository

### 2. Configure Web Service
```
Name: scn-esg-backend
Environment: Python 3
Region: Oregon (US West) or Frankfurt (Europe)
Branch: main (or your deployment branch)
Root Directory: backend
```

### 3. Build & Start Commands
```bash
# Build Command:
cd backend && pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate

# Start Command:
cd backend && gunicorn scn_esg_platform.wsgi:application --host 0.0.0.0 --port $PORT

# Alternative using scripts (if above doesn't work):
# Build Command: ./render-build.sh
# Start Command: ./render-start.sh
```

### 4. Environment Variables
Add these in Render dashboard under "Environment":

```
DATABASE_URL=<will be auto-provided by Render PostgreSQL>
SECRET_KEY=<generate a new Django secret key>
DEBUG=False
ALLOWED_HOSTS=.render.com
DJANGO_SETTINGS_MODULE=scn_esg_platform.settings
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

### 5. Add PostgreSQL Database
1. In Render dashboard, click "New +" → "PostgreSQL"
2. Name it: `scn-esg-database`
3. Copy the "Internal Database URL"
4. Add it as `DATABASE_URL` environment variable in your web service

## 🔧 Files Created for Render

The following files have been created to optimize your Render deployment:

- `render.yaml` - Render service configuration
- `build.sh` - Render build script
- `requirements.render.txt` - Render-optimized requirements
- `settings_render.py` - Render-specific Django settings

## 🚀 Deployment Steps

1. **Commit the new files to your repository**
2. **Push to GitHub**
3. **Deploy on Render using the configuration above**
4. **Update your Vercel frontend** to point to the new Render backend URL

## 📝 Post-Deployment

### Update Vercel Environment Variables
In your Vercel dashboard, update:
```
VITE_API_URL=https://your-render-app.onrender.com
REACT_APP_API_URL=https://your-render-app.onrender.com
```

### Test the Deployment
Your backend will be available at: `https://your-service-name.onrender.com`

## 🆘 Troubleshooting

### Common Issues:
1. **Build fails**: Check build logs in Render dashboard
2. **Database connection**: Verify DATABASE_URL is set correctly
3. **CORS errors**: Ensure CORS_ALLOWED_ORIGINS includes your Vercel domain
4. **Static files**: Build command includes collectstatic

### Render vs Railway Differences:
- Render uses `onrender.com` domain instead of `railway.app`
- Environment variables set in Render dashboard, not railway.json
- Render has a 15-minute sleep timer on free tier (similar to Railway)
- Database connection string format might be slightly different

## 💰 Free Tier Limits
- 750 hours/month
- Sleeps after 15 minutes of inactivity
- Free PostgreSQL database (1GB)
- Custom domains on paid plans only

Your Django ESG platform should work perfectly on Render with these configurations!
