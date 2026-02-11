# Visual Guide: PageGastos - descripcionmov Field

## Overview
This guide shows the visual changes made to the PageGastos module to support the new `descripcionmov` (expense description) field.

---

## 1. ListaGastos - Desktop View

### BEFORE
```
╔═══════════════════════════════════════════════════════════════════╗
║                         Lista de Gastos                           ║
╠═══════╦══════════════╦══════════╦═════════════╦═════════╦═════════╣
║ Folio ║ Tipo Gasto   ║ Importe  ║ Fecha       ║ Usuario ║ Acciones║
╠═══════╬══════════════╬══════════╬═════════════╬═════════╬═════════╣
║ 12345 ║ Servicios    ║ $500.00  ║ 11/02/2026  ║ admin   ║ ✏️  🗑️  ║
║ 12346 ║ Renta        ║ $300.00  ║ 10/02/2026  ║ admin   ║ ✏️  🗑️  ║
╚═══════╩══════════════╩══════════╩═════════════╩═════════╩═════════╝
```

### AFTER (with descripcionmov column)
```
╔════════════════════════════════════════════════════════════════════════════════╗
║                              Lista de Gastos                                   ║
╠═══════╦══════════════╦═════════════════╦══════════╦═════════════╦═════════╦════╣
║ Folio ║ Tipo Gasto   ║ Descripción     ║ Importe  ║ Fecha       ║ Usuario ║ Acc║
╠═══════╬══════════════╬═════════════════╬══════════╬═════════════╬═════════╬════╣
║ 12345 ║ Servicios    ║ Pago de luz ENE ║ $500.00  ║ 11/02/2026  ║ admin   ║ ✏️🗑║
║ 12346 ║ Renta        ║ -               ║ $300.00  ║ 10/02/2026  ║ admin   ║ ✏️🗑║
╚═══════╩══════════════╩═════════════════╩══════════╩═════════════╩═════════╩════╝
                         ↑ NEW COLUMN
                         Shows descripcionmov field
                         Displays "-" when empty
```

### Key Changes:
- ✨ **NEW**: "Descripción" column added between "Tipo de Gasto" and "Importe"
- 🔄 **CHANGED**: "Importe" now displays `totaldeventa` instead of `subtotal`
- 📝 Empty descriptions show "-"

---

## 2. ListaGastos - Mobile View (Cards)

### BEFORE
```
┌────────────────────────────────┐
│ 12345            $500.00       │
├────────────────────────────────┤
│ Tipo: Servicios                │
│ Fecha: 11/02/2026 14:30        │
│ Usuario: admin                 │
├────────────────────────────────┤
│      [✏️ Editar] [🗑️ Eliminar]  │
└────────────────────────────────┘
```

### AFTER (with descripcionmov row)
```
┌────────────────────────────────┐
│ 12345            $500.00       │
├────────────────────────────────┤
│ Tipo: Servicios                │
│ Descripción: Pago de luz ENE   │ ← NEW ROW
│ Fecha: 11/02/2026 14:30        │
│ Usuario: admin                 │
├────────────────────────────────┤
│      [✏️ Editar] [🗑️ Eliminar]  │
└────────────────────────────────┘
```

---

## 3. FormularioGastos - Modal (Create/Edit)

### BEFORE
```
╔════════════════════════════════════╗
║        Nuevo Gasto             [X] ║
╠════════════════════════════════════╣
║                                    ║
║  Tipo de Gasto *                   ║
║  ┌──────────────────────────────┐  ║
║  │ Seleccione... ▼              │  ║
║  └──────────────────────────────┘  ║
║                                    ║
║  Importe del Gasto *               ║
║  ┌──────────────────────────────┐  ║
║  │ 0.00                         │  ║
║  └──────────────────────────────┘  ║
║                                    ║
╠════════════════════════════════════╣
║        [Cancelar]  [Guardar]       ║
╚════════════════════════════════════╝
```

### AFTER (with descripcionmov field)
```
╔════════════════════════════════════╗
║        Nuevo Gasto             [X] ║
╠════════════════════════════════════╣
║                                    ║
║  Tipo de Gasto *                   ║
║  ┌──────────────────────────────┐  ║
║  │ Servicios ▼                  │  ║
║  └──────────────────────────────┘  ║
║                                    ║
║  Descripción                ✨ NEW ║
║  ┌──────────────────────────────┐  ║
║  │ Pago de luz del mes de      │  ║
║  │ enero. Recibo #123456       │  ║
║  │                             │  ║
║  └──────────────────────────────┘  ║
║  Agregue detalles adicionales...   ║
║                                    ║
║  Importe del Gasto *               ║
║  ┌──────────────────────────────┐  ║
║  │ 500.00                       │  ║
║  └──────────────────────────────┘  ║
║                                    ║
╠════════════════════════════════════╣
║        [Cancelar]  [Guardar]       ║
╚════════════════════════════════════╝
```

