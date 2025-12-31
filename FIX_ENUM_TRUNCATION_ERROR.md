# Fix: Data Truncation Error for ENUM Columns

## Problem Description

When creating a new web sale (venta web), the application was throwing the following errors:

### Error 1: estadodeventa column
```
Error: Data truncated for column 'estadodeventa' at row 1
code: 'WARN_DATA_TRUNCATED',
errno: 1265,
sqlState: '01000'
```

### Error 2: formadepago column (New)
```
Error: Data truncated for column 'formadepago' at row 1
code: 'WARN_DATA_TRUNCATED',
errno: 1265,
sqlState: '01000'
```

## Root Cause

The database table `tblposcrumenwebventas` has ENUM columns (`estadodeventa`, `formadepago`, `estatusdepago`, `tipodeventa`) that do not include all the values defined in the TypeScript type definitions.

When the application tries to insert a value that is not in the database ENUM definition, MySQL/MariaDB truncates the data and throws a warning/error (depending on SQL mode).

### Mismatch Analysis

**TypeScript Types (Backend & Frontend):**
```typescript
// backend/src/types/ventasWeb.types.ts & src/types/ventasWeb.types.ts
export type EstadoDeVenta = 'SOLICITADO' | 'LEIDO' | 'PREPARANDO' | 'EN_CAMINO' | 
                            'ENTREGADO' | 'CANCELADO' | 'DEVUELTO' | 'COBRADO' | 
                            'ESPERAR' | 'ORDENADO';

export type FormaDePago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'MIXTO' | 'sinFP';

export type EstatusDePago = 'PENDIENTE' | 'PAGADO' | 'PARCIAL';

export type TipoDeVenta = 'DOMICILIO' | 'LLEVAR' | 'MESA' | 'ONLINE';
```

**Database Schema (Before Fix):**
The database ENUM columns likely had a subset of these values or different values, causing the mismatch and truncation errors.

## Solution

### 1. SQL Migration Script

Created a comprehensive SQL migration script to update all ENUM columns in `tblposcrumenwebventas`:

**File:** `backend/src/scripts/fix_ventas_enum_columns.sql`

This script:
- Updates `estadodeventa` ENUM to include all 10 valid states
- Updates `formadepago` ENUM to include all 5 valid payment methods
- Updates `estatusdepago` ENUM to include all 3 valid payment statuses
- Updates `tipodeventa` ENUM to include all 4 valid sale types
- Sets appropriate defaults for each column
- Includes verification queries to confirm the migration

### 2. ENUM Values Defined

#### estadodeventa
```sql
ENUM('SOLICITADO', 'LEIDO', 'ESPERAR', 'ORDENADO', 'PREPARANDO', 
     'EN_CAMINO', 'ENTREGADO', 'CANCELADO', 'DEVUELTO', 'COBRADO')
DEFAULT 'SOLICITADO'
```

States represent the lifecycle of a sale:
- **SOLICITADO**: Order requested (initial state)
- **LEIDO**: Order read/acknowledged
- **ESPERAR**: Order on hold/waiting
- **ORDENADO**: Order confirmed
- **PREPARANDO**: Order being prepared
- **EN_CAMINO**: Order on delivery
- **ENTREGADO**: Order delivered
- **CANCELADO**: Order cancelled
- **DEVUELTO**: Order returned
- **COBRADO**: Order paid/charged

#### formadepago
```sql
ENUM('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'MIXTO', 'sinFP')
DEFAULT 'sinFP'
```

Payment methods:
- **EFECTIVO**: Cash payment
- **TARJETA**: Card payment (credit/debit)
- **TRANSFERENCIA**: Bank transfer
- **MIXTO**: Mixed payment (multiple methods)
- **sinFP**: Without payment method (to be determined)

#### estatusdepago
```sql
ENUM('PENDIENTE', 'PAGADO', 'PARCIAL')
DEFAULT 'PENDIENTE'
```

Payment statuses:
- **PENDIENTE**: Payment pending
- **PAGADO**: Payment complete
- **PARCIAL**: Partial payment received

#### tipodeventa
```sql
ENUM('DOMICILIO', 'LLEVAR', 'MESA', 'ONLINE')
```

Sale types:
- **DOMICILIO**: Delivery order
- **LLEVAR**: Takeout order
- **MESA**: Dine-in (table) order
- **ONLINE**: Online order

## Deployment Instructions

### 1. Run the Migration Script

**On the production database (Render or other hosting):**

