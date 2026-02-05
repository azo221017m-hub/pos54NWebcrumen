-- Migration script to add referencia column to tblposcrumenwebventas
-- This adds support for storing reference information like 'FONDO de CAJA'

-- Add referencia column if it doesn't exist
ALTER TABLE tblposcrumenwebventas 
ADD COLUMN IF NOT EXISTS referencia VARCHAR(255) NULL 
AFTER estatusdepago;

-- Verify the column was added
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'tblposcrumenwebventas' 
  AND COLUMN_NAME = 'referencia';
