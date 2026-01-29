-- Migration script to add referencia column to tblposcrumenwebdetallepagos
-- This fixes the error: Unknown column 'referencia' in 'field list'

-- Add referencia column if it doesn't exist
ALTER TABLE tblposcrumenwebdetallepagos 
ADD COLUMN IF NOT EXISTS referencia VARCHAR(255) NULL 
AFTER formadepagodetalle;

-- Verify the column was added
SELECT 'Migration completed - referencia column added/verified' as status;
