# Migration: Add idnegocio filtering to Legacy Tables

## Overview

This migration adds `idnegocio` column to legacy tables and updates controllers to filter all queries by the logged-in user's business (`idnegocio`).

## Problem Statement

The application was showing data from ALL businesses to all users. The requirement is:
> "las consultas y formularios deben mostrar los valores de las tablas que correspondan al idnegocio del usuario que hizo loguin"

Translation: Queries and forms must show values from tables that correspond to the `idnegocio` of the logged-in user.

## Changes Made

### 1. Database Schema Changes

**SQL Migration Script**: `src/scripts/add_idnegocio_migration.sql`

**IMPORTANT**: Run this migration script on the database BEFORE deploying the updated code.

### 2. Controller Updates

#### productos.controller.ts
- ✅ Added `AuthRequest` type import
- ✅ Added `idnegocio` field to Producto interface
- ✅ Updated `getProductos()` - Filters by user's idnegocio
- ✅ Updated `getProductoById()` - Filters by user's idnegocio
- ✅ Updated `createProducto()` - Sets idnegocio from authenticated user
- ✅ Updated `updateProducto()` - Ensures user can only update their business's products
- ✅ Updated `deleteProducto()` - Ensures user can only delete their business's products

#### inventario.controller.ts
- ✅ Added `AuthRequest` type import
- ✅ Added `idnegocio` field to Inventario interface
- ✅ Updated `getInventario()` - Filters by user's idnegocio
- ✅ Updated `getInventarioByProducto()` - Filters by user's idnegocio
- ✅ Updated `getProductosBajoStock()` - Filters by user's idnegocio
- ✅ Updated `actualizarInventario()` - Sets/validates idnegocio
- ✅ Updated `ajustarStock()` - Ensures user can only adjust their business's inventory

#### ventas.controller.ts
- ✅ Added `AuthRequest` type import
- ✅ Added `idnegocio` field to Venta interface
- ✅ Updated `getVentas()` - Filters by user's idnegocio
- ✅ Updated `getVentaById()` - Filters by user's idnegocio
- ✅ Updated `createVenta()` - Sets idnegocio from authenticated user
- ✅ Updated `getVentasDelDia()` - Filters by user's idnegocio

## Tables Already Filtering by idnegocio

These controllers were already implemented correctly:
- ✅ categorias.controller.ts
- ✅ insumos.controller.ts
- ✅ descuentos.controller.ts
- ✅ clientes.controller.ts
- ✅ mesas.controller.ts
- ✅ proveedores.controller.ts
- ✅ recetas.controller.ts
- ✅ subrecetas.controller.ts
- ✅ productosWeb.controller.ts
- ✅ moderadores.controller.ts
- ✅ catModeradores.controller.ts
- ✅ cuentasContables.controller.ts
- ✅ umcompra.controller.ts
- ✅ usuarios.controller.ts

## Deployment Steps

### Step 1: Backup Database
```bash
# Create a backup of the database before running migrations
mysqldump -h <DB_HOST> -u <DB_USER> -p <DB_NAME> > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Run Migration Script
```bash
# Connect to the database
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME>

# Run the migration script
source backend/src/scripts/add_idnegocio_migration.sql
```

### Step 3: Verify Migration
```sql
-- Check if columns were added
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = '<DB_NAME>'
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
```

### Step 4: Update Existing Data (if needed)
```sql
-- IMPORTANT: Update these queries based on your business logic
-- Example: Update ventas based on usuario's negocio
UPDATE ventas v
INNER JOIN tblposcrumenwebusuarios u ON v.usuario_id = u.idUsuario
SET v.idnegocio = u.idNegocio
WHERE v.idnegocio = 1; -- Only update records with default value

-- Example: Update productos based on categoria's negocio
UPDATE productos p
INNER JOIN tblposcrumenwebcategorias c ON p.categoria_id = c.idCategoria
SET p.idnegocio = c.idnegocio
WHERE p.idnegocio = 1; -- Only update records with default value

-- Example: Update inventario based on producto's negocio
UPDATE inventario i
INNER JOIN productos p ON i.producto_id = p.id
SET i.idnegocio = p.idnegocio
WHERE i.idnegocio = 1; -- Only update records with default value
```

### Step 5: Deploy Updated Code
```bash
# Build backend
cd backend
npm run build

# Deploy to Render or your hosting platform
```

### Step 6: Test Functionality
1. Login as user from Business A
2. Verify you only see products/inventory/sales from Business A
3. Login as user from Business B
4. Verify you only see products/inventory/sales from Business B
5. Try to access/modify resources from another business (should fail)

## Security Considerations

- All endpoints now require authentication (already enforced by middleware)
- Users can only view/modify data from their own business (`idnegocio`)
- Attempts to access other businesses' data will return 404 (not found)
- Foreign key constraints ensure data integrity (optional, can be added)

## Rollback Plan

If issues occur after deployment:

### Option 1: Rollback Code Only
```bash
# Revert to previous code version
git revert <commit-hash>
```

### Option 2: Rollback Database Schema
```sql
-- Remove idnegocio columns (DANGEROUS - will lose data)
ALTER TABLE productos DROP COLUMN idnegocio;
ALTER TABLE ventas DROP COLUMN idnegocio;
ALTER TABLE inventario DROP COLUMN idnegocio;
```

**Note**: Database rollback should only be done if absolutely necessary and with proper backups.

## Testing Checklist

- [ ] Migration script runs without errors
- [ ] All tables have idnegocio column
- [ ] Existing data has correct idnegocio values
- [ ] Users can only see their business's data
- [ ] Creating new records sets correct idnegocio
- [ ] Updating records validates idnegocio ownership
- [ ] Deleting records validates idnegocio ownership
- [ ] No regression in existing functionality

## Notes

- The migration adds `idnegocio INT NOT NULL DEFAULT 1` to ensure all records have a value
- Indexes are created on `idnegocio` columns for query performance
- The default value (1) assumes a default business exists - update as needed
- Controllers now use `AuthRequest` type to access `req.user.idNegocio`

## Support

If you encounter issues:
1. Check server logs for errors
2. Verify migration ran successfully
3. Test with different user accounts
4. Review the changes in each controller
5. Contact development team if problems persist
