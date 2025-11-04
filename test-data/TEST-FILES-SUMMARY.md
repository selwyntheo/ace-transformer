# Test Files Summary

## 📋 Quick Reference

All test files are designed to demonstrate different features and complexity levels of the Data Mapping Studio.

---

## 🟢 Beginner Level

### 1. Simple JSON Files
**Files**: 
- `test-simple-source.json` (Source)
- `test-simple-target.json` (Target)

**Complexity**: ⭐ (1/5)

**Features to Test**:
- ✅ Direct field mapping (1-to-1)
- ✅ Simple nested objects (1 level)
- ✅ UUID generation
- ✅ Timestamp generation
- ✅ Basic concatenation (Many-to-1)
- ✅ Array aggregations (COUNT, SUM, AVERAGE, MAX)
- ✅ Key-value pair mapping (status codes)

**Structure**:
```json
Source:
- Flat fields: userId, firstName, lastName, email, age, status
- Nested object: address (1 level)
- Array: scores (numeric)

Target:
- Computed fields: recordId (UUID), importDate (TIMESTAMP)
- Concatenated: fullName
- Aggregations: averageScore, highestScore, totalScores, scoreCount
- Translated: accountStatus (from numeric code)
```

**Recommended Mappings** (10 total):
1. Generate UUID → recordId
2. Generate TIMESTAMP → importDate
3. firstName + lastName → fullName (CONCAT)
4. email → contactEmail (Direct)
5. age → userAge (Direct)
6. status → accountStatus (Key-Value: 1→Active, 2→Inactive)
7. address.city + address.state → cityState (Many-to-1)
8. scores → averageScore (AVERAGE)
9. scores → highestScore (MAX)
10. scores → scoreCount (COUNT)

**Time to Complete**: 15-20 minutes

---

## 🟡 Intermediate Level

### 2. Transaction CSV
**File**: `test-source-transactions.csv`

**Complexity**: ⭐⭐⭐ (3/5)

**Features to Test**:
- ✅ CSV parsing with headers
- ✅ Multiple records (20 rows)
- ✅ Date/time field handling
- ✅ Numeric calculations
- ✅ Status code translations (multiple types)
- ✅ Boolean logic
- ✅ Percentage calculations
- ✅ Membership tier mapping

**Columns** (30 total):
```
TransactionID, CustomerID, FirstName, LastName, Email, Phone,
Country, State, City, ZipCode, ProductSKU, ProductName, Category,
Quantity, UnitPrice, Discount, TaxRate, Subtotal, TotalAmount,
PaymentMethod, PaymentStatus, OrderDate, ShipDate, DeliveryDate,
OrderStatus, LoyaltyPoints, MembershipTier, IsGift, GiftMessage, Notes
```

**Recommended Mappings** (25 total):
- UUID generation
- Name concatenation
- Address concatenation
- Payment status translation (1-4)
- Order status translation (1-4)
- Membership tier to code (Bronze→1, Silver→2, Gold→3, Platinum→4)
- Tax percentage calculation
- Savings calculation
- High-value order detection (>$100)
- Days since order calculation

**Time to Complete**: 45-60 minutes

---

## 🔴 Advanced Level

### 3. Complex Order JSON
**Files**: 
- `test-source-complex.json` (Source)
- `test-target-structure.json` (Target)

**Complexity**: ⭐⭐⭐⭐⭐ (5/5)

**Features to Test**:
- ✅ Deep nesting (4-5 levels)
- ✅ Multiple nested arrays
- ✅ Array of objects mapping
- ✅ Complex computed fields
- ✅ Multiple key-value sets
- ✅ Nested array transformations
- ✅ Conditional logic
- ✅ Data quality calculations
- ✅ Timeline/audit trail mapping

**Structure**:
```json
Source (150+ fields):
├── orderId, orderNumber, orderDate, orderStatus
├── customer
│   ├── customerId
│   ├── personalInfo (firstName, lastName, etc.)
│   ├── contactDetails
│   │   ├── primaryEmail, secondaryEmail
│   │   └── phones[] (array with type, number, isPrimary)
│   ├── addresses[] (array of address objects)
│   ├── preferences
│   │   └── notifications (email, sms, push)
│   └── loyaltyProgram
├── items[] (array of products)
│   ├── lineItemId, productId, sku, productName
│   ├── category
│   │   └── subcategory
│   ├── discount
│   └── fulfillment
├── pricing (subtotal, taxes, shipping, total)
├── payment
│   ├── card details
│   └── billingAddress
├── shipping
├── timeline
│   └── events[] (array of event objects)
└── metadata
```

