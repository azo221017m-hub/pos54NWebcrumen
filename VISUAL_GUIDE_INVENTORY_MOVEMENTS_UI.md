# Visual Guide: Inventory Movements UI Changes

## Overview
This guide provides a visual representation of the UI changes made to the PageMovimientosInventario (Inventory Movements Page).

## 1. ListaMovimientos - Action Buttons Changes

### Before Changes

**PENDIENTE Status Records:**
```
┌─────────────────────────────────────────────────┐
│ ID │ Tipo │ ... │ Estatus │ Acciones          │
├─────────────────────────────────────────────────┤
│ 1  │ ENT  │ ... │ PENDIENTE│ [✓] [✏️] [🗑️]    │
└─────────────────────────────────────────────────┘
     Buttons: Procesar | Editar | Eliminar
```

**PROCESADO Status Records:**
```
┌─────────────────────────────────────────────────┐
│ ID │ Tipo │ ... │ Estatus  │ Acciones          │
├─────────────────────────────────────────────────┤
│ 2  │ SAL  │ ... │ PROCESADO│ [🗑️]              │
└─────────────────────────────────────────────────┘
     Buttons: Eliminar
```

### After Changes

**PENDIENTE Status Records:**
```
┌─────────────────────────────────────────────────┐
│ ID │ Tipo │ ... │ Estatus │ Acciones          │
├─────────────────────────────────────────────────┤
│ 1  │ ENT  │ ... │ PENDIENTE│ [✏️]              │
└─────────────────────────────────────────────────┘
     Buttons: Editar only
```

**PROCESADO Status Records:**
```
┌─────────────────────────────────────────────────┐
│ ID │ Tipo │ ... │ Estatus  │ Acciones          │
├─────────────────────────────────────────────────┤
│ 2  │ SAL  │ ... │ PROCESADO│                   │
└─────────────────────────────────────────────────┘
     Buttons: None
```

### Change Summary
- ❌ Removed: "Procesar" button from PENDIENTE records
- ❌ Removed: "Eliminar" button from all records (PENDIENTE and PROCESADO)
- ✅ Kept: "Editar" button only for PENDIENTE records
- ✅ Result: PROCESADO records have no action buttons

## 2. FormularioMovimientos - MotivoMovimiento Field

### Behavior Flow

```
┌─────────────────────────────────────────────────────────┐
│ NUEVO MOVIMIENTO                                        │
├─────────────────────────────────────────────────────────┤
│ Motivo de Movimiento: [COMPRA ▼]  ← ENABLED           │
│                                                         │
│ [+ INSUMO] button                                      │
│                                                         │
│ Supplies Table: (empty)                                │
└─────────────────────────────────────────────────────────┘

            ↓ User clicks [+ INSUMO] and adds a supply

┌─────────────────────────────────────────────────────────┐
│ SUMATORIA DE MOVIMIENTO de INVENTARIO                   │
├─────────────────────────────────────────────────────────┤
│ Motivo de Movimiento: [COMPRA ▼]  ← DISABLED (grayed) │
│                                                         │
│ [+ INSUMO] button                                      │
│                                                         │
│ Supplies Table:                                        │
│ ┌─────────┬──────┬───────┬───────────┬──────┐         │
│ │ INSUMO  │ CANT │ COSTO │ PROVEEDOR │ ...  │         │
│ ├─────────┼──────┼───────┼───────────┼──────┤         │
│ │ Harina  │  10  │ 25.00 │ ABC Corp  │ ...  │         │
│ └─────────┴──────┴───────┴───────────┴──────┘         │
└─────────────────────────────────────────────────────────┘
```

### Technical Details
- **Condition**: `disabled={guardando || detalles.length > 0}`
- **When enabled**: New movement form with no supplies added
- **When disabled**: 
  - Form is saving (`guardando === true`)
  - OR supplies exist (`detalles.length > 0`)

## 3. FormularioMovimientos - APLICAR Button

### Before Changes
```
┌─────────────────────────────────────────────┐
│ Botones de Acción:                         │
│ [SOLICITAR] [APLICAR] ← Always disabled   │
└─────────────────────────────────────────────┘
```

### After Changes

**No Supplies Added:**
```
┌─────────────────────────────────────────────┐
│ Botones de Acción:                         │
│ [SOLICITAR] [APLICAR] ← Disabled          │
│                                            │
│ Supplies Table: (empty)                   │
└─────────────────────────────────────────────┘
```

**With Supplies Added:**
```
┌─────────────────────────────────────────────┐
│ Botones de Acción:                         │
│ [SOLICITAR] [APLICAR] ← Enabled           │
│                                            │
│ Supplies Table:                           │
│ ┌──────────┬──────┬───────┐              │
│ │ INSUMO   │ CANT │ COSTO │              │
│ ├──────────┼──────┼───────┤              │
│ │ Harina   │  10  │ 25.00 │              │
│ │ Azúcar   │   5  │ 15.00 │              │
│ └──────────┴──────┴───────┘              │
└─────────────────────────────────────────────┘
```

### Technical Details
- **Condition**: `disabled={detalles.length === 0 || guardando}`
- **When enabled**: At least one supply exists and not saving
- **When disabled**: 
  - No supplies added (`detalles.length === 0`)
  - OR form is saving (`guardando === true`)

## 4. FormularioMovimientos - Provider Summaries

### Visual Layout (Already Working)

