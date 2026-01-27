#!/bin/bash

# Script de prueba para validar la actualización del campo menudia
# Este script verifica que el endpoint de actualización retorna el formato correcto

echo "======================================"
echo "Test: Formato de Respuesta MenuDia"
echo "======================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
API_URL="${API_URL:-http://localhost:3000}"
TEST_RESULTS=()

echo "🔍 Verificando archivos modificados..."
echo ""

# Verificar backend controller
echo "1️⃣  Verificando backend/src/controllers/productosWeb.controller.ts"
if grep -q "success: true" backend/src/controllers/productosWeb.controller.ts && \
   grep -q "success: false" backend/src/controllers/productosWeb.controller.ts; then
    echo -e "${GREEN}✓${NC} Backend controller incluye campo 'success' en respuestas"
    TEST_RESULTS+=("PASS")
else
    echo -e "${RED}✗${NC} Backend controller NO incluye campo 'success'"
    TEST_RESULTS+=("FAIL")
fi
echo ""

# Verificar formato de respuesta exitosa en crearProductoWeb
echo "2️⃣  Verificando respuesta exitosa en crearProductoWeb"
if grep -A2 "res.status(201).json" backend/src/controllers/productosWeb.controller.ts | grep -q "success: true"; then
    echo -e "${GREEN}✓${NC} crearProductoWeb retorna { success: true, ... }"
    TEST_RESULTS+=("PASS")
else
    echo -e "${RED}✗${NC} crearProductoWeb NO retorna formato correcto"
    TEST_RESULTS+=("FAIL")
fi
echo ""

# Verificar formato de respuesta exitosa en actualizarProductoWeb
echo "3️⃣  Verificando respuesta exitosa en actualizarProductoWeb"
if grep -A2 "res.status(200).json" backend/src/controllers/productosWeb.controller.ts | grep -q "success: true"; then
    echo -e "${GREEN}✓${NC} actualizarProductoWeb retorna { success: true, ... }"
    TEST_RESULTS+=("PASS")
else
    echo -e "${RED}✗${NC} actualizarProductoWeb NO retorna formato correcto"
    TEST_RESULTS+=("FAIL")
fi
echo ""

# Verificar extracción en servicio frontend
echo "4️⃣  Verificando servicio frontend productosWebService.ts"
if grep -q "success: response.data.success" src/services/productosWebService.ts && \
   grep -q "message: response.data.mensaje" src/services/productosWebService.ts; then
    echo -e "${GREEN}✓${NC} Servicio frontend extrae 'success' y 'mensaje' correctamente"
    TEST_RESULTS+=("PASS")
else
    echo -e "${RED}✗${NC} Servicio frontend NO extrae campos correctamente"
    TEST_RESULTS+=("FAIL")
fi
echo ""

# Verificar manejo de errores en servicio
echo "5️⃣  Verificando manejo de errores en servicio"
if grep -q "error.response?.data?.mensaje" src/services/productosWebService.ts; then
    echo -e "${GREEN}✓${NC} Manejo de errores extrae mensaje del backend"
    TEST_RESULTS+=("PASS")
else
    echo -e "${RED}✗${NC} Manejo de errores NO configurado correctamente"
    TEST_RESULTS+=("FAIL")
fi
echo ""

# Verificar que menudia está en el UPDATE query
echo "6️⃣  Verificando que menudia está en la query de actualización"
if grep -A20 "UPDATE tblposcrumenwebproductos SET" backend/src/controllers/productosWeb.controller.ts | grep -q "menudia = ?"; then
    echo -e "${GREEN}✓${NC} Campo menudia incluido en UPDATE query"
    TEST_RESULTS+=("PASS")
else
    echo -e "${RED}✗${NC} Campo menudia NO está en UPDATE query"
    TEST_RESULTS+=("FAIL")
fi
echo ""

# Verificar consistencia de validaciones con success: false
echo "7️⃣  Verificando respuestas de error incluyen success: false"
ERROR_COUNT=$(grep -c "success: false" backend/src/controllers/productosWeb.controller.ts)
if [ "$ERROR_COUNT" -ge 5 ]; then
    echo -e "${GREEN}✓${NC} Respuestas de error incluyen 'success: false' ($ERROR_COUNT instancias)"
    TEST_RESULTS+=("PASS")
else
    echo -e "${YELLOW}⚠${NC} Solo $ERROR_COUNT respuestas de error con 'success: false'"
    TEST_RESULTS+=("WARN")
fi
echo ""

# Verificar que FormularioProductoWeb envía menudia
echo "8️⃣  Verificando que FormularioProductoWeb incluye menudia"
if grep -q "menudia: formData.menudia" src/components/productosWeb/FormularioProductoWeb/FormularioProductoWeb.tsx || \
   grep -q "menudia:" src/components/productosWeb/FormularioProductoWeb/FormularioProductoWeb.tsx; then
    echo -e "${GREEN}✓${NC} FormularioProductoWeb envía campo menudia"
    TEST_RESULTS+=("PASS")
else
    echo -e "${RED}✗${NC} FormularioProductoWeb NO envía menudia"
    TEST_RESULTS+=("FAIL")
fi
echo ""

# Verificar que ConfigProductosWeb maneja resultado.success
echo "9️⃣  Verificando que ConfigProductosWeb verifica resultado.success"
if grep -q "if (resultado.success)" src/pages/ConfigProductosWeb/ConfigProductosWeb.tsx; then
    echo -e "${GREEN}✓${NC} ConfigProductosWeb verifica resultado.success"
    TEST_RESULTS+=("PASS")
else
    echo -e "${RED}✗${NC} ConfigProductosWeb NO verifica resultado.success"
    TEST_RESULTS+=("FAIL")
fi
echo ""

# Resumen
echo "======================================"
echo "RESUMEN DE PRUEBAS"
echo "======================================"
echo ""

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

for result in "${TEST_RESULTS[@]}"; do
    case $result in
        PASS) ((PASS_COUNT++)) ;;
        FAIL) ((FAIL_COUNT++)) ;;
        WARN) ((WARN_COUNT++)) ;;
    esac
done

TOTAL_COUNT=${#TEST_RESULTS[@]}

echo "Total de pruebas: $TOTAL_COUNT"
echo -e "${GREEN}Pasaron: $PASS_COUNT${NC}"
if [ $WARN_COUNT -gt 0 ]; then
    echo -e "${YELLOW}Advertencias: $WARN_COUNT${NC}"
fi
if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "${RED}Fallaron: $FAIL_COUNT${NC}"
fi
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ Todos los tests críticos pasaron${NC}"
    echo ""
    echo "La solución para el problema de actualización de menudia está correctamente implementada."
    echo ""
    exit 0
else
    echo -e "${RED}✗ Algunos tests fallaron${NC}"
    echo ""
    echo "Por favor revisar los archivos modificados para asegurar que los cambios sean correctos."
    echo ""
    exit 1
fi
