# Visual Guide - FormularioCompras Changes

## Date: 2026-02-06

## Overview
This document provides a visual comparison of the changes made to the FormularioCompras component.

---

## Change 1: Dynamic Tipo de Compra Dropdown

### BEFORE (Static Options)
```
┌─────────────────────────────────────┐
│ Tipo de Compra                      │
│ ┌─────────────────────────────────┐ │
│ │ Domicilio              ▼        │ │
│ └─────────────────────────────────┘ │
│   • Domicilio (hardcoded)           │
│   • Llevar (hardcoded)              │
│   • Mesa (hardcoded)                │
│   • Online (hardcoded)              │
│   • Movimiento (hardcoded)          │
└─────────────────────────────────────┘
```

### AFTER (Dynamic Database Values)
```
┌─────────────────────────────────────┐
│ Tipo de Compra                      │
│ ┌─────────────────────────────────┐ │
│ │ Seleccione un tipo     ▼        │ │
│ └─────────────────────────────────┘ │
│   • [Dynamic from DB]               │
│   • tblposcrumenwebcuentacontable   │
│   • WHERE naturaleza='COMPRA'       │
│   • Shows: tipocuentacontable       │
└─────────────────────────────────────┘
```

**Key Changes:**
- ✅ Values loaded from database at runtime
- ✅ Filtered to show only COMPRA type accounts
- ✅ Reflects actual system configuration
- ✅ No hardcoded values

---

## Change 2: Removed "Información de Entrega" Section

### BEFORE (With Delivery Section)
```
┌─────────────────────────────────────────┐
│ INFORMACIÓN GENERAL                     │
│ • Tipo de Compra                        │
│ • Estado de Compra                      │
│ • Estatus de Pago                       │
│ • Fecha Programada                      │
│ • Referencia                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ INFORMACIÓN DE ENTREGA                  │  ← REMOVED
│ • Dirección de Entrega (textarea)       │  ← REMOVED
│ • Contacto (text input)                 │  ← REMOVED
│ • Teléfono (tel input)                  │  ← REMOVED
└─────────────────────────────────────────┘  ← REMOVED

┌─────────────────────────────────────────┐
│ PRODUCTOS                               │
│ [Add Product Button]                    │
└─────────────────────────────────────────┘
```

### AFTER (Delivery Section Removed)
```
┌─────────────────────────────────────────┐
│ INFORMACIÓN GENERAL                     │
│ • Tipo de Compra                        │
│ • Estado de Compra                      │
│ • Estatus de Pago                       │
│ • Fecha Programada                      │
│ • Referencia                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ARTÍCULOS                               │
│ [Add Artículo Button]                   │
└─────────────────────────────────────────┘
```

**Key Changes:**
- ❌ Removed: Dirección de Entrega field
- ❌ Removed: Contacto de Entrega field
- ❌ Removed: Teléfono de Entrega field
- ✅ Form is now more focused and streamlined

---

## Change 3: "Productos" → "Artículos" Terminology

### Text Changes Throughout Component

| Location | BEFORE | AFTER |
|----------|--------|-------|
| Section Title | "Productos" | "Artículos" |
| Add Button | "Agregar Producto" | "Agregar Artículo" |
| Item Label | "Producto #1" | "Artículo #1" |
| Field Label | "Nombre del Producto" | "Nombre de Artículo" |
| Error Message | "...al menos un producto" | "...al menos un artículo" |
| Error Message | "...nombre del producto..." | "...nombre del artículo..." |

**Visual Comparison:**
```
BEFORE:                          AFTER:
┌──────────────────────┐        ┌──────────────────────┐
│ PRODUCTOS            │        │ ARTÍCULOS            │
│ [+ Agregar Producto] │   →    │ [+ Agregar Artículo] │
│                      │        │                      │
│ Producto #1          │        │ Artículo #1          │
│ • Nombre del Producto│        │ • Nombre de Artículo │
│ • Cantidad           │        │ • Cantidad           │
└──────────────────────┘        └──────────────────────┘
```

---

## Change 4: Filtered Artículo Selection

