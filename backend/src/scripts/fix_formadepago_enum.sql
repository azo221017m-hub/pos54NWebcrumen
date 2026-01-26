-- Fix formadepago ENUM column to include 'sinFP' value
-- This script ensures the formadepago column accepts all required payment form values

-- Check current ENUM definition and update if needed
-- This will modify the column to include all valid values including 'sinFP'

ALTER TABLE tblposcrumenwebventas 
MODIFY COLUMN formadepago ENUM('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'MIXTO', 'sinFP') NOT NULL;

-- Verify the change
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'tblposcrumenwebventas' 
AND COLUMN_NAME = 'formadepago';
