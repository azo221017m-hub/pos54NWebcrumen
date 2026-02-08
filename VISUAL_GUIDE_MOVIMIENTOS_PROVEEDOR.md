# Visual Guide: MovimientosInventario Form Updates

## Overview
This guide shows the visual changes made to the FormularioMovimiento component in the MovimientosInventario page.

## Before vs After

### BEFORE: Original Table Layout
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ INSUMO  │ CANTIDAD │ COSTO │ PROVEEDOR    │ Existencia │ Costo Última... │
│                                 (text)                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ [dropdown] │ [input] │ [input] │ [text input] │ [empty] │ [empty] │ ...   │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Issues:**
- PROVEEDOR was a free-text input (no validation)
- Read-only fields were empty (no auto-population)
- No "Unidad de Medida" column

### AFTER: Updated Table Layout
```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ INSUMO  │ CANTIDAD │ COSTO │ PROVEEDOR  │ Unidad de │ Existencia │ Costo Última... │
│                              (dropdown)   │  Medida   │            │                 │
│                                           │  (NEW!)   │            │                 │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ [dropdown] │ [input] │ [input] │ [dropdown] │ [KG]    │ [150.5]   │ [$45.00]      │
│                                  ↑            ↑          ↑           ↑                │
│                          from suppliers   auto-filled when insumo is selected        │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**Improvements:**
✅ PROVEEDOR is now a dropdown (validated selection)
✅ New "Unidad de Medida" column added in correct position
✅ All read-only fields auto-populate when insumo is selected

## Complete Column Layout (After)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        SUMATORIA DE MOVIMIENTO de INVENTARIO                                   │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                │
│  Motivo: [COMPRA ▼]                                      [PENDIENTE] [PROCESAR]              │
│  [+ INSUMO]                                                                                    │
│                                                                                                │
├─────┬──────────┬───────┬───────────┬──────────┬───────────┬─────────────┬──────────────┬─────┤
│     │          │       │           │ Unidad de│           │    Costo    │  Cantidad    │     │
│INSM │ CANTIDAD │ COSTO │ PROVEEDOR │  Medida  │Existencia │   Última    │   Última     │ Del │
│     │          │       │           │   (NEW)  │           │  Ponderado  │   Compra     │     │
├─────┼──────────┼───────┼───────────┼──────────┼───────────┼─────────────┼──────────────┼─────┤
│[▼]  │ [0.000]  │[0.00] │    [▼]    │   [KG]   │  [150.5]  │  [$45.00]   │   [25.000]   │ [🗑] │
│Harina│          │       │ Don Pepe  │          │           │             │              │     │
│     │          │       │           │          │           │             │              │     │
├─────┴──────────┴───────┴───────────┴──────────┴───────────┴─────────────┴──────────────┴─────┤
│                                                           Continued ➡                          │
└────────────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Continued from left ⬅                                         │
├────────────────────┬─────────────────────┬────────────────────┤
│    Proveedor       │       Costo         │                    │
│   Última Compra    │   Última Compra     │                    │
├────────────────────┼─────────────────────┼────────────────────┤
│   [Don Pepe]       │     [$44.50]        │                    │
│                    │                     │                    │
│                    │                     │                    │
└────────────────────┴─────────────────────┴────────────────────┘

Legend:
[▼] = Dropdown (editable)
[...] = Input field (editable)
[text] = Read-only field (auto-populated)
[🗑] = Delete button
```

## Field Types

### Editable Fields (User Input)
1. **INSUMO** - Dropdown
   - Lists all insumos from `tblposcrumenwebinsumos`
   - Required field
   - Triggers auto-population when changed

2. **CANTIDAD** - Number input
   - Decimal precision: 0.001
   - Required field
   - User enters quantity

3. **COSTO** - Number input
   - Decimal precision: 0.01
   - Optional field
   - Pre-filled from insumo but can be edited

4. **PROVEEDOR** - Dropdown (NEW BEHAVIOR)
   - Lists all proveedores from `tblposcrumenwebproveedores`
   - Shows `nombre` field
   - Stores selected name in database
   - Optional field

### Read-Only Fields (Auto-Populated)
5. **Unidad de Medida** - Text (NEW COLUMN)
   - Source: `tblposcrumenwebinsumos.unidad_medida`
   - Shows when insumo is selected
   - Example: "KG", "LT", "PZ"

6. **Existencia** - Text
   - Source: `tblposcrumenwebinsumos.stock_actual`
   - Shows current stock level
   - Example: "150.5"

7. **Costo Última Ponderado** - Text
   - Source: `tblposcrumenwebinsumos.costo_promedio_ponderado`
   - Shows average weighted cost
   - Example: "$45.00"

8. **Cantidad Última Compra** - Text
   - Source: Last COMPRA movement from `tblposcrumenwebdetallemovimientos`
   - Filtered by insumo and negocio
   - Example: "25.000"

