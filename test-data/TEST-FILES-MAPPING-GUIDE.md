# Test Files Mapping Guide

## Overview
This guide provides complete mapping examples for all test files, demonstrating every type of mapping including computed fields like UUID, timestamps, and transformations.

---

## Test File 1: E-Commerce Order (JSON to JSON)

### Source: `test-source-complex.json`
Complex nested JSON with order data including customer info, items, payment, and shipping.

### Target: `test-target-structure.json`
Different structure requiring computed fields and transformations.

### Complete Mapping Configuration

#### 1. Generate Unique Record ID (UUID)
```json
{
  "type": "computed",
  "target": "recordId",
  "computedFunction": "UUID"
}
Result: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
```

#### 2. Generate Import Timestamp
```json
{
  "type": "computed",
  "target": "importTimestamp",
  "computedFunction": "TIMESTAMP"
}
Result: "2025-11-03T15:30:00.000Z"
```

#### 3. Direct Order ID Mapping
```json
{
  "type": "direct",
  "target": "transactionId",
  "source": ["orderId"]
}
Result: "ORD-2025-001234"
```

#### 4. Buyer ID from Customer ID (Nested)
```json
{
  "type": "direct",
  "target": "buyer.buyerId",
  "source": ["customer.customerId"]
}
Result: "CUST-456789"
```

#### 5. Full Name Concatenation (Many-to-1)
```json
{
  "type": "computed",
  "target": "buyer.fullName",
  "computedFunction": "CONCAT",
  "source": ["customer.personalInfo.firstName", "customer.personalInfo.lastName"]
}
Result: "Sarah Johnson"
```

#### 6. Email (Deep Nested)
```json
{
  "type": "direct",
  "target": "buyer.email",
  "source": ["customer.contactDetails.primaryEmail"]
}
Result: "sarah.johnson@email.com"
```

#### 7. Phone Number with Transformation
```json
{
  "type": "direct",
  "target": "buyer.phoneNumber",
  "source": ["customer.contactDetails.phones[].number"],
  "transformation": "concat"
}
Result: "+1-555-0101 +1-555-0102" (if multiple phones)
```

#### 8. Full Address (Many-to-1 Concatenation)
```json
{
  "type": "computed",
  "target": "buyer.location.fullAddress",
  "computedFunction": "CUSTOM",
  "customExpression": "customer.addresses[0].addressLine1 + ', ' + customer.addresses[0].city + ', ' + customer.addresses[0].state + ' ' + customer.addresses[0].postalCode"
}
Result: "123 Main Street, San Francisco, CA 94102"
```

#### 9. City + State (Many-to-1)
```json
{
  "type": "direct",
  "target": "buyer.location.cityState",
  "source": ["customer.addresses[].city", "customer.addresses[].state"],
  "transformation": "concat"
}
Result: "San Francisco CA"
```

#### 10. Membership Level Translation (Key-Value Pairs)
```json
{
  "type": "direct",
  "target": "buyer.accountInfo.membershipLevel",
  "source": ["customer.loyaltyProgram.tier"],
  "transformation": "uppercase"
}
Result: "GOLD"
```

#### 11. Loyalty Points Balance
```json
{
  "type": "direct",
  "target": "buyer.accountInfo.loyaltyPointsBalance",
  "source": ["customer.loyaltyProgram.points"]
}
Result: 2500
```

#### 12. Member Since Date
```json
{
  "type": "direct",
  "target": "buyer.accountInfo.memberSince",
  "source": ["customer.loyaltyProgram.joinDate"]
}
Result: "2022-01-15"
```

#### 13. Calculate Lifetime Value (Computed Sum)
```json
{
  "type": "computed",
  "target": "buyer.accountInfo.totalLifetimeValue",
  "computedFunction": "SUM",
  "source": ["items[].total"]
}
Result: 1384.33 (sum of all item totals)
```

