# Visual Guide: Última Compra Button Implementation

## Overview
Implementation of clickable buttons in the "PROV. ÚLT." and "COSTO ÚLT." columns of the FormularioMovimiento component.

## Changes Made

### 1. COSTO Column (Column 3)
**Before:** Showed a button when última compra data existed, otherwise showed an input.
**After:** Always shows an editable input field for the cost.

```tsx
<td>
  <input
    type="number"
    step="0.01"
    value={detalle.costo || 0}
    onChange={(e) => actualizarDetalle(index, 'costo', Number(e.target.value))}
    disabled={guardando}
  />
</td>
```

### 2. PROVEEDOR Column (Column 4)
**Before:** Showed a button when última compra data existed, otherwise showed a select.
**After:** Always shows an editable select dropdown for the supplier.

```tsx
<td>
  <select
    value={detalle.proveedor || ''}
    onChange={(e) => actualizarDetalle(index, 'proveedor', e.target.value)}
    disabled={guardando || cargandoProveedores}
  >
    <option value="">Seleccione...</option>
    {proveedores.map((proveedor) => (
      <option key={proveedor.id_proveedor} value={proveedor.nombre}>
        {proveedor.nombre}
      </option>
    ))}
  </select>
</td>
```

### 3. PROV. ÚLT. Column (Column 9) - NEW BUTTON
**Before:** Always showed a read-only input field displaying the última compra supplier.
**After:** Shows a clickable button when supplier última compra data exists.

```tsx
<td>
  {ultimaCompra?.proveedorUltimaCompra ? (
    <button
      type="button"
      className="btn-ultima-compra"
      onClick={() => {
        if (ultimaCompra.proveedorUltimaCompra) {
          actualizarDetalle(index, 'proveedor', ultimaCompra.proveedorUltimaCompra);
        }
      }}
      disabled={guardando}
      title={`Usar proveedor última compra: ${ultimaCompra.proveedorUltimaCompra}`}
    >
      {ultimaCompra.proveedorUltimaCompra}
    </button>
  ) : (
    <input 
      type="text" 
      value="" 
      disabled 
      className="campo-solo-lectura" 
    />
  )}
</td>
```

**Behavior:** 
- When clicked, assigns the `proveedorUltimaCompra` value to the editable PROVEEDOR field
- Shows the supplier name on the button
- Has a green styling matching the existing `btn-ultima-compra` class

### 4. COSTO ÚLT. Column (Column 10) - NEW BUTTON
**Before:** Always showed a read-only input field displaying the última compra cost.
**After:** Shows a clickable button when cost última compra data exists.

```tsx
<td>
  {ultimaCompra?.costoUltimaCompra ? (
    <button
      type="button"
      className="btn-ultima-compra"
      onClick={() => {
        if (ultimaCompra.costoUltimaCompra !== undefined) {
          actualizarDetalle(index, 'costo', ultimaCompra.costoUltimaCompra);
        }
      }}
      disabled={guardando}
      title={`Usar costo última compra: ${ultimaCompra.costoUltimaCompra}`}
    >
      ${ultimaCompra.costoUltimaCompra}
    </button>
  ) : (
    <input 
      type="text" 
      value="" 
      disabled 
      className="campo-solo-lectura" 
    />
  )}
</td>
```

**Behavior:**
- When clicked, assigns the `costoUltimaCompra` value to the editable COSTO field
- Shows the cost with a $ prefix on the button
- Has a green styling matching the existing `btn-ultima-compra` class

## User Experience

### Workflow:
1. User selects an INSUMO from the dropdown
2. System fetches última compra data for that insumo
3. If última compra data exists:
   - **PROV. ÚLT.** column shows a green clickable button with the supplier name
   - **COSTO ÚLT.** column shows a green clickable button with the cost
4. User can click these buttons to quickly populate the editable PROVEEDOR and COSTO fields
5. User can still manually edit PROVEEDOR and COSTO fields at any time

### Visual State:
- **With última compra data:** Green buttons in PROV. ÚLT. and COSTO ÚLT. columns
- **Without última compra data:** Gray disabled input fields in PROV. ÚLT. and COSTO ÚLT. columns

## CSS Classes Used
- `.btn-ultima-compra`: Existing green button styling with hover effects
- `.campo-solo-lectura`: Existing gray disabled input styling

## Files Modified
- `/src/components/movimientos/FormularioMovimiento/FormularioMovimiento.tsx`

## Testing Recommendations
1. Select an insumo that has última compra data
2. Verify PROV. ÚLT. column shows a green button (if supplier exists)
3. Verify COSTO ÚLT. column shows a green button (if cost exists)
4. Click the PROV. ÚLT. button and verify it populates the PROVEEDOR select
5. Click the COSTO ÚLT. button and verify it populates the COSTO input
6. Select an insumo without última compra data
7. Verify both columns show gray disabled inputs
8. Verify manual editing of PROVEEDOR and COSTO fields still works normally
