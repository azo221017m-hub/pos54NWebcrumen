# Testing Plan: PRODUCIR Button - Update ESPERAR Items

## Overview
This document provides manual testing steps to verify that when the PRODUCIR button is pressed in PageVentas, existing products with estadodetalle='ESPERAR' are updated (quantity and subtotal) instead of creating duplicate records, and their estadodetalle is changed to 'ORDENADO'.

## Test Scenarios

### Scenario 1: Update Existing ESPERAR Items with Same Product
**Objective**: Verify that adding the same product again updates the existing ESPERAR record instead of creating a duplicate.

**Prerequisites**:
1. Have an active turno (shift) open
2. Have at least one product configured in the system
3. Be logged in as a valid user

**Steps**:
1. Navigate to PageVentas
2. Configure service type (Mesa, Llevar, or Domicilio)
3. Add a product to comanda (e.g., "Café" with quantity 2)
4. Click "Esperar" button
5. Verify success message appears
6. Stay on PageVentas (DO NOT navigate away)
7. Add the SAME product again with quantity 3
8. Click "Producir" button
9. Verify success message appears

**Expected Results**:
- In database `tblposcrumenwebdetalleventas`:
  - Only ONE record exists for "Café" with the folioventa
  - `cantidad` = 5 (2 + 3)
  - `subtotal` = precio * 5
  - `estadodetalle` = 'ORDENADO'
  - No duplicate records for the same product

**SQL Verification Query**:
```sql
SELECT iddetalleventa, idproducto, nombreproducto, cantidad, subtotal, estadodetalle
FROM tblposcrumenwebdetalleventas
WHERE idventa = {ID_FROM_TEST}
ORDER BY iddetalleventa;
```

### Scenario 2: Update with Different Moderadores
**Objective**: Verify that the same product with different moderadores creates separate records.

**Steps**:
1. Navigate to PageVentas
2. Configure service type
3. Add product "Hamburguesa" with moderadores "SIN CEBOLLA"
4. Click "Esperar"
5. Stay on PageVentas
6. Add same product "Hamburguesa" with moderadores "SIN CEBOLLA" again (quantity 1)
7. Click "Producir"
8. Verify ONE record exists with moderadores "SIN CEBOLLA"
9. Add product "Hamburguesa" with moderadores "SIN TOMATE"
10. Click "Producir" (if still on ESPERAR state) or create new venta

**Expected Results**:
- TWO separate records for "Hamburguesa":
  - One with moderadores "SIN CEBOLLA"
  - One with moderadores "SIN TOMATE"
- Each has correct individual quantities

### Scenario 3: Update with Different Observaciones
**Objective**: Verify that the same product with different notes/observations creates separate records.

**Steps**:
1. Navigate to PageVentas
2. Configure service type
3. Add product "Pizza" with nota "Para llevar caliente"
4. Click "Esperar"
5. Stay on PageVentas
6. Add same product "Pizza" with the SAME nota
7. Click "Producir"
8. Verify only ONE record exists

**Expected Results**:
- Only ONE record for "Pizza" with observaciones "Para llevar caliente"
- Quantity is summed correctly

### Scenario 4: Update with Different Comensal (Seat Assignment)
**Objective**: Verify that products for different comensales are kept separate.

**Prerequisites**: Using Mesa service type

**Steps**:
1. Navigate to PageVentas
2. Configure Mesa service
3. Add product "Refresco" for comensal "A1"
4. Click "Esperar"
5. Stay on PageVentas
6. Add same product "Refresco" for comensal "A1"
7. Click "Producir"
8. Verify only ONE record exists for comensal "A1"
9. Add product "Refresco" for comensal "A2"
10. Verify TWO separate records exist (one for A1, one for A2)

**Expected Results**:
- Separate records per comensal
- Correct quantities per comensal

### Scenario 5: Mixed New and Existing Items
**Objective**: Verify that new products are inserted while existing ones are updated.

**Steps**:
1. Navigate to PageVentas
2. Configure service type
3. Add products:
   - "Café" quantity 2
   - "Pan" quantity 1
4. Click "Esperar"
5. Stay on PageVentas
6. Add products:
   - "Café" quantity 1 (same as before - should UPDATE)
   - "Jugo" quantity 2 (new product - should INSERT)
7. Click "Producir"

**Expected Results**:
- THREE total records:
  - "Café": cantidad = 3 (2 + 1), estadodetalle = 'ORDENADO'
  - "Pan": cantidad = 1, estadodetalle = 'ORDENADO'
  - "Jugo": cantidad = 2, estadodetalle = 'ORDENADO'

