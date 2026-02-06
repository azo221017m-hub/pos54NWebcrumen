# Visual Guide: FormularioCompra Enhancements

## Overview
This guide illustrates the visual changes made to the FormularioCompra component.

## 1. Tipo de Compra Dropdown Enhancement

### Before
```
Tipo de Compra: [Select dropdown]
├─ Options displayed: DOMICILIO, LLEVAR, MESA, ONLINE, MOVIMIENTO
└─ Value: tipocuentacontable
```

### After ✨
```
Tipo de Compra: [Select dropdown]
├─ Options displayed: Account names like "Compra de Materia Prima", "Compra de Insumos", etc.
└─ Value: nombrecuentacontable (e.g., "Compra de Materia Prima")
```

**What Changed:**
- Dropdown now shows descriptive account names instead of generic type codes
- More user-friendly and clear about what type of purchase is being made
- Still filtered to show only accounts with `naturalezacuentacontable = 'COMPRA'`

---

## 2. Article Name Dropdown - Better Filtering

### Before
```
1. User selects: Tipo de Compra = "DOMICILIO"
2. Click "+ Agregar Artículo"
3. Article dropdown shows: Articles filtered by tipocuentacontable
   ❌ Incorrect matching logic
```

### After ✨
```
1. User selects: Tipo de Compra = "Compra de Materia Prima"
2. Click "+ Agregar Artículo"
3. Article dropdown shows: Only articles linked to "Compra de Materia Prima" account
   ✅ Correct matching by nombrecuentacontable and id_cuentacontable
```

**What Changed:**
- Articles are now correctly filtered based on their linked cuenta contable
- The filtering matches the selected cuenta by name and ID
- Users see only relevant articles for the selected purchase type

---

## 3. New UM Compra Field

### Before
```
Article Details Form:
├─ Nombre de Artículo [dropdown]
├─ Cantidad [input]
├─ Precio Unitario [input]
├─ Costo Unitario [input]
└─ Observaciones [input]
```

### After ✨
```
Article Details Form:
├─ Nombre de Artículo [dropdown]
├─ Cantidad [input]
├─ Precio Unitario [input]
├─ Costo Unitario [input]
├─ UM Compra [dropdown] ⭐ NEW!
│  ├─ Dynamically filtered based on article's unit of measure
│  ├─ Shows only UMCompra where umMatPrima matches article's unidad_medida
│  └─ Disabled until an article is selected
└─ Observaciones [input]
```

**What Changed:**
- New "UM Compra" dropdown added to article details
- Automatically filters purchase units based on selected article
- Provides contextual help messages:
  - "Seleccione primero un artículo" - when no article is selected
  - Shows relevant unit options only when article is selected

---

## Complete User Flow

### Creating a New Purchase with Enhancements

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Select Tipo de Compra                              │
├─────────────────────────────────────────────────────────────┤
│  Tipo de Compra: [Compra de Materia Prima ▼]               │
│                   └─ Shows: "Compra de Materia Prima"       │
│                              "Compra de Insumos"             │
│                              "Compra de Productos Terminados"│
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Click "+ Agregar Artículo"                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Fill Article Details                              │
├─────────────────────────────────────────────────────────────┤
│  Artículo #1                                   [🗑️ Delete]  │
│                                                              │
│  Nombre de Artículo: [Harina de Trigo ▼]                   │
│                       ↓ Filtered by selected cuenta         │
│                       └─ Shows only: Harina, Azúcar, Sal... │
│                                                              │
│  Cantidad: [10.00]          UM Compra: [Kilogramo ▼]  ⭐   │
│                                         ↓ Filtered by        │
│  Precio: [$50.00]                      article's UM         │
│                                         └─ kg, g, ton, etc. │
│  Costo: [$45.00]                                            │
│                                                              │
│  Observaciones: [Optional notes here...]                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Save Purchase                                      │
├─────────────────────────────────────────────────────────────┤
│  [❌ Cancelar]                           [💾 Guardar]       │
└─────────────────────────────────────────────────────────────┘
```

---

## Form Behavior Details

### Tipo de Compra Dropdown

**Enabled State:**
```
┌────────────────────────────────────────┐
│ Tipo de Compra: ▼                      │
│ ┌────────────────────────────────────┐ │
│ │ Compra de Materia Prima           │ │ ← nombrecuentacontable
│ │ Compra de Insumos                 │ │
│ │ Compra de Productos Terminados    │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**Loading State:**
```
┌────────────────────────────────────────┐
│ Tipo de Compra: ▼ (disabled)          │
│ Loading...                              │
└────────────────────────────────────────┘
```

