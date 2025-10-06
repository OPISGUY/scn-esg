# Integration Setup Script
# Run this to quickly set up the integrations feature

Write-Host "🚀 SCN ESG Platform - Integrations Setup" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

# Check if backend directory exists
if (-not (Test-Path "backend")) {
    Write-Host "❌ Error: backend directory not found. Run this from project root." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Step 1: Installing Python dependencies..." -ForegroundColor Yellow
pip install cryptography requests

Write-Host "`n🔑 Step 2: Generating encryption key..." -ForegroundColor Yellow
$key = python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
Write-Host "Generated key: $key" -ForegroundColor Cyan
Write-Host "⚠️  SAVE THIS KEY - Add to your .env file as INTEGRATION_ENCRYPTION_KEY" -ForegroundColor Yellow

Write-Host "`n📝 Step 3: Running migrations..." -ForegroundColor Yellow
Set-Location backend
python manage.py makemigrations integrations
python manage.py migrate

Write-Host "`n🌱 Step 4: Seeding integration providers..." -ForegroundColor Yellow
python manage.py seed_integration_providers

Set-Location ..

Write-Host "`n✅ Setup Complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Add INTEGRATION_ENCRYPTION_KEY=$key to your .env file"
Write-Host "2. Get OAuth credentials from provider developer portals:"
Write-Host "   - Xero: https://developer.xero.com/myapps"
Write-Host "   - QuickBooks: https://developer.intuit.com"
Write-Host "   - Salesforce: Salesforce Setup → App Manager"
Write-Host "   - Slack: https://api.slack.com/apps"
Write-Host "3. Add OAuth credentials to .env (see INTEGRATIONS_GUIDE.md)"
Write-Host "4. Start Django server and visit /integrations"
Write-Host "`n📖 Full guide: INTEGRATIONS_GUIDE.md" -ForegroundColor Green
