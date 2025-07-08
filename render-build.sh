#!/bin/bash
# Render build script - handles the backend directory structure

echo "🔧 Starting Render build..."
echo "📍 Current directory: $(pwd)"
echo "📁 Directory contents:"
ls -la

echo "🚀 Navigating to backend directory..."
cd backend || { echo "❌ Backend directory not found!"; exit 1; }

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "🗃️ Running database migrations..."
python manage.py migrate --noinput

echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo "👤 Creating test users for login..."
python create_test_users.py

echo "✅ Build completed successfully!"
