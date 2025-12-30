# Migration: Add moderadores Column to tblposcrumenwebdetalleventas

## Overview

This migration adds the `moderadores` column to the `tblposcrumenwebdetalleventas` table to support storing moderator selections for products in web sales.

## Problem Statement

The application is experiencing the following error when registering web sales:

```
Error al registrar venta web: Unknown column 'moderadores' in field list
```

This occurs because:
1. The backend controller (`backend/src/controllers/ventasWeb.controller.ts` line 246) attempts to INSERT into the `moderadores` column
2. The TypeScript types include the `moderadores` field (both frontend and backend)
3. The database table `tblposcrumenwebdetalleventas` does not yet have this column

## Solution

Execute the provided SQL migration script to add the missing column to the database.

## Changes Required

### Database Schema Change

**SQL Migration Script**: `backend/src/scripts/add_moderadores_to_detalleventas.sql`

The script will:
- Add a `moderadores` column of type `LONGTEXT` (nullable) to store comma-separated moderador IDs
- Place the column after the `observaciones` column for logical ordering
- Add a descriptive comment explaining the column's purpose
- Update the table comment to reflect the new column

**IMPORTANT**: This migration must be executed on the production database to resolve the error.

## Migration Script Content

```sql
-- Migration to add moderadores column to tblposcrumenwebdetalleventas
-- This column will store comma-separated IDs of moderadores selected for each product

ALTER TABLE tblposcrumenwebdetalleventas
ADD COLUMN IF NOT EXISTS moderadores LONGTEXT NULL
COMMENT 'Comma-separated IDs of moderadores (from tblposcrumenwebmoderadores) selected for this product'
AFTER observaciones;

-- Update comment for the table to reflect the new column
ALTER TABLE tblposcrumenwebdetalleventas 
COMMENT = 'Detalle de ventas web con información de productos, recetas, costos y moderadores';
```

## Deployment Steps

### Prerequisites
- [ ] Database backup completed
- [ ] Database administrator access available
- [ ] Application can tolerate brief read-only period (optional, for safety)

### Step 1: Backup Database

```bash
# Create a backup of the database before running migrations
# Replace <DB_HOST>, <DB_USER>, and <DB_NAME> with actual values
mysqldump -h <DB_HOST> -u <DB_USER> -p <DB_NAME> > backup_moderadores_migration_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Run Migration Script

#### Option A: Using MySQL Command Line

```bash
# Connect to the database
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME>

# Run the migration script
source backend/src/scripts/add_moderadores_to_detalleventas.sql
```

#### Option B: Using MySQL Workbench or Similar Tool

1. Connect to the database
2. Open the file `backend/src/scripts/add_moderadores_to_detalleventas.sql`
3. Execute the script
4. Verify no errors occurred

### Step 3: Verify Migration

```sql
-- Check if the column was added successfully
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tblposcrumenwebdetalleventas'
    AND COLUMN_NAME = 'moderadores';

-- Expected output:
-- TABLE_NAME: tblposcrumenwebdetalleventas
-- COLUMN_NAME: moderadores
-- DATA_TYPE: longtext
-- IS_NULLABLE: YES
-- COLUMN_COMMENT: Comma-separated IDs of moderadores...
```

### Step 4: Verify Table Structure

```sql
-- View the complete table structure
DESCRIBE tblposcrumenwebdetalleventas;

