# Database Migration Instructions - estatusdepago

## ⚠️ ACTION REQUIRED: Database Migration

### Problem
The system is experiencing the following error when processing mixed payments:

```
Error: Data truncated for column 'estatusdepago' at row 1
code: 'WARN_DATA_TRUNCATED'
errno: 1265
```

### Cause
The `estatusdepago` column in the `tblposcrumenwebventas` table does not include the `'PARCIAL'` value in its ENUM definition. The application code attempts to save this value when a mixed payment is partially paid, but the database rejects it.

### Solution

#### Step 1: Validate Current State
Run the following script to verify if migration is needed:

```bash
mysql -u [username] -p [database_name] < backend/src/scripts/validate_estatusdepago_schema.sql
```

Or directly in MySQL:

```sql
SELECT COLUMN_NAME, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'tblposcrumenwebventas' 
  AND COLUMN_NAME = 'estatusdepago';
```

**Expected Result (CORRECT):**
```
COLUMN_TYPE: enum('PENDIENTE','PAGADO','PARCIAL','ESPERAR')
```

**Result that Needs Correction:**
```
COLUMN_TYPE: enum('PENDIENTE','PAGADO','ESPERAR')
```
^ Missing 'PARCIAL'

#### Step 2: Apply Migration (If Needed)

**IMPORTANT:** This migration must be executed on the production database.

```bash
mysql -u [username] -p [database_name] < backend/src/scripts/fix_estatusdepago_enum.sql
```

Or directly in MySQL:

```sql
ALTER TABLE tblposcrumenwebventas 
MODIFY COLUMN estatusdepago ENUM('PENDIENTE', 'PAGADO', 'PARCIAL', 'ESPERAR') 
NOT NULL DEFAULT 'PENDIENTE';
```

#### Step 3: Verify Migration

Run the validation script again to confirm the change was applied correctly:

```bash
mysql -u [username] -p [database_name] < backend/src/scripts/validate_estatusdepago_schema.sql
```

Should display: `validation_status: OK: Column includes PARCIAL value`

### Migration Impact

- ✅ **No Downtime:** The ALTER TABLE migration is fast and doesn't require downtime
- ✅ **Backward Compatible:** Existing values ('PENDIENTE', 'PAGADO', 'ESPERAR') remain valid
- ✅ **No Data Loss:** Only adds a new allowed value to the ENUM
- ⚠️ **Warning:** Do NOT rollback this migration if records with `estatusdepago = 'PARCIAL'` already exist

### Rollback (Only if NO data with PARCIAL exists)

If you need to rollback the migration and are certain there are no records with `estatusdepago = 'PARCIAL'`:

```sql
ALTER TABLE tblposcrumenwebventas 
MODIFY COLUMN estatusdepago ENUM('PENDIENTE', 'PAGADO', 'ESPERAR') 
NOT NULL DEFAULT 'PENDIENTE';
```

### Frequently Asked Questions

**Q: Why does the error mention "Data truncated"?**  
A: MySQL attempts to insert the value 'PARCIAL' into an ENUM that only accepts 'PENDIENTE', 'PAGADO', 'ESPERAR'. Since the value is not in the list, MySQL generates this error.

**Q: Can I apply this migration at any time?**  
A: Yes, it's safe to apply at any time. It's a quick operation that only extends the allowed values.

**Q: What happens to existing records?**  
A: They are not modified. Only a new value is allowed for future records.

**Q: Do I need to restart the server after migration?**  
A: No, it's not necessary. The change is immediate in the database.

### Contact

If you have problems applying this migration, contact the development team with the following details:
- Result of the validation script
- Complete error message (if applicable)
- MySQL/MariaDB version
