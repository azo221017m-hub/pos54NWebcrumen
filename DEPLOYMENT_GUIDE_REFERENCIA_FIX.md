# Deployment Guide: Referencia Column Fix

## Executive Summary
This deployment adds the missing `referencia` column to the `tblposcrumenwebdetallepagos` table to fix the payment processing error in production.

**Estimated Downtime**: None (can be applied without service interruption)  
**Risk Level**: Low (only adds a column, no data changes)  
**Rollback Available**: Yes

---

## Pre-Deployment Checklist

- [ ] Code review completed and approved
- [ ] Security scan passed (CodeQL)
- [ ] Documentation reviewed
- [ ] Testing guide prepared
- [ ] Backup of production database taken
- [ ] Rollback plan documented
- [ ] Stakeholders notified

---

## Deployment Steps

### Step 1: Merge PR to Main Branch
```bash
# In GitHub, merge the PR
# This will trigger auto-deployment to Render
```

### Step 2: Wait for Render Auto-Deploy
- Render will automatically detect the merge and deploy the new backend version
- Monitor the deployment in Render Dashboard
- Check deployment logs for any errors

### Step 3: Run Database Migration

#### Option A: Using Render Shell (Recommended)
```bash
# 1. Open Render Dashboard
# 2. Navigate to the backend service
# 3. Open "Shell" tab
# 4. Run the migration command:
npm run db:fix-referencia
```

Expected output:
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
```

#### Option B: Direct Database Connection
```bash
# Connect to Azure MySQL
mysql -h crumenprod01.mysql.database.azure.com \
      -u azavala \
      -p \
      bdcdttx

# Check if column exists
DESCRIBE tblposcrumenwebdetallepagos;

# If referencia column is missing, add it
ALTER TABLE tblposcrumenwebdetallepagos 
ADD COLUMN referencia VARCHAR(255) NULL 
AFTER formadepagodetalle;

# Verify
DESCRIBE tblposcrumenwebdetallepagos;
```

### Step 4: Verify Deployment

#### A. Check Application Logs
```bash
# In Render Dashboard, check logs for:
# - No startup errors
# - Normal operation resumed
# - No SQL errors
```

#### B. Test Payment Functionality
1. Open the POS application
2. Create a test sale
3. Process a mixed payment with TRANSFERENCIA
4. Verify no errors occur
5. Check database to confirm payment was recorded with reference number

#### C. Database Verification
```sql
-- Check table structure
DESCRIBE tblposcrumenwebdetallepagos;

-- Check recent payments
SELECT idfolioventa, formadepagodetalle, totaldepago, referencia, fechadepago
FROM tblposcrumenwebdetallepagos
ORDER BY fechadepago DESC
LIMIT 10;
```

---

## Post-Deployment Validation

### Success Criteria
✅ Migration script executed without errors  
✅ Column `referencia` exists in table  
✅ Application starts normally  
✅ Test payment with TRANSFERENCIA works  
✅ Reference number is saved correctly  
✅ No errors in application logs  

### Monitoring (First 24 Hours)
- [ ] Monitor error logs for payment-related errors
- [ ] Check that mixed payments are processing successfully
- [ ] Verify reference numbers are being saved
- [ ] Monitor database performance (should be unaffected)

---

## Rollback Plan

If issues occur, follow these steps:

### Step 1: Assess the Issue
- Determine if the issue is caused by the column addition
- Check logs for specific error messages
- Verify the problem is not pre-existing

### Step 2: Rollback Database (If Necessary)
⚠️ **Only if the column addition causes issues**

```sql
-- Connect to production database
mysql -h crumenprod01.mysql.database.azure.com -u azavala -p bdcdttx

-- Remove the column
ALTER TABLE tblposcrumenwebdetallepagos DROP COLUMN referencia;

-- Verify
DESCRIBE tblposcrumenwebdetallepagos;
```

### Step 3: Rollback Code (If Necessary)
```bash
# In GitHub, revert the merge commit
# Or manually deploy previous version in Render
```

### Step 4: Notify Stakeholders
- Document what went wrong
- Explain rollback actions taken
- Plan remediation strategy

---

## Troubleshooting

### Issue: Migration script fails with "Table doesn't exist"
**Cause**: The `tblposcrumenwebdetallepagos` table hasn't been created  
**Solution**: 
```bash
# First create the table
cd backend
ts-node src/scripts/applyPaymentMigration.ts

# Then run the referencia migration
npm run db:fix-referencia
```

### Issue: Migration script fails with "Column already exists"
**Cause**: The column was already added manually or in a previous attempt  
**Solution**: This is not an error. The migration script will detect this and skip the addition.

### Issue: "Access denied" error
**Cause**: Database user doesn't have ALTER TABLE privileges  
**Solution**: Contact database administrator to grant necessary permissions

### Issue: Application still shows "Unknown column" error after migration
**Cause**: 
1. Migration didn't actually complete successfully
2. Connected to wrong database
3. Application cache needs to be cleared

**Solution**:
```bash
# 1. Verify column exists
mysql> DESCRIBE tblposcrumenwebdetallepagos;

# 2. Restart the application
# In Render Dashboard: Manual Deploy > Redeploy

# 3. Clear application cache if applicable
```

---

## Communication Plan

### Before Deployment
**To**: Development team, stakeholders  
**Message**: "We will be deploying a database fix for payment processing at [TIME]. No downtime expected. Migration adds a missing column to support payment references."

### During Deployment
**To**: Monitoring team  
**Message**: "Deployment in progress. Please monitor payment processing and alert if any issues occur."

### After Deployment
**To**: All stakeholders  
**Message**: "Deployment completed successfully. Payment processing fix is now live. Mixed payments with TRANSFERENCIA will now save reference numbers correctly."

---

## Timeline

| Step | Duration | Notes |
|------|----------|-------|
| Merge PR | 1 min | Automated |
| Render Auto-Deploy | 5-10 min | Automated |
| Run Migration | 1-2 min | Manual via Render Shell |
| Verification | 5 min | Manual testing |
| **Total** | **~15 min** | Active work |
| Monitoring | 24 hours | Passive |

---

## Contact Information

**If Issues Occur**:
- Check deployment logs in Render Dashboard
- Refer to troubleshooting section above
- Review error logs for specific error messages
- Contact database administrator if needed

---

## Notes

- This is a **low-risk** deployment
- The migration is **idempotent** (safe to run multiple times)
- **No downtime** required
- **No data loss** risk
- Column allows NULL, so backwards compatible with existing code
- Can be deployed during business hours

---

**Deployment Date**: _____________  
**Deployed By**: _____________  
**Verification By**: _____________  
**Status**: [ ] Success [ ] Rolled Back [ ] Partial Success