### Scenario 6: Venta Totals Recalculation
**Objective**: Verify that venta subtotal and totaldeventa are correctly updated.

**Steps**:
1. Navigate to PageVentas
2. Configure service type
3. Add product "Café" (price 25.00) quantity 2
4. Click "Esperar"
5. Note the subtotal (should be 50.00)
6. Stay on PageVentas
7. Add "Café" quantity 3
8. Click "Producir"

**Expected Results in `tblposcrumenwebventas`**:
- `subtotal` = 125.00 (25 * 5)
- `totaldeventa` = 125.00 (no descuentos/impuestos)

**SQL Verification**:
```sql
SELECT subtotal, descuentos, impuestos, totaldeventa
FROM tblposcrumenwebventas
WHERE idventa = {ID_FROM_TEST};
```

### Scenario 7: Estado Changes
**Objective**: Verify that estadodeventa and estatusdepago are correctly updated.

**Steps**:
1. Create venta with ESPERAR status
2. Click "Producir"

**Expected Results in `tblposcrumenwebventas`**:
- `estadodeventa` changes from 'ESPERAR' to 'ORDENADO'
- `estatusdepago` changes from 'ESPERAR' to 'PENDIENTE'

### Scenario 8: Inventory Flags Update
**Objective**: Verify that afectainventario and inventarioprocesado flags are updated correctly.

**Steps**:
1. Add product with tipoproducto = 'Receta' 
2. Click "Esperar"
3. Verify in DB: afectainventario = -1, inventarioprocesado = -1
4. Click "Producir"
5. Verify in DB: afectainventario = 1, inventarioprocesado = 0

**Expected Results**:
For ESPERAR items:
- `afectainventario` = -1
- `inventarioprocesado` = -1

After PRODUCIR:
- `afectainventario` = 1 (for Receta/Inventario)
- `inventarioprocesado` = 0

## Matching Logic

The backend identifies matching items using a composite key:
- `idproducto` (product ID)
- `moderadores` (comma-separated moderator IDs or null)
- `observaciones` (notes or null)
- `comensal` (seat assignment or null)

If ALL four fields match, the item is UPDATED. Otherwise, a new record is INSERTED.

## Database Tables

### tblposcrumenwebdetalleventas
Key fields to verify:
- `iddetalleventa` - Primary key
- `idventa` - Foreign key to venta
- `idproducto` - Product ID
- `cantidad` - Quantity (should be sum of old + new)
- `subtotal` - Recalculated (cantidad * preciounitario)
- `total` - Recalculated (subtotal - descuento + impuesto)
- `estadodetalle` - Changed from 'ESPERAR' to 'ORDENADO'
- `moderadores` - Part of matching key
- `observaciones` - Part of matching key
- `comensal` - Part of matching key
- `afectainventario` - Updated based on tipoproducto
- `inventarioprocesado` - Updated based on estado

### tblposcrumenwebventas
Key fields to verify:
- `idventa` - Primary key
- `subtotal` - Sum of all detalle subtotals
- `totaldeventa` - subtotal - descuentos + impuestos
- `estadodeventa` - Changed from 'ESPERAR' to 'ORDENADO'
- `estatusdepago` - Changed from 'ESPERAR' to 'PENDIENTE'

## Regression Testing

Verify that existing functionality still works:

1. **Normal PRODUCIR flow** (without ESPERAR):
   - Add products
   - Click PRODUCIR directly
   - Verify new venta is created with ORDENADO status

2. **ESPERAR flow**:
   - Add products
   - Click ESPERAR
   - Verify venta is created with ESPERAR status

3. **Adding to existing ORDENADO venta**:
   - Create venta with PRODUCIR
   - Add more products
   - Click PRODUCIR again
   - Verify products are added (not updated)

## Test Data Cleanup

After testing, clean up test data:

```sql
-- Find test ventas
SELECT idventa, folioventa, estadodeventa, cliente
FROM tblposcrumenwebventas
WHERE usuarioauditoria = '{your_test_user}'
ORDER BY fechadeventa DESC
LIMIT 10;

-- Delete test data (if needed)
DELETE FROM tblposcrumenwebdetalleventas WHERE idventa = {test_venta_id};
DELETE FROM tblposcrumenwebventas WHERE idventa = {test_venta_id};
```

## Success Criteria

All test scenarios pass with:
- ✅ No duplicate records for matching products
- ✅ Quantities correctly summed
- ✅ Subtotals correctly calculated
- ✅ Venta totals correctly updated
- ✅ Estados correctly changed to ORDENADO/PENDIENTE
- ✅ Inventory flags correctly updated
- ✅ Separate records for different moderadores/observaciones/comensales
- ✅ No regression in existing functionality
