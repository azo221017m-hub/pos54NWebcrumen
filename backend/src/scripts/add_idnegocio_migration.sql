-- Migration script to add idnegocio column to legacy tables
-- This script adds idnegocio filtering capability to productos, ventas, and inventario tables
-- Run this script on the production database before deploying the updated controllers

-- =================================================================
-- Add idnegocio column to productos table
-- =================================================================
ALTER TABLE productos 
ADD COLUMN idnegocio INT NOT NULL DEFAULT 1 AFTER activo;

-- Add foreign key constraint (optional, uncomment if negocios table structure supports it)
-- ALTER TABLE productos
-- ADD CONSTRAINT fk_productos_negocio FOREIGN KEY (idnegocio) REFERENCES tblposcrumenwebnegocio(idNegocio);

-- Add index for better query performance
CREATE INDEX idx_productos_idnegocio ON productos(idnegocio);

-- =================================================================
-- Add idnegocio column to categorias table (if it exists as separate table)
-- =================================================================
-- Check if categorias table exists before running this
-- ALTER TABLE categorias 
-- ADD COLUMN idnegocio INT NOT NULL DEFAULT 1 AFTER activo;

-- CREATE INDEX idx_categorias_idnegocio ON categorias(idnegocio);

-- =================================================================
-- Add idnegocio column to ventas table
-- =================================================================
ALTER TABLE ventas 
ADD COLUMN idnegocio INT NOT NULL DEFAULT 1 AFTER metodo_pago;

-- Add index for better query performance
CREATE INDEX idx_ventas_idnegocio ON ventas(idnegocio);

-- =================================================================
-- Add idnegocio column to inventario table
-- =================================================================
ALTER TABLE inventario 
ADD COLUMN idnegocio INT NOT NULL DEFAULT 1 AFTER ultima_actualizacion;

-- Add index for better query performance
CREATE INDEX idx_inventario_idnegocio ON inventario(idnegocio);

-- =================================================================
-- Update existing records to set proper idnegocio
-- =================================================================
-- IMPORTANT: Update these queries based on your business logic
-- The examples below assume a default negocio with ID=1
-- You may need to update based on relationships with other tables

-- Option 1: Set all to default negocio (simplest, may not be correct)
-- UPDATE productos SET idnegocio = 1;
-- UPDATE ventas SET idnegocio = 1;
-- UPDATE inventario SET idnegocio = 1;

-- Option 2: Update based on relationships (more accurate)
-- Example: Update ventas based on usuario's negocio
-- UPDATE ventas v
-- INNER JOIN tblposcrumenwebusuarios u ON v.usuario_id = u.idUsuario
-- SET v.idnegocio = u.idNegocio;

-- Example: Update productos based on categoria's negocio
-- UPDATE productos p
-- INNER JOIN tblposcrumenwebcategorias c ON p.categoria_id = c.idCategoria
-- SET p.idnegocio = c.idnegocio;

-- Example: Update inventario based on producto's negocio (after productos is updated)
-- UPDATE inventario i
-- INNER JOIN productos p ON i.producto_id = p.id
-- SET i.idnegocio = p.idnegocio;

-- =================================================================
-- Verification queries
-- =================================================================
-- Run these to verify the migration was successful

-- Check if columns were added
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'bdcdttx'
    AND COLUMN_NAME = 'idnegocio'
    AND TABLE_NAME IN ('productos', 'ventas', 'inventario');

-- Check data distribution
SELECT 'productos' as tabla, idnegocio, COUNT(*) as registros
FROM productos
GROUP BY idnegocio
UNION ALL
SELECT 'ventas' as tabla, idnegocio, COUNT(*) as registros
FROM ventas
GROUP BY idnegocio
UNION ALL
SELECT 'inventario' as tabla, idnegocio, COUNT(*) as registros
FROM inventario
GROUP BY idnegocio;
