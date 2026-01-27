# Quick Reference: menudia Field Implementation

**Last Updated:** January 27, 2026  
**Status:** ✅ FULLY IMPLEMENTED

---

## What is menudia?

The `menudia` field indicates whether a product is part of the "Menú del Día" (Menu of the Day).

- **Type:** varchar(45) in database, used as number (0 or 1) in code
- **Values:** 
  - `0` = Not part of menu
  - `1` = Part of menu (Menú del Día)

---

## Database

**Table:** `tblposcrumenwebproductos`  
**Column:** `menudia varchar(45)`

```sql
SELECT menudia FROM tblposcrumenwebproductos WHERE idProducto = ?;
-- Returns: '0' or '1'
```

---

## Backend API

### GET All Products
```
GET /api/productosWeb
```
**Response includes:**
```json
{
  "idProducto": 1,
  "nombre": "Pizza Margarita",
  "precio": 120.00,
  "menudia": 1,
  ...
}
```

### GET Product by ID
```
GET /api/productosWeb/:id
```
**Response includes menudia field**

### POST Create Product
```
POST /api/productosWeb
Content-Type: application/json

{
  "nombre": "New Product",
  "idCategoria": 5,
  "precio": 100.00,
  "menudia": 1,
  ...
}
```
**Note:** menudia defaults to 0 if not provided

### PUT Update Product
```
PUT /api/productosWeb/:id
Content-Type: application/json

{
  "menudia": 1,
  ...
}
```

**Implementation:** `backend/src/controllers/productosWeb.controller.ts`

---

## Frontend - ConfigProductosWeb (PageProductos)

### Display Badge
Products with `menudia = 1` show a badge:
```tsx
{producto.menudia === 1 && (
  <span className="badge badge-menudia">
    🍽️ Menú del Día
  </span>
)}
```

### Quick Toggle Checkbox
Modern checkbox to toggle menudia:
```tsx
<label className="checkbox-menudia-container">
  <input
    type="checkbox"
    checked={producto.menudia === 1}
    onChange={() => onToggleMenuDia(producto.idProducto, producto.menudia)}
  />
  <span className="checkbox-menudia-label">Menú del Día</span>
</label>
```

### Product Form
Form includes toggle switch:
```tsx
<div className="form-group">
  <label className="form-label">Menú del Día</label>
  <input
    type="checkbox"
    checked={formData.menudia === 1}
    onChange={(e) => setFormData(prev => ({ 
      ...prev, 
      menudia: e.target.checked ? 1 : 0 
    }))}
  />
</div>
```

**Files:**
- `src/pages/ConfigProductosWeb/ConfigProductosWeb.tsx`
- `src/components/productosWeb/ListaProductosWeb/ListaProductosWeb.tsx`
- `src/components/productosWeb/FormularioProductoWeb/FormularioProductoWeb.tsx`

---

## Frontend - PageVentas

### Filter by "Menú Día" Category
When user selects "Menú Día" category, only products with menudia = 1 are shown:

```typescript
// Auto-filter when category is "Menú Día"
const categoriaSeleccionadaObj = categorias.find(c => c.idCategoria === categoriaSeleccionada);
const nombreCategoria = categoriaSeleccionadaObj?.nombre.toLowerCase().trim() || '';

if (nombreCategoria === 'menú día' || nombreCategoria === 'menu dia') {
  filtrados = filtrados.filter(p => p.menudia === 1);
}
```

### Additional Filter Flag
```typescript
// Filter by showMenuDia flag
if (showMenuDia && categoriaSeleccionada === null) {
  filtrados = filtrados.filter(p => p.menudia === 1);
}
```

**File:** `src/pages/PageVentas/PageVentas.tsx` (lines 423-435)

---

## TypeScript Types

```typescript
// src/types/productoWeb.types.ts

export interface ProductoWeb {
  idProducto: number;
  nombre: string;
  precio: number;
  menudia: number;  // 0 or 1
  // ... other fields
}

export interface ProductoWebCreate {
  nombre: string;
  precio: number;
  menudia: number;  // 0 or 1
  // ... other fields
}

export interface ProductoWebUpdate extends ProductoWebCreate {
  idProducto: number;
}
```

---

## How to Use

### 1. Mark Product as "Menú del Día"

**Option A: From Product List (Quick Toggle)**
1. Go to ConfigProductosWeb (PageProductos)
2. Find product in list
3. Click the "Menú del Día" checkbox
4. Product is instantly marked as menu item

**Option B: From Product Form**
1. Go to ConfigProductosWeb (PageProductos)
2. Click "Edit" on product
3. Toggle "Menú del Día" switch
4. Click "Save"

**Option C: Via API**
```bash
curl -X PUT http://localhost:3000/api/productosWeb/123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"menudia": 1, ...other fields...}'
```

### 2. Filter Products in PageVentas

**Automatic:**
1. Go to PageVentas
2. Select "Menú Día" category
3. Only products with menudia = 1 will show

**Manual:**
1. Use the showMenuDia flag in code
2. Products automatically filtered by menudia = 1

---

## Common Operations

### Check if Product is in Menu
```typescript
if (producto.menudia === 1) {
  // Product is part of "Menú del Día"
}
```

### Toggle Menu Status
```typescript
const newValue = currentValue === 1 ? 0 : 1;
await actualizarProductoWeb(productId, { ...producto, menudia: newValue });
```

### Get All Menu Products
```typescript
const productos = await obtenerProductosWeb();
const menuProductos = productos.filter(p => p.menudia === 1);
```

---

## Testing

### Manual Test
1. Create a product with menudia = 1
2. Verify badge appears in product list
3. Go to PageVentas
4. Select "Menú Día" category
5. Verify only menu products appear

### API Test
```bash
# Get all products
curl -X GET http://localhost:3000/api/productosWeb \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create product with menudia
curl -X POST http://localhost:3000/api/productosWeb \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"nombre":"Test Product","idCategoria":1,"precio":50,"menudia":1,...}'

# Update menudia
curl -X PUT http://localhost:3000/api/productosWeb/123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"menudia":1,...}'
```

---

## Troubleshooting

### menudia Not Showing in Response
✅ Check: Is the product query including the menudia field?
- Verify: Line 62 in productosWeb.controller.ts

### menudia Not Filtering in PageVentas
✅ Check: Is the category name exactly "Menú Día" or "menu dia"?
- Verify: Lines 423-428 in PageVentas.tsx

### menudia Not Saving
✅ Check: Is the menudia field included in POST/PUT request?
- Default: menudia defaults to 0 if not provided
- Verify: Lines 256, 350 in productosWeb.controller.ts

---

## Security

✅ **SQL Injection Protection:** Parameterized queries used  
✅ **Authentication:** Required for all endpoints  
✅ **Input Validation:** menudia defaults to 0 if invalid  
✅ **Type Safety:** TypeScript ensures number type  

---

## Documentation

For detailed information, see:
- `VALIDATION_MENUDIA_FIELD.md` - Complete technical validation
- `IMPLEMENTATION_SUMMARY_DASHBOARD_MENUDIA.md` - Original implementation
- `SECURITY_SUMMARY_MENUDIA_VALIDATION.md` - Security analysis

---

## Support

If you encounter issues:
1. Check this quick reference
2. Review detailed documentation
3. Verify database field exists
4. Check API responses include menudia
5. Confirm frontend types match backend

---

**Version:** 1.0  
**Status:** Production Ready ✅
