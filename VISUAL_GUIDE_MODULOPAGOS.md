# Visual Guide: ModuloPagos Changes

## Overview
This guide provides a visual representation of the changes made to the ModuloPagos component.

## 1. Discount Selection Feature

### Before:
```
┌─────────────────────────────────────┐
│      Total de Cuenta                │
│         $100.00                     │
├─────────────────────────────────────┤
│  [Descuentos] (non-functional)      │
│                                     │
│  descuento amigo 10% (hardcoded)   │
│  - $10.00                           │
│                                     │
│  Nuevo Total                        │
│  $90.00 (always 10% off)           │
└─────────────────────────────────────┘
```

### After:
```
┌─────────────────────────────────────┐
│      Total de Cuenta                │
│         $100.00                     │
├─────────────────────────────────────┤
│  [Descuentos] (click to open)       │
│                                     │
│  (When clicked, modal appears)      │
│  ┌─────────────────────────────┐   │
│  │ Seleccionar Descuento    [X]│   │
│  ├─────────────────────────────┤   │
│  │ • Descuento Amigo    10%    │   │
│  │ • Descuento Estudiante 15%  │   │
│  │ • Descuento Especial $20.00 │   │
│  └─────────────────────────────┘   │
│                                     │
│  (After selection)                  │
│  Descuento Estudiante               │
│  - $15.00                           │
│                                     │
│  Nuevo Total                        │
│  $85.00                             │
│                                     │
│  [Quitar Descuento]                 │
└─────────────────────────────────────┘
```

## 2. Efectivo (Cash) Payment Form

### Before:
```
┌─────────────────────────────────────┐
│  Pagos realizados EFECTIVO          │
├─────────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐              │
│  │$50 │ │$100│ │$150│              │
│  └────┘ └────┘ └────┘              │
│  ┌────┐ ┌────┐ ┌────┐              │
│  │$200│ │$250│ │$300│              │
│  └────┘ └────┘ └────┘              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Monto manual                │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### After:
```
┌─────────────────────────────────────┐
│  Pagos realizados EFECTIVO          │
├─────────────────────────────────────┤
│  Monto a cobrar                     │
│  ┌─────────────────────────────┐   │
│  │       $85.00                │   │
│  └─────────────────────────────┘   │
│                                     │
│  Total recibido                     │
│  ┌─────────────────────────────┐   │
│  │ Ingrese el monto recibido   │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Key Changes:**
- ❌ Removed: Quick amount buttons
- ✅ Added: Clear "Monto a cobrar" display
- ✅ Added: Single input for "Total recibido"
- ✅ Dynamic amount updates with discounts

## 3. Transferencia (Transfer) Payment Form

### Before:
```
┌─────────────────────────────────────┐
│  Pagos realizados TRANSFERENCIA     │
├─────────────────────────────────────┤
│  Número de referencia               │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### After:
```
┌─────────────────────────────────────┐
│  Pagos realizados TRANSFERENCIA     │
├─────────────────────────────────────┤
│  Importe a cobrar                   │
│  ┌─────────────────────────────┐   │
│  │       $85.00                │   │
│  └─────────────────────────────┘   │
│                                     │
│  Número de referencia               │
│  ┌─────────────────────────────┐   │
│  │ Ingrese número de referencia│   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Key Changes:**
- ✅ Added: Clear "Importe a cobrar" display
- ✅ Auto-displays the total amount
- ✅ Dynamic amount updates with discounts

## 4. Mixto (Mixed) Payment Form

### Before:
```
┌─────────────────────────────────────────────────┐
│  Pagos realizados MIXTO                         │
├─────────────────────────────────────────────────┤
│  [Agrega Pago]                                  │
│                                                 │
│  ┌───────────┬──────────┬──────────────┐       │
│  │Forma Pago │ Importe  │  Referencia  │       │
│  ├───────────┼──────────┼──────────────┤       │
│  │[        ] │[       ] │[           ] │       │
│  │[        ] │[       ] │[           ] │       │
│  └───────────┴──────────┴──────────────┘       │
└─────────────────────────────────────────────────┘
```

