import { test, expect, Page } from '@playwright/test'

test.describe('UI EnhancedAddFieldModal - All Field Types', () => {
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
    const dialog = page.getByRole('dialog')
    const fieldTypeSelect = dialog.locator('[role="combobox"]').first()
    await fieldTypeSelect.click()
    await page.waitForTimeout(300)
    await page.getByRole('option', { name: new RegExp(fieldType, 'i') }).click()
    await page.waitForTimeout(500)
  }

  test('UI-FT-1: Create SIMPLE field', async ({ page }) => {
    await openAddFieldModal(page)

    await page.getByLabel('Target Field Name').fill('userName')
    
    // Field type should be SIMPLE by default - just add field
    await page.getByLabel('Source Field Path').fill('user.name')

    const addButtons = await page.getByRole('button', { name: /^add field$/i }).all()
    await addButtons[addButtons.length - 1].click()
    await page.waitForTimeout(500)

    await expect(page.getByRole('dialog')).not.toBeVisible()

    console.log('✓ SIMPLE field created')
  })

  test('UI-FT-2: Create COMPUTED field with UUID', async ({ page }) => {
    await openAddFieldModal(page)

    await page.getByLabel('Target Field Name').fill('userId')
    
    // Select COMPUTED type
    await selectFieldType(page, 'computed')

    // Verify computed type dropdown appears - use first() to avoid strict mode
    await expect(page.getByText('Computed Type').first()).toBeVisible()

    // UUID should be default - just add field
    const addButtons = await page.getByRole('button', { name: /^add field$/i }).all()
    await addButtons[addButtons.length - 1].click()
    await page.waitForTimeout(500)

    await expect(page.getByRole('dialog')).not.toBeVisible()

    console.log('✓ COMPUTED field with UUID created')
  })

  test('UI-FT-3: Create KEY_VALUE_PAIR field', async ({ page }) => {
    await openAddFieldModal(page)

    await page.getByLabel('Target Field Name').fill('metadata')
    
    // Select KEY_VALUE_PAIR type
    await selectFieldType(page, 'key.*value.*pair')

    // Verify key/value field name inputs appear
    await expect(page.getByLabel('Key Field Name')).toBeVisible()
    await expect(page.getByLabel('Value Field Name')).toBeVisible()

    // Fill source field
    await page.getByLabel('Source Field Path').fill('metadata')

    const addButtons = await page.getByRole('button', { name: /^add field$/i }).all()
    await addButtons[addButtons.length - 1].click()
    await page.waitForTimeout(500)

    await expect(page.getByRole('dialog')).not.toBeVisible()

    console.log('✓ KEY_VALUE_PAIR field created')
  })

  test('UI-FT-4: Field type switching updates UI correctly', async ({ page }) => {
    await openAddFieldModal(page)

    // Start with SIMPLE - verify Source Field Path is visible
    await expect(page.getByLabel('Source Field Path')).toBeVisible()
    await expect(page.getByText('Computed Type').first()).not.toBeVisible()

    // Switch to COMPUTED
    await selectFieldType(page, 'computed')
    await expect(page.getByText('Computed Type').first()).toBeVisible()

    // Switch to KEY_VALUE_PAIR
    await selectFieldType(page, 'key.*value.*pair')
    await expect(page.getByLabel('Key Field Name')).toBeVisible()

    // Switch to NESTED_OBJECT
    await selectFieldType(page, 'nested object')
    await expect(page.getByText(/define child fields/i)).toBeVisible()

    console.log('✓ Field type switching works correctly')
  })

  test('UI-FT-5: Multiple fields can be added sequentially', async ({ page }) => {
    const fieldsToAdd = [
      { name: 'field1', source: 'f1' },
      { name: 'field2', source: 'f2' },
      { name: 'field3', source: 'f3' }
    ]

    for (const field of fieldsToAdd) {
      await openAddFieldModal(page)
      await page.getByLabel('Target Field Name').fill(field.name)
      await page.getByLabel('Source Field Path').fill(field.source)
      const addButtons = await page.getByRole('button', { name: /^add field$/i }).all()
      await addButtons[addButtons.length - 1].click()
      await page.waitForTimeout(800)
    }

    // Verify modal is closed after last field
    await expect(page.getByRole('dialog')).not.toBeVisible()

    console.log('✓ Multiple fields added sequentially')
  })
})