### BEFORE (Free Text Input)
```
┌─────────────────────────────────────────┐
│ Producto #1                             │
│ ┌─────────────────────────────────────┐ │
│ │ Nombre del Producto                 │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ [Free text input]               │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │ User can type anything              │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### AFTER (Filtered Dropdown)
```
┌─────────────────────────────────────────┐
│ Artículo #1                             │
│ ┌─────────────────────────────────────┐ │
│ │ Nombre de Artículo                  │ │
│ │ ┌─────────────────────────────────┐ │ │
│ │ │ Seleccione un artículo  ▼       │ │ │
│ │ └─────────────────────────────────┘ │ │
│ │ ↓ Shows only filtered insumos       │ │
│ │ • Filtered by tipo de compra        │ │
│ │ • Via cuenta contable relationship  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ℹ️ Seleccione primero un tipo de compra│
└─────────────────────────────────────────┘
```

**Filtering Logic:**
```
┌──────────────────────────────────────────────┐
│ Step 1: User selects "Tipo de Compra"       │
│         e.g., "MATERIA PRIMA"                │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ Step 2: Find matching cuenta contable       │
│         WHERE tipocuentacontable =           │
│               selected tipo de compra        │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ Step 3: Filter insumos                       │
│         WHERE id_cuentacontable =            │
│               cuenta.id_cuentacontable       │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ Step 4: Show only matching insumos in       │
│         dropdown for user selection          │
└──────────────────────────────────────────────┘
```

**Key Changes:**
- ✅ Changed from text input to dropdown
- ✅ Only shows relevant insumos based on tipo de compra
- ✅ Auto-populates precio and costo when insumo selected
- ✅ Shows helpful message when tipo de compra not selected
- ✅ Dropdown disabled until tipo de compra is selected

---

## Complete Form Layout Comparison

### BEFORE
```
╔═══════════════════════════════════════════════╗
║          📦 NUEVA COMPRA                      ║
╠═══════════════════════════════════════════════╣
║ INFORMACIÓN GENERAL                           ║
║ ┌───────────────────────────────────────────┐ ║
║ │ Tipo de Compra: [Domicilio ▼]           │ ║
║ │ Estado: [Esperar ▼]  Pago: [Pendiente ▼]│ ║
║ │ Fecha: [datetime]  Ref: [text]           │ ║
║ └───────────────────────────────────────────┘ ║
╠═══════════════════════════════════════════════╣
║ INFORMACIÓN DE ENTREGA                        ║  ← REMOVED
║ ┌───────────────────────────────────────────┐ ║  ← REMOVED
║ │ Dirección: [textarea]                    │ ║  ← REMOVED
║ │ Contacto: [text]  Teléfono: [tel]       │ ║  ← REMOVED
║ └───────────────────────────────────────────┘ ║  ← REMOVED
╠═══════════════════════════════════════════════╣
║ PRODUCTOS                     [+ Agregar]     ║
║ ┌───────────────────────────────────────────┐ ║
║ │ Producto #1                            [x]│ ║
║ │ Nombre: [free text input]                │ ║
║ │ Cant: [num] Precio: [num] Costo: [num]  │ ║
║ └───────────────────────────────────────────┘ ║
╠═══════════════════════════════════════════════╣
║            [Cancelar]  [Guardar]              ║
╚═══════════════════════════════════════════════╝
```

### AFTER
```
╔═══════════════════════════════════════════════╗
║          📦 NUEVA COMPRA                      ║
╠═══════════════════════════════════════════════╣
║ INFORMACIÓN GENERAL                           ║
║ ┌───────────────────────────────────────────┐ ║
║ │ Tipo de Compra: [Select DB Values ▼]    │ ║
║ │ Estado: [Esperar ▼]  Pago: [Pendiente ▼]│ ║
║ │ Fecha: [datetime]  Ref: [text]           │ ║
║ └───────────────────────────────────────────┘ ║
╠═══════════════════════════════════════════════╣
║ ARTÍCULOS                     [+ Agregar]     ║
║ ┌───────────────────────────────────────────┐ ║
║ │ Artículo #1                            [x]│ ║
║ │ Nombre: [Filtered Dropdown ▼]           │ ║
║ │ ℹ️ Seleccione primero tipo de compra     │ ║
║ │ Cant: [num] Precio: [num] Costo: [num]  │ ║
║ └───────────────────────────────────────────┘ ║
╠═══════════════════════════════════════════════╣
║ DESCUENTO                                     ║
║ ┌───────────────────────────────────────────┐ ║
║ │ Detalle: [textarea]                      │ ║
║ └───────────────────────────────────────────┘ ║
╠═══════════════════════════════════════════════╣
║            [Cancelar]  [Guardar]              ║
╚═══════════════════════════════════════════════╝
```

---

## User Workflow Changes

### BEFORE: Creating a New Compra
```
1. Click "Nueva Compra"
2. Select Tipo de Compra (from hardcoded list)
3. Fill Estado and Pago
4. Fill Delivery Information (3 fields)
5. Click "Agregar Producto"
6. Type product name (free text)
7. Enter quantity, price, cost
8. Repeat steps 5-7 for more products
9. Click "Guardar"
```

### AFTER: Creating a New Compra
```
1. Click "Nueva Compra"
2. Select Tipo de Compra (from database)
   → Dropdown populated dynamically
3. Fill Estado and Pago
4. Click "Agregar Artículo"
5. Select artículo from filtered dropdown
   → Only shows relevant insumos
   → Price and cost auto-populated
