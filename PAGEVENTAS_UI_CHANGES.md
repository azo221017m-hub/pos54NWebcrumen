# PageVentas UI Changes - Visual Guide

## Overview
This document provides a visual guide to the UI changes made to the PageVentas (DashboardVentas) component.

## 1. Total de Cuenta Section - ESPERAR Button

### Before:
```
┌─────────────────────────────────────┐
│     Total de cuenta                 │
├─────────────────────────────────────┤
│  [Producir]  [listado de pagos]    │
├─────────────────────────────────────┤
│  Total: $XXX.XX                     │
└─────────────────────────────────────┘
```

### After:
```
┌─────────────────────────────────────┐
│     Total de cuenta                 │
├─────────────────────────────────────┤
│ [Producir] [Esperar] [listado...]  │
├─────────────────────────────────────┤
│  Total: $XXX.XX                     │
└─────────────────────────────────────┘
```

**Changes:**
- Added orange "Esperar" button between "Producir" and "listado de pagos"
- Button has same disabled state logic as "Producir"
- Clicking creates a sale with estadodeventa = 'ESPERAR' and estadodetalle = 'ESPERAR'

## 2. Product Card (Productos Grid)

### Before:
```
┌─────────────────────┐
│   [Product Image]   │
│                     │
│  Product Name       │
│  $ XX.XX            │
│                     │
│  [-]  [+]  [Mod]   │
└─────────────────────┘
```

### After:
```
┌─────────────────────┐
│   [Product Image]   │
│                     │
│  Product Name       │
│  $ XX.XX            │
│                     │
│       [+]  [Mod]    │
└─────────────────────┘
```

**Changes:**
- ✗ Removed minus (-) button - users can only add products from grid
- ✓ Plus (+) button still adds products to comanda
- ✓ Mod button is now functional (was static before)
- ✓ Mod button shows disabled state when no moderadores available

## 3. Mod Button Functionality

### Modal for Moderadores Selection:

```
┌──────────────────────────────────────┐
│  Seleccionar Moderadores             │
├──────────────────────────────────────┤
│                                      │
│  ☐ Moderador 1                       │
│  ☑ Moderador 2                       │
│  ☐ Moderador 3                       │
│  ☑ Moderador 4                       │
│                                      │
├──────────────────────────────────────┤
│                        [Cerrar]      │
└──────────────────────────────────────┘
```

**Behavior:**
- Clicking Mod opens a modal with checkboxes
- Only shows moderadores configured for the product's category
- Multiple selections allowed
- Changes are applied immediately when checkbox is clicked
- Modal can be closed at any time

**Category-Based Selection:**
```
Product → Category (idCategoria)
           ↓
Category → Moderadores Category (idmoderadordef)
           ↓
Moderadores Category → List of Moderador IDs (moderadores field)
           ↓
Display → Filter moderadores by IDs
```

## 4. Comanda Items (Card-Comanda-Producto)

### Before:
```
┌─────────────────────────────────────┐
│ 2  Hamburguesa             $XX.XX  │
│                                     │
│      [-]  [+]  [Mod]               │
└─────────────────────────────────────┘
```

### After (without moderadores):
```
┌─────────────────────────────────────┐
│ 2  Hamburguesa             $XX.XX  │
│                                     │
│      [-]  [+]                      │
└─────────────────────────────────────┘
```

### After (with moderadores):
```
┌─────────────────────────────────────┐
│ 2  Hamburguesa             $XX.XX  │
│                                     │
│ Mod: Sin Cebolla, Extra Queso      │
│                                     │
│      [-]  [+]                      │
└─────────────────────────────────────┘
```

**Changes:**
- ✗ Removed Mod button from comanda items
- ✓ Display selected moderadores below product name (if any)
- ✓ Plus (+) and minus (-) buttons still work to adjust quantity
- ✓ Moderadores persist when quantity is adjusted

## 5. Comanda Items - Moderadores Display Details

### Visual Styling:
- **Label**: "Mod:" in bold
- **Names**: Comma-separated list in italic style
- **Background**: Light blue background (rgba(52, 152, 219, 0.1))
- **Font size**: Slightly smaller than product name (0.85rem)

