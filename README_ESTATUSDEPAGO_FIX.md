# Fix: estatusdepago Data Truncation Error

## 🔴 Error Description

When processing mixed payments (MIXTO), the following error occurs:

```
Error al procesar pago mixto: Error: Data truncated for column 'estatusdepago' at row 1
    at PromisePoolConnection.execute (/opt/render/project/src/backend/node_modules/mysql2/lib/promise/connection.js:47:22)
    at procesarPagoMixto (/opt/render/project/src/backend/dist/controllers/pagos.controller.js:232:26)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5) {
  code: 'WARN_DATA_TRUNCATED',
  errno: 1265,
  sqlMessage: "Data truncated for column 'estatusdepago' at row 1"
}
```

## 🔍 Root Cause

The `estatusdepago` column in the `tblposcrumenwebventas` table is defined as an ENUM that does not include the `'PARCIAL'` value. The application code correctly attempts to set this value for partially paid mixed payments, but the database schema is outdated.

**Current Schema (INCORRECT):**
```sql
estatusdepago ENUM('PENDIENTE', 'PAGADO', 'ESPERAR')
```

**Required Schema (CORRECT):**
```sql
estatusdepago ENUM('PENDIENTE', 'PAGADO', 'PARCIAL', 'ESPERAR')
```

## ✅ Solution

### Quick Fix (3 Steps)

#### Option A: Using the automated script (Recommended)

```bash
./fix_estatusdepago.sh
```

The script will:
1. Validate your database connection
2. Check if the fix is needed
3. Apply the migration if confirmed
4. Verify the fix was successful

#### Option B: Manual migration

1. **Validate current state:**
   ```bash
   mysql -u [user] -p [database] < backend/src/scripts/validate_estatusdepago_schema.sql
   ```

2. **Apply the fix:**
   ```bash
   mysql -u [user] -p [database] < backend/src/scripts/fix_estatusdepago_enum.sql
   ```

3. **Verify the fix:**
   ```bash
   mysql -u [user] -p [database] < backend/src/scripts/validate_estatusdepago_schema.sql
   ```

## 📁 Files in This Fix

### Scripts
- **`fix_estatusdepago.sh`** - Automated validation and migration script
- **`backend/src/scripts/fix_estatusdepago_enum.sql`** - SQL migration to add 'PARCIAL' to ENUM
- **`backend/src/scripts/validate_estatusdepago_schema.sql`** - Validation query to check schema

### Documentation
- **`DATABASE_MIGRATION_INSTRUCTIONS.md`** - Detailed English instructions
- **`INSTRUCCIONES_MIGRACION_BD.md`** - Detailed Spanish instructions
- **`README_ESTATUSDEPAGO_FIX.md`** - This file

### Related Files (No changes needed)
- `backend/src/controllers/pagos.controller.ts` - Application code is already correct
- `FIX_PAGO_MIXTO_ESTATUSDEPAGO.md` - Previous documentation
- `CORRECCION_PAGO_MIXTO_ESTATUSDEPAGO.md` - Previous documentation (Spanish)

## 🚀 Deployment Checklist

Before deploying this fix to production:

- [ ] Backup the database
- [ ] Test the migration on a staging/development database
- [ ] Verify the application code matches the repository version
- [ ] Run the validation script to confirm the issue exists
- [ ] Apply the migration during low-traffic hours (if possible)
- [ ] Verify the migration was successful
- [ ] Test mixed payment functionality
- [ ] Monitor logs for any errors

## 📊 Impact Assessment

### Migration Impact
- ✅ **Zero Downtime** - ALTER TABLE on ENUM is instant
- ✅ **Backward Compatible** - Existing values remain valid
- ✅ **No Data Loss** - Only extends allowed values
- ✅ **Application Compatible** - Code already expects this value

### Risk Level
- **Low Risk** - Simple schema extension
- **No Rollback Needed** - Unless PARCIAL records exist, can be reverted

## 🧪 Testing

After applying the migration, test mixed payment scenarios:

1. **Partial Payment Test:**
   - Create a sale with total of $100
   - Make a partial payment of $50
   - Verify `estatusdepago` = 'PARCIAL'
   - Verify no errors in logs

2. **Full Payment Test:**
   - Continue the above sale
   - Make another payment of $50
   - Verify `estatusdepago` = 'PAGADO'
   - Verify `estadodeventa` = 'COBRADO'

3. **Single Mixed Payment Test:**
   - Create a sale with total of $100
   - Make a full payment of $100 using mixed methods
   - Verify `estatusdepago` = 'PAGADO'
   - Verify no errors in logs

## 🆘 Troubleshooting

### Error: "Cannot connect to database"
- Verify database credentials
- Check database server is running
- Verify network connectivity

### Error: "Table 'tblposcrumenwebventas' doesn't exist"
- Verify you're connecting to the correct database
- Check database name spelling

### Error: "ALTER TABLE command denied"
- User needs ALTER privilege on the table
- Contact database administrator

### Migration applied but error persists
- Restart the application server
- Clear any database connection pools
- Verify the application is using the correct database

## 📝 Additional Notes

### Why wasn't this in the original schema?
The application code was updated to support partial payments for mixed payment types, but the database schema migration was not applied to all environments.

### What if I already have PARCIAL records?
If you have records with `estatusdepago = 'PARCIAL'`, it means the migration was already applied. The error should not occur unless there's a schema drift.

### Can this cause data corruption?
No. This migration only extends the allowed values. It cannot corrupt existing data.

## 📞 Support

For issues or questions:
1. Check the detailed instructions: `DATABASE_MIGRATION_INSTRUCTIONS.md`
2. Review application logs for additional context
3. Verify database server version and compatibility
4. Contact the development team with:
   - Database version
   - Error messages
   - Result of validation script
