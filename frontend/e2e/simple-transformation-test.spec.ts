import { test, expect, Page } from '@playwright/test'
import { readFileSync } from 'fs'

/**
 * Simplified E2E Test - Testing basic mapping workflow
 */

test.describe('Simple Transformation Test', () => {
  let sourceData: string

  test.beforeAll(() => {
    // Load test data file
    sourceData = readFileSync('../test-data/test-source-complex.json', 'utf-8')
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000)
    await expect(page.locator('text=AceTransformer')).toBeVisible({ timeout: 10000 })
  })

test('should map 5 fields from source to target', async ({ page }) => {
  console.log('🚀 Starting Simple Transformation Test');
  
  // Capture console messages and errors
  page.on('console', msg => console.log(`[BROWSER ${msg.type()}]:`, msg.text()));
  page.on('pageerror', err => console.error(`[PAGE ERROR]:`, err.message));
  
  // Capture network requests and responses
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
      if (!response.ok()) {
        const body = await response.text().catch(() => 'Unable to read response');
        console.error(`[ERROR BODY]:`, body);
      }
    }
  });
  
  // ⚠️ HANDLE AUTHENTICATION DIALOG - dismiss any auth popup
  page.on('dialog', async dialog => {
    console.log(`[DIALOG DETECTED] ${dialog.type()}: ${dialog.message()}`);
    await dialog.dismiss();
  });
  
  // Step 1: Select formats
  console.log('Step 1: Select formats');
  await page.getByLabel('Source Format').click();
  await page.getByRole('option', { name: 'JSON' }).click();
  await page.getByLabel('Target Format').click();
  await page.getByRole('option', { name: 'JSON' }).click();
    // Upload source data by uploading the file
    console.log('Step 2: Upload source data file')
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles('../test-data/test-source-complex.json')
    await page.waitForTimeout(2000)
    console.log('  ✓ File uploaded')

    // Add 5 simple mappings
    console.log('Step 3: Adding 5 field mappings')
    
    const mappings = [
      { target: 'transactionId', source: 'orderId', description: 'Transaction ID' },
      { target: 'buyer.buyerId', source: 'customer.customerId', description: 'Buyer ID' },
      { target: 'buyer.email', source: 'customer.contactDetails.primaryEmail', description: 'Email' },
      { target: 'buyer.accountInfo.loyaltyPointsBalance', source: 'customer.loyaltyProgram.points', description: 'Loyalty Points' },
      { target: 'buyer.accountInfo.memberSince', source: 'customer.loyaltyProgram.joinDate', description: 'Member Since' },
    ]

    for (const mapping of mappings) {
      console.log(`  Adding: ${mapping.description}`)
      
      // Click Add Field
      const addFieldButton = page.getByRole('button', { name: /^add field$/i })
      await addFieldButton.waitFor({ state: 'visible', timeout: 15000 })
      await addFieldButton.click()
      await page.waitForTimeout(500)

      // Fill target and source
      await page.getByLabel('Target Field Name').fill(mapping.target)
      await page.getByLabel('Source Field Path').fill(mapping.source)
      
      // Click Add in dialog
      const addButtons = await page.getByRole('button', { name: /^add field$/i }).all()
      await addButtons[addButtons.length - 1].click()
      await page.waitForTimeout(500)
      
      console.log(`  ✓ Added ${mapping.description}`)
    }

    // Apply transformation
    console.log('\nStep 4: Apply transformation')
    const transformButton = page.getByRole('button', { name: /^advanced transform$/i }).last()
    await transformButton.click()
    await page.waitForTimeout(5000)
    
    console.log('  ✓ Transformation completed')

    // Step 5: Check for results - with better diagnostics
    console.log('\nStep 5: Check for results');
    
    // Wait a bit for results to render
    await page.waitForTimeout(2000);
    
    // Try to find any element with transformation result
    const possibleSelectors = [
      '[data-testid="transformation-result"]',
      '[class*="TransformationResult"]',
      'textarea',
      'pre',
      'code',
      '[class*="result" i]'
    ];
    
    console.log('Checking for result elements...');
    for (const selector of possibleSelectors) {
      const count = await page.locator(selector).count();
      console.log(`  - Found ${count} elements matching: ${selector}`);
    }
    
    // Check if there's an error message displayed
    const errorMsg = await page.locator('[class*="error" i], [role="alert"]').textContent().catch(() => null);
    if (errorMsg) {
      console.error('❌ Error message displayed:', errorMsg);
    }
    
    // Try multiple approaches to find results
    let resultText: string | null = null;
    
    // Approach 1: Look for textarea
    const textareas = await page.locator('textarea').count();
    if (textareas > 0) {
      console.log(`Found ${textareas} textarea elements`);
      resultText = await page.locator('textarea').last().inputValue();
    }
    
    // Approach 2: Look for pre/code
    if (!resultText) {
      const preElements = await page.locator('pre').count();
      if (preElements > 0) {
        console.log(`Found ${preElements} pre elements`);
        resultText = await page.locator('pre').last().textContent();
      }
    }
    
    // Approach 3: Look for any element with "result" in class
    if (!resultText) {
      const resultDivs = await page.locator('[class*="result" i]').count();
      if (resultDivs > 0) {
        console.log(`Found ${resultDivs} result div elements`);
        resultText = await page.locator('[class*="result" i]').last().textContent();
      }
    }
    
    if (resultText && resultText.includes('{')) {
      console.log('✓ Found results:', resultText.substring(0, 100));
      const outputData = JSON.parse(resultText);
      
      console.log('\n📊 Validation:');
      console.log(`  Transaction ID: ${outputData.transactionId}`);
      console.log(`  Buyer ID: ${outputData.buyer?.buyerId}`);
      console.log(`  Email: ${outputData.buyer?.email}`);
      
      expect(outputData.transactionId).toBe('ORD-2025-001234');
      expect(outputData.buyer?.buyerId).toBe('CUST-456789');
      
      console.log('✅ Test completed successfully!');
    } else {
      console.error('❌ No results found in any expected location');
      // Take a screenshot for debugging
      await page.screenshot({ path: 'test-results/no-results-found.png', fullPage: true });
      throw new Error('Transformation results not displayed');
    }

    // Take screenshot
    await page.screenshot({ path: 'test-results/simple-test.png', fullPage: true })
  })
})
