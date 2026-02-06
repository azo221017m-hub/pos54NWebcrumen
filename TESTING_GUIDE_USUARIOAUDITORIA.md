# Testing Guide: usuarioauditoria VARCHAR(100) Implementation

## Overview
This guide provides step-by-step instructions for testing the inventory movement implementation with user alias tracking.

## Prerequisites
- Database backup completed
- Backend server running
- Valid user credentials for testing
- Access to database for verification queries

## Test Scenarios

### Test 1: Database Migration
**Objective**: Verify database schema changes

1. **Backup Database**:
   ```bash
   mysqldump -u [username] -p [database] > backup_before_migration.sql
   ```

2. **Run Migration**:
   ```bash
   mysql -u [username] -p [database] < backend/src/scripts/alter_usuarioauditoria_to_varchar.sql
   ```

3. **Verify Schema**:
   ```sql
   SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
   FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_NAME = 'tblposcrumenwebdetallemovimientos'
     AND COLUMN_NAME = 'usuarioauditoria';
   ```
   
   **Expected Result**: DATA_TYPE = 'varchar', CHARACTER_MAXIMUM_LENGTH = 100

### Test 2: Create Sale with Recipe-Based Product
**Objective**: Verify movement creation with user alias

#### Steps:
1. Login as a user (note the user's alias)
2. In PageVentas, select a product with:
   - `afectainventario = 1`
   - `tipoafectacion = 'RECETA'`
   - Has a recipe configured (`idreceta` is set)
3. Add the product to cart
4. Press "PRODUCIR" button
5. Complete the sale

#### Verification:
```sql
-- Check movement was created with user alias
SELECT 
    iddetallemovimiento,
    idinsumo,
    nombreinsumo,
    cantidad,
    usuarioauditoria,
    estatusmovimiento,
    fechamovimiento
FROM tblposcrumenwebdetallemovimientos
WHERE idreferencia = [sale_id]
ORDER BY fechamovimiento DESC;
```

**Expected Results**:
- ✅ Records exist for each recipe ingredient
- ✅ `usuarioauditoria` contains user alias (string), not user ID (number)
- ✅ `cantidad` values are negative
- ✅ `estatusmovimiento` = 'PROCESADO' (not PENDIENTE)

### Test 3: Verify Inventory Stock Update
**Objective**: Confirm inventory stock was updated correctly

#### Steps:
1. Before creating sale, record current stock:
   ```sql
   SELECT id_insumo, nombreinsumo, stock_actual 
   FROM tblposcrumenwebinsumos 
   WHERE id_insumo IN ([ingredient_ids]);
   ```

2. Create sale (as in Test 2)

3. After sale, verify stock update:
   ```sql
   SELECT 
       id_insumo,
       nombreinsumo,
       stock_actual,
       usuarioauditoria,
       fechamodificacionauditoria
   FROM tblposcrumenwebinsumos 
   WHERE id_insumo IN ([ingredient_ids]);
   ```

**Expected Results**:
- ✅ `stock_actual` decreased by recipe quantity
- ✅ `usuarioauditoria` contains user alias
- ✅ `fechamodificacionauditoria` is recent timestamp

#### Calculation Verification:
```
new_stock = old_stock + cantidad (where cantidad is negative)
Example: old_stock = 100, cantidad = -10
         new_stock = 100 + (-10) = 90 ✅
```

### Test 4: Multiple Products in Same Sale
**Objective**: Verify multiple recipe items process correctly

#### Steps:
1. Add multiple recipe-based products to cart
2. Press "PRODUCIR"
3. Complete sale

#### Verification:
```sql
-- Count movements for this sale
SELECT 
    COUNT(*) as movement_count,
    COUNT(DISTINCT idinsumo) as unique_ingredients
FROM tblposcrumenwebdetallemovimientos
WHERE idreferencia = [sale_id];
```

**Expected Results**:
- ✅ Movement records for all recipe ingredients
- ✅ All movements marked as PROCESADO
- ✅ All inventory stocks updated

### Test 5: Negative Stock Warning
**Objective**: Verify warning is logged when stock becomes negative

#### Steps:
1. Find an ingredient with low stock (e.g., stock_actual = 5)
2. Create sale that requires more than available (e.g., recipe needs 10)
3. Check backend logs

**Expected Results**:
- ✅ Sale completes successfully
- ✅ Warning logged: "Warning: Inventory for insumo [id] would become negative"
- ✅ Stock becomes negative (e.g., -5)
- ✅ Movement marked as PROCESADO

### Test 6: Transaction Rollback
**Objective**: Verify rollback on error

#### Steps:
1. Temporarily break database connection or create invalid data
2. Attempt to create sale
3. Verify no partial data

**Expected Results**:
- ✅ Error returned to client
- ✅ No movement records created
- ✅ No inventory stock changes
- ✅ No sale details marked as inventarioprocesado=1

### Test 7: Different User Aliases
**Objective**: Verify different users have their aliases recorded

#### Steps:
1. Login as User A (alias: "userA")
2. Create sale with recipe product
3. Logout and login as User B (alias: "userB")
4. Create another sale with recipe product
5. Check movements

#### Verification:
```sql
SELECT 
    iddetallemovimiento,
    usuarioauditoria,
    fechamovimiento
FROM tblposcrumenwebdetallemovimientos
WHERE idreferencia IN ([sale1_id], [sale2_id])
ORDER BY fechamovimiento;
```

**Expected Results**:
- ✅ First sale movements have usuarioauditoria = "userA"
- ✅ Second sale movements have usuarioauditoria = "userB"

### Test 8: Update Existing Sale (agregarDetallesAVenta)
**Objective**: Verify adding details to existing sale

#### Steps:
1. Create a sale
2. Add more recipe products to the same sale
3. Verify movements and stock updates

**Expected Results**:
- ✅ New movements created for added products
- ✅ New movements marked as PROCESADO
- ✅ Inventory updated correctly

## Performance Testing

### Test 9: Multiple Concurrent Sales
**Objective**: Verify transaction isolation

#### Steps:
1. Simulate multiple users creating sales simultaneously
2. Verify stock calculations are correct

**Expected Results**:
- ✅ No race conditions
- ✅ Stock calculations accurate
- ✅ No lost updates

## Regression Testing

### Test 10: Non-Recipe Products
**Objective**: Verify non-recipe products still work

#### Steps:
1. Create sale with product where:
   - `afectainventario = 0` OR
   - `tipoafectacion != 'RECETA'`
2. Verify no movements created

**Expected Results**:
- ✅ Sale completes successfully
- ✅ No movements created
- ✅ No inventory changes

### Test 11: Already Processed Items
**Objective**: Verify inventarioprocesado flag prevents duplicate processing

#### Steps:
1. Create sale
2. Verify `inventarioprocesado = 1` for processed items
3. Attempt to process same sale again (if possible)

**Expected Results**:
- ✅ Items not processed twice
- ✅ No duplicate movements

## Database Verification Queries

### Check All Recent Movements
```sql
SELECT 
    m.iddetallemovimiento,
    m.idinsumo,
    m.nombreinsumo,
    m.cantidad,
    m.referenciastock,
    m.usuarioauditoria,
    m.estatusmovimiento,
    m.fechamovimiento,
    i.stock_actual as current_stock
FROM tblposcrumenwebdetallemovimientos m
LEFT JOIN tblposcrumenwebinsumos i ON m.idinsumo = i.id_insumo
WHERE m.fechamovimiento >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY m.fechamovimiento DESC;
```

### Check Inventory Audit Trail
```sql
SELECT 
    id_insumo,
    nombreinsumo,
    stock_actual,
    usuarioauditoria,
    fechamodificacionauditoria
FROM tblposcrumenwebinsumos
WHERE fechamodificacionauditoria >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY fechamodificacionauditoria DESC;
```

### Check for PENDIENTE Movements (Should be 0)
```sql
SELECT COUNT(*) as pending_movements
FROM tblposcrumenwebdetallemovimientos
WHERE estatusmovimiento = 'PENDIENTE';
```

## Troubleshooting

### Issue: Movements Not Created
**Check**:
1. Product has `afectainventario = 1`
2. Product has `tipoafectacion = 'RECETA'`
3. Product has valid `idreceta`
4. Recipe has ingredients defined

### Issue: Stock Not Updated
**Check**:
1. Movements exist with PROCESADO status
2. Check backend logs for errors
3. Verify database transaction didn't rollback

### Issue: Wrong User Alias
**Check**:
1. JWT token is valid
2. User has alias set in database
3. Check `req.user?.alias` in backend logs

## Success Criteria

All tests pass with these results:
- ✅ Database schema correctly updated
- ✅ User aliases stored in movements and inventory updates
- ✅ Quantities are negative for SALIDA movements
- ✅ Inventory stock updated correctly
- ✅ Movement status changes from PENDIENTE to PROCESADO
- ✅ Transaction safety maintained
- ✅ No security vulnerabilities
- ✅ Performance acceptable

## Rollback Plan

If critical issues found:
1. Stop backend server
2. Restore database from backup:
   ```bash
   mysql -u [username] -p [database] < backup_before_migration.sql
   ```
3. Revert code changes
4. Investigate issues before re-deployment
