# Testing Guide for Referencia Column Fix

## Overview
This guide explains how to test the referencia column migration fix locally and in production.

## Prerequisites
- MySQL database access
- Node.js and npm installed
- Backend environment variables configured in `.env`

## Local Testing

### Step 1: Prepare Test Environment
```bash
# Navigate to backend directory
cd backend

# Ensure dependencies are installed
npm install

# Make sure .env is configured with database credentials
```

### Step 2: Check Current Database State
Before running the migration, check if the column exists:

```sql
USE bdcdttx;  -- or your database name
DESCRIBE tblposcrumenwebdetallepagos;
```

Look for the `referencia` column in the output.

### Step 3: Run Migration Script
```bash
npm run db:fix-referencia
```

Expected output if column doesn't exist:
```
🔄 Starting referencia column migration...

🔍 Checking current schema...
⚠️  referencia column NOT FOUND - applying migration...
📝 Found 1 SQL statements to execute

⏳ Executing statement 1/1...
✅ Statement 1 executed successfully

✅ Referencia column migration completed successfully!

🔍 Verifying migration...
✅ referencia column: EXISTS

🎉 Migration verified successfully!

📋 Column schema:
{
  "Field": "referencia",
  "Type": "varchar(255)",
  "Null": "YES",
  "Key": "",
  "Default": null,
  "Extra": ""
}

✅ Migration process completed
```

Expected output if column already exists:
```
🔄 Starting referencia column migration...

🔍 Checking current schema...
✅ referencia column already exists - no migration needed

✅ Migration process completed
```

### Step 4: Verify Database State
Check the table structure again:

```sql
DESCRIBE tblposcrumenwebdetallepagos;
```

You should see the `referencia` column:
```
+---------------------------+-----------------------------------------+------+-----+-------------------+
| Field                     | Type                                    | Null | Key | Default           |
+---------------------------+-----------------------------------------+------+-----+-------------------+
| ...                       | ...                                     | ...  | ... | ...               |
| formadepagodetalle        | enum('EFECTIVO','TARJETA','TRANSFERENCIA') | NO  |     | NULL              |
| referencia                | varchar(255)                            | YES  |     | NULL              |
| claveturno                | varchar(50)                             | YES  |     | NULL              |
| ...                       | ...                                     | ...  | ... | ...               |
+---------------------------+-----------------------------------------+------+-----+-------------------+
```

### Step 5: Test Payment Functionality
Try creating a mixed payment with TRANSFERENCIA:

```bash
# Use curl or Postman to test the API endpoint
curl -X POST http://localhost:3000/api/pagos/pago-mixto \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idventa": 123,
    "detallesPagos": [
      {
        "formadepagodetalle": "TRANSFERENCIA",
        "totaldepago": 150.00,
        "referencia": "REF123456789"
      },
      {
        "formadepagodetalle": "EFECTIVO",
        "totaldepago": 50.00
      }
    ]
  }'
```

Expected result: Payment should process successfully without the "Unknown column 'referencia'" error.

## Production Testing (Render)

### Step 1: Access Production Database
Connect to the Azure MySQL database using the credentials from Render environment variables:

```bash
mysql -h crumenprod01.mysql.database.azure.com \
      -u azavala \
      -p \
      bdcdttx
```

### Step 2: Check Current State
```sql
DESCRIBE tblposcrumenwebdetallepagos;
```

### Step 3: Apply Migration
There are two options:

#### Option A: Run SQL Directly
```sql
ALTER TABLE tblposcrumenwebdetallepagos 
ADD COLUMN IF NOT EXISTS referencia VARCHAR(255) NULL 
AFTER formadepagodetalle;
```

#### Option B: Deploy and Run Script (Preferred)
1. Push the changes to GitHub (already done in this PR)
2. Render will auto-deploy the new backend version
3. SSH into Render instance or use Render shell
4. Run: `npm run db:fix-referencia`

### Step 4: Verify in Production
After applying the migration, test with a real payment transaction in the production application.

## Rollback Plan
If you need to remove the column (not recommended unless absolutely necessary):

```sql
ALTER TABLE tblposcrumenwebdetallepagos 
DROP COLUMN IF EXISTS referencia;
```

**Note**: This will remove the column and any data stored in it. Only use if the migration causes issues.

## Common Issues and Solutions

### Issue: "Table 'tblposcrumenwebdetallepagos' doesn't exist"
**Solution**: The payment details table needs to be created first. Run:
```bash
npm run db:fix-referencia
```
This will create the table if it doesn't exist.

### Issue: "Access denied" when running migration
**Solution**: Check that your `.env` file has the correct database credentials.

### Issue: Migration runs but column still not found
**Solution**: 
1. Verify you're connected to the correct database
2. Check for typos in table name
3. Run `DESCRIBE tblposcrumenwebdetallepagos;` to see actual structure

## Success Criteria
✅ Migration script runs without errors
✅ Column `referencia` exists in `tblposcrumenwebdetallepagos` table
✅ Column allows NULL values
✅ Mixed payments with TRANSFERENCIA work correctly
✅ Reference number is saved when provided
✅ No errors in application logs

## Additional Verification Queries

### Check if any existing payments have referencia data:
```sql
SELECT COUNT(*) as total_payments,
       COUNT(referencia) as payments_with_ref
FROM tblposcrumenwebdetallepagos;
```

### View recent payments with references:
```sql
SELECT idfolioventa, formadepagodetalle, totaldepago, referencia, fechadepago
FROM tblposcrumenwebdetallepagos
WHERE referencia IS NOT NULL
ORDER BY fechadepago DESC
LIMIT 10;
```
