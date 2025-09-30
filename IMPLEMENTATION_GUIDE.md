# SCN ESG Platform - Master Implementation Guide

_Last Updated: September 30, 2025_

## Document Purpose

This guide consolidates the complete implementation journey of the SCN ESG Platform, marking completed phases, documenting current production status, and outlining next steps for continued development.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Completed Phases](#completed-phases)
3. [Current Production Status](#current-production-status)
4. [Active Infrastructure](#active-infrastructure)
5. [Next Steps & Roadmap](#next-steps--roadmap)
6. [Development Workflow](#development-workflow)
7. [Troubleshooting & Maintenance](#troubleshooting--maintenance)

---

## Project Overview

**SCN ESG Platform** is a comprehensive sustainability intelligence system helping organizations track ESG metrics, manage carbon footprint, handle e-waste donations, ensure CSRD/ESRS compliance, and generate professional reports with AI-powered insights.

### Tech Stack
- **Frontend**: React 18.3 + TypeScript + Vite + Tailwind CSS
- **Backend**: Django 4.2 + Django REST Framework + PostgreSQL
- **AI**: Google Gemini API (production-verified)
- **Deployment**: Vercel (frontend) + Render (backend)
- **Authentication**: JWT tokens via django-rest-framework-simplejwt

### Repository
- **GitHub**: `OPISGUY/scn-esg`
- **Branch**: `main`
- **Frontend URL**: https://scn-esg.vercel.app
- **Backend URL**: https://scn-esg-backend.onrender.com

---

## Completed Phases

### ✅ Phase 1-3: Foundation & Core Features
**Status**: COMPLETED  
**Timeline**: Initial development phases

#### Achievements
- React + TypeScript frontend scaffolding with Vite
- Tailwind CSS design system implementation
- Django REST backend architecture
- SQLite development database setup
- Core models: `User`, `Company`, `CarbonFootprint`, `EwasteDonation`
- Basic dashboard with metrics visualization
- Carbon calculator and offset marketplace UI
- E-waste donation tracking interface

#### Key Files
- `src/main.tsx` - React application entry point
- `src/App.tsx` - Main application routing and layout
- `backend/manage.py` - Django management interface
- `backend/scn_esg_platform/settings.py` - Backend configuration

---

### ✅ Phase 4: PDF Reporting System
**Status**: COMPLETED  
**Timeline**: Mid-development phase

#### Achievements
- Professional PDF generation using jsPDF + html2canvas
- Multi-section reports: Executive Summary, Carbon Metrics, E-waste Stats, Offsets
- Custom styling with company branding
- Chart and visualization rendering in PDFs
- Export functionality from dashboard

#### Key Files
- `src/services/pdfService.ts` - PDF generation service
- `src/components/Reports.tsx` - Report generation UI

#### Documentation Reference
- See `PDF_REPORTING_DEMO.md` for detailed usage examples

---

### ✅ Phase 5: AI Integration
**Status**: COMPLETED & VERIFIED  
**Timeline**: Advanced features phase

#### Achievements
- Google Gemini API integration (production-verified with user API key)
- AI-powered sustainability insights and recommendations
- Conversational data entry via natural language processing
- Intelligent compliance guidance
- Fallback mechanisms for API failures
- Rate limiting and error handling

#### Key Files
- `backend/compliance/ai_services.py` - AI service layer
- `backend/test_real_ai.py` - AI integration verification script
- `backend/quick_ai_test.py` - Quick AI functionality tests
- `src/components/AIInsights.tsx` - AI insights UI
- `src/components/ConversationalDataEntry.tsx` - Voice/chat interface

#### Environment Variables Required
```bash
GOOGLE_AI_API_KEY=your_gemini_api_key_here
```

#### Verification
```bash
# Backend AI test (confirmed working)
python backend/test_real_ai.py
```

---

### ✅ Phase 6: CSRD Compliance Module
**Status**: COMPLETED  
**Timeline**: Production-grade compliance implementation

#### Achievements
- **ESRSDatapointCatalog** model for comprehensive ESRS datapoint management
- Integration with EFRAG official XBRL taxonomy sources
- Integration with open-source `aimabel-ai/esrs-xbrl-parser`
- Automated ESRS datapoint synchronization
- Regulatory update monitoring (EUR-Lex integration)
- Compliance dashboard with hierarchical datapoint browser
- AI-powered compliance guidance with fallback mechanisms
- Management commands for automation:
  - `sync_esrs_datapoints` - Sync ESRS datapoints from sources
  - `monitor_regulatory_updates` - Track EU regulatory changes
  - `setup_esrs_parser` - Install Node.js parser dependencies

#### Key Files
- `backend/compliance/models.py` - ESRSDatapointCatalog, RegulatoryUpdate
- `backend/compliance/services.py` - Compliance business logic
- `backend/compliance/views.py` - API endpoints and viewsets
- `backend/compliance/ai_services.py` - AI compliance assistance
- `backend/populate_esrs_datapoints.py` - ESRS datapoint population script
- `src/components/CSRDCompliance.tsx` - Compliance dashboard UI
- `src/components/ESRSDatapointBrowser.tsx` - Datapoint browser interface

#### API Endpoints
```
GET    /api/v1/compliance/datapoints/         # List ESRS datapoints
GET    /api/v1/compliance/datapoints/{id}/    # Datapoint detail
GET    /api/v1/compliance/statistics/         # Compliance statistics
GET    /api/v1/compliance/regulatory-updates/ # Regulatory changes
POST   /api/v1/compliance/ai-guidance/        # AI compliance guidance
```

#### Management Commands
```bash
# Sync ESRS datapoints from local or remote sources
python manage.py sync_esrs_datapoints --source=local

# Monitor regulatory updates
python manage.py monitor_regulatory_updates

# Setup Node.js ESRS parser
python manage.py setup_esrs_parser
```

#### Documentation Reference
- See `PHASE_6_SUMMARY.md` for detailed compliance module documentation

---

### ✅ Phase 7: Authentication & User Management
**Status**: COMPLETED  
**Timeline**: Production authentication implementation (September 2025)

#### Achievements
- Complete JWT authentication flow (access + refresh tokens)
- User registration with role-based access control
- Login/logout with secure token management
- Token refresh mechanism with automatic retry on 401
- Email verification system (backend ready, email sending configured)
- User profile management
- Company/organization onboarding workflow
- Dashboard preferences and personalization
- AuthContext for frontend state management
- Protected routes and authentication guards

#### Key Files
- `backend/users/auth_views.py` - Authentication API endpoints
- `backend/users/models.py` - Custom User model with roles
- `backend/users/serializers.py` - User data serialization (includes `is_onboarding_complete`)
- `src/contexts/AuthContext.tsx` - Frontend authentication state
- `src/components/LoginSignup.tsx` - Login/signup UI
- `src/components/onboarding/OnboardingWizard.tsx` - Multi-step onboarding

#### User Roles
- **admin**: Full system access and management
- **sustainability_manager**: Data entry and reporting focus
- **decision_maker**: Dashboard and insights focus
- **viewer**: Read-only access

#### API Endpoints
```
POST   /api/v1/users/auth/register/           # User registration
POST   /api/v1/users/auth/login/              # User login
POST   /api/v1/users/auth/logout/             # User logout (token blacklist)
POST   /api/v1/users/auth/refresh/            # Refresh access token
GET    /api/v1/users/auth/profile/            # Get user profile
POST   /api/v1/users/auth/complete-onboarding/ # Complete onboarding flow
GET    /api/v1/users/auth/health/             # Health check endpoint
```

#### Authentication Flow
1. User registers via `/auth/register/` with email, password, name
2. Backend creates user and returns JWT access + refresh tokens
3. Frontend stores tokens in localStorage via AuthContext
4. User completes onboarding wizard (company info, sustainability goals)
5. Backend marks `is_onboarding_complete = True` and updates dashboard preferences
6. Protected routes check authentication status via AuthContext
7. On 401 responses, frontend automatically attempts token refresh
8. If refresh succeeds, retry original request with new token
9. If refresh fails, clear tokens and redirect to login

#### Current Production Credentials
See `working_test_credentials.md` for verified test accounts:
- `demo@scn.com` / `Demo1234!` (admin role)
- `test@scn.com` / `Test1234!` (sustainability_manager role)

#### Recent Fixes (September 30, 2025)
- ✅ Fixed token refresh logic in onboarding flow
- ✅ Updated UserSerializer to expose `is_onboarding_complete` flag
- ✅ Corrected indentation errors in serializers for production deployment
- ✅ Recreated test accounts after Render database reset
- ✅ Verified login and onboarding flow end-to-end

#### Documentation Reference
- See `AUTHENTICATION_IMPLEMENTATION_PLAN.md` for original requirements
- See `AUTHENTICATION_ROADMAP_DETAILED.md` for detailed implementation timeline
- See `AUTHENTICATION_QUICKSTART.md` for developer onboarding guide

---

## Current Production Status

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                         │
│              https://scn-esg.vercel.app                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Vercel Edge Network                        │
│         (Static React SPA + CDN)                        │
│                                                         │
│   Environment Variables:                                │
│   - VITE_API_URL=https://scn-esg-backend.onrender.com  │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS/REST API
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Render Web Service                         │
│      https://scn-esg-backend.onrender.com               │
│                                                         │
│   Django REST API (Python 3.13)                         │
│   - JWT Authentication                                  │
│   - CORS configured for Vercel domain                   │
│   - PostgreSQL database (Render managed)                │
│   - Google Gemini AI integration                        │
│                                                         │
│   Environment Variables:                                │
│   - DJANGO_SECRET_KEY                                   │
│   - DJANGO_DEBUG=False                                  │
│   - DJANGO_ALLOWED_HOSTS                                │
│   - DJANGO_CORS_ALLOWED_ORIGINS                         │
│   - GOOGLE_AI_API_KEY                                   │
│   - DATABASE_URL (Render PostgreSQL)                    │
└─────────────────────────────────────────────────────────┘
```

### Live Services

#### Frontend (Vercel)
- **URL**: https://scn-esg.vercel.app
- **Build**: Vite production build (`npm run build`)
- **Deploy**: Automatic on `main` branch push
- **Environment**: Production
- **CDN**: Vercel Edge Network (global)

#### Backend (Render)
- **URL**: https://scn-esg-backend.onrender.com
- **Runtime**: Python 3.13.4
- **Framework**: Django 4.2.7
- **Database**: PostgreSQL (Render managed)
- **Build Command**: `pip install -r requirements.render.txt`
- **Start Command**: `gunicorn scn_esg_platform.wsgi:application`
- **Health Check**: `GET /api/v1/users/auth/health/` (returns 200 OK)

### Environment Configuration

#### Vercel (Frontend)
```bash
VITE_API_URL=https://scn-esg-backend.onrender.com
```

#### Render (Backend)
```bash
DJANGO_SECRET_KEY=<50+ character random string>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=scn-esg-backend.onrender.com
DJANGO_CORS_ALLOWED_ORIGINS=https://scn-esg.vercel.app
GOOGLE_AI_API_KEY=<user's Gemini API key>
DATABASE_URL=<Render PostgreSQL connection string>
```

### Database Schema (Current)

#### Core Tables
- `users_customuser` - User accounts with roles and preferences
- `companies_company` - Company/organization profiles
- `carbon_carbonfootprint` - Carbon emission tracking
- `ewaste_ewastedonation` - E-waste donation records
- `compliance_esrsdatapointcatalog` - ESRS compliance datapoints
- `compliance_regulatoryupdate` - EU regulatory change tracking

### Known Issues & Mitigations

#### Render Free Tier Spin-Down
- **Issue**: Render free tier services spin down after 15 minutes of inactivity
- **Impact**: First request after idle period takes 30-60 seconds
- **Mitigation**: Consider upgrading to paid tier or implementing keep-alive pings
- **Status**: Acceptable for demo/development phase

#### Database Resets on Redeploy
- **Issue**: Render occasionally resets database during redeployments
- **Impact**: Test accounts and data lost
- **Mitigation**: Maintain `working_test_credentials.md` and regenerate accounts after deploy
- **Script**: `backend/deploy_test_users_render.py` (API-based account creation)
- **Status**: Managed via documentation and automation scripts

#### CORS Configuration
- **Issue**: Must keep CORS origins synchronized between Vercel domain and Render settings
- **Current**: `DJANGO_CORS_ALLOWED_ORIGINS=https://scn-esg.vercel.app`
- **Status**: ✅ Configured correctly

---

## Active Infrastructure

### Repository Structure
```
scn-esg/
├── .github/
│   └── copilot-instructions.md          # AI assistant guidance
├── backend/                              # Django REST API
│   ├── scn_esg_platform/                # Django project config
│   ├── users/                           # Authentication & user management
│   ├── companies/                       # Company profiles
│   ├── carbon/                          # Carbon tracking
│   ├── ewaste/                          # E-waste management
│   ├── compliance/                      # CSRD/ESRS compliance
│   ├── analytics/                       # Advanced analytics
│   ├── notifications/                   # Email notifications
│   ├── requirements.txt                 # Python dependencies (local)
│   ├── requirements.render.txt          # Python dependencies (production)
│   ├── manage.py                        # Django management
│   ├── settings_sqlite.py               # Local SQLite settings
│   └── settings_render.py               # Production Render settings
├── src/                                 # React frontend
│   ├── components/                      # React components
│   ├── contexts/                        # React contexts (AuthContext, etc.)
│   ├── services/                        # API services and utilities
│   ├── types/                           # TypeScript type definitions
│   ├── utils/                           # Utility functions
│   ├── data/                            # Mock data for development
│   ├── App.tsx                          # Main application component
│   └── main.tsx                         # React entry point
├── public/                              # Static assets
├── vite.config.ts                       # Vite build configuration
├── tailwind.config.js                   # Tailwind CSS configuration
├── tsconfig.json                        # TypeScript configuration
├── package.json                         # Node.js dependencies
├── vercel.json                          # Vercel deployment config
├── render.yaml                          # Render deployment config (legacy)
├── working_test_credentials.md          # Production test account credentials
├── IMPLEMENTATION_GUIDE.md              # This document
└── README.md                            # Project readme
```

### Key Configuration Files

#### `vercel.json` (Frontend Deployment)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### `backend/requirements.render.txt` (Backend Dependencies)
```
Django==4.2.7
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.1
psycopg2-binary==2.9.9
gunicorn==21.2.0
google-generativeai>=0.3.0
requests>=2.31.0
python-dotenv>=1.0.0
```

#### `backend/settings_render.py` (Production Settings)
- Uses `dj_database_url` for PostgreSQL connection
- CORS configured for Vercel frontend domain
- JWT authentication via SimpleJWT
- Static file serving via WhiteNoise
- Debug mode disabled in production

---

## Next Steps & Roadmap

### 🚀 Phase 8: Enhanced User Experience (NEXT)
**Priority**: HIGH  
**Timeline**: 2-3 weeks

#### Objectives
1. **Onboarding Improvements**
   - Add interactive product tour after first login
   - Contextual tooltips and help hints throughout dashboard
   - Video tutorials embedded in key sections
   - Progress indicators for incomplete setup tasks

2. **Help System**
   - Searchable help documentation
   - In-app chatbot for common questions
   - "Getting Started" checklist widget
   - Keyboard shortcuts reference

3. **UI/UX Polish**
   - Loading states and skeleton screens
   - Error boundary components with user-friendly messages
   - Toast notifications for actions
   - Improved mobile responsiveness
   - Dark mode support

#### Implementation Steps
- [ ] Create `HelpContext` for contextual help state management
- [ ] Build `ProductTour` component using react-joyride or similar
- [ ] Implement tooltip system with react-tooltip
- [ ] Add loading skeletons to all data-fetching components
- [ ] Create unified error boundary wrapper
- [ ] Implement toast notification system (react-hot-toast)
- [ ] Audit mobile layouts and fix breakpoints
- [ ] Add dark mode toggle and theme persistence

#### Files to Create/Modify
- `src/contexts/HelpContext.tsx` (NEW)
- `src/components/ProductTour.tsx` (NEW)
- `src/components/HelpWidget.tsx` (NEW)
- `src/components/LoadingStates.tsx` (NEW)
- `src/components/ErrorBoundary.tsx` (NEW)
- Update all major components with loading/error states

---

### 📊 Phase 9: Advanced Analytics & Reporting
**Priority**: MEDIUM  
**Timeline**: 3-4 weeks

#### Objectives
1. **Enhanced Data Visualization**
   - Time-series carbon trend charts
   - Comparative benchmarking against industry averages
   - Predictive carbon modeling with AI
   - Interactive drill-down reports

2. **Custom Report Builder**
   - Drag-and-drop report sections
   - White-label branding options
   - Scheduled report generation
   - Export to Excel/CSV formats

3. **Data Import/Export**
   - Bulk CSV import for historical data
   - Excel template downloads
   - API endpoints for third-party integrations
   - Automated data sync with accounting systems

#### Implementation Steps
- [ ] Integrate Recharts or Chart.js for advanced visualizations
- [ ] Create time-series analysis service
- [ ] Build report template system
- [ ] Implement CSV import/export utilities
- [ ] Add Excel generation using openpyxl
- [ ] Create API documentation using DRF Spectacular
- [ ] Build webhook system for external integrations

---

### 🔒 Phase 10: Security & Compliance Hardening
**Priority**: HIGH  
**Timeline**: 2 weeks

#### Objectives
1. **Security Enhancements**
   - Two-factor authentication (2FA)
   - Rate limiting on all API endpoints
   - CAPTCHA on registration/login
   - Session timeout and auto-logout
   - Audit logging for sensitive actions

2. **Compliance Features**
   - GDPR data export and deletion
   - Data retention policy enforcement
   - User consent management
   - Privacy policy acceptance tracking
   - Terms of service versioning

3. **Monitoring & Logging**
   - Error tracking with Sentry
   - Performance monitoring with New Relic
   - Security incident alerting
   - Database backup automation

#### Implementation Steps
- [ ] Integrate django-otp for 2FA
- [ ] Implement django-ratelimit on all views
- [ ] Add Google reCAPTCHA to forms
- [ ] Create audit log model and middleware
- [ ] Build GDPR compliance endpoints
- [ ] Set up Sentry error tracking
- [ ] Configure automated database backups on Render
- [ ] Create security incident response playbook

---

### 🌍 Phase 11: Internationalization & Localization
**Priority**: LOW  
**Timeline**: 2-3 weeks

#### Objectives
1. **Multi-Language Support**
   - English (default)
   - Spanish
   - French
   - German
   - Chinese

2. **Regional Adaptations**
   - Currency conversion and formatting
   - Date/time formatting per locale
   - Carbon unit preferences (metric vs imperial)
   - Regulatory framework selection (EU vs US vs APAC)

#### Implementation Steps
- [ ] Integrate react-i18next for frontend
- [ ] Use Django i18n framework for backend
- [ ] Extract all UI strings to translation files
- [ ] Implement language selector component
- [ ] Add currency conversion service
- [ ] Create locale-aware number/date formatters
- [ ] Build regional compliance mapping

---

### 🎯 Phase 12: Public Launch Preparation
**Priority**: CRITICAL  
**Timeline**: 1-2 weeks before launch

#### Pre-Launch Checklist
- [ ] **Performance Optimization**
  - [ ] Run Lighthouse audits (target: 90+ scores)
  - [ ] Optimize bundle size (code splitting, lazy loading)
  - [ ] Enable CDN caching for static assets
  - [ ] Database query optimization and indexing
  - [ ] Load testing with realistic user scenarios

- [ ] **Content & Documentation**
  - [ ] Update README.md with production setup instructions
  - [ ] Create user-facing help documentation
  - [ ] Write API documentation for third-party integrations
  - [ ] Record demo videos and tutorials
  - [ ] Prepare marketing materials

- [ ] **Legal & Compliance**
  - [ ] Privacy policy finalization
  - [ ] Terms of service acceptance flow
  - [ ] GDPR compliance verification
  - [ ] Cookie consent banner
  - [ ] Data processing agreements

- [ ] **Infrastructure**
  - [ ] Upgrade Render to paid tier (remove spin-down delays)
  - [ ] Configure custom domain (via GitHub Student Pack Namecheap credit)
  - [ ] Enable HTTPS/SSL certificates
  - [ ] Set up monitoring and alerting (Sentry, New Relic)
  - [ ] Configure automated backups

- [ ] **Testing**
  - [ ] End-to-end testing with Playwright or Cypress
  - [ ] Cross-browser compatibility testing
  - [ ] Mobile device testing (iOS/Android)
  - [ ] Accessibility audit (WCAG 2.1 AA compliance)
  - [ ] Security penetration testing

---

## Development Workflow

### Local Development Setup

#### Prerequisites
- Node.js 18+ and npm
- Python 3.11+ and pip
- Git

#### Frontend Setup
```bash
# Clone repository
git clone https://github.com/OPISGUY/scn-esg.git
cd scn-esg

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

#### Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate --settings=scn_esg_platform.settings_sqlite

# Create superuser
python manage.py createsuperuser --settings=scn_esg_platform.settings_sqlite

# Populate ESRS datapoints (optional)
python populate_esrs_datapoints.py

# Start development server
python manage.py runserver --settings=scn_esg_platform.settings_sqlite
# Backend runs on http://localhost:8000
```

#### Environment Variables (Local Development)
Create `backend/.env`:
```bash
DJANGO_SECRET_KEY=local-dev-secret-key-change-in-production
DJANGO_DEBUG=True
GOOGLE_AI_API_KEY=your_gemini_api_key_here
```

Create `.env` in project root:
```bash
VITE_API_URL=http://localhost:8000
```

### Git Workflow

#### Branch Strategy
- `main` - Production-ready code, auto-deploys to Vercel + Render
- `develop` - Integration branch for features (if team grows)
- `feature/*` - Feature branches (e.g., `feature/user-onboarding`)
- `fix/*` - Bug fix branches (e.g., `fix/auth-token-refresh`)

#### Commit Conventions
Follow conventional commits:
```
feat: add two-factor authentication
fix: resolve onboarding loop issue
docs: update IMPLEMENTATION_GUIDE with Phase 8 details
style: improve mobile responsiveness on dashboard
refactor: extract PDF service into separate module
test: add unit tests for compliance service
chore: upgrade dependencies
```

#### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with descriptive commits
3. Run linting and type checking: `npm run lint && npm run typecheck`
4. Test locally (frontend + backend)
5. Push to GitHub and open PR
6. Review and merge to `main`
7. Automatic deployment to Vercel + Render

### Testing Strategy

#### Frontend Testing
```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build verification
npm run build
```

#### Backend Testing
```bash
# Run Django tests
python manage.py test --settings=scn_esg_platform.settings_sqlite

# Test authentication endpoints
python backend/test_endpoints.py

# Test compliance module
python backend/test_compliance.py

# Test AI integration
python backend/test_real_ai.py

# Test full deployment
python backend/test_full_deployment.py
```

#### End-to-End Testing (Future)
```bash
# Playwright/Cypress tests (to be implemented in Phase 8)
npm run test:e2e
```

### Deployment Process

#### Automatic Deployment (Current)
1. Push to `main` branch on GitHub
2. Vercel automatically builds and deploys frontend
3. Render automatically builds and deploys backend
4. Check deployment status:
   - Vercel: https://vercel.com/dashboard
   - Render: https://dashboard.render.com

#### Manual Deployment (if needed)

**Frontend (Vercel CLI)**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Backend (Render Dashboard)**
1. Push changes to GitHub `main` branch
2. Navigate to https://dashboard.render.com
3. Click "Manual Deploy" on backend service
4. Monitor build logs

### Database Migrations

#### Creating Migrations
```bash
# Backend
cd backend

# Generate migration after model changes
python manage.py makemigrations --settings=scn_esg_platform.settings_sqlite

# Apply migrations locally
python manage.py migrate --settings=scn_esg_platform.settings_sqlite
```

#### Production Migrations
Migrations apply automatically on Render deployment via `render-build.sh`:
```bash
#!/bin/bash
pip install -r requirements.render.txt
python manage.py migrate --noinput
python manage.py collectstatic --noinput
```

### Monitoring Production

#### Health Checks
```bash
# Backend health
curl https://scn-esg-backend.onrender.com/api/v1/users/auth/health/

# Expected response:
# {"status":"healthy","message":"SCN ESG Platform API is running","version":"7.5.0"}
```

#### Logs
- **Vercel**: View via Vercel dashboard or `vercel logs`
- **Render**: View via Render dashboard under "Logs" tab

#### Performance Metrics
- **Vercel Analytics**: Available in Vercel dashboard (free tier)
- **Render Metrics**: CPU/Memory usage visible in Render dashboard

---

## Troubleshooting & Maintenance

### Common Issues

#### Issue: Frontend shows "Invalid credentials" after login
**Cause**: Render database reset after redeploy, test accounts lost  
**Solution**: Recreate test accounts via `backend/deploy_test_users_render.py` or manually via registration  
**Prevention**: Document credentials in `working_test_credentials.md`

#### Issue: Onboarding wizard loops, never advances to dashboard
**Cause**: Backend not returning `is_onboarding_complete` flag  
**Solution**: Verify `UserSerializer` includes `is_onboarding_complete` in `fields` list  
**Fix Applied**: September 30, 2025 - serializer updated

#### Issue: 401 Unauthorized on API calls after login
**Cause**: Access token expired, refresh not attempted  
**Solution**: Frontend `AuthContext` now automatically refreshes tokens on 401  
**Fix Applied**: September 30, 2025 - token refresh retry logic added

#### Issue: CORS errors when frontend calls backend
**Cause**: Vercel domain not in `DJANGO_CORS_ALLOWED_ORIGINS`  
**Solution**: Update Render environment variable to include Vercel URL  
**Fix Applied**: Production environment configured correctly

#### Issue: Render backend takes 30+ seconds to respond
**Cause**: Free tier service spun down after inactivity  
**Solution**: Upgrade to paid tier or implement keep-alive pings  
**Status**: Acceptable for demo phase

#### Issue: Google Gemini AI requests fail
**Cause**: API key not set or invalid  
**Solution**: Verify `GOOGLE_AI_API_KEY` in Render environment variables  
**Test**: Run `python backend/test_real_ai.py` to verify

### Maintenance Tasks

#### Weekly
- [ ] Review Render logs for errors or warnings
- [ ] Check Vercel analytics for performance degradation
- [ ] Verify test account credentials still work
- [ ] Monitor database size and cleanup old records if needed

#### Monthly
- [ ] Update dependencies (`npm outdated`, `pip list --outdated`)
- [ ] Review and rotate API keys (Google Gemini)
- [ ] Backup production database manually (Render auto-backups on paid tier)
- [ ] Run security audits (`npm audit`, `pip check`)

#### Quarterly
- [ ] Major dependency upgrades (React, Django, etc.)
- [ ] Performance optimization review (Lighthouse audits)
- [ ] User feedback review and feature prioritization
- [ ] Documentation updates for new features

### Useful Scripts

#### `backend/deploy_test_users_render.py`
Creates test accounts on Render backend via API registration:
```bash
python backend/deploy_test_users_render.py
```

#### `backend/populate_esrs_datapoints.py`
Populates ESRS datapoint catalog from local files:
```bash
python backend/populate_esrs_datapoints.py
```

#### `backend/test_full_deployment.py`
Comprehensive production deployment test:
```bash
python backend/test_full_deployment.py
```

#### PowerShell Deployment Scripts
- `deploy.ps1` - Railway deployment (legacy)
- `deploy_render.ps1` - Render deployment
- `build.ps1` - Local build verification

### Support Resources

#### Documentation
- **This Guide**: `IMPLEMENTATION_GUIDE.md` (master reference)
- **Agent Roles**: `AGENTS.md` (team responsibilities)
- **Copilot Instructions**: `.github/copilot-instructions.md` (AI assistant guidance)
- **Project Overview**: `PROJECT_DOCUMENTATION.md` (technical deep dive)

#### External Resources
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)

#### Community
- GitHub Issues: https://github.com/OPISGUY/scn-esg/issues
- GitHub Discussions: https://github.com/OPISGUY/scn-esg/discussions

---

## Change Log

### September 30, 2025
- ✅ Fixed `UserSerializer` indentation error blocking Render deployment
- ✅ Updated serializer to expose `is_onboarding_complete` and `dashboard_preferences`
- ✅ Implemented token refresh retry logic in `AuthContext.completeOnboarding`
- ✅ Recreated test accounts after Render database reset
- ✅ Verified end-to-end authentication and onboarding flow
- ✅ Consolidated documentation into `IMPLEMENTATION_GUIDE.md`
- ✅ **Implemented Carbon Calculator data persistence** - Users can now save footprints to their account
- ✅ **Connected Reports system to real user data** - Reports now pull from backend API instead of mock data
- ✅ **Created CarbonService** - New API service layer for carbon footprint operations
- ✅ **Added loading and error states** - Better UX feedback during data operations

### Earlier 2025
- ✅ Completed Phase 1-6 (foundation, PDF reports, AI integration, CSRD compliance)
- ✅ Deployed frontend to Vercel
- ✅ Deployed backend to Render
- ✅ Configured production environment variables
- ✅ Verified Google Gemini AI integration in production

---

## Appendix: Files to Keep vs. Consolidate

### ✅ Keep These Files
- `README.md` - Project overview and quick start (update to reference this guide)
- `AGENTS.md` - Team roles and operational guidelines
- `.github/copilot-instructions.md` - AI assistant configuration
- `working_test_credentials.md` - Production credentials reference
- `IMPLEMENTATION_GUIDE.md` - This master guide

### ❌ Consolidate/Archive These Files
The following files have been consolidated into this guide and can be moved to an `archive/` folder:
- `AUTHENTICATION_IMPLEMENTATION_PLAN.md` → Consolidated into Phase 7
- `AUTHENTICATION_ROADMAP_DETAILED.md` → Consolidated into Phase 7
- `AUTHENTICATION_PROGRESS_TRACKER.md` → Consolidated into Phase 7
- `AUTHENTICATION_IMPLEMENTATION_PROGRESS_REPORT.md` → Consolidated into Phase 7
- `AUTHENTICATION_QUICKSTART.md` → Consolidated into Phase 7
- `AUTHENTICATION_RECOVERY_GUIDE.md` → Consolidated into Troubleshooting
- `DEPLOYMENT_GUIDE.md` → Consolidated into Active Infrastructure
- `DEPLOYMENT_CHECKLIST.md` → Consolidated into Phase 12
- `DEPLOYMENT_SUCCESS.md` → Consolidated into Current Production Status
- `CLI_DEPLOYMENT_GUIDE.md` → Consolidated into Development Workflow
- `RENDER_DEPLOYMENT_GUIDE.md` → Consolidated into Active Infrastructure
- `RENDER_CLI_QUICKSTART.md` → Consolidated into Development Workflow
- `RAILWAY_DEPLOYMENT_FIX.md` → No longer relevant (moved to Render)
- `RAILWAY_ENVIRONMENT_SETUP.md` → No longer relevant (moved to Render)
- `RAILWAY_VERCEL_FIX_GUIDE.md` → No longer relevant (moved to Render)
- `VERCEL_FRONTEND_FIX.md` → Consolidated into Troubleshooting
- `ALTERNATIVE_DEPLOYMENT_OPTIONS.md` → Consolidated into Active Infrastructure
- `DATABASE_ALTERNATIVES.md` → Consolidated into Active Infrastructure
- `DOCUMENTATION_CLEANUP_SUMMARY.md` → Superseded by this guide
- `FULL_STACK_TEST_REPORT.md` → Consolidated into Testing Strategy
- `PHASE_6_SUMMARY.md` → Consolidated into Phase 6
- `PDF_REPORTING_DEMO.md` → Consolidated into Phase 4
- `PROJECT_DOCUMENTATION_CLEANED.md` → Superseded by PROJECT_DOCUMENTATION.md

---

---

## Changelog

### September 30, 2025 (Continued) - Carbon Footprint Management Enhancement

**Implemented Features:**

1. **Footprint History Component** (`src/components/FootprintHistory.tsx`)
   - Comprehensive table view of all saved carbon footprints
   - Sortable columns: reporting period, emissions by scope, total, status, created date
   - Status badges with icons (draft, submitted, verified)
   - Edit/delete functionality with confirmation modals
   - Empty states and loading indicators
   - Full integration with carbonService API

2. **Data Visualization** (`src/components/EmissionsCharts.tsx`)
   - **Trend Line Chart**: Multi-line chart showing emissions over time by scope + total
   - **Scope Comparison Bar Chart**: Side-by-side comparison of scope 1/2/3 for latest period
   - **Emissions Distribution Pie Chart**: Percentage breakdown by scope category
   - Summary statistics: total records, latest total, highest scope, latest period
   - Responsive charts using Recharts library
   - Custom tooltips and legends

3. **Data Export Utilities** (`src/utils/exportUtils.ts`)
   - **CSV Export**: Structured spreadsheet with all footprint records
   - **Detailed Text Report**: Comprehensive report with:
     - Summary statistics (total, average emissions)
     - Record-by-record breakdown
     - Trend analysis (first vs. latest period comparison)
     - Percentage change calculations
   - Automatic filename generation with timestamps

4. **Reports Component Enhancement**
   - Integrated EmissionsCharts for visual analytics
   - Added export buttons (CSV + detailed report)
   - Real-time data from backend via carbonService
   - Graceful fallbacks for missing data

**Dependencies Added:**
- `recharts@^2.x` - Professional charting library for React

**Navigation Update:**
- Added "Footprint History" menu item in Layout.tsx
- Integrated history route in App.tsx

**API Integration:**
- All components use carbonService for data fetching
- Full CRUD operations: getFootprints, createFootprint, updateFootprint, deleteFootprint
- Auth headers with JWT token management

**Files Modified:**
- `src/components/Layout.tsx` - Added history navigation item
- `src/App.tsx` - Added history route case
- `src/components/Reports.tsx` - Integrated charts and export buttons
- `package.json` - Added recharts dependency

**Files Created:**
- `src/components/FootprintHistory.tsx` (367 lines)
- `src/components/EmissionsCharts.tsx` (297 lines)
- `src/utils/exportUtils.ts` (153 lines)

**Testing Status:**
- ✅ TypeScript compilation successful
- ✅ All components render without errors
- ⏳ Pending: End-to-end testing in production deployment

**Deployment:**
- All changes committed and pushed to main branch
- Vercel will auto-deploy frontend updates
- Backend already has required API endpoints

---

**End of Implementation Guide**

For questions or contributions, please open an issue or discussion on GitHub.