**Recommended Mappings** (35+ total):
1. UUID generation (2 fields)
2. Timestamp generation (2 fields)
3. Deep nested field access (5+ levels)
4. Many-to-1 concatenations (full name, full address)
5. Array mappings (items→lineItems)
6. Nested array mappings (items[].category.subcategory)
7. COUNT aggregations (item count)
8. SUM aggregations (total spent, quantity)
9. AVERAGE calculations (average price)
10. Complex custom expressions (discount %, completeness)
11. Multiple key-value translations (5+ sets)
12. Boolean logic (has discount, has premium items)
13. Event timeline mapping
14. Conditional transformations

**Time to Complete**: 2-3 hours

---

## 🟣 Expert Level

### 4. Employee XML
**File**: `test-source-employees.xml`

**Complexity**: ⭐⭐⭐⭐ (4/5)

**Features to Test**:
- ✅ XML parsing and structure
- ✅ Multiple employee records
- ✅ Deeply nested XML elements
- ✅ XML attributes handling
- ✅ Array of complex objects
- ✅ Mixed content types
- ✅ Repeating structures

**Structure**:
```xml
Company
├── CompanyInfo
├── Employees
    └── Employee (2 employees)
        ├── PersonalDetails (name, DOB, SSN)
        ├── ContactInfo
        │   ├── Email, PersonalEmail
        │   ├── PhoneNumbers
        │   │   └── Phone[] (with type attribute)
        │   └── Address
        ├── Employment
        │   ├── Department (with Division)
        │   ├── Position (JobTitle, Level, Code)
        │   └── Manager
        ├── Compensation
        │   ├── BaseSalary (with currency attribute)
        │   ├── Bonus
        │   ├── StockOptions
        │   └── Benefits
        │       └── PaidTimeOff
        ├── Skills[]
        ├── Projects[]
        ├── PerformanceReviews[]
        ├── TimeOff[]
        └── EmergencyContacts[]
```

**Recommended Mappings** (30+ total):
- XML to JSON transformation
- Attribute to field mapping
- Employee full name concatenation
- Department + Division combination
- Count projects
- Sum budget allocations
- Average performance rating
- Skills count
- Employment status translation
- Project status translation
- Multiple contact phone aggregation

**Time to Complete**: 90-120 minutes

---

### 5. Patient Records TXT
**File**: `test-source-patients.txt`

**Complexity**: ⭐⭐⭐⭐ (4/5)

**Features to Test**:
- ✅ Structured text parsing
- ✅ Hierarchical text format
- ✅ Multiple patient records
- ✅ Nested sections
- ✅ List parsing (medications, procedures)
- ✅ Key-value text pairs

**Structure**:
```
RECORD: N
├── PATIENT_ID, MEDICAL_RECORD_NUMBER
├── PERSONAL_INFORMATION
│   └── Name, DOB, Age, Gender, SSN
├── CONTACT_INFORMATION
│   ├── Phones
│   └── HOME_ADDRESS
├── INSURANCE_INFORMATION
│   ├── PRIMARY_INSURANCE
│   └── SECONDARY_INSURANCE
├── MEDICAL_HISTORY
│   ├── Blood type, Allergies, Conditions
│   └── CURRENT_MEDICATIONS (list)
│       └── MEDICATION_N (nested details)
├── ADMISSIONS (list)
│   └── ADMISSION_N
│       └── PROCEDURES_PERFORMED (nested list)
├── RECENT_VISITS (list)
├── LAB_RESULTS (list)
└── EMERGENCY_CONTACTS (list)
```

**Recommended Mappings** (35+ total):
- UUID for each patient record
- Import timestamp
- Full name from components
- Age calculation from DOB
- Address concatenation
- Insurance status translation
- Admission status translation
- Visit status translation
- Count medications
- Count admissions
- Count visits
- Date formatting
- Medical code translations

**Time to Complete**: 2 hours

---

## 📊 Test File Comparison

| File | Format | Records | Nesting | Arrays | Fields | Computed | Time |
|------|--------|---------|---------|--------|--------|----------|------|
| Simple JSON | JSON | 1 | 1 level | 1 | 15 | 6 | 20min |
| Transactions CSV | CSV | 20 | 0 | 0 | 30 | 10 | 60min |
| Complex Order | JSON | 1 | 5 levels | 4 | 150+ | 35+ | 3hr |
| Employee XML | XML | 2 | 4 levels | 8 | 100+ | 30+ | 2hr |
| Patient TXT | TXT | 3 | 3 levels | 6 | 80+ | 35+ | 2hr |

---

## 🎯 Learning Path

### Day 1: Basics (Simple JSON)
- Upload source and target files
- Create 5 direct mappings
- Generate UUID and Timestamp
- Create 1 concatenation
- Add 1 key-value mapping
- **Goal**: Understand interface and basic mappings

### Day 2: Arrays and Aggregations (CSV)
- Work with CSV format
- Map multiple records
- Use COUNT, SUM, AVERAGE
- Translate status codes
- Calculate percentages
- **Goal**: Master aggregations and transformations