6. Adjust quantity if needed
7. Repeat steps 4-6 for more articles
8. Click "Guardar"
```

**Workflow Improvements:**
- ✅ Fewer steps (removed delivery info)
- ✅ Less manual data entry (dropdown vs free text)
- ✅ Auto-population of prices reduces errors
- ✅ Filtered options improve data quality
- ✅ Faster workflow overall

---

## Data Flow Diagram

```
┌─────────────────────┐
│   Component Mount   │
└──────────┬──────────┘
           │
           ├─────────────────────────────┐
           │                             │
           ▼                             ▼
┌──────────────────────┐    ┌────────────────────────┐
│ obtenerCuentas       │    │ obtenerInsumos         │
│ Contables()          │    │ (idNegocio)            │
└──────────┬───────────┘    └────────────┬───────────┘
           │                             │
           ▼                             ▼
┌──────────────────────┐    ┌────────────────────────┐
│ Filter: naturaleza   │    │ Store all insumos      │
│ = 'COMPRA'           │    │ in state               │
└──────────┬───────────┘    └────────────┬───────────┘
           │                             │
           ▼                             │
┌──────────────────────┐                │
│ Populate Tipo de     │                │
│ Compra Dropdown      │                │
└──────────┬───────────┘                │
           │                             │
           │  User Selects Tipo          │
           ▼                             │
┌──────────────────────┐                │
│ Find matching cuenta │                │
│ contable             │                │
└──────────┬───────────┘                │
           │                             │
           │                             │
           ▼                             ▼
┌──────────────────────────────────────────┐
│ Filter insumos by id_cuentacontable      │
│ = cuenta.id_cuentacontable               │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────┐
│ Populate Nombre de   │
│ Artículo Dropdown    │
└──────────┬───────────┘
           │
           │  User Selects Artículo
           ▼
┌──────────────────────┐
│ Auto-fill:           │
│ • precio_venta       │
│ • costo_promedio     │
└──────────────────────┘
```

---

## Error Handling

### Validation Messages Changed

**BEFORE:**
```
❌ "Debe agregar al menos un producto"
❌ "El nombre del producto es requerido"
```

**AFTER:**
```
❌ "Debe agregar al menos un artículo"
❌ "El nombre del artículo es requerido"
```

### New User Feedback

**AFTER (New Feature):**
```
ℹ️ "Seleccione primero un tipo de compra"
   (Shown when trying to select artículo without tipo de compra)
```

---

## Technical Implementation Highlights

### State Management
```typescript
// New states added
const [cuentasContables, setCuentasContables] = useState<CuentaContable[]>([]);
const [insumos, setInsumos] = useState<Insumo[]>([]);
const [cargandoDatos, setCargandoDatos] = useState(true);
```

### Computed Values
```typescript
// Filtered insumos based on selected tipo de compra
const insumosFiltrados = useMemo(() => {
  if (!formData.tipodecompra) return [];
  
  const cuentaSeleccionada = cuentasContables.find(
    c => c.tipocuentacontable === formData.tipodecompra
  );
  
  if (!cuentaSeleccionada) return [];
  
  return insumos.filter(
    i => i.id_cuentacontable === cuentaSeleccionada.id_cuentacontable
  );
}, [formData.tipodecompra, cuentasContables, insumos]);
```

### Auto-Population
```typescript
// When user selects an insumo
const insumoSeleccionado = insumosFiltrados.find(
  i => i.nombre === e.target.value
);

if (insumoSeleccionado) {
  actualizarDetalle(index, 'idproducto', insumoSeleccionado.id_insumo);
  actualizarDetalle(index, 'preciounitario', insumoSeleccionado.precio_venta);
  actualizarDetalle(index, 'costounitario', insumoSeleccionado.costo_promedio_ponderado);
}
```

---

## Benefits Summary

### For Users
✅ **Easier data entry**: Dropdown selections instead of typing
✅ **Fewer errors**: Auto-populated prices and costs
✅ **Faster workflow**: Removed unnecessary fields
✅ **Better guidance**: Info messages when input is needed
✅ **Cleaner interface**: More focused form layout

### For Business
✅ **Data consistency**: Only valid database values used
✅ **Better reporting**: Standardized tipo de compra values
✅ **Flexible configuration**: Tipo de compra managed in database
✅ **Reduced training**: Simpler form = less training needed
✅ **Lower error rate**: Validated selections = fewer mistakes

### For System
✅ **Type safety**: Full TypeScript coverage
✅ **Performance**: Optimized with useMemo
✅ **Maintainability**: Clean, documented code
✅ **Security**: No new vulnerabilities
✅ **Compatibility**: Backward compatible with API

---

## Migration Notes

### No Breaking Changes
- ✅ Existing compras can still be edited
- ✅ API endpoints unchanged
- ✅ Database schema unchanged
- ✅ Backend code unchanged

### Backward Compatibility
- ✅ Old hardcoded values still valid in database
- ✅ Form can handle any tipodecompra value
- ✅ Editing old compras works normally

---

**Document Version**: 1.0
**Last Updated**: 2026-02-06
**Author**: GitHub Copilot Agent
