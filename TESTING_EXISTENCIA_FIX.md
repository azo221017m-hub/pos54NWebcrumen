# Testing Guide: Existencia Field Fix

## Problem Fixed
The existencia (stock) field was showing incorrect values after adding/deleting rows in FormularioMovimiento.

## Root Cause
The `ultimasCompras` Map used array indices as keys. When rows were deleted, array indices shifted but Map keys remained unchanged, causing data misalignment.

## Solution
Changed from index-based keys to unique row IDs (`_rowId`) that persist across row operations.

## Testing Scenarios

### Scenario 1: Add Multiple Items (Basic Test)
1. Navigate to Movimientos de Inventario
2. Click "Nuevo Movimiento" or equivalent
3. Click "+ INSUMO" to add first row
4. Select an insumo from dropdown (e.g., "Insumo A")
5. **Verify**: EXIST. field shows the correct stock value
6. Click "+ INSUMO" to add second row
7. Select a different insumo (e.g., "Insumo B")
8. **Verify**: Both EXIST. fields show correct values for their respective insumos

### Scenario 2: Delete First Row (Critical Test)
1. Add 3 insumos with different stock values:
   - Row 0: Insumo A (stock: 100)
   - Row 1: Insumo B (stock: 200)
   - Row 2: Insumo C (stock: 300)
2. Delete row 0 (Insumo A)
3. **Verify**: 
   - Row 0 (now Insumo B) shows EXIST. = 200 (not 100!)
   - Row 1 (now Insumo C) shows EXIST. = 300 (not 200!)

### Scenario 3: Delete Middle Row
1. Add 3 insumos:
   - Row 0: Insumo A (stock: 100)
   - Row 1: Insumo B (stock: 200)
   - Row 2: Insumo C (stock: 300)
2. Delete row 1 (Insumo B)
3. **Verify**:
   - Row 0 (Insumo A) still shows EXIST. = 100
   - Row 1 (now Insumo C) shows EXIST. = 300 (not 200!)

### Scenario 4: Multiple Deletions
1. Add 5 insumos with known stock values
2. Delete rows randomly (e.g., delete row 1, then row 3, then row 0)
3. **Verify**: After each deletion, all remaining EXIST. values are correct

### Scenario 5: Add After Delete
1. Add 2 insumos
2. Delete the first one
3. Add a new insumo
4. **Verify**: All EXIST. values are correct

## Console Verification
Open browser DevTools console and look for debug output:
```
=== DEBUG: Insumo Seleccionado ===
INSUMO: [name]
EXIST.: [value]
...
```

The EXIST. value in console should match the EXIST. value displayed in the table.

## Expected Behavior
- ✅ EXIST. field always shows the correct stock value for its row
- ✅ Deleting rows doesn't affect other rows' EXIST. values
- ✅ Adding new rows after deletions works correctly
- ✅ Console logs match displayed values

## Technical Changes
- Added `_rowId` field to `DetalleMovimientoExtended` interface
- Changed `ultimasCompras` Map from `Map<number, UltimaCompraData>` to `Map<string, UltimaCompraData>`
- Generate unique ID on row creation: `row-${Date.now()}-${Math.random()}`
- Updated all Map operations to use `_rowId` instead of array index
- Row ID is removed before submitting data to backend

## Files Modified
- `src/components/movimientos/FormularioMovimiento/FormularioMovimiento.tsx`

## No Breaking Changes
- Backend API unchanged
- Data structure unchanged (rowId is UI-only)
- Existing functionality preserved
