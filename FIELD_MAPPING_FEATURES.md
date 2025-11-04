# Enhanced Field Mapping Features

## Overview

AceTransformer now includes comprehensive support for advanced field mapping capabilities including:
- **Nested Fields**: Create hierarchical object structures with multiple nesting levels
- **Computed Fields**: Generate dynamic values (UUIDs, timestamps, counters, etc.)
- **Key/Value Pairs**: Convert objects/maps into key-value pair arrays

## Features

### 1. Nested Fields

Create complex nested object structures with parent-child relationships.

**Backend Support:**
- `FieldType.NESTED_OBJECT` in `FieldMappingRequest`
- Recursive children processing in `AceTransformationService`
- Supports unlimited nesting levels

**UI Features:**
- Visual nesting level indicators
- Expand/collapse functionality
- Child field management within modal
- Indented display showing hierarchy

**Example:**
```json
{
  "user": {
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "contact": {
        "email": "john@example.com"
      }
    }
  }
}
```

### 2. Computed Fields

Generate values dynamically during transformation without source data.

**Available Computed Types:**

#### UUID
Generates a unique UUID v4 identifier.
```
Field Type: COMPUTED
Computed Type: UUID
Result: "550e8400-e29b-41d4-a716-446655440000"
```

#### TIMESTAMP
Current time in milliseconds since epoch.
```
Field Type: COMPUTED
Computed Type: TIMESTAMP
Result: 1699027200000
```

#### TIMESTAMP_ISO
ISO 8601 formatted timestamp.
```
Field Type: COMPUTED
Computed Type: TIMESTAMP_ISO
Result: "2025-11-03T19:46:01.000Z"
```

#### DATE
Current date in YYYY-MM-DD format.
```
Field Type: COMPUTED
Computed Type: DATE
Result: "2025-11-03"
```

#### COUNT
Count elements in a source array or object.
```
Field Type: COMPUTED
Computed Type: COUNT
Transformation Rule: "items" (source field to count)
Result: 5
```

#### INCREMENT
Auto-incrementing counter starting from 1.
```
Field Type: COMPUTED
Computed Type: INCREMENT
Result: 1, 2, 3, ... (increments with each use)
```

#### CONSTANT
Fixed constant value.
```
Field Type: COMPUTED
Computed Type: CONSTANT
Transformation Rule: "ACTIVE"
Result: "ACTIVE"
```

#### RANDOM_STRING
Random 8-character alphanumeric string.
```
Field Type: COMPUTED
Computed Type: RANDOM_STRING
Result: "a7b3c9d2"
```

#### RANDOM_NUMBER
Random number between 0-999999.
```
Field Type: COMPUTED
Computed Type: RANDOM_NUMBER
Result: 723891
```

### 3. Key/Value Pairs

Convert object/map structures into arrays of key-value pairs.

**Configuration:**
- Source Field: Path to source object/map
- Key Field Name: Name for the key property (default: "key")
- Value Field Name: Name for the value property (default: "value")

**Example:**
```json
// Input
{
  "metadata": {
    "version": "1.0",
    "status": "active",
    "env": "production"
  }
}

// Output (with key="name", value="data")
{
  "metadataArray": [
    { "name": "version", "data": "1.0" },
    { "name": "status", "data": "active" },
    { "name": "env", "data": "production" }
  ]
}
```

## API Usage

### Backend API

**Enhanced FieldMappingRequest:**
```java
{
  "sourceField": "users[0].name",
  "targetField": "userName",
  "fieldType": "SIMPLE",
  "transformationRule": "uppercase"
}

// Nested Object
{
  "targetField": "address",
  "fieldType": "NESTED_OBJECT",
  "children": [
    {
      "sourceField": "addr.street",
      "targetField": "street",
      "fieldType": "SIMPLE"
    },
    {
      "targetField": "createdAt",
      "fieldType": "COMPUTED",
      "computedType": "TIMESTAMP_ISO"
    }
  ]
}

// Computed Field
{
  "targetField": "recordId",
  "fieldType": "COMPUTED",
  "computedType": "UUID"
}

// Key/Value Pair
{
  "sourceField": "config",
  "targetField": "configArray",
  "fieldType": "KEY_VALUE_PAIR",
  "keyFieldName": "setting",
  "valueFieldName": "value"
}
```

### Frontend API

**Using Enhanced Modal:**
```typescript
import EnhancedAddFieldModal from './components/EnhancedAddFieldModal'

<EnhancedAddFieldModal
  open={modalOpen}
  onClose={handleClose}
  onAdd={handleAddField}
  parentField="user"        // Optional: for nested fields
  nestingLevel={1}          // Optional: current nesting level
/>
```

**Field Mapping Structure:**
```typescript
interface FieldMapping {
  sourceField: string
  targetField: string
  fieldType?: 'SIMPLE' | 'NESTED_OBJECT' | 'COMPUTED' | 'KEY_VALUE_PAIR'
  computedType?: 'UUID' | 'TIMESTAMP' | 'TIMESTAMP_ISO' | 'DATE' | 
                 'COUNT' | 'INCREMENT' | 'CONSTANT' | 'RANDOM_STRING' | 'RANDOM_NUMBER'
  isNested?: boolean
  parentField?: string
  nestingLevel?: number
  isKeyValuePair?: boolean
  keyFieldName?: string
  valueFieldName?: string
  children?: FieldMapping[]
  transformationRule?: string
}
```

## Testing

### E2E Tests with Playwright

Run comprehensive test suite:

