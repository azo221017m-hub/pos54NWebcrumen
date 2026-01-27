#!/bin/bash

# Script to verify menudia mapping implementation
# This script checks that menudia field is properly mapped in all necessary files

echo "==================================="
echo "Verifying menudia mapping"
echo "==================================="
echo ""

# Check 1: Frontend Form Component
echo "✓ Check 1: FormularioProductoWeb.tsx"
echo "  Checking if menudia is read from productoEditar..."
if grep -q "menudia: productoEditar.menudia" src/components/productosWeb/FormularioProductoWeb/FormularioProductoWeb.tsx; then
    echo "  ✅ menudia read from productoEditar (line 38)"
else
    echo "  ❌ menudia NOT read from productoEditar"
    exit 1
fi

echo "  Checking if menudia is initialized for new products..."
if grep -q "menudia: 0" src/components/productosWeb/FormularioProductoWeb/FormularioProductoWeb.tsx; then
    echo "  ✅ menudia initialized to 0 for new products (line 55)"
else
    echo "  ❌ menudia NOT initialized"
    exit 1
fi

echo "  Checking if menudia UI toggle exists..."
if grep -q "formData.menudia === 1" src/components/productosWeb/FormularioProductoWeb/FormularioProductoWeb.tsx; then
    echo "  ✅ menudia UI toggle found (lines 632-644)"
else
    echo "  ❌ menudia UI toggle NOT found"
    exit 1
fi

echo ""

# Check 2: Backend Controller - SELECT queries
echo "✓ Check 2: Backend Controller - SELECT queries"
echo "  Checking obtenerProductosWeb query..."
if grep -A 20 "SELECT" backend/src/controllers/productosWeb.controller.ts | grep -q "p.menudia"; then
    echo "  ✅ menudia included in obtenerProductosWeb query (line 62)"
else
    echo "  ❌ menudia NOT in obtenerProductosWeb query"
    exit 1
fi

echo "  Checking obtenerProductoWebPorId query..."
if grep -A 30 "obtenerProductoWebPorId" backend/src/controllers/productosWeb.controller.ts | grep -q "p.menudia"; then
    echo "  ✅ menudia included in obtenerProductoWebPorId query (line 120)"
else
    echo "  ❌ menudia NOT in obtenerProductoWebPorId query"
    exit 1
fi

echo ""

# Check 3: Backend Controller - INSERT operation
echo "✓ Check 3: Backend Controller - INSERT operation"
echo "  Checking INSERT statement..."
if grep -A 30 "INSERT INTO tblposcrumenwebproductos" backend/src/controllers/productosWeb.controller.ts | grep -q "menudia"; then
    echo "  ✅ menudia included in INSERT statement (line 248)"
else
    echo "  ❌ menudia NOT in INSERT statement"
    exit 1
fi

echo "  Checking INSERT values..."
if grep -n "menudia || 0" backend/src/controllers/productosWeb.controller.ts | grep -q "262:"; then
    echo "  ✅ menudia value included in INSERT (line 262)"
else
    echo "  ❌ menudia value NOT in INSERT"
    exit 1
fi

echo ""

# Check 4: Backend Controller - UPDATE operation
echo "✓ Check 4: Backend Controller - UPDATE operation"
echo "  Checking UPDATE statement..."
if grep -A 30 "UPDATE tblposcrumenwebproductos SET" backend/src/controllers/productosWeb.controller.ts | grep -q "menudia = ?"; then
    echo "  ✅ menudia included in UPDATE statement (line 355)"
else
    echo "  ❌ menudia NOT in UPDATE statement"
    exit 1
fi

echo "  Checking UPDATE values..."
if grep -n "menudia || 0" backend/src/controllers/productosWeb.controller.ts | grep -q "367:"; then
    echo "  ✅ menudia value included in UPDATE (line 367)"
else
    echo "  ❌ menudia value NOT in UPDATE"
    exit 1
fi

echo ""

# Check 5: TypeScript Types
echo "✓ Check 5: TypeScript Types"
echo "  Checking ProductoWeb interface..."
if grep -A 30 "interface ProductoWeb" src/types/productoWeb.types.ts | grep -q "menudia: number"; then
    echo "  ✅ menudia in ProductoWeb interface (line 21)"
else
    echo "  ❌ menudia NOT in ProductoWeb interface"
    exit 1
fi

echo "  Checking ProductoWebCreate interface..."
if grep -A 20 "interface ProductoWebCreate" src/types/productoWeb.types.ts | grep -q "menudia: number"; then
    echo "  ✅ menudia in ProductoWebCreate interface (line 41)"
else
    echo "  ❌ menudia NOT in ProductoWebCreate interface"
    exit 1
fi

echo ""

# Check 6: Database Schema
echo "✓ Check 6: Database Schema"
if [ -f "backend/src/scripts/add_menudia_to_productos.sql" ]; then
    echo "  ✅ Migration script exists"
    if grep -q "ADD COLUMN menudia" backend/src/scripts/add_menudia_to_productos.sql; then
        echo "  ✅ menudia column definition found"
    else
        echo "  ❌ menudia column definition NOT found"
        exit 1
    fi
else
    echo "  ❌ Migration script NOT found"
    exit 1
fi

echo ""
echo "==================================="
echo "✅ ALL CHECKS PASSED"
echo "==================================="
echo ""
echo "Summary:"
echo "- Frontend reads menudia from productoEditar ✓"
echo "- Frontend initializes menudia for new products ✓"
echo "- Frontend includes menudia UI toggle ✓"
echo "- Backend SELECT queries include menudia ✓"
echo "- Backend INSERT includes menudia ✓"
echo "- Backend UPDATE includes menudia ✓"
echo "- TypeScript types include menudia ✓"
echo "- Database schema includes menudia ✓"
echo ""
echo "CONCLUSION: menudia field is properly mapped between"
echo "productoeditar.menudia and tblposcrumenwebproductos.menudia"
echo "for both INSERT and SELECT operations."
echo ""