### Field Details:
- **Label**: "Descripción"
- **Type**: Textarea (multi-line)
- **Required**: No (optional field)
- **Rows**: 3 lines initial height
- **Resize**: Vertical only
- **Placeholder**: "Descripción del gasto (opcional)"
- **Helper text**: "Agregue detalles adicionales sobre este gasto"

---

## 4. Field Order in Form

```
1. Tipo de Gasto *     [Dropdown]    ← Already exists
2. Descripción         [Textarea]    ← NEW
3. Importe del Gasto * [Number]      ← Already exists
```

The new description field is positioned between the expense type and the amount, following a logical top-to-bottom flow:
1. First, select what type of expense it is
2. Then, describe the expense in detail (optional)
3. Finally, enter the amount

---

## 5. UI Element Specifications

### Textarea Styling
```css
Width: 100%
Padding: 0.75rem (12px)
Border: 1px solid #d1d5db (gray-300)
Border Radius: 6px
Font Size: 1rem (16px)
Min Height: 80px
Resize: vertical
Font Family: inherit

Focus State:
  Border: #3b82f6 (blue-500)
  Box Shadow: 0 0 0 3px rgba(59, 130, 246, 0.1)

Disabled State:
  Background: #f3f4f6 (gray-100)
  Cursor: not-allowed
```

### Column Width Distribution (Desktop)
```
Folio:       10%  (unchanged)
Tipo Gasto:  20%  (unchanged)
Descripción: 20%  (NEW)
Importe:     15%  (unchanged)
Fecha:       15%  (unchanged)
Usuario:     12%  (unchanged)
Acciones:     8%  (unchanged)
```

---

## 6. Responsive Behavior

### Desktop (> 768px)
- Full table view with all columns
- Description column visible
- Fixed column widths

### Tablet (768px - 1024px)
- Table view maintained
- Description text may wrap
- Slightly reduced padding

### Mobile (< 768px)
- Card view
- Description shown as separate row
- Full width cards
- Stacked layout

---

## 7. Data Display Rules

### In List View
| Database Value | Display Value |
|----------------|---------------|
| NULL           | `-`           |
| Empty string   | `-`           |
| "Pago de luz"  | "Pago de luz" |
| Long text...   | Full text displayed, wraps if needed |

### In Form
| Mode   | Initial Value          |
|--------|------------------------|
| Create | Empty (blank textarea) |
| Edit   | Existing description or blank if NULL |

---

## 8. User Interaction Flow

### Creating a New Expense
```
1. Click "Nuevo Gasto" button
   ↓
2. Modal opens with empty form
   ↓
3. Select "Tipo de Gasto" (required)
   ↓
4. Optionally enter "Descripción" (new field)
   ↓
5. Enter "Importe del Gasto" (required)
   ↓
6. Click "Guardar"
   ↓
7. Modal closes, list refreshes
   ↓
8. New expense appears in list with description
```

### Editing an Existing Expense
```
1. Click edit button (✏️) on expense row
   ↓
2. Modal opens with pre-filled form
   ↓
3. Description field shows existing value or blank
   ↓
4. User can modify description
   ↓
5. Click "Guardar"
   ↓
6. Description updates in list
```

---

## 9. Accessibility Features

### Keyboard Navigation
- ✅ Tab order: Tipo de Gasto → Descripción → Importe → Buttons
- ✅ Can use arrows in select dropdown
- ✅ Can type in textarea
- ✅ Enter submits form from text inputs

### Screen Readers
- ✅ Label properly associated with textarea
- ✅ Helper text provides additional context
- ✅ Required fields marked with asterisk
- ✅ Form validation messages announced

### Focus Indicators
- ✅ Blue ring on focused elements
- ✅ Clear visual feedback
- ✅ Consistent across all form elements

---

## 10. Example Use Cases

### Case 1: Utilities Payment
```
Tipo de Gasto: Servicios Públicos
Descripción: Recibo de luz - Enero 2026, Cuenta #123456
Importe: $1,250.50
```

### Case 2: Rent Payment
```
Tipo de Gasto: Renta
Descripción: Renta mensual local comercial, calle principal
Importe: $15,000.00
```

### Case 3: Supplies with Details
```
Tipo de Gasto: Papelería
Descripción: Compra de papel, tinta, folders para oficina. Factura A12345
Importe: $456.78
```

### Case 4: Simple Entry (no description)
```
Tipo de Gasto: Limpieza
Descripción: (left empty)
Importe: $200.00

Displays as:
Tipo: Limpieza
Descripción: -
Importe: $200.00
```

---

## Summary of Visual Changes

| Component | Change Type | Description |
|-----------|-------------|-------------|
| ListaGastos Table | ➕ Added | New "Descripción" column |
| ListaGastos Table | 🔄 Modified | Display `totaldeventa` instead of `subtotal` |
| ListaGastos Cards | ➕ Added | New "Descripción" row |
| FormularioGastos | ➕ Added | New textarea for description |
| FormularioGastos CSS | ➕ Added | Textarea styling |

All changes maintain the existing design language and are fully responsive across all device sizes.
