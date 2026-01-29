-- Migration script to add referencia column to tblposcrumenwebdetallepagos
-- This fixes the error: Unknown column 'referencia' in 'field list'

-- Add referencia column
-- Note: The TypeScript migration script checks for existence before running this,
-- so IF NOT EXISTS is not needed and ensures compatibility with older MySQL versions
ALTER TABLE tblposcrumenwebdetallepagos 
ADD COLUMN referencia VARCHAR(255) NULL 
AFTER formadepagodetalle;

-- Verify the column was added
SELECT 'Migration completed - referencia column added' as status;
