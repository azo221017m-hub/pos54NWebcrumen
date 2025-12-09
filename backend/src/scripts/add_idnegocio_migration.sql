-- Migration script to add idnegocio column to legacy tables
-- This script adds idnegocio filtering capability to productos, ventas, and inventario tables
-- Run this script on the production database before deploying the updated controllers

-- =================================================================
-- Add idnegocio column to productos table
-- =================================================================
-- NOTE: DEFAULT 1 assumes there is a business with idNegocio=1
-- Update this default value if your primary business has a different ID
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
-- NOTE: DEFAULT 1 assumes there is a business with idNegocio=1
-- Update this default value if your primary business has a different ID
ALTER TABLE ventas 
ADD COLUMN idnegocio INT NOT NULL DEFAULT 1 AFTER metodo_pago;

-- Add index for better query performance
CREATE INDEX idx_ventas_idnegocio ON ventas(idnegocio);

-- =================================================================
-- Add idnegocio column to inventario table
-- =================================================================
-- NOTE: DEFAULT 1 assumes there is a business with idNegocio=1
-- Update this default value if your primary business has a different ID
ALTER TABLE inventario 
ADD COLUMN idnegocio INT NOT NULL DEFAULT 1 AFTER ultima_actualizacion;

-- Add index for better query performance
CREATE INDEX idx_inventario_idnegocio ON inventario(idnegocio);

-- =================================================================
-- Update existing records to set proper idnegocio
-- =================================================================
-- IMPORTANT: These are EXAMPLE queries. You MUST customize them based on 
-- your actual business logic and data relationships.
--
-- BEFORE running any UPDATE statements:
-- 1. Review your data to understand which records belong to which business
-- 2. Test the UPDATE query with a WHERE clause limiting to a few records
-- 3. Verify the results before running on the full dataset
--
-- The examples below assume you can determine the correct idnegocio
-- through relationships with other tables that already have this field.

-- === STEP 1: Analyze current data ===
-- Before updating, check the current distribution
SELECT 'productos_with_default' as status, COUNT(*) as count FROM productos WHERE idnegocio = 1;
SELECT 'ventas_with_default' as status, COUNT(*) as count FROM ventas WHERE idnegocio = 1;
SELECT 'inventario_with_default' as status, COUNT(*) as count FROM inventario WHERE idnegocio = 1;

-- === STEP 2: Determine update strategy ===
-- Check if you have relationships to determine the correct idnegocio

-- Option A: All existing data belongs to ONE business
-- If all your existing data belongs to business ID 1, no updates are needed
-- The DEFAULT value of 1 is already correct

-- Option B: Data belongs to MULTIPLE businesses - need to update based on relationships
-- Example 1: Update ventas based on the usuario who created them
-- UPDATE ventas v
-- INNER JOIN tblposcrumenwebusuarios u ON v.usuario_id = u.idUsuario
-- SET v.idnegocio = u.idNegocio
-- WHERE v.idnegocio = 1; -- Only update records still with default value

-- Example 2: Update productos based on their categoria
-- UPDATE productos p
-- INNER JOIN tblposcrumenwebcategorias c ON p.categoria_id = c.idCategoria  
-- SET p.idnegocio = c.idnegocio
-- WHERE p.idnegocio = 1; -- Only update records still with default value

-- Example 3: Update inventario based on the producto
-- Run this AFTER updating productos table
-- UPDATE inventario i
-- INNER JOIN productos p ON i.producto_id = p.id
-- SET i.idnegocio = p.idnegocio
-- WHERE i.idnegocio = 1; -- Only update records still with default value

-- === STEP 3: Verify updates ===
-- After updating, verify the distribution looks correct
-- SELECT 'productos' as tabla, idnegocio, COUNT(*) as count FROM productos GROUP BY idnegocio;
-- SELECT 'ventas' as tabla, idnegocio, COUNT(*) as count FROM ventas GROUP BY idnegocio;
-- SELECT 'inventario' as tabla, idnegocio, COUNT(*) as count FROM inventario GROUP BY idnegocio;

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
