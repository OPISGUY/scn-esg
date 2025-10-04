# Alpha Test Guide: Account Creation & User Flows

**Date**: October 4, 2025  
**Version**: Alpha v1.0  
**Status**: ✅ Ready for Testing

## Overview

This guide covers the complete user journey for alpha testers, from account creation through using the platform. Both demo accounts and standard user accounts are fully functional and ready for testing.

---

## Quick Start Options

### Option 1: Demo Account (Instant Access)
**Best for**: Quick platform exploration with pre-populated data

**Credentials**:
- **Email**: `demo@scn.com`
- **Password**: `Demo1234!`

**What you get**:
- ✅ Instant access (no onboarding required)
- ✅ Pre-populated carbon footprint data (1357.8 tCO₂e total)
- ✅ Sample reports and analytics
- ✅ Full feature access for testing

**Login URL**: Your deployed frontend URL

---

### Option 2: Create New Account (Full Flow)
**Best for**: Testing the complete registration and onboarding process

**What you'll experience**:
1. Multi-step registration wizard
2. Email validation and password requirements
3. Company setup and onboarding
4. Clean slate to test data entry from scratch

---

## Complete User Journey

### 1. Account Registration Flow

#### Step 1: Create Account (Email & Password)
**What you'll do**:
- Enter your email address
- Create a password meeting requirements
- Confirm password

**Password Requirements**:
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter  
- ✅ At least one number
- ⚠️ Example valid password: `TestUser123`

**Validation**:
- Real-time email format validation
- Password strength indicator
- Immediate error feedback

#### Step 2: Personal Details
**What you'll provide**:
- First name
- Last name

**Notes**:
- Both fields are required
- Used for personalized dashboard greetings

#### Step 3: Company Information
**What you'll setup**:
- Company name (required)
- Industry selection (dropdown)
- Company size (dropdown)

**Industry Options**:
- Technology
- Manufacturing
- Healthcare
- Finance
- Retail
- Education
- Energy
- Transportation
- Construction
- Agriculture
- Other

**Company Size Options**:
- 1-10 employees
- 11-50 employees
- 51-200 employees
- 201-1000 employees
- 1000+ employees

#### Step 4: Role Selection
**Available Roles**:

1. **Administrator** 🛡️
   - Full system access and user management
   - Permissions: User Management, System Settings, All Reports, Data Export

2. **Sustainability Manager** 🌿 (Recommended for testing)
   - Data entry and comprehensive reporting
   - Permissions: Carbon Tracking, E-waste Management, Report Generation, Compliance

3. **Decision Maker** 📊
   - Strategic insights and executive reports
   - Permissions: Executive Dashboard, Analytics, Strategic Reports, ROI Metrics

4. **Viewer** 👁️
   - Read-only access to reports and dashboards
   - Permissions: View Dashboard, Read Reports, Basic Analytics

**Terms Agreement**:
- ✅ Must agree to terms to complete registration

#### What Happens After Registration
1. Account is created immediately
2. JWT tokens stored in browser
3. User is logged in automatically
4. Redirected to onboarding wizard

---

### 2. Onboarding Wizard Flow

After registration, new users complete a 6-step onboarding process:

#### Step 1: Welcome Screen
**Purpose**: Introduction and expectations
**What you see**:
- Personalized greeting with your first name
- Overview of setup process
- Benefits you'll receive (customized dashboard, compliance frameworks, benchmarks, AI insights)

#### Step 2: Company Information
**What you'll provide**:
- Company name (pre-filled from registration)
- Industry (pre-filled from registration)
- Company size (dropdown)
- Location (country/region)
- Website (optional)

**Company Size Conversions**:
The system converts your selection to employee count:
- 1-10 → 5 employees
- 11-50 → 30 employees
- 51-200 → 125 employees
- 201-500 → 350 employees
- 501-1000 → 750 employees
- 1000+ → 1500 employees

#### Step 3: Sustainability Goals
**What you'll select** (multi-select):
- Net Zero by 2030
- Net Zero by 2040
- Net Zero by 2050
- Reduce emissions by X%
- CSRD/ESRS compliance
- Carbon neutral operations
- Circular economy
- Renewable energy transition
- Sustainable supply chain
- Other (custom)

**Requirements**: Select at least one goal

#### Step 4: Reporting Requirements
**What you'll select** (multi-select):
- GHG Protocol
- CSRD (Corporate Sustainability Reporting Directive)
- ESRS (European Sustainability Reporting Standards)
- CDP (Carbon Disclosure Project)
- TCFD (Task Force on Climate-related Financial Disclosures)
- SASB (Sustainability Accounting Standards Board)
- GRI (Global Reporting Initiative)
- ISO 14064
- Science Based Targets
- Custom internal reporting
- None yet

