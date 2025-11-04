# UI E2E Testing Guide

## Overview

This guide covers the complete UI End-to-End testing suite for the AceTransformer application, focusing on the EnhancedAddFieldModal and tree structure functionality.

## Test Suites

### 1. Tree Structure Tests (`ui-tree-structure.spec.ts`)

**10 comprehensive tests covering:**

- **UI-1**: Modal opens and displays basic fields
- **UI-2**: Tree Structure Builder appears for NESTED_OBJECT type
- **UI-3**: Create root level field (L1)
- **UI-4**: Create nested field under parent with auto-calculation
- **UI-5**: Build complex 4-level hierarchy
- **UI-6**: Parent dropdown shows hierarchical tree structure
- **UI-7**: Level chips display correctly
- **UI-8**: Status box provides feedback
- **UI-9**: Cancel button closes modal without saving
- **UI-10**: Nesting level input is editable

### 2. Field Types Tests (`ui-field-types.spec.ts`)

**10 comprehensive tests covering:**

- **UI-FT-1**: Create SIMPLE field
- **UI-FT-2**: Create COMPUTED field with UUID
- **UI-FT-3**: Create COMPUTED field with all 9 types
- **UI-FT-4**: Create KEY_VALUE_PAIR field
- **UI-FT-5**: Create NESTED_OBJECT with children
- **UI-FT-6**: Validation - Empty field name shows error
- **UI-FT-7**: Field type switching updates UI correctly
- **UI-FT-8**: Multiple fields can be added sequentially
- **UI-FT-9**: Modal resets form when closed and reopened
- **UI-FT-10**: Transformation rule input for computed types

## Prerequisites

### 1. Install Playwright Browsers

```bash
cd /Volumes/D/Projects/AceTransformer/frontend
npx playwright install
```

### 2. Start Backend Server

```bash
cd /Volumes/D/Projects/AceTransformer
mvn spring-boot:run
```

Backend should be accessible at `http://localhost:8080`

Verify with:
```bash
curl http://localhost:8080/actuator/health
```

### 3. Start Frontend Development Server

```bash
cd /Volumes/D/Projects/AceTransformer/frontend
npm run dev
```

Frontend should be accessible at `http://localhost:5173`

Verify by opening `http://localhost:5173` in your browser.

## Running Tests

### Option 1: Run All UI Tests (Recommended)

```bash
cd /Volumes/D/Projects/AceTransformer
./run-ui-e2e-tests.sh
```

This script:
- ✅ Checks if backend is running
- ✅ Checks if frontend is running
- ✅ Runs tree structure tests
- ✅ Runs field types tests
- ✅ Displays summary report

### Option 2: Run Individual Test Suites

#### Tree Structure Tests Only
```bash
cd /Volumes/D/Projects/AceTransformer/frontend
npm run test:e2e -- ui-tree-structure.spec.ts
```

#### Field Types Tests Only
```bash
cd /Volumes/D/Projects/AceTransformer/frontend
npm run test:e2e -- ui-field-types.spec.ts
```

### Option 3: Run with UI Mode (Interactive)

```bash
cd /Volumes/D/Projects/AceTransformer/frontend
npm run test:e2e:ui
```

This opens Playwright's interactive UI where you can:
- Select specific tests to run
- Watch tests execute in real-time
- Inspect test failures
- Debug test steps

### Option 4: Run with Debug Mode

```bash
cd /Volumes/D/Projects/AceTransformer/frontend
npm run test:e2e:debug -- ui-tree-structure.spec.ts
```

This runs tests with Playwright Inspector for step-by-step debugging.

### Option 5: Run Specific Test

```bash
cd /Volumes/D/Projects/AceTransformer/frontend
npx playwright test --grep "UI-4: Create nested field"
```

## Test Output

### Successful Test Run

