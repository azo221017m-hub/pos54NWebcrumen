# API Documentation - VentasWeb Endpoints for Producir and Esperar

## Overview
This document describes the endpoints for managing ventas web (web sales) and their detalles (line items), specifically for supporting the "Producir" and "Esperar" functionality in PageVentas.

## Base URL
```
/api/ventas-web
```

## Authentication
All endpoints require JWT authentication via the `authMiddleware`.

---

## Existing Endpoints

### 1. Get All Ventas Web
**GET** `/api/ventas-web`

Get all sales for the authenticated user's business.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "idventa": 1,
      "tipodeventa": "MESA",
      "folioventa": "V1234567890",
      "estadodeventa": "SOLICITADO",
      "cliente": "Mesa: Mesa 1",
      "detalles": [
        {
          "iddetalleventa": 1,
          "idventa": 1,
          "nombreproducto": "Hamburguesa",
          "cantidad": 2,
          "estadodetalle": "ORDENADO",
          ...
        }
      ]
    }
  ]
}
```

### 2. Get Venta by ID
**GET** `/api/ventas-web/:id`

Get a specific sale with all its details.

**Parameters:**
- `id` (path): Sale ID

**Response:**
```json
{
  "success": true,
  "data": {
    "idventa": 1,
    "tipodeventa": "MESA",
    "folioventa": "V1234567890",
    "estadodeventa": "SOLICITADO",
    "detalles": [...]
  }
}
```

### 3. Create Venta
**POST** `/api/ventas-web`

Create a new sale with details. Used by both "Producir" and "Esperar" buttons.

**Request Body:**
```json
{
  "tipodeventa": "MESA",
  "cliente": "Mesa: Mesa 1",
  "formadepago": "EFECTIVO",
  "estadodeventa": "SOLICITADO",  // or "ESPERAR" for Esperar button
  "estadodetalle": "ORDENADO",    // or "ESPERAR" for Esperar button
  "detalles": [
    {
      "idproducto": 1,
      "nombreproducto": "Hamburguesa",
      "idreceta": 10,
      "cantidad": 2,
      "preciounitario": 15.00,
      "costounitario": 8.50,
      "observaciones": "Sin cebolla",
      "moderadores": "1,3,5"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Venta registrada exitosamente",
  "data": {
    "idventa": 1,
    "folioventa": "V1234567890"
  }
}
```

**Notes:**
- **Producir button**: Creates sale with `estadodeventa='SOLICITADO'` and `estadodetalle='ORDENADO'`
- **Esperar button**: Creates sale with `estadodeventa='ESPERAR'` and `estadodetalle='ESPERAR'`
- `tipoafectacion` is automatically determined:
  - `RECETA`: If idreceta is provided (product made from recipe)
  - `DIRECTO`: If no recipe (finished product sold directly)
  - `INVENTARIO`: Available but requires product type info (for raw materials)
  - All items set `afectainventario=1` by default

### 4. Update Venta
**PUT** `/api/ventas-web/:id`

Update sale status and metadata.

**Parameters:**
- `id` (path): Sale ID

**Request Body:**
```json
{
  "estadodeventa": "PREPARANDO",
  "estatusdepago": "PAGADO",
  "fechapreparacion": "2024-01-15T10:30:00",
  "propinadeventa": 5.00
}
```

**Response:**
```json
{
  "success": true,
  "message": "Venta actualizada exitosamente"
}
```

### 5. Cancel Venta
**DELETE** `/api/ventas-web/:id`

Soft delete - marks sale and all its details as CANCELADO.

**Parameters:**
- `id` (path): Sale ID

**Response:**
```json
{
  "success": true,
  "message": "Venta cancelada exitosamente"
}
```

---

## New Endpoints for Detalle Management

### 6. Update Detalle Estado
**PATCH** `/api/ventas-web/:id/detalles/:iddetalle/estado`

Update the status of a specific line item. Useful for kitchen/production workflows.

**Parameters:**
- `id` (path): Sale ID
- `iddetalle` (path): Detail ID

**Request Body:**
```json
{
  "estadodetalle": "PREPARACION"
}
```

**Valid Estados:**
- `ESPERAR`: Item is on hold
- `ORDENADO`: Item has been ordered
- `CANCELADO`: Item has been cancelled
- `DEVUELTO`: Item has been returned
- `PREPARACION`: Item is being prepared
- `COBRADO`: Item has been charged/paid

**Response:**
```json
{
  "success": true,
  "message": "Estado del detalle actualizado exitosamente"
}
```

**Error Responses:**
```json
// 400 - Invalid estado
{
  "success": false,
  "message": "Estado de detalle inválido"
}

// 404 - Detalle not found
{
  "success": false,
  "message": "Detalle de venta no encontrado"
}
```

**Use Cases:**
1. Kitchen display system marking items as "PREPARACION"
2. Moving items from "ESPERAR" to "ORDENADO" when ready to prepare
3. Marking items as "COBRADO" when paid

### 7. Get Detalles by Estado
**GET** `/api/ventas-web/detalles/estado/:estado`

Get all line items with a specific status across all sales. Perfect for kitchen/production dashboards.

**Parameters:**
- `estado` (path): Status to filter by (case-insensitive)

**Valid Estados:**
- `esperar`, `ESPERAR`
- `ordenado`, `ORDENADO`
- `preparacion`, `PREPARACION`
- `cancelado`, `CANCELADO`
- `devuelto`, `DEVUELTO`
- `cobrado`, `COBRADO`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "iddetalleventa": 1,
      "idventa": 1,
      "idproducto": 5,
      "nombreproducto": "Hamburguesa",
      "idreceta": 10,
      "cantidad": 2,
      "preciounitario": 15.00,
      "costounitario": 8.50,
      "subtotal": 30.00,
      "descuento": 0.00,
      "impuesto": 0.00,
      "total": 30.00,
      "afectainventario": 1,
      "tipoafectacion": "RECETA",
      "inventarioprocesado": 0,
      "fechadetalleventa": "2024-01-15T09:30:00",
      "estadodetalle": "ORDENADO",
      "observaciones": "Sin cebolla",
      "moderadores": "1,3,5",
      "idnegocio": 1,
      "usuarioauditoria": "admin",
      "fechamodificacionauditoria": "2024-01-15T09:30:00",
      "folioventa": "V1234567890",
      "cliente": "Mesa: Mesa 1",
      "tipodeventa": "MESA",
      "fechadeventa": "2024-01-15T09:30:00"
    }
  ]
}
```

**Use Cases:**
1. Kitchen Display System: `GET /api/ventas-web/detalles/estado/ordenado` - Show items to prepare
2. Waiting Items View: `GET /api/ventas-web/detalles/estado/esperar` - Show items on hold
3. In Progress View: `GET /api/ventas-web/detalles/estado/preparacion` - Show items being prepared
4. Quality Control: `GET /api/ventas-web/detalles/estado/devuelto` - Track returned items

**Error Responses:**
```json
// 400 - Invalid estado
{
  "success": false,
  "message": "Estado de detalle inválido"
}
```

---

## Integration with PageVentas

### Producir Button Flow
```javascript
// Creates sale with items ready for immediate production
const ventaData = {
  tipodeventa: "MESA",
  cliente: "Mesa: Mesa 1",
  formadepago: "EFECTIVO",
  estadodeventa: "SOLICITADO",  // Sale is requested
  estadodetalle: "ORDENADO",    // Items are ordered for production
  detalles: [...]
};

await crearVentaWeb(ventaData);
```

### Esperar Button Flow
```javascript
// Creates sale with items on hold
const ventaData = {
  tipodeventa: "MESA",
  cliente: "Mesa: Mesa 1",
  formadepago: "EFECTIVO",
  estadodeventa: "ESPERAR",     // Sale is on hold
  estadodetalle: "ESPERAR",     // Items are on hold
  detalles: [...]
};

await crearVentaWeb(ventaData);
```

### Kitchen Display Integration
```javascript
// Get all items that need to be prepared
const ordenados = await obtenerDetallesPorEstado('ORDENADO');

// When kitchen starts preparing an item
await actualizarEstadoDetalle(idVenta, idDetalle, 'PREPARACION');

// Get all items being prepared
const enPreparacion = await obtenerDetallesPorEstado('PREPARACION');
```

---

## Database Schema

### tblposcrumenwebdetalleventas
```sql
CREATE TABLE tblposcrumenwebdetalleventas (
  iddetalleventa bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  idventa bigint(20) UNSIGNED NOT NULL,
  idproducto bigint(20) UNSIGNED NOT NULL,
  nombreproducto varchar(200) NOT NULL,
  idreceta bigint(20) UNSIGNED NULL,
  cantidad decimal(10,3) NOT NULL,
  preciounitario decimal(12,2) NOT NULL,
  costounitario decimal(12,4) NOT NULL,
  subtotal decimal(12,2) NOT NULL,
  descuento decimal(12,2) DEFAULT 0.00,
  impuesto decimal(12,2) DEFAULT 0.00,
  total decimal(12,2) NOT NULL,
  afectainventario tinyint(1) NOT NULL DEFAULT 1,
  tipoafectacion enum('DIRECTO','INVENTARIO','RECETA') NOT NULL DEFAULT 'INVENTARIO',
  inventarioprocesado tinyint(1) NOT NULL DEFAULT 0,
  fechadetalleventa datetime NOT NULL,
  estadodetalle enum('ESPERAR','ORDENADO','CANCELADO','DEVUELTO','PREPARACION','COBRADO') NOT NULL DEFAULT 'ORDENADO',
  moderadores longtext NULL,
  observaciones text NULL,
  idnegocio int(20) NOT NULL,
  usuarioauditoria varchar(80) NOT NULL,
  fechamodificacionauditoria datetime NOT NULL,
  
  INDEX idx_estadodetalle (estadodetalle),
  INDEX idx_fechadetalleventa (fechadetalleventa),
  INDEX idx_idventa_estadodetalle (idventa, estadodetalle)
) COMMENT='Detalle de ventas web con información de productos, recetas, costos, moderadores y estados de preparación';
```

### Key Fields
- **estadodetalle**: Current status of the line item
- **tipoafectacion**: How this item affects inventory
  - `RECETA`: Item is made from a recipe (affects ingredients/insumos from recipe)
  - `DIRECTO`: Finished product without recipe (affects product inventory directly)
  - `INVENTARIO`: Raw materials/inventory items sold directly (affects raw material inventory)
- **moderadores**: Comma-separated IDs of selected moderadores
- **afectainventario**: Whether this item affects inventory (1=yes, 0=no)
- **inventarioprocesado**: Whether inventory has been processed (1=yes, 0=no)

**Note on tipoafectacion assignment**:
- Automatically set to `RECETA` when `idreceta` is provided
- Defaults to `DIRECTO` for products without recipes
- `INVENTARIO` is available in the enum but requires additional product type information to be used (future enhancement)

---

## Frontend Service Functions

### ventasWebService.ts
```typescript
// Create sale (Producir/Esperar)
crearVentaWeb(ventaData: VentaWebCreate): Promise<{success: boolean, idventa?: number, folioventa?: string, message?: string}>

// Update detalle status
actualizarEstadoDetalle(idVenta: number, idDetalle: number, estadodetalle: EstadoDetalle): Promise<{success: boolean, message?: string}>

// Get detalles by status
obtenerDetallesPorEstado(estado: EstadoDetalle): Promise<DetalleVentaWeb[]>
```

---

## Migration Scripts

### Required Migrations
1. `add_moderadores_to_detalleventas.sql` - Adds moderadores column
2. `validate_detalleventas_schema.sql` - Validates and updates enums, adds indexes

Run migrations in order:
```bash
mysql -u [user] -p [database] < backend/src/scripts/add_moderadores_to_detalleventas.sql
mysql -u [user] -p [database] < backend/src/scripts/validate_detalleventas_schema.sql
```

---

## Testing

### Test Producir Button
1. Add products to comanda in PageVentas
2. Configure service type (Mesa/Llevar/Domicilio)
3. Click "Producir" button
4. Verify sale created with:
   - `estadodeventa = 'SOLICITADO'`
   - All detalles have `estadodetalle = 'ORDENADO'`

### Test Esperar Button
1. Add products to comanda in PageVentas
2. Configure service type
3. Click "Esperar" button
4. Verify sale created with:
   - `estadodeventa = 'ESPERAR'`
   - All detalles have `estadodetalle = 'ESPERAR'`

### Test Estado Updates
1. Create sale with Producir
2. Call `PATCH /api/ventas-web/:id/detalles/:iddetalle/estado` with `estadodetalle: "PREPARACION"`
3. Verify detalle status updated

### Test Estado Query
1. Create multiple sales with different estados
2. Call `GET /api/ventas-web/detalles/estado/ordenado`
3. Verify only ORDENADO items returned

---

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created (for POST requests)
- `400`: Bad request (invalid parameters)
- `401`: Unauthorized (missing/invalid token)
- `404`: Not found (resource doesn't exist)
- `500`: Server error

---

## Notes

1. All endpoints filter by `idnegocio` from authenticated user
2. All updates track `usuarioauditoria` and `fechamodificacionauditoria`
3. Ventas use soft delete (status change, not actual deletion)
4. `tipoafectacion` is automatically determined based on presence of `idreceta`
5. Estado transitions are not enforced at API level (business logic handled by frontend)
