# MongoDB Collections Design for Advanced Mapping

## Overview
This document describes the MongoDB collections structure for storing advanced transformation configurations with field mappings, validation rules, and filter rules.

---

## Collection 1: `mapping_configurations`

### Purpose
Master collection storing transformation configuration metadata and all associated rules.

### Schema Structure

```javascript
{
  "_id": ObjectId("..."),
  "name": "User Data Transformation",           // Unique indexed
  "description": "Transform user data from JSON to XML",
  "sourceFormat": "JSON",                        // Enum: JSON, XML, CSV, TXT
  "targetFormat": "XML",                         // Enum: JSON, XML, CSV, TXT
  "active": true,
  "version": 1,                                  // Version control for updates
  
  // Embedded Field Mappings (Array of subdocuments)
  "fieldMappings": [
    {
      "sourceField": "firstName",
      "targetField": "first_name",
      "transformationRule": "toUpperCase",
      "fieldType": "SIMPLE",                    // SIMPLE, NESTED_OBJECT, COMPUTED, KEY_VALUE_PAIR, MANY_TO_ONE
      "computedType": null,                     // UUID, TIMESTAMP, TIMESTAMP_ISO, DATE, COUNT, INCREMENT, CONSTANT, RANDOM_STRING, RANDOM_NUMBER
      "isNested": false,
      "parentField": null,
      "nestingLevel": 0,
      "isKeyValuePair": false,
      "keyFieldName": null,
      "valueFieldName": null,
      "aggregationField": null,
      "groupByFields": [],
      "mappingOrder": 0
    },
    {
      "sourceField": null,
      "targetField": "id",
      "transformationRule": null,
      "fieldType": "COMPUTED",
      "computedType": "UUID",
      "isNested": false,
      "parentField": null,
      "nestingLevel": 0,
      "isKeyValuePair": false,
      "keyFieldName": null,
      "valueFieldName": null,
      "aggregationField": null,
      "groupByFields": [],
      "mappingOrder": 1
    },
    {
      "sourceField": "accountId",
      "targetField": "accountIds",
      "transformationRule": null,
      "fieldType": "MANY_TO_ONE",
      "computedType": null,
      "isNested": false,
      "parentField": null,
      "nestingLevel": 0,
      "isKeyValuePair": false,
      "keyFieldName": null,
      "valueFieldName": null,
      "aggregationField": "accountId",
      "groupByFields": ["sourceSystem", "fromDate"],
      "mappingOrder": 2
    }
  ],
  
  // Embedded Validation Rules (Array of subdocuments)
  "validationRules": [
    {
      "fieldName": "email",
      "ruleType": "EMAIL",                      // REQUIRED, NOT_NULL, NOT_EMPTY, MIN_LENGTH, MAX_LENGTH, PATTERN, EMAIL, PHONE, NUMERIC, MIN_VALUE, MAX_VALUE, DATE_FORMAT, ENUM, CUSTOM
      "ruleValue": null,
      "errorMessage": "Invalid email format",
      "isRequired": false,
      "ruleOrder": 0
    },
    {
      "fieldName": "age",
      "ruleType": "MIN_VALUE",
      "ruleValue": "0",
      "errorMessage": "Age must be positive",
      "isRequired": false,
      "ruleOrder": 1
    },
    {
      "fieldName": "status",
      "ruleType": "ENUM",
      "ruleValue": "active,inactive,pending",
      "errorMessage": "Invalid status value",
      "isRequired": false,
      "ruleOrder": 2
    }
  ],
  
  // Embedded Filter Rules (Array of subdocuments)
  "filterRules": [
    {
      "fieldName": "age",
      "filterType": "GREATER_OR_EQUAL",        // EQUALS, NOT_EQUALS, CONTAINS, NOT_CONTAINS, STARTS_WITH, ENDS_WITH, GREATER_THAN, LESS_THAN, GREATER_OR_EQUAL, LESS_OR_EQUAL, IN, NOT_IN, IS_NULL, IS_NOT_NULL, REGEX, DATE_RANGE, CUSTOM
      "filterValue": "18",
      "logicalOperator": "AND",                 // AND, OR
      "filterOrder": 0
    },
    {
      "fieldName": "country",
      "filterType": "IN",
      "filterValue": "US,CA,UK",
      "logicalOperator": "AND",
      "filterOrder": 1
    }
  ],
  
  // Metadata
  "createdAt": ISODate("2025-11-04T10:00:00Z"),
  "updatedAt": ISODate("2025-11-04T10:30:00Z"),
  "createdBy": "admin",
  "updatedBy": "admin",
  
  // Statistics
  "usageCount": 0,
  "lastUsedAt": null
}
```

