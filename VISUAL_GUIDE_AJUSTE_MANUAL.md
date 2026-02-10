# Visual Guide - AJUSTE MANUAL Implementation

## Overview
This guide demonstrates the AJUSTE MANUAL (Manual Adjustment) functionality implementation.

## User Flow

### 1. Creating AJUSTE MANUAL Movement

#### Step 1: Open New Movement Form
```
User clicks "Nuevo Movimiento" → FormularioMovimiento opens
```

#### Step 2: Select AJUSTE MANUAL
```
┌─────────────────────────────────────────┐
│ motivo de Movimiento                    │
│ [AJUSTE MANUAL ▼]                       │
│                                         │
│ Observaciones *                         │ ← Red asterisk indicates required
│ [_______________________________]       │
│                                         │
│ [+ INSUMO]  [SOLICITAR]                │
└─────────────────────────────────────────┘
```

**Key Changes:**
- ✅ Red asterisk (*) appears next to "Observaciones" label
- ✅ Field is marked as `required` in HTML
- ✅ Visual indicator that this field is mandatory

#### Step 3: Validation on Submit

**Without Observaciones:**
```javascript
// Frontend validation triggers
if (motivomovimiento === 'AJUSTE_MANUAL' && !observaciones.trim()) {
  alert('Las observaciones son requeridas para movimientos de tipo AJUSTE MANUAL');
  return; // Prevents submission
}
```

**Result:**
```
┌───────────────────────────────────────────────────────┐
│ ⚠️  Las observaciones son requeridas para             │
│     movimientos de tipo AJUSTE MANUAL                  │
│                                                        │
│                         [ OK ]                         │
└───────────────────────────────────────────────────────┘
```

**With Observaciones:**
```
✅ Form submits successfully
✅ POST /api/movimientos
✅ Movement created with PENDIENTE status
```

### 2. Applying AJUSTE MANUAL Movement

#### Step 1: View Existing Movement
```
┌─────────────────────────────────────────────────────┐
│ Movimientos de Inventario                           │
├─────────────────────────────────────────────────────┤
│ ID    │ Tipo         │ Motivo         │ Status      │
│ 3101  │ ENTRADA      │ AJUSTE_MANUAL  │ PENDIENTE   │
│       │              │                │ [Editar]    │
└─────────────────────────────────────────────────────┘
```

#### Step 2: Click Edit to Open Form
```
┌─────────────────────────────────────────┐
│ Editar Movimiento                       │
│                                         │
│ motivo de Movimiento                    │
│ [AJUSTE MANUAL] (disabled)              │
│                                         │
│ Observaciones *                         │
│ [Ajuste de inventario por conteo físico]│
│                                         │
│                [APLICAR]                │ ← Button visible in edit mode
└─────────────────────────────────────────┘
```

#### Step 3: Click APLICAR

**Confirmation Dialog:**
```
┌───────────────────────────────────────────────────────┐
│ ⚠️  ¿Está seguro de que desea aplicar este            │
│     movimiento? Esta acción actualizará el            │
│     inventario y no se puede deshacer.                │
│                                                        │
│              [ Cancelar ]  [ Aceptar ]                 │
└───────────────────────────────────────────────────────┘
```

**Backend Processing:**
```javascript
// Special AJUSTE_MANUAL logic
if (movimiento.motivomovimiento === 'AJUSTE_MANUAL') {
  // Find insumo
  const [insumos] = await pool.query(
    'SELECT id_insumo FROM tblposcrumenwebinsumos WHERE nombre = ? AND idnegocio = ?',
    [detalle.nombreinsumo, movimiento.idnegocio]
  );
  
  // Set ABSOLUTE values (not relative)
  await pool.execute(
    `UPDATE tblposcrumenwebinsumos 
     SET stock_actual = ?,                     // ← Absolute value
         costo_promedio_ponderado = ?,        // ← Absolute value
         idproveedor = ?,
         fechamodificacionauditoria = NOW(),
         usuarioauditoria = ?
     WHERE id_insumo = ? AND idnegocio = ?`,
    [
      detalle.cantidad,        // e.g., 100 (not +100)
      detalle.costo ?? 0,      // e.g., 50.00 (not +50.00)
      detalle.proveedor || null,
      usuarioAuditoria,
      insumoId,
      movimiento.idnegocio
    ]
  );
  
  // Update status to PROCESADO
  // ...
}
```

## Database Changes

