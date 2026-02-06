# Test Plan: Inventory Movement on PRODUCIR Button

## Overview
This test plan validates the inventory movement functionality for INVENTARIO products when pressing the PRODUCIR button in PageVentas.

## Requirements Being Tested

1. **Set idreceta for INVENTARIO products**: When `tipoafectacion='INVENTARIO'`, set `tblposcrumenwebdetalleventas.idreceta = tblposcrumenwebproductos.idreferencia`

2. **Create inventory movements**: After insert/update, if product has:
   - `afectainventario=1`
   - `tipoafectacion='INVENTARIO'`
   - `inventarioprocesado=0`
   
   Then create movement records in `tblposcrumenwebdetallemovimientos` with:
   - `idinsumo = tblposcrumenwebdetalleventas.idreceta`
   - `nombreinsumo = tblposcrumenwebinsumos.nombre`
   - `tipoinsumo = 'INVENTARIO'`
   - `tipomovimiento = 'SALIDA'`
   - `motivomovimiento = 'VENTA'`
   - `cantidad = tblposcrumenwebdetalleventas.cantidad * -1`
   - `referenciastock = tblposcrumenwebinsumos.stock_actual`
   - `unidadmedida = tblposcrumenwebinsumos.unidad_medida`
   - `precio = tblposcrumenwebinsumos.precio_venta`
   - `costo = tblposcrumenwebinsumos.costo_promedio_ponderado`
   - `idreferencia = tblposcrumenwebdetalleventas.idventa`
   - `estatusmovimiento = 'PENDIENTE'`

3. **Update inventory stock**: After registering movement, if `estatusmovimiento='PENDIENTE'`, update:
   - `tblposcrumenwebinsumos.stock_actual = referenciastock + cantidad`
   - `tblposcrumenwebinsumos.usuarioauditoria = alias usuario`
   - `tblposcrumenwebinsumos.fechamodificacionauditoria = NOW()`

## Test Scenarios

### Scenario 1: Create Sale with INVENTARIO Product

**Prerequisites:**
- User is logged in
- An open turno exists
- A product with `tipoproducto='Inventario'` and `idreferencia` pointing to an insumo exists
- The insumo has stock available

**Test Steps:**
1. Navigate to PageVentas
2. Add an INVENTARIO product to the order (quantity: 2)
3. Click PRODUCIR button

**Expected Results:**
- ✅ Sale created successfully
- ✅ `tblposcrumenwebdetalleventas.idreceta` = product's `idreferencia`
- ✅ `tblposcrumenwebdetalleventas.tipoafectacion` = 'INVENTARIO'
- ✅ `tblposcrumenwebdetalleventas.afectainventario` = 1
- ✅ `tblposcrumenwebdetalleventas.inventarioprocesado` = 1
- ✅ Movement record created in `tblposcrumenwebdetallemovimientos`:
  - `tipoinsumo` = 'INVENTARIO'
  - `tipomovimiento` = 'SALIDA'
  - `motivomovimiento` = 'VENTA'
  - `cantidad` = -2 (negative value)
  - `estatusmovimiento` = 'PROCESADO' (after stock update)
- ✅ Stock updated in `tblposcrumenwebinsumos`:
  - `stock_actual` = original_stock - 2
  - `usuarioauditoria` = logged user's alias
  - `fechamodificacionauditoria` updated

**SQL Verification Queries:**
```sql
-- Check sale detail was created correctly
SELECT iddetalleventa, idreceta, tipoafectacion, afectainventario, inventarioprocesado
FROM tblposcrumenwebdetalleventas 
WHERE idventa = [CREATED_VENTA_ID];

-- Check movement record was created
SELECT idinsumo, nombreinsumo, tipoinsumo, tipomovimiento, motivomovimiento, 
       cantidad, referenciastock, estatusmovimiento
FROM tblposcrumenwebdetallemovimientos 
WHERE idreferencia = [CREATED_VENTA_ID];

-- Check stock was updated
SELECT stock_actual, usuarioauditoria, fechamodificacionauditoria
FROM tblposcrumenwebinsumos 
WHERE id_insumo = [INSUMO_ID];
```

### Scenario 2: Add INVENTARIO Product to Existing ESPERAR Sale

**Prerequisites:**
- User is logged in
- A sale with `estadodeventa='ESPERAR'` exists
- An INVENTARIO product with stock available

**Test Steps:**
1. Navigate to PageVentas with existing ESPERAR sale
2. Add an INVENTARIO product to the order (quantity: 1)
3. Click PRODUCIR button

