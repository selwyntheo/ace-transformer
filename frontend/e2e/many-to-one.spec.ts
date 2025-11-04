import { test, expect } from '@playwright/test'

test.describe('Backend API - Many-to-One Aggregation', () => {
  const backendUrl = 'http://localhost:8080'

  test('E2E-ManyToOne-1: Aggregate account IDs by common fields', async ({ request }) => {
    const testData = {
      sourceFormat: 'JSON',
      targetFormat: 'JSON',
      sourceData: JSON.stringify([
        { "accountId": "66676", "sourceSystem": "KAI", "fromDate": "2025-11-02", "toDate": "2025-11-03" },
        { "accountId": "66677", "sourceSystem": "KAI", "fromDate": "2025-11-02", "toDate": "2025-11-03" },
        { "accountId": "66678", "sourceSystem": "KAI", "fromDate": "2025-11-02", "toDate": "2025-11-03" }
      ]),
      fieldMappings: [
        {
          sourceField: "",  // Will use the root array
          targetField: "aggregatedAccounts",
          fieldType: "MANY_TO_ONE",
          aggregationField: "accountId",
          groupByFields: ["sourceSystem", "fromDate", "toDate"]
        }
      ]
    }

    const response = await request.post(`${backendUrl}/api/transform/advanced`, {
      data: testData,
      headers: { 'Content-Type': 'application/json' }
    })

    expect(response.ok()).toBeTruthy()
    const result = await response.json()
    
    console.log('Many-to-One Response:', JSON.stringify(result, null, 2))
    
    expect(result.success).toBe(true)
    expect(result.transformedData).toBeDefined()
    
    const transformed = JSON.parse(result.transformedData)
    expect(transformed.aggregatedAccounts).toBeDefined()
    expect(Array.isArray(transformed.aggregatedAccounts)).toBe(true)
    expect(transformed.aggregatedAccounts.length).toBe(1)
    
    const aggregated = transformed.aggregatedAccounts[0]
    expect(aggregated.accountId).toBeDefined()
    expect(Array.isArray(aggregated.accountId)).toBe(true)
    expect(aggregated.accountId).toEqual(expect.arrayContaining(['66676', '66677', '66678']))
    expect(aggregated.sourceSystem).toBe('KAI')
    expect(aggregated.fromDate).toBe('2025-11-02')
    expect(aggregated.toDate).toBe('2025-11-03')
    
    console.log('✓ Successfully aggregated 3 accounts into 1 grouped record')
  })

  test('E2E-ManyToOne-2: Aggregate with multiple groups', async ({ request }) => {
    const testData = {
      sourceFormat: 'JSON',
      targetFormat: 'JSON',
      sourceData: JSON.stringify([
        { "accountId": "A1", "region": "US", "status": "active" },
        { "accountId": "A2", "region": "US", "status": "active" },
        { "accountId": "B1", "region": "EU", "status": "active" },
        { "accountId": "B2", "region": "EU", "status": "active" },
        { "accountId": "C1", "region": "US", "status": "inactive" }
      ]),
      fieldMappings: [
        {
          sourceField: "",
          targetField: "groupedAccounts",
          fieldType: "MANY_TO_ONE",
          aggregationField: "accountId",
          groupByFields: ["region", "status"]
        }
      ]
    }

    const response = await request.post(`${backendUrl}/api/transform/advanced`, {
      data: testData,
      headers: { 'Content-Type': 'application/json' }
    })

    expect(response.ok()).toBeTruthy()
    const result = await response.json()
    
    expect(result.success).toBe(true)
    const transformed = JSON.parse(result.transformedData)
    
    expect(transformed.groupedAccounts).toBeDefined()
    expect(transformed.groupedAccounts.length).toBe(3)  // 3 distinct groups
    
    // Find US-active group
    const usActive = transformed.groupedAccounts.find((g: any) => g.region === 'US' && g.status === 'active')
    expect(usActive).toBeDefined()
    expect(usActive.accountId).toEqual(expect.arrayContaining(['A1', 'A2']))
    
    // Find EU-active group
    const euActive = transformed.groupedAccounts.find((g: any) => g.region === 'EU' && g.status === 'active')
    expect(euActive).toBeDefined()
    expect(euActive.accountId).toEqual(expect.arrayContaining(['B1', 'B2']))
    
    // Find US-inactive group
    const usInactive = transformed.groupedAccounts.find((g: any) => g.region === 'US' && g.status === 'inactive')
    expect(usInactive).toBeDefined()
    expect(usInactive.accountId).toEqual(['C1'])
    
    console.log('✓ Successfully created 3 groups from 5 accounts')
  })

  test('E2E-ManyToOne-3: Aggregate nested array data', async ({ request }) => {
    const testData = {
      sourceFormat: 'JSON',
      targetFormat: 'JSON',
      sourceData: JSON.stringify({
        transactions: [
          { "orderId": "O1", "customerId": "C1", "amount": 100 },
          { "orderId": "O2", "customerId": "C1", "amount": 200 },
          { "orderId": "O3", "customerId": "C2", "amount": 150 }
        ]
      }),
      fieldMappings: [
        {
          sourceField: "transactions",
          targetField: "customerOrders",
          fieldType: "MANY_TO_ONE",
          aggregationField: "orderId",
          groupByFields: ["customerId"]
        }
      ]
    }

    const response = await request.post(`${backendUrl}/api/transform/advanced`, {
      data: testData,
      headers: { 'Content-Type': 'application/json' }
    })

    expect(response.ok()).toBeTruthy()
    const result = await response.json()
    
    expect(result.success).toBe(true)
    const transformed = JSON.parse(result.transformedData)
    
    expect(transformed.customerOrders).toBeDefined()
    expect(transformed.customerOrders.length).toBe(2)  // 2 customers
    
    const customer1 = transformed.customerOrders.find((c: any) => c.customerId === 'C1')
    expect(customer1).toBeDefined()
    expect(customer1.orderId).toEqual(expect.arrayContaining(['O1', 'O2']))
    
    const customer2 = transformed.customerOrders.find((c: any) => c.customerId === 'C2')
    expect(customer2).toBeDefined()
    expect(customer2.orderId).toEqual(['O3'])
    
    console.log('✓ Successfully aggregated nested array with customer grouping')
  })
})
