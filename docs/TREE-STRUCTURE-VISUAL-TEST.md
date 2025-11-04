# Tree Structure Feature - Visual Test Example

## Test Scenario: Building Enterprise Hierarchy

### Step 1: Create Root Node "Organization"

**Modal State:**
```
┌─────────────────────────────────────────┐
│ Add New Field                           │
├─────────────────────────────────────────┤
│ Target Field Name: Organization         │
│ Field Type: Nested Object Field         │
│ Source Field: organization              │
│                                         │
│ [Tree Structure Builder - Not Shown]   │
│ (No existing fields yet)                │
│                                         │
│ Nesting Level: 1                        │
└─────────────────────────────────────────┘
```

**Result:**
```
Field Structure:
Organization (L1)
```

---

### Step 2: Add "Departments" Under Organization

**Modal State:**
```
┌──────────────────────────────────────────────────────┐
│ Add New Field                                        │
├──────────────────────────────────────────────────────┤
│ Target Field Name: Departments                       │
│                                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │ 🌳 Tree Structure Builder                      │ │
│ ├────────────────────────────────────────────────┤ │
│ │ Parent Node:                                   │ │
│ │ ┌──────────────────────────────────────────┐  │ │
│ │ │ L1 Organization (L1)              [v]    │  │ │
│ │ └──────────────────────────────────────────┘  │ │
│ │                                                │ │
│ │ ✓ Field will be nested under:                 │ │
│ │   Organization (Level 2)                      │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ Field Type: Nested Object Field                     │
│ Source Field: departments                            │
│ Nesting Level: 2 (Auto-calculated)                  │
└──────────────────────────────────────────────────────┘
```

**Dropdown Options:**
```
┌────────────────────────────────┐
│ L0  None (Root Level)          │
├────────────────────────────────┤
│ L1  Organization (L1)          │ ← Selected
└────────────────────────────────┘
```

**Result:**
```
Field Structure:
Organization (L1)
  └── Departments (L2)
```

---

### Step 3: Add "Teams" Under Departments

**Modal State:**
```
┌──────────────────────────────────────────────────────┐
│ Add New Field                                        │
├──────────────────────────────────────────────────────┤
│ Target Field Name: Teams                             │
│                                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │ 🌳 Tree Structure Builder                      │ │
│ ├────────────────────────────────────────────────┤ │
│ │ Parent Node:                                   │ │
│ │ ┌──────────────────────────────────────────┐  │ │
│ │ │ L2   Departments (L2)             [v]    │  │ │
│ │ └──────────────────────────────────────────┘  │ │
│ │                                                │ │
│ │ ✓ Field will be nested under:                 │ │
│ │   Departments (Level 3)                       │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ Field Type: Nested Object Field                     │
│ Source Field: teams                                  │
│ Nesting Level: 3 (Auto-calculated)                  │
└──────────────────────────────────────────────────────┘
```

**Dropdown Options:**
```
┌────────────────────────────────┐
│ L0  None (Root Level)          │
├────────────────────────────────┤
│ L1  Organization (L1)          │
├────────────────────────────────┤
│ L2    Departments (L2)         │ ← Selected
└────────────────────────────────┘
```

**Result:**
```
Field Structure:
Organization (L1)
  └── Departments (L2)
      └── Teams (L3)
```

---

### Step 4: Add "Employees" Under Teams

**Modal State:**
```
┌──────────────────────────────────────────────────────┐
│ Add New Field                                        │
├──────────────────────────────────────────────────────┤
│ Target Field Name: Employees                         │
│                                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │ 🌳 Tree Structure Builder                      │ │
│ ├────────────────────────────────────────────────┤ │
│ │ Parent Node:                                   │ │
│ │ ┌──────────────────────────────────────────┐  │ │
│ │ │ L3     Teams (L3)                 [v]    │  │ │
│ │ └──────────────────────────────────────────┘  │ │
│ │                                                │ │
│ │ ✓ Field will be nested under:                 │ │
│ │   Teams (Level 4)                             │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ Field Type: Nested Object Field                     │
│ Source Field: employees                              │
│ Nesting Level: 4 (Auto-calculated)                  │
└──────────────────────────────────────────────────────┘
```

**Dropdown Options:**
```
┌────────────────────────────────┐
│ L0  None (Root Level)          │
├────────────────────────────────┤
│ L1  Organization (L1)          │
├────────────────────────────────┤
│ L2    Departments (L2)         │
├────────────────────────────────┤
│ L3      Teams (L3)             │ ← Selected
└────────────────────────────────┘
```

**Result:**
```
Field Structure:
Organization (L1)
  └── Departments (L2)
      └── Teams (L3)
          └── Employees (L4)
```

---

### Step 5: Add Parallel Branch - "Locations" Under Organization