### After:
```
┌─────────────────────────────────────────────────┐
│  Pagos realizados MIXTO                         │
├─────────────────────────────────────────────────┤
│  ┌───────────────┬──────────┬──────────────┐   │
│  │  Forma Pago   │ Importe  │  Referencia  │   │
│  ├───────────────┼──────────┼──────────────┤   │
│  │[Seleccione ▼] │[       ] │[disabled]    │   │
│  │ • Efectivo    │          │              │   │
│  │ • Transferen. │          │              │   │
│  └───────────────┴──────────┴──────────────┘   │
└─────────────────────────────────────────────────┘

(When "Transferencia" is selected:)
┌─────────────────────────────────────────────────┐
│  Pagos realizados MIXTO                         │
├─────────────────────────────────────────────────┤
│  ┌───────────────┬──────────┬──────────────┐   │
│  │  Forma Pago   │ Importe  │  Referencia  │   │
│  ├───────────────┼──────────┼──────────────┤   │
│  │[Transferen.▼] │[  45.00] │[REF12345]    │   │
│  └───────────────┴──────────┴──────────────┘   │
└─────────────────────────────────────────────────┘
```

**Key Changes:**
- ❌ Removed: "Agrega Pago" button
- ❌ Removed: Second payment line (now only 1 line)
- ✅ Changed: Text input → Dropdown/Select for payment form
- ✅ Limited: Only "Efectivo" and "Transferencia" options
- ✅ Smart: Reference field disabled for Efectivo, enabled for Transferencia

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    ModuloPagos                          │
│                                                         │
│  ┌────────────────────────────────────────────┐        │
│  │ 1. Component Mounts                        │        │
│  │    └─> useEffect() triggers                │        │
│  │         └─> cargarDescuentos()             │        │
│  │              └─> obtenerDescuentos()       │        │
│  │                   └─> API: GET /descuentos │        │
│  │                        └─> Database Query  │        │
│  └────────────────────────────────────────────┘        │
│                         ↓                               │
│  ┌────────────────────────────────────────────┐        │
│  │ 2. Filter Active Discounts                 │        │
│  │    filter(d => d.estatusdescuento          │        │
│  │               .toLowerCase() === 'activo') │        │
│  └────────────────────────────────────────────┘        │
│                         ↓                               │
│  ┌────────────────────────────────────────────┐        │
│  │ 3. Display in State                        │        │
│  │    setDescuentos(descuentosActivos)        │        │
│  └────────────────────────────────────────────┘        │
│                         ↓                               │
│  ┌────────────────────────────────────────────┐        │
│  │ 4. User Clicks "Descuentos" Button         │        │
│  │    setMostrarDescuentos(true)              │        │
│  └────────────────────────────────────────────┘        │
│                         ↓                               │
│  ┌────────────────────────────────────────────┐        │
│  │ 5. Modal Shows Discount List               │        │
│  │    descuentos.map(d => DiscountItem)       │        │
│  └────────────────────────────────────────────┘        │
│                         ↓                               │
│  ┌────────────────────────────────────────────┐        │
│  │ 6. User Selects Discount                   │        │
│  │    handleSeleccionarDescuento(descuento)   │        │
│  │    └─> setDescuentoSeleccionado(descuento) │        │
│  │    └─> setMostrarDescuentos(false)         │        │
│  └────────────────────────────────────────────┘        │
│                         ↓                               │
│  ┌────────────────────────────────────────────┐        │
│  │ 7. Calculate Discount                      │        │
│  │    if (esTipoPorcentaje())                 │        │
│  │      totalCuenta * (valor / 100)           │        │
│  │    else if (esTipoMontoFijo())             │        │
│  │      valor                                 │        │
│  └────────────────────────────────────────────┘        │
│                         ↓                               │
│  ┌────────────────────────────────────────────┐        │
│  │ 8. Update Display                          │        │
│  │    nuevoTotal = totalCuenta - descuento    │        │
│  │    └─> Show in Efectivo panel              │        │
│  │    └─> Show in Transferencia panel         │        │
│  └────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

