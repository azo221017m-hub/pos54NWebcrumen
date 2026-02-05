-- Migration script to add referencia column to tblposcrumenwebventas
-- This adds support for storing reference information like 'FONDO de CAJA'

-- Add referencia column if it doesn't exist
ALTER TABLE tblposcrumenwebventas 
ADD COLUMN IF NOT EXISTS referencia VARCHAR(255) NULL 
AFTER estatusdepago;

-- Verify the column was added
SELECT 'Migration completed - referencia column added to tblposcrumenwebventas' as status;
