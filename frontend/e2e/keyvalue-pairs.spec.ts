import { test, expect } from '@playwright/test'

/**
 * E2E tests for Key/Value Pair functionality
 * Tests conversion of objects/maps to key-value pair arrays
 */

test.describe('Key/Value Pair Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/advanced')
    await page.waitForLoadState('networkidle')
  })

  test('should create key/value pair field with default names', async ({ page }) => {
    await page.click('button:has-text("Add Field")')
    
    await page.fill('input[aria-label="Target Field Name"]', 'properties')
    
    // Select Key/Value Pair type
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Key/Value Pair')
    
    // Fill source field
    await page.fill('input[aria-label="Source Field Path"]', 'metadata')
    
    // Verify default key and value field names
    await expect(page.locator('input[aria-label="Key Field Name"]')).toHaveValue('key')
    await expect(page.locator('input[aria-label="Value Field Name"]')).toHaveValue('value')
    
    // Verify description is shown
    await expect(page.locator('text=Converts an object/map into an array')).toBeVisible()
    
    await page.click('button:has-text("Add Field"):not([disabled])')
    await expect(page.locator('text=properties')).toBeVisible()
  })

  test('should create key/value pair with custom field names', async ({ page }) => {
    await page.click('button:has-text("Add Field")')
    
    await page.fill('input[aria-label="Target Field Name"]', 'tags')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Key/Value Pair')
    await page.fill('input[aria-label="Source Field Path"]', 'tagData')
    
    // Change key and value field names
    await page.fill('input[aria-label="Key Field Name"]', 'name')
    await page.fill('input[aria-label="Value Field Name"]', 'data')
    
    await page.click('button:has-text("Add Field"):not([disabled])')
    await expect(page.locator('text=tags')).toBeVisible()
  })

  test('should show example format in description', async ({ page }) => {
    await page.click('button:has-text("Add Field")')
    
    await page.fill('input[aria-label="Target Field Name"]', 'attributes')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Key/Value Pair')
    await page.fill('input[aria-label="Source Field Path"]', 'attrs')
    
    // Change field names and verify example updates
    await page.fill('input[aria-label="Key Field Name"]', 'attrName')
    await page.fill('input[aria-label="Value Field Name"]', 'attrValue')
    
    // Check that example reflects custom names
    await expect(page.locator('text*=attrName')).toBeVisible()
    await expect(page.locator('text*=attrValue')).toBeVisible()
    
    await page.click('button:has-text("Add Field"):not([disabled])')
  })

  test('should require source field for key/value pair', async ({ page }) => {
    await page.click('button:has-text("Add Field")')
    
    await page.fill('input[aria-label="Target Field Name"]', 'keyValues')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Key/Value Pair')
    
    // Try to submit without source field
    const addButton = page.locator('button:has-text("Add Field"):not([disabled])')
    await expect(addButton).toBeDisabled()
    
    // Fill source field
    await page.fill('input[aria-label="Source Field Path"]', 'data')
    await expect(addButton).toBeEnabled()
    
    await addButton.click()
    await expect(page.locator('text=keyValues')).toBeVisible()
  })

  test('should handle nested source paths for key/value pairs', async ({ page }) => {
    await page.click('button:has-text("Add Field")')
    
    await page.fill('input[aria-label="Target Field Name"]', 'settings')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Key/Value Pair')
    
    // Use nested source path
    await page.fill('input[aria-label="Source Field Path"]', 'config.userSettings')
    
    await page.click('button:has-text("Add Field"):not([disabled])')
    await expect(page.locator('text=settings')).toBeVisible()
  })

  test('should validate key and value field names', async ({ page }) => {
    await page.click('button:has-text("Add Field")')
    
    await page.fill('input[aria-label="Target Field Name"]', 'pairs')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Key/Value Pair')
    await page.fill('input[aria-label="Source Field Path"]', 'data')
    
    // Clear key field name (should require value)
    await page.fill('input[aria-label="Key Field Name"]', '')
    await expect(page.locator('button:has-text("Add Field"):not([disabled])')).toBeDisabled()
    
    // Restore key field
    await page.fill('input[aria-label="Key Field Name"]', 'k')
    
    // Clear value field name
    await page.fill('input[aria-label="Value Field Name"]', '')
    await expect(page.locator('button:has-text("Add Field"):not([disabled])')).toBeDisabled()
    
    // Restore value field
    await page.fill('input[aria-label="Value Field Name"]', 'v')
    await expect(page.locator('button:has-text("Add Field"):not([disabled])')).toBeEnabled()
    
    await page.click('button:has-text("Add Field"):not([disabled])')
  })
})