#### 14. Order Status Code Translation (Key-Value)
```json
{
  "type": "direct",
  "target": "purchaseDetails.statusCode",
  "source": ["orderStatus"],
  "keyValuePairs": [
    { "key": "1", "value": "PENDING" },
    { "key": "2", "value": "PROCESSING" },
    { "key": "3", "value": "SHIPPED" },
    { "key": "4", "value": "DELIVERED" },
    { "key": "5", "value": "CANCELLED" }
  ]
}
Result: "PROCESSING" (since orderStatus = 2)
```

#### 15. Status Description from Code
```json
{
  "type": "direct",
  "target": "purchaseDetails.statusDescription",
  "source": ["orderStatus"],
  "keyValuePairs": [
    { "key": "1", "value": "Order received and awaiting processing" },
    { "key": "2", "value": "Order is being processed" },
    { "key": "3", "value": "Order has been shipped" },
    { "key": "4", "value": "Order delivered successfully" },
    { "key": "5", "value": "Order cancelled by customer" }
  ]
}
Result: "Order is being processed"
```

#### 16. Array Mapping - Line Items
```json
{
  "type": "computed",
  "target": "lineItems[].itemId",
  "computedFunction": "UUID"
}
Result: Generate unique UUID for each line item
```

#### 17. Array Element Mapping - Product SKU
```json
{
  "type": "direct",
  "target": "lineItems[].productSku",
  "source": ["items[].sku"]
}
Result: Maps each item's SKU to lineItems array
```

#### 18. Array Element - Item Number (Sequential)
```json
{
  "type": "computed",
  "target": "lineItems[].itemNumber",
  "computedFunction": "CUSTOM",
  "customExpression": "index + 1"
}
Result: 1, 2, 3, ... (sequential numbering)
```

#### 19. Nested Category Mapping
```json
{
  "type": "direct",
  "target": "lineItems[].mainCategory",
  "source": ["items[].category.categoryName"]
}
Result: "Electronics"
```

#### 20. Subcategory
```json
{
  "type": "direct",
  "target": "lineItems[].subCategory",
  "source": ["items[].category.subcategory.subcategoryName"]
}
Result: "Computers"
```

#### 21. Payment Method Translation (Key-Value)
```json
{
  "type": "direct",
  "target": "financials.paymentDetails.paymentMethod",
  "source": ["payment.method"],
  "keyValuePairs": [
    { "key": "credit_card", "value": "Credit Card" },
    { "key": "debit_card", "value": "Debit Card" },
    { "key": "paypal", "value": "PayPal" },
    { "key": "bank_transfer", "value": "Bank Transfer" }
  ]
}
Result: "Credit Card"
```

#### 22. Payment Status Translation
```json
{
  "type": "direct",
  "target": "financials.paymentDetails.paymentStatus",
  "source": ["payment.status"],
  "keyValuePairs": [
    { "key": "1", "value": "Authorized" },
    { "key": "2", "value": "Captured" },
    { "key": "3", "value": "Refunded" },
    { "key": "4", "value": "Failed" }
  ]
}
Result: "Authorized"
```

#### 23. Card Brand (Uppercase Transformation)
```json
{
  "type": "direct",
  "target": "financials.paymentDetails.cardBrand",
  "source": ["payment.card.type"],
  "transformation": "uppercase"
}
Result: "VISA"
```

#### 24. Count Total Items (Computed)
```json
{
  "type": "computed",
  "target": "analytics.itemCount",
  "computedFunction": "COUNT",
  "source": ["items"]
}
Result: 3 (number of items in array)
```

#### 25. Calculate Average Item Price (Computed)
```json
{
  "type": "computed",
  "target": "analytics.averageItemPrice",
  "computedFunction": "AVERAGE",
  "source": ["items[].unitPrice"]
}
Result: 448.66 (average of all unit prices)
```

