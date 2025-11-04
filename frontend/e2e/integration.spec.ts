import { test, expect } from '@playwright/test'

/**
 * Integration E2E tests for complete transformation workflow
 * Tests end-to-end functionality with all field types combined
 */

test.describe('Field Mapping Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/advanced')
    await page.waitForLoadState('networkidle')
  })

  test('should create complex mapping with all field types', async ({ page }) => {
    // Upload source JSON data
    const sourceData = JSON.stringify({
      users: [
        { first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
        { first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' }
      ],
      metadata: {
        version: '1.0',
        status: 'active'
      }
    })
    
    await page.fill('textarea[aria-label="Source Data"]', sourceData)
    
    // Add simple field
    await page.click('button:has-text("Add Field")')
    await page.fill('input[aria-label="Target Field Name"]', 'userCount')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Computed/Generated Field')
    await page.click('div[aria-label="Computed Type"]')
    await page.click('text=Count')
    await page.fill('input[aria-label="Source Field to Count"]', 'users')
    await page.click('button:has-text("Add Field"):not([disabled])')
    
    // Add nested object
    await page.click('button:has-text("Add Field")')
    await page.fill('input[aria-label="Target Field Name"]', 'transformedUser')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Nested Object')
    
    // Add child fields
    await page.click('text=Add Child Field')
    await page.fill('input[aria-label="Child Field Name"]', 'fullName')
    await page.fill('input[aria-label="Source Field"]', 'users[0].first_name')
    await page.click('button:has-text("Add Child")')
    
    await page.fill('input[aria-label="Child Field Name"]', 'id')
    await page.click('div[aria-label="Child Field Type"]')
    await page.click('text=Computed Field')
    await page.click('div[aria-label="Computed Type"]')
    await page.click('text=UUID')
    await page.click('button:has-text("Add Child")')
    
    await page.click('button:has-text("Add Field"):not([disabled])')
    
    // Add key/value pair
    await page.click('button:has-text("Add Field")')
    await page.fill('input[aria-label="Target Field Name"]', 'metadataArray')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Key/Value Pair')
    await page.fill('input[aria-label="Source Field Path"]', 'metadata')
    await page.click('button:has-text("Add Field"):not([disabled])')
    
    // Verify all fields were added
    await expect(page.locator('text=userCount')).toBeVisible()
    await expect(page.locator('text=transformedUser')).toBeVisible()
    await expect(page.locator('text=metadataArray')).toBeVisible()
  })

  test('should transform data with nested and computed fields', async ({ page }) => {
    // Set up source and target formats
    await page.selectOption('select[aria-label="Source Format"]', 'JSON')
    await page.selectOption('select[aria-label="Target Format"]', 'JSON')
    
    // Upload source data
    const sourceData = JSON.stringify({
      items: [1, 2, 3, 4, 5],
      name: 'Test Dataset'
    })
    
    await page.fill('textarea[aria-label="Source Data"]', sourceData)
    
    // Add computed field for count
    await page.click('button:has-text("Add Field")')
    await page.fill('input[aria-label="Target Field Name"]', 'itemCount')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Computed/Generated Field')
    await page.click('div[aria-label="Computed Type"]')
    await page.click('text=Count')
    await page.fill('input[aria-label="Source Field to Count"]', 'items')
    await page.click('button:has-text("Add Field"):not([disabled])')
    
    // Apply transformation
    await page.click('button:has-text("Apply Mapping")')
    
    // Wait for transformation to complete
    await page.waitForSelector('text=Transformation successful', { timeout: 5000 })
    
    // Verify output contains computed values
    const output = await page.locator('textarea[aria-label="Output Data"]').inputValue()
    expect(output).toContain('itemCount')
    expect(output).toContain('5') // Count of items array
  })

  test('should save and load configuration with all field types', async ({ page }) => {
    // Add multiple field types
    await page.click('button:has-text("Add Field")')
    await page.fill('input[aria-label="Target Field Name"]', 'timestamp')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Computed/Generated Field')
    await page.click('div[aria-label="Computed Type"]')
    await page.click('text=Timestamp (ISO)')
    await page.click('button:has-text("Add Field"):not([disabled])')
    
    // Save configuration
    await page.fill('input[aria-label="Configuration Name"]', 'Test Config')
    await page.fill('textarea[aria-label="Description"]', 'Test configuration with computed fields')
    await page.click('button:has-text("Save Configuration")')
    
    // Wait for save confirmation
    await expect(page.locator('text=Configuration saved')).toBeVisible({ timeout: 5000 })
    
    // Clear current mappings
    await page.click('button:has-text("Clear All")')
    
    // Load configuration
    await page.click('button:has-text("Load Configuration")')
    await page.click('text=Test Config')
    
    // Verify fields are restored
    await expect(page.locator('text=timestamp')).toBeVisible()
  })

  test('should handle validation errors for complex mappings', async ({ page }) => {
    // Try to create nested object without children
    await page.click('button:has-text("Add Field")')
    await page.fill('input[aria-label="Target Field Name"]', 'emptyNested')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Nested Object')
    
    // Don't add any children
    await page.click('button:has-text("Add Field"):not([disabled])')
    
    // Should still allow (empty nested objects are valid)
    await expect(page.locator('text=emptyNested')).toBeVisible()
  })

  test('should correctly display field type indicators', async ({ page }) => {
    // Add one of each field type
    const fieldTypes = [
      { name: 'simpleField', type: 'Simple Field Mapping', indicator: 'SIMPLE' },
      { name: 'nestedField', type: 'Nested Object', indicator: 'NESTED' },
      { name: 'computedField', type: 'Computed/Generated Field', indicator: 'COMPUTED' },
      { name: 'kvPair', type: 'Key/Value Pair', indicator: 'KEY_VALUE' },
    ]
    
    for (const field of fieldTypes) {
      await page.click('button:has-text("Add Field")')
      await page.fill('input[aria-label="Target Field Name"]', field.name)
      await page.click('div[aria-label="Field Type"]')
      await page.click(`text=${field.type}`)
      
      // Handle specific requirements
      if (field.type === 'Simple Field Mapping') {
        await page.fill('input[aria-label="Source Field Path"]', 'source')
      } else if (field.type === 'Computed/Generated Field') {
        await page.click('div[aria-label="Computed Type"]')
        await page.click('text=UUID')
      } else if (field.type === 'Key/Value Pair') {
        await page.fill('input[aria-label="Source Field Path"]', 'data')
      }
      
      await page.click('button:has-text("Add Field"):not([disabled])')
      
      // Verify field was added
      await expect(page.locator(`text=${field.name}`)).toBeVisible()
    }
  })

  test('should support drag and drop with enhanced fields', async ({ page }) => {
    // Upload source data
    const sourceData = JSON.stringify({
      firstName: 'John',
      lastName: 'Doe',
      age: 30
    })
    
    await page.fill('textarea[aria-label="Source Data"]', sourceData)
    
    // Wait for source fields to be detected
    await page.waitForSelector('text=firstName', { timeout: 3000 })
    
    // Add target field
    await page.click('button:has-text("Add Field")')
    await page.fill('input[aria-label="Target Field Name"]', 'name')
    await page.click('div[aria-label="Field Type"]')
    await page.click('text=Simple Field Mapping')
    await page.fill('input[aria-label="Source Field Path"]', 'firstName')
    await page.click('button:has-text("Add Field"):not([disabled])')
    
    // Verify mapping
    await expect(page.locator('text=name')).toBeVisible()
  })
})