### Before APLICAR
```
tblposcrumenwebinsumos
┌────────────┬──────────┬─────────────────────────┬────────────┐
│ id_insumo  │ nombre   │ stock_actual            │ proveedor  │
├────────────┼──────────┼─────────────────────────┼────────────┤
│ 501        │ Harina   │ 85                      │ Proveedor A│
│            │          │ costo_promedio: 45.00   │            │
└────────────┴──────────┴─────────────────────────┴────────────┘

tblposcrumenwebmovimientos
┌─────────────┬──────────────┬─────────────────┬─────────────┐
│ idmovimiento│ motivomov.   │ estatusmov.     │ idreferencia│
├─────────────┼──────────────┼─────────────────┼─────────────┤
│ 3101        │ AJUSTE_MANUAL│ PENDIENTE       │ 202602...   │
└─────────────┴──────────────┴─────────────────┴─────────────┘

tblposcrumenwebdetallemovimientos
┌──────────┬──────────┬──────────┬────────────┬─────────────┐
│ insumo   │ cantidad │ costo    │ proveedor  │ estatusmov. │
├──────────┼──────────┼──────────┼────────────┼─────────────┤
│ Harina   │ 100      │ 50.00    │ Proveedor B│ PENDIENTE   │
└──────────┴──────────┴──────────┴────────────┴─────────────┘
```

### After APLICAR (AJUSTE_MANUAL)
```
tblposcrumenwebinsumos (UPDATED with ABSOLUTE values)
┌────────────┬──────────┬─────────────────────────┬────────────┐
│ id_insumo  │ nombre   │ stock_actual            │ proveedor  │
├────────────┼──────────┼─────────────────────────┼────────────┤
│ 501        │ Harina   │ 100 ← SET to cantidad   │ Proveedor B│
│            │          │ costo_promedio: 50.00   │ ← Updated  │
│            │          │ ← SET to costo          │            │
└────────────┴──────────┴─────────────────────────┴────────────┘

tblposcrumenwebmovimientos
┌─────────────┬──────────────┬─────────────────┬─────────────┐
│ idmovimiento│ motivomov.   │ estatusmov.     │ idreferencia│
├─────────────┼──────────────┼─────────────────┼─────────────┤
│ 3101        │ AJUSTE_MANUAL│ PROCESADO ✅    │ 202602...   │
└─────────────┴──────────────┴─────────────────┴─────────────┘

tblposcrumenwebdetallemovimientos
┌──────────┬──────────┬──────────┬────────────┬─────────────┐
│ insumo   │ cantidad │ costo    │ proveedor  │ estatusmov. │
├──────────┼──────────┼──────────┼────────────┼─────────────┤
│ Harina   │ 100      │ 50.00    │ Proveedor B│ PROCESADO ✅│
└──────────┴──────────┴──────────┴────────────┴─────────────┘
```

## Key Differences: AJUSTE_MANUAL vs Other Movement Types

### Regular Movements (COMPRA, MERMA, CONSUMO)
```sql
-- Relative changes (addition/subtraction)
UPDATE tblposcrumenwebinsumos 
SET stock_actual = stock_actual + cantidad  -- ← Relative (85 + 100 = 185)
WHERE id_insumo = ?
```

### AJUSTE_MANUAL
```sql
-- Absolute value assignment
UPDATE tblposcrumenwebinsumos 
SET stock_actual = cantidad,                -- ← Absolute (set to 100)
    costo_promedio_ponderado = costo        -- ← Absolute (set to 50.00)
WHERE id_insumo = ?
```

## Validation Flow

```
┌─────────────────────┐
│ User fills form     │
│ - Selects AJUSTE    │
│   MANUAL            │
│ - Leaves observa-   │
│   ciones empty      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Clicks SOLICITAR    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Frontend Validation │
│ observaciones.trim()│
│ === empty?          │
└──────────┬──────────┘
           │
           ▼ Yes
┌─────────────────────┐
│ ⚠️  Alert shown     │
│ Form not submitted  │
└─────────────────────┘

           │ No
           ▼
┌─────────────────────┐
│ POST to backend     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Backend Validation  │
│ observaciones       │
│ .trim() === empty?  │
└──────────┬──────────┘
           │
           ▼ Yes
┌─────────────────────┐
│ HTTP 400 Response   │
│ Error message       │
└─────────────────────┘

           │ No
           ▼
┌─────────────────────┐
│ ✅ Movement created │
│ Status: PENDIENTE   │
└─────────────────────┘
```

## Error Handling

### Missing Insumo on APLICAR
```javascript
if (insumos.length === 0) {
  console.error(`Insumo no encontrado: ${detalle.nombreinsumo}`);
  throw new Error(`Insumo no encontrado: ${detalle.nombreinsumo}`);
}
// HTTP 500 response with error message
```

### Already Processed Movement
```javascript
if (movimiento.estatusmovimiento === 'PROCESADO') {
  res.status(400).json({
    success: false,
    message: 'El movimiento ya ha sido procesado'
  });
}
```

## Summary

✅ **Visual Feedback**: Red asterisk indicates required field  
✅ **Dual Validation**: Both client and server validate  
✅ **Absolute Values**: AJUSTE_MANUAL sets exact inventory levels  
✅ **Error Handling**: Graceful handling of edge cases  
✅ **Audit Trail**: Full tracking with timestamps and user info  
✅ **Status Management**: Clear PENDIENTE → PROCESADO flow  

---
**Created**: 2026-02-10  
**Feature**: AJUSTE MANUAL Implementation