#### 26. Total Quantity Ordered (Sum)
```json
{
  "type": "computed",
  "target": "analytics.totalQuantityOrdered",
  "computedFunction": "SUM",
  "source": ["items[].quantity"]
}
Result: 6 (1 + 2 + 3)
```

#### 27. Discount Percentage Calculation (Custom)
```json
{
  "type": "computed",
  "target": "analytics.discountPercentage",
  "computedFunction": "CUSTOM",
  "customExpression": "(pricing.totalDiscount / pricing.subtotal) * 100"
}
Result: 10.6
```

#### 28. Has Discount Boolean (Custom Logic)
```json
{
  "type": "computed",
  "target": "analytics.hasDiscount",
  "computedFunction": "CUSTOM",
  "customExpression": "pricing.totalDiscount > 0"
}
Result: true
```

#### 29. Has Premium Items (Custom Logic)
```json
{
  "type": "computed",
  "target": "analytics.hasPremiumItems",
  "computedFunction": "CUSTOM",
  "customExpression": "items.some(item => item.unitPrice > 1000)"
}
Result: true
```

#### 30. Audit Trail - Map Events Array
```json
{
  "type": "direct",
  "target": "auditTrail[].eventName",
  "source": ["timeline.events[].eventType"]
}
Result: Maps each event type to audit trail
```

#### 31. Event Timestamp
```json
{
  "type": "direct",
  "target": "auditTrail[].eventTimestamp",
  "source": ["timeline.events[].timestamp"]
}
Result: Maps each event timestamp
```

#### 32. Constant Value - Data Source
```json
{
  "type": "constant",
  "target": "metadata.importSource",
  "value": "migration"
}
Result: "migration"
```

#### 33. Generate Processing ID (UUID)
```json
{
  "type": "computed",
  "target": "metadata.processingId",
  "computedFunction": "UUID"
}
Result: Unique processing ID
```

#### 34. Last Modified Timestamp
```json
{
  "type": "computed",
  "target": "metadata.lastModified",
  "computedFunction": "TIMESTAMP"
}
Result: Current timestamp
```

#### 35. Calculate Data Completeness (Custom)
```json
{
  "type": "computed",
  "target": "metadata.dataQuality.completeness",
  "computedFunction": "CUSTOM",
  "customExpression": "(Object.values(this).filter(v => v !== null && v !== '').length / Object.keys(this).length) * 100"
}
Result: Percentage of filled fields
```

---

## Test File 2: Employee XML to JSON

### Source: `test-source-employees.xml`
XML file with employee records, nested departments, and projects.

### Example Mappings:

#### 1. Generate Employee Record ID
```json
{
  "type": "computed",
  "target": "recordId",
  "computedFunction": "UUID"
}
```

#### 2. Full Name from XML (Many-to-1)
```json
{
  "type": "computed",
  "target": "employeeName",
  "computedFunction": "CONCAT",
  "source": ["PersonalDetails.FirstName", "PersonalDetails.LastName"]
}
Result: "Michael Anderson"
```

#### 3. Employment Status Translation
```json
{
  "type": "direct",
  "target": "statusText",
  "source": ["Employment.EmploymentStatus"],
  "keyValuePairs": [
    { "key": "1", "value": "Active" },
    { "key": "2", "value": "Leave" },
    { "key": "3", "value": "Terminated" }
  ]
}
```

#### 4. Count Total Projects
```json
{
  "type": "computed",
  "target": "totalProjects",
  "computedFunction": "COUNT",
  "source": ["Projects.Project"]
}
Result: 2
```

#### 5. Sum Total Budget
```json
{
  "type": "computed",
  "target": "totalBudget",
  "computedFunction": "SUM",
  "source": ["Projects.Project[].BudgetAllocated"]
}
Result: 1,250,000
```

