-- Migration: add logrometa column to tblposcrumenwebturnos
-- logrometa stores achievement % = (totalventas / metaturno) * 100 at shift close
ALTER TABLE tblposcrumenwebturnos
ADD COLUMN IF NOT EXISTS logrometa DECIMAL(5,2) NULL DEFAULT NULL
AFTER metaturno;
