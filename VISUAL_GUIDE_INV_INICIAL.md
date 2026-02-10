# Visual Guide: INV_INICIAL (Initial Inventory) Feature

## Overview
This guide provides step-by-step visual descriptions of the INV_INICIAL feature implementation. Use this guide for manual testing and user training.

## Feature Location
**Navigation Path**: Dashboard → Movimientos de Inventario → Nuevo Movimiento

## UI Components

### 1. Movement Type Selection
**Location**: Top of FormularioMovimiento modal

**What to See**:
- Dropdown labeled "motivo de Movimiento"
- Options include:
  - COMPRA
  - AJUSTE MANUAL
  - MERMA
  - **INV. INICIAL** ← New functionality
  - CONSUMO

**Expected Behavior**:
- Selecting "INV. INICIAL" triggers the display of the initial inventory table

### 2. Initial Inventory Reference Table
**Appears When**: motivomovimiento = "INV. INICIAL" and creating new movement

**Visual Appearance**:
```
┌─────────────────────────────────────────────────────────────┐
│ Inventario Inicial - Insumos Activos                       │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────┐   │
│ │ NOMBRE  │ STOCK ACTUAL │ COSTO PROM... │ PROVEEDOR │   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ Harina  │     50.00    │    $15.50     │ Prov. A   │   │
│ │ Azúcar  │     30.00    │    $12.00     │ Prov. B   │   │
│ │ Huevos  │    100.00    │     $3.50     │ Prov. A   │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Design Characteristics**:
- **Background**: Light blue (#f0f8ff)
- **Border**: 2px solid blue (#2196F3)
- **Title**: Blue text (#1976D2), bold
- **Table Header**: Light blue background (#e3f2fd)
- **Row Spacing**: Compact (0.3rem padding, line-height 1.2)
- **Font Size**: Small (0.85rem for content, 0.8rem for headers)
- **Hover Effect**: Light gray background on row hover

**Columns**:
1. **NOMBRE**: Insumo name (left-aligned text)
2. **STOCK ACTUAL**: Current stock quantity (numeric)
3. **COSTO PROM. PONDERADO**: Weighted average cost (formatted as $XX.XX)
4. **PROVEEDOR**: Provider name (shows "N/A" if not set)

**Data Filtering**:
- Only shows insumos where `activo = 1`
- Only shows insumos from user's business (`idnegocio`)
- Automatically refreshes when insumos data loads

### 3. Main Movement Details Table
**Location**: Below the initial inventory table

**Visual Layout**:
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ INSUMO │ CANT. │ COSTO │ PROVEEDOR │ U.M. │ EXIST. │ ... │ PROV.ÚLT. │ [X] │
├──────────────────────────────────────────────────────────────────────────────┤
│ [Select]│ 0.00  │ 0.00  │ [Select]  │ kg   │  50.00 │ ... │ [Button]  │ [X] │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Interaction**:
- Users can add items by clicking "+ INSUMO"
- Each row allows selecting an insumo and entering quantity/cost
- The "EXIST." column shows current stock from the database
- The "PROV. ÚLT." column shows a clickable button to use last provider

### 4. Action Buttons

#### SOLICITAR Button
**Location**: Top right of modal
**Appearance**: Blue button (#2196F3)
**Visible**: Only when creating new movement (not in edit mode)
**Text**: "SOLICITAR" or "GUARDANDO..." when processing

**Behavior**:
- Validates all required fields
- Creates movement with status 'PENDIENTE'
- Saves movement to database
- Closes modal on success

#### APLICAR Button
**Location**: Top right of modal (replaces SOLICITAR in edit mode)
**Appearance**: Green button (#4CAF50)
**Visible**: Only when editing existing movement
**Text**: "APLICAR" or "APLICANDO..." when processing

**Behavior**:
- Confirms with user before applying
- Updates inventory with absolute values
- Sets status to 'PROCESADO'
- Cannot be undone (shows warning)

## User Workflow Visualization

### Step 1: Access Movement Form
```
Dashboard
    ↓
Movimientos de Inventario
    ↓
[Nuevo Movimiento] ← Click this button
    ↓