```
🧪 AceTransformer UI E2E Test Suite
====================================

📡 Checking backend status...
✓ Backend is running on port 8080
📡 Checking frontend status...
✓ Frontend is running on port 5173

🚀 Starting UI E2E Tests...

📋 Running Tree Structure Tests (ui-tree-structure.spec.ts)...

  ✓ UI-1: Modal opens and displays basic fields (2.3s)
  ✓ UI-2: Tree Structure Builder appears for NESTED_OBJECT type (1.8s)
  ✓ UI-3: Create root level field (L1) (2.1s)
  ✓ UI-4: Create nested field under parent with auto-calculation (3.5s)
  ✓ UI-5: Build complex 4-level hierarchy (8.2s)
  ✓ UI-6: Parent dropdown shows hierarchical tree structure (4.1s)
  ✓ UI-7: Level chips display correctly (1.9s)
  ✓ UI-8: Status box provides feedback (3.2s)
  ✓ UI-9: Cancel button closes modal without saving (1.5s)
  ✓ UI-10: Nesting level input is editable (1.7s)

  10 passed (30.3s)

📋 Running Field Types Tests (ui-field-types.spec.ts)...

  ✓ UI-FT-1: Create SIMPLE field (2.0s)
  ✓ UI-FT-2: Create COMPUTED field with UUID (2.5s)
  ✓ UI-FT-3: Create COMPUTED field with all types (12.8s)
  ✓ UI-FT-4: Create KEY_VALUE_PAIR field (2.4s)
  ✓ UI-FT-5: Create NESTED_OBJECT with children (3.1s)
  ✓ UI-FT-6: Validation - Empty field name shows error (1.6s)
  ✓ UI-FT-7: Field type switching updates UI correctly (2.9s)
  ✓ UI-FT-8: Multiple fields can be added sequentially (5.2s)
  ✓ UI-FT-9: Modal resets form when closed and reopened (2.1s)
  ✓ UI-FT-10: Transformation rule input for computed types (2.3s)

  10 passed (36.9s)

====================================
📊 Test Results Summary
====================================
✓ Tree Structure Tests: PASSED
✓ Field Types Tests: PASSED

🎉 All UI E2E Tests Passed!

View detailed report: npx playwright show-report
```

## Troubleshooting

### Backend Not Running

**Error:**
```
✗ Backend is not running
Please start backend with: cd /Volumes/D/Projects/AceTransformer && mvn spring-boot:run
```

**Solution:**
```bash
cd /Volumes/D/Projects/AceTransformer
mvn spring-boot:run
```

### Frontend Not Running

**Error:**
```
✗ Frontend is not running
Please start frontend with: cd /Volumes/D/Projects/AceTransformer/frontend && npm run dev
```

**Solution:**
```bash
cd /Volumes/D/Projects/AceTransformer/frontend
npm run dev
```

### Port Already in Use

**Kill processes on ports:**
```bash
# Kill backend (port 8080)
lsof -ti:8080 | xargs kill -9

# Kill frontend (port 5173)
lsof -ti:5173 | xargs kill -9
```

### Test Timeouts

If tests timeout, increase the timeout in `playwright.config.ts`:

```typescript
use: {
  actionTimeout: 30000, // 30 seconds
  navigationTimeout: 60000, // 60 seconds
}
```

### Selector Not Found

If tests fail with "selector not found", it may be due to:

1. **Page not fully loaded**: Add `await page.waitForLoadState('networkidle')`
2. **Element not visible**: Check if element is conditionally rendered
3. **Selector changed**: Update selector in test

**Debug with:**
```bash
npm run test:e2e:debug -- ui-tree-structure.spec.ts
```

### Tests Flaky

If tests intermittently fail:

1. Add explicit waits:
   ```typescript
   await page.waitForTimeout(500)
   ```

2. Wait for specific elements:
   ```typescript
   await expect(element).toBeVisible()
   ```

3. Use `waitForSelector`:
   ```typescript
   await page.waitForSelector('text=Added field')
   ```

## Test Coverage

