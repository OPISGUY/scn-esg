#!/bin/bash
# Integration Setup Script (Unix/Mac)
# Run this to quickly set up the integrations feature

echo "🚀 SCN ESG Platform - Integrations Setup"
echo "========================================"
echo ""

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Error: backend directory not found. Run this from project root."
    exit 1
fi

echo "📦 Step 1: Installing Python dependencies..."
pip install cryptography requests

echo ""
echo "🔑 Step 2: Generating encryption key..."
KEY=$(python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
echo "Generated key: $KEY"
echo "⚠️  SAVE THIS KEY - Add to your .env file as INTEGRATION_ENCRYPTION_KEY"

echo ""
echo "📝 Step 3: Running migrations..."
cd backend
python manage.py makemigrations integrations
python manage.py migrate

echo ""
echo "🌱 Step 4: Seeding integration providers..."
python manage.py seed_integration_providers

cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Add INTEGRATION_ENCRYPTION_KEY=$KEY to your .env file"
echo "2. Get OAuth credentials from provider developer portals:"
echo "   - Xero: https://developer.xero.com/myapps"
echo "   - QuickBooks: https://developer.intuit.com"
echo "   - Salesforce: Salesforce Setup → App Manager"
echo "   - Slack: https://api.slack.com/apps"
echo "3. Add OAuth credentials to .env (see INTEGRATIONS_GUIDE.md)"
echo "4. Start Django server and visit /integrations"
echo ""
echo "📖 Full guide: INTEGRATIONS_GUIDE.md"