### Day 3: Nested Structures (Complex JSON - Part 1)
- Deep nested field access (3+ levels)
- Map nested objects
- Array of objects mapping
- Multiple key-value sets
- **Goal**: Handle complex nesting

### Day 4: Advanced Computed Fields (Complex JSON - Part 2)
- Complex custom expressions
- Boolean logic
- Conditional transformations
- Data quality calculations
- Timeline mapping
- **Goal**: Master computed functions

### Day 5: Alternative Formats (XML and TXT)
- Parse XML structure
- Handle XML attributes
- Parse structured text
- Deal with various formatting
- **Goal**: Work with different formats

---

## 💡 Pro Tips for Testing

### Tip 1: Start Simple
Always begin with `test-simple-source.json` before moving to complex files.

### Tip 2: Test Incrementally
Create 2-3 mappings, export config, verify, then continue.

### Tip 3: Use All Computed Functions
Each test file is designed to use different computed functions:
- Simple JSON: COUNT, SUM, AVERAGE, MAX
- CSV: Custom expressions, calculations
- Complex JSON: All functions
- XML: COUNT, SUM on projects/skills
- TXT: COUNT on medications/visits

### Tip 4: Test Edge Cases
- Missing fields
- Null values
- Empty arrays
- Deep nesting (5+ levels)
- Large numbers of records (CSV with 20 rows)

### Tip 5: Export and Review
After completing mappings for each file:
1. Export configuration
2. Review JSON structure
3. Check all computed fields are correct
4. Verify key-value pairs are complete

---

## 🐛 Common Issues to Test

### Issue 1: Deep Nesting
**Test with**: Complex Order JSON
- Paths like `customer.addresses[].coordinates.latitude`
- Verify 4-5 level nesting works

### Issue 2: Array Mapping
**Test with**: All files (especially Complex Order)
- Array to array mapping
- Array element access
- Multiple arrays in same object

### Issue 3: Key-Value Translations
**Test with**: All files
- Numeric codes (1, 2, 3)
- String codes ("active", "pending")
- Case sensitivity

### Issue 4: Computed Expressions
**Test with**: Complex Order, CSV
- Mathematical operations
- Boolean logic
- String manipulation
- Date calculations

### Issue 5: Multiple Data Types
**Test with**: All files
- Strings, numbers, booleans
- Dates in different formats
- Nulls and undefined
- Empty strings vs null

---

## ✅ Testing Checklist

Use this checklist for each test file:

- [ ] File uploads successfully
- [ ] Schema detected correctly
- [ ] All fields visible in tree
- [ ] Nested fields expandable
- [ ] Arrays show with [] notation
- [ ] UUID generation works
- [ ] Timestamp generation works
- [ ] Direct mappings create correctly
- [ ] Many-to-1 concatenation works
- [ ] Transformations apply correctly
- [ ] Key-value pairs translate codes
- [ ] COUNT returns correct number
- [ ] SUM calculates accurately
- [ ] AVERAGE calculates correctly
- [ ] Custom expressions evaluate
- [ ] Boolean logic returns true/false
- [ ] Array mappings work
- [ ] Nested array mappings work
- [ ] Export configuration succeeds
- [ ] Exported JSON is valid
- [ ] Re-import config works

---

## 📁 File Download Links

1. [test-simple-source.json](computer:///mnt/user-data/outputs/test-simple-source.json)
2. [test-simple-target.json](computer:///mnt/user-data/outputs/test-simple-target.json)
3. [test-source-transactions.csv](computer:///mnt/user-data/outputs/test-source-transactions.csv)
4. [test-source-complex.json](computer:///mnt/user-data/outputs/test-source-complex.json)
5. [test-target-structure.json](computer:///mnt/user-data/outputs/test-target-structure.json)
6. [test-source-employees.xml](computer:///mnt/user-data/outputs/test-source-employees.xml)
7. [test-source-patients.txt](computer:///mnt/user-data/outputs/test-source-patients.txt)
8. [TEST-FILES-MAPPING-GUIDE.md](computer:///mnt/user-data/outputs/TEST-FILES-MAPPING-GUIDE.md)

---

## 🎓 Expected Outcomes

After testing with all files, you should be able to:
- ✅ Map simple 1-to-1 fields
- ✅ Create Many-to-1 concatenations
- ✅ Generate UUIDs and timestamps
- ✅ Handle nested objects (5+ levels)
- ✅ Map arrays and array elements
- ✅ Use all computed functions
- ✅ Create complex custom expressions
- ✅ Apply transformations
- ✅ Translate codes with key-value pairs
- ✅ Work with JSON, CSV, XML, and TXT formats
- ✅ Export and import configurations
- ✅ Handle edge cases gracefully

---

**Happy Testing! 🚀**

Start with the simple JSON file and work your way up to the complex structures!