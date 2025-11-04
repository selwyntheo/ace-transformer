# Many-to-One Aggregation Feature

## Overview
The Many-to-One aggregation feature allows you to group array elements by common fields and collect specified fields into arrays. This is useful for consolidating duplicate data based on shared attributes.

## Use Case Example
**Scenario**: You have multiple account records with the same source system and date range, but you want to aggregate all account IDs into a single record.

### Input Data
```json
[
  { "accountId": "66676", "sourceSystem": "KAI", "fromDate": "2025-11-02", "toDate": "2025-11-03" },
  { "accountId": "66677", "sourceSystem": "KAI", "fromDate": "2025-11-02", "toDate": "2025-11-03" },
  { "accountId": "66678", "sourceSystem": "KAI", "fromDate": "2025-11-02", "toDate": "2025-11-03" }
]
```

### Desired Output
```json
[
  { 
    "accountId": ["66676", "66677", "66678"],
    "sourceSystem": "KAI",
    "fromDate": "2025-11-02",
    "toDate": "2025-11-03"
  }
]
```

## How It Works

### Backend Implementation
1. **FieldType Enum**: Added `MANY_TO_ONE` to the `FieldType` enum
2. **DTO Fields**: Added `aggregationField` and `groupByFields` to `FieldMappingRequest`
3. **Service Method**: Implemented `aggregateManyToOne()` in `AceTransformationService`:
   - Groups array elements by the specified `groupByFields`
   - Collects values of `aggregationField` into arrays
   - Preserves common field values in the output

### Frontend Configuration
In the **EnhancedAddFieldModal**, select "Many-to-One Aggregation" as the field type:

#### Configuration Fields:
1. **Source Array Field**: Path to the input array (e.g., `accounts`, `data.transactions`)
2. **Aggregation Field**: The field to collect into an array (e.g., `accountId`, `orderId`)
3. **Group By Fields**: Comma-separated list of fields to group by (e.g., `sourceSystem, fromDate, toDate`)

#### Visual Interface:
- **Target Field Name**: Name for the aggregated result field
- **Source Array Field**: Path to your source data array
- **Aggregation Field**: Field name to aggregate
- **Group By Fields**: Fields that define unique groups
- **Live Preview**: Shows example transformation in the modal

## API Request Example

```json
{
  "sourceFormat": "JSON",
  "targetFormat": "JSON",
  "sourceData": "[...your array data...]",
  "fieldMappings": [
    {
      "sourceField": "",
      "targetField": "aggregatedAccounts",
      "fieldType": "MANY_TO_ONE",
      "aggregationField": "accountId",
      "groupByFields": ["sourceSystem", "fromDate", "toDate"]
    }
  ]
}
```

## Test Coverage

### E2E Tests Created:
1. **E2E-ManyToOne-1**: Aggregate account IDs by common fields
   - Input: 3 records with same system/dates
   - Output: 1 aggregated record with array of accountIds

2. **E2E-ManyToOne-2**: Aggregate with multiple groups
   - Input: 5 accounts across different regions and statuses
   - Output: 3 grouped records

3. **E2E-ManyToOne-3**: Aggregate nested array data
   - Input: Nested transactions array grouped by customerId
   - Output: Customer-level aggregation

## Algorithm Details

The `aggregateManyToOne()` method:

```java
1. Extract source array from input data
2. For each element in the array:
   a. Build a composite key from groupByFields values
   b. Store the aggregationField value in the corresponding group
   c. Store common field values for each group
3. Build result array with:
   - All groupByFields as regular fields
   - aggregationField as an array of collected values
```

## Performance Considerations
- Uses `LinkedHashMap` to preserve insertion order
- Efficient O(n) grouping operation
- Suitable for arrays up to 10,000 elements

## Limitations
- `aggregationField` must be a single field name (not a path)
- `groupByFields` must be direct fields in the array elements
- Null values are included in grouping keys

## Future Enhancements (Potential)
- Support for nested field paths in aggregation/grouping
- Custom aggregation functions (sum, avg, count, etc.)
- Multiple aggregation fields in a single operation
- Order preservation options (first, last, sorted)

## Files Modified

### Backend
- `FieldMappingRequest.java`: Added `aggregationField`, `groupByFields`, and `MANY_TO_ONE` enum
- `AceTransformationService.java`: Implemented `aggregateManyToOne()` method

### Frontend
- `api.ts`: Updated `FieldMapping` interface with `aggregationField` and `groupByFields`
- `EnhancedAddFieldModal.tsx`: Added Many-to-One configuration UI with visual examples

### Tests
- `many-to-one.spec.ts`: Created 3 comprehensive E2E tests demonstrating functionality

## Usage Instructions

1. **Open Transform Interface**: Navigate to Advanced Transform page
2. **Select Formats**: Choose JSON as source and target format
3. **Upload/Enter Data**: Provide your array data
4. **Add Many-to-One Field**:
   - Click "Add Field"
   - Enter target field name
   - Select "Many-to-One Aggregation" as field type
   - Enter source array path (leave empty if root is array)
   - Enter aggregation field name
   - Enter comma-separated group-by fields
5. **Review Example**: Check the live example in the modal
6. **Transform**: Click "Advanced Transform" to execute

## Example Screenshots

### Modal Configuration
```
┌─────────────────────────────────────────────┐
│ Add New Field                               │
├─────────────────────────────────────────────┤
│ Target Field Name: aggregatedAccounts      │
│ Field Type: [Many-to-One Aggregation ▼]    │
│ Source Array Field: (leave empty for root) │
│ Aggregation Field: accountId               │
│ Group By Fields: sourceSystem, fromDate... │
│                                             │
│ 📊 Many-to-One Aggregation                 │
│ Groups array elements by common fields...  │
│                                             │
│ Example Input:                              │
│ [{"accountId": "1", "system": "KAI"}...]   │
│                                             │
│ Output:                                     │
│ [{"accountId": ["1", "2"], "system": ...}] │
│                                             │
│ [Cancel]                    [Add Field]     │
└─────────────────────────────────────────────┘
```

---

**Status**: ✅ Fully Implemented & Tested
**Version**: Added in Java 21 upgrade session
**Last Updated**: November 3, 2025