## Payment Type Comparison

### Efectivo (Cash)
```
Input Required:  1 field
  ├─> Total recibido: number input
  └─> Amount to charge: auto-displayed
  
Features:
  ✅ Shows monto a cobrar
  ✅ Manual input for total received
  ✅ Updates with discount
```

### Transferencia (Transfer)
```
Input Required:  1 field
  ├─> Número de referencia: text input
  └─> Amount to charge: auto-displayed
  
Features:
  ✅ Shows importe a cobrar
  ✅ Manual input for reference number
  ✅ Updates with discount
```

### Mixto (Mixed)
```
Input Required:  2-3 fields per line (1 line only)
  ├─> Forma de pago: select dropdown
  ├─> Importe: number input
  └─> Referencia: text input (conditional)
  
Features:
  ✅ Dropdown selection
  ✅ Only Efectivo | Transferencia options
  ✅ Smart reference field (disabled for Efectivo)
  ✅ Single payment line
```

## Helper Functions Structure

```
Helper Functions:
├─> esTipoPorcentaje(tipodescuento: string): boolean
│   └─> Returns true if type is 'porcentaje' or 'porcentual'
│
├─> esTipoMontoFijo(tipodescuento: string): boolean
│   └─> Returns true if type is 'monto' or 'fijo'
│
├─> formatearValorDescuento(descuento: Descuento): string
│   ├─> If percentage: returns "10%"
│   └─> If fixed: returns "$50.00"
│
└─> calcularDescuento(descuento: Descuento): number
    ├─> If percentage: returns totalCuenta * (valor / 100)
    ├─> If fixed: returns valor
    └─> Otherwise: returns 0
```

## State Management

```typescript
Component State:
├─> metodoPagoSeleccionado: 'efectivo' | 'transferencia' | 'mixto'
├─> montoEfectivo: string
├─> numeroReferencia: string
├─> pagosMixtos: Array<{formaPago, importe, referencia}>
├─> descuentos: Descuento[]
├─> mostrarDescuentos: boolean
├─> descuentoSeleccionado: Descuento | null
└─> cargandoDescuentos: boolean

Computed Values:
├─> montoDescuento = calcularDescuento(descuentoSeleccionado)
└─> nuevoTotal = totalCuenta - montoDescuento
```

## Code Quality Improvements

### Before (Repetitive):
```typescript
// Multiple places checking discount type
if (descuento.tipodescuento.toLowerCase() === 'porcentaje' || 
    descuento.tipodescuento.toLowerCase() === 'porcentual') {
  // calculation
}
```

### After (DRY - Don't Repeat Yourself):
```typescript
// Single helper function
const esTipoPorcentaje = (tipodescuento: string): boolean => {
  const tipo = tipodescuento.toLowerCase();
  return tipo === 'porcentaje' || tipo === 'porcentual';
};

// Used throughout
if (esTipoPorcentaje(descuento.tipodescuento)) {
  // calculation
}
```

## Summary of Changes

### Files Modified: 2
- ✅ `src/components/ventas/ModuloPagos.tsx` (+150 lines, -20 lines)
- ✅ `src/components/ventas/ModuloPagos.css` (+167 lines, -0 lines)

### Lines of Code:
- **Added**: 317 lines
- **Removed**: 20 lines
- **Net Change**: +297 lines

### New Features: 4
1. ✅ Discount selection from database
2. ✅ Simplified Efectivo form
3. ✅ Simplified Transferencia form
4. ✅ Enhanced Mixto form

### Code Quality:
- ✅ Helper functions for reusability
- ✅ Case-insensitive comparisons
- ✅ Type-safe TypeScript
- ✅ Clean code architecture

### Security:
- ✅ 0 vulnerabilities found
- ✅ CodeQL passed
- ✅ No exposed secrets
- ✅ Input validation

---

**End of Visual Guide**
