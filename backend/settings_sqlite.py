# Quick SQLite settings for immediate deployment
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Use SQLite for development/testing
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Only use external database if DATABASE_URL is provided
if database_url := os.getenv('DATABASE_URL'):
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.parse(database_url, conn_max_age=600)
    }
