-- Fix estatusdepago ENUM column to include 'PARCIAL' value
-- This script ensures the estatusdepago column accepts all required payment status values
-- 
-- Error being fixed:
--   Error: Data truncated for column 'estatusdepago' at row 1
--   code: 'WARN_DATA_TRUNCATED', errno: 1265
--
-- This migration adds 'PARCIAL' to the ENUM to support partial payment tracking

-- Show current state before migration
SELECT 'Current schema:' as step;
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'tblposcrumenwebventas' 
  AND COLUMN_NAME = 'estatusdepago';

-- Apply the migration
SELECT 'Applying migration...' as step;
ALTER TABLE tblposcrumenwebventas 
MODIFY COLUMN estatusdepago ENUM('PENDIENTE', 'PAGADO', 'PARCIAL', 'ESPERAR') 
NOT NULL DEFAULT 'PENDIENTE';

-- Verify the change was applied successfully
SELECT 'Migration complete. New schema:' as step;
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT,
       CASE 
         WHEN COLUMN_TYPE LIKE '%PARCIAL%' THEN 'SUCCESS: PARCIAL value is now included'
         ELSE 'ERROR: PARCIAL value is still missing'
       END as validation_result
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'tblposcrumenwebventas' 
  AND COLUMN_NAME = 'estatusdepago';

-- Expected result:
-- COLUMN_TYPE should be: enum('PENDIENTE','PAGADO','PARCIAL','ESPERAR')
-- validation_result should be: SUCCESS: PARCIAL value is now included
