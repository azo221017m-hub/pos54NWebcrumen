-- Migration: Add menudia column to tblposcrumenwebproductos
-- Date: 2026-01-27
-- Description: Adds menudia field to mark products as part of daily menu

ALTER TABLE tblposcrumenwebproductos
ADD COLUMN menudia TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Indica si el producto es parte del menú del día: 1=Sí, 0=No';

-- Add index for better query performance when filtering by menudia
CREATE INDEX idx_menudia ON tblposcrumenwebproductos(menudia);
