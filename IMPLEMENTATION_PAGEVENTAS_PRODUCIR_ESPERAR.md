# Implementation: PageVentas Producir and Esperar Buttons

## Overview
This document describes the implementation of the "Producir" and "Esperar" button functionality in PageVentas, which stores product values in the database tables `tblposcrumenwebventas` and `tblposcrumenwebdetalleventas`.

## Changes Made

### 1. Backend Type Updates (`backend/src/types/ventasWeb.types.ts`)

#### VentaWeb Interface
- **Added**: `claveturno: string | null` - Current shift key from logged-in user
- **Renamed**: `fechaprogramadaventa` → `fechaprogramadaentrega` - Scheduled delivery date for DOMICILIO/LLEVAR

#### DetalleVentaWeb Interface
- **Added**: `comensal: string | null` - Diner/guest name (null for now)

#### VentaWebCreate Interface
- **Renamed**: `fechaprogramadaventa` → `fechaprogramadaentrega`

#### DetalleVentaWebCreate Interface
- **Added**: `tipoproducto?: string` - Product type from catalog (Directo, Inventario, Receta, Materia Prima)

#### VentaWebUpdate Interface
- **Renamed**: `fechaprogramadaventa` → `fechaprogramadaentrega`

### 2. Backend Controller Updates (`backend/src/controllers/ventasWeb.controller.ts`)

#### createVentaWeb Function

**Added claveturno retrieval:**
```typescript
// Obtener claveturno del turno abierto actual
let claveturno: string | null = null;
const [turnoRows] = await connection.execute<RowDataPacket[]>(
  `SELECT claveturno FROM tblposcrumenwebturnos 
   WHERE idnegocio = ? AND estatusturno = 'abierto'
   LIMIT 1`,
  [idnegocio]
);

if (turnoRows.length > 0) {
  claveturno = turnoRows[0].claveturno;
}
```

**Updated INSERT statement for tblposcrumenwebventas:**
- Added `claveturno` field
- Added `fechaprogramadaentrega` field
- Added automatic datetime fields: `fechapreparacion`, `fechaenvio`, `fechaentrega` (all set to NOW())
- Ensured `descuentos` and `impuestos` are set to 0 for ESPERAR/PRODUCIR buttons

**Updated afectainventario logic based on tipoproducto:**
```typescript
// Según los requerimientos:
// - afectainventario = 0 SI tipoproducto = 'DIRECTO'
// - afectainventario = 1 SI tipoproducto = 'INVENTARIO' o 'RECETA'
// - tipoafectacion = tipoproducto del producto de la comanda

const tipoproducto = detalle.tipoproducto || 'Directo';

if (tipoproducto === 'Receta') {
  tipoafectacion = 'RECETA';
  afectainventario = 1;
} else if (tipoproducto === 'Inventario' || tipoproducto === 'Materia Prima') {
  tipoafectacion = 'INVENTARIO';
  afectainventario = 1;
} else {
  // Directo
  tipoafectacion = 'DIRECTO';
  afectainventario = 0;
}
```

**Updated INSERT statement for tblposcrumenwebdetalleventas:**
- Added `comensal` field (set to null)
- Set `inventarioprocesado` to 0 (not processed yet)
- Set `descuento` and `impuesto` to 0 for ESPERAR/PRODUCIR buttons
- Used tipoproducto to determine afectainventario correctly

#### updateVentaWeb Function
- **Enabled**: `fechaprogramadaentrega` field update (previously commented out)

### 3. Frontend Type Updates (`src/types/ventasWeb.types.ts`)

#### VentaWeb Interface
- **Added**: `claveturno?: string | null`
- **Renamed**: `fechaprogramadaventa` → `fechaprogramadaentrega`

#### VentaWebCreate Interface
- **Renamed**: `fechaprogramadaventa` → `fechaprogramadaentrega`

#### DetalleVentaWebCreate Interface
- **Added**: `tipoproducto?: string`

#### VentaWebUpdate Interface
- **Renamed**: `fechaprogramadaventa` → `fechaprogramadaentrega`

### 4. Frontend Component Updates (`src/pages/PageVentas/PageVentas.tsx`)

