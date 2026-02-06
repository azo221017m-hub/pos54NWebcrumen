-- Verification script for usuarioauditoria VARCHAR(100) implementation
-- This script verifies that the implementation matches the requirements

-- 1. Check the structure of tblposcrumenwebdetallemovimientos.usuarioauditoria
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'tblposcrumenwebdetallemovimientos'
  AND COLUMN_NAME = 'usuarioauditoria';

-- 2. Check the structure of tblposcrumenwebinsumos.usuarioauditoria
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'tblposcrumenwebinsumos'
  AND COLUMN_NAME = 'usuarioauditoria';

-- 3. Sample query to verify movements with negative quantities for SALIDA
SELECT 
    iddetallemovimiento,
    idinsumo,
    nombreinsumo,
    tipomovimiento,
    cantidad,
    referenciastock,
    usuarioauditoria,
    estatusmovimiento,
    fechamovimiento
FROM tblposcrumenwebdetallemovimientos
WHERE tipomovimiento = 'SALIDA'
  AND motivomovimiento = 'VENTA'
ORDER BY fechamovimiento DESC
LIMIT 10;

-- 4. Verify that PENDIENTE movements are being processed correctly
SELECT 
    COUNT(*) as pending_movements
FROM tblposcrumenwebdetallemovimientos
WHERE estatusmovimiento = 'PENDIENTE';

-- 5. Verify inventory updates after movements
SELECT 
    i.id_insumo,
    i.nombreinsumo,
    i.stock_actual,
    i.usuarioauditoria,
    i.fechamodificacionauditoria,
    (SELECT COUNT(*) 
     FROM tblposcrumenwebdetallemovimientos m 
     WHERE m.idinsumo = i.id_insumo 
       AND m.estatusmovimiento = 'PROCESADO') as processed_movements
FROM tblposcrumenwebinsumos i
WHERE i.usuarioauditoria IS NOT NULL
ORDER BY i.fechamodificacionauditoria DESC
LIMIT 10;