**Modal State:**
```
┌──────────────────────────────────────────────────────┐
│ Add New Field                                        │
├──────────────────────────────────────────────────────┤
│ Target Field Name: Locations                         │
│                                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │ 🌳 Tree Structure Builder                      │ │
│ ├────────────────────────────────────────────────┤ │
│ │ Parent Node:                                   │ │
│ │ ┌──────────────────────────────────────────┐  │ │
│ │ │ L1 Organization (L1)              [v]    │  │ │
│ │ └──────────────────────────────────────────┘  │ │
│ │                                                │ │
│ │ ✓ Field will be nested under:                 │ │
│ │   Organization (Level 2)                      │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ Field Type: Nested Object Field                     │
│ Source Field: locations                              │
│ Nesting Level: 2 (Auto-calculated)                  │
└──────────────────────────────────────────────────────┘
```

**Dropdown Options:**
```
┌────────────────────────────────┐
│ L0  None (Root Level)          │
├────────────────────────────────┤
│ L1  Organization (L1)          │ ← Selected
├────────────────────────────────┤
│ L2    Departments (L2)         │
├────────────────────────────────┤
│ L3      Teams (L3)             │
├────────────────────────────────┤
│ L4        Employees (L4)       │
└────────────────────────────────┘
```

**Result:**
```
Field Structure:
Organization (L1)
  ├── Departments (L2)
  │   └── Teams (L3)
  │       └── Employees (L4)
  └── Locations (L2)
```

---

## Final Field Structure

```
Organization (L1)
  ├── Departments (L2)
  │   └── Teams (L3)
  │       └── Employees (L4)
  └── Locations (L2)
```

## JSON Output

When transformed, this structure produces:

```json
{
  "Organization": {
    "name": "Acme Corp",
    "Departments": [
      {
        "name": "Engineering",
        "Teams": [
          {
            "name": "Backend",
            "Employees": [
              {
                "name": "John Doe",
                "role": "Senior Engineer"
              }
            ]
          }
        ]
      }
    ],
    "Locations": [
      {
        "city": "New York",
        "country": "USA"
      }
    ]
  }
}
```

## Key Observations

### Automatic Level Calculation
- Select "Organization (L1)" → Child becomes L2
- Select "Departments (L2)" → Child becomes L3
- Select "Teams (L3)" → Child becomes L4

### Dropdown Updates Dynamically
- Step 1: Only "None (Root Level)" available
- Step 2: "Organization (L1)" added to dropdown
- Step 3: "Departments (L2)" added to dropdown
- Step 4: "Teams (L3)" added to dropdown
- Step 5: All 4 levels visible in dropdown

### Visual Indicators
- Each dropdown item shows level chip (L1, L2, L3, L4)
- Indentation shows parent-child relationship
- Status box provides clear feedback
- Green checkmark when parent selected

### Status Box Messages
- **No Parent**: "Select a parent node to nest this field within an existing structure..."
- **Parent Selected**: "Field will be nested under: [Name] (Level X)"

## Use Case Validation

✅ **Root Level Creation**: Organization at L1
✅ **Single Parent**: Departments under Organization
✅ **Deep Nesting**: Employees at L4
✅ **Parallel Branches**: Locations alongside Departments
✅ **Dropdown Hierarchy**: All levels visible with correct indentation
✅ **Auto-Calculation**: All levels calculated correctly
✅ **Visual Feedback**: Status box updates on each selection

## Testing Checklist

- [x] Create root level field (L1)
- [x] Add child under root (L2)
- [x] Add grandchild (L3)
- [x] Add great-grandchild (L4)
- [x] Add parallel branch (L2)
- [x] Verify dropdown shows all fields
- [x] Verify level chips display correctly
- [x] Verify indentation in dropdown
- [x] Verify status box messages
- [x] Verify auto-calculated levels
- [x] Verify "None (Root Level)" option works

## Example Code Generated

```typescript
// Field 1: Organization
{
  targetField: "Organization",
  sourceField: "organization",
  fieldType: "NESTED_OBJECT",
  nestingLevel: 1,
  parentField: undefined,
  isNested: false
}

// Field 2: Departments
{
  targetField: "Departments",
  sourceField: "departments",
  fieldType: "NESTED_OBJECT",
  nestingLevel: 2,
  parentField: "Organization",
  isNested: true
}

// Field 3: Teams
{
  targetField: "Teams",
  sourceField: "teams",
  fieldType: "NESTED_OBJECT",
  nestingLevel: 3,
  parentField: "Organization.Departments",
  isNested: true
}

// Field 4: Employees
{
  targetField: "Employees",
  sourceField: "employees",
  fieldType: "NESTED_OBJECT",
  nestingLevel: 4,
  parentField: "Organization.Departments.Teams",
  isNested: true
}

// Field 5: Locations
{
  targetField: "Locations",
  sourceField: "locations",
  fieldType: "NESTED_OBJECT",
  nestingLevel: 2,
  parentField: "Organization",
  isNested: true
}
```

This demonstrates the complete functionality of the tree structure parent node selector!