**Updated ventaData construction:**
```typescript
const ventaData: VentaWebCreate = {
  // ... other fields
  fechaprogramadaentrega: fechaprogramadaventa || undefined, // Renamed
  detalles: comanda.map(item => ({
    // ... other fields
    tipoproducto: item.producto.tipoproducto, // Added
  }))
};
```

## Field Mappings

### tblposcrumenwebventas

| Field | Value | Notes |
|-------|-------|-------|
| tipodeventa | From modal selection | DOMICILIO, LLEVAR, or MESA |
| folioventa | Auto-generated | Format: V{timestamp}{idnegocio}{random} |
| estadodeventa | 'ORDENADO' or 'ESPERAR' | From button pressed |
| fechadeventa | NOW() | Auto-set on insert |
| fechaprogramadaentrega | From modal input | For DOMICILIO/LLEVAR only |
| fechapreparacion | NOW() | Auto-set on insert |
| fechaenvio | NOW() | Auto-set on insert |
| fechaentrega | NOW() | Auto-set on insert |
| subtotal | Calculated | Sum of all detail subtotals |
| descuentos | 0 | Set to 0 for ESPERAR/PRODUCIR |
| impuestos | 0 | Set to 0 for ESPERAR/PRODUCIR |
| totaldeventa | Calculated | subtotal - descuentos + impuestos |
| cliente | From modal input | Name or "Mesa: {mesa}" |
| direcciondeentrega | From modal input | For DOMICILIO only |
| contactodeentrega | From modal input | For DOMICILIO only |
| telefonodeentrega | From modal input | For DOMICILIO only |
| propinadeventa | 0 | Initial value |
| formadepago | 'sinFP' | Default value |
| estatusdepago | 'PENDIENTE' or 'ESPERAR' | From button pressed |
| claveturno | From open turno | Current shift key |
| idnegocio | From logged user | Business ID |
| usuarioauditoria | From logged user | User alias |
| fechamodificacionauditoria | NOW() | Auto-set on insert |

### tblposcrumenwebdetalleventas

| Field | Value | Notes |
|-------|-------|-------|
| idventa | From parent | Foreign key to tblposcrumenwebventas |
| idproducto | From comanda | Product ID |
| nombreproducto | From comanda | Product name |
| idreceta | From product | Recipe ID if tipoproducto='Receta' |
| cantidad | From comanda | Quantity |
| preciounitario | From product | Unit price |
| costounitario | From product | Unit cost |
| subtotal | Calculated | cantidad * preciounitario |
| descuento | 0 | Set to 0 for ESPERAR/PRODUCIR |
| impuesto | 0 | Set to 0 for ESPERAR/PRODUCIR |
| total | Calculated | subtotal - descuento + impuesto |
| afectainventario | Based on tipoproducto | 0=Directo, 1=Inventario/Receta |
| tipoafectacion | From tipoproducto | DIRECTO, INVENTARIO, or RECETA |
| inventarioprocesado | 0 | Not processed yet |
| fechadetalleventa | NOW() | Auto-set on insert |
| estadodetalle | 'ORDENADO' or 'ESPERAR' | From button pressed |
| moderadores | From comanda | Comma-separated moderator IDs |
| observaciones | From comanda | Notes/observations |
| idnegocio | From logged user | Business ID |
| usuarioauditoria | From logged user | User alias |
| fechamodificacionauditoria | NOW() | Auto-set on insert |
| comensal | null | Diner name (not used yet) |

## Button Behaviors

### "Producir" Button
When pressed, creates a venta with:
- `estadodeventa` = 'ORDENADO'
- `estadodetalle` = 'ORDENADO'
- `estatusdepago` = 'PENDIENTE'

### "Esperar" Button
When pressed, creates a venta with:
- `estadodeventa` = 'ESPERAR'
- `estadodetalle` = 'ESPERAR'
- `estatusdepago` = 'ESPERAR'

## Testing Instructions

### Prerequisites
1. Have an active turno (shift) open in the system
2. Have products configured with different tipoproducto values
3. Be logged in as a valid user

### Test Cases

#### Test 1: Producir Button with MESA Service
1. Open PageVentas
2. Select "Mesa" service type
3. Configure mesa details
4. Add products to comanda with different tipoproducto:
   - Add a "Directo" product
   - Add a "Receta" product
   - Add an "Inventario" product
