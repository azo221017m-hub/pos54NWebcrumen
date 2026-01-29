# Visual Guide: Dashboard and MIXTO Payment Changes

## 1. Dashboard Status Visibility Changes

### Before
All sales in "Comandas del Día" displayed a status selector:
```
┌─────────────────────────────────────┐
│ FOLIO-001        [MESA Icon] MESA  │
├─────────────────────────────────────┤
│ 👤 Juan Pérez                       │
│ 3 producto(s)                       │
│                                     │
│ Estado: [Dropdown ▼]  ← ALWAYS     │
│   - Solicitado                      │
│   - Preparando                      │
│   - En Camino                       │
│   - Entregado                       │
│                                     │
│ $150.00              [Comanda] [$]  │
└─────────────────────────────────────┘
```

### After
Status selector ONLY shows for ONLINE sales:

```
ONLINE Sale (shows status):
┌─────────────────────────────────────┐
│ FOLIO-002      [Globe Icon] ONLINE │
├─────────────────────────────────────┤
│ 👤 María García                     │
│ 5 producto(s)                       │
│                                     │
│ Estado: [Dropdown ▼]  ← VISIBLE    │
│   - Solicitado                      │
│   - Preparando                      │
│   - En Camino                       │
│   - Entregado                       │
│                                     │
│ $200.00              [Comanda] [$]  │
└─────────────────────────────────────┘

MESA Sale (no status):
┌─────────────────────────────────────┐
│ FOLIO-001        [MESA Icon] MESA  │
├─────────────────────────────────────┤
│ 👤 Juan Pérez                       │
│ 3 producto(s)                       │
│                                     │
│ (No status selector)  ← HIDDEN     │
│                                     │
│                                     │
│ $150.00              [Comanda] [$]  │
└─────────────────────────────────────┘
```

## 2. ModuloPagos - MIXTO Payment Display

### New Features in "Pagos realizados" Section

#### When NO payments registered:
```
┌──────────────────────────────────────┐
│ Pagos realizados                     │
├──────────────────────────────────────┤
│                                      │
│  No hay pagos registrados            │
│                                      │
└──────────────────────────────────────┘
```

#### When payments exist (MIXTO mode):
```
┌──────────────────────────────────────┐
│ Pagos realizados                     │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ EFECTIVO                         │ │
│ │ $50.00                           │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ TRANSFERENCIA                    │ │
│ │ $30.00                           │ │
│ │ Ref: 123456789                   │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Total Pagado:           $80.00   │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### MIXTO Panel - Right Column

#### Shows "Monto a cobrar" with calculation:
```
┌──────────────────────────────────────────┐
│ Pagos realizados MIXTO                   │
├──────────────────────────────────────────┤
│                                          │
│ Monto a cobrar                           │
│ ┌──────────────────────────────────────┐ │
│ │          $20.00                      │ │
│ └──────────────────────────────────────┘ │
│ Total: $100.00 - Pagado: $80.00          │
│                                          │
│ ┌────────────────────────────────────┐   │
│ │  Forma de Pago │ Importe │ Ref.   │   │
│ ├────────────────┼─────────┼────────┤   │
│ │ [Efectivo ▼]   │ [____]  │ [____] │   │
│ └────────────────┴─────────┴────────┘   │
│                                          │
│         [Agregar forma de pago]          │
│                                          │
│              [CANCELAR]                  │
└──────────────────────────────────────────┘
```

## 3. Payment Flow Diagram

### Scenario: $100 sale with partial payments

```
Step 1: Initial Payment ($50 Efectivo)
─────────────────────────────────────
Total de Cuenta:      $100.00
Pagos Registrados:    $0.00
Monto a Cobrar:       $100.00

Action: Pay $50 with Efectivo
Result: estatusdepago = 'PENDIENTE'

Step 2: View ModuloPagos Again
─────────────────────────────────────
Total de Cuenta:      $100.00
Pagos Registrados:    $50.00
  - Efectivo: $50.00
Monto a Cobrar:       $50.00

Step 3: Final Payment ($50 Transferencia)
─────────────────────────────────────
Total de Cuenta:      $100.00
Pagos Registrados:    $100.00
  - Efectivo: $50.00
  - Transferencia: $50.00
Monto a Cobrar:       $0.00

Action: Pay $50 with Transferencia
Result: 
  - estatusdepago = 'PAGADO'
  - estadodeventa = 'COBRADO'
  - tiempototaldeventa = [timestamp of this payment]
```

## 4. Data Flow

### Frontend → Backend → Database

```
1. User Opens ModuloPagos (MIXTO)
   ↓
2. Frontend: cargarPagosRegistrados()
   ↓
3. API Call: GET /api/pagos/detalles/{folioventa}
   ↓
4. Backend: obtenerDetallesPagos()
   ↓
5. Database: SELECT * FROM tblposcrumenwebdetallepagos
   ↓
6. Frontend: Display registered payments
   ↓
7. Frontend: Calculate montoACobrar = total - sum(pagos)

8. User Enters New Payment(s)
   ↓
9. API Call: POST /api/pagos/mixto
   ↓
10. Backend: procesarPagoMixto()
    ↓
11. Database: INSERT INTO tblposcrumenwebdetallepagos
    ↓
12. Database: Get MAX(fechadepago) for tiempototaldeventa
    ↓
13. Database: UPDATE tblposcrumenwebventas
    - estadodeventa = 'COBRADO' (if fully paid)
    - estatusdepago = 'PAGADO' (if fully paid)
    - importedepago = sum of all payments
    - tiempototaldeventa = last payment timestamp
    - usuarioauditoria, fechamodificacionauditoria, etc.
```

## 5. Key Differences from Before

### Dashboard
- **Before**: All sales showed status selector
- **After**: Only ONLINE sales show status selector
- **Impact**: Cleaner UI, less clutter for MESA/LLEVAR/DOMICILIO

### ModuloPagos
- **Before**: "Pagos realizados" always showed "No hay pagos registrados"
- **After**: Shows actual registered payments for MIXTO with amounts and references
- **Impact**: Users can see payment history and know how much is still owed

### Backend Timestamp
- **Before**: Used first payment timestamp (MIN)
- **After**: Uses last payment timestamp (MAX)
- **Impact**: Accurately reflects when the sale was fully paid

## 6. Color Legend

### Payment Display Colors
- Green border/text: EFECTIVO payments
- Blue border/text: TRANSFERENCIA payments
- Purple border/text: Total amount paid
- Pink background: MIXTO panel

### Status Indicators
- Yellow: SOLICITADO
- Blue: PREPARANDO
- Orange: EN_CAMINO
- Green: ENTREGADO
- Red: CANCELADO/DEVUELTO
