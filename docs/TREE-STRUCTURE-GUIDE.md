# Tree Structure Builder - Complete Guide

## Overview

The **Tree Structure Builder** in the EnhancedAddFieldModal allows you to create complex nested field hierarchies by selecting parent nodes and automatically calculating nesting levels. This feature is essential for building enterprise data structures like Organizations → Departments → Teams → Employees.

## Features

### 1. Parent Node Selection
- **Dropdown Selector**: Shows all existing nested fields in a hierarchical tree view
- **Visual Level Indicators**: Each node displays its level (L0, L1, L2, etc.)
- **Indented Display**: Visual indentation shows parent-child relationships
- **Root Level Option**: Select "None (Root Level)" for top-level fields

### 2. Automatic Nesting Level Calculation
- When you select a parent node, the nesting level is **automatically calculated**
- Formula: `Child Level = Parent Level + 1`
- Example:
  - Select "Departments" (L1) → Your field becomes L2
  - Select "Departments.Teams" (L2) → Your field becomes L3

### 3. Visual Feedback
- **Status Box**: Shows current selection and calculated level
  - ✓ Green box when parent is selected
  - ℹ️ Blue box when at root level
- **Level Chips**: Color-coded badges showing nesting levels
- **Tree Path Display**: Shows full path to parent (e.g., "Departments.Teams")

## How It Works

### Building a Tree Structure

#### Step 1: Add Root Level Fields
```
1. Open "Add Field" modal
2. Field Type: NESTED_OBJECT
3. Leave Parent Node: "None (Root Level)"
4. Field Name: "Departments"
5. Nesting Level: 1 (automatically set)
```

Result:
```
Departments (L1)
```

#### Step 2: Add Child Under Root
```
1. Open "Add Field" modal
2. Field Type: NESTED_OBJECT
3. Parent Node: Select "Departments (L1)"
4. Field Name: "Teams"
5. Nesting Level: 2 (automatically calculated)
```

Result:
```
Departments (L1)
  └── Teams (L2)
```

#### Step 3: Add Nested Child
```
1. Open "Add Field" modal
2. Field Type: NESTED_OBJECT
3. Parent Node: Select "Departments.Teams (L2)"
4. Field Name: "Employees"
5. Nesting Level: 3 (automatically calculated)
```

Result:
```
Departments (L1)
  └── Teams (L2)
      └── Employees (L3)
```

## Real-World Example: Enterprise Organization

### Scenario
Build an enterprise hierarchy: Company → Divisions → Departments → Teams → Employees

### Step-by-Step Instructions

#### Field 1: Company (Root)
```yaml
Field Type: NESTED_OBJECT
Parent Node: None (Root Level)
Field Name: Company
Nesting Level: 1
Source Field: company
```

#### Field 2: Divisions (Under Company)
```yaml
Field Type: NESTED_OBJECT
Parent Node: Company (L1)
Field Name: Divisions
Nesting Level: 2 (auto-calculated)
Source Field: divisions
```

#### Field 3: Departments (Under Divisions)
```yaml
Field Type: NESTED_OBJECT
Parent Node: Company.Divisions (L2)
Field Name: Departments
Nesting Level: 3 (auto-calculated)
Source Field: departments
```

#### Field 4: Teams (Under Departments)
```yaml
Field Type: NESTED_OBJECT
Parent Node: Company.Divisions.Departments (L3)
Field Name: Teams
Nesting Level: 4 (auto-calculated)
Source Field: teams
```

#### Field 5: Employees (Under Teams)
```yaml
Field Type: NESTED_OBJECT
Parent Node: Company.Divisions.Departments.Teams (L4)
Field Name: Employees
Nesting Level: 5 (auto-calculated)
Source Field: employees
```

### Resulting Structure
```
Company (L1)
  └── Divisions (L2)
      └── Departments (L3)
          └── Teams (L4)
              └── Employees (L5)
```

### JSON Output Example
```json
{
  "Company": {
    "name": "Acme Corp",
    "Divisions": [
      {
        "name": "Engineering",
        "Departments": [
          {
            "name": "Software",
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
        ]
      }
    ]
  }
}
```

## UI Components

### Parent Node Selector
- **Location**: Appears only when Field Type = NESTED_OBJECT
- **Style**: Blue-bordered box with tree icon
- **Components**:
  - Tree icon (🌳)
  - "Tree Structure Builder" title
  - Dropdown with all existing nested fields
  - Status box with context info

