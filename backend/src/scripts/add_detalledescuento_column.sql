-- Migration script to add detalledescuento column to tblposcrumenwebventas
-- This column stores the name/description of the discount applied to a sale

-- Add detalledescuento column if it does not exist (MySQL 8.0+)
ALTER TABLE tblposcrumenwebventas
ADD COLUMN IF NOT EXISTS detalledescuento VARCHAR(255) NULL DEFAULT NULL
AFTER descuentos;

-- Verify the column was added
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'tblposcrumenwebventas'
  AND COLUMN_NAME = 'detalledescuento';