**Expected Results:**
- ✅ New detail added to existing sale
- ✅ Sale status changed to 'ORDENADO'
- ✅ `idreceta` set correctly for the new INVENTARIO product
- ✅ Movement record created
- ✅ Stock updated correctly

### Scenario 3: Mixed Order (RECETA + INVENTARIO + DIRECTO)

**Prerequisites:**
- User is logged in
- Products of all three types available

**Test Steps:**
1. Add 1 RECETA product (uses multiple ingredients)
2. Add 2 INVENTARIO products
3. Add 1 DIRECTO product
4. Click PRODUCIR button

**Expected Results:**
- ✅ RECETA: Multiple movement records created (one per ingredient)
- ✅ INVENTARIO: Single movement record created per product
- ✅ DIRECTO: No movement records created
- ✅ All stocks updated correctly
- ✅ All details marked as `inventarioprocesado=1` except DIRECTO (should be -1)

### Scenario 4: Insufficient Stock Warning

**Prerequisites:**
- An INVENTARIO product with low stock (e.g., 1 unit)

**Test Steps:**
1. Add INVENTARIO product with quantity > available stock (e.g., 5 units)
2. Click PRODUCIR button

**Expected Results:**
- ✅ Sale created successfully (system allows negative stock with warning)
- ✅ Console log shows warning about negative stock
- ✅ Movement and stock update still processed
- ✅ Stock becomes negative

**Note:** The system logs a warning but allows the transaction to proceed, maintaining data consistency. Business logic should prevent this at a higher level.

## Manual Testing Instructions

### Setup Test Data

1. **Create Test Insumo:**
```sql
INSERT INTO tblposcrumenwebinsumos (
  nombre, stock_actual, unidad_medida, precio_venta, 
  costo_promedio_ponderado, idnegocio, usuarioauditoria
) VALUES (
  'Test Insumo for Inventory Movement', 100, 'unidad', 50.00, 
  30.00, [YOUR_IDNEGOCIO], 'test_user'
);
-- Note the id_insumo generated
```

2. **Create Test Product:**
```sql
INSERT INTO tblposcrumenwebproductos (
  nombre, tipoproducto, idreferencia, precio, costoproducto,
  idCategoria, idnegocio, usuarioauditoria
) VALUES (
  'Test Inventory Product', 'Inventario', [INSUMO_ID_FROM_STEP_1], 75.00, 30.00,
  [YOUR_CATEGORY_ID], [YOUR_IDNEGOCIO], 'test_user'
);
```

### Execute Test

1. Login to the application
2. Ensure a turno is open
3. Navigate to PageVentas
4. Add the test INVENTARIO product (quantity: 3)
5. Click PRODUCIR button
6. Verify sale was created

### Verify Results

```sql
-- 1. Check sale details
SELECT * FROM tblposcrumenwebdetalleventas 
WHERE idventa = [LAST_CREATED_VENTA_ID]
ORDER BY iddetalleventa DESC;

-- 2. Check movements
SELECT * FROM tblposcrumenwebdetallemovimientos 
WHERE idreferencia = [LAST_CREATED_VENTA_ID]
ORDER BY iddetallemovimiento DESC;

-- 3. Verify stock was reduced
SELECT stock_actual, usuarioauditoria, fechamodificacionauditoria
FROM tblposcrumenwebinsumos 
WHERE id_insumo = [INSUMO_ID_FROM_STEP_1];
-- Should show: stock_actual = 97 (100 - 3)
```

## Regression Testing

### Existing Functionality to Verify

1. **RECETA products still work correctly:**
   - Movement records created for each ingredient
   - Stock updated for all ingredients
   - No regression in recipe processing

2. **DIRECTO products unchanged:**
   - No movement records created
   - `inventarioprocesado=-1`
   - `afectainventario=-1`

3. **ESPERAR button still works:**
   - Products with `estadodetalle='ESPERAR'` have `afectainventario=-1`
   - No inventory processing until PRODUCIR is pressed

4. **Transaction rollback works:**
   - If any error occurs, entire transaction rolls back
   - No orphaned movement records
   - Stock remains unchanged on error

## Success Criteria

✅ All test scenarios pass
✅ No security vulnerabilities detected (CodeQL scan passed)
✅ Frontend builds successfully
✅ Backend compiles without errors
✅ No breaking changes to existing functionality
✅ Code review feedback addressed
✅ Database integrity maintained with proper transactions

## Notes

- The implementation uses consistent negative quantities for SALIDA movements
- Transaction consistency is maintained with automatic rollback on errors
- Audit fields (usuarioauditoria, fechamodificacionauditoria) are populated correctly
- The system allows negative stock with warnings for business flexibility