### Level Indicators
- **L0**: Root level (default gray chip)
- **L1-L10**: Nested levels (blue outlined chips)
- **Visual Format**: Indentation shows hierarchy depth

### Status Box
- **Green Box (✓)**: Parent selected, shows path and calculated level
- **Blue Box (ℹ️)**: No parent, shows instruction message

## Technical Details

### Field Tree Builder
The modal automatically builds a hierarchical tree from existing field mappings:

```typescript
const buildFieldTree = (fields: FieldMapping[], prefix = '') => {
  const tree: Array<{ path: string; label: string; level: number }> = []
  
  fields.forEach(field => {
    const path = prefix ? `${prefix}.${field.targetField}` : field.targetField
    const level = field.nestingLevel || 0
    
    tree.push({
      path,
      label: `${'  '.repeat(level)}${field.targetField} (L${level})`,
      level
    })
    
    if (field.children && field.children.length > 0) {
      tree.push(...buildFieldTree(field.children, path))
    }
  })
  
  return tree
}
```

### Auto-Level Calculation
When a parent is selected:
```typescript
const parentNode = fieldTree.find(node => node.path === selected)
if (parentNode) {
  setSpecifiedNestingLevel(parentNode.level + 1)
}
```

### Field Creation
The field is created with the selected parent and calculated level:
```typescript
const effectiveParent = selectedParentPath || parentField
const newField: FieldMapping = {
  targetField: fieldName,
  parentField: effectiveParent,
  nestingLevel: specifiedNestingLevel,
  // ... other properties
}
```

## Best Practices

### 1. Plan Your Hierarchy
- Sketch out your tree structure before starting
- Identify all levels (e.g., Company → Division → Department)
- Consider data relationships and nesting depth

### 2. Build Top-Down
- Start with root-level fields (L1)
- Add children progressively (L2, L3, etc.)
- Verify parent selection at each step

### 3. Use Descriptive Names
- Field names should clearly indicate their role
- Example: "Departments" not "Dept" or "D"
- Use consistent naming conventions

### 4. Leverage Auto-Calculation
- Don't manually set nesting levels when using parent selector
- Let the system calculate based on parent
- Verify the calculated level before saving

### 5. Review Tree Structure
- The dropdown shows the current tree state
- Check indentation to verify hierarchy
- Confirm level numbers match expectations

## Limitations

1. **Maximum Depth**: Nesting level range is 0-10
2. **Field Type**: Tree selector only appears for NESTED_OBJECT type
3. **Existing Fields Only**: Can only select from already-created fields
4. **No Circular References**: Cannot nest a field under itself or its children

## Troubleshooting

### Issue: Parent Node Dropdown is Empty
**Cause**: No existing NESTED_OBJECT fields in mappings
**Solution**: Create at least one nested field first without a parent

### Issue: Wrong Nesting Level Calculated
**Cause**: Parent field has incorrect level
**Solution**: Edit parent field first to fix its level

### Issue: Tree Structure Not Displaying
**Cause**: Field Type is not NESTED_OBJECT
**Solution**: Change Field Type to "Nested Object Field"

### Issue: Cannot Select Desired Parent
**Cause**: Parent field doesn't exist yet
**Solution**: Create parent field first, then add child

## Examples from Test Data

### Example 1: Simple Nested Structure
Using `test-simple-source.json`:

```
User (L1)
  └── Address (L2)
  └── Scores (L2)
```

### Example 2: Complex Nested Structure
Using `complex-test-data.json`:

```
Organization (L1)
  └── Departments (L2)
      └── Teams (L3)
          └── Employees (L4)
```

## Integration with Backend

The tree structure is sent to backend as:
```json
{
  "targetField": "Employees",
  "sourceField": "employees",
  "fieldType": "NESTED_OBJECT",
  "nestingLevel": 4,
  "parentField": "Organization.Departments.Teams",
  "children": [...]
}
```

Backend processes this to create proper nested JSON structure with correct hierarchy.

## Summary

The Tree Structure Builder provides:
- ✅ Visual parent node selection
- ✅ Automatic level calculation
- ✅ Real-time preview of structure
- ✅ Intuitive UI with icons and chips
- ✅ Support for unlimited nesting depth (up to L10)
- ✅ Clear feedback and validation

This feature enables building complex enterprise data models with minimal manual configuration.