5. Add moderadores to at least one product
6. Add notes to at least one product
7. Click "Producir" button
8. Verify in database:
   - Record created in tblposcrumenwebventas with estadodeventa='ORDENADO'
   - Records created in tblposcrumenwebdetalleventas with estadodetalle='ORDENADO'
   - claveturno field populated from current open turno
   - afectainventario = 0 for Directo products
   - afectainventario = 1 for Receta/Inventario products
   - All datetime fields populated
   - descuentos and impuestos = 0

#### Test 2: Esperar Button with DOMICILIO Service
1. Open PageVentas
2. Select "Domicilio" service type
3. Configure delivery details including:
   - Cliente name
   - Direccion de entrega
   - Telefono de entrega
   - Contacto de entrega
   - Fecha programada de entrega
4. Add products to comanda
5. Click "Esperar" button
6. Verify in database:
   - Record created with estadodeventa='ESPERAR'
   - estatusdepago='ESPERAR'
   - estadodetalle='ESPERAR' for all items
   - fechaprogramadaentrega field populated
   - Delivery fields populated correctly

#### Test 3: Esperar Button with LLEVAR Service
1. Open PageVentas
2. Select "Llevar" service type
3. Configure pickup details
4. Add products to comanda
5. Click "Esperar" button
6. Verify fields same as Test 2

#### Test 4: No Active Turno
1. Ensure no turno is open
2. Try to create a venta
3. Verify:
   - Venta is created successfully
   - claveturno field is null

#### Test 5: Product Type Variations
Test with each product type to verify afectainventario:
- Directo → afectainventario=0, tipoafectacion='DIRECTO'
- Receta → afectainventario=1, tipoafectacion='RECETA'
- Inventario → afectainventario=1, tipoafectacion='INVENTARIO'
- Materia Prima → afectainventario=1, tipoafectacion='INVENTARIO'

## SQL Verification Queries

```sql
-- Verify venta was created correctly
SELECT 
  idventa, tipodeventa, folioventa, estadodeventa, 
  fechadeventa, fechaprogramadaentrega, fechapreparacion, 
  fechaenvio, fechaentrega, subtotal, descuentos, impuestos, 
  totaldeventa, cliente, direcciondeentrega, contactodeentrega, 
  telefonodeentrega, propinadeventa, formadepago, estatusdepago, 
  claveturno, idnegocio, usuarioauditoria
FROM tblposcrumenwebventas 
WHERE idventa = ?;

-- Verify detalles were created correctly
SELECT 
  iddetalleventa, idventa, idproducto, nombreproducto, idreceta,
  cantidad, preciounitario, costounitario, subtotal, descuento,
  impuesto, total, afectainventario, tipoafectacion, 
  inventarioprocesado, fechadetalleventa, estadodetalle, 
  observaciones, moderadores, comensal, idnegocio, usuarioauditoria
FROM tblposcrumenwebdetalleventas
WHERE idventa = ?;

-- Verify claveturno matches current open turno
SELECT claveturno 
FROM tblposcrumenwebturnos 
WHERE idnegocio = ? AND estatusturno = 'abierto';
```

## Compilation Status
✅ Backend TypeScript compilation: Success
✅ Frontend TypeScript compilation: Success

## Next Steps
1. Deploy to test environment
2. Execute test cases with real database
3. Verify all fields are correctly populated
4. Test edge cases (no turno, missing optional fields)
5. Validate with actual users

## Related Files
- Backend Controller: `/backend/src/controllers/ventasWeb.controller.ts`
- Backend Types: `/backend/src/types/ventasWeb.types.ts`
- Frontend Component: `/src/pages/PageVentas/PageVentas.tsx`
- Frontend Types: `/src/types/ventasWeb.types.ts`
- Frontend Service: `/src/services/ventasWebService.ts`

## Notes
- All datetime fields use MySQL NOW() function for automatic timestamp
- claveturno is retrieved from the current open turno for the business
- If no turno is open, claveturno will be null (system should handle this gracefully)
- descuentos and impuestos are set to 0 per requirements for ESPERAR/PRODUCIR buttons
- Future discount/tax logic can be added to the calculation section