```bash
# Run all e2e tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

**Test Coverage:**
1. **nested-fields.spec.ts**: Tests for nested object creation and visualization
2. **computed-fields.spec.ts**: Tests for all computed field types
3. **keyvalue-pairs.spec.ts**: Tests for key/value pair transformations
4. **integration.spec.ts**: End-to-end integration tests

### Test Scenarios

**Nested Fields:**
- Create simple nested objects
- Create multi-level nested structures
- Add nested fields with children
- Visual hierarchy display
- Expand/collapse functionality

**Computed Fields:**
- UUID generation
- Timestamp generation (milliseconds and ISO)
- Date generation
- Count arrays/objects
- Auto-increment counters
- Constant values
- Random strings and numbers
- Computed fields as children in nested objects

**Key/Value Pairs:**
- Default key/value names
- Custom key/value names
- Nested source paths
- Field name validation
- Integration with transformations

## Usage Examples

### Example 1: User Profile with Nested Address and Computed ID

```json
// Mapping Configuration
{
  "mappingRules": [
    {
      "targetField": "profile",
      "fieldType": "NESTED_OBJECT",
      "children": [
        {
          "sourceField": "firstName",
          "targetField": "name"
        },
        {
          "targetField": "id",
          "fieldType": "COMPUTED",
          "computedType": "UUID"
        },
        {
          "targetField": "address",
          "fieldType": "NESTED_OBJECT",
          "children": [
            {
              "sourceField": "street",
              "targetField": "street"
            },
            {
              "sourceField": "city",
              "targetField": "city"
            }
          ]
        }
      ]
    },
    {
      "targetField": "timestamp",
      "fieldType": "COMPUTED",
      "computedType": "TIMESTAMP_ISO"
    }
  ]
}
```

### Example 2: Converting Configuration Object to Array

```json
// Source Data
{
  "config": {
    "theme": "dark",
    "language": "en",
    "notifications": "enabled"
  }
}

// Mapping
{
  "sourceField": "config",
  "targetField": "settings",
  "fieldType": "KEY_VALUE_PAIR",
  "keyFieldName": "option",
  "valueFieldName": "value"
}

// Result
{
  "settings": [
    { "option": "theme", "value": "dark" },
    { "option": "language", "value": "en" },
    { "option": "notifications", "value": "enabled" }
  ]
}
```

### Example 3: Complex Record with All Features

```json
{
  "mappingRules": [
    {
      "targetField": "recordId",
      "fieldType": "COMPUTED",
      "computedType": "UUID"
    },
    {
      "targetField": "timestamp",
      "fieldType": "COMPUTED",
      "computedType": "TIMESTAMP_ISO"
    },
    {
      "targetField": "data",
      "fieldType": "NESTED_OBJECT",
      "children": [
        {
          "sourceField": "name",
          "targetField": "title"
        },
        {
          "targetField": "sequence",
          "fieldType": "COMPUTED",
          "computedType": "INCREMENT"
        },
        {
          "targetField": "itemCount",
          "fieldType": "COMPUTED",
          "computedType": "COUNT",
          "transformationRule": "items"
        }
      ]
    },
    {
      "sourceField": "metadata",
      "targetField": "attributes",
      "fieldType": "KEY_VALUE_PAIR",
      "keyFieldName": "key",
      "valueFieldName": "val"
    }
  ]
}
```

## Implementation Details

### Backend

**Key Classes:**
- `FieldMappingRequest`: Enhanced DTO with new field types
- `AceTransformationService`: Core transformation logic
  - `generateComputedValue()`: Handles all computed types
  - `createNestedObject()`: Recursive nested object creation
  - `createKeyValuePair()`: Object-to-array conversion

**Enums:**
```java
public enum FieldType {
    SIMPLE, NESTED_OBJECT, COMPUTED, KEY_VALUE_PAIR
}

public enum ComputedFieldType {
    UUID, TIMESTAMP, TIMESTAMP_ISO, DATE, COUNT, 
    INCREMENT, CONSTANT, RANDOM_STRING, RANDOM_NUMBER
}
```

### Frontend

**Key Components:**
- `EnhancedAddFieldModal.tsx`: Comprehensive field creation modal
- `FieldMappingInterface.tsx`: Main mapping interface (integration pending)

**Features:**
- Type-safe TypeScript implementation
- Material-UI components
- Real-time validation
- Descriptive help text for each field type
- Accordion-based child field management

## Future Enhancements

1. **Advanced Computed Fields:**
   - Mathematical expressions
   - String templates
   - Conditional logic

2. **Field Validation:**
   - Required fields
   - Type validation
   - Custom validators

3. **Array Operations:**
   - Map/filter/reduce over arrays
   - Array flattening
   - Array aggregations

4. **Custom Transformations:**
   - JavaScript/expression evaluation
   - Lookup tables
   - External API calls

## Troubleshooting

### Common Issues

**Issue: Computed field returns null**
- Ensure computedType is set correctly
- For COUNT type, verify source field path exists
- For CONSTANT type, provide transformationRule value

**Issue: Nested fields not showing**
- Check that fieldType is set to NESTED_OBJECT
- Verify children array is populated
- Ensure parentField is correctly referenced

**Issue: Key/Value transformation fails**
- Verify source field contains object/map
- Check keyFieldName and valueFieldName are set
- Ensure source data structure is compatible

## Support

For issues or questions:
1. Check the API documentation
2. Review test cases in `/frontend/e2e`
3. Examine backend service implementation
4. Create an issue in the repository

---

**Version:** 1.0.0  
**Last Updated:** November 3, 2025
