# Implementation Summary: INV. INICIAL Form Changes

## Overview
This document describes the implementation of the required changes for the INV. INICIAL (Initial Inventory) movement type in the PageMovimientoInventario component.

## Requirements Addressed

### 1. Hide "+Insumo" Button
**Requirement**: When `motivomovimiento='INV. INICIAL'`, hide the "+Insumo" button.

**Implementation**: The "+INSUMO" button is now conditionally rendered:
```tsx
{motivomovimiento !== 'INV_INICIAL' && (
  <button type="button" className="btn-add-insumo" onClick={agregarDetalle}>
    + INSUMO
  </button>
)}
```

### 2. Hide Table Header
**Requirement**: When `motivomovimiento='INV. INICIAL'`, hide the entire table with headers (INSUMO, CANT., COSTO, PROVEEDOR, U.M., EXIST., COSTO POND., CANT. ÚLT., PROV. ÚLT., COSTO ÚLT.).

**Implementation**: The entire table is now conditionally rendered:
```tsx
{motivomovimiento !== 'INV_INICIAL' && (
  <div className="tabla-insumos-container">
    <table className="tabla-insumos">
      {/* ... table content ... */}
    </table>
  </div>
)}
```

### 3. Editable Fields in Initial Inventory
**Requirement**: When showing `camposmovinvinicial`, the "Stock actual" and "costo prom. ponderado" fields should be editable.

**Implementation**: 
- Added state management using `Map<number, { stockActual: number; costoPromPonderado: number }>` to track edited values
- Converted display fields to editable input fields
- Added validation to prevent negative values with `min="0"` attribute

```tsx
<td>
  <input
    type="number"
    step="0.001"
    min="0"
    value={editado?.stockActual ?? insumo.stock_actual}
    onChange={(e) => actualizarInsumoInicial(insumo.id_insumo, 'stockActual', Number(e.target.value))}
    disabled={guardando}
  />
</td>
<td>
  <input
    type="number"
    step="0.01"
    min="0"
    value={editado?.costoPromPonderado ?? insumo.costo_promedio_ponderado ?? 0}
    onChange={(e) => actualizarInsumoInicial(insumo.id_insumo, 'costoPromPonderado', Number(e.target.value))}
    disabled={guardando}
  />
</td>
```

### 4. SOLICITAR Button Functionality
**Requirement**: When pressing the SOLICITAR button, register edited records in `tblposcrumenwebdetallemovimientos` and `tblposcrumenwebmovimientos` with `estatusmovimiento='PENDIENTE'`.

**Implementation**: Updated `handleSubmit` to handle INV_INICIAL specially:
- Validates that at least one insumo has been edited
- Converts edited insumos to movement details
- Stores `stockActual` in the `cantidad` field
- Stores `costoPromPonderado` in the `costo` field
- Saves with `estatusmovimiento='PENDIENTE'`

```tsx
if (motivomovimiento === 'INV_INICIAL') {
  if (insumosEditados.size === 0) {
    alert('Debe editar al menos un insumo para guardar el inventario inicial');
    return;
  }
  
  const detallesInvInicial: DetalleMovimientoExtended[] = [];
  insumosEditados.forEach((valores, idInsumo) => {
    const insumo = insumos.find(i => i.id_insumo === idInsumo);
    if (insumo) {
      detallesInvInicial.push({
        idinsumo: insumo.id_insumo,
        nombreinsumo: insumo.nombre,
        tipoinsumo: 'INVENTARIO',
        cantidad: valores.stockActual,
        unidadmedida: insumo.unidad_medida,
        costo: valores.costoPromPonderado,
        precio: 0,
        observaciones: '',
        proveedor: String(insumo.idproveedor || ''),
        _rowId: crypto.randomUUID()
      });
    }
  });

  const movimientoData: MovimientoCreate = {
    tipomovimiento: 'ENTRADA',
    motivomovimiento,
    fechamovimiento: new Date().toISOString(),
    observaciones,
    estatusmovimiento: 'PENDIENTE',
    detalles: detallesInvInicial.map(({ _rowId, ...detalle }) => detalle)
  };

  await onGuardar(movimientoData);
}
```

### 5. APLICAR Button Functionality
**Requirement**: When pressing the APLICAR button, update:
- `tblposcrumenwebinsumos.stock_actual` = value from `INPUT.camposmovinvinicial.cantidad`
- `tblposcrumenwebinsumos.costo_promedio_ponderado` = value from `INPUT.camposmovinvinicial.costopromponderado`
- `tblposcrumenwebinsumos.usuarioauditoria` = alias of logged-in user
- `tblposcrumenwebinsumos.idnegocio` = idnegocio of logged-in user
- `tblposcrumenwebinsumos.fechamodificacionauditoria` = Date and time automatically on update
- `tblposcrumenwebmovimientos.estatusmovimiento` = 'PROCESADO'
- `tblposcrumenwebdetallemovimientos.estatusmovimiento` = 'PROCESADO'

**Implementation**: The backend already has the correct implementation in `aplicarMovimiento` function:

