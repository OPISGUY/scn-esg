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

## Post-Deployment: Import Data Feature Setup

### Database Migrations for Import Feature
After deploying the backend, run migrations to enable the Import Data feature:

```bash
# Railway (recommended)
railway run python manage.py migrate

# Or via Render
# Use the Render dashboard → Shell tab → run:
# python manage.py migrate
```

This creates the necessary tables:
- `data_import_importsource` - Available import sources (file/api/iot/erp)
- `data_import_importjob` - Import job tracking with progress and status
- `data_import_importfieldmapping` - Saved field mapping templates
- `data_import_importedrecord` - Audit trail for imported rows

### Testing Import Functionality

1. **Login to the platform**
   - Use demo credentials: `demo@scn.com` / `Demo1234!`
   - Navigate to "Import Data" from the main menu

2. **Upload a test file**
   - Create a CSV file with carbon emissions data:
   ```csv
   Date,Amount,Category,Description
   2024-01-15,150.5,Transportation,Monthly fleet fuel
   2024-01-20,85.3,Electricity,Office building energy
   ```
   - Or use the included `test_carbon_data.csv`

3. **Complete the import wizard**
   - Select "CSV/Excel Files" source
   - Choose "Carbon Emissions" data type
   - Upload your CSV file
   - Review the field mapping suggestions
   - Click "Start Import"
   - Verify success statistics

4. **Check imported data**
   - Navigate to Dashboard
   - View imported records in Carbon Calculator
   - Check Footprint History for new entries

### Import Feature Configuration

Add these optional environment variables for customization:

```bash
# Maximum file upload size (default: 50MB)
railway variables set MAX_UPLOAD_SIZE="52428800"

# Enable/disable demo data seeding
railway variables set ENABLE_DEMO_USERS="True"
```

### Troubleshooting Import Issues

**Issue: "Failed to preview file"**
- Check file format (CSV, XLSX, XLS, JSON only)
- Verify file size < 50MB
- Ensure pandas and openpyxl are installed:
  ```bash
  railway run pip list | grep pandas
  railway run pip list | grep openpyxl
  ```

**Issue: "Import job stuck in pending"**
- Check backend logs: `railway logs`
- Verify field mapping matches data structure
- Test locally: `python test_import_functionality.py`

**Issue: "No data appears after import"**
- Check import job status: `/api/v1/imports/jobs/{id}/`
- Review error messages in ImportedRecord table
- Verify user has permission to view data

### Option B: Web Dashboard Deployment

...existing code...