### Tree Structure Features
- ✅ Modal opening and closing
- ✅ Tree Structure Builder visibility toggle
- ✅ Parent node dropdown population
- ✅ Hierarchical tree display with indentation
- ✅ Level chips (L0, L1, L2, etc.)
- ✅ Automatic level calculation
- ✅ Status box feedback (info vs success)
- ✅ Root level field creation
- ✅ Nested field creation under parent
- ✅ Multi-level hierarchy (L1 → L2 → L3 → L4)
- ✅ Form reset on cancel
- ✅ Manual nesting level input

### Field Type Features
- ✅ SIMPLE field creation
- ✅ COMPUTED field with UUID
- ✅ All 9 COMPUTED types (UUID, TIMESTAMP, TIMESTAMP_ISO, DATE, COUNT, INCREMENT, CONSTANT, RANDOM_STRING, RANDOM_NUMBER)
- ✅ KEY_VALUE_PAIR field with custom key/value names
- ✅ NESTED_OBJECT with child fields
- ✅ Field type switching and UI updates
- ✅ Form validation (empty field name)
- ✅ Sequential field addition
- ✅ Form reset behavior
- ✅ Transformation rule input

## Viewing Test Reports

### HTML Report

```bash
cd /Volumes/D/Projects/AceTransformer/frontend
npx playwright show-report
```

Opens detailed HTML report in browser with:
- Test execution timeline
- Screenshots on failure
- Video recordings
- Test traces

### JSON Report

Generate JSON report:
```bash
npx playwright test --reporter=json
```

### JUnit Report

For CI/CD integration:
```bash
npx playwright test --reporter=junit
```

## CI/CD Integration

Add to GitHub Actions workflow:

```yaml
name: UI E2E Tests

on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          java-version: '21'
          
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Start Backend
        run: |
          cd /path/to/project
          mvn spring-boot:run &
          
      - name: Start Frontend
        run: |
          cd frontend
          npm install
          npm run dev &
          
      - name: Install Playwright
        run: |
          cd frontend
          npx playwright install --with-deps
          
      - name: Run Tests
        run: |
          cd frontend
          npm run test:e2e
          
      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

## Best Practices

### 1. Wait for Elements
Always wait for critical elements:
```typescript
await expect(page.getByRole('dialog')).toBeVisible()
```

### 2. Use Semantic Selectors
Prefer role-based selectors:
```typescript
// Good
await page.getByRole('button', { name: /add field/i })

// Avoid
await page.locator('#add-field-btn')
```

### 3. Add Timeouts Between Actions
For sequential actions:
```typescript
await page.waitForTimeout(300)
```

### 4. Test Isolation
Each test should be independent:
```typescript
test.beforeEach(async ({ page }) => {
  // Reset state before each test
  await page.goto('http://localhost:5173')
})
```

### 5. Descriptive Test Names
Use clear, descriptive names:
```typescript
// Good
test('UI-4: Create nested field under parent with auto-calculation')

// Avoid
test('test4')
```

## Next Steps

1. **Run Initial Test Suite**
   ```bash
   ./run-ui-e2e-tests.sh
   ```

2. **Review Test Results**
   - Check console output
   - Open HTML report: `npx playwright show-report`

3. **Fix Failing Tests Iteratively**
   - Debug with: `npm run test:e2e:debug`
   - Update selectors if needed
   - Add explicit waits

4. **Document Results**
   - Create UI-E2E-TEST-RESULTS.md
   - Include screenshots
   - Document fixes applied

5. **Commit Changes**
   ```bash
   git add .
   git commit -m "✅ UI E2E tests for tree structure and all field types"
   ```

## Summary

**Test Suites:** 2
**Total Tests:** 20
**Coverage:**
- ✅ Tree Structure Builder (10 tests)
- ✅ All Field Types (10 tests)
- ✅ Modal Interactions
- ✅ Form Validation
- ✅ Auto-calculations
- ✅ Visual Feedback

**Expected Runtime:** ~60-90 seconds

**Success Criteria:** All 20 tests passing