```
┌─────────────────────────────────────────────────────────┐
│ Supplies Table                                          │
│ ┌─────────┬──────┬───────┬───────────┬──────┐         │
│ │ INSUMO  │ CANT │ COSTO │ PROVEEDOR │ ...  │         │
│ ├─────────┼──────┼───────┼───────────┼──────┤         │
│ │ Harina  │  10  │ 25.00 │ ABC Corp  │ ...  │         │
│ │ Azúcar  │   5  │ 15.00 │ ABC Corp  │ ...  │         │
│ │ Aceite  │   3  │ 30.00 │ XYZ Ltd   │ ...  │         │
│ └─────────┴──────┴───────┴───────────┴──────┘         │
│                                                         │
│ ┌─────────────────────────────────────────────┐        │
│ │ SUMATORIAS                                  │        │
│ │                                             │        │
│ │ Total General: $415.00                      │        │
│ │                                             │        │
│ │ Subtotales por proveedor:                   │        │
│ │   ABC Corp: $325.00                         │        │
│ │   XYZ Ltd:   $90.00                         │        │
│ └─────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### Calculation Logic
```
Subtotal per provider = Σ(cantidad × costo) for each provider
Total General = Σ(cantidad × costo) for all supplies
```

## 5. Complete User Workflow

### Creating a New Movement

```
Step 1: User clicks "Nuevo Movimiento"
┌─────────────────────────────────────┐
│ NUEVO MOVIMIENTO                    │
│ Motivo: [COMPRA ▼] ← ENABLED       │
│ [+ INSUMO]                          │
│ [SOLICITAR] [APLICAR] ← DISABLED   │
└─────────────────────────────────────┘

Step 2: User adds first supply
┌─────────────────────────────────────┐
│ SUMATORIA DE MOVIMIENTO             │
│ Motivo: [COMPRA ▼] ← DISABLED      │
│ [+ INSUMO]                          │
│ Table: 1 supply added               │
│ Subtotales shown                    │
│ [SOLICITAR] [APLICAR] ← ENABLED    │
└─────────────────────────────────────┘

Step 3: User clicks SOLICITAR
→ Movement saved with STATUS='PENDIENTE'
→ All supplies saved with idreferencia=idmovimiento
→ Form closes, list refreshes

Step 4: User views list
┌─────────────────────────────────────┐
│ LISTA DE MOVIMIENTOS                │
│ ID: 123, Status: PENDIENTE [✏️]    │
│ (Only Edit button visible)          │
└─────────────────────────────────────┘
```

### Editing an Existing PENDIENTE Movement

```
Step 1: User clicks [✏️] on PENDIENTE record
┌─────────────────────────────────────┐
│ EDITAR MOVIMIENTO                   │
│ Motivo: [COMPRA ▼] ← DISABLED      │
│ (has existing supplies)             │
│ Table: Shows existing supplies      │
│ [SOLICITAR] [APLICAR] ← ENABLED    │
└─────────────────────────────────────┘

Step 2: User can:
- Add more supplies
- Edit existing supply quantities/costs
- Remove supplies
- Cannot change Motivo (disabled)

Step 3: User clicks SOLICITAR
→ Movement updated
→ Changes saved
→ Form closes, list refreshes
```

### Viewing a PROCESADO Movement

```
User views list with PROCESADO record
┌─────────────────────────────────────┐
│ LISTA DE MOVIMIENTOS                │
│ ID: 100, Status: PROCESADO         │
│ (No action buttons visible)         │
└─────────────────────────────────────┘

Note: PROCESADO records cannot be edited or deleted from UI
```

## Button State Summary

| Component | Button | Enabled When | Disabled When |
|-----------|--------|--------------|---------------|
| ListaMovimientos | Procesar | ❌ Removed | ❌ Removed |
| ListaMovimientos | Editar | Status = PENDIENTE | Status = PROCESADO |
| ListaMovimientos | Eliminar | ❌ Removed | ❌ Removed |
| FormularioMovimiento | SOLICITAR | Always (unless saving) | guardando === true |
| FormularioMovimiento | APLICAR | detalles.length > 0 | detalles.length === 0 OR guardando |
| FormularioMovimiento | MotivoMovimiento | detalles.length === 0 | detalles.length > 0 OR guardando |

## Color Coding / Visual Indicators

### Status Badges
```
PENDIENTE: [⏰ PENDIENTE] - Yellow/Orange background
PROCESADO: [✓ PROCESADO] - Green background
```

### Button Styles
```
[✏️] Edit     - Blue color, visible for PENDIENTE only
[✓] Procesar  - Green color, ❌ REMOVED
[🗑️] Eliminar  - Red color, ❌ REMOVED
```

### Field States
```
Enabled:   White background, black text
Disabled:  Gray background, gray text
```

## Impact Summary

### User Experience Improvements
1. ✅ Simplified action options - users see only relevant actions
2. ✅ Prevents accidental deletion of movements
3. ✅ Prevents processing movements directly from list (must use form)
4. ✅ Protects movement integrity by locking Motivo field when supplies exist
5. ✅ Clear feedback on when APLICAR button can be used

### Data Integrity
1. ✅ Cannot change movement reason after supplies are added
2. ✅ Cannot delete movements from list view
3. ✅ Cannot process movements from list view
4. ✅ All new supplies saved with PENDIENTE status
5. ✅ Proper reference tracking (idreferencia)

## Notes

- All changes are backwards compatible
- No database schema changes required
- No API endpoint changes required
- Changes affect only frontend UI and validation logic
- Existing PROCESADO movements remain unaffected
- Users can still edit PENDIENTE movements via Edit button