9. **Proveedor Última Compra** - Text
   - Source: Last COMPRA movement from `tblposcrumenwebdetallemovimientos`
   - Shows supplier of last purchase
   - Example: "Don Pepe"

10. **Costo Última Compra** - Text
    - Source: Last COMPRA movement from `tblposcrumenwebdetallemovimientos`
    - Shows cost of last purchase
    - Example: "$44.50"

## User Interaction Flow

### 1. Open Form
```
User clicks "Nuevo Movimiento"
    ↓
Form opens with empty table
    ↓
System loads:
  - Insumos list
  - Proveedores list
```

### 2. Add Item Row
```
User clicks "+ INSUMO"
    ↓
New empty row appears
```

### 3. Select Insumo (KEY INTERACTION)
```
User selects insumo from dropdown
    ↓
System immediately:
  1. Fills in basic info (name, unit, base cost)
  2. Calls API: GET /api/movimientos/insumo/{id}/ultima-compra
    ↓
  3. API returns:
     {
       existencia: 150.5,
       costoUltimoPonderado: 45.00,
       unidadMedida: "KG",
       cantidadUltimaCompra: 25.000,
       proveedorUltimaCompra: "Don Pepe",
       costoUltimaCompra: 44.50
     }
    ↓
  4. UI updates all read-only fields immediately
```

### 4. Select Proveedor
```
User opens proveedor dropdown
    ↓
Dropdown shows list of suppliers:
  - Don Pepe
  - Proveedor XYZ
  - Almacén Central
  - etc.
    ↓
User selects supplier
    ↓
Supplier name stored in detalle.proveedor
```

### 5. Complete and Save
```
User fills in:
  - Cantidad: 30.000
  - (Optionally adjusts Costo)
    ↓
User clicks "PROCESAR"
    ↓
System saves:
  - idinsumo
  - nombreinsumo
  - cantidad
  - costo
  - proveedor (supplier name)
  - Other required fields
    ↓
Movement created in database
```

## Visual Examples

### Example 1: Buying Flour
```
┌────────────────────────────────────────────────────────────────┐
│ INSUMO: [Harina ▼]                                            │
│ CANTIDAD: [50.000]                                            │
│ COSTO: [$45.00]                                               │
│ PROVEEDOR: [Don Pepe ▼]                                       │
│                                                                │
│ Auto-populated:                                                │
│ ├─ Unidad de Medida: KG                                       │
│ ├─ Existencia: 25.5                                           │
│ ├─ Costo Última Ponderado: $44.00                             │
│ ├─ Cantidad Última Compra: 40.000                             │
│ ├─ Proveedor Última Compra: Don Pepe                          │
│ └─ Costo Última Compra: $44.00                                │
└────────────────────────────────────────────────────────────────┘
```

### Example 2: Buying Oil (No Previous Purchase)
```
┌────────────────────────────────────────────────────────────────┐
│ INSUMO: [Aceite Vegetal ▼]                                    │
│ CANTIDAD: [10.000]                                            │
│ COSTO: [$85.00]                                               │
│ PROVEEDOR: [Almacén Central ▼]                                │
│                                                                │
│ Auto-populated:                                                │
│ ├─ Unidad de Medida: LT                                       │
│ ├─ Existencia: 0.0                                            │
│ ├─ Costo Última Ponderado: $0.00                              │
│ ├─ Cantidad Última Compra: 0.000 (no previous purchase)       │
│ ├─ Proveedor Última Compra: (empty)                           │
│ └─ Costo Última Compra: $0.00                                 │
└────────────────────────────────────────────────────────────────┘
```

## Key Visual Changes Summary

| Aspect | Before | After |
|--------|--------|-------|
| **PROVEEDOR field** | Text input | Dropdown select |
| **Column count** | 9 columns | 10 columns |
| **New column** | None | "Unidad de Medida" |
| **Column position** | N/A | After PROVEEDOR |
| **Auto-population** | None | 6 fields |
| **Data validation** | Manual entry | Validated selection |

## CSS/Styling Notes

No major CSS changes required. The existing `.tabla-insumos` styles handle the additional column naturally due to:
- Flexible table layout
- Horizontal scrolling for overflow
- Existing responsive design

The read-only fields use existing `.campo-solo-lectura` class for consistent styling.

## Accessibility

- ✅ All dropdowns are keyboard navigable
- ✅ Read-only fields clearly distinguished visually
- ✅ Required fields marked appropriately
- ✅ Logical tab order maintained
- ✅ Clear visual feedback on selection

## Mobile Considerations

The table scrolls horizontally on mobile devices to accommodate all columns. Consider:
- Most important columns (INSUMO, CANTIDAD, COSTO, PROVEEDOR) appear first
- Read-only information columns can be scrolled to view
- Delete button remains accessible on far right

---

**Note**: For actual screenshots of the UI, please test the implementation in a running environment. This visual guide provides a text-based representation of the changes.
