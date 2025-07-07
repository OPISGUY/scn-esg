#!/bin/bash
# SCN ESG Platform - Bash Deployment Script
# Run this script to deploy both frontend and backend

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    echo -e "${1}${2}${NC}"
}

# Check if Google AI API key is provided
if [ -z "$1" ]; then
    print_color $RED "❌ Error: Please provide your Google AI API key as the first argument"
    echo "Usage: ./deploy.sh YOUR_GOOGLE_AI_API_KEY [DJANGO_SECRET_KEY]"
    exit 1
fi

GOOGLE_AI_KEY="$1"
DJANGO_SECRET_KEY="${2:-$(openssl rand -base64 64)}"

print_color $GREEN "🚀 Starting SCN ESG Platform deployment..."

# Check if CLI tools are installed
print_color $BLUE "🔧 Checking CLI tools..."
if command -v railway &> /dev/null; then
    print_color $GREEN "✅ Railway CLI found"
else
    print_color $RED "❌ Railway CLI not found. Install with: npm install -g @railway/cli"
    exit 1
fi

if command -v vercel &> /dev/null; then
    print_color $GREEN "✅ Vercel CLI found"
else
    print_color $RED "❌ Vercel CLI not found. Install with: npm install -g vercel"
    exit 1
fi

# Backend deployment
print_color $BLUE "\n📦 Deploying backend to Railway..."
cd backend

print_color $YELLOW "🔐 Logging into Railway..."
railway login

print_color $YELLOW "🔗 Linking Railway project..."
railway link

print_color $YELLOW "⚙️ Setting environment variables..."
railway variables set DJANGO_SECRET_KEY="$DJANGO_SECRET_KEY"
railway variables set DJANGO_DEBUG="False"
railway variables set GOOGLE_AI_API_KEY="$GOOGLE_AI_KEY"

print_color $YELLOW "🗄️ Adding PostgreSQL database..."
railway add postgresql

print_color $YELLOW "🚀 Deploying backend..."
railway up --detach

print_color $YELLOW "⏳ Waiting for deployment..."
sleep 30

print_color $YELLOW "🔄 Running migrations..."
railway run python manage.py migrate
railway run python manage.py collectstatic --noinput
railway run python manage.py sync_esrs_datapoints --source=local

# Get backend URL
BACKEND_URL=$(railway status --json | jq -r '.deployments[0].url')
print_color $GREEN "✅ Backend deployed to: $BACKEND_URL"

# Frontend deployment
print_color $BLUE "\n🎨 Deploying frontend to Vercel..."
cd ..

print_color $YELLOW "🔐 Logging into Vercel..."
vercel login

print_color $YELLOW "⚙️ Setting environment variables..."
echo "$BACKEND_URL" | vercel env add VITE_API_URL production
echo "SCN ESG Platform" | vercel env add VITE_APP_NAME production
echo "production" | vercel env add VITE_ENVIRONMENT production

print_color $YELLOW "🚀 Deploying frontend..."
FRONTEND_URL=$(vercel --prod --confirm)

print_color $GREEN "\n🎉 Deployment complete!"
print_color $CYAN "Backend:  $BACKEND_URL"
print_color $CYAN "Frontend: $FRONTEND_URL"

print_color $YELLOW "\n📋 Next steps:"
print_color $WHITE "1. Test your application at the frontend URL"
print_color $WHITE "2. Create a superuser: railway run python manage.py createsuperuser"
print_color $WHITE "3. Set up monitoring and custom domain"

# Save URLs to file for reference
cat > deployment_urls.txt << EOF
SCN ESG Platform Deployment URLs
Generated: $(date)

Backend:  $BACKEND_URL
Frontend: $FRONTEND_URL

Django Admin: $BACKEND_URL/admin/
API Documentation: $BACKEND_URL/api/v1/

Environment Variables Used:
- DJANGO_SECRET_KEY: [HIDDEN]
- GOOGLE_AI_API_KEY: [HIDDEN]
- DJANGO_DEBUG: False

Next Steps:
1. Create superuser: railway run python manage.py createsuperuser
2. Test all functionality
3. Set up custom domain
4. Configure monitoring
EOF

print_color $GREEN "📄 Deployment URLs saved to deployment_urls.txt"
