#!/bin/bash

echo "🚀 Installing Google Ads API Automation Dependencies..."
echo ""

# Navigate to the correct directory
cd alphamalettech

# Install the google-ads-api package
echo "📦 Installing google-ads-api package..."
npm install google-ads-api@^16.0.0

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "🔧 Next Steps:"
echo "1. Follow the setup guide to get your Google Ads API credentials"
echo "2. Add the 5 environment variables to Vercel"
echo "3. Redeploy your app"
echo "4. Test with: https://www.menshb.com/api/google-ads/debug"
echo ""
echo "📖 Setup Guide: ./google-ads-setup-guide.md"
echo ""
echo "🎯 After setup, click the 🎯 button in /admin/articles to create campaigns!" 