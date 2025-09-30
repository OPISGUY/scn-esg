# Render CLI Setup Guide for SCN ESG Platform

## 🚀 Quick Start - Fix Authentication in 5 Minutes

### Step 1: Install Render CLI

```bash
# Option 1: Using npm (recommended)
npm install -g @render/cli

# Option 2: Using yarn
yarn global add @render/cli

# Option 3: Download binary from https://render.com/docs/cli
```

### Step 2: Login to Render

```bash
render auth login
```

### Step 3: Find Your Service

```bash
render services list
```

Find your backend service name (e.g., `scn-esg-backend`)

### Step 4: Create Test Users on Render

Replace `YOUR_SERVICE_NAME` with your actual service name:

```bash
# Create admin user
render exec YOUR_SERVICE_NAME -- python manage.py shell -c "
from django.contrib.auth import get_user_model;
from companies.models import Company;
User = get_user_model();
if not User.objects.filter(email='admin@scn.com').exists():
    admin = User.objects.create_user(
        username='admin@scn.com',
        email='admin@scn.com', 
        password='admin123',
        first_name='Admin',
        last_name='User',
        is_staff=True,
        is_superuser=True
    );
    admin.is_email_verified = True;
    admin.save();
    print('✅ Admin user created: admin@scn.com / admin123')
else:
    print('Admin user already exists')
"

# Create test company and user
render exec YOUR_SERVICE_NAME -- python manage.py shell -c "
from django.contrib.auth import get_user_model;
from companies.models import Company;
User = get_user_model();
company, created = Company.objects.get_or_create(
    name='Test Company Ltd',
    defaults={'industry': 'Technology', 'employees': 50}
);
if not User.objects.filter(email='test@scn.com').exists():
    user = User.objects.create_user(
        username='test@scn.com',
        email='test@scn.com',
        password='test123', 
        first_name='Test',
        last_name='User',
        company=company
    );
    user.is_email_verified = True;
    user.save();
    print('✅ Test user created: test@scn.com / test123')
else:
    print('Test user already exists')
"

# Verify users were created
render exec YOUR_SERVICE_NAME -- python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
print(f'Total users: {User.objects.count()}');
for user in User.objects.all():
    print(f'- {user.email} (verified: {user.is_email_verified})')
"
```

### Step 5: Get Your Service URL

```bash
render services get YOUR_SERVICE_NAME
```

Look for the URL (should be like `https://YOUR_SERVICE_NAME.onrender.com`)

### Step 6: Update Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Update or add:
```
VITE_API_URL=https://YOUR_SERVICE_NAME.onrender.com
```

Then redeploy your Vercel frontend.

### Step 7: Test Authentication

Use these credentials to test login on your Vercel frontend:

```
Email: admin@scn.com
Password: admin123

Email: test@scn.com  
Password: test123
```

## 🔧 Troubleshooting Commands

### Check Render Logs
```bash
render logs YOUR_SERVICE_NAME
```

### Run Django Migrations
```bash
render exec YOUR_SERVICE_NAME -- python manage.py migrate
```

### Open Django Shell
```bash
render exec YOUR_SERVICE_NAME -- python manage.py shell
```

### Check Database Status
```bash
render exec YOUR_SERVICE_NAME -- python manage.py dbshell -c "SELECT COUNT(*) FROM auth_user;"
```

## 🎯 Expected Results

After running these commands, you should have:

1. ✅ Admin user: `admin@scn.com` / `admin123`
2. ✅ Test user: `test@scn.com` / `test123`  
3. ✅ Updated Vercel environment variables
4. ✅ Working authentication between Vercel frontend and Render backend

## 📞 Need Help?

If authentication still fails after these steps:

1. Check Render service logs for errors
2. Verify CORS settings in Django settings
3. Test API endpoints directly using curl or Postman
4. Check browser network tab for CORS or network errors

Your authentication should now work! 🎉
