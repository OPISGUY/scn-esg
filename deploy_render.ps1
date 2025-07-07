# 🚀 RENDER DEPLOYMENT SCRIPT
# Automated deployment configuration for ESG Platform

Write-Host "🔧 Setting up Render deployment..." -ForegroundColor Green

# Step 1: Verify files exist
$requiredFiles = @(
    "backend/requirements.txt",
    "backend/manage.py", 
    "render.yaml",
    ".env.render"
)

Write-Host "📋 Checking required files..." -ForegroundColor Yellow
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file - MISSING!" -ForegroundColor Red
    }
}

# Step 2: Display deployment configuration
Write-Host "`n🔧 RENDER DEPLOYMENT CONFIGURATION" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

Write-Host "`n📝 Web Service Settings:" -ForegroundColor Yellow
Write-Host "  Name: scn-esg-backend"
Write-Host "  Environment: Python 3"
Write-Host "  Region: Oregon (US West)"
Write-Host "  Branch: main"
Write-Host "  Root Directory: backend"

Write-Host "`n⚙️ Build & Start Commands:" -ForegroundColor Yellow
Write-Host "  Build: pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate"
Write-Host "  Start: gunicorn scn_esg_platform.wsgi:application --host 0.0.0.0 --port `$PORT"

Write-Host "`n🔐 Environment Variables to Set in Render:" -ForegroundColor Yellow
Get-Content ".env.render" | ForEach-Object {
    if ($_ -match "^[A-Z_]+=.+") {
        $parts = $_ -split "=", 2
        $key = $parts[0]
        $value = if ($parts[1].Length -gt 20) { $parts[1].Substring(0, 20) + "..." } else { $parts[1] }
        Write-Host "  $key=$value"
    }
}

Write-Host "`n🗃️ Database Setup:" -ForegroundColor Yellow
Write-Host "  1. Create PostgreSQL database in Render"
Write-Host "  2. Copy 'Internal Database URL' to DATABASE_URL env var"
Write-Host "  3. Database will be automatically migrated on deployment"

Write-Host "`n🚀 NEXT STEPS:" -ForegroundColor Green
Write-Host "=============" -ForegroundColor Green
Write-Host "1. Go to render.com and sign up"
Write-Host "2. Connect your GitHub repository"
Write-Host "3. Create a new Web Service with the settings above"
Write-Host "4. Create a PostgreSQL database and link it"
Write-Host "5. Set the environment variables from .env.render"
Write-Host "6. Deploy and test!"

Write-Host "`n💡 Your backend will be available at:" -ForegroundColor Cyan
Write-Host "   https://scn-esg-backend.onrender.com" -ForegroundColor White

Write-Host "`n🔗 Don't forget to update your Vercel frontend:" -ForegroundColor Yellow
Write-Host "   VITE_API_URL=https://scn-esg-backend.onrender.com" -ForegroundColor White