**Requirements**: Select at least one requirement

#### Step 5: Current Challenges
**What you'll identify** (multi-select):
- Data collection difficulties
- Lack of expertise
- Budget constraints
- Complex regulations
- Supply chain visibility
- Stakeholder engagement
- Setting realistic targets
- Measuring Scope 3
- Technology gaps
- Other (custom)

**Requirements**: Select at least one challenge

#### Step 6: Setup Complete
**What happens**:
- Summary of your selections displayed
- Company profile created in backend
- User associated with company
- `is_onboarding_complete` flag set to `true`
- Automatic redirect to dashboard

**Backend Processing**:
```json
{
  "company_name": "Your Company Ltd",
  "industry": "Technology",
  "employees": 125,
  "sustainability_goals": ["Net Zero by 2030", "CSRD compliance"],
  "reporting_requirements": ["GHG Protocol", "CSRD", "ESRS"],
  "challenges": ["Data collection difficulties", "Measuring Scope 3"]
}
```

---

### 3. Post-Onboarding Experience

#### What Standard Users See
After completing onboarding, you'll have:

✅ **Clean Dashboard**
- No pre-populated data (unlike demo account)
- Welcome message with your name
- Empty state cards prompting first actions
- Quick action buttons to get started

✅ **Empty States with Guidance**
- **My Data Tab**: "No footprints yet. Click 'Calculate Footprint' to get started."
- **Footprint History**: "Your footprint history will appear here."
- **Smart Data Entry**: Ready to accept first conversational input
- **Carbon Calculator**: Empty form, ready for first calculation

✅ **All Features Available**
- Carbon Calculator (pre-population disabled for new users)
- Smart Data Entry (AI-powered conversational input)
- E-waste Tracker
- Carbon Offset Marketplace
- Reports & Analytics
- CSRD Compliance tools
- AI Insights

#### Creating Your First Footprint

**Option A: Carbon Calculator** (Recommended)
1. Navigate to "Calculator" tab
2. Fill in GHG Protocol compliant form:
   - Company name (pre-filled)
   - Reporting period (e.g., "2024")
   - Number of employees
   - Annual revenue
   - Scope 1 inputs (natural gas, heating oil, company vehicles)
   - Scope 2 inputs (electricity consumption, region)
   - Scope 3 inputs (business travel, commuting, waste)
3. Click "Calculate Emissions"
4. Review results showing scope breakdown
5. Click "Save Footprint" to persist data

**Option B: Smart Data Entry** (AI-Powered)
1. Navigate to "Smart Data Entry" tab
2. Type natural language like:
   - "We used 5000 kWh of electricity last month"
   - "Our fleet drove 10,000 miles this quarter"
   - "We generated 2 tons of waste"
3. AI extracts emissions data and suggests updates
4. Accept or reject AI suggestions
5. See live preview update in real-time
6. Data automatically saves

**Option C: Import Data** (Bulk Upload)
1. Navigate to "Import Data" tab
2. Download CSV template
3. Fill with your data
4. Upload CSV file
5. Review import preview
6. Confirm import to create footprints

---

### 4. Data Persistence & LocalStorage

#### How Demo Mode Works
**Demo Account (`demo@scn.com`)**:
- ✅ Auto-seeded with mockCarbonFootprint in localStorage
- ✅ Shows 1357.8 tCO₂e total (125.5 scope1, 340.2 scope2, 892.1 scope3)
- ✅ Fallback data ensures demo always shows populated UI
- ✅ API data takes precedence when available

#### How Standard Users Work
**New Registered Users**:
- ❌ NO auto-seeded demo data
- ✅ Clean localStorage on registration
- ✅ Empty states until first footprint created
- ✅ localStorage fallback only triggers if they manually save data

#### Three-Tier Data Loading Strategy
All components use this fallback pattern:

1. **Primary**: Try API (`carbonService.getFootprints()`)
2. **Secondary**: Fall back to localStorage (`localStorage.getItem('carbonFootprint')`)
3. **Tertiary**: Show empty state or temp data

**Components with Fallback**:
- ✅ UserDashboard (My Data tab)
- ✅ FootprintHistory
- ✅ ConversationalDataEntry (Smart Data Entry)
- ✅ LiveFootprintPreview
- ✅ CarbonCalculator (pre-population)

---

## Alpha Testing Checklist

### Registration Flow Testing
- [ ] Create account with valid email and strong password
- [ ] Verify password requirements are enforced
- [ ] Test email format validation
- [ ] Verify password confirmation matching
- [ ] Check that all form fields have proper labels
- [ ] Test "Back to login" navigation
- [ ] Verify error messages are clear and helpful

