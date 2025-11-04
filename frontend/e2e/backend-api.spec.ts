import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Backend API E2E Tests with Real Test Data
 * Tests the transformation API endpoints directly
 */

const API_BASE_URL = 'http://localhost:8080/api/transform'
const TEST_DATA_DIR = join(process.cwd(), '../test-data')

test.describe('Backend API Transformation Tests', () => {
  
  test('API Test 1: Simple UUID computed field', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/advanced`, {
      data: {
        inputData: '{"userId": "USR-001", "name": "Test User"}',
        sourceFormat: 'JSON',
        targetFormat: 'JSON',
        mappingRules: [
          {
            targetField: 'recordId',
            fieldType: 'COMPUTED',
            computedType: 'UUID'
          },
          {
            sourceField: 'userId',
            targetField: 'id',
            fieldType: 'SIMPLE'
          }
        ]
      }
    })

    expect(response.ok()).toBeTruthy()
    const result = await response.json()
    
    console.log('Response:', JSON.stringify(result, null, 2))
    
    expect(result.success).toBe(true)
    expect(result.transformedData || result.outputData).toBeDefined()
    
    const transformedData = result.transformedData || result.outputData
    const parsed = JSON.parse(transformedData)
    
    expect(parsed.recordId).toBeDefined()
    expect(parsed.recordId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    expect(parsed.id).toBe('USR-001')
  })

  test('API Test 2: All computed field types', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/advanced`, {
      data: {
        inputData: '{"items": [1, 2, 3, 4, 5], "value": 100}',
        sourceFormat: 'JSON',
        targetFormat: 'JSON',
        mappingRules: [
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
            sourceField: 'items',
            targetField: 'count',
            fieldType: 'COMPUTED',
            computedType: 'COUNT'
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
            transformationRule: 'TEST_VALUE'
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
    })

    expect(response.ok()).toBeTruthy()
    const result = await response.json()
    
    console.log('All Computed Types Response:', JSON.stringify(result, null, 2))
    
    expect(result.success).toBe(true)
    
    const transformedData = result.transformedData || result.outputData
    const data = JSON.parse(transformedData)
    
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
    
    // Verify date format (YYYY-MM-DD)
    expect(data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    
    // Verify ISO timestamp format
    expect(data.timestampIso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    
    // Verify random string length (should be 8 characters)
    expect(data.randomStr.length).toBe(8)
    
    // Verify random number is a number
    expect(typeof data.randomNum).toBe('number')
  })

  test('API Test 3: Nested object transformation', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/advanced`, {
      data: {
        inputData: '{"user": {"id": "USR-001", "profile": {"firstName": "John", "lastName": "Doe"}}}',
        sourceFormat: 'JSON',
        targetFormat: 'JSON',
        mappingRules: [
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
    })

    expect(response.ok()).toBeTruthy()
    const result = await response.json()
    
    console.log('Nested Object Response:', JSON.stringify(result, null, 2))
    
    expect(result.success).toBe(true)
    
    const transformedData = result.transformedData || result.outputData
    const data = JSON.parse(transformedData)
    
    expect(data.person).toBeDefined()
    expect(data.person.personId).toBe('USR-001')
    expect(data.person.firstName).toBe('John')
    expect(data.person.recordUuid).toBeDefined()
    expect(data.person.recordUuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  })

  test('API Test 4: Key-Value pair transformation', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/advanced`, {
      data: {
        inputData: '{"settings": {"theme": "dark", "language": "en", "notifications": true}}',
        sourceFormat: 'JSON',
        targetFormat: 'JSON',
        mappingRules: [
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
    })

    expect(response.ok()).toBeTruthy()
    const result = await response.json()
    
    console.log('Key-Value Pair Response:', JSON.stringify(result, null, 2))
    
    expect(result.success).toBe(true)
    
    const transformedData = result.transformedData || result.outputData
    const data = JSON.parse(transformedData)
    
    expect(data.configPairs).toBeDefined()
    expect(Array.isArray(data.configPairs)).toBe(true)
    expect(data.configPairs.length).toBeGreaterThan(0)
    
    // Verify key-value structure
    const firstPair = data.configPairs[0]
    expect(firstPair.key).toBeDefined()
    expect(firstPair.value).toBeDefined()
  })

  test('API Test 5: Real test data - Simple JSON', async ({ request }) => {
    const sourceData = readFileSync(join(TEST_DATA_DIR, 'test-simple-source.json'), 'utf-8')
    
    const response = await request.post(`${API_BASE_URL}/advanced`, {
      data: {
        inputData: sourceData,
        sourceFormat: 'JSON',
        targetFormat: 'JSON',
        mappingRules: [
          {
            targetField: 'recordId',
            fieldType: 'COMPUTED',
            computedType: 'UUID'
          },
          {
            targetField: 'importTimestamp',
            fieldType: 'COMPUTED',
            computedType: 'TIMESTAMP_ISO'
          },
          {
            sourceField: 'userId',
            targetField: 'id',
            fieldType: 'SIMPLE'
          },
          {
            sourceField: 'firstName',
            targetField: 'firstName',
            fieldType: 'SIMPLE'
          },
          {
            sourceField: 'lastName',
            targetField: 'lastName',
            fieldType: 'SIMPLE'
          },
          {
            sourceField: 'email',
            targetField: 'email',
            fieldType: 'SIMPLE'
          }
        ]
      }
    })

    expect(response.ok()).toBeTruthy()
    const result = await response.json()
    
    console.log('Simple JSON Response:', JSON.stringify(result, null, 2))
    
    expect(result.success).toBe(true)
    
    const transformedData = result.transformedData || result.outputData
    const data = JSON.parse(transformedData)
    
    expect(data.recordId).toBeDefined()
    expect(data.importTimestamp).toBeDefined()
    expect(data.id).toBe('USR-001')
    expect(data.firstName).toBe('Alice')
    expect(data.lastName).toBe('Smith')
    expect(data.email).toBe('alice.smith@example.com')
  })

  test('API Test 6: Real test data - Complex nested JSON', async ({ request }) => {
    const sourceData = readFileSync(join(TEST_DATA_DIR, 'complex-test-data.json'), 'utf-8')
    
    const response = await request.post(`${API_BASE_URL}/advanced`, {
      data: {
        inputData: sourceData,
        sourceFormat: 'JSON',
        targetFormat: 'JSON',
        mappingRules: [
          {
            targetField: 'company',
            fieldType: 'NESTED_OBJECT',
            isNested: true,
            nestingLevel: 1,
            children: [
              {
                sourceField: 'enterprise.id',
                targetField: 'companyId',
                fieldType: 'SIMPLE'
              },
              {
                sourceField: 'enterprise.name',
                targetField: 'companyName',
                fieldType: 'SIMPLE'
              },
              {
                targetField: 'processedAt',
                fieldType: 'COMPUTED',
                computedType: 'TIMESTAMP_ISO'
              }
            ]
          },
          {
            sourceField: 'enterprise.departments',
            targetField: 'departmentCount',
            fieldType: 'COMPUTED',
            computedType: 'COUNT'
          },
          {
            targetField: 'reportId',
            fieldType: 'COMPUTED',
            computedType: 'UUID'
          }
        ]
      }
    })

    expect(response.ok()).toBeTruthy()
    const result = await response.json()
    
    console.log('Complex JSON Response:', JSON.stringify(result, null, 2))
    
    expect(result.success).toBe(true)
    
    const transformedData = result.transformedData || result.outputData
    const data = JSON.parse(transformedData)
    
    expect(data.company).toBeDefined()
    expect(data.company.companyId).toBe('ENT-2025')
    expect(data.company.companyName).toBe('GlobalTech Solutions')
    expect(data.company.processedAt).toBeDefined()
    expect(data.departmentCount).toBeGreaterThan(0)
    expect(data.reportId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  })

  test('API Test 7: Key-Value pairs from real data', async ({ request }) => {
    const sourceData = readFileSync(join(TEST_DATA_DIR, 'test-simple-source.json'), 'utf-8')
    
    const response = await request.post(`${API_BASE_URL}/advanced`, {
      data: {
        inputData: sourceData,
        sourceFormat: 'JSON',
        targetFormat: 'JSON',
        mappingRules: [
          {
            sourceField: 'address',
            targetField: 'addressPairs',
            fieldType: 'KEY_VALUE_PAIR',
            isKeyValuePair: true,
            keyFieldName: 'field',
            valueFieldName: 'value'
          },
          {
            targetField: 'recordId',
            fieldType: 'COMPUTED',
            computedType: 'UUID'
          }
        ]
      }
    })

    expect(response.ok()).toBeTruthy()
    const result = await response.json()
    
    console.log('Key-Value from Real Data Response:', JSON.stringify(result, null, 2))
    
    expect(result.success).toBe(true)
    
    const transformedData = result.transformedData || result.outputData
    const data = JSON.parse(transformedData)
    
    expect(data.addressPairs).toBeDefined()
    expect(Array.isArray(data.addressPairs)).toBe(true)
    expect(data.addressPairs.length).toBeGreaterThan(0)
    
    // Check for expected address fields
    const fields = data.addressPairs.map((p: any) => p.field)
    expect(fields).toContain('street')
    expect(fields).toContain('city')
    expect(fields).toContain('state')
    expect(fields).toContain('zipCode')
  })

  test('API Test 8: Multiple field types in one transformation', async ({ request }) => {
    const sourceData = readFileSync(join(TEST_DATA_DIR, 'test-simple-source.json'), 'utf-8')
    
    const response = await request.post(`${API_BASE_URL}/advanced`, {
      data: {
        inputData: sourceData,
        sourceFormat: 'JSON',
        targetFormat: 'JSON',
        mappingRules: [
          // Computed UUID
          {
            targetField: 'recordId',
            fieldType: 'COMPUTED',
            computedType: 'UUID'
          },
          // Computed Timestamp
          {
            targetField: 'processedAt',
            fieldType: 'COMPUTED',
            computedType: 'TIMESTAMP_ISO'
          },
          // Simple mappings
          {
            sourceField: 'userId',
            targetField: 'userId',
            fieldType: 'SIMPLE'
          },
          {
            sourceField: 'firstName',
            targetField: 'firstName',
            fieldType: 'SIMPLE'
          },
          // Nested object with mixed field types
          {
            targetField: 'userProfile',
            fieldType: 'NESTED_OBJECT',
            isNested: true,
            nestingLevel: 1,
            children: [
              {
                sourceField: 'email',
                targetField: 'emailAddress',
                fieldType: 'SIMPLE'
              },
              {
                sourceField: 'age',
                targetField: 'age',
                fieldType: 'SIMPLE'
              },
              {
                targetField: 'profileCreated',
                fieldType: 'COMPUTED',
                computedType: 'DATE'
              }
            ]
          },
          // Key-value pairs
          {
            sourceField: 'address',
            targetField: 'addressFields',
            fieldType: 'KEY_VALUE_PAIR',
            isKeyValuePair: true,
            keyFieldName: 'name',
            valueFieldName: 'data'
          },
          // Count array
          {
            sourceField: 'scores',
            targetField: 'scoreCount',
            fieldType: 'COMPUTED',
            computedType: 'COUNT'
          }
        ]
      }
    })

    expect(response.ok()).toBeTruthy()
    const result = await response.json()
    
    console.log('Multiple Field Types Response:', JSON.stringify(result, null, 2))
    
    expect(result.success).toBe(true)
    
    const transformedData = result.transformedData || result.outputData
    const data = JSON.parse(transformedData)
    
    // Verify computed fields
    expect(data.recordId).toBeDefined()
    expect(data.processedAt).toBeDefined()
    
    // Verify simple fields
    expect(data.userId).toBe('USR-001')
    expect(data.firstName).toBe('Alice')
    
    // Verify nested object
    expect(data.userProfile).toBeDefined()
    expect(data.userProfile.emailAddress).toBe('alice.smith@example.com')
    expect(data.userProfile.age).toBe(28)
    expect(data.userProfile.profileCreated).toBeDefined()
    
    // Verify key-value pairs
    expect(data.addressFields).toBeDefined()
    expect(Array.isArray(data.addressFields)).toBe(true)
    
    // Verify count
    expect(data.scoreCount).toBe(5)
  })

  test('API Test 9: Health check', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`)
    
    expect(response.ok()).toBeTruthy()
    const text = await response.text()
    
    expect(text).toContain('running')
  })

  test('API Test 10: Error handling - Invalid JSON', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/advanced`, {
      data: {
        inputData: '{invalid json}',
        sourceFormat: 'JSON',
        targetFormat: 'JSON',
        mappingRules: [
          {
            targetField: 'test',
            fieldType: 'COMPUTED',
            computedType: 'UUID'
          }
        ]
      }
    })

    // Should return an error response
    const result = await response.json()
    
    console.log('Error Response:', JSON.stringify(result, null, 2))
    
    expect(result.success).toBe(false)
    expect(result.errorMessage || result.error).toBeDefined()
  })
})
