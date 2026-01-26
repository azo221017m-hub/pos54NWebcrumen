#!/bin/bash

# Script de verificación para el fix de formadepago
# Este script genera las consultas SQL para verificar que el fix funciona correctamente

echo "========================================================"
echo "VERIFICACIÓN DEL FIX: formadepago Data Truncation Error"
echo "========================================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Este script genera las consultas SQL necesarias para:${NC}"
echo "1. Verificar la definición actual de la columna formadepago"
echo "2. Aplicar el fix si es necesario"
echo "3. Verificar que el fix se aplicó correctamente"
echo "4. Probar todos los valores válidos de formadepago"
echo ""

echo -e "${BLUE}=== PASO 1: Verificar definición actual ===${NC}"
echo ""
echo "Ejecute esta consulta para ver la definición actual de formadepago:"
echo ""
cat << 'EOF'
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'tblposcrumenwebventas' 
AND COLUMN_NAME = 'formadepago';
EOF
echo ""
echo -e "${YELLOW}Resultado esperado:${NC}"
echo "COLUMN_TYPE debe incluir: enum('EFECTIVO','TARJETA','TRANSFERENCIA','MIXTO','sinFP')"
echo ""

echo -e "${BLUE}=== PASO 2: Aplicar el fix (si es necesario) ===${NC}"
echo ""
echo "Si 'sinFP' NO aparece en el ENUM, ejecute esta consulta:"
echo ""
cat << 'EOF'
ALTER TABLE tblposcrumenwebventas 
MODIFY COLUMN formadepago ENUM('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'MIXTO', 'sinFP') NOT NULL;
EOF
echo ""
echo -e "${RED}NOTA: Esta consulta modifica la estructura de la tabla.${NC}"
echo -e "${RED}Asegúrese de tener un respaldo antes de ejecutarla.${NC}"
echo ""

echo -e "${BLUE}=== PASO 3: Verificar valores actuales ===${NC}"
echo ""
echo "Consulte qué valores de formadepago existen actualmente:"
echo ""
cat << 'EOF'
SELECT 
    formadepago,
    COUNT(*) as cantidad,
    MIN(fechadeventa) as primera_venta,
    MAX(fechadeventa) as ultima_venta
FROM tblposcrumenwebventas
GROUP BY formadepago
ORDER BY cantidad DESC;
EOF
echo ""

echo -e "${BLUE}=== PASO 4: Verificar ventas recientes ===${NC}"
echo ""
echo "Vea las últimas 10 ventas y sus formas de pago:"
echo ""
cat << 'EOF'
SELECT 
    idventa,
    folioventa,
    formadepago,
    estatusdepago,
    totaldeventa,
    cliente,
    fechadeventa
FROM tblposcrumenwebventas
ORDER BY fechadeventa DESC
LIMIT 10;
EOF
echo ""

echo -e "${BLUE}=== PASO 5: Buscar ventas con sinFP ===${NC}"
echo ""
echo "Busque ventas que usan 'sinFP' como forma de pago:"
echo ""
cat << 'EOF'
SELECT 
    idventa,
    folioventa,
    formadepago,
    estatusdepago,
    cliente,
    fechadeventa
FROM tblposcrumenwebventas
WHERE formadepago = 'sinFP'
ORDER BY fechadeventa DESC
LIMIT 5;
EOF
echo ""

echo -e "${GREEN}=== CHECKLIST DE VALIDACIÓN ===${NC}"
echo ""
echo "Después de ejecutar las consultas, verifique:"
echo ""
echo "✅ 1. La columna formadepago es tipo ENUM con 5 valores"
echo "✅ 2. Los valores incluyen: EFECTIVO, TARJETA, TRANSFERENCIA, MIXTO, sinFP"
echo "✅ 3. La columna es NOT NULL (IS_NULLABLE = NO)"
echo "✅ 4. Existen ventas en la base de datos con formadepago válido"
echo "✅ 5. Si hay ventas con sinFP, todas se visualizan correctamente"
echo ""

echo -e "${BLUE}=== PRUEBA DEL ENDPOINT (Opcional) ===${NC}"
echo ""
echo "Para probar el endpoint de creación de venta con el nuevo validation:"
echo ""
echo "curl -X POST http://localhost:3000/api/ventas-web \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "  -d '{"
echo "    \"tipodeventa\": \"MESA\","
echo "    \"cliente\": \"Test Cliente\","
echo "    \"formadepago\": \"sinFP\","
echo "    \"detalles\": ["
echo "      {"
echo "        \"idproducto\": 1,"
echo "        \"nombreproducto\": \"Producto Test\","
echo "        \"cantidad\": 1,"
echo "        \"preciounitario\": 10.00,"
echo "        \"costounitario\": 5.00"
echo "      }"
echo "    ]"
echo "  }'"
echo ""

echo -e "${BLUE}=== PRUEBA CON VALOR INVÁLIDO ===${NC}"
echo ""
echo "Para probar la validación con un valor inválido:"
echo ""
echo "curl -X POST http://localhost:3000/api/ventas-web \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "  -d '{"
echo "    \"tipodeventa\": \"MESA\","
echo "    \"cliente\": \"Test Cliente\","
echo "    \"formadepago\": \"INVALIDO\","
echo "    \"detalles\": [...]"
echo "  }'"
echo ""
echo -e "${YELLOW}Respuesta esperada:${NC}"
echo '{"success": false, "message": "Forma de pago inválida: \"INVALIDO\". Debe ser uno de: EFECTIVO, TARJETA, TRANSFERENCIA, MIXTO, sinFP"}'
echo ""

echo -e "${GREEN}=== DOCUMENTACIÓN ===${NC}"
echo ""
echo "Para más información, consulte:"
echo "- FIX_FORMADEPAGO_TRUNCATION.md - Documentación completa del fix"
echo "- backend/src/scripts/fix_formadepago_enum.sql - Script de migración"
echo "- backend/src/controllers/ventasWeb.controller.ts - Validación implementada"
echo ""

echo -e "${GREEN}=== FIN DEL SCRIPT DE VERIFICACIÓN ===${NC}"
echo ""