### Onboarding Testing
- [ ] Complete all 6 onboarding steps
- [ ] Test "Previous" button navigation
- [ ] Verify field validation (required fields marked)
- [ ] Test multi-select for goals, requirements, challenges
- [ ] Ensure "Continue" button disabled when fields incomplete
- [ ] Verify company data persists to backend
- [ ] Check automatic redirect to dashboard after completion

### Dashboard Testing (Standard User)
- [ ] Verify clean dashboard with no demo data
- [ ] Check that empty states show helpful guidance
- [ ] Test "Calculate Footprint" button works
- [ ] Verify navigation to all main tabs
- [ ] Check user name appears in greetings

### Data Entry Testing
- [ ] Create first footprint using Carbon Calculator
- [ ] Verify calculations are accurate (GHG Protocol)
- [ ] Test Save Footprint persists to API and localStorage
- [ ] Check that My Data tab now shows the footprint
- [ ] Verify Footprint History displays saved footprint
- [ ] Test Smart Data Entry conversational input
- [ ] Verify AI extraction and confidence scores

### Demo Account Testing
- [ ] Login with `demo@scn.com` / `Demo1234!`
- [ ] Verify pre-populated data shows 1357.8 tCO₂e
- [ ] Check My Data tab has footprint displayed
- [ ] Test Footprint History shows Tech Solutions Ltd entry
- [ ] Verify Smart Data Entry preview has actual values (not zeros)
- [ ] Test all features with demo data

### Persistence Testing
- [ ] Create footprint, refresh page, verify data persists
- [ ] Test localStorage fallback (go offline, refresh)
- [ ] Clear localStorage, verify empty states return
- [ ] Test sync between localStorage and API

### Error Handling Testing
- [ ] Try registering with existing email
- [ ] Test invalid password formats
- [ ] Try completing onboarding without required fields
- [ ] Test network errors during registration
- [ ] Verify friendly error messages appear

---

## Common Issues & Solutions

### Issue: "Registration failed"
**Causes**:
- Email already exists in database
- Backend API not responding
- Network connectivity issues

**Solutions**:
1. Try a different email address
2. Check backend logs for error details
3. Verify API endpoints are accessible
4. Check CORS settings if frontend/backend on different domains

### Issue: Onboarding won't complete
**Causes**:
- Missing required fields
- Authentication token expired
- Backend company creation fails

**Solutions**:
1. Ensure all required fields filled
2. Check browser console for 401 errors
3. Try logging out and back in
4. Verify backend `/api/v1/users/auth/complete-onboarding/` endpoint

### Issue: Empty dashboard after onboarding
**Causes**:
- This is expected for new users!
- No footprint data created yet

**Solutions**:
1. Click "Calculate Footprint" to create first footprint
2. Use Smart Data Entry to add conversational data
3. Import CSV data via Import Data tab

### Issue: Demo account not showing data
**Causes**:
- localStorage was cleared
- Demo data initialization failed

**Solutions**:
1. Refresh the page (demo data auto-seeds)
2. Check browser console for initialization log
3. Manually run: `localStorage.setItem('carbonFootprint', JSON.stringify({...}))`

### Issue: Can't log in after registration
**Causes**:
- Email not verified (if verification enabled)
- Token not stored properly

**Solutions**:
1. Check email for verification link
2. Try "Forgot Password" flow
3. Check browser localStorage for access_token
4. Contact admin to manually verify account

---

## Backend Requirements for Alpha Test

### Database
- ✅ PostgreSQL or SQLite configured
- ✅ Migrations run successfully
- ✅ Demo users seeded (optional but recommended)

### Environment Variables
```bash
# Required
DJANGO_SECRET_KEY=<secret>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=yourdomain.com
DJANGO_CORS_ALLOWED_ORIGINS=https://yourfrontend.com

# Optional (for demo data)
ENABLE_DEMO_USERS=True
RESET_DEMO_PASSWORDS=True

# AI Features (if testing AI Insights)
GOOGLE_AI_API_KEY=<your-gemini-key>
```

### API Endpoints Required
- ✅ `/api/v1/users/auth/register/` - User registration
- ✅ `/api/v1/users/auth/login/` - User login
- ✅ `/api/v1/users/auth/profile/` - Get user profile
- ✅ `/api/v1/users/auth/complete-onboarding/` - Complete onboarding
- ✅ `/api/v1/carbon/footprints/` - CRUD for carbon footprints
- ✅ `/api/v1/companies/` - Company management

---

## Frontend Configuration

### Environment Variables
```bash
# Frontend .env
VITE_API_URL=https://your-backend.com
VITE_BACKEND_URL=https://your-backend.com
```

