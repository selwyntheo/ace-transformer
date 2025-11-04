import { test, expect } from '@playwright/test'

/**
 * E2E tests for Computed Field functionality
 * Tests all computed field types: UUID, Timestamp, Date, Count, Increment, Constant, Random
 */

test.describe('Computed Field Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/advanced')
    await page.waitForLoadState('networkidle')
  })

  test('should create UUID computed field', async ({ page }) => {
    await page.click('button:has-text("Add Field")')
    
    await page.fill('input[aria-label="Target Field Name"]', 'id')
    
    // Select Computed field type
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Computed/Generated Field')
    
    // Select UUID computed type
    await page.click('div[aria-label="Computed Type"]')
    await page.click('text=UUID')
    
    // Verify description is shown
    await expect(page.locator('text=Generates a unique identifier')).toBeVisible()
    
    await page.click('button:has-text("Add Field"):not([disabled])')
    
    // Verify field was added
    await expect(page.locator('text=id')).toBeVisible()
  })

  test('should create Timestamp computed field', async ({ page }) => {
    await page.click('button:has-text("Add Field")')
    
    await page.fill('input[aria-label="Target Field Name"]', 'createdAt')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Computed/Generated Field')
    await page.click('div[aria-label="Computed Type"]')
    await page.click('text=Timestamp')
    
    await expect(page.locator('text=Current timestamp in milliseconds')).toBeVisible()
    
    await page.click('button:has-text("Add Field"):not([disabled])')
    await expect(page.locator('text=createdAt')).toBeVisible()
  })

  test('should create ISO Timestamp computed field', async ({ page }) => {
    await page.click('button:has-text("Add Field")')
    
    await page.fill('input[aria-label="Target Field Name"]', 'timestamp')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Computed/Generated Field')
    await page.click('div[aria-label="Computed Type"]')
    await page.click('text=Timestamp (ISO)')
    
    await expect(page.locator('text=ISO 8601 formatted timestamp')).toBeVisible()
    
    await page.click('button:has-text("Add Field"):not([disabled])')
    await expect(page.locator('text=timestamp')).toBeVisible()
  })

  test('should create Date computed field', async ({ page }) => {
    await page.click('button:has-text("Add Field")')
    
    await page.fill('input[aria-label="Target Field Name"]', 'date')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Computed/Generated Field')
    await page.click('div[aria-label="Computed Type"]')
    await page.click('text=Date')
    
    await expect(page.locator('text=Current date')).toBeVisible()
    
    await page.click('button:has-text("Add Field"):not([disabled])')
    await expect(page.locator('text=date')).toBeVisible()
  })

  test('should create Count computed field with source', async ({ page }) => {
    await page.click('button:has-text("Add Field")')
    
    await page.fill('input[aria-label="Target Field Name"]', 'totalItems')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Computed/Generated Field')
    await page.click('div[aria-label="Computed Type"]')
    await page.click('text=Count')
    
    // Should show source field input
    await expect(page.locator('input[aria-label="Source Field to Count"]')).toBeVisible()
    await page.fill('input[aria-label="Source Field to Count"]', 'items')
    
    await page.click('button:has-text("Add Field"):not([disabled])')
    await expect(page.locator('text=totalItems')).toBeVisible()
  })

  test('should create Auto Increment computed field', async ({ page }) => {
    await page.click('button:has-text("Add Field")')
    
    await page.fill('input[aria-label="Target Field Name"]', 'sequence')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Computed/Generated Field')
    await page.click('div[aria-label="Computed Type"]')
    await page.click('text=Auto Increment')
    
    await expect(page.locator('text=Auto-incrementing number')).toBeVisible()
    
    await page.click('button:has-text("Add Field"):not([disabled])')
    await expect(page.locator('text=sequence')).toBeVisible()
  })

  test('should create Constant computed field with value', async ({ page }) => {
    await page.click('button:has-text("Add Field")')
    
    await page.fill('input[aria-label="Target Field Name"]', 'status')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Computed/Generated Field')
    await page.click('div[aria-label="Computed Type"]')
    await page.click('text=Constant Value')
    
    // Should show constant value input
    await expect(page.locator('input[aria-label="Constant Value"]')).toBeVisible()
    await page.fill('input[aria-label="Constant Value"]', 'ACTIVE')
    
    await page.click('button:has-text("Add Field"):not([disabled])')
    await expect(page.locator('text=status')).toBeVisible()
  })

  test('should create Random String computed field', async ({ page }) => {
    await page.click('button:has-text("Add Field")')
    
    await page.fill('input[aria-label="Target Field Name"]', 'token')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Computed/Generated Field')
    await page.click('div[aria-label="Computed Type"]')
    await page.click('text=Random String')
    
    await expect(page.locator('text=Random 8-character string')).toBeVisible()
    
    await page.click('button:has-text("Add Field"):not([disabled])')
    await expect(page.locator('text=token')).toBeVisible()
  })

  test('should create Random Number computed field', async ({ page }) => {
    await page.click('button:has-text("Add Field")')
    
    await page.fill('input[aria-label="Target Field Name"]', 'randomId')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Computed/Generated Field')
    await page.click('div[aria-label="Computed Type"]')
    await page.click('text=Random Number')
    
    await expect(page.locator('text=Random number')).toBeVisible()
    
    await page.click('button:has-text("Add Field"):not([disabled])')
    await expect(page.locator('text=randomId')).toBeVisible()
  })

  test('should show appropriate helper text for each computed type', async ({ page }) => {
    await page.click('button:has-text("Add Field")')
    await page.fill('input[aria-label="Target Field Name"]', 'field1')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Computed/Generated Field')
    
    // Test each computed type has description
    const computedTypes = [
      { type: 'UUID', description: 'unique identifier' },
      { type: 'Timestamp', description: 'timestamp in milliseconds' },
      { type: 'Date', description: 'Current date' },
      { type: 'Count', description: 'Count of items' },
      { type: 'Auto Increment', description: 'Auto-incrementing' },
    ]
    
    for (const { type, description } of computedTypes) {
      await page.click('div[aria-label="Computed Type"]')
      await page.click(`text=${type}`)
      await expect(page.locator(`text*=${description}`)).toBeVisible()
    }
  })

  test('should add computed field as child in nested object', async ({ page }) => {
    await page.click('button:has-text("Add Field")')
    
    await page.fill('input[aria-label="Target Field Name"]', 'record')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Nested Object')
    
    // Add computed child field
    await page.click('text=Add Child Field')
    await page.fill('input[aria-label="Child Field Name"]', 'recordId')
    await page.click('div[aria-label="Child Field Type"]')
    await page.click('text=Computed Field')
    await page.click('div[aria-label="Computed Type"]')
    await page.click('text=UUID')
    await page.click('button:has-text("Add Child")')
    
    // Verify child was added
    await expect(page.locator('text=recordId')).toBeVisible()
    await expect(page.locator('text=COMPUTED')).toBeVisible()
    
    await page.click('button:has-text("Add Field"):not([disabled])')
  })
})
