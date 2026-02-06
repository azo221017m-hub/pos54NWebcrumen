# Implementation Summary: Update usuarioauditoria Data Type and Inventory Movement Logic

## Overview
This implementation updates the inventory movement system to use user aliases instead of user IDs and automatically update inventory stock after registering movements.

## Changes Made

### 1. Database Schema Changes
**File**: `backend/src/scripts/alter_usuarioauditoria_to_varchar.sql`

- Modified `tblposcrumenwebdetallemovimientos.usuarioauditoria` from `BIGINT(20)` to `VARCHAR(100)`
- Modified `tblposcrumenwebinsumos.usuarioauditoria` from `BIGINT(20)` to `VARCHAR(100)` (if needed)
- This allows storing user aliases (e.g., "john_doe") instead of numeric IDs

### 2. TypeScript Type Updates
**File**: `backend/src/types/movimientos.types.ts`

Updated type definitions to reflect the schema change:
- `DetalleMovimiento.usuarioauditoria`: Changed from `number` to `string`
- `DetalleMovimientoCreate.usuarioauditoria`: Changed from `number` to `string`

### 3. Controller Logic Updates
**File**: `backend/src/controllers/ventasWeb.controller.ts`

#### Modified `processRecipeInventoryMovements` function:
- **Parameter change**: `usuarioauditoria: number` → `usuarioalias: string`
- **Cantidad conversion**: Now converts quantity to negative value for SALIDA movements
  ```typescript
  const cantidadNegativa = -Math.abs(cantidadTotal);
  ```
- **User alias storage**: Now stores user alias instead of user ID in `usuarioauditoria` field

#### Added new `updateInventoryStockFromMovements` function:
This function handles the inventory stock updates after movements are registered:
- Retrieves all PENDIENTE movements for a given sale
- For each movement:
  - Retrieves current stock_actual from tblposcrumenwebinsumos (not using snapshot)
  - Calculates new stock: `current_stock + cantidad` (cantidad is already negative)
  - Updates `tblposcrumenwebinsumos`:
    - `stock_actual` = calculated new stock
    - `usuarioauditoria` = user alias
    - `fechamodificacionauditoria` = current timestamp (NOW())
  - Marks movement as PROCESADO
- All operations are within a database transaction, ensuring atomicity

#### Updated function calls:
Both `crearVentaWeb` and `agregarDetallesAVenta` functions now:
1. Call `processRecipeInventoryMovements` with user alias instead of user ID
2. Immediately call `updateInventoryStockFromMovements` after registering movements

## Requirements Fulfillment

### ✅ Requirement 1: Database Field Update
- **Requirement**: Update `tblposcrumenwebdetallemovimientos.usuarioauditoria` to VARCHAR(100)
- **Implementation**: Created migration script that modifies both `tblposcrumenwebdetallemovimientos` and `tblposcrumenwebinsumos`

### ✅ Requirement 2: Store User Alias in Movements
- **Requirement**: When PRODUCIR button is pressed, store user alias in `usuarioauditoria` field
- **Implementation**: Modified `processRecipeInventoryMovements` to accept and store `usuarioalias` parameter from `req.user?.alias`

### ✅ Requirement 3: Convert Quantity to Negative
- **Requirement**: Convert `cantidad` to negative for SALIDA movements
- **Implementation**: Added `cantidadNegativa = -Math.abs(cantidadTotal)` calculation

### ✅ Requirement 4: Register Movements for Recipes
- **Requirement**: Register movements when:
  - `afectainventario=1` AND
  - `tipoafectacion='RECETA'` AND
  - `inventarioprocesado=0`
- **Implementation**: Existing logic already handles this filtering; maintained in updated function

### ✅ Requirement 5: Update Inventory Stock After Movement Registration
- **Requirement**: After registering movements, if `estatusmovimiento='PENDIENTE'`, update inventory:
  - `stock_actual = referenciastock + cantidad`
  - `usuarioauditoria = user alias`
  - `fechamodificacionauditoria = NOW()`
- **Implementation**: Created `updateInventoryStockFromMovements` function that processes all PENDIENTE movements and updates inventory accordingly

## Workflow

```
PageVentas PRODUCIR Button Press
    ↓
1. Insert/Update Sale Details
    ↓
2. processRecipeInventoryMovements()
    - Check for afectainventario=1, tipoafectacion='RECETA', inventarioprocesado=0
    - For each matching detail:
        - Get recipe ingredients from tblposcrumenwebdetallerecetas
        - For each ingredient:
            - Calculate quantity: cantidadUso * sale_quantity
            - Convert to negative: -Math.abs(quantity)
            - Insert movement record with:
                - cantidad = negative value
                - usuarioauditoria = user alias
                - estatusmovimiento = 'PENDIENTE'
        - Mark detail as inventarioprocesado=1
    ↓
3. updateInventoryStockFromMovements()
    - Get all PENDIENTE movements for this sale
    - For each movement:
        - Retrieve current stock_actual from tblposcrumenwebinsumos
        - Calculate newStock = current_stock + cantidad
        - Update tblposcrumenwebinsumos:
            - stock_actual = newStock
            - usuarioauditoria = user alias
            - fechamodificacionauditoria = NOW()
        - Mark movement as 'PROCESADO'
    ↓
4. Commit Transaction
```

## Testing

### Database Migration
Run the migration script:
```bash
mysql -u [username] -p [database] < backend/src/scripts/alter_usuarioauditoria_to_varchar.sql
```

**Important**: If you have existing data with numeric user IDs in the `usuarioauditoria` fields, uncomment and run the data migration queries at the bottom of the script to convert them to user aliases.

### Verification
Run the verification script to check implementation:
```bash
mysql -u [username] -p [database] < backend/src/scripts/verify_usuarioauditoria_implementation.sql
```

### Expected Results
1. All new movements should have user aliases (strings) in `usuarioauditoria` field
2. Quantities for SALIDA movements should be negative
3. Inventory stock should be automatically updated after movements are registered
4. Movement status should change from PENDIENTE to PROCESADO after stock update

## Files Changed
1. `backend/src/scripts/alter_usuarioauditoria_to_varchar.sql` (new)
2. `backend/src/scripts/verify_usuarioauditoria_implementation.sql` (new)
3. `backend/src/types/movimientos.types.ts` (modified)
4. `backend/src/controllers/ventasWeb.controller.ts` (modified)

## Notes
- The implementation is transactional - if any step fails, the entire operation is rolled back
- Both ESPERAR and PRODUCIR buttons use the same logic
- The user alias is obtained from `req.user?.alias` which comes from the JWT token
- All database operations are performed within a single database connection/transaction