FormularioMovimiento modal opens
```

### Step 2: Select INV_INICIAL
```
┌─────────────────────────────────────────┐
│ motivo de Movimiento: [INV. INICIAL ▼] │
│ [+ INSUMO]  [Observaciones: _______ ]  │
│                          [SOLICITAR]    │
└─────────────────────────────────────────┘
```

### Step 3: Initial Inventory Table Appears
```
┌─────────────────────────────────────────────────────────┐
│ motivo de Movimiento: [INV. INICIAL ▼]                 │
│ [+ INSUMO]  [Observaciones: _______ ]  [SOLICITAR]    │
├─────────────────────────────────────────────────────────┤
│ ┌─── Inventario Inicial - Insumos Activos ───┐        │
│ │ NOMBRE  │ STOCK │ COSTO P. │ PROVEEDOR │            │
│ │─────────────────────────────────────────────│        │
│ │ Harina  │ 50.00 │  $15.50  │ Prov. A   │            │
│ │ Azúcar  │ 30.00 │  $12.00  │ Prov. B   │            │
│ │ Huevos  │100.00 │   $3.50  │ Prov. A   │            │
│ └─────────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────────┤
│ ┌─── Movement Details Table ───┐                       │
│ │ [Empty - Click + INSUMO to add items]                │
│ └──────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

### Step 4: Add Items
```
Click [+ INSUMO] button
    ↓
New row added to details table
    ↓
Select insumo from dropdown
    ↓
Enter quantity and cost
    ↓
(Optional) Select provider
    ↓
Repeat for additional items
```

### Step 5: Submit
```
Click [SOLICITAR]
    ↓
Validation runs:
- At least one item added? ✓
- All items have insumo selected? ✓
- All quantities > 0? ✓
    ↓
Movement created with status 'PENDIENTE'
    ↓
Modal closes
    ↓
Movement appears in list
```

### Step 6: Apply Movement
```
Click on movement in list
    ↓
FormularioMovimiento opens in edit mode
    ↓
[APLICAR] button visible (no initial inventory table)
    ↓
Click [APLICAR]
    ↓
Confirmation dialog: "¿Está seguro?"
    ↓
If confirmed:
  - Inventory updated (absolute values)
  - Status changed to 'PROCESADO'
  - Audit fields updated
    ↓
Modal closes
    ↓
Movement shows as 'PROCESADO' in list
```

## Visual States

### Loading State
```
┌─────────────────────────────────────┐
│ Inventario Inicial - Insumos Activos│
├─────────────────────────────────────┤
│                                     │
│     Cargando insumos...             │
│                                     │
└─────────────────────────────────────┘
```

### Empty State
```
┌─────────────────────────────────────┐
│ Inventario Inicial - Insumos Activos│
├─────────────────────────────────────┤
│                                     │
│  No hay insumos activos disponibles │
│                                     │
└─────────────────────────────────────┘
```

### With Data State
```
┌─────────────────────────────────────────────┐
│ Inventario Inicial - Insumos Activos       │
├─────────────────────────────────────────────┤
│ NOMBRE  │ STOCK │ COSTO P. │ PROVEEDOR     │
│─────────────────────────────────────────────│
│ Harina  │ 50.00 │  $15.50  │ Prov. A       │
│ Azúcar  │ 30.00 │  $12.00  │ Prov. B       │
│ Huevos  │100.00 │   $3.50  │ Prov. A       │
└─────────────────────────────────────────────┘
```

## Color Scheme

### Initial Inventory Section
- **Section Background**: #f0f8ff (Alice Blue)
- **Section Border**: #2196F3 (Blue)
- **Title Text**: #1976D2 (Dark Blue)
- **Table Background**: White
- **Header Background**: #e3f2fd (Light Blue)
- **Header Text**: #1976D2 (Dark Blue)
- **Row Hover**: #f5f5f5 (Light Gray)
- **Content Text**: #333 (Dark Gray)

### Action Buttons
- **SOLICITAR**: #2196F3 (Blue)
- **APLICAR**: #4CAF50 (Green)
- **+ INSUMO**: #4CAF50 (Green)

## Responsive Behavior

### Desktop (> 768px)
- Full width table with all columns visible
- Buttons aligned to the right
- Compact but readable spacing

### Tablet (768px - 1024px)
- Table may scroll horizontally if needed
- Buttons stack vertically on smaller screens
- Section remains visible

### Mobile (< 768px)
- Consider hiding initial inventory table or making it scrollable
- Buttons take full width
- Increased touch target sizes

## Accessibility Features

- ✅ Semantic HTML (table, thead, tbody)
- ✅ Proper heading hierarchy (h3 for section title)
- ✅ Loading states with descriptive text
- ✅ Empty states with helpful messages
- ✅ Hover states for better visibility
- ✅ Color contrast meets WCAG guidelines
- ✅ Keyboard navigation support (via React)

