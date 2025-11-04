import { test, expect, Page } from '@playwright/test'

test.describe('UI Tree Structure Builder - EnhancedAddFieldModal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1000)

    // Setup: Select formats and load sample data
    await page.getByLabel('Source Format').click()
    await page.getByRole('option', { name: /json/i }).click()
    await page.waitForTimeout(500)

    await page.getByLabel('Target Format').click()
    await page.getByRole('option', { name: /xml/i }).click()
    await page.waitForTimeout(500)

    await page.getByRole('button', { name: /json sample/i }).click()
    await page.waitForTimeout(1500)
  })

  const openAddFieldModal = async (page: Page) => {
    const addFieldButton = page.getByRole('button', { name: /^add field$/i })
    await addFieldButton.waitFor({ state: 'visible', timeout: 15000 })
    await addFieldButton.click()
    await page.waitForTimeout(500)
  }

  const selectFieldType = async (page: Page, fieldType: string) => {
    // Material-UI Select: find combobox by looking for the one in the dialog
    const dialog = page.getByRole('dialog')
    const fieldTypeSelect = dialog.locator('[role="combobox"]').first()
    await fieldTypeSelect.click()
    await page.waitForTimeout(300)
    await page.getByRole('option', { name: new RegExp(fieldType, 'i') }).click()
    await page.waitForTimeout(500)
  }

  test('UI-1: Modal opens and displays basic fields', async ({ page }) => {
    await openAddFieldModal(page)

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByLabel('Target Field Name')).toBeVisible()
    await expect(page.getByText('Field Type').first()).toBeVisible()
    
    console.log('✓ Modal opens successfully')
  })

  test('UI-2: Tree Structure Builder appears for NESTED_OBJECT', async ({ page }) => {
    await openAddFieldModal(page)

    // Initially not visible
    await expect(page.getByText(/define child fields/i)).not.toBeVisible()

    // Select Nested Object type
    await selectFieldType(page, 'nested object')

    // Now the nested object configuration should be visible
    await expect(page.getByText(/define child fields/i)).toBeVisible()
    await expect(page.getByLabel('Nesting Level')).toBeVisible()
    
    console.log('✓ Nested object configuration appears')
  })

  test('UI-3: Create root level nested field', async ({ page }) => {
    await openAddFieldModal(page)

    await page.getByLabel('Target Field Name').fill('Organization')
    await selectFieldType(page, 'nested object')

    // For nested objects, we don't need to fill source field (it's optional)
    // Just add the field directly

    // Click Add Field (last button with that text)
    const addButtons = await page.getByRole('button', { name: /^add field$/i }).all()
    await addButtons[addButtons.length - 1].click()
    await page.waitForTimeout(500)

    await expect(page.getByRole('dialog')).not.toBeVisible()
    
    console.log('✓ Root nested field created')
  })

  test('UI-4: Parent node selector appears when existingFields exist', async ({ page }) => {
    // Create root field first
    await openAddFieldModal(page)
    await page.getByLabel('Target Field Name').fill('Organization')
    await selectFieldType(page, 'nested object')
    let addButtons = await page.getByRole('button', { name: /^add field$/i }).all()
    await addButtons[addButtons.length - 1].click()
    await page.waitForTimeout(1000)

    // Create child field
    await openAddFieldModal(page)
    await page.getByLabel('Target Field Name').fill('Departments')
    await selectFieldType(page, 'nested object')

    // Verify Tree Structure Builder appears
    await expect(page.getByText(/tree structure builder/i)).toBeVisible()

    // Verify there are now 2 comboboxes (Field Type + Parent Node)
    const dialog = page.getByRole('dialog')
    const comboboxCount = await dialog.locator('[role="combobox"]').count()
    expect(comboboxCount).toBeGreaterThanOrEqual(2)
    
    console.log('✓ Parent node selector appears with existing fields')
  })

  test('UI-5: Cancel closes modal without saving', async ({ page }) => {
    await openAddFieldModal(page)

    await page.getByLabel('Target Field Name').fill('TestField')
    
    await page.getByRole('button', { name: /cancel/i }).click()
    await page.waitForTimeout(300)

    await expect(page.getByRole('dialog')).not.toBeVisible()
    
    console.log('✓ Cancel works correctly')
  })
})