```typescript
// Backend: backend/src/controllers/movimientos.controller.ts
if (movimiento.motivomovimiento === 'AJUSTE_MANUAL' || movimiento.motivomovimiento === 'INV_INICIAL') {
  const [insumos] = await pool.query<RowDataPacket[]>(
    'SELECT id_insumo FROM tblposcrumenwebinsumos WHERE nombre = ? AND idnegocio = ?',
    [detalle.nombreinsumo, movimiento.idnegocio]
  );

  if (insumos.length === 0) {
    throw new Error(`Insumo no encontrado: ${detalle.nombreinsumo}`);
  }

  const insumoId = insumos[0].id_insumo;
  
  // Set absolute values (not relative)
  await pool.execute<ResultSetHeader>(
    `UPDATE tblposcrumenwebinsumos 
     SET stock_actual = ?,
         costo_promedio_ponderado = ?,
         idproveedor = ?,
         fechamodificacionauditoria = NOW(),
         usuarioauditoria = ?
     WHERE id_insumo = ? AND idnegocio = ?`,
    [
      detalle.cantidad,         // Absolute value for stock
      detalle.costo ?? 0,       // Absolute value for cost
      detalle.proveedor || null,
      usuarioAuditoria,         // User alias from JWT
      insumoId,
      movimiento.idnegocio     // From movement record
    ]
  );
}

// Update estatusmovimiento to PROCESADO
await pool.execute<ResultSetHeader>(
  'UPDATE tblposcrumenwebmovimientos SET estatusmovimiento = ?, fechaauditoria = NOW() WHERE idmovimiento = ?',
  ['PROCESADO', id]
);

await pool.execute<ResultSetHeader>(
  'UPDATE tblposcrumenwebdetallemovimientos SET estatusmovimiento = ?, fechaauditoria = NOW() WHERE idreferencia = ?',
  ['PROCESADO', refQuery]
);
```

## Files Modified

### Frontend
- `src/components/movimientos/FormularioMovimiento/FormularioMovimiento.tsx`
  - Added state for tracking edited insumos
  - Added `actualizarInsumoInicial` function
  - Updated `handleSubmit` to handle INV_INICIAL
  - Hidden "+Insumo" button for INV_INICIAL
  - Hidden table for INV_INICIAL
  - Made fields editable in initial inventory table
  - Added validation (min="0" for numeric inputs)
  - Fixed type safety for proveedor field

### Backend
- No changes required - `backend/src/controllers/movimientos.controller.ts` already has correct implementation

## Code Quality
- ✅ All TypeScript type checks pass
- ✅ All linting checks pass
- ✅ Code review completed and all issues addressed
- ✅ Security scan completed with 0 vulnerabilities
- ✅ Proper state management using React hooks
- ✅ Input validation to prevent negative values
- ✅ Type safety ensured for all fields

## Testing Scenarios

### Test Case 1: Create INV. INICIAL Movement
1. Navigate to Movimientos de Inventario
2. Click "Nuevo Movimiento"
3. Select "INV. INICIAL" from motivo dropdown
4. Verify "+Insumo" button is hidden
5. Verify the table with headers is hidden
6. Verify the "Inventario Inicial - Insumos Activos" table is displayed
7. Edit "Stock actual" and "Costo prom. ponderado" for at least one insumo
8. Click "SOLICITAR" button
9. Verify movement is saved with estatusmovimiento='PENDIENTE'

### Test Case 2: Apply INV. INICIAL Movement
1. Open a previously created INV. INICIAL movement (estatusmovimiento='PENDIENTE')
2. Click "APLICAR" button
3. Verify confirmation dialog appears
4. Confirm the action
5. Verify inventory is updated:
   - stock_actual is updated with the value from cantidad field
   - costo_promedio_ponderado is updated with the value from costo field
   - usuarioauditoria is set to the logged-in user's alias
   - fechamodificacionauditoria is set to current timestamp
6. Verify estatusmovimiento is changed to 'PROCESADO' for both movement and details

### Test Case 3: Validation
1. Try to save INV. INICIAL without editing any insumos
2. Verify validation message appears
3. Try to enter negative values in stock or cost fields
4. Verify browser validation prevents submission (min="0")

## User Experience Flow

```
1. User selects "INV. INICIAL" from dropdown
   ↓
2. Form hides "+Insumo" button and detail table
   ↓
3. Form displays editable table with all active insumos
   ↓
4. User edits stock and cost values
   ↓
5. User clicks "SOLICITAR"
   ↓
6. System validates at least one edit was made
   ↓
7. System saves movement with estatusmovimiento='PENDIENTE'
   ↓
8. User opens saved movement later
   ↓
9. User clicks "APLICAR"
   ↓
10. System confirms action
    ↓
11. System updates inventory and sets estatusmovimiento='PROCESADO'
```

## Security Considerations
- ✅ No SQL injection vulnerabilities (parameterized queries)
- ✅ No XSS vulnerabilities (React auto-escaping)
- ✅ Input validation prevents negative values
- ✅ User authentication required (JWT from AuthRequest)
- ✅ Audit trail maintained (usuarioauditoria, fechamodificacionauditoria)
- ✅ Business validation (idnegocio from movement record)

## Maintenance Notes
- The backend `aplicarMovimiento` function handles both AJUSTE_MANUAL and INV_INICIAL with the same logic
- Initial values for unedited fields come from the insumo record
- The Map state preserves original values until explicitly edited
- Type conversions are explicit to ensure data integrity
