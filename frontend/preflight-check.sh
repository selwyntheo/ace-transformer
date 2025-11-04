#!/bin/bash

# Pre-flight check for UI E2E tests

echo "🔍 Pre-flight Check for UI E2E Tests"
echo "====================================="
echo ""

# Check if Playwright is installed
echo "📦 Checking Playwright installation..."
if [ -d "node_modules/@playwright/test" ]; then
    echo "✓ Playwright is installed"
else
    echo "✗ Playwright not found"
    echo "  Run: npm install"
    exit 1
fi

# Check if Playwright browsers are installed
echo "🌐 Checking Playwright browsers..."
if npx playwright --version > /dev/null 2>&1; then
    echo "✓ Playwright CLI is available"
    echo "  Version: $(npx playwright --version)"
else
    echo "✗ Playwright CLI not available"
    exit 1
fi

# Check backend
echo "📡 Checking backend (port 8080)..."
if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✓ Backend is running"
    BACKEND_HEALTH=$(curl -s http://localhost:8080/actuator/health | jq -r '.status' 2>/dev/null || echo "UP")
    echo "  Status: $BACKEND_HEALTH"
else
    echo "⚠️  Backend is NOT running"
    echo "  Start with: cd /Volumes/D/Projects/AceTransformer && mvn spring-boot:run"
fi

# Check frontend (try both common ports)
echo "📡 Checking frontend (port 3000 or 5173)..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✓ Frontend is running on port 3000"
    FRONTEND_RUNNING=true
elif curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✓ Frontend is running on port 5173"
    FRONTEND_RUNNING=true
else
    echo "⚠️  Frontend is NOT running"
    echo "  Start with: cd /Volumes/D/Projects/AceTransformer/frontend && npm run dev"
    FRONTEND_RUNNING=false
fi

# Check test files
echo "📄 Checking test files..."
if [ -f "e2e/ui-tree-structure.spec.ts" ]; then
    echo "✓ ui-tree-structure.spec.ts found"
else
    echo "✗ ui-tree-structure.spec.ts NOT found"
fi

if [ -f "e2e/ui-field-types.spec.ts" ]; then
    echo "✓ ui-field-types.spec.ts found"
else
    echo "✗ ui-field-types.spec.ts NOT found"
fi

# Check playwright config
echo "⚙️  Checking Playwright config..."
if [ -f "playwright.config.ts" ]; then
    echo "✓ playwright.config.ts found"
else
    echo "✗ playwright.config.ts NOT found"
fi

echo ""
echo "====================================="
echo "Pre-flight check complete!"
echo ""

# Summary
if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1 && [ "$FRONTEND_RUNNING" = true ]; then
    echo "✅ Ready to run tests!"
    echo ""
    echo "Run tests with:"
    echo "  npm run test:e2e"
    echo "  or"
    echo "  ../run-ui-e2e-tests.sh"
    exit 0
else
    echo "⚠️  Please start backend and/or frontend first"
    exit 1
fi