### Example with Long List:
```
┌─────────────────────────────────────┐
│ 3  Pizza Especial          $XX.XX  │
│                                     │
│ Mod: Sin Aceitunas, Extra Queso,   │
│      Sin Anchoas, Masa Delgada     │
│                                     │
│      [-]  [+]                      │
└─────────────────────────────────────┘
```

## 6. Button States and Colors

### ESPERAR Button:
- **Default**: Orange (#e67e22)
- **Hover**: Dark Orange (#d35400)
- **Disabled**: Gray (#e0e0e0) with reduced opacity

### Mod Button (Product Card):
- **Default**: Teal (#16a085)
- **Hover**: Dark Teal (#138d75)
- **Disabled**: Gray (#95a5a6) with reduced opacity

### Plus/Minus Buttons:
- **Plus**: Teal (#16a085)
- **Minus**: Gray (#7f8c8d)
- **Disabled**: Light Gray with reduced opacity

## 7. Complete Flow Example

### User Story: Adding a Product with Moderadores

1. **User clicks [+] on "Hamburguesa" product**
   → Product added to comanda with quantity 1

2. **User clicks [Mod] on "Hamburguesa" product**
   → Modal opens showing available moderadores:
   ```
   ☐ Sin Cebolla
   ☐ Sin Tomate
   ☐ Extra Queso
   ☐ Sin Salsa
   ```

3. **User selects "Sin Cebolla" and "Extra Queso"**
   → Comanda item updates immediately:
   ```
   ┌─────────────────────────────────────┐
   │ 1  Hamburguesa             $XX.XX  │
   │ Mod: Sin Cebolla, Extra Queso      │
   │      [-]  [+]                      │
   └─────────────────────────────────────┘
   ```

4. **User clicks [+] on "Hamburguesa" again**
   → Quantity increases to 2, moderadores remain:
   ```
   ┌─────────────────────────────────────┐
   │ 2  Hamburguesa             $XX.XX  │
   │ Mod: Sin Cebolla, Extra Queso      │
   │      [-]  [+]                      │
   └─────────────────────────────────────┘
   ```

5. **User clicks [Esperar] button**
   → Sale is created with:
   - estadodeventa = 'ESPERAR'
   - estadodetalle = 'ESPERAR'
   - moderadores = "1,3" (IDs of selected moderadores)

## 8. Responsive Behavior

### Comanda Buttons (3 buttons):
- On wide screens: All 3 buttons in one row
- On narrow screens: Wraps to 2 rows if needed
- Buttons use flex: 1 to distribute space evenly

### Moderadores Modal:
- Max width: 500px
- Max height: 80vh with scroll
- Centered on screen
- Overlay darkens background

## 9. Data Storage

### In Comanda State (Frontend):
```typescript
ItemComanda {
  producto: ProductoWeb
  cantidad: number
  notas?: string
  moderadores?: string        // "1,3,5" (comma-separated IDs)
  moderadoresNames?: string[] // ["Sin Cebolla", "Extra Queso"]
}
```

### In Database (Backend):
```sql
tblposcrumenwebdetalleventas {
  ...
  observaciones: string
  moderadores: string  -- NEW: "1,3,5" (comma-separated IDs)
  ...
}
```

## 10. Accessibility Features

- All buttons have hover states for visual feedback
- Disabled buttons show clear visual indication
- Modal can be closed by clicking overlay or close button
- Checkboxes have proper labels for screen readers
- Color contrast meets WCAG guidelines

## Notes for Developers

1. **Testing Moderadores**:
   - Ensure categories have moderadores configured in tblposcrumenwebmodref
   - Check that moderadores IDs in categoria.idmoderadordef match actual records

2. **Common Issues**:
   - If Mod button is always disabled, check category's idmoderadordef
   - If no moderadores show in modal, check catModeradores.moderadores field
   - If moderadores don't save, ensure database migration was executed

3. **Browser Compatibility**:
   - Tested on Chrome, Firefox, Safari
   - CSS uses modern properties (flex, grid)
   - Modal uses fixed positioning
