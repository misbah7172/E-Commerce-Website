#!/bin/bash

# Health check script for deployed application

if [ -z "$1" ]; then
    echo "Usage: ./health-check.sh <your-app-url>"
    echo "Example: ./health-check.sh https://your-app.onrender.com"
    exit 1
fi

APP_URL="$1"
HEALTH_URL="$APP_URL/api/health"

echo "🔍 Checking application health..."
echo "URL: $HEALTH_URL"
echo ""

# Check health endpoint
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$HEALTH_URL")
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Health check passed!"
    echo "Response: $BODY"
else
    echo "❌ Health check failed!"
    echo "HTTP Status: $HTTP_STATUS"
    echo "Response: $BODY"
fi

echo ""

# Check main page
echo "🔍 Checking main page..."
MAIN_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$APP_URL")
MAIN_HTTP_STATUS=$(echo $MAIN_RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

if [ "$MAIN_HTTP_STATUS" -eq 200 ]; then
    echo "✅ Main page accessible!"
else
    echo "❌ Main page not accessible!"
    echo "HTTP Status: $MAIN_HTTP_STATUS"
fi

echo ""
echo "🔍 Quick API tests..."

# Test products endpoint
PRODUCTS_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$APP_URL/api/products")
PRODUCTS_HTTP_STATUS=$(echo $PRODUCTS_RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

if [ "$PRODUCTS_HTTP_STATUS" -eq 200 ]; then
    echo "✅ Products API working!"
else
    echo "❌ Products API failed!"
    echo "HTTP Status: $PRODUCTS_HTTP_STATUS"
fi

# Test categories endpoint
CATEGORIES_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$APP_URL/api/categories")
CATEGORIES_HTTP_STATUS=$(echo $CATEGORIES_RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')

if [ "$CATEGORIES_HTTP_STATUS" -eq 200 ]; then
    echo "✅ Categories API working!"
else
    echo "❌ Categories API failed!"
    echo "HTTP Status: $CATEGORIES_HTTP_STATUS"
fi

echo ""
echo "🎯 Deployment Status Summary:"
if [ "$HTTP_STATUS" -eq 200 ] && [ "$MAIN_HTTP_STATUS" -eq 200 ] && [ "$PRODUCTS_HTTP_STATUS" -eq 200 ] && [ "$CATEGORIES_HTTP_STATUS" -eq 200 ]; then
    echo "🎉 All systems operational! Your e-commerce app is ready!"
else
    echo "⚠️  Some issues detected. Check the logs in Render dashboard."
fi
