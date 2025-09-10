#!/bin/bash

echo "🚀 Testing Echo Unified Deployment"
echo "=================================="

# Test 1: Install dependencies
echo "📦 Testing dependency installation..."
if npm run install-all > /dev/null 2>&1; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Dependency installation failed"
    exit 1
fi

# Test 2: Build frontend
echo "🔨 Testing frontend build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Test 3: Check if build output exists
echo "📁 Checking build output..."
if [ -d "frontend/dist" ] && [ -f "frontend/dist/index.html" ]; then
    echo "✅ Build artifacts generated"
else
    echo "❌ Build artifacts missing"
    exit 1
fi

# Test 4: Verify Firebase functions
echo "🔥 Testing Firebase functions..."
if cd functions && node -e "require('./index.js'); console.log('Functions loaded')" > /dev/null 2>&1; then
    echo "✅ Firebase functions valid"
    cd ..
else
    echo "❌ Firebase functions invalid"
    exit 1
fi

# Test 5: Check configuration files
echo "⚙️  Checking configuration files..."
configs=("firebase.json" "vercel.json" "package.json" "frontend/package.json" "functions/package.json")
for config in "${configs[@]}"; do
    if [ -f "$config" ]; then
        echo "✅ $config exists"
    else
        echo "❌ $config missing"
        exit 1
    fi
done

echo ""
echo "🎉 All tests passed!"
echo "Ready for deployment:"
echo "  • Firebase: npm run firebase-deploy"
echo "  • Vercel: npm run functions-deploy && vercel --prod"