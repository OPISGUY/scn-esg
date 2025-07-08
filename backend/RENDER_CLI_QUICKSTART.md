# Render CLI Quick Setup Guide

## 🚀 QUICK FIX FOR AUTHENTICATION (5 minutes)

### Step 1: Install Render CLI (Correct Package)

The package name is just `render-cli`, not `@render/cli`:

```bash
npm install -g render-cli
```

**Alternative installation methods:**
```bash
# If npm fails, download binary directly:
# Windows:
curl -L https://github.com/render-oss/render-cli/releases/latest/download/render-cli-windows-amd64.exe -o render.exe

# macOS:
curl -L https://github.com/render-oss/render-cli/releases/latest/download/render-cli-macos -o render
chmod +x render

# Linux:
curl -L https://github.com/render-oss/render-cli/releases/latest/download/render-cli-linux -o render
chmod +x render
```

### Step 2: Login to Render

```bash
render login
```
This will open a browser window to authenticate.

### Step 3: Find Your Service

```bash
render services list
```
Look for your backend service (probably named `scn-esg-backend` or similar).

### Step 4: Create Test Users

```bash
# Replace 'your-service-name' with your actual service name
render shell your-service-name
```

Then in the shell, run:
```bash
python manage.py shell
```

And execute this Python code:
```python
from django.contrib.auth import get_user_model
from companies.models import Company

User = get_user_model()

# Create companies
test_company, _ = Company.objects.get_or_create(
    name='Test Company Ltd',
    defaults={'industry': 'Technology', 'employees': 50}
)

business_company, _ = Company.objects.get_or_create(
    name='Green Corp Solutions',
    defaults={'industry': 'Environmental Services', 'employees': 100}
)

# Create admin user
if not User.objects.filter(email='admin@scn.com').exists():
    admin = User.objects.create_user(
        username='admin@scn.com',
        email='admin@scn.com', 
        password='admin123',
        first_name='Admin',
        last_name='User',
        is_staff=True,
        is_superuser=True
    )
    admin.is_email_verified = True
    admin.save()
    print("✅ Admin user created: admin@scn.com / admin123")

# Create test user
if not User.objects.filter(email='test@scn.com').exists():
    test = User.objects.create_user(
        username='test@scn.com',
        email='test@scn.com',
        password='test123', 
        first_name='Test',
        last_name='User',
        company=test_company
    )
    test.is_email_verified = True
    test.save()
    print("✅ Test user created: test@scn.com / test123")

# Create business user
if not User.objects.filter(email='business@scn.com').exists():
    business = User.objects.create_user(
        username='business@scn.com',
        email='business@scn.com',
        password='business123',
        first_name='Business', 
        last_name='Manager',
        company=business_company
    )
    business.is_email_verified = True
    business.save()
    print("✅ Business user created: business@scn.com / business123")

print(f"Total users: {User.objects.count()}")
exit()
```

### Step 5: Test Authentication

Exit the shell and run:
```bash
python test_render_auth_fix.py
```

### Step 6: Update Vercel Environment Variables

If authentication works, update your Vercel environment variables:

```
VITE_API_URL=https://scn-esg-backend.onrender.com
```

## 🎯 Alternative: Quick API Test

If Render CLI doesn't work, run this to test/create users via API:

```bash
python deploy_test_users_render.py
```

## 🔧 If Users Already Exist

Test with existing credentials:
- **Email:** admin@scn.com **Password:** admin123
- **Email:** test@scn.com **Password:** test123  
- **Email:** business@scn.com **Password:** business123

## 📋 Troubleshooting

### If CLI installation fails:
1. Download binary from: https://github.com/render-oss/render-cli/releases
2. Add to PATH
3. Use `./render` instead of `render`

### If shell access fails:
1. Use the API method: `python deploy_test_users_render.py`
2. Check Render service logs for errors
3. Verify service is running

### If authentication still fails:
1. Check CORS settings in Django
2. Verify Render service URL is correct
3. Test endpoints manually with curl

## ✅ Success Indicators

You'll know it's working when:
1. `render services list` shows your backend
2. `python test_render_auth_fix.py` shows ✅ LOGIN SUCCESSFUL
3. Frontend can login with the test credentials

## 🎉 Final Step

Once authentication works:
1. Update Vercel env vars: `VITE_API_URL=https://your-render-url.onrender.com`
2. Test frontend login
3. Your authentication should work perfectly!
