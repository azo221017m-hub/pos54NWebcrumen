# Visual Guide: EXIST. Field Addition to FormularioMovimiento

## Overview
This document describes the visual changes made to the FormularioMovimiento component in the MovimientosInventario page.

## Changes Summary
A new column "EXIST." (existencia) has been added to display the stock_actual value from tblposcrumenwebinsumos.

## Location
- **Page**: MovimientosInventario
- **Component**: FormularioMovimiento
- **File**: `src/components/movimientos/FormularioMovimiento/FormularioMovimiento.tsx`

## Before and After

### Table Header - BEFORE:
```
| INSUMO | CANT. | COSTO | PROVEEDOR | U.M. | COSTO POND. | CANT. ÚLT. | PROV. ÚLT. | COSTO ÚLT. | [Delete] |
```

### Table Header - AFTER:
```
| INSUMO | CANT. | COSTO | PROVEEDOR | U.M. | EXIST. | COSTO POND. | CANT. ÚLT. | PROV. ÚLT. | COSTO ÚLT. | [Delete] |
```

## Field Details

### EXIST. Column
- **Label**: "EXIST."
- **Position**: Between "U.M." and "COSTO POND." columns
- **Data Source**: `ultimaCompra?.existencia` (which is populated from `insumo.stock_actual`)
- **Type**: Read-only text input
- **Styling**: Uses `campo-solo-lectura` class (gray background, disabled state)
- **Behavior**: 
  - Automatically populated when an insumo is selected
  - Shows the current stock (existencia) of the selected insumo
  - Empty if no insumo is selected or data is not available

## Technical Implementation

### Code Changes
1. **Table Header** (line 259): Added `<th>EXIST.</th>`
2. **Table Body** (lines 329-335): Added new `<td>` with input field displaying `ultimaCompra?.existencia`
3. **CSS** (lines 228-289): Updated column width distribution to accommodate the new column

### Data Flow
1. User selects an insumo from the dropdown
2. `actualizarDetalle` function is triggered (line 115-161)
3. System fetches insumo details including `stock_actual`
4. Data is stored in `ultimasCompras` Map with key `existencia: insumoSeleccionado.stock_actual` (line 134)
5. The EXIST. field automatically displays this value using `ultimaCompra?.existencia ?? ''` (line 332)

## Column Width Distribution

### Updated CSS (to accommodate new column):
- INSUMO: 15% (was 16%)
- CANT.: 6% (was 7%)
- COSTO: 6% (was 7%)
- PROVEEDOR: 10% (was 11%)
- U.M.: 6% (unchanged)
- **EXIST.: 7% (NEW)**
- COSTO POND.: 7% (was 8%)
- CANT. ÚLT.: 7% (was 8%)
- PROV. ÚLT.: 10% (was 11%)
- COSTO ÚLT.: 7% (was 8%)
- Delete button: 5% (unchanged)

## User Experience

When a user:
1. Opens the FormularioMovimiento modal
2. Clicks "+ INSUMO" button to add a new row
3. Selects an insumo from the dropdown

The system will:
1. Automatically populate the U.M. field with the unit of measurement
2. **Automatically populate the EXIST. field with the current stock** (NEW)
3. Automatically populate the COSTO POND. field with the weighted average cost
4. Show all other related fields from the last purchase

## Validation
- Build Status: ✅ Successful
- TypeScript Compilation: ✅ No errors
- Code Review: ✅ No issues found
- Security Scan (CodeQL): ✅ No vulnerabilities

## Files Modified
1. `src/components/movimientos/FormularioMovimiento/FormularioMovimiento.tsx` - Added EXIST. column
2. `src/components/movimientos/FormularioMovimiento/FormularioMovimiento.css` - Updated column widths

## Notes
- The field is read-only (disabled) as it displays reference data
- Uses the existing styling and data structure
- No backend changes required - data already available in the component
- Minimal changes to maintain code stability
