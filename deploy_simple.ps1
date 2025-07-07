param(
    [Parameter(Mandatory=$true)]
    [string]$GoogleAIKey
)

Write-Host "Starting SCN ESG Platform deployment..." -ForegroundColor Green

# Generate Django secret key
$DjangoSecretKey = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))

# Backend deployment
Write-Host "Deploying backend to Railway..." -ForegroundColor Blue
Set-Location backend

Write-Host "Logging into Railway..." -ForegroundColor Yellow
railway login

Write-Host "Linking Railway project..." -ForegroundColor Yellow
railway link

Write-Host "Setting environment variables..." -ForegroundColor Yellow
railway variables set DJANGO_SECRET_KEY="$DjangoSecretKey"
railway variables set DJANGO_DEBUG="False"
railway variables set GOOGLE_AI_API_KEY="$GoogleAIKey"

Write-Host "Adding PostgreSQL database..." -ForegroundColor Yellow
railway add postgresql

Write-Host "Deploying backend..." -ForegroundColor Yellow
railway up --detach

Write-Host "Waiting for deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "Running migrations..." -ForegroundColor Yellow
railway run python manage.py migrate
railway run python manage.py collectstatic --noinput

# Get backend URL
$BackendUrl = (railway status --json | ConvertFrom-Json).deployments[0].url
Write-Host "Backend deployed to: $BackendUrl" -ForegroundColor Green

# Frontend deployment
Write-Host "Deploying frontend to Vercel..." -ForegroundColor Blue
Set-Location ..

Write-Host "Logging into Vercel..." -ForegroundColor Yellow
vercel login

Write-Host "Setting environment variables..." -ForegroundColor Yellow
$BackendUrl | vercel env add VITE_API_URL production
"SCN ESG Platform" | vercel env add VITE_APP_NAME production
"production" | vercel env add VITE_ENVIRONMENT production

Write-Host "Deploying frontend..." -ForegroundColor Yellow
$FrontendUrl = vercel --prod --confirm

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Backend: $BackendUrl" -ForegroundColor Cyan
Write-Host "Frontend: $FrontendUrl" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test your application" -ForegroundColor White
Write-Host "2. Create superuser: railway run python manage.py createsuperuser" -ForegroundColor White
