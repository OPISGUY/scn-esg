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

## Step-by-Step Deployment

### Phase 1: Repository Setup

1. **Create GitHub Repository**
   ```bash
   # Create a new repository on GitHub
   # Clone this project to the new repository
   git init
   git add .
   git commit -m "Initial commit: SCN ESG Platform v7.0.0"
   git branch -M main
   git remote add origin https://github.com/yourusername/scn-esg-platform.git
   git push -u origin main
   ```

2. **Set up Branch Protection**
   - Go to Settings > Branches
   - Add rule for `main` branch
   - Require pull request reviews
   - Require status checks to pass

### Phase 2: Backend Deployment (Railway)

1. **Connect Repository to Railway**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `backend` folder as root

2. **Configure Environment Variables**
   ```env
   # Add these to Railway's environment variables:
   DJANGO_SECRET_KEY=your-super-secret-key-here-min-50-chars
   DJANGO_DEBUG=False
   DJANGO_ALLOWED_HOSTS=your-app.railway.app
   DJANGO_CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
   GOOGLE_AI_API_KEY=your-gemini-api-key
   ```

3. **Add PostgreSQL Database**
   - In Railway dashboard, click "Add Service"
   - Select "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

4. **Deploy Settings**
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && python manage.py migrate && python manage.py collectstatic --noinput && gunicorn scn_esg_platform.wsgi:application --bind 0.0.0.0:$PORT`

### Phase 3: Frontend Deployment (Vercel)

1. **Connect Repository to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." > "Project"
   - Import your GitHub repository
   - Select the root folder (not backend)

2. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`

3. **Environment Variables**
   ```env
   # Add these to Vercel environment variables:
   VITE_API_URL=https://your-backend.railway.app
   VITE_APP_NAME=SCN ESG Platform
   VITE_ENVIRONMENT=production
   ```

4. **Custom Domain (Optional)**
   - Claim your free .me domain from Namecheap
   - Add domain to Vercel project
   - Configure DNS settings

### Phase 4: GitHub Actions Setup

1. **Repository Secrets**
   Go to Settings > Secrets and variables > Actions, add:
   ```
   DJANGO_SECRET_KEY=your-secret-key
   GOOGLE_AI_API_KEY=your-gemini-key
   VITE_API_URL=https://your-backend.railway.app
   VERCEL_TOKEN=your-vercel-token
   VERCEL_ORG_ID=your-org-id
   VERCEL_PROJECT_ID=your-project-id
   RAILWAY_TOKEN=your-railway-token
   ```

2. **Get Vercel Tokens**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and get tokens
   vercel login
   vercel link
   
   # Copy the project details from .vercel/project.json
   ```

3. **Get Railway Token**
   - Go to Railway Dashboard > Account > Tokens
   - Create new token
   - Copy to GitHub secrets

### Phase 5: Database Setup

1. **Run Initial Migration**
   ```bash
   # In Railway dashboard, go to your backend service
   # Open the terminal and run:
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py sync_esrs_datapoints --source=local
   ```

2. **Verify Health Check**
   - Visit: `https://your-backend.railway.app/api/v1/health/`
   - Should return: `{"status": "healthy", "version": "7.0.0"}`

### Phase 6: Testing and Monitoring

1. **Test Frontend**
   - Visit your Vercel URL
   - Test all major features
   - Check browser console for errors

2. **Test Backend API**
   - Visit: `https://your-backend.railway.app/api/v1/`
   - Test authentication endpoints
   - Verify CORS configuration

3. **Set up Monitoring**
   - Add Sentry for error tracking
   - Configure Vercel Analytics
   - Set up Railway metrics

## Production Checklist

### Security
- [ ] HTTPS enabled (automatic)
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Authentication working

### Performance
- [ ] Frontend build optimized
- [ ] Database queries efficient
- [ ] Static files cached
- [ ] CDN configured (Vercel)

### Monitoring
- [ ] Health checks passing
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Uptime monitoring set up

### Functionality
- [ ] All API endpoints working
- [ ] Frontend components loading
- [ ] AI integration functional
- [ ] PDF generation working
- [ ] Database migrations complete

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (use 18+)
   - Verify all dependencies installed
   - Check environment variables

2. **CORS Errors**
   - Verify DJANGO_CORS_ALLOWED_ORIGINS
   - Check frontend API URL configuration
   - Ensure HTTPS on both ends

3. **Database Connection**
   - Verify DATABASE_URL in Railway
   - Check database service status
   - Run migrations manually if needed

4. **Environment Variables**
   - Double-check all required variables
   - Verify no typos in variable names
   - Check Railway and Vercel dashboards

### Support Resources
- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- GitHub Actions: [docs.github.com/actions](https://docs.github.com/en/actions)

## Cost Monitoring

### Free Tier Limits
- **Vercel**: Unlimited for personal projects
- **Railway**: $5/month credit (covers ~500 hours)
- **GitHub Actions**: 2000 minutes/month free
- **PlanetScale**: 5GB storage, 1B row reads

### Usage Optimization
- Use Railway sleep mode for non-production environments
- Optimize bundle size for faster deployments
- Monitor database usage in PlanetScale dashboard
- Set up usage alerts in all services

---

*Total deployment cost: $0/month with GitHub Student Pack benefits!* 🎉
