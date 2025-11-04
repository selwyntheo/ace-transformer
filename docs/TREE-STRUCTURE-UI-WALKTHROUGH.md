# Tree Structure Builder - UI Walkthrough

## Modal Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Add New Field                                      Level 1   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Target Field Name *                                          │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Teams                                                 │   │
│ └───────────────────────────────────────────────────────┘   │
│ The name of the field in the target format                   │
│                                                               │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 🌳 Tree Structure Builder                              │  │
│ ├────────────────────────────────────────────────────────┤  │
│ │                                                         │  │
│ │ Parent Node                                             │  │
│ │ ┌──────────────────────────────────────────────────┐   │  │
│ │ │ L2  Departments (L2)                         ▼   │   │  │
│ │ └──────────────────────────────────────────────────┘   │  │
│ │                                                         │  │
│ │ ┌──────────────────────────────────────────────────┐   │  │
│ │ │ ✓ Field will be nested under: Departments (Level 3)│  │
│ │ └──────────────────────────────────────────────────┘   │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                               │
│ Field Type                                                    │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Nested Object Field                               ▼   │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ Source Field Name *                                           │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ teams                                                 │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ Nesting Level                                                 │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 3                                                     │   │
│ └───────────────────────────────────────────────────────┘   │
│ Current: Level 3 (Auto-calculated from parent)                │
│                                                               │
│ 💡 Nesting Level 3: This field will be nested at level 3...  │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                   [Cancel]  [Add Field]      │
└─────────────────────────────────────────────────────────────┘
```

## Dropdown - Parent Node Options

```
┌──────────────────────────────────────────────────┐
│ L0  None (Root Level)                            │
├──────────────────────────────────────────────────┤
│ L1  Organization (L1)                            │
├──────────────────────────────────────────────────┤
│ L2    Departments (L2)                           │ ← Selected
├──────────────────────────────────────────────────┤
│ L2    Employees (L2)                             │
└──────────────────────────────────────────────────┘
```

## Use Case Flow

### Step 1: Open Modal and Select Field Type

```
User Action: Click "Add Target Field" button
Result: Modal opens

User Action: Select Field Type = "Nested Object Field"
Result: Tree Structure Builder section appears
```

### Step 2: View Available Parent Nodes

```
Current Field Structure:
Organization (L1)
  └── Departments (L2)
  └── Employees (L2)

Dropdown shows:
┌──────────────────────────────────────────┐
│ L0  None (Root Level)                    │
│ L1  Organization (L1)                    │
│ L2    Departments (L2)                   │
│ L2    Employees (L2)                     │
└──────────────────────────────────────────┘
```

### Step 3: Select Parent "Departments"

```
User Action: Click dropdown → Select "Departments (L2)"

Immediate Effects:
1. selectedParentPath = "Organization.Departments"
2. specifiedNestingLevel = 3 (auto-calculated: 2 + 1)
3. Status box turns green with ✓
4. Message: "Field will be nested under: Departments (Level 3)"
```

### Step 4: Complete Field Configuration

```
Target Field Name: Teams
Parent Node: Departments (L2) ✓
Field Type: Nested Object Field
Source Field: teams
Nesting Level: 3 (auto-calculated)
```

### Step 5: Add Field

```
User Action: Click "Add Field" button

Result:
New field created:
{
  "targetField": "Teams",
  "sourceField": "teams",
  "fieldType": "NESTED_OBJECT",
  "nestingLevel": 3,
  "parentField": "Organization.Departments",
  "isNested": true
}

Updated Tree Structure:
Organization (L1)
  └── Departments (L2)
      └── Teams (L3) ← NEW!
  └── Employees (L2)
```

## Visual Elements Breakdown

### 1. Tree Structure Builder Box

```
┌────────────────────────────────────────┐
│ 🌳 Tree Structure Builder              │ ← Header with icon
├────────────────────────────────────────┤
│ [Parent Node Dropdown]                 │ ← Selector
│                                         │
│ [Status Box with feedback]             │ ← Visual feedback
└────────────────────────────────────────┘

Style:
- Border: 1px solid primary blue
- Background: Light hover color
- Padding: 16px
- Border radius: 4px
```

### 2. Parent Node Dropdown Items

```
MenuItem Structure:
┌─────────────────────────────────────┐
│ [L2] Departments (L2)               │
│  ↑        ↑           ↑             │
│  │        │           │             │
│ Chip   Indented   Level Indicator   │
└─────────────────────────────────────┘

For nested items:
- 2 spaces per level
- Monospace font
- Level chip on left
```

### 3. Status Box States

#### No Parent Selected (Blue Box)
```
┌─────────────────────────────────────────────────┐
│ ℹ️ Select a parent node to nest this field     │
│   within an existing structure. The field      │
│   will automatically be assigned the correct   │
│   nesting level.                               │
└─────────────────────────────────────────────────┘

Colors:
- Background: info.light (light blue)
- Text: text.secondary (gray)
```

#### Parent Selected (Green Box)
```
┌─────────────────────────────────────────────────┐
│ ✓ Field will be nested under:                  │
│   Departments (Level 3)                         │
└─────────────────────────────────────────────────┘

