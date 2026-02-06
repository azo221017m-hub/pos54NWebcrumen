-- SQL queries to verify inventory movement tracking implementation
-- These queries can be run after testing to verify the feature works correctly

-- 1. Check if the tblposcrumenwebdetallemovimientos table was created
SELECT 
    TABLE_NAME,
    ENGINE,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'tblposcrumenwebdetallemovimientos';

-- 2. Verify table structure
DESCRIBE tblposcrumenwebdetallemovimientos;

-- 3. Check for any movement records (should be empty initially)
SELECT COUNT(*) as total_movements
FROM tblposcrumenwebdetallemovimientos;

-- 4. After creating a test sale with recipe products, verify movements were created
-- Replace {test_idventa} with actual sale ID from your test
SELECT 
    dm.iddetallemovimiento,
    dm.nombreinsumo,
    dm.tipoinsumo,
    dm.tipomovimiento,
    dm.motivomovimiento,
    dm.cantidad,
    dm.referenciastock,
    dm.unidadmedida,
    dm.precio,
    dm.costo,
    dm.idreferencia as idventa,
    dm.estatusmovimiento,
    dm.fechamovimiento,
    dm.fecharegistro
FROM tblposcrumenwebdetallemovimientos dm
WHERE dm.idreferencia = {test_idventa}
ORDER BY dm.iddetallemovimiento;

-- 5. Verify that sale details were marked as processed
-- Replace {test_idventa} with actual sale ID from your test
SELECT 
    dv.iddetalleventa,
    dv.nombreproducto,
    dv.cantidad,
    dv.afectainventario,
    dv.tipoafectacion,
    dv.inventarioprocesado,
    dv.estadodetalle
FROM tblposcrumenwebdetalleventas dv
WHERE dv.idventa = {test_idventa}
ORDER BY dv.iddetalleventa;

-- 6. Verify recipe details used for the movements
-- Replace {test_idreceta} with actual recipe ID from your test product
SELECT 
    dr.idDetalleReceta,
    dr.dtlRecetaId as idReceta,
    dr.nombreinsumo,
    dr.idreferencia as idinsumo,
    dr.umInsumo,
    dr.cantidadUso,
    dr.costoInsumo,
    i.stock_actual,
    i.precio_venta,
    i.costo_promedio_ponderado
FROM tblposcrumenwebdetallerecetas dr
LEFT JOIN tblposcrumenwebinsumos i ON dr.idreferencia = i.id_insumo
WHERE dr.dtlRecetaId = {test_idreceta}
  AND dr.idnegocio = {test_idnegocio}
ORDER BY dr.idDetalleReceta;

-- 7. Complete audit trail for a sale with movements
-- Replace {test_idventa} with actual sale ID from your test
SELECT 
    'VENTA' as tipo,
    v.idventa as id,
    v.folioventa,
    v.estadodeventa,
    v.fechadeventa,
    v.totaldeventa,
    NULL as nombreproducto,
    NULL as cantidad,
    NULL as nombreinsumo
FROM tblposcrumenwebventas v
WHERE v.idventa = {test_idventa}

UNION ALL

SELECT 
    'DETALLE' as tipo,
    dv.iddetalleventa as id,
    NULL as folioventa,
    dv.estadodetalle as estadodeventa,
    dv.fechadetalleventa as fechadeventa,
    dv.total as totaldeventa,
    dv.nombreproducto,
    dv.cantidad,
    NULL as nombreinsumo
FROM tblposcrumenwebdetalleventas dv
WHERE dv.idventa = {test_idventa}

UNION ALL

SELECT 
    'MOVIMIENTO' as tipo,
    dm.iddetallemovimiento as id,
    NULL as folioventa,
    dm.estatusmovimiento as estadodeventa,
    dm.fechamovimiento as fechadeventa,
    NULL as totaldeventa,
    NULL as nombreproducto,
    dm.cantidad,
    dm.nombreinsumo
FROM tblposcrumenwebdetallemovimientos dm
WHERE dm.idreferencia = {test_idventa}

ORDER BY tipo, id;

-- 8. Check for unprocessed recipe-based details (should find records before PRODUCIR is pressed)
-- These are candidates for movement creation
SELECT 
    dv.iddetalleventa,
    dv.idventa,
    v.folioventa,
    dv.nombreproducto,
    dv.cantidad,
    dv.afectainventario,
    dv.tipoafectacion,
    dv.inventarioprocesado,
    dv.estadodetalle
FROM tblposcrumenwebdetalleventas dv
INNER JOIN tblposcrumenwebventas v ON dv.idventa = v.idventa
WHERE dv.afectainventario = 1
  AND dv.tipoafectacion = 'RECETA'
  AND dv.inventarioprocesado = 0
  AND dv.idnegocio = {test_idnegocio}
ORDER BY dv.idventa DESC, dv.iddetalleventa;

-- 9. Summary statistics after testing
SELECT 
    dm.motivomovimiento,
    dm.estatusmovimiento,
    COUNT(*) as total_movements,
    SUM(dm.cantidad) as total_quantity,
    COUNT(DISTINCT dm.idreferencia) as unique_sales
FROM tblposcrumenwebdetallemovimientos dm
WHERE dm.idnegocio = {test_idnegocio}
GROUP BY dm.motivomovimiento, dm.estatusmovimiento
ORDER BY dm.motivomovimiento, dm.estatusmovimiento;

-- 10. Verify no duplicate movements were created
-- This query finds any potential duplicates (should return 0 rows)
SELECT 
    dm.idreferencia as idventa,
    dm.idinsumo,
    dm.nombreinsumo,
    COUNT(*) as duplicate_count
FROM tblposcrumenwebdetallemovimientos dm
WHERE dm.motivomovimiento = 'VENTA'
  AND dm.idnegocio = {test_idnegocio}
GROUP BY dm.idreferencia, dm.idinsumo, dm.nombreinsumo
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;
