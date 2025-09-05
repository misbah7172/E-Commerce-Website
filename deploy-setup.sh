#!/bin/bash

echo "🚀 E-Commerce Platform - Render Deployment Setup"
echo "================================================"

# Check if required files exist
echo "✅ Checking deployment files..."

if [ -f "render.yaml" ]; then
    echo "✅ render.yaml found"
else
    echo "❌ render.yaml not found"
    exit 1
fi

if [ -f "package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json not found"
    exit 1
fi

# Check environment variables
echo ""
echo "🔍 Environment Variables Checklist:"
echo "You'll need to set these in Render dashboard:"
echo ""
echo "Required:"
echo "  ✓ NODE_ENV=production (auto-set)"
echo "  ✓ DATABASE_URL (auto-set from database)"
echo ""
echo "Firebase (Required for auth):"
echo "  ⚠️  VITE_FIREBASE_API_KEY"
echo "  ⚠️  VITE_FIREBASE_AUTH_DOMAIN"
echo "  ⚠️  VITE_FIREBASE_PROJECT_ID"
echo "  ⚠️  VITE_FIREBASE_STORAGE_BUCKET"
echo "  ⚠️  VITE_FIREBASE_MESSAGING_SENDER_ID"
echo "  ⚠️  VITE_FIREBASE_APP_ID"
echo ""
echo "Optional (for payments):"
echo "  ⚠️  STRIPE_SECRET_KEY"
echo "  ⚠️  STRIPE_PUBLISHABLE_KEY"
echo "  ⚠️  PAYPAL_CLIENT_ID"
echo "  ⚠️  PAYPAL_CLIENT_SECRET"
echo ""

# Run a test build
echo "🔨 Testing build process..."
if npm install && npm run build; then
    echo "✅ Build test successful!"
else
    echo "❌ Build test failed. Please check your code."
    exit 1
fi

echo ""
echo "🎉 Ready for Render deployment!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Create a new Web Service on Render"
echo "3. Connect your GitHub repository"
echo "4. Use the provided render.yaml for configuration"
echo "5. Set environment variables in Render dashboard"
echo "6. Deploy!"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