### Indexes

```javascript
// Unique index on name
db.mapping_configurations.createIndex({ "name": 1 }, { unique: true });

// Index for querying active configurations
db.mapping_configurations.createIndex({ "active": 1 });

// Compound index for format filtering
db.mapping_configurations.createIndex({ "sourceFormat": 1, "targetFormat": 1 });

// Index for field mapping queries
db.mapping_configurations.createIndex({ "fieldMappings.sourceField": 1 });
db.mapping_configurations.createIndex({ "fieldMappings.targetField": 1 });

// Index for validation rules
db.mapping_configurations.createIndex({ "validationRules.fieldName": 1 });

// Index for filter rules
db.mapping_configurations.createIndex({ "filterRules.fieldName": 1 });

// Text index for search functionality
db.mapping_configurations.createIndex({ 
  "name": "text", 
  "description": "text" 
});
```

---

## Collection 2: `transformation_executions` (Optional - for audit trail)

### Purpose
Track transformation execution history, validation results, and performance metrics.

### Schema Structure

```javascript
{
  "_id": ObjectId("..."),
  "configurationId": ObjectId("..."),           // Reference to mapping_configurations
  "configurationName": "User Data Transformation",
  "executionType": "VALIDATE_AND_FILTER",       // VALIDATE, FILTER, TRANSFORM, VALIDATE_AND_FILTER
  
  // Input details
  "inputData": {
    "format": "JSON",
    "recordCount": 100,
    "sizeBytes": 15000
  },
  
  // Validation results
  "validationResult": {
    "isValid": true,
    "errorCount": 0,
    "errors": []
  },
  
  // Filter results
  "filterResult": {
    "recordsIn": 100,
    "recordsOut": 85,
    "recordsFiltered": 15
  },
  
  // Transformation results
  "transformationResult": {
    "success": true,
    "outputFormat": "XML",
    "outputSizeBytes": 18000
  },
  
  // Performance metrics
  "performance": {
    "executionTimeMs": 150,
    "validationTimeMs": 50,
    "filterTimeMs": 30,
    "transformationTimeMs": 70
  },
  
  // Metadata
  "executedAt": ISODate("2025-11-04T11:00:00Z"),
  "executedBy": "user@example.com",
  "status": "SUCCESS"                           // SUCCESS, FAILURE, PARTIAL
}
```

### Indexes

```javascript
// Index for configuration lookup
db.transformation_executions.createIndex({ "configurationId": 1, "executedAt": -1 });

// Index for recent executions
db.transformation_executions.createIndex({ "executedAt": -1 });

// Index for status queries
db.transformation_executions.createIndex({ "status": 1, "executedAt": -1 });

// TTL index to auto-delete old executions (optional - keep last 30 days)
db.transformation_executions.createIndex(
  { "executedAt": 1 }, 
  { expireAfterSeconds: 2592000 }  // 30 days
);
```

---

## Collection 3: `configuration_templates` (Optional - for reusable templates)

### Purpose
Store reusable configuration templates that can be cloned for new configurations.

### Schema Structure

```javascript
{
  "_id": ObjectId("..."),
  "templateName": "Standard User Transformation",
  "category": "User Data",
  "description": "Template for user data transformation with common validations",
  "isPublic": true,
  
  // Template configuration (similar to mapping_configurations)
  "configuration": {
    "sourceFormat": "JSON",
    "targetFormat": "XML",
    "fieldMappings": [...],
    "validationRules": [...],
    "filterRules": [...]
  },
  
  // Metadata
  "createdAt": ISODate("2025-11-04T10:00:00Z"),
  "createdBy": "admin",
  "usageCount": 50,
  "rating": 4.5
}
```