-- Verify that 'moderadores' appears after 'observaciones'
```

### Step 5: Test the Application

After the migration:
1. Navigate to PageVentas in the application
2. Select a sale type (Mesa, Llevar, or Domicilio)
3. Add products to the order
4. (Optional) Select moderadores for products if available
5. Click "Producir" to register the sale
6. Verify the sale is registered successfully without errors
7. Check the database to confirm the record was inserted with the moderadores column

## Expected Results

### Before Migration
- ❌ Error: "Unknown column 'moderadores' in field list"
- ❌ Web sales fail to register
- ❌ Users cannot complete transactions

### After Migration
- ✅ The `moderadores` column exists in the database
- ✅ Web sales register successfully
- ✅ Moderador selections are stored properly
- ✅ No errors when inserting sale details

## Migration Safety

This migration is **SAFE** because:
1. ✅ Uses `ADD COLUMN IF NOT EXISTS` - won't fail if column already exists
2. ✅ Column is nullable - doesn't require data for existing rows
3. ✅ No data manipulation - only adds a new column
4. ✅ No foreign keys - no cascade effects
5. ✅ No default value - doesn't update existing records
6. ✅ Backward compatible - old code will ignore the column

## Rollback Plan

If issues occur after migration, the column can be removed:

```sql
-- WARNING: This will lose any moderador data stored after migration
ALTER TABLE tblposcrumenwebdetalleventas
DROP COLUMN moderadores;
```

**Note**: Rollback should only be necessary if there are unexpected database issues. The column itself is safe and does not break existing functionality.

## Impact Analysis

### Application Code
- ✅ No code changes required - already implemented
- ✅ Types already include `moderadores` field
- ✅ Controller already inserts into `moderadores` column

### Database
- ✅ Minimal impact - adds one nullable column
- ✅ No performance impact - column is only used on INSERT
- ✅ No data migration needed - existing records remain unchanged

### Users
- ✅ No user interface changes
- ✅ Existing functionality preserved
- ✅ New functionality (moderadores) becomes available

## Testing Checklist

After deploying the migration:

- [ ] Column `moderadores` exists in `tblposcrumenwebdetalleventas`
- [ ] Column is of type `LONGTEXT` and nullable
- [ ] Column appears after `observaciones` in table structure
- [ ] Can register a sale WITHOUT moderadores (value should be NULL)
- [ ] Can register a sale WITH moderadores (value should be stored)
- [ ] Existing sales data is intact and unmodified
- [ ] No errors in application logs
- [ ] No console errors in browser

## References

- **Issue**: "Error al registrar venta web: Unknown column 'moderadores' in field list"
- **Controller**: `backend/src/controllers/ventasWeb.controller.ts` (line 246)
- **Types**: `backend/src/types/ventasWeb.types.ts` and `src/types/ventasWeb.types.ts`
- **Migration Script**: `backend/src/scripts/add_moderadores_to_detalleventas.sql`
- **Related Documentation**: 
  - `MODERADORES_VS_USUARIOS.md` - Explanation of what moderadores are
  - `FIX_VENTA_WEB_ERROR.md` - Previous related fix

## Support

If you encounter issues during migration:

1. **Check MySQL version**: The `IF NOT EXISTS` clause requires MySQL 5.7+ or MariaDB 10.2+
2. **Verify permissions**: Ensure the database user has `ALTER TABLE` privileges
3. **Check logs**: Review MySQL error logs for specific error messages
4. **Restore backup**: If critical issues occur, restore from the backup created in Step 1
5. **Contact development team**: Provide error messages and MySQL version information

## FAQ

### Q: What are "moderadores"?
**A**: Moderadores are product modification options (e.g., "Sin picante", "Extra queso") that can be applied to products during a sale. They are NOT user accounts. See `MODERADORES_VS_USUARIOS.md` for details.

### Q: Is this migration required immediately?
**A**: Yes. Without this migration, web sales will continue to fail with the "Unknown column" error.

### Q: Will existing sales be affected?
**A**: No. Existing sale records remain unchanged. The new column is added with NULL values for all existing records.

### Q: Can the migration be run during business hours?
**A**: Yes. The migration is fast (milliseconds) and uses `ADD COLUMN IF NOT EXISTS` which is safe. However, it's recommended to run during low-traffic periods as a best practice.

### Q: What if the column already exists?
**A**: The migration script uses `IF NOT EXISTS`, so it will safely skip the column creation and report success.

## Timeline

- **Estimated migration time**: < 1 second (on typical database size)
- **Application downtime**: None required (but recommended during low-traffic)
- **Rollback time**: < 1 second (if needed)

## Sign-off

**Migration Status**: ✅ Ready for Production  
**Risk Level**: 🟢 Low  
**Rollback Available**: ✅ Yes  
**Backup Required**: ✅ Yes (precautionary)  
**Testing Required**: ✅ Yes (post-migration)

---

**Created**: December 30, 2024  
**Version**: 1.0.0  
**Status**: Ready for Deployment
