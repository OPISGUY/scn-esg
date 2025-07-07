# SCN ESG Platform - PowerShell Deployment Script
# Run this script to deploy both frontend and backend

param(
    [Parameter(Mandatory=$true)]
    [string]$GoogleAIKey,
    
    [Parameter(Mandatory=$false)]
    [string]$DjangoSecretKey = ""
)

Write-Host "🚀 Starting SCN ESG Platform deployment..." -ForegroundColor Green

# Generate Django secret key if not provided
if ([string]::IsNullOrEmpty($DjangoSecretKey)) {
    $DjangoSecretKey = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))
    Write-Host "✅ Generated Django secret key" -ForegroundColor Yellow
}

# Check if CLI tools are installed
Write-Host "🔧 Checking CLI tools..." -ForegroundColor Blue
try {
    railway --version | Out-Null
    Write-Host "✅ Railway CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found. Install with: npm install -g @railway/cli" -ForegroundColor Red
    exit 1
}

try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Install with: npm install -g vercel" -ForegroundColor Red
    exit 1
}

# Backend deployment
Write-Host "`n📦 Deploying backend to Railway..." -ForegroundColor Blue
Set-Location backend

Write-Host "🔐 Logging into Railway..." -ForegroundColor Yellow
railway login

Write-Host "🔗 Linking Railway project..." -ForegroundColor Yellow
railway link

Write-Host "⚙️ Setting environment variables..." -ForegroundColor Yellow
railway variables set DJANGO_SECRET_KEY="$DjangoSecretKey"
railway variables set DJANGO_DEBUG="False"
railway variables set GOOGLE_AI_API_KEY="$GoogleAIKey"

Write-Host "🗄️ Adding PostgreSQL database..." -ForegroundColor Yellow
railway add postgresql

Write-Host "🚀 Deploying backend..." -ForegroundColor Yellow
railway up --detach

Write-Host "⏳ Waiting for deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "🔄 Running migrations..." -ForegroundColor Yellow
railway run python manage.py migrate
railway run python manage.py collectstatic --noinput
railway run python manage.py sync_esrs_datapoints --source=local

# Get backend URL
$BackendUrl = railway status --json | ConvertFrom-Json | Select-Object -ExpandProperty deployments | Select-Object -First 1 -ExpandProperty url
Write-Host "✅ Backend deployed to: $BackendUrl" -ForegroundColor Green

# Frontend deployment
Write-Host "`n🎨 Deploying frontend to Vercel..." -ForegroundColor Blue
Set-Location ..

Write-Host "🔐 Logging into Vercel..." -ForegroundColor Yellow
vercel login

Write-Host "⚙️ Setting environment variables..." -ForegroundColor Yellow
Write-Output $BackendUrl | vercel env add VITE_API_URL production
Write-Output "SCN ESG Platform" | vercel env add VITE_APP_NAME production
Write-Output "production" | vercel env add VITE_ENVIRONMENT production

Write-Host "🚀 Deploying frontend..." -ForegroundColor Yellow
$FrontendUrl = vercel --prod --confirm

Write-Host "`n🎉 Deployment complete!" -ForegroundColor Green
Write-Host "Backend:  $BackendUrl" -ForegroundColor Cyan
Write-Host "Frontend: $FrontendUrl" -ForegroundColor Cyan

Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Test your application at the frontend URL" -ForegroundColor White
Write-Host "2. Create a superuser: railway run python manage.py createsuperuser" -ForegroundColor White
Write-Host "3. Set up monitoring and custom domain" -ForegroundColor White