---

## Data Size Estimations

### Single Configuration Document Size

**Base document**: ~500 bytes
- name, description, formats, metadata: 500 bytes

**Field Mappings**: ~200 bytes per mapping
- 10 mappings average: 2 KB

**Validation Rules**: ~150 bytes per rule
- 5 rules average: 750 bytes

**Filter Rules**: ~150 bytes per rule
- 3 rules average: 450 bytes

**Total per document**: ~3.7 KB

**1000 configurations**: ~3.7 MB

---

## Advantages of MongoDB Embedded Design

### 1. **Atomic Operations**
- Single document updates are atomic
- No need for transactions for related data
- Consistent state guaranteed

### 2. **Performance**
- Single query retrieves complete configuration
- No joins required
- Reduced network roundtrips

### 3. **Flexible Schema**
- Easy to add new field types
- New validation/filter types don't require migrations
- Version field allows schema evolution

### 4. **Scalability**
- Horizontal scaling with sharding
- Shard key: `name` or `_id`
- Efficient distribution

### 5. **Querying Power**
- Array query operators for nested documents
- Aggregation pipeline for complex queries
- Text search on name/description

---

## Sample Queries

### Find configurations by format
```javascript
db.mapping_configurations.find({
  sourceFormat: "JSON",
  targetFormat: "XML",
  active: true
});
```

### Find configurations with specific field mapping
```javascript
db.mapping_configurations.find({
  "fieldMappings": {
    $elemMatch: {
      sourceField: "email",
      fieldType: "SIMPLE"
    }
  }
});
```

### Find configurations with EMAIL validation
```javascript
db.mapping_configurations.find({
  "validationRules.ruleType": "EMAIL"
});
```

### Count configurations by source format
```javascript
db.mapping_configurations.aggregate([
  {
    $group: {
      _id: "$sourceFormat",
      count: { $sum: 1 }
    }
  }
]);
```

### Find most used configurations
```javascript
db.mapping_configurations.find().sort({ usageCount: -1 }).limit(10);
```

---

## Migration Strategy from JPA

### Phase 1: Data Export
1. Export existing configurations from H2/JPA
2. Transform to MongoDB document format
3. Validate data integrity

### Phase 2: Schema Creation
1. Create MongoDB collections
2. Apply indexes
3. Set up validation rules

### Phase 3: Application Update
1. Replace JPA entities with MongoDB documents
2. Update repositories to use MongoRepository
3. Modify service layer for embedded documents

### Phase 4: Testing
1. Run existing E2E tests
2. Verify data consistency
3. Performance testing

### Phase 5: Deployment
1. Backup existing data
2. Deploy new version
3. Monitor performance

---

## Backup and Maintenance

### Backup Strategy
```bash
# Daily backup
mongodump --db ace_transformer --out /backup/$(date +%Y%m%d)

# Backup single collection
mongodump --db ace_transformer --collection mapping_configurations
```

### Maintenance Tasks
```javascript
// Compact collection
db.mapping_configurations.compact();

// Rebuild indexes
db.mapping_configurations.reIndex();

// Remove unused configurations (last used > 1 year ago)
db.mapping_configurations.deleteMany({
  active: false,
  lastUsedAt: { $lt: new Date(Date.now() - 365*24*60*60*1000) }
});
```

---

## Summary

**Primary Collection**: `mapping_configurations`
- **Purpose**: Store all transformation configurations
- **Design**: Embedded documents for mappings, validations, filters
- **Size**: ~3.7 KB per configuration
- **Scalability**: Excellent with proper indexing

**Optional Collections**:
- `transformation_executions`: Audit trail and analytics
- `configuration_templates`: Reusable templates

**Key Benefits**:
- ✅ Single document = complete configuration
- ✅ Atomic operations
- ✅ No complex joins
- ✅ Flexible schema
- ✅ Horizontal scaling ready
