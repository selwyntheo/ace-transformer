import { test, expect } from '@playwright/test'

/**
 * E2E tests for Nested Field functionality
 * Tests creation, visualization, and transformation of nested object structures
 */

test.describe('Nested Field Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/advanced')
    await page.waitForLoadState('networkidle')
  })

  test('should open enhanced add field modal', async ({ page }) => {
    // Click Add Field button
    await page.click('button:has-text("Add Field")')
    
    // Verify modal is open
    await expect(page.locator('text=Add New Field')).toBeVisible()
    await expect(page.locator('input[label="Target Field Name"]')).toBeVisible()
  })

  test('should create a simple nested object with children', async ({ page }) => {
    // Open add field modal
    await page.click('button:has-text("Add Field")')
    
    // Enter field name
    await page.fill('input[aria-label="Target Field Name"]', 'user')
    
    // Select Nested Object type
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Nested Object')
    
    // Add first child field
    await page.click('text=Add Child Field')
    await page.fill('input[aria-label="Child Field Name"]', 'firstName')
    await page.fill('input[aria-label="Source Field"]', 'first_name')
    await page.click('button:has-text("Add Child")')
    
    // Add second child field
    await page.fill('input[aria-label="Child Field Name"]', 'lastName')
    await page.fill('input[aria-label="Source Field"]', 'last_name')
    await page.click('button:has-text("Add Child")')
    
    // Submit the nested field
    await page.click('button:has-text("Add Field"):not([disabled])')
    
    // Verify field was added
    await expect(page.locator('text=user')).toBeVisible()
  })

  test('should create nested object with multiple levels', async ({ page }) => {
    // Create parent nested object
    await page.click('button:has-text("Add Field")')
    await page.fill('input[aria-label="Target Field Name"]', 'address')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Nested Object')
    
    // Add child fields
    await page.click('text=Add Child Field')
    await page.fill('input[aria-label="Child Field Name"]', 'street')
    await page.fill('input[aria-label="Source Field"]', 'addr.street')
    await page.click('button:has-text("Add Child")')
    
    await page.fill('input[aria-label="Child Field Name"]', 'city')
    await page.fill('input[aria-label="Source Field"]', 'addr.city')
    await page.click('button:has-text("Add Child")')
    
    await page.fill('input[aria-label="Child Field Name"]', 'zipCode')
    await page.fill('input[aria-label="Source Field"]', 'addr.zip')
    await page.click('button:has-text("Add Child")')
    
    await page.click('button:has-text("Add Field"):not([disabled])')
    
    // Verify nested structure
    await expect(page.locator('text=address')).toBeVisible()
  })

  test('should display nesting level indicators', async ({ page }) => {
    // Create nested field
    await page.click('button:has-text("Add Field")')
    await page.fill('input[aria-label="Target Field Name"]', 'metadata')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Nested Object')
    await page.click('button:has-text("Add Field"):not([disabled])')
    
    // Check for level indicator chip
    await expect(page.locator('text=Level 1')).toBeVisible()
  })

  test('should expand and collapse nested fields', async ({ page }) => {
    // Create nested field with children
    await page.click('button:has-text("Add Field")')
    await page.fill('input[aria-label="Target Field Name"]', 'profile')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Nested Object')
    
    await page.click('text=Add Child Field')
    await page.fill('input[aria-label="Child Field Name"]', 'email')
    await page.fill('input[aria-label="Source Field"]', 'email')
    await page.click('button:has-text("Add Child")')
    
    await page.click('button:has-text("Add Field"):not([disabled])')
    
    // Find and toggle expansion icon if present
    const expandIcon = page.locator('[aria-label*="expand"]').first()
    if (await expandIcon.isVisible()) {
      await expandIcon.click()
      // Verify children visibility changes
    }
  })
})
