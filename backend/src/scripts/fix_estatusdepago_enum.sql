-- Fix estatusdepago ENUM column to include 'PARCIAL' value
-- This script ensures the estatusdepago column accepts all required payment status values

-- Check current ENUM definition and update if needed
-- This will modify the column to include all valid values including 'PARCIAL'

ALTER TABLE tblposcrumenwebventas 
MODIFY COLUMN estatusdepago ENUM('PENDIENTE', 'PAGADO', 'PARCIAL', 'ESPERAR') NOT NULL DEFAULT 'PENDIENTE';

-- Verify the change
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'tblposcrumenwebventas' 
AND COLUMN_NAME = 'estatusdepago';
