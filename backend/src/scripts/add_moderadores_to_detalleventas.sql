-- Migration to add moderadores column to tblposcrumenwebdetalleventas
-- This column will store comma-separated IDs of moderadores selected for each product

ALTER TABLE tblposcrumenwebdetalleventas
ADD COLUMN IF NOT EXISTS moderadores LONGTEXT NULL
COMMENT 'Comma-separated IDs of moderadores (from tblposcrumenwebmoderadores) selected for this product'
AFTER observaciones;

-- Update comment for the table to reflect the new column
ALTER TABLE tblposcrumenwebdetalleventas 
COMMENT = 'Detalle de ventas web con información de productos, recetas, costos y moderadores';
