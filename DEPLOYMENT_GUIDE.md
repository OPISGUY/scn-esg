# SCN ESG Platform - Deployment Guide

## Prerequisites

### 1. GitHub Student Pack
- Activate your GitHub Student Pack at [education.github.com](https://education.github.com)
- Verify you have access to:
  - Vercel Pro (12 months free)
  - Railway ($5/month credit)
  - PlanetScale (Free tier + credits)
  - Namecheap (.me domain)

### 2. Accounts Setup
- Create accounts on:
  - [Vercel](https://vercel.com) (connect with GitHub)
  - [Railway](https://railway.app) (connect with GitHub)
  - [PlanetScale](https://planetscale.com) (optional, can use Railway PostgreSQL)

### 3. CLI Tools Installation
```bash
# Install Railway CLI
npm install -g @railway/cli

# Install Vercel CLI
npm install -g vercel

# Verify installations
railway --version
vercel --version
```

## Deployment Options

### Option A: CLI Deployment (Recommended for Developers) 🚀

#### Quick Deploy - Backend to Railway
```bash
# 1. Login to Railway
railway login

# 2. Navigate to backend folder
cd backend

# 3. Initialize Railway project
railway link

# 4. Set environment variables
railway variables set DJANGO_SECRET_KEY="your-super-secret-key-here-min-50-chars"
railway variables set DJANGO_DEBUG="False"
railway variables set GOOGLE_AI_API_KEY="your-gemini-api-key"

# 5. Add PostgreSQL database
railway add postgresql

# 6. Deploy backend
railway up

# 7. Run migrations
railway run python manage.py migrate
railway run python manage.py createsuperuser
railway run python manage.py sync_esrs_datapoints --source=local
#### Default Demo Credentials

- Migrations now seed a trio of demo accounts automatically so smoke tests succeed immediately after deploy.
- Seeding is controlled with environment flags:
  - `ENABLE_DEMO_USERS` (default `True`) toggles creation.
  - `RESET_DEMO_PASSWORDS` (default `True`) realigns passwords on each migrate.
- Out-of-the-box credentials:
  - Admin: `demo@scn.com` / `Demo1234!`
  - Sustainability Manager: `test@scn.com` / `Test1234!`
  - Decision Maker: `business@scn.com` / `Business123!`
- Set `ENABLE_DEMO_USERS=False` if you need a clean production tenant without sample accounts.
```

#### Quick Deploy - Frontend to Vercel
```bash
# 1. Navigate to project root
cd ..

# 2. Login to Vercel
vercel login

# 3. Deploy with environment variables
vercel --prod --env VITE_API_URL="https://your-backend.railway.app" --env VITE_APP_NAME="SCN ESG Platform" --env VITE_ENVIRONMENT="production"

# Or set environment variables first, then deploy
vercel env add VITE_API_URL production
# Enter: https://your-backend.railway.app
vercel env add VITE_APP_NAME production  
# Enter: SCN ESG Platform
vercel env add VITE_ENVIRONMENT production
# Enter: production

# Then deploy
vercel --prod
```

#### Complete CLI Deployment Script
```bash
#!/bin/bash
# deploy.sh - Complete deployment script

echo "🚀 Starting SCN ESG Platform deployment..."

# Backend deployment
echo "📦 Deploying backend to Railway..."
cd backend
railway login
railway link
railway variables set DJANGO_SECRET_KEY="$(openssl rand -base64 32)"
railway variables set DJANGO_DEBUG="False"
railway variables set GOOGLE_AI_API_KEY="$GOOGLE_AI_API_KEY"
railway add postgresql
railway up
railway run python manage.py migrate
railway run python manage.py collectstatic --noinput

# Get backend URL
BACKEND_URL=$(railway status --json | jq -r '.deployments[0].url')
echo "✅ Backend deployed to: $BACKEND_URL"

# Frontend deployment
echo "🎨 Deploying frontend to Vercel..."
cd ..
vercel login
vercel env add VITE_API_URL production --value "$BACKEND_URL"
vercel env add VITE_APP_NAME production --value "SCN ESG Platform"
vercel env add VITE_ENVIRONMENT production --value "production"
vercel --prod

echo "🎉 Deployment complete!"
echo "Backend: $BACKEND_URL"
echo "Frontend: Check Vercel output for URL"
```

### Option B: Web Dashboard Deployment

...existing code...
