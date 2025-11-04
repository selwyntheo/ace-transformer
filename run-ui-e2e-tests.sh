#!/bin/bash

# UI E2E Test Execution Script
# This script starts backend, frontend, and runs Playwright tests

set -e

echo "🧪 AceTransformer UI E2E Test Suite"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo "📡 Checking backend status..."
if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running on port 8080${NC}"
else
    echo -e "${RED}✗ Backend is not running${NC}"
    echo "Please start backend with: cd /Volumes/D/Projects/AceTransformer && mvn spring-boot:run"
    exit 1
fi

# Check if frontend is running (try both ports)
echo "📡 Checking frontend status..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running on port 3000${NC}"
    FRONTEND_PORT=3000
elif curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running on port 5173${NC}"
    FRONTEND_PORT=5173
else
    echo -e "${RED}✗ Frontend is not running${NC}"
    echo "Please start frontend with: cd /Volumes/D/Projects/AceTransformer/frontend && npm run dev"
    exit 1
fi

echo ""
echo "🚀 Starting UI E2E Tests..."
echo ""

# Navigate to frontend directory
cd /Volumes/D/Projects/AceTransformer/frontend

# Run Tree Structure tests
echo -e "${YELLOW}📋 Running Tree Structure Tests (ui-tree-structure.spec.ts)...${NC}"
npx playwright test ui-tree-structure.spec.ts --reporter=list

TREE_RESULT=$?

echo ""

# Run Field Types tests
echo -e "${YELLOW}📋 Running Field Types Tests (ui-field-types.spec.ts)...${NC}"
npx playwright test ui-field-types.spec.ts --reporter=list

FIELD_RESULT=$?

echo ""
echo "===================================="
echo "📊 Test Results Summary"
echo "===================================="

if [ $TREE_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ Tree Structure Tests: PASSED${NC}"
else
    echo -e "${RED}✗ Tree Structure Tests: FAILED${NC}"
fi

if [ $FIELD_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ Field Types Tests: PASSED${NC}"
else
    echo -e "${RED}✗ Field Types Tests: FAILED${NC}"
fi

echo ""

# Overall result
if [ $TREE_RESULT -eq 0 ] && [ $FIELD_RESULT -eq 0 ]; then
    echo -e "${GREEN}🎉 All UI E2E Tests Passed!${NC}"
    echo ""
    echo "View detailed report: npx playwright show-report"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the output above.${NC}"
    echo ""
    echo "Debug failed tests: npm run test:e2e:debug"
    exit 1
fi