```bash
# Connect to your database
mysql -h [host] -u [user] -p [database]

# Or if using Render's MySQL:
# Use the connection string from Render dashboard

# Run the migration script
source backend/src/scripts/fix_ventas_enum_columns.sql;

# Or copy and paste the contents directly into the MySQL client
```

**Important Notes:**
- This migration is **NON-DESTRUCTIVE** - it only modifies column definitions
- Existing data will remain intact (as long as it contains valid values)
- The migration includes verification queries to check the results
- Run during a maintenance window if possible

### 2. Verification Steps

After running the migration, verify the changes:

```sql
-- 1. Check column definitions
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    COLUMN_DEFAULT,
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tblposcrumenwebventas'
    AND COLUMN_NAME IN ('estadodeventa', 'formadepago', 'estatusdepago', 'tipodeventa')
ORDER BY COLUMN_NAME;

-- 2. Check for any invalid data (should return 0 rows)
SELECT COUNT(*) as invalid_rows
FROM tblposcrumenwebventas
WHERE estadodeventa NOT IN ('SOLICITADO', 'LEIDO', 'ESPERAR', 'ORDENADO', 'PREPARANDO', 
                             'EN_CAMINO', 'ENTREGADO', 'CANCELADO', 'DEVUELTO', 'COBRADO')
    OR formadepago NOT IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'MIXTO', 'sinFP')
    OR estatusdepago NOT IN ('PENDIENTE', 'PAGADO', 'PARCIAL')
    OR tipodeventa NOT IN ('DOMICILIO', 'LLEVAR', 'MESA', 'ONLINE');
```

### 3. Test the Application

After deploying the migration:

1. **Create a new sale with "Producir" button:**
   - Navigate to PageVentas
   - Select sale type (MESA, LLEVAR, or DOMICILIO)
   - Add products to the order
   - Click "Producir"
   - Verify: Sale created with `estadodeventa='SOLICITADO'`, `estadodetalle='ORDENADO'`

2. **Create a new sale with "Esperar" button:**
   - Follow same steps as above
   - Click "Esperar" instead
   - Verify: Sale created with `estadodeventa='ESPERAR'`, `estadodetalle='ESPERAR'`

3. **Test different payment methods:**
   - Create sales with each payment method: EFECTIVO, TARJETA, TRANSFERENCIA, MIXTO
   - Verify: No truncation errors occur

## Impact

### Before the Fix:
- ❌ Creating web sales failed with "Data truncated" errors
- ❌ Users couldn't complete orders
- ❌ Inconsistency between TypeScript types and database schema
- ❌ Application unusable for sales operations

### After the Fix:
- ✅ All ENUM values from TypeScript are now supported in the database
- ✅ Sales can be created successfully with any valid state/payment method
- ✅ Database schema matches application types
- ✅ Full consistency between frontend, backend, and database

## Files Modified

1. **backend/src/scripts/fix_ventas_enum_columns.sql** (NEW)
   - Comprehensive SQL migration to fix all ENUM columns
   - Includes verification queries

2. **FIX_ENUM_TRUNCATION_ERROR.md** (NEW)
   - This documentation file

## No Code Changes Required

**Important:** This is purely a database schema fix. No changes to application code are needed because:
- TypeScript types already define all correct values
- Backend controller (`ventasWeb.controller.ts`) uses these types correctly
- Frontend sends valid values according to these types

The problem was solely in the database schema not matching the application types.

## Related Issues

- Original issue: "Data truncated for column 'estadodeventa' at row 1"
- Follow-up issue: "Data truncated for column 'formadepago' at row 1"
- Root cause: Database ENUM definitions incomplete

## Prevention

To prevent similar issues in the future:

1. **Keep database schema documentation up to date**
2. **Maintain migration scripts for all schema changes**
3. **Test with all possible ENUM values during development**
4. **Add database schema validation tests**
5. **Document ENUM values in both TypeScript types and SQL schema**

## References

- TypeScript types: `backend/src/types/ventasWeb.types.ts` and `src/types/ventasWeb.types.ts`
- Controller: `backend/src/controllers/ventasWeb.controller.ts`
- API documentation: `API_VENTASWEB_ENDPOINTS.md`
- Previous fix: `FIX_VENTA_WEB_ERROR.md` (for nombrereceta field)

## Support

If you encounter any issues after applying this migration:

1. Check the verification queries output
2. Review application logs for any new errors
3. Ensure all ENUM values are spelled correctly (case-sensitive)
4. Contact the development team with error details
