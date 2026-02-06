# Implementation Summary: Recipe Inventory Movement Tracking

## Overview
This implementation adds automatic inventory movement tracking for recipe-based sales when the PRODUCIR button is pressed in PageVentas.

## Problem Statement (Spanish)
When the PRODUCIR button is pressed in PageVentas, after performing insert or update:
- IF `tblposcrumenwebdetalleventas.afectainventario=1` AND `tblposcrumenwebdetalleventas.tipoafectacion='RECETA'` AND `tblposcrumenwebdetalleventas.inventarioprocesado=0`
- THEN register ingredient movements by:
  1. Looking up recipe details in `tblposcrumenwebdetallerecetas` where `dtlRecetaId = tblposcrumenwebdetalleventas.idreceta`
  2. Inserting records into `tblposcrumenwebdetallemovimientos` with specified fields
  3. Updating `tblposcrumenwebdetalleventas.inventarioprocesado=1`

## Files Created/Modified

### New Files

#### 1. `backend/src/scripts/create_detallemovimientos_table.sql`
SQL script to create the `tblposcrumenwebdetallemovimientos` table with:
- All required fields per specification
- Proper data types and constraints
- Indexes for performance (idinsumo, idnegocio, idreferencia, fechamovimiento)
- Comments explaining each field

#### 2. `backend/src/types/movimientos.types.ts`
TypeScript type definitions for inventory movements:
- `TipoInsumo`: 'DIRECTO' | 'INVENTARIO' | 'RECETA'
- `TipoMovimiento`: 'ENTRADA' | 'SALIDA'
- `MotivoMovimiento`: 'COMPRA' | 'VENTA' | 'AJUSTE_MANUAL' | 'MERMA' | 'CANCELACION' | 'DEVOLUCION' | 'INV_INICIAL'
- `EstatusMovimiento`: 'PROCESADO' | 'PENDIENTE'
- `DetalleMovimiento` interface
- `DetalleMovimientoCreate` interface

### Modified Files

#### 3. `backend/src/controllers/ventasWeb.controller.ts`
Added inventory movement processing functionality:

**New Helper Function**: `processRecipeInventoryMovements()`
- Parameters:
  - `connection`: Database connection (for transaction management)
  - `idventa`: Sale ID
  - `iddetalleventa`: Detail ID (null to process all details for the sale)
  - `idnegocio`: Business ID
  - `usuarioauditoria`: User ID who created the sale

- Logic:
  1. Queries sale details with conditions: `afectainventario=1`, `tipoafectacion='RECETA'`, `inventarioprocesado=0`
  2. For each qualifying detail:
     - Fetches recipe ingredients from `tblposcrumenwebdetallerecetas`
     - Joins with `tblposcrumenwebinsumos` to get current stock, prices, and costs
     - For each ingredient:
       - Calculates total quantity = recipe quantity × sale quantity
       - Creates movement record with:
         - `tipoinsumo`: 'RECETA'
         - `tipomovimiento`: 'SALIDA'
         - `motivomovimiento`: 'VENTA'
         - `estatusmovimiento`: 'PENDIENTE'
         - All other required fields per specification
     - Marks detail as processed: `inventarioprocesado=1`

**Integration Points**:
1. `createVentaWeb()` function (line ~441):
   - Called after all sale details are inserted
   - Before transaction commit
   - Processes all recipe-based details in the new sale

2. `addDetallesToVenta()` function (line ~971):
   - Called after details are added/updated to existing sale
   - Before transaction commit
   - Processes all unprocessed recipe-based details

## Database Schema

### Table: tblposcrumenwebdetallemovimientos

| Field | Type | Description |
|-------|------|-------------|
| iddetallemovimiento | BIGINT(20) UNSIGNED PK AI | Primary key |
| idinsumo | BIGINT(20) UNSIGNED | Ingredient ID |
| nombreinsumo | VARCHAR(200) | Ingredient name |
| tipoinsumo | ENUM | Type: DIRECTO/INVENTARIO/RECETA |
| tipomovimiento | ENUM | Movement type: ENTRADA/SALIDA |
| motivomovimiento | ENUM | Reason: COMPRA/VENTA/etc. |
| cantidad | DECIMAL(12,3) | Quantity moved |
| referenciastock | DECIMAL(12,3) | Stock reference at time |
| unidadmedida | VARCHAR(20) | Unit of measure |
| precio | DECIMAL(12,2) | Sale price |
| costo | DECIMAL(12,2) | Average weighted cost |
| idreferencia | BIGINT(20) UNSIGNED | Reference (sale ID) |
| fechamovimiento | DATETIME | Movement date/time |
| observaciones | TEXT | Additional notes |
| usuarioauditoria | BIGINT(20) UNSIGNED | User who created |
| idnegocio | BIGINT(20) UNSIGNED | Business ID |
| estatusmovimiento | ENUM | Status: PROCESADO/PENDIENTE |
| fecharegistro | DATETIME | Registration date |
| fechaauditoria | DATETIME | Last modification date |

## Data Flow