## Testing Scenarios

### Scenario 1: View Initial Inventory
1. Navigate to Movimientos de Inventario
2. Click "Nuevo Movimiento"
3. Select "INV. INICIAL" from dropdown
4. **Expected**: Blue section appears showing all active insumos
5. **Verify**: Only active items shown (activo = 1)
6. **Verify**: Only items from user's business shown

### Scenario 2: Create Movement
1. Complete Scenario 1
2. Click "+ INSUMO"
3. Select an insumo from dropdown
4. Enter quantity (e.g., 100)
5. Enter cost (e.g., 15.50)
6. (Optional) Select provider
7. Click "SOLICITAR"
8. **Expected**: Movement created successfully
9. **Verify**: Movement appears in list with status 'PENDIENTE'

### Scenario 3: Apply Movement
1. Click on a pending INV_INICIAL movement
2. **Verify**: APLICAR button visible (not SOLICITAR)
3. **Verify**: Initial inventory table NOT visible (edit mode)
4. Click "APLICAR"
5. **Expected**: Confirmation dialog appears
6. Click "OK" to confirm
7. **Expected**: Success message
8. **Verify**: Movement status changed to 'PROCESADO'
9. **Verify**: Inventory updated with absolute values

### Scenario 4: Edge Cases
1. **No Active Insumos**: Verify empty state message
2. **Loading State**: Verify loading message appears briefly
3. **Multiple Items**: Add 5+ items and verify table scrolls
4. **Validation**: Try submitting without items (should fail)
5. **Validation**: Try submitting with quantity = 0 (should fail)

## Common Issues & Solutions

### Issue: Initial inventory table doesn't appear
**Solution**: 
- Verify "INV. INICIAL" is selected
- Check that you're creating new movement (not editing)
- Ensure insumos are loaded (check network tab)

### Issue: Table is empty
**Solution**:
- Check that business has active insumos (activo = 1)
- Verify user's idnegocio is correct
- Check database for matching records

### Issue: Provider shows "N/A"
**Solution**:
- This is expected if insumo doesn't have provider set
- Provider can be set when adding item to movement

### Issue: APLICAR button not visible
**Solution**:
- SOLICITAR is for creating, APLICAR is for editing
- Save movement first, then edit to see APLICAR

## Manual Testing Checklist

- [ ] Initial inventory table appears when INV_INICIAL selected
- [ ] Table disappears when other motive selected
- [ ] Table shows only active insumos (activo = 1)
- [ ] Table filtered by user's idnegocio
- [ ] All four columns display correctly
- [ ] Cost formatted with $ and 2 decimals
- [ ] Provider shows "N/A" when null
- [ ] Table has blue theme and compact spacing
- [ ] Loading state displays correctly
- [ ] Empty state displays when no active insumos
- [ ] Row hover effect works
- [ ] Table scrolls horizontally if needed
- [ ] + INSUMO button adds new row
- [ ] SOLICITAR creates movement with PENDIENTE status
- [ ] APLICAR updates inventory with absolute values
- [ ] APLICAR changes status to PROCESADO
- [ ] Audit fields updated correctly
- [ ] Error messages display correctly
- [ ] Responsive design works on different screen sizes

## Performance Notes

- ✅ Memoized active insumos calculation prevents unnecessary re-renders
- ✅ Conditional rendering only shows table when needed
- ✅ Lazy loading could be added for large insumo lists (future)
- ✅ Table virtualization could be added for 100+ items (future)

## Browser Testing Matrix

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | Latest  | ✅ Tested |
| Firefox | Latest  | ⚠️ Test Recommended |
| Safari  | Latest  | ⚠️ Test Recommended |
| Edge    | Latest  | ⚠️ Test Recommended |

## Screenshots Guide

When testing, capture screenshots of:
1. ✅ Initial inventory table (with data)
2. ✅ Empty state
3. ✅ Loading state
4. ✅ Full modal with table and details
5. ✅ SOLICITAR action
6. ✅ APLICAR action
7. ✅ Success message
8. ✅ Movement in list (PENDIENTE)
9. ✅ Movement in list (PROCESADO)
10. ✅ Updated inventory values

## Documentation References
- Implementation details: `IMPLEMENTATION_INV_INICIAL.md`
- Security assessment: `SECURITY_SUMMARY_INV_INICIAL.md`
- Code changes: Git commit history
