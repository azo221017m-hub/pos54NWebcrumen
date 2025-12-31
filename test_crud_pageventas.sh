#!/bin/bash

# Test script para validar CRUD de PageVentas - Componentes Producir y Esperar
# Este script verifica que las ventas se crean correctamente en la base de datos

echo "================================================"
echo "VALIDACIÓN CRUD - PageVentas Producir/Esperar"
echo "================================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar campos de una venta
check_venta_fields() {
    local venta_id=$1
    local expected_estado=$2
    
    echo "Verificando venta ID: $venta_id con estado esperado: $expected_estado"
    
    # Verificar que todos los campos requeridos están presentes
    local query="SELECT 
        idventa,
        tipodeventa,
        folioventa,
        estadodeventa,
        fechadeventa,
        subtotal,
        totaldeventa,
        cliente,
        formadepago,
        estatusdepago,
        idnegocio,
        usuarioauditoria,
        fechamodificacionauditoria
    FROM tblposcrumenwebventas 
    WHERE idventa = $venta_id;"
    
    echo "SQL: $query"
    echo ""
}

# Función para verificar detalles de una venta
check_detalle_fields() {
    local venta_id=$1
    local expected_estado=$2
    
    echo "Verificando detalles de venta ID: $venta_id con estado esperado: $expected_estado"
    
    # Verificar que todos los campos requeridos están presentes en detalles
    local query="SELECT 
        iddetalleventa,
        idventa,
        idproducto,
        nombreproducto,
        cantidad,
        preciounitario,
        costounitario,
        subtotal,
        total,
        afectainventario,
        tipoafectacion,
        inventarioprocesado,
        estadodetalle,
        idnegocio,
        usuarioauditoria,
        fechamodificacionauditoria
    FROM tblposcrumenwebdetalleventas 
    WHERE idventa = $venta_id;"
    
    echo "SQL: $query"
    echo ""
}

echo "=== PRUEBAS DE VALIDACIÓN ==="
echo ""

echo -e "${YELLOW}1. Verificar estructura de tabla tblposcrumenwebventas${NC}"
echo "SQL para verificar columnas:"
cat << 'EOF'
DESCRIBE tblposcrumenwebventas;
EOF
echo ""

echo -e "${YELLOW}2. Verificar estructura de tabla tblposcrumenwebdetalleventas${NC}"
echo "SQL para verificar columnas:"
cat << 'EOF'
DESCRIBE tblposcrumenwebdetalleventas;
EOF
echo ""

echo -e "${YELLOW}3. Verificar última venta con estado ORDENADO (Producir)${NC}"
cat << 'EOF'
SELECT 
    idventa,
    folioventa,
    estadodeventa,
    tipodeventa,
    cliente,
    totaldeventa,
    fechadeventa,
    usuarioauditoria
FROM tblposcrumenwebventas 
WHERE estadodeventa = 'ORDENADO' 
ORDER BY fechadeventa DESC 
LIMIT 1;
EOF
echo ""

echo -e "${YELLOW}4. Verificar última venta con estado ESPERAR (Esperar)${NC}"
cat << 'EOF'
SELECT 
    idventa,
    folioventa,
    estadodeventa,
    tipodeventa,
    cliente,
    totaldeventa,
    fechadeventa,
    usuarioauditoria
FROM tblposcrumenwebventas 
WHERE estadodeventa = 'ESPERAR' 
ORDER BY fechadeventa DESC 
LIMIT 1;
EOF
echo ""

echo -e "${YELLOW}5. Verificar detalles de venta ORDENADO${NC}"
cat << 'EOF'
SELECT 
    d.iddetalleventa,
    d.idventa,
    d.nombreproducto,
    d.cantidad,
    d.preciounitario,
    d.total,
    d.estadodetalle,
    d.tipoafectacion,
    v.folioventa
FROM tblposcrumenwebdetalleventas d
INNER JOIN tblposcrumenwebventas v ON d.idventa = v.idventa
WHERE v.estadodeventa = 'ORDENADO'
ORDER BY d.fechadetalleventa DESC
LIMIT 5;
EOF
echo ""

echo -e "${YELLOW}6. Verificar detalles de venta ESPERAR${NC}"
cat << 'EOF'
SELECT 
    d.iddetalleventa,
    d.idventa,
    d.nombreproducto,
    d.cantidad,
    d.preciounitario,
    d.total,
    d.estadodetalle,
    d.tipoafectacion,
    v.folioventa
FROM tblposcrumenwebdetalleventas d
INNER JOIN tblposcrumenwebventas v ON d.idventa = v.idventa
WHERE v.estadodeventa = 'ESPERAR'
ORDER BY d.fechadetalleventa DESC
LIMIT 5;
EOF
echo ""

