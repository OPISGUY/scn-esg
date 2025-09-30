# Railway Environment Variables Configuration

This file contains the essential environment variables you need to set in your Railway dashboard to fix the 502 errors.

## 🚨 CRITICAL: Go to Railway Dashboard > Your Project > Variables and set these:

### 1. Django Configuration
```
DJANGO_SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=scn-esg-production.up.railway.app,.up.railway.app,.railway.app
```

### 2. Database Configuration
Railway should automatically provide:
```
DATABASE_URL=postgresql://user:password@host:port/database
```
(This is automatically set by Railway when you add a PostgreSQL service)

### 3. CORS Configuration
```
DJANGO_CORS_ALLOWED_ORIGINS=https://scn-esg-platform-fhyfe3og6-opisguys-projects.vercel.app,https://scn-esg-platform.vercel.app
```

### 4. Port Configuration
Railway automatically sets:
```
PORT=8000
RAILWAY_ENVIRONMENT=production
```

## 🔧 Step-by-Step Fix Instructions:

### Step 1: Set Environment Variables
1. Go to your Railway dashboard
2. Click on your project
3. Go to "Variables" tab
4. Add each variable listed above

### Step 2: Add PostgreSQL Database
1. In Railway dashboard, click "New Service"
2. Select "Database" > "PostgreSQL"
3. This will automatically set the DATABASE_URL variable

### Step 3: Generate a Secret Key
Run this Python code to generate a secure secret key:
```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

### Step 4: Update Your Vercel Domain
Replace the Vercel URL in DJANGO_CORS_ALLOWED_ORIGINS with your actual deployed Vercel URL.

### Step 5: Redeploy
After setting all variables, trigger a new deployment in Railway.

## 🔍 Debugging Commands

After deployment, test your endpoints:

```bash
# Test health
curl https://scn-esg-production.up.railway.app/

# Test API
curl https://scn-esg-production.up.railway.app/api/v1/

# Test login endpoint
curl -X POST https://scn-esg-production.up.railway.app/api/v1/users/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword"}'
```

## 🚨 Common 502 Error Causes:

1. **Missing DATABASE_URL** - Add PostgreSQL service
2. **Missing SECRET_KEY** - Generate and add secure key
3. **Wrong ALLOWED_HOSTS** - Must include Railway domain
4. **DEBUG=True in production** - Set to False
5. **Database migration issues** - Check Railway logs

## 📋 Environment Variables Checklist:

- [ ] DJANGO_SECRET_KEY (long random string)
- [ ] DJANGO_DEBUG=False
- [ ] DJANGO_ALLOWED_HOSTS (includes Railway domain)
- [ ] DATABASE_URL (automatically set by PostgreSQL service)
- [ ] DJANGO_CORS_ALLOWED_ORIGINS (includes Vercel domain)
- [ ] PORT (automatically set by Railway)
- [ ] RAILWAY_ENVIRONMENT (automatically set by Railway)

Once all variables are set and you redeploy, your 502 errors should be resolved!
