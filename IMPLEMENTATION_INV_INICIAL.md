# Implementation: INV_INICIAL (Initial Inventory) Support

## Summary
This implementation adds support for the "INV. INICIAL" (Initial Inventory) movement type in the inventory management system. When users create a new inventory movement with the INV_INICIAL motive, they can now see a reference table of all active insumos with their current stock, cost, and provider information.

## Features Implemented

### 1. Initial Inventory Reference Table
When a user selects `motivomovimiento = 'INV. INICIAL'` in the FormularioMovimiento component:
- A new section appears showing "Inventario Inicial - Insumos Activos"
- Displays a compact spreadsheet-style table with all active insumos
- Filters insumos by:
  - `activo = 1` (only active items)
  - `idnegocio = user's idnegocio` (only items from user's business)

### 2. Table Columns
The initial inventory table displays four key columns:
- **NOMBRE**: Name of the insumo
- **STOCK ACTUAL**: Current stock quantity
- **COSTO PROM. PONDERADO**: Weighted average cost
- **PROVEEDOR**: Provider name (shows 'N/A' if not set)

### 3. Backend Support for INV_INICIAL
Updated the `aplicarMovimiento` function in the backend to handle INV_INICIAL movements:
- Treats INV_INICIAL the same as AJUSTE_MANUAL
- Applies absolute values instead of relative changes:
  - `stock_actual = cantidad` (not `stock_actual + cantidad`)
  - `costo_promedio_ponderado = costo` (absolute value)
  - `idproveedor = proveedor` (update provider)
- Updates audit fields:
  - `usuarioauditoria = user's alias`
  - `fechamodificacionauditoria = NOW()`
- Sets `estatusmovimiento = 'PROCESADO'` for both movimientos and detalles

## Technical Implementation

### Frontend Changes

#### FormularioMovimiento.tsx
1. Added memoized calculation for active insumos:
```typescript
const insumosActivos = useMemo(() => {
  return insumos.filter(insumo => insumo.activo === 1);
}, [insumos]);
```

2. Added conditional rendering for initial inventory table:
```tsx
{motivomovimiento === 'INV_INICIAL' && !isEditMode && (
  <div className="inventario-inicial-section">
    <h3>Inventario Inicial - Insumos Activos</h3>
    {/* Table rendering */}
  </div>
)}
```

3. The table only appears when:
   - `motivomovimiento = 'INV_INICIAL'`
   - `!isEditMode` (only when creating new movements, not editing)

#### FormularioMovimiento.css
Added new CSS classes for the initial inventory section:
- `.inventario-inicial-section`: Container with blue theme
- `.tabla-inventario-inicial-container`: Scrollable table wrapper
- `.tabla-inventario-inicial`: Compact table with spreadsheet-like styling
- Compact padding (0.3rem) and line-height (1.2) for tight rows
- Blue accent colors (#2196F3, #1976D2, #e3f2fd)

### Backend Changes

#### movimientos.controller.ts
Updated the `aplicarMovimiento` function:
```typescript
// Special handling for AJUSTE_MANUAL and INV_INICIAL
if (movimiento.motivomovimiento === 'AJUSTE_MANUAL' || 
    movimiento.motivomovimiento === 'INV_INICIAL') {
  // Set absolute values
  await pool.execute(
    `UPDATE tblposcrumenwebinsumos 
     SET stock_actual = ?,
         costo_promedio_ponderado = ?,
         idproveedor = ?,
         fechamodificacionauditoria = NOW(),
         usuarioauditoria = ?
     WHERE id_insumo = ? AND idnegocio = ?`,
    [detalle.cantidad, detalle.costo ?? 0, detalle.proveedor || null,
     usuarioAuditoria, insumoId, movimiento.idnegocio]
  );
}
```

## User Workflow

### Creating an INV_INICIAL Movement

1. **Navigate to Movimientos de Inventario**
   - Click "Nuevo Movimiento" button

2. **Select INV. INICIAL**
   - In the "motivo de Movimiento" dropdown, select "INV. INICIAL"
   - The "Inventario Inicial - Insumos Activos" table appears below

3. **Review Current Inventory**
   - View all active insumos with their current values
   - Reference this information when adding movement details

4. **Add Movement Details**
   - Click "+ INSUMO" to add items to the movement
   - Select each insumo, enter new quantity and cost
   - Add any observations

5. **Press SOLICITAR**
   - Creates the movement with status 'PENDIENTE'
   - Movement is saved with all details

6. **Press APLICAR**
   - Opens the movement in edit mode
   - Click "APLICAR" button to process the movement
   - Updates inventory with absolute values (not relative)
   - Sets status to 'PROCESADO'

## Database Fields Updated

### When Creating Movement (SOLICITAR)
**tblposcrumenwebmovimientos:**
- `tipomovimiento = 'ENTRADA'` (INV_INICIAL is treated as entry)
- `motivomovimiento = 'INV_INICIAL'`
- `idreferencia = folio_generado`
- `fechamovimiento = NOW()`
- `observaciones = valor INPUT`
- `usuarioauditoria = user alias`
- `idnegocio = user's idnegocio`
- `estatusmovimiento = 'PENDIENTE'`
- `fecharegistro = NOW()`
- `fechaauditoria = NOW()`

**tblposcrumenwebdetallemovimientos:**
- `nombreinsumo = valor INPUT.insumo`
- `tipoinsumo = 'INVENTARIO'`
- `tipomovimiento = 'ENTRADA'`
- `motivomovimiento = 'INV_INICIAL'`
- `cantidad = valor INPUT.cantidad`
- `referenciastock = insumo.stock_actual` (before update)
- `costo = valor INPUT.costo`
- `idreferencia = folio_generado`
- `fechamovimiento = NOW()`
- `observaciones = valor INPUT.observaciones`
- `usuarioauditoria = user alias`
- `idnegocio = user's idnegocio`
- `estatusmovimiento = 'PENDIENTE'`
- `fecharegistro = NOW()`
- `fechaauditoria = NOW()`
- `proveedor = valor INPUT.proveedor`

### When Applying Movement (APLICAR)
**tblposcrumenwebinsumos:**
- `stock_actual = valor INPUT.cantidad` (absolute value)
- `costo_promedio_ponderado = valor INPUT.costo` (absolute value)
- `idproveedor = valor INPUT.proveedor`
- `usuarioauditoria = user alias`
- `fechamodificacionauditoria = NOW()`

**tblposcrumenwebmovimientos & tblposcrumenwebdetallemovimientos:**
- `estatusmovimiento = 'PROCESADO'`
- `fechaauditoria = NOW()`

## Code Quality

### Optimizations Applied
1. **Memoized Active Insumos**: Used `useMemo` to filter active insumos only once
2. **Conditional Rendering**: Table only renders when necessary
3. **Performance**: Avoided redundant array iterations

### Security
- ✅ CodeQL analysis passed with 0 alerts
- ✅ User authentication required (idnegocio from logged-in user)
- ✅ Business isolation (only shows insumos from user's business)
- ✅ Input validation (quantity and insumo selection required)
- ✅ Audit trail (tracks user and timestamp for all changes)

### Code Review Feedback
- ✅ Addressed redundant filtering with memoization
- ✅ Provider field displays name (stored in `idproveedor` field)
- ✅ Added comments for clarity

## Testing Checklist

- [ ] Create a new movement with motivomovimiento = 'INV. INICIAL'
- [ ] Verify the initial inventory table appears
- [ ] Verify table shows only active insumos (activo = 1)
- [ ] Verify table filters by user's idnegocio
- [ ] Verify columns display correct data
- [ ] Add insumos to the movement
- [ ] Press SOLICITAR and verify movement is created
- [ ] Verify movement has status 'PENDIENTE'
- [ ] Open the movement for editing
- [ ] Press APLICAR
- [ ] Verify inventory is updated with absolute values
- [ ] Verify status changes to 'PROCESADO'
- [ ] Verify audit fields are updated correctly

## Browser Compatibility
- Modern browsers with ES6+ support
- Responsive design works on desktop and tablet devices
- CSS Grid and Flexbox for layout

## Known Limitations
- The initial inventory table is read-only (reference only)
- Table only appears when creating new movements, not when editing
- Compact styling may be difficult to read on very small screens

## Future Enhancements
- Add search/filter functionality to the initial inventory table
- Add sorting options (by name, stock, cost, etc.)
- Highlight insumos with low stock or no stock
- Export initial inventory table to Excel/PDF
- Add column for "Difference" showing suggested adjustment

## Related Files
- `/src/components/movimientos/FormularioMovimiento/FormularioMovimiento.tsx`
- `/src/components/movimientos/FormularioMovimiento/FormularioMovimiento.css`
- `/backend/src/controllers/movimientos.controller.ts`
- `/src/types/movimientos.types.ts`
- `/src/types/insumo.types.ts`
