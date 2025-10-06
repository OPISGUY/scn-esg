# Quick Start Test Script
# Run this to verify Stripe configuration

Write-Host "🔍 SCN ESG Stripe Configuration Check" -ForegroundColor Cyan
Write-Host "=" * 50

# Check frontend .env
Write-Host "`n📋 Checking Frontend Configuration..." -ForegroundColor Yellow
$frontendEnv = Get-Content ".env" -ErrorAction SilentlyContinue
if ($frontendEnv -match "VITE_STRIPE_PUBLISHABLE_KEY=pk_test") {
    Write-Host "✅ Frontend Stripe key configured" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend Stripe key missing!" -ForegroundColor Red
}

if ($frontendEnv -match "VITE_API_URL") {
    $apiUrl = ($frontendEnv | Select-String "VITE_API_URL=(.*)").Matches.Groups[1].Value
    Write-Host "✅ API URL: $apiUrl" -ForegroundColor Green
} else {
    Write-Host "❌ API URL not configured!" -ForegroundColor Red
}

# Check backend .env
Write-Host "`n📋 Checking Backend Configuration..." -ForegroundColor Yellow
$backendEnv = Get-Content "backend\.env" -ErrorAction SilentlyContinue
if ($backendEnv -match "STRIPE_SECRET_KEY=sk_test") {
    Write-Host "✅ Backend Stripe secret key configured" -ForegroundColor Green
} else {
    Write-Host "❌ Backend Stripe secret key missing!" -ForegroundColor Red
}

if ($backendEnv -match "STRIPE_WEBHOOK_SECRET=whsec_") {
    Write-Host "✅ Webhook secret configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  Webhook secret not yet configured (will need Stripe CLI)" -ForegroundColor Yellow
}

# Check if Stripe CLI is installed
Write-Host "`n🔧 Checking Stripe CLI..." -ForegroundColor Yellow
try {
    $stripeVersion = stripe --version 2>&1
    Write-Host "✅ Stripe CLI installed: $stripeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Stripe CLI not found!" -ForegroundColor Red
    Write-Host "   Install with: winget install stripe.stripe-cli" -ForegroundColor Gray
}

# Check if ports are available
Write-Host "`n🔌 Checking Ports..." -ForegroundColor Yellow
$port8000 = Test-NetConnection -ComputerName localhost -Port 8000 -WarningAction SilentlyContinue -InformationLevel Quiet
$port5173 = Test-NetConnection -ComputerName localhost -Port 5173 -WarningAction SilentlyContinue -InformationLevel Quiet

if (-not $port8000) {
    Write-Host "✅ Port 8000 available (Backend)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Port 8000 in use (Backend already running?)" -ForegroundColor Yellow
}

if (-not $port5173) {
    Write-Host "✅ Port 5173 available (Frontend)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Port 5173 in use (Frontend already running?)" -ForegroundColor Yellow
}

# Summary
Write-Host "`n" + "=" * 50
Write-Host "📊 Configuration Summary" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ = Ready to use"
Write-Host "⚠️  = Needs attention (but won't block basic testing)"
Write-Host "❌ = Must fix before testing"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start Backend:  cd backend; python manage.py runserver"
Write-Host "2. Start Frontend: npm run dev"
Write-Host "3. Open Browser:   http://localhost:5173"
Write-Host "4. Test Payment:   Use card 4242 4242 4242 4242"
Write-Host ""
Write-Host "For webhook testing (optional):"
Write-Host "5. Run: stripe listen --forward-to http://localhost:8000/api/v1/webhooks/stripe/"
Write-Host "6. Copy the whsec_... secret to backend/.env"
Write-Host "7. Restart backend server"
Write-Host ""
Write-Host "📖 Full guide: STRIPE_TESTING_GUIDE.md" -ForegroundColor Cyan
