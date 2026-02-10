# Visual Guide: INV. INICIAL Form Updates

## Overview
This guide provides visual descriptions of the UI changes for the INV. INICIAL form requirements.

## Feature 1: Required Observaciones Field

### Visual Changes
When motivomovimiento = 'INV. INICIAL':
- A red asterisk (*) appears next to the "Observaciones" label
- The input field has a red border when empty (browser validation)
- Field cannot be left empty when submitting

### Expected Appearance
```
┌─────────────────────────────────────────────────┐
│ motivo de Movimiento                            │
│ ┌───────────────────┐                           │
│ │ INV. INICIAL ▼   │ [DISABLED/GREYED]         │
│ └───────────────────┘                           │
│                                                  │
│ Observaciones *                                  │
│ ┌─────────────────────────────────────────────┐ │
│ │ Enter observations here...                  │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

Note: * in red color indicates required field
```

### Validation Messages
- **Empty submission**: Browser shows "Please fill out this field"
- **Whitespace only**: JavaScript alert shows "Las observaciones son requeridas para movimientos de tipo INVENTARIO INICIAL"

## Feature 2: Disabled motivomovimiento Dropdown

### Visual Changes
When INV. INICIAL is selected:
- Dropdown background becomes greyed out
- Dropdown cursor changes to "not-allowed"
- Dropdown cannot be clicked or changed

### Expected Appearance
```
BEFORE selecting INV. INICIAL:
┌───────────────────────────────────┐
│ motivo de Movimiento              │
│ ┌─────────────────────┐           │
│ │ COMPRA            ▼ │ [ACTIVE]  │
│ └─────────────────────┘           │
└───────────────────────────────────┘

AFTER selecting INV. INICIAL:
┌───────────────────────────────────┐
│ motivo de Movimiento              │
│ ┌─────────────────────┐           │
│ │ INV. INICIAL      ▼ │ [DISABLED]│
│ └─────────────────────┘           │
└───────────────────────────────────┘
Note: Greyed background, cursor: not-allowed
```

## Feature 3: Read-Only Fields in Edit Mode

### Visual Changes
When viewing an existing INV_INICIAL movement:
- Inventory table is displayed with all saved data
- Input fields have greyed background (disabled state)
- Input fields cannot be edited
- Only APLICAR button is shown (SOLICITAR button is hidden)

### Expected Appearance - Create Mode
```
┌────────────────────────────────────────────────────────────┐
│ SUMATORIA DE MOVIMIENTO de INVENTARIO               [X]    │
├────────────────────────────────────────────────────────────┤
│ motivo de Movimiento: [INV. INICIAL ▼] [DISABLED]         │
│ Observaciones *: [Initial inventory setup________]         │
│                                           [SOLICITAR]       │
├────────────────────────────────────────────────────────────┤
│ Inventario Inicial - Insumos Activos                       │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ NOMBRE │STOCK ACTUAL│COSTO PROM.│PROVEEDOR            │ │
│ ├────────────────────────────────────────────────────────┤ │
│ │ Harina │   [100]    │  [2.50]   │ Proveedor A        │ │
│ │ Azúcar │   [50]     │  [1.80]   │ Proveedor B        │ │
│ │ ...    │   [...]    │  [...]    │ ...                │ │
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
Note: Input fields [active/editable], SOLICITAR button visible
```

### Expected Appearance - Edit Mode
```
┌────────────────────────────────────────────────────────────┐
│ Editar Movimiento                                   [X]    │
├────────────────────────────────────────────────────────────┤
│ motivo de Movimiento: [INV. INICIAL ▼] [DISABLED]         │
│ Observaciones *: [Initial inventory setup________]         │
│                                            [APLICAR]        │
├────────────────────────────────────────────────────────────┤
│ Inventario Inicial - Insumos Activos                       │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ NOMBRE │STOCK ACTUAL│COSTO PROM.│PROVEEDOR            │ │
│ ├────────────────────────────────────────────────────────┤ │
│ │ Harina │   {100}    │  {2.50}   │ Proveedor A        │ │
│ │ Azúcar │   {50}     │  {1.80}   │ Proveedor B        │ │
│ │ ...    │   {...}    │  {...}    │ ...                │ │
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
Note: Input fields {read-only/greyed}, only APLICAR button visible

Legend:
[...] = Active/editable input field (white background)
{...} = Read-only input field (greyed background, disabled)
```

## Feature 4: Button State Changes

### Create Mode
```
┌─────────────────────────────┐
│                              │
│         [SOLICITAR]          │
│                              │
└─────────────────────────────┘
- Blue/primary button
- Visible when creating new movement
- Saves movement with PENDIENTE status
```