#### 6. Project Status Translation
```json
{
  "type": "direct",
  "target": "projectStatusText",
  "source": ["Projects.Project[].Status"],
  "keyValuePairs": [
    { "key": "1", "value": "Planning" },
    { "key": "2", "value": "In Progress" },
    { "key": "3", "value": "Completed" },
    { "key": "4", "value": "On Hold" }
  ]
}
```

---

## Test File 3: Patient Records TXT to JSON

### Source: `test-source-patients.txt`
Structured text file with patient medical records.

### Example Mappings:

#### 1. Generate Unique Patient Record ID
```json
{
  "type": "computed",
  "target": "patientRecordId",
  "computedFunction": "UUID"
}
```

#### 2. Import Timestamp
```json
{
  "type": "computed",
  "target": "importedAt",
  "computedFunction": "TIMESTAMP"
}
```

#### 3. Full Name Concatenation
```json
{
  "type": "computed",
  "target": "patientFullName",
  "computedFunction": "CONCAT",
  "source": ["FIRST_NAME", "MIDDLE_NAME", "LAST_NAME"]
}
Result: "John Robert Williams"
```

#### 4. Calculate Age from Date of Birth
```json
{
  "type": "computed",
  "target": "currentAge",
  "computedFunction": "CUSTOM",
  "customExpression": "Math.floor((new Date() - new Date(DATE_OF_BIRTH)) / (365.25 * 24 * 60 * 60 * 1000))"
}
```

#### 5. Insurance Status Translation
```json
{
  "type": "direct",
  "target": "insuranceStatusText",
  "source": ["PRIMARY_INSURANCE.COVERAGE_STATUS"],
  "keyValuePairs": [
    { "key": "1", "value": "Active" },
    { "key": "2", "value": "Inactive" },
    { "key": "3", "value": "Pending" }
  ]
}
```

#### 6. Count Medications
```json
{
  "type": "computed",
  "target": "totalCurrentMedications",
  "computedFunction": "COUNT",
  "source": ["CURRENT_MEDICATIONS"]
}
Result: 3
```

#### 7. Count Admissions
```json
{
  "type": "computed",
  "target": "totalAdmissions",
  "computedFunction": "COUNT",
  "source": ["ADMISSIONS"]
}
```

#### 8. Visit Status Translation
```json
{
  "type": "direct",
  "target": "visitStatusText",
  "source": ["RECENT_VISITS.VISIT_STATUS"],
  "keyValuePairs": [
    { "key": "1", "value": "Scheduled" },
    { "key": "2", "value": "In Progress" },
    { "key": "3", "value": "Completed" },
    { "key": "4", "value": "Cancelled" }
  ]
}
```

---

## Test File 4: Transactions CSV to JSON

### Source: `test-source-transactions.csv`
CSV with transaction records and customer information.

### Example Mappings:

#### 1. Generate Unique Import ID
```json
{
  "type": "computed",
  "target": "importId",
  "computedFunction": "UUID"
}
```

#### 2. Batch Import Timestamp
```json
{
  "type": "computed",
  "target": "batchImportDate",
  "computedFunction": "DATE"
}
Result: "2025-11-03"
```

#### 3. Full Customer Name (Many-to-1)
```json
{
  "type": "computed",
  "target": "customerFullName",
  "computedFunction": "CONCAT",
  "source": ["FirstName", "LastName"]
}
Result: "Jennifer Martinez"
```

#### 4. Payment Status Translation
```json
{
  "type": "direct",
  "target": "paymentStatusText",
  "source": ["PaymentStatus"],
  "keyValuePairs": [
    { "key": "1", "value": "Completed" },
    { "key": "2", "value": "Pending" },
    { "key": "3", "value": "Failed" },
    { "key": "4", "value": "Refunded" }
  ]
}
```

#### 5. Order Status Translation
```json
{
  "type": "direct",
  "target": "orderStatusDescription",
  "source": ["OrderStatus"],
  "keyValuePairs": [
    { "key": "1", "value": "Processing" },
    { "key": "2", "value": "Shipped" },
    { "key": "3", "value": "Delivered" },
    { "key": "4", "value": "Cancelled" }
  ]
}
```

