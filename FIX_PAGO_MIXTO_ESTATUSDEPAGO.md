# Fix: Pago Mixto Data Truncation Error and tiempototaldeventa Logic

## Issue Summary
When processing mixed payments (pago MIXTO), the system was encountering two critical errors:

1. **Data Truncation Error**: 
   ```
   Error: Data truncated for column 'estatusdepago' at row 1
   code: 'WARN_DATA_TRUNCATED'
   errno: 1265
   ```

2. **Incorrect tiempototaldeventa Logic**: 
   The requirement states that for MIXTO payments, `tiempototaldeventa` should be set to the date and time of the **first registered payment**, but the code was setting it to NOW() when the sale became COBRADO.

## Root Cause Analysis

### Issue 1: estatusdepago Data Truncation
The database column `estatusdepago` is defined as an ENUM with values: `'PENDIENTE', 'PAGADO', 'ESPERAR'`, but the application code tries to set it to `'PARCIAL'` when a mixed payment is partially completed. This value was not included in the ENUM definition, causing the SQL error.

### Issue 2: tiempototaldeventa Timestamp
The original code updated the sale record BEFORE inserting the payment details, and used `NOW()` for `tiempototaldeventa`. This created a timing discrepancy between the actual payment timestamp and the sale completion timestamp.

## Solution

### Part 1: Database Schema Update
Created SQL migration script: `backend/src/scripts/fix_estatusdepago_enum.sql`

```sql
ALTER TABLE tblposcrumenwebventas 
MODIFY COLUMN estatusdepago ENUM('PENDIENTE', 'PAGADO', 'PARCIAL', 'ESPERAR') 
NOT NULL DEFAULT 'PENDIENTE';
```

This adds the `'PARCIAL'` value to the ENUM, allowing the application to correctly track partial payment status.

### Part 2: Code Refactoring
Modified `backend/src/controllers/pagos.controller.ts` in the `procesarPagoMixto` function:

**Key Changes:**
1. **Reordered Operations**: Payment details are now inserted BEFORE updating the sale record
2. **Accurate Timestamp Retrieval**: After inserting payments, query for MIN(fechadepago) to get the actual first payment timestamp
3. **Conditional Update Logic**: Only set tiempototaldeventa when sale becomes COBRADO and it's currently NULL

**Before:**
```typescript
// Query for previous payments
const [pagosPrevios] = await connection.execute(`
  SELECT SUM(totaldepago) as totalPagadoPrevio, MIN(fechadepago) as primerPagoFecha
  FROM tblposcrumenwebdetallepagos 
  WHERE idfolioventa = ? AND idnegocio = ?`);

// Update sale (using potentially NULL primerPagoFecha with COALESCE)
await connection.execute(`UPDATE tblposcrumenwebventas 
  SET ... tiempototaldeventa = IF(? = 'COBRADO' AND tiempototaldeventa IS NULL, 
                                  COALESCE(?, NOW()), 
                                  tiempototaldeventa) ...`);

// Insert new payments
for (const detalle of pagoData.detallesPagos) {
  await connection.execute(`INSERT INTO tblposcrumenwebdetallepagos ...`);
}
```

**After:**
```typescript
// Query for previous payments (just sum, not timestamp yet)
const [pagosPrevios] = await connection.execute(`
  SELECT SUM(totaldepago) as totalPagadoPrevio
  FROM tblposcrumenwebdetallepagos 
  WHERE idfolioventa = ? AND idnegocio = ?`);

// Insert new payments FIRST
for (const detalle of pagoData.detallesPagos) {
  await connection.execute(`INSERT INTO tblposcrumenwebdetallepagos ...`);
}

// NOW query for first payment timestamp (includes just-inserted payments)
const [primeraFecha] = await connection.execute(`
  SELECT MIN(fechadepago) as primerPagoFecha
  FROM tblposcrumenwebdetallepagos 
  WHERE idfolioventa = ? AND idnegocio = ?`);

// Update sale with accurate timestamp
await connection.execute(`UPDATE tblposcrumenwebventas 
  SET ... tiempototaldeventa = IF(? = 'COBRADO' AND tiempototaldeventa IS NULL, 
                                  ?, 
                                  tiempototaldeventa) ...`);
```

## Impact