### Article Name Dropdown

**Before Tipo Selection:**
```
┌────────────────────────────────────────┐
│ Nombre de Artículo: ▼ (disabled)      │
│ ℹ️ Seleccione primero un tipo de compra│
└────────────────────────────────────────┘
```

**After Tipo Selection:**
```
┌────────────────────────────────────────┐
│ Nombre de Artículo: ▼                  │
│ ┌────────────────────────────────────┐ │
│ │ Harina de Trigo                   │ │ ← Filtered by cuenta
│ │ Azúcar Refinada                   │ │
│ │ Sal Marina                        │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

### UM Compra Dropdown (NEW!)

**Before Article Selection:**
```
┌────────────────────────────────────────┐
│ UM Compra: ▼ (disabled)                │
│ ℹ️ Seleccione primero un artículo      │
└────────────────────────────────────────┘
```

**After Article Selection (e.g., Harina - measured in kg):**
```
┌────────────────────────────────────────┐
│ UM Compra: ▼                           │
│ ┌────────────────────────────────────┐ │
│ │ Kilogramo                         │ │ ← Where umMatPrima = "kg"
│ │ Saco de 25kg                      │ │
│ │ Tonelada                          │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**After Article Selection (e.g., Aceite - measured in L):**
```
┌────────────────────────────────────────┐
│ UM Compra: ▼                           │
│ ┌────────────────────────────────────┐ │
│ │ Litro                             │ │ ← Where umMatPrima = "L"
│ │ Garrafa                           │ │
│ │ Bidón 20L                         │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

---

## Responsive Behavior

All changes maintain responsive design:

- **Desktop:** Fields arranged in rows with multiple columns
- **Tablet:** Fields adapt to smaller width
- **Mobile:** Fields stack vertically for better mobile UX

---

## Validation Messages

### Error States

**Missing Article Name:**
```
┌────────────────────────────────────────┐
│ Nombre de Artículo: [Select ▼] ❌      │
│ ⚠️ El nombre del artículo es requerido │
└────────────────────────────────────────┘
```

**Invalid Quantity:**
```
┌────────────────────────────────────────┐
│ Cantidad: [0] ❌                        │
│ ⚠️ La cantidad debe ser mayor a 0      │
└────────────────────────────────────────┘
```

**No Articles Added:**
```
┌────────────────────────────────────────┐
│ Artículos                               │
│ ⚠️ Debe agregar al menos un artículo   │
│                                         │
│ [+ Agregar Artículo]                   │
└────────────────────────────────────────┘
```

---

## Key Improvements Summary

1. **🎯 Better UX**: Descriptive account names instead of codes
2. **🔍 Smarter Filtering**: Articles correctly filtered by account
3. **📏 Unit Selection**: New UM Compra field for appropriate units
4. **🔗 Dynamic Cascading**: Each dropdown filters the next logically
5. **ℹ️ Contextual Help**: Clear messages guide users through the form
6. **✅ Type Safety**: All fields properly typed for reliability

---

## Technical Notes

- All dropdowns are dynamically populated from database
- Filtering happens in real-time on the frontend
- No new API endpoints required - reuses existing services
- Changes are backward compatible with existing data
- Form validation prevents invalid submissions
