# PowerShell build script for Render deployment (Windows development)
# This file is for reference - Render will use the bash version

Write-Host "🔧 Starting Render build process..." -ForegroundColor Green

# Navigate to backend directory
Set-Location backend

Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host "🗃️ Running database migrations..." -ForegroundColor Yellow
python manage.py migrate --noinput

Write-Host "📁 Collecting static files..." -ForegroundColor Yellow
python manage.py collectstatic --noinput

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