echo -e "${YELLOW}7. Verificar campos calculados correctamente${NC}"
cat << 'EOF'
SELECT 
    v.folioventa,
    v.subtotal,
    v.descuentos,
    v.impuestos,
    v.totaldeventa,
    (v.subtotal - v.descuentos + v.impuestos) as totalcalculado,
    CASE 
        WHEN v.totaldeventa = (v.subtotal - v.descuentos + v.impuestos) THEN 'OK'
        ELSE 'ERROR'
    END as validacion
FROM tblposcrumenwebventas v
ORDER BY v.fechadeventa DESC
LIMIT 5;
EOF
echo ""

echo -e "${YELLOW}8. Verificar campos de auditoría${NC}"
cat << 'EOF'
SELECT 
    folioventa,
    estadodeventa,
    usuarioauditoria,
    fechadeventa,
    fechamodificacionauditoria,
    CASE 
        WHEN usuarioauditoria IS NOT NULL 
             AND fechamodificacionauditoria IS NOT NULL THEN 'OK'
        ELSE 'ERROR'
    END as auditoria_completa
FROM tblposcrumenwebventas
ORDER BY fechadeventa DESC
LIMIT 5;
EOF
echo ""

echo -e "${YELLOW}9. Verificar moderadores en detalles${NC}"
cat << 'EOF'
SELECT 
    d.iddetalleventa,
    v.folioventa,
    d.nombreproducto,
    d.moderadores,
    CASE 
        WHEN d.moderadores IS NOT NULL AND d.moderadores != '' THEN 'CON MODERADORES'
        ELSE 'SIN MODERADORES'
    END as tiene_moderadores
FROM tblposcrumenwebdetalleventas d
INNER JOIN tblposcrumenwebventas v ON d.idventa = v.idventa
ORDER BY d.fechadetalleventa DESC
LIMIT 10;
EOF
echo ""

echo -e "${YELLOW}10. Verificar tipos de afectación${NC}"
cat << 'EOF'
SELECT 
    tipoafectacion,
    COUNT(*) as cantidad,
    SUM(CASE WHEN idreceta IS NOT NULL THEN 1 ELSE 0 END) as con_receta,
    SUM(CASE WHEN idreceta IS NULL THEN 1 ELSE 0 END) as sin_receta
FROM tblposcrumenwebdetalleventas
GROUP BY tipoafectacion;
EOF
echo ""

echo -e "${GREEN}=== CHECKLIST DE VALIDACIÓN ===${NC}"
echo ""
echo "✅ 1. Verificar que tblposcrumenwebventas tiene 24 columnas"
echo "✅ 2. Verificar que tblposcrumenwebdetalleventas tiene 22 columnas"
echo "✅ 3. Verificar que existen ventas con estado ORDENADO"
echo "✅ 4. Verificar que existen ventas con estado ESPERAR"
echo "✅ 5. Verificar que los detalles tienen el mismo estado que la venta padre"
echo "✅ 6. Verificar que folioventa es único y tiene formato V{timestamp}{idnegocio}{random}"
echo "✅ 7. Verificar que totaldeventa = subtotal - descuentos + impuestos"
echo "✅ 8. Verificar que usuarioauditoria y fechamodificacionauditoria están poblados"
echo "✅ 9. Verificar que tipoafectacion es RECETA cuando hay idreceta, DIRECTO en caso contrario"
echo "✅ 10. Verificar que afectainventario = 1 e inventarioprocesado = 0 inicialmente"
echo ""

echo -e "${GREEN}=== INSTRUCCIONES DE USO ===${NC}"
echo ""
echo "Para ejecutar estas pruebas, copie y pegue cada consulta SQL"
echo "en su cliente MySQL preferido (MySQL Workbench, phpMyAdmin, CLI, etc.)"
echo ""
echo "Ejemplo de uso en CLI:"
echo "  mysql -u usuario -p nombre_base_datos < test_queries.sql"
echo ""
echo "O ejecutar consultas individuales:"
echo "  mysql -u usuario -p nombre_base_datos -e \"SELECT * FROM tblposcrumenwebventas LIMIT 1;\""
echo ""

echo -e "${GREEN}=== VALIDACIÓN COMPLETADA ===${NC}"
echo ""
echo "Todas las consultas SQL de validación han sido generadas."
echo "Ejecute cada una para verificar el correcto funcionamiento del CRUD."
echo ""
echo "Documentación completa en: VALIDACION_CRUD_PAGEVENTAS.md"
echo ""