### Files Modified
1. `backend/src/controllers/pagos.controller.ts` - Refactored payment processing logic
2. `backend/src/scripts/fix_estatusdepago_enum.sql` - NEW: Database migration script

### Business Logic Changes
- **Payment Status Tracking**: System can now correctly track `PARCIAL` payment status
- **Audit Accuracy**: `tiempototaldeventa` now precisely reflects the first payment timestamp
- **No Breaking Changes**: Existing functionality preserved, only fixes applied

## Deployment Instructions

### 1. Database Migration (Required)
Before deploying the code changes, run the migration script:

```bash
mysql -u username -p database_name < backend/src/scripts/fix_estatusdepago_enum.sql
```

**Verification Query:**
```sql
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'tblposcrumenwebventas' 
AND COLUMN_NAME = 'estatusdepago';
```

Expected result should show:
```
COLUMN_TYPE: enum('PENDIENTE','PAGADO','PARCIAL','ESPERAR')
```

### 2. Code Deployment
Deploy the updated backend code with the modified `pagos.controller.ts`.

### 3. Verification
Test the mixed payment endpoint:

```bash
POST /api/pagos/mixto
{
  "idventa": 123,
  "detallesPagos": [
    {
      "formadepagodetalle": "EFECTIVO",
      "totaldepago": 50.00
    }
  ],
  "descuento": 0
}
```

**Expected Behaviors:**
1. ✅ No SQL errors for partial payments
2. ✅ estatusdepago correctly set to 'PARCIAL' when partially paid
3. ✅ tiempototaldeventa set to first payment timestamp when fully paid
4. ✅ Subsequent payments preserve the original tiempototaldeventa

## Testing Scenarios

### Scenario 1: First Partial Payment
- **Action**: Submit first payment that doesn't cover total
- **Expected**: estatusdepago = 'PARCIAL', tiempototaldeventa = NULL

### Scenario 2: Complete Payment in One Go
- **Action**: Submit payment(s) that cover total in first transaction
- **Expected**: estatusdepago = 'PAGADO', tiempototaldeventa = timestamp of first payment

### Scenario 3: Multiple Payments to Complete
- **Action**: Submit first partial payment, then second payment to complete
- **Expected**: 
  - After first: estatusdepago = 'PARCIAL', tiempototaldeventa = NULL
  - After second: estatusdepago = 'PAGADO', tiempototaldeventa = timestamp of FIRST payment

### Scenario 4: Subsequent Payments After Complete
- **Action**: Submit additional payment after sale is already COBRADO
- **Expected**: tiempototaldeventa remains unchanged (preserves first payment timestamp)

## Security Summary

### CodeQL Scan Results
- **0 New Alerts**: No security vulnerabilities introduced by these changes
- **1 Pre-existing Alert**: Rate limiting issue in pagos routes (not addressed as out of scope)

### Security Considerations
- ✅ No SQL injection risks (using parameterized queries)
- ✅ Transaction integrity maintained (all operations within transaction)
- ✅ Authentication required (uses AuthRequest middleware)
- ✅ Input validation present (validates payment details and amounts)

## Rollback Plan

If issues arise, rollback can be performed in two steps:

### 1. Code Rollback
```bash
git revert <commit-hash>
```

### 2. Database Rollback (Optional)
Only if you need to remove 'PARCIAL' from ENUM:
```sql
-- Check for existing PARCIAL records first
SELECT COUNT(*) FROM tblposcrumenwebventas WHERE estatusdepago = 'PARCIAL';

-- If count is 0, safe to rollback
ALTER TABLE tblposcrumenwebventas 
MODIFY COLUMN estatusdepago ENUM('PENDIENTE', 'PAGADO', 'ESPERAR') 
NOT NULL DEFAULT 'PENDIENTE';
```

**⚠️ Warning**: Do not rollback the database if there are records with estatusdepago = 'PARCIAL'.

## Related Documentation
- Original error report in problem statement
- Database schema: `backend/src/scripts/add_payment_functionality.sql`
- Payment types: `backend/src/types/ventasWeb.types.ts`
- Payment routes: `backend/src/routes/pagos.routes.ts`

---
**Fix Date**: January 29, 2026  
**Status**: ✅ Complete and Tested  
**Risk Level**: Low (Minimal changes, database migration required)  
**Breaking Changes**: None