```
User clicks PRODUCIR button
↓
Frontend calls createVentaWeb or addDetallesToVenta
↓
Backend inserts/updates sale and details
↓
For each detail with afectainventario=1 AND tipoafectacion='RECETA' AND inventarioprocesado=0:
  ↓
  Query recipe details (tblposcrumenwebdetallerecetas)
  ↓
  For each ingredient:
    ↓
    Calculate quantity = recipe_qty × sale_qty
    ↓
    Insert movement record (tblposcrumenwebdetallemovimientos)
  ↓
  Update inventarioprocesado = 1
↓
Commit transaction
```

## Field Mapping per Specification

All fields in `tblposcrumenwebdetallemovimientos` are populated according to the specification:

- ✅ `iddetallemovimiento`: Auto-increment PK
- ✅ `idinsumo`: From `tblposcrumenwebdetallerecetas.idreferencia`
- ✅ `nombreinsumo`: From `tblposcrumenwebdetallerecetas.nombreinsumo`
- ✅ `tipoinsumo`: Fixed value 'RECETA'
- ✅ `tipomovimiento`: Fixed value 'SALIDA'
- ✅ `motivomovimiento`: Fixed value 'VENTA'
- ✅ `cantidad`: Calculated as `tblposcrumenwebdetalleventas.cantidad × recipe ingredient quantity`
- ✅ `referenciastock`: From `tblposcrumenwebinsumos.stock_actual`
- ✅ `unidadmedida`: From `tblposcrumenwebdetallerecetas.umInsumo`
- ✅ `precio`: From `tblposcrumenwebinsumos.precio_venta`
- ✅ `costo`: From `tblposcrumenwebinsumos.costo_promedio_ponderado`
- ✅ `idreferencia`: From `tblposcrumenwebdetalleventas.idventa`
- ✅ `fechamovimiento`: Automatic NOW() at insert/update time
- ✅ `observaciones`: Null
- ✅ `usuarioauditoria`: User ID who logged in
- ✅ `idnegocio`: Business ID of logged-in user
- ✅ `estatusmovimiento`: Fixed value 'PENDIENTE'
- ✅ `fecharegistro`: Automatic NOW() at insert time
- ✅ `fechaauditoria`: Automatic NOW() at insert/update time

## Transaction Safety

All operations are performed within existing database transactions:
- If any error occurs, the entire transaction is rolled back
- Movement records are only created if the sale/details are successfully saved
- The `inventarioprocesado` flag is only set after movements are created

## Security Considerations

✅ **SQL Injection Prevention**: All queries use parameterized statements
✅ **Authentication**: Functions require authenticated user (AuthRequest)
✅ **Business Isolation**: All queries filter by `idnegocio` from logged-in user
✅ **Error Handling**: Proper try-catch with transaction rollback
✅ **No New Vulnerabilities**: CodeQL scan passed with 0 alerts

## Code Quality

✅ **TypeScript Compilation**: Builds successfully with no errors
✅ **Type Safety**: Proper TypeScript types throughout
✅ **Code Review**: Automated review completed
✅ **Consistent Patterns**: Follows existing code conventions
✅ **Comments**: Helper function includes comprehensive documentation

## Testing Recommendations

Since this implementation requires database access to test properly, manual testing should include:

1. **Test Case 1**: Create a sale with recipe-based products
   - Click PRODUCIR button
   - Verify movement records created in `tblposcrumenwebdetallemovimientos`
   - Verify `inventarioprocesado=1` set on details
   - Verify quantities calculated correctly

2. **Test Case 2**: Add more items to existing sale
   - Use addDetallesToVenta endpoint
   - Verify new movements created for recipe items
   - Verify existing processed items not reprocessed

3. **Test Case 3**: Sale with mixed product types
   - Include Directo, Inventario, and Receta products
   - Verify only Receta products generate movements
   - Verify Directo/Inventario remain with `inventarioprocesado=-1`

4. **Test Case 4**: Error handling
   - Force database error during movement creation
   - Verify transaction rollback
   - Verify no partial data saved

5. **Test Case 5**: ESPERAR status
   - Create sale with `estadodetalle='ESPERAR'`
   - Verify no movements created (afectainventario=-1)
   - Update to ORDENADO
   - Verify movements created

## Deployment Steps

1. **Database Migration**:
   ```sql
   -- Run the SQL script to create the table
   source backend/src/scripts/create_detallemovimientos_table.sql
   ```

2. **Code Deployment**:
   ```bash
   cd backend
   npm run build
   npm start
   ```

3. **Verification**:
   - Check table exists: `SHOW TABLES LIKE 'tblposcrumenwebdetallemovimientos';`
   - Check table structure: `DESCRIBE tblposcrumenwebdetallemovimientos;`
   - Test with sample sale containing recipe products

## Notes

- Movement records are created with `estatusmovimiento='PENDIENTE'` as specified
- The system that processes these PENDIENTE movements to update actual inventory is outside the scope of this implementation
- Multiple ingredients in a recipe will generate multiple movement records
- Movement records maintain a full audit trail with timestamps and user information
- The `referenciastock` field captures inventory level at time of sale for historical tracking

## Completion Status

✅ All requirements from problem statement implemented
✅ Code compiles successfully
✅ Code review completed
✅ Security scan passed (0 vulnerabilities)
✅ Ready for deployment and testing
