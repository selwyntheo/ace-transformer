import { test, expect } from '@playwright/test'

test('Debug: Modal fields inspection', async ({ page }) => {
  console.log('=== SETUP ===')
  await page.goto('http://localhost:3000')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(1000)

  // Select formats and load sample data
  await page.getByLabel('Source Format').click()
  await page.getByRole('option', { name: /json/i }).click()
  await page.waitForTimeout(500)

  await page.getByLabel('Target Format').click()
  await page.getByRole('option', { name: /xml/i }).click()
  await page.waitForTimeout(500)

  const jsonSampleButton = page.getByRole('button', { name: /json sample/i })
  await jsonSampleButton.click()
  await page.waitForTimeout(1500)

  console.log('✓ Setup complete')

  // Open Add Field modal
  const addFieldButton = page.getByRole('button', { name: /^add field$/i })
  await addFieldButton.waitFor({ state: 'visible', timeout: 15000 })
  await addFieldButton.click()
  await page.waitForTimeout(1000)

  console.log('\n=== MODAL OPENED ===')

  // Get all text inputs
  console.log('\n=== TEXT INPUTS ===')
  const textInputs = await page.locator('input[type="text"]').all()
  console.log(`Total text inputs: ${textInputs.length}`)
  for (let i = 0; i < textInputs.length; i++) {
    const id = await textInputs[i].getAttribute('id')
    const name = await textInputs[i].getAttribute('name')
    const ariaLabel = await textInputs[i].getAttribute('aria-label')
    const placeholder = await textInputs[i].getAttribute('placeholder')
    console.log(`  ${i + 1}. id="${id}" name="${name}" aria-label="${ariaLabel}" placeholder="${placeholder}"`)
  }

  // Get all labels
  console.log('\n=== LABELS ===')
  const labels = await page.locator('label').all()
  console.log(`Total labels: ${labels.length}`)
  for (let i = 0; i < labels.length; i++) {
    const text = await labels[i].textContent()
    const forAttr = await labels[i].getAttribute('for')
    console.log(`  ${i + 1}. "${text}" for="${forAttr}"`)
  }

  // Get all selects/dropdowns
  console.log('\n=== SELECTS ===')
  const selects = await page.locator('select, [role="combobox"]').all()
  console.log(`Total selects: ${selects.length}`)
  for (let i = 0; i < selects.length; i++) {
    const id = await selects[i].getAttribute('id')
    const ariaLabel = await selects[i].getAttribute('aria-label')
    const role = await selects[i].getAttribute('role')
    console.log(`  ${i + 1}. id="${id}" aria-label="${ariaLabel}" role="${role}"`)
  }

  // Try to find Field Type by different methods
  console.log('\n=== FINDING "FIELD TYPE" ===')
  
  const byLabel = await page.getByLabel('Field Type').count()
  console.log(`getByLabel('Field Type'): ${byLabel}`)
  
  const byLabelRegex = await page.getByLabel(/field type/i).count()
  console.log(`getByLabel(/field type/i): ${byLabelRegex}`)
  
  const byText = await page.getByText('Field Type').count()
  console.log(`getByText('Field Type'): ${byText}`)

  // Take screenshot
  await page.screenshot({ path: 'test-results/debug-modal-fields.png', fullPage: true })
  console.log('\n✓ Screenshot saved to test-results/debug-modal-fields.png')
})