### Edit Mode
```
┌─────────────────────────────┐
│                              │
│          [APLICAR]           │
│                              │
└─────────────────────────────┘
- Green/success button
- Visible when editing existing movement
- Updates inventory and changes status to PROCESADO
- SOLICITAR button is hidden
```

## User Interaction Flow

### Scenario 1: Creating New INV. INICIAL Movement

```
Step 1: User opens form
┌─────────────────────┐
│ Nuevo Movimiento   │
│ [COMPRA ▼]         │  ← Dropdown active
└─────────────────────┘

Step 2: User selects INV. INICIAL
┌─────────────────────┐
│ motivo: INV. INICIAL│
│ [INV. INICIAL ▼]   │  ← Dropdown disabled (greyed)
│ Observaciones *     │  ← Red asterisk appears
└─────────────────────┘

Step 3: User enters observaciones
┌─────────────────────┐
│ Observaciones *     │
│ [Setup inventory_]  │  ← User types here
└─────────────────────┘

Step 4: User edits inventory values
┌──────────────────────────────────────┐
│ NOMBRE    │STOCK    │COSTO          │
│ Harina    │ [100]   │ [2.50]        │  ← Edit
│ Azúcar    │ [50]    │ [1.80]        │  ← Edit
└──────────────────────────────────────┘

Step 5: User clicks SOLICITAR
[SOLICITAR] ← Saves with PENDIENTE status
```

### Scenario 2: Viewing and Applying Existing Movement

```
Step 1: User clicks action button on movement list
┌─────────────────────────────┐
│ INV. INICIAL - PENDIENTE   │
│             [🔧 Acciones]  │ ← Click here
└─────────────────────────────┘

Step 2: Form opens in edit mode
┌────────────────────────────────────┐
│ Editar Movimiento           [X]   │
│ motivo: [INV. INICIAL ▼]          │ ← Disabled
│ Observaciones: {Setup inventory}   │ ← Read-only
│ [APLICAR]                          │ ← Only button
├────────────────────────────────────┤
│ NOMBRE    │STOCK    │COSTO        │
│ Harina    │ {100}   │ {2.50}      │ ← Read-only
│ Azúcar    │ {50}    │ {1.80}      │ ← Read-only
└────────────────────────────────────┘

Step 3: User reviews data
👁️ User can see but cannot edit values

Step 4: User clicks APLICAR
[APLICAR] ← Updates inventory, status → PROCESADO
```

## Color Coding

### Field States
- **White background**: Active/editable field
- **Grey background**: Disabled/read-only field
- **Red asterisk (*)**: Required field indicator
- **Red border**: Invalid field (browser validation)

### Button Colors
- **Blue/Primary**: SOLICITAR button (create mode)
- **Green/Success**: APLICAR button (edit mode)
- **Grey/Disabled**: Button when action not available

## Accessibility Features

### Keyboard Navigation
- ✅ Tab order maintained
- ✅ Enter key submits form
- ✅ Disabled fields skipped in tab order

### Screen Reader Support
- ✅ Required fields announced as "required"
- ✅ Disabled fields announced as "disabled"
- ✅ Button states announced correctly

### Visual Indicators
- ✅ Color is not the only indicator (also uses disabled state)
- ✅ Red asterisk for required fields
- ✅ Cursor changes for disabled fields (not-allowed)

## Common User Questions

**Q: Why can't I change the movement type after selecting INV. INICIAL?**
A: This prevents accidental changes that could cause data inconsistency between the movement type and the inventory data entered.

**Q: Why can't I edit the inventory values in edit mode?**
A: In edit mode, you're reviewing a saved movement before applying it. The values were set when creating the movement and should not be modified. If you need to change values, create a new movement.

**Q: Why is observaciones required for INV. INICIAL?**
A: Observaciones provides important context and documentation for the initial inventory values, which is crucial for audit trails and understanding why certain values were set.

**Q: What happens when I click APLICAR?**
A: The APLICAR button updates the actual inventory quantities and costs in the system and changes the movement status to PROCESADO. This action cannot be undone, so review carefully before clicking.

## Browser Compatibility

These features work in:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

HTML5 form validation provides the required field functionality.
CSS disabled state provides the greyed-out appearance.
React state management provides the conditional rendering.

## Summary of Visual Changes

| Feature | Create Mode | Edit Mode |
|---------|-------------|-----------|
| motivomovimiento dropdown | Disabled after selecting INV_INICIAL | Disabled |
| Observaciones field | Required (red *) | Required (red *) |
| Inventory table | Visible, editable | Visible, read-only |
| SOLICITAR button | Visible | Hidden |
| APLICAR button | Hidden | Visible |
| Input fields | White background | Grey background |

All visual changes maintain consistency with the existing design system and provide clear feedback to users about field states and available actions.
