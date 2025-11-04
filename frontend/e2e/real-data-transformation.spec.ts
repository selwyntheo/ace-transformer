import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * E2E Test Suite: Real Data Transformation
 * Tests the complete transformation workflow with actual test data files
 */

const TEST_DATA_DIR = path.join(__dirname, '../../test-data')
const API_BASE_URL = 'http://localhost:8080/api/transform'

test.describe('Real Data Transformation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000')
    
    // Wait for the app to load
    await expect(page.locator('text=ACE Transformer')).toBeVisible({ timeout: 10000 })
  })

  test('Test 1: Simple JSON transformation with computed fields', async ({ page }) => {
    // Read test data
    const sourceData = fs.readFileSync(
      path.join(TEST_DATA_DIR, 'test-simple-source.json'),
      'utf-8'
    )

    // Upload source file
    await page.locator('[data-testid="file-upload-json"]').click()
    
    // Set file content (simulate file upload)
    await page.evaluate((data) => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      if (textarea) textarea.value = data
    }, sourceData)

    // Select transformation mode
    await page.locator('button:has-text("Advanced Transform")').click()
    
    // Wait for field mapping interface
    await expect(page.locator('text=Field Mapping')).toBeVisible()

    // Test Case 1.1: Add UUID computed field
    await page.locator('button:has-text("Add Field")').click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    await page.locator('input[name="targetField"]').fill('recordId')
    await page.locator('[data-testid="field-type-select"]').click()
    await page.locator('text=Computed Field').click()
    await page.locator('[data-testid="computed-type-select"]').click()
    await page.locator('text=UUID').click()
    await page.locator('button:has-text("Add")').click()

    // Verify field was added
    await expect(page.locator('text=recordId')).toBeVisible()
    await expect(page.locator('text=UUID')).toBeVisible()

    // Test Case 1.2: Add Timestamp computed field
    await page.locator('button:has-text("Add Field")').click()
    await page.locator('input[name="targetField"]').fill('importTimestamp')
    await page.locator('[data-testid="field-type-select"]').click()
    await page.locator('text=Computed Field').click()
    await page.locator('[data-testid="computed-type-select"]').click()
    await page.locator('text=Timestamp (ISO)').click()
    await page.locator('button:has-text("Add")').click()

    // Test Case 1.3: Direct field mapping
    await page.locator('button:has-text("Add Field")').click()
    await page.locator('input[name="targetField"]').fill('userId')
    await page.locator('input[name="sourceField"]').fill('userId')
    await page.locator('button:has-text("Add")').click()

    // Test Case 1.4: Nested field mapping
    await page.locator('button:has-text("Add Field")').click()
    await page.locator('input[name="targetField"]').fill('fullName')
    await page.locator('[data-testid="field-type-select"]').click()
    await page.locator('text=Computed Field').click()
    await page.locator('[data-testid="computed-type-select"]').click()
    await page.locator('text=Constant Value').click()
    await page.locator('input[name="constantValue"]').fill('Alice Smith')
    await page.locator('button:has-text("Add")').click()

    // Execute transformation
    await page.locator('button:has-text("Transform")').click()
    
    // Wait for result
    await expect(page.locator('text=Transformation Complete')).toBeVisible({ timeout: 5000 })

    // Verify output contains expected fields
    const resultText = await page.locator('[data-testid="transformation-result"]').textContent()
    expect(resultText).toContain('recordId')
    expect(resultText).toContain('importTimestamp')
    expect(resultText).toContain('userId')
  })

  test('Test 2: Complex nested JSON transformation', async ({ page }) => {
    // Read complex test data
    const sourceData = fs.readFileSync(
      path.join(TEST_DATA_DIR, 'complex-test-data.json'),
      'utf-8'
    )

    // Navigate to advanced transform
    await page.locator('button:has-text("Advanced Transform")').click()
    
    // Upload complex data
    await page.evaluate((data) => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      if (textarea) textarea.value = data
    }, sourceData)

    await page.locator('button:has-text("Parse Source")').click()
    
    // Wait for source fields to be extracted
    await page.waitForTimeout(1000)

    // Test Case 2.1: Create nested object field
    await page.locator('button:has-text("Add Field")').click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    await page.locator('input[name="targetField"]').fill('company')
    await page.locator('[data-testid="field-type-select"]').click()
    await page.locator('text=Nested Object').click()
    
    // Add child field: companyId
    await page.locator('button:has-text("Add Child Field")').click()
    await page.locator('input[name="childField-0"]').fill('companyId')
    await page.locator('[data-testid="child-source-0"]').fill('enterprise.id')
    
    // Add child field: companyName
    await page.locator('button:has-text("Add Child Field")').click()
    await page.locator('input[name="childField-1"]').fill('companyName')
    await page.locator('[data-testid="child-source-1"]').fill('enterprise.name')
    
    await page.locator('button:has-text("Add")').click()

    // Verify nested field was added
    await expect(page.locator('text=company')).toBeVisible()
    await expect(page.locator('text=Nested Object')).toBeVisible()

    // Test Case 2.2: Add computed count field for departments
    await page.locator('button:has-text("Add Field")').click()
    await page.locator('input[name="targetField"]').fill('departmentCount')
    await page.locator('[data-testid="field-type-select"]').click()
    await page.locator('text=Computed Field').click()
    await page.locator('[data-testid="computed-type-select"]').click()
    await page.locator('text=Count').click()
    await page.locator('input[name="sourceField"]').fill('enterprise.departments')
    await page.locator('button:has-text("Add")').click()

    // Execute transformation
    await page.locator('button:has-text("Transform")').click()
    
    // Wait for result
    await expect(page.locator('text=Transformation Complete')).toBeVisible({ timeout: 5000 })

    // Verify complex transformation results
    const resultText = await page.locator('[data-testid="transformation-result"]').textContent()
    expect(resultText).toContain('company')
    expect(resultText).toContain('companyId')
    expect(resultText).toContain('companyName')
    expect(resultText).toContain('departmentCount')
  })

  test('Test 3: CSV to JSON transformation', async ({ page }) => {
    // Read CSV test data
    const sourceData = fs.readFileSync(
      path.join(TEST_DATA_DIR, 'test-source-transactions.csv'),
      'utf-8'
    )

    // Select CSV format
    await page.locator('[data-testid="source-format-select"]').click()
    await page.locator('text=CSV').click()

    await page.locator('[data-testid="target-format-select"]').click()
    await page.locator('text=JSON').click()

    // Upload CSV data
    await page.evaluate((data) => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      if (textarea) textarea.value = data
    }, sourceData)

    // Navigate to advanced mode
    await page.locator('button:has-text("Advanced Transform")').click()
    
    // Parse source
    await page.locator('button:has-text("Parse Source")').click()
    await page.waitForTimeout(1000)

    // Test Case 3.1: Add UUID for each transaction
    await page.locator('button:has-text("Add Field")').click()
    await page.locator('input[name="targetField"]').fill('transactionId')
    await page.locator('[data-testid="field-type-select"]').click()
    await page.locator('text=Computed Field').click()
    await page.locator('[data-testid="computed-type-select"]').click()
    await page.locator('text=UUID').click()
    await page.locator('button:has-text("Add")').click()

    // Test Case 3.2: Add timestamp
    await page.locator('button:has-text("Add Field")').click()
    await page.locator('input[name="targetField"]').fill('processedAt')
    await page.locator('[data-testid="field-type-select"]').click()
    await page.locator('text=Computed Field').click()
    await page.locator('[data-testid="computed-type-select"]').click()
    await page.locator('text=Timestamp').click()
    await page.locator('button:has-text("Add")').click()

    // Execute transformation
    await page.locator('button:has-text("Transform")').click()
    
    // Wait for result
    await expect(page.locator('text=Transformation Complete')).toBeVisible({ timeout: 5000 })

    // Verify CSV to JSON conversion worked
    const resultText = await page.locator('[data-testid="transformation-result"]').textContent()
    expect(resultText).toContain('transactionId')
    expect(resultText).toContain('processedAt')
  })

  test('Test 4: XML to JSON transformation', async ({ page }) => {
    // Read XML test data
    const sourceData = fs.readFileSync(
      path.join(TEST_DATA_DIR, 'test-source-employees.xml'),
      'utf-8'
    )

    // Select XML format
    await page.locator('[data-testid="source-format-select"]').click()
    await page.locator('text=XML').click()

    await page.locator('[data-testid="target-format-select"]').click()
    await page.locator('text=JSON').click()

    // Upload XML data
    await page.evaluate((data) => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      if (textarea) textarea.value = data
    }, sourceData)

    // Navigate to advanced mode
    await page.locator('button:has-text("Advanced Transform")').click()
    
    // Parse source
    await page.locator('button:has-text("Parse Source")').click()
    await page.waitForTimeout(1000)

    // Add computed fields
    await page.locator('button:has-text("Add Field")').click()
    await page.locator('input[name="targetField"]').fill('employeeRecordId')
    await page.locator('[data-testid="field-type-select"]').click()
    await page.locator('text=Computed Field').click()
    await page.locator('[data-testid="computed-type-select"]').click()
    await page.locator('text=UUID').click()
    await page.locator('button:has-text("Add")').click()

    // Execute transformation
    await page.locator('button:has-text("Transform")').click()
    
    // Wait for result
    await expect(page.locator('text=Transformation Complete')).toBeVisible({ timeout: 5000 })

    // Verify XML to JSON conversion
    const resultText = await page.locator('[data-testid="transformation-result"]').textContent()
    expect(resultText).toContain('employeeRecordId')
  })

  test('Test 5: Key-Value Pair transformation', async ({ page }) => {
    const sourceData = fs.readFileSync(
      path.join(TEST_DATA_DIR, 'test-simple-source.json'),
      'utf-8'
    )

    // Navigate to advanced transform
    await page.locator('button:has-text("Advanced Transform")').click()
    
    // Upload data
    await page.evaluate((data) => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      if (textarea) textarea.value = data
    }, sourceData)

    await page.locator('button:has-text("Parse Source")').click()
    await page.waitForTimeout(1000)

    // Test Case 5.1: Create key-value pair from address object
    await page.locator('button:has-text("Add Field")').click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    await page.locator('input[name="targetField"]').fill('addressPairs')
    await page.locator('[data-testid="field-type-select"]').click()
    await page.locator('text=Key/Value Pair').click()
    
    await page.locator('input[name="sourceField"]').fill('address')
    await page.locator('input[name="keyFieldName"]').fill('field')
    await page.locator('input[name="valueFieldName"]').fill('value')
    
    await page.locator('button:has-text("Add")').click()

    // Verify key-value field was added
    await expect(page.locator('text=addressPairs')).toBeVisible()
    await expect(page.locator('text=Key/Value')).toBeVisible()

    // Execute transformation
    await page.locator('button:has-text("Transform")').click()
    
    // Wait for result
    await expect(page.locator('text=Transformation Complete')).toBeVisible({ timeout: 5000 })

    // Verify key-value pairs in result
    const resultText = await page.locator('[data-testid="transformation-result"]').textContent()
    expect(resultText).toContain('addressPairs')
    expect(resultText).toContain('field')
    expect(resultText).toContain('value')
  })

  test('Test 6: Multiple computed field types', async ({ page }) => {
    const sourceData = '{"items": [1, 2, 3, 4, 5], "counter": 0}'

    // Navigate to advanced transform
    await page.locator('button:has-text("Advanced Transform")').click()
    
    // Upload data
    await page.evaluate((data) => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement
      if (textarea) textarea.value = data
    }, sourceData)

    await page.locator('button:has-text("Parse Source")').click()
    await page.waitForTimeout(500)

    // Test Case 6.1: UUID
    await page.locator('button:has-text("Add Field")').click()
    await page.locator('input[name="targetField"]').fill('id')
    await page.locator('[data-testid="field-type-select"]').click()
    await page.locator('text=Computed Field').click()
    await page.locator('[data-testid="computed-type-select"]').click()
    await page.locator('text=UUID').click()
    await page.locator('button:has-text("Add")').click()

    // Test Case 6.2: Count
    await page.locator('button:has-text("Add Field")').click()
    await page.locator('input[name="targetField"]').fill('itemCount')
    await page.locator('[data-testid="field-type-select"]').click()
    await page.locator('text=Computed Field').click()
    await page.locator('[data-testid="computed-type-select"]').click()
    await page.locator('text=Count').click()
    await page.locator('input[name="sourceField"]').fill('items')
    await page.locator('button:has-text("Add")').click()

    // Test Case 6.3: Increment
    await page.locator('button:has-text("Add Field")').click()
    await page.locator('input[name="targetField"]').fill('sequence')
    await page.locator('[data-testid="field-type-select"]').click()
    await page.locator('text=Computed Field').click()
    await page.locator('[data-testid="computed-type-select"]').click()
    await page.locator('text=Auto-Increment').click()
    await page.locator('button:has-text("Add")').click()

    // Test Case 6.4: Random String
    await page.locator('button:has-text("Add Field")').click()
    await page.locator('input[name="targetField"]').fill('randomCode')
    await page.locator('[data-testid="field-type-select"]').click()
    await page.locator('text=Computed Field').click()
    await page.locator('[data-testid="computed-type-select"]').click()
    await page.locator('text=Random String').click()
    await page.locator('button:has-text("Add")').click()

    // Test Case 6.5: Random Number
    await page.locator('button:has-text("Add Field")').click()
    await page.locator('input[name="targetField"]').fill('randomNumber')
    await page.locator('[data-testid="field-type-select"]').click()
    await page.locator('text=Computed Field').click()
    await page.locator('[data-testid="computed-type-select"]').click()
    await page.locator('text=Random Number').click()
    await page.locator('button:has-text("Add")').click()

    // Test Case 6.6: Date
    await page.locator('button:has-text("Add Field")').click()
    await page.locator('input[name="targetField"]').fill('createdDate')
    await page.locator('[data-testid="field-type-select"]').click()
    await page.locator('text=Computed Field').click()
    await page.locator('[data-testid="computed-type-select"]').click()
    await page.locator('text=Date (YYYY-MM-DD)').click()
    await page.locator('button:has-text("Add")').click()

    // Execute transformation
    await page.locator('button:has-text("Transform")').click()
    
    // Wait for result
    await expect(page.locator('text=Transformation Complete')).toBeVisible({ timeout: 5000 })

    // Verify all computed fields in result
    const resultText = await page.locator('[data-testid="transformation-result"]').textContent()
    expect(resultText).toContain('id')
    expect(resultText).toContain('itemCount')
    expect(resultText).toContain('sequence')
    expect(resultText).toContain('randomCode')
    expect(resultText).toContain('randomNumber')
    expect(resultText).toContain('createdDate')
  })

  test('Test 7: Backend API direct call - Simple transformation', async ({ request }) => {
    // Test direct API call without UI
    const sourceData = {
      userId: 'USR-001',
      name: 'Test User',
      email: 'test@example.com'
    }

    const transformationRequest = {
      sourceData: JSON.stringify(sourceData),
      sourceFormat: 'JSON',
      targetFormat: 'JSON',
      fieldMappings: [
        {
          sourceField: 'userId',
          targetField: 'id',
          fieldType: 'SIMPLE'
        },
        {
          targetField: 'recordId',
          fieldType: 'COMPUTED',
          computedType: 'UUID'
        },
        {
          targetField: 'timestamp',
          fieldType: 'COMPUTED',
          computedType: 'TIMESTAMP_ISO'
        }
      ]
    }

    const response = await request.post(`${API_BASE_URL}/advanced`, {
      data: transformationRequest,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    expect(response.ok()).toBeTruthy()
    const result = await response.json()
    
    expect(result.success).toBe(true)
    expect(result.transformedData).toContain('recordId')
    expect(result.transformedData).toContain('timestamp')
    expect(result.transformedData).toContain('id')
  })

  test('Test 8: Backend API - Nested object transformation', async ({ request }) => {
    const sourceData = {
      user: {
        id: 'USR-001',
        profile: {
          firstName: 'John',
          lastName: 'Doe'
        }
      }
    }

    const transformationRequest = {
      sourceData: JSON.stringify(sourceData),
      sourceFormat: 'JSON',
      targetFormat: 'JSON',
      fieldMappings: [
        {
          targetField: 'person',
          fieldType: 'NESTED_OBJECT',
          isNested: true,
          nestingLevel: 1,
          children: [
            {
              sourceField: 'user.id',
              targetField: 'personId',
              fieldType: 'SIMPLE'
            },
            {
              sourceField: 'user.profile.firstName',
              targetField: 'firstName',
              fieldType: 'SIMPLE'
            },
            {
              targetField: 'recordUuid',
              fieldType: 'COMPUTED',
              computedType: 'UUID'
            }
          ]
        }
      ]
    }

    const response = await request.post(`${API_BASE_URL}/advanced`, {
      data: transformationRequest,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    expect(response.ok()).toBeTruthy()
    const result = await response.json()
    
    expect(result.success).toBe(true)
    expect(result.transformedData).toContain('person')
    expect(result.transformedData).toContain('personId')
    expect(result.transformedData).toContain('recordUuid')
  })

  test('Test 9: Backend API - Key-Value pair transformation', async ({ request }) => {
    const sourceData = {
      settings: {
        theme: 'dark',
        language: 'en',
        notifications: true
      }
    }

    const transformationRequest = {
      sourceData: JSON.stringify(sourceData),
      sourceFormat: 'JSON',
      targetFormat: 'JSON',
      fieldMappings: [
        {
          sourceField: 'settings',
          targetField: 'configPairs',
          fieldType: 'KEY_VALUE_PAIR',
          isKeyValuePair: true,
          keyFieldName: 'key',
          valueFieldName: 'value'
        }
      ]
    }

    const response = await request.post(`${API_BASE_URL}/advanced`, {
      data: transformationRequest,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    expect(response.ok()).toBeTruthy()
    const result = await response.json()
    
    expect(result.success).toBe(true)
    expect(result.transformedData).toContain('configPairs')
    expect(result.transformedData).toContain('key')
    expect(result.transformedData).toContain('value')
  })

  test('Test 10: Backend API - All computed types', async ({ request }) => {
    const sourceData = {
      items: [1, 2, 3, 4, 5]
    }

    const transformationRequest = {
      sourceData: JSON.stringify(sourceData),
      sourceFormat: 'JSON',
      targetFormat: 'JSON',
      fieldMappings: [
        {
          targetField: 'uuid',
          fieldType: 'COMPUTED',
          computedType: 'UUID'
        },
        {
          targetField: 'timestamp',
          fieldType: 'COMPUTED',
          computedType: 'TIMESTAMP'
        },
        {
          targetField: 'timestampIso',
          fieldType: 'COMPUTED',
          computedType: 'TIMESTAMP_ISO'
        },
        {
          targetField: 'date',
          fieldType: 'COMPUTED',
          computedType: 'DATE'
        },
        {
          targetField: 'count',
          fieldType: 'COMPUTED',
          computedType: 'COUNT',
          sourceField: 'items'
        },
        {
          targetField: 'sequence',
          fieldType: 'COMPUTED',
          computedType: 'INCREMENT'
        },
        {
          targetField: 'constant',
          fieldType: 'COMPUTED',
          computedType: 'CONSTANT',
          constantValue: 'TEST_VALUE'
        },
        {
          targetField: 'randomStr',
          fieldType: 'COMPUTED',
          computedType: 'RANDOM_STRING'
        },
        {
          targetField: 'randomNum',
          fieldType: 'COMPUTED',
          computedType: 'RANDOM_NUMBER'
        }
      ]
    }

    const response = await request.post(`${API_BASE_URL}/advanced`, {
      data: transformationRequest,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    expect(response.ok()).toBeTruthy()
    const result = await response.json()
    
    expect(result.success).toBe(true)
    const data = JSON.parse(result.transformedData)
    
    // Verify all computed fields exist
    expect(data.uuid).toBeDefined()
    expect(data.timestamp).toBeDefined()
    expect(data.timestampIso).toBeDefined()
    expect(data.date).toBeDefined()
    expect(data.count).toBe(5)
    expect(data.sequence).toBeDefined()
    expect(data.constant).toBe('TEST_VALUE')
    expect(data.randomStr).toBeDefined()
    expect(data.randomNum).toBeDefined()
    
    // Verify UUID format
    expect(data.uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    
    // Verify date format
    expect(data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    
    // Verify ISO timestamp format
    expect(data.timestampIso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })
})
