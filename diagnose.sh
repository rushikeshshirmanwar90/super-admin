#!/bin/bash

# Super Admin Dashboard Diagnostic Script
# Run with: bash diagnose.sh

echo "🔍 Super Admin Dashboard Diagnostics"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "   Please run this script from the super-admin directory"
    exit 1
fi

echo "✅ Running from correct directory"
echo ""

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not found"
    echo "   Install from: https://nodejs.org/"
    exit 1
fi
echo ""

# Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm installed: $NPM_VERSION"
else
    echo "❌ npm not found"
    exit 1
fi
echo ""

# Check if node_modules exists
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules directory exists"
else
    echo "⚠️  node_modules not found"
    echo "   Run: npm install"
fi
echo ""

# Check .env.local
echo "🔧 Checking environment configuration..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local file exists"
    if grep -q "NEXT_PUBLIC_API_URL" .env.local; then
        API_URL=$(grep "NEXT_PUBLIC_API_URL" .env.local | cut -d '=' -f2)
        echo "✅ API URL configured: $API_URL"
    else
        echo "⚠️  NEXT_PUBLIC_API_URL not found in .env.local"
    fi
else
    echo "⚠️  .env.local file not found"
    echo "   Copy from .env.example: cp .env.example .env.local"
fi
echo ""

# Check if API is running
echo "🌐 Checking API connection..."
API_URL="http://localhost:8080"
if curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/client" | grep -q "200\|404"; then
    echo "✅ API server is reachable at $API_URL"
    
    # Try to get data
    RESPONSE=$(curl -s "$API_URL/api/client")
    if echo "$RESPONSE" | grep -q "success"; then
        echo "✅ API returns valid response"
        
        # Check if there's data
        if echo "$RESPONSE" | grep -q '"data":\['; then
            CLIENT_COUNT=$(echo "$RESPONSE" | grep -o '"_id"' | wc -l)
            echo "✅ Found $CLIENT_COUNT client(s) in database"
        else
            echo "⚠️  No clients found in database"
            echo "   Add test data using the form or API"
        fi
    else
        echo "⚠️  API response format unexpected"
    fi
else
    echo "❌ Cannot connect to API at $API_URL"
    echo "   Make sure real-estate-apis is running:"
    echo "   cd ../real-estate-apis && npm run dev"
fi
echo ""

# Check if super-admin is running
echo "🌐 Checking Super Admin server..."
ADMIN_URL="http://localhost:8000"
if curl -s -o /dev/null -w "%{http_code}" "$ADMIN_URL" | grep -q "200"; then
    echo "✅ Super Admin is running at $ADMIN_URL"
else
    echo "⚠️  Super Admin not running"
    echo "   Start with: npm run dev"
fi
echo ""

# Summary
echo "===================================="
echo "📊 Diagnostic Summary"
echo "===================================="
echo ""

# Count issues
ISSUES=0

if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencies not installed"
    ISSUES=$((ISSUES + 1))
fi

if [ ! -f ".env.local" ]; then
    echo "⚠️  Environment not configured"
    ISSUES=$((ISSUES + 1))
fi

if ! curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/client" | grep -q "200\|404"; then
    echo "⚠️  API server not running"
    ISSUES=$((ISSUES + 1))
fi

if ! curl -s -o /dev/null -w "%{http_code}" "$ADMIN_URL" | grep -q "200"; then
    echo "⚠️  Super Admin not running"
    ISSUES=$((ISSUES + 1))
fi

if [ $ISSUES -eq 0 ]; then
    echo "✅ All checks passed!"
    echo ""
    echo "🎉 Your dashboard should be working!"
    echo "   Open: http://localhost:8000"
else
    echo "⚠️  Found $ISSUES issue(s)"
    echo ""
    echo "📝 Next steps:"
    if [ ! -d "node_modules" ]; then
        echo "   1. Run: npm install"
    fi
    if [ ! -f ".env.local" ]; then
        echo "   2. Run: cp .env.example .env.local"
    fi
    if ! curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/client" | grep -q "200\|404"; then
        echo "   3. Start API: cd ../real-estate-apis && npm run dev"
    fi
    if ! curl -s -o /dev/null -w "%{http_code}" "$ADMIN_URL" | grep -q "200"; then
        echo "   4. Start Super Admin: npm run dev"
    fi
fi

echo ""
echo "📚 For more help, see:"
echo "   - FIX_SUMMARY.md"
echo "   - TROUBLESHOOTING.md"
echo "   - QUICK_START.md"
echo ""