#### 6. Membership Tier to Level Code
```json
{
  "type": "direct",
  "target": "membershipLevelCode",
  "source": ["MembershipTier"],
  "keyValuePairs": [
    { "key": "Bronze", "value": "1" },
    { "key": "Silver", "value": "2" },
    { "key": "Gold", "value": "3" },
    { "key": "Platinum", "value": "4" }
  ]
}
```

#### 7. Calculate Tax Percentage
```json
{
  "type": "computed",
  "target": "taxPercentage",
  "computedFunction": "CUSTOM",
  "customExpression": "TaxRate * 100"
}
Result: 9.5 (from 0.095)
```

#### 8. Calculate Savings Amount
```json
{
  "type": "computed",
  "target": "savingsAmount",
  "computedFunction": "CUSTOM",
  "customExpression": "(UnitPrice * Quantity) * (Discount / 100)"
}
```

#### 9. Is High Value Order (Boolean)
```json
{
  "type": "computed",
  "target": "isHighValue",
  "computedFunction": "CUSTOM",
  "customExpression": "TotalAmount > 100"
}
Result: true or false
```

#### 10. Days Since Order
```json
{
  "type": "computed",
  "target": "daysSinceOrder",
  "computedFunction": "CUSTOM",
  "customExpression": "Math.floor((new Date() - new Date(OrderDate)) / (24 * 60 * 60 * 1000))"
}
```

---

## Summary of Computed Function Usage

### UUID Generation
- Use for: Record IDs, Transaction IDs, any unique identifiers
- Example: `recordId`, `transactionId`, `importId`

### TIMESTAMP
- Use for: Import timestamps, processing timestamps, audit logs
- Example: `importTimestamp`, `processedAt`, `lastModified`

### DATE
- Use for: Date-only fields, batch dates
- Example: `importDate`, `processingDate`

### COUNT
- Use for: Counting array elements
- Example: `itemCount`, `totalProjects`, `medicationCount`

### SUM
- Use for: Totaling numeric values
- Example: `totalSpent`, `totalBudget`, `quantitySum`

### AVERAGE
- Use for: Calculating averages
- Example: `averagePrice`, `averageRating`

### CONCAT
- Use for: Joining multiple fields
- Example: `fullName`, `fullAddress`, `phoneNumbers`

### CUSTOM
- Use for: Complex calculations, boolean logic, date math
- Example: `discountPercentage`, `age`, `daysSince`

---

## Key-Value Pair Patterns

### Status Codes
```json
{
  "1": "Active",
  "2": "Inactive",
  "3": "Pending",
  "4": "Cancelled"
}
```

### Payment Methods
```json
{
  "credit_card": "Credit Card",
  "debit_card": "Debit Card",
  "paypal": "PayPal",
  "bank_transfer": "Bank Transfer"
}
```

### Membership Tiers
```json
{
  "Bronze": "1",
  "Silver": "2",
  "Gold": "3",
  "Platinum": "4"
}
```

---

## Testing Checklist

- [ ] UUID generation works for multiple records
- [ ] Timestamps are in ISO format
- [ ] Dates are formatted correctly
- [ ] Many-to-1 concatenation preserves order
- [ ] Array mappings handle all elements
- [ ] Nested paths resolve correctly (3+ levels deep)
- [ ] Key-value pairs translate all codes
- [ ] Computed sums are accurate
- [ ] Computed counts match array lengths
- [ ] Custom expressions evaluate without errors
- [ ] Transformations (uppercase, lowercase) work
- [ ] Boolean logic returns true/false
- [ ] Missing values handled gracefully
- [ ] Empty arrays don't cause errors
- [ ] Null values handled appropriately

---

**Happy Testing!** 🚀

Use these examples to test every feature of the data mapping application.