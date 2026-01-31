# ModuloPagos Visual Changes Guide

## Overview
This guide describes the visual and functional changes implemented in the ModuloPagos component.

---

## 1. Auto-Focus on Payment Method Selection

### Before
- User had to manually click on input fields after selecting payment method
- Required extra interaction step

### After
- **Efectivo**: Automatically focuses on "Total recibido" input
- **Transferencia**: Automatically focuses on "Número de referencia" input
- Immediate typing capability after selection

**User Benefit**: Faster data entry, reduced clicks

---

## 2. MIXTO: Amount to Charge Calculation

### Display Location
In "Pagos realizados MIXTO" panel at the top:

```
┌─────────────────────────────────────┐
│ Monto a cobrar                      │
│ $XXX.XX                             │
│ Total: $XXX.XX - Pagado: $XX.XX    │
└─────────────────────────────────────┘
```

### Calculation
```
Monto a cobrar = (Total de cuenta - Descuento) - Suma de pagos registrados
```

**User Benefit**: Clear visibility of remaining amount to collect

---

## 3. Half-Width Importe Input

### Before
```
┌────────────────────────────────────────┐
│  Forma de Pago  │  Importe            │
│  [Efectivo   ▼] │  [_______________]  │
└────────────────────────────────────────┘
```

### After
```
┌────────────────────────────────────────┐
│  Forma de Pago  │  Importe            │
│  [Efectivo   ▼] │    [_______]        │
└────────────────────────────────────────┘
```

**User Benefit**: More compact, easier to scan multiple rows

---

## 4. Delete Button for Payment Rows

### Before
```
┌──────────────────────────────────────────────────────┐
│ Forma de Pago │ Importe     │ Referencia           │
│ [Efectivo  ▼] │ [1000]      │ [____________]       │
│ [Transfer. ▼] │ [500]       │ [REF12345___]       │
└──────────────────────────────────────────────────────┘
```

### After
```
┌──────────────────────────────────────────────────────────┐
│ Forma de Pago │ Importe  │ Referencia     │ Acción    │
│ [Efectivo  ▼] │ [1000]   │ [__________]  │ [  ✕  ]   │
│ [Transfer. ▼] │ [500]    │ [REF12345_]   │ [  ✕  ]   │
└──────────────────────────────────────────────────────────┘
```

**Features**:
- Red ✕ button in "Acción" column
- Hover effect: button scales up slightly
- Click: Removes the payment row
- Protection: Cannot delete if only one row remains (shows alert)

**User Benefit**: Easy correction of mistakes, flexible payment entry

---

## 5. Compact Payment Cards with Scroll

### Before - "Pagos realizados" Area
```
┌─────────────────────────────────────┐
│ Pagos realizados                    │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ EFECTIVO                        │ │
│ │ $500.00                         │ │
│ │ Ref: REF123                     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ TRANSFERENCIA                   │ │
│ │ $300.00                         │ │
│ │ Ref: REF456                     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Total Pagado:          $800.00  │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### After - "Pagos realizados" Area (with scroll)
```
┌─────────────────────────────────────┐
│ Pagos realizados                    │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │ ← Scrollable
│ ┃ ┌─────────────────────────────┐ ┃ │   area
│ ┃ │ EFECTIVO         $500.00    │ ┃ │   (max-height:
│ ┃ │ Ref: REF123                 │ ┃ │    10rem)
│ ┃ └─────────────────────────────┘ ┃ │
│ ┃ ┌─────────────────────────────┐ ┃ │
│ ┃ │ TRANSFERENCIA    $300.00    │ ┃ │
│ ┃ │ Ref: REF456                 │ ┃ │
│ ┃ └─────────────────────────────┘ ┃ │
│ ┃ ┌─────────────────────────────┐ ┃ │
│ ┃ │ EFECTIVO         $200.00    │ ┃ │
│ ┃ │                             │ ┃ │
│ ┃ └─────────────────────────────┘ ┃ │
│ ┃       ⋮  [scroll if needed]     ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└─────────────────────────────────────┘
```

**Changes**:
- Cards: Smaller padding (0.75rem → 0.5rem)
- Font sizes reduced:
  - Payment type: 0.9rem → 0.8rem
  - Amount: 1.1rem → 1.0rem
  - Reference: 0.8rem → 0.75rem
- Gaps reduced: 0.75rem → 0.5rem
- **Total Pagado removed** from this area
- Added vertical scroll when more than ~4 payments
- Container size remains constant

**User Benefit**: Can see many payments without losing screen space

---

## 6. Disabled Discount Selector

### Condition
Discount selector becomes disabled when `pagosRegistrados.length > 0`

### Visual Indicator
```
Before any payments:
┌─────────────────────────────────────┐
│ Descuentos                          │
│ [Seleccionar descuento       ▼]    │ ← Active
└─────────────────────────────────────┘

After payments registered:
┌─────────────────────────────────────┐
│ Descuentos                          │
│ [Seleccionar descuento       ▼]    │ ← Grayed out
│                                     │    (disabled)
└─────────────────────────────────────┘
```

**Behavior**:
- Selector appears grayed/disabled
- Cannot be clicked
- Prevents discount changes after payment
- Maintains data integrity

**User Benefit**: Prevents accidental discount changes after payments made

---

## Complete User Flow Example

### Scenario: Mixed Payment (Cash + Transfer)

1. **Select MIXTO**
   - See existing payments if any
   - See calculated "Monto a cobrar"

2. **Add First Payment**
   - Select "Efectivo" from dropdown
   - Enter amount in half-width input
   - Leave reference empty

3. **Add Second Payment**
   - Click "Agregar forma de pago"
   - Select "Transferencia"
   - Enter amount
   - Enter reference number

4. **Correct Mistake**
   - Click ✕ button on wrong payment row
   - Row is removed instantly

5. **Complete Payment**
   - Verify "Monto a cobrar" is covered
   - Click COBRAR button
   - Payment processed

---

## CSS Classes Reference

### New Classes
- `.pagos-input-importe-mixto` - Half-width importe input
- `.btn-eliminar-pago` - Delete button styling

### Modified Classes
- `.pagos-realizados-lista` - Added scroll with max-height
- `.pago-registrado-item` - Reduced size and padding
- `.pago-forma`, `.pago-monto`, `.pago-referencia` - Smaller fonts

---

## Browser Compatibility

All changes use standard CSS and React features:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

---

## Accessibility

- Focus indicators maintained
- Keyboard navigation preserved
- Delete button has title attribute
- Color contrast ratios maintained
- Screen reader friendly (semantic HTML)

---

## Performance Impact

- **Negligible**: Only adds 2 refs and 1 useCallback
- No impact on render performance
- No additional API calls
- Scroll uses native browser scrolling (GPU accelerated)

---

## Testing Checklist

For manual testing, verify:

- [ ] Click "Efectivo" → cursor in "Total recibido" input
- [ ] Click "Transferencia" → cursor in "Número de referencia" input
- [ ] Click "Mixto" → see "Monto a cobrar" calculation
- [ ] Importe input is visibly half width in MIXTO table
- [ ] ✕ button appears in "Acción" column
- [ ] Click ✕ → payment row removed
- [ ] Try to delete last row → alert appears, row not deleted
- [ ] Multiple payments → scroll appears in "Pagos realizados"
- [ ] Payment cards appear smaller/more compact
- [ ] "Total Pagado" not shown in "Pagos realizados" area
- [ ] With existing payments → discount selector is disabled
- [ ] Without payments → discount selector is enabled

---

## Summary

All visual changes maintain the existing design language while improving:
- **Efficiency**: Auto-focus, half-width inputs
- **Flexibility**: Delete buttons, scrollable lists
- **Clarity**: Better calculation display, compact cards
- **Data Integrity**: Disabled discounts after payment

Total visual impact: **Moderate** (noticeable improvement without radical redesign)