Colors:
- Background: success.light (light green)
- Text: text.secondary (gray)
- Checkmark: Bold
```

### 4. Level Chips

```
Root Level:    [L0]  (Default gray)
Level 1:       [L1]  (Primary blue, outlined)
Level 2:       [L2]  (Primary blue, outlined)
Level 3:       [L3]  (Primary blue, outlined)
...
```

### 5. Nesting Level Input

```
┌─────────────────────────────────────────────────┐
│ Nesting Level                                   │
│ ┌───────────────────┐                          │
│ │ 3                 │ ← Number input           │
│ └───────────────────┘                          │
│ Current: Level 3 (Auto-calculated from parent) │
└─────────────────────────────────────────────────┘

Features:
- Type: number
- Range: 0-10
- Disabled when parent is selected
- Helper text shows calculation source
```

## Complex Scenario: Multi-Level Tree

### Initial State
```
Company (L1)
```

### After Adding "Divisions"
```
Company (L1)
  └── Divisions (L2)

Dropdown now shows:
┌──────────────────────────────────────┐
│ L0  None (Root Level)                │
│ L1  Company (L1)                     │
│ L2    Divisions (L2)                 │
└──────────────────────────────────────┘
```

### After Adding "Departments" under "Divisions"
```
Company (L1)
  └── Divisions (L2)
      └── Departments (L3)

Dropdown now shows:
┌──────────────────────────────────────┐
│ L0  None (Root Level)                │
│ L1  Company (L1)                     │
│ L2    Divisions (L2)                 │
│ L3      Departments (L3)             │
└──────────────────────────────────────┘
```

### After Adding "Teams" under "Departments"
```
Company (L1)
  └── Divisions (L2)
      └── Departments (L3)
          └── Teams (L4)

Dropdown now shows:
┌──────────────────────────────────────┐
│ L0  None (Root Level)                │
│ L1  Company (L1)                     │
│ L2    Divisions (L2)                 │
│ L3      Departments (L3)             │
│ L4        Teams (L4)                 │
└──────────────────────────────────────┘
```

## Interaction States

### 1. Modal Opens
- All fields empty
- Field Type = SIMPLE (default)
- Tree Structure Builder: Hidden
- Nesting Level: 1 (default)

### 2. User Selects "Nested Object Field"
- Tree Structure Builder: Appears
- Parent dropdown: Populated with existing fields
- Status box: Blue (info state)

### 3. User Selects Parent Node
- Parent dropdown: Selected value highlighted
- Nesting level: Auto-updates (parent.level + 1)
- Status box: Green (success state)
- Message: Shows parent path and new level

### 4. User Changes Target Field Name
- No effect on tree structure
- Field name will be added to tree after saving

### 5. User Clicks "Add Field"
- Field validates
- New field added to mappings
- Tree structure updated
- Modal closes
- Next time modal opens: New field appears in dropdown

## Accessibility Features

1. **Keyboard Navigation**
   - Tab through all form fields
   - Arrow keys in dropdown
   - Enter to select

2. **Screen Reader Support**
   - Labels for all inputs
   - Helper text descriptions
   - Status box announces changes

3. **Visual Feedback**
   - Color-coded status boxes
   - Clear level indicators
   - Hover states on dropdown items

4. **Clear Instructions**
   - Helper text on each field
   - Contextual status messages
   - Informative placeholder text

## Responsive Design

### Desktop (> 960px)
- Full modal width: 800px
- All elements visible
- Dropdown shows 6 items before scrolling

### Tablet (600-960px)
- Modal width: 90% screen
- Slightly smaller padding
- Dropdown shows 5 items

### Mobile (< 600px)
- Modal width: 95% screen
- Vertical layout
- Dropdown shows 4 items
- Chips stack vertically

## Color Scheme

```css
Tree Structure Builder Box:
- Border: primary.main (#1976d2)
- Background: action.hover (rgba(0,0,0,0.04))

Status Box - Info:
- Background: info.light (#4fc3f7)
- Border: info.main (#29b6f6)

Status Box - Success:
- Background: success.light (#81c784)
- Border: success.main (#66bb6a)

Level Chips:
- L0: default (gray)
- L1-L10: primary.main outlined (#1976d2)

Dropdown Items:
- Hover: action.hover
- Selected: primary.light (#42a5f5)
```

## Animation Effects

1. **Modal Open**: Slide down + fade in (300ms)
2. **Tree Builder Appear**: Expand height (200ms)
3. **Status Box Change**: Color transition (150ms)
4. **Dropdown Open**: Slide down (200ms)
5. **Level Chip Pulse**: On calculation (100ms)

## Example User Journey

```
1. User opens modal
   └─> Sees basic form fields

2. User selects "Nested Object Field" from Field Type dropdown
   └─> Tree Structure Builder box appears with animation
   └─> Shows existing field hierarchy

3. User opens Parent Node dropdown
   └─> Sees tree with indentation:
       L0  None (Root Level)
       L1  Organization (L1)
       L2    Departments (L2)

4. User selects "Departments (L2)"
   └─> Nesting Level input auto-updates to "3"
   └─> Status box turns green
   └─> Message: "Field will be nested under: Departments (Level 3)"

5. User enters "Teams" as Target Field Name
   └─> Form validates

6. User clicks "Add Field"
   └─> Field created with:
       - nestingLevel: 3
       - parentField: "Organization.Departments"
   └─> Modal closes
   └─> Success message appears

7. User opens modal again
   └─> Dropdown now includes "Teams (L3)" as option
   └─> Can create fields under Teams at L4
```

This visual walkthrough shows exactly how the Tree Structure Builder works in the UI!