### Browser Requirements
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- LocalStorage enabled
- Cookies enabled (for JWT tokens)

---

## Test User Scenarios

### Scenario 1: First-Time User (Standard Flow)
**Persona**: Sarah, Sustainability Manager at TechCorp
**Goal**: Set up account and track first carbon footprint

**Steps**:
1. Visit platform URL
2. Click "Sign Up"
3. Complete 4-step registration with email `sarah@techcorp.com`
4. Select "Sustainability Manager" role
5. Complete 6-step onboarding with TechCorp details
6. Navigate to Carbon Calculator
7. Enter TechCorp's emissions data for Q1 2024
8. Save footprint
9. View results in My Data tab
10. Generate first report

**Expected**: Clean experience, no demo data, successful footprint creation

---

### Scenario 2: Quick Demo User
**Persona**: Alex, Executive evaluating platform
**Goal**: Quickly see platform capabilities with pre-populated data

**Steps**:
1. Login with `demo@scn.com` / `Demo1234!`
2. Immediately see populated dashboard
3. Review existing footprint: 1357.8 tCO₂e
4. Navigate through all tabs
5. Generate PDF report
6. Test AI Insights
7. Purchase carbon offsets

**Expected**: Instant access to all features with sample data

---

### Scenario 3: Multi-User Company Setup
**Persona**: Multiple users from same company
**Goal**: Test team collaboration and data sharing

**Steps**:
1. User A registers as admin with `admin@company.com`
2. User A completes onboarding with "Acme Corp"
3. User A creates first footprint
4. User B registers with `manager@company.com` (same company during onboarding)
5. User B should see same company data
6. Test permissions and access controls

**Expected**: Proper company association, data sharing works

---

## Success Metrics

### Registration Flow
- ✅ Account created in < 2 minutes
- ✅ Validation errors clear and helpful
- ✅ Email confirmation sent (if enabled)
- ✅ Automatic login after registration

### Onboarding Flow
- ✅ Completed in < 5 minutes
- ✅ Company profile created successfully
- ✅ User redirected to dashboard
- ✅ All selections saved to backend

### First Footprint
- ✅ Footprint created within 10 minutes of onboarding
- ✅ Data persists across page refreshes
- ✅ Appears in My Data and History tabs
- ✅ Can generate report from footprint

### Overall Experience
- ✅ No crashes or unhandled errors
- ✅ All buttons and navigation work
- ✅ Error messages are user-friendly
- ✅ Data loads quickly (< 3 seconds)
- ✅ Mobile responsive (if testing mobile)

---

## Known Limitations (Alpha)

### Current Constraints
- ⚠️ Email verification flow exists but may not be configured
- ⚠️ Password reset requires email service setup
- ⚠️ User profile editing limited during alpha
- ⚠️ Company switching not yet implemented
- ⚠️ Bulk user invites not available

### Future Enhancements
- 📋 Email verification enforcement
- 📋 Advanced user permissions
- 📋 Multi-company support for users
- 📋 Team collaboration features
- 📋 Audit logs for all actions
- 📋 Advanced analytics and custom reports

---

## Support & Feedback

### Reporting Issues
When reporting bugs, please include:
1. **User type**: Demo or standard registered user
2. **Browser**: Chrome/Firefox/Safari + version
3. **Steps to reproduce**: What you did before the issue
4. **Expected behavior**: What should have happened
5. **Actual behavior**: What actually happened
6. **Screenshots**: If visual issue
7. **Console errors**: Open DevTools > Console, copy errors

### Example Bug Report
```
User Type: Standard registered user
Browser: Chrome 118.0
Steps:
1. Completed registration as admin@test.com
2. Finished onboarding with "Test Corp"
3. Clicked "Calculate Footprint"
4. Filled all fields and clicked "Calculate Emissions"

Expected: Emissions calculated and displayed
Actual: Form submitted but no results shown
Console Error: "TypeError: Cannot read property 'total' of undefined"
```

---

## Conclusion

The SCN ESG Platform is **ready for alpha testing** with two complete user flows:

1. ✅ **Demo Account**: Instant access with pre-populated data for quick evaluation
2. ✅ **Standard Registration**: Full onboarding flow with clean slate for testing data entry

### Key Testing Focus Areas
- Registration and onboarding completion
- First footprint creation experience
- Data persistence across sessions
- Error handling and recovery
- Demo vs. standard user experiences

### Ready for Production?
**Not yet.** Alpha testing should reveal:
- Edge cases in data validation
- Performance issues with real data volumes
- UX friction points in onboarding
- Missing features users expect

**After alpha feedback**, we'll iterate toward beta and production releases.

---

**Happy Testing!** 🚀🌿📊
