# Running the Complete E2E Transformation Test

## Overview
This test validates the complete transformation workflow from `test-source-complex.json` to `test-target-structure.json` using all 35 field mappings defined in `TEST-FILES-MAPPING-GUIDE.md`.

## Prerequisites

### 1. Start the Backend (Port 8080)
```bash
cd /Volumes/D/Projects/AceTransformer
mvn spring-boot:run
```

Wait for the message: `Started AceTransformerApplication`

### 2. Start the Frontend (Port 3000)
```bash
cd /Volumes/D/Projects/AceTransformer/frontend
npm run dev
```

The app should be available at `http://localhost:3000`

### 3. Verify Services are Running
```bash
# Check backend
curl http://localhost:8080/api/mappings

# Check frontend
curl http://localhost:3000
```

## Running the Test

### Run in Headless Mode (CI/automated)
```bash
cd /Volumes/D/Projects/AceTransformer/frontend
npx playwright test complete-transformation-guide.spec.ts
```

### Run with Visible Browser (Recommended for first run)
```bash
cd /Volumes/D/Projects/AceTransformer/frontend
npx playwright test complete-transformation-guide.spec.ts --headed
```

### Run in Debug Mode (Step-by-step)
```bash
cd /Volumes/D/Projects/AceTransformer/frontend
npx playwright test complete-transformation-guide.spec.ts --debug
```

### Run in UI Mode (Interactive)
```bash
cd /Volumes/D/Projects/AceTransformer/frontend
npx playwright test complete-transformation-guide.spec.ts --ui
```

## What the Test Does

### Test Steps:
1. **Navigate** to the Advanced Transform page
2. **Upload** `test-source-complex.json` content
3. **Select** JSON → JSON transformation
4. **Create 35 field mappings** including:
   - ✅ UUID generation (recordId, processingId)
   - ✅ Timestamp generation (importTimestamp, lastModified)
   - ✅ Direct mappings (transactionId, buyer.email, etc.)
   - ✅ Nested field mappings (buyer.buyerId from customer.customerId)
   - ✅ Array mappings (lineItems[], auditTrail[])
   - ✅ Computed fields (fullName concatenation)
   - ✅ Transformations (uppercase for GOLD membership)
   - ✅ Constant values (metadata.importSource = "migration")
5. **Perform** transformation
6. **Verify** results are displayed in UI
7. **Validate** output data matches expected structure
8. **Take screenshot** of results

### Expected Output:
The test will display detailed console output showing:
- ✓ Each mapping being created (all 35)
- ✓ Transformation completion status
- ✓ Validation results for key fields
- ✓ Complete output JSON structure

## Expected Validation Results

### Key Field Validations:
- `transactionId`: "ORD-2025-001234"
- `buyer.buyerId`: "CUST-456789"
- `buyer.email`: "sarah.johnson@email.com"
- `buyer.accountInfo.membershipLevel`: "GOLD"
- `buyer.accountInfo.loyaltyPointsBalance`: 2500
- `metadata.importSource`: "migration"
- `recordId`: UUID format (e.g., "a1b2c3d4-e5f6-7890-1234-567890abcdef")
- `importTimestamp`: ISO timestamp (e.g., "2025-11-04T15:30:00.000Z")

### Array Validations:
- `lineItems[]`: Should contain 2+ items with productSku, mainCategory, subCategory
- `auditTrail[]`: Should contain 2+ events with eventName and eventTimestamp

## Troubleshooting

### Issue: "localhost:3000 asking for login"
**Cause**: Browser's HTTP Basic Auth challenge (not from the application)

**Solutions**:
1. **Clear browser cache**: Playwright uses its own browser, but check if there's cached auth
2. **Check network**: Ensure no proxy or VPN is intercepting requests
3. **Verify ports**: Make sure frontend is actually on port 3000 (not 5173)
   ```bash
   lsof -ti:3000
   ```
4. **Bypass auth in test**: Add to playwright.config.ts:
   ```typescript
   use: {
     httpCredentials: {
       username: '',
       password: ''
     }
   }
   ```

### Issue: "Cannot find module 'fs'"
**Solution**: The frontend tsconfig needs Node types. This is expected and won't affect the test execution.

### Issue: "Transformation failed" or "null output"
**Cause**: Backend service not applying mappings correctly

**Solution**: 
1. Check backend logs for errors
2. Verify the fix in `AceTransformationService.java` (lines 107-123) is using `getNestedValue()` and `setNestedValue()`
3. Test a simple mapping first to isolate the issue

### Issue: "Timeout waiting for element"
**Cause**: UI selectors may have changed

**Solutions**:
1. Run in `--headed` mode to see what's happening
2. Check the actual UI elements with browser DevTools
3. Update selectors in the test if UI structure changed

### Issue: "Results not visible in UI"
**Check**:
1. Verify `TransformationResult.tsx` component is rendering
2. Check browser console for JavaScript errors
3. Ensure backend returned `success: true` in response

## Test Results Location

After running the test:
- **Screenshot**: `frontend/test-results/complete-transformation-result.png`
- **Report**: `frontend/playwright-report/index.html`
- **Traces**: `frontend/test-results/` (on failure with retries)

View the HTML report:
```bash
cd /Volumes/D/Projects/AceTransformer/frontend
npx playwright show-report
```

## Success Criteria

✅ Test passes if:
1. All 35 mappings are created successfully
2. Transformation completes without errors
3. Output data is visible in the UI
4. Key validations pass:
   - Transaction ID matches
   - Buyer details are correct
   - Arrays (lineItems, auditTrail) are populated
   - UUID fields are properly formatted
   - Timestamp fields are in ISO format
   - Constant values are set correctly

## Next Steps After Test Passes

1. **Verify all 35 mappings** from the guide are working
2. **Test edge cases**: Empty arrays, null values, missing fields
3. **Performance test**: Large files with 100+ items
4. **Add more test cases**: 
   - Error handling (invalid JSON)
   - Different format combinations (XML→JSON, CSV→JSON)
   - Computed fields (SUM, COUNT, AVERAGE)
   - Key-value pair translations

## Contact

If the test fails or you need assistance:
1. Check the screenshot in `test-results/`
2. Review backend logs for errors
3. Run in `--debug` mode to step through
4. Check the console output for detailed error messages
