# External Database Setup Guide

## 🎯 Option 1: Supabase (Recommended)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up and create new project
3. Choose region closest to your users
4. Set database password

### Step 2: Get Connection Details
```
Host: db.xxx.supabase.co
Database: postgres
Username: postgres
Password: [your-chosen-password]
Port: 5432
```

### Step 3: Update Render Environment Variables
```
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
```

## 🎯 Option 2: Neon Database

### Step 1: Create Neon Project
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create new project

### Step 2: Copy Connection String
```
DATABASE_URL=postgresql://[username]:[password]@[hostname]/[database]?sslmode=require
```

## 🎯 Option 3: SQLite (Development)

### Update Django Settings
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

## 💡 Recommendation

Start with **Supabase** - it's the most reliable free option:
- 500MB free storage
- Always-on (no sleep)
- Real PostgreSQL 
- Great for production

Would you like me to help set up any of these options?
