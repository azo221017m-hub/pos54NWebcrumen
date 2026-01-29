-- Validation script for estatusdepago ENUM column
-- This script checks if the estatusdepago column has the correct ENUM values including 'PARCIAL'

-- Check current ENUM definition
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    CASE 
        WHEN COLUMN_TYPE LIKE '%PARCIAL%' THEN 'OK: Column includes PARCIAL value'
        ELSE 'ERROR: Column does NOT include PARCIAL value - Migration needed!'
    END as validation_status
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'tblposcrumenwebventas' 
  AND COLUMN_NAME = 'estatusdepago';

-- Expected result should show:
-- COLUMN_TYPE: enum('PENDIENTE','PAGADO','PARCIAL','ESPERAR')
-- If PARCIAL is missing, run: backend/src/scripts/fix_estatusdepago_enum.sql
