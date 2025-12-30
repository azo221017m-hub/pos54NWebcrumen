-- Migration script to validate and update tblposcrumenwebdetalleventas schema
-- This ensures the table matches the requirements from the problem statement

-- Verify and update the estadodetalle enum to include all required values
ALTER TABLE tblposcrumenwebdetalleventas 
MODIFY COLUMN estadodetalle ENUM('ESPERAR','ORDENADO','CANCELADO','DEVUELTO','PREPARACION','COBRADO') 
NOT NULL DEFAULT 'ORDENADO'
COMMENT 'Estado actual del detalle de venta';

-- Verify and update the tipoafectacion enum to match database requirements
-- DIRECTO: Finished products without recipe (default)
-- INVENTARIO: Raw materials/inventory items
-- RECETA: Products made from recipes
ALTER TABLE tblposcrumenwebdetalleventas 
MODIFY COLUMN tipoafectacion ENUM('DIRECTO','INVENTARIO','RECETA') 
NOT NULL DEFAULT 'DIRECTO'
COMMENT 'Tipo de afectación al inventario: DIRECTO=producto terminado, INVENTARIO=materia prima, RECETA=producto con receta';

-- Ensure moderadores column exists (should have been added by previous migration)
-- This is idempotent - won't fail if column already exists
ALTER TABLE tblposcrumenwebdetalleventas
ADD COLUMN IF NOT EXISTS moderadores LONGTEXT NULL
COMMENT 'Comma-separated IDs of moderadores selected for this product'
AFTER observaciones;

-- Verify all other required columns exist with correct types
-- Note: These are verification comments to check manually if needed

-- Expected schema for tblposcrumenwebdetalleventas:
-- iddetalleventa bigint(20) UN AI PK 
-- idventa bigint(20) UN 
-- idproducto bigint(20) UN 
-- nombreproducto varchar(200) 
-- idreceta bigint(20) UN 
-- cantidad decimal(10,3) 
-- preciounitario decimal(12,2) 
-- costounitario decimal(12,4) 
-- subtotal decimal(12,2) 
-- descuento decimal(12,2) 
-- impuesto decimal(12,2) 
-- total decimal(12,2) 
-- afectainventario tinyint(1) 
-- tipoafectacion enum('DIRECTO','INVENTARIO','RECETA') 
-- inventarioprocesado tinyint(1) 
-- fechadetalleventa datetime 
-- estadodetalle enum('ESPERAR','ORDENADO','CANCELADO','DEVUELTO','PREPARACION','COBRADO') 
-- moderadores longtext 
-- observaciones text 
-- idnegocio int(20) 
-- usuarioauditoria varchar(80) 
-- fechamodificacionauditoria datetime

-- Add indexes for better query performance on estado queries
CREATE INDEX IF NOT EXISTS idx_estadodetalle ON tblposcrumenwebdetalleventas(estadodetalle);
CREATE INDEX IF NOT EXISTS idx_fechadetalleventa ON tblposcrumenwebdetalleventas(fechadetalleventa);
CREATE INDEX IF NOT EXISTS idx_idventa_estadodetalle ON tblposcrumenwebdetalleventas(idventa, estadodetalle);

-- Update table comment
ALTER TABLE tblposcrumenwebdetalleventas 
COMMENT = 'Detalle de ventas web con información de productos, recetas, costos, moderadores y estados de preparación';
