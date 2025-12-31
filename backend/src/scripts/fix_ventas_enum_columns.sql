-- Migration script to fix ENUM columns in tblposcrumenwebventas
-- This fixes the data truncation errors for formadepago and estadodeventa columns

-- ============================================================================
-- Fix estadodeventa ENUM column
-- ============================================================================
-- Update the estadodeventa column to include all required values
-- Values from TypeScript: 'SOLICITADO' | 'LEIDO' | 'PREPARANDO' | 'EN_CAMINO' | 
--                         'ENTREGADO' | 'CANCELADO' | 'DEVUELTO' | 'COBRADO' | 
--                         'ESPERAR' | 'ORDENADO'

ALTER TABLE tblposcrumenwebventas 
MODIFY COLUMN estadodeventa ENUM(
    'SOLICITADO',   -- Initial state when order is requested
    'LEIDO',        -- Order has been read/acknowledged
    'ESPERAR',      -- Order is on hold/waiting
    'ORDENADO',     -- Order has been placed/confirmed
    'PREPARANDO',   -- Order is being prepared
    'EN_CAMINO',    -- Order is on the way (delivery)
    'ENTREGADO',    -- Order has been delivered
    'CANCELADO',    -- Order has been cancelled
    'DEVUELTO',     -- Order has been returned
    'COBRADO'       -- Order has been paid/charged
) NOT NULL DEFAULT 'SOLICITADO'
COMMENT 'Estado actual de la venta web';

-- ============================================================================
-- Fix formadepago ENUM column
-- ============================================================================
-- Update the formadepago column to include all required values
-- Values from TypeScript: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'MIXTO' | 'sinFP'

ALTER TABLE tblposcrumenwebventas 
MODIFY COLUMN formadepago ENUM(
    'EFECTIVO',      -- Cash payment
    'TARJETA',       -- Card payment (credit/debit)
    'TRANSFERENCIA', -- Bank transfer
    'MIXTO',         -- Mixed payment (multiple methods)
    'sinFP'          -- Without payment method (to be determined)
) NOT NULL DEFAULT 'sinFP'
COMMENT 'Forma de pago de la venta';

-- ============================================================================
-- Fix estatusdepago ENUM column (if needed)
-- ============================================================================
-- Update the estatusdepago column to ensure it has all required values
-- Values from TypeScript: 'PENDIENTE' | 'PAGADO' | 'PARCIAL'

ALTER TABLE tblposcrumenwebventas 
MODIFY COLUMN estatusdepago ENUM(
    'PENDIENTE',  -- Payment is pending
    'PAGADO',     -- Payment is complete
    'PARCIAL'     -- Partial payment received
) NOT NULL DEFAULT 'PENDIENTE'
COMMENT 'Estado del pago de la venta';

-- ============================================================================
-- Fix tipodeventa ENUM column (if needed)
-- ============================================================================
-- Update the tipodeventa column to ensure it has all required values
-- Values from TypeScript: 'DOMICILIO' | 'LLEVAR' | 'MESA' | 'ONLINE'

ALTER TABLE tblposcrumenwebventas 
MODIFY COLUMN tipodeventa ENUM(
    'DOMICILIO',  -- Delivery order
    'LLEVAR',     -- Takeout order
    'MESA',       -- Dine-in (table) order
    'ONLINE'      -- Online order
) NOT NULL DEFAULT 'MESA'
COMMENT 'Tipo de venta web';

-- ============================================================================
-- Verification queries
-- ============================================================================
-- Run these to verify the migration was successful

-- Check the updated column definitions
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    COLUMN_DEFAULT,
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tblposcrumenwebventas'
    AND COLUMN_NAME IN ('estadodeventa', 'formadepago', 'estatusdepago', 'tipodeventa')
ORDER BY COLUMN_NAME;

-- Verify existing data is still valid (this should return 0 rows if all data is valid)
-- If any rows are returned, those records have invalid ENUM values and need to be fixed manually
SELECT 
    idventa,
    estadodeventa,
    formadepago,
    estatusdepago,
    tipodeventa
FROM tblposcrumenwebventas
WHERE estadodeventa NOT IN ('SOLICITADO', 'LEIDO', 'ESPERAR', 'ORDENADO', 'PREPARANDO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO', 'DEVUELTO', 'COBRADO')
    OR formadepago NOT IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'MIXTO', 'sinFP')
    OR estatusdepago NOT IN ('PENDIENTE', 'PAGADO', 'PARCIAL')
    OR tipodeventa NOT IN ('DOMICILIO', 'LLEVAR', 'MESA', 'ONLINE')
LIMIT 10;

-- Show summary of values currently in use
SELECT 'estadodeventa' as column_name, estadodeventa as value, COUNT(*) as count
FROM tblposcrumenwebventas
GROUP BY estadodeventa
UNION ALL
SELECT 'formadepago', formadepago, COUNT(*)
FROM tblposcrumenwebventas
GROUP BY formadepago
UNION ALL
SELECT 'estatusdepago', estatusdepago, COUNT(*)
FROM tblposcrumenwebventas
GROUP BY estatusdepago
UNION ALL
SELECT 'tipodeventa', tipodeventa, COUNT(*)
FROM tblposcrumenwebventas
GROUP BY tipodeventa;
