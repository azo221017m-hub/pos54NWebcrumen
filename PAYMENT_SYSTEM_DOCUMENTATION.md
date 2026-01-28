# Payment Registration System Documentation

## Overview

This document describes the payment registration system implemented for the POS application. The system supports two payment schemes: Simple Payment (Efectivo/Transferencia) and Mixed Payment (MIXTO).

## Database Schema

### Table: tblposcrumenwebventas (Updated)

Added field:
- `importedepago` DECIMAL(10, 2) - Total amount paid for the sale

### Table: tblposcrumenwebdetallepagos (New)

Stores individual payment details for mixed payments:

| Field | Type | Description |
|-------|------|-------------|
| iddetallepagos | INT (PK, Auto Increment) | Unique payment detail ID |
| idfolioventa | VARCHAR(100) | Sale folio reference |
| fechadepago | DATETIME | Payment date and time |
| totaldepago | DECIMAL(10, 2) | Payment amount |
| formadepagodetalle | ENUM | Payment method (EFECTIVO, TARJETA, TRANSFERENCIA) |
| referencia | VARCHAR(255) | Reference number (for transfers) |
| claveturno | VARCHAR(50) | Shift key |
| idnegocio | INT | Business ID |
| usuarioauditoria | VARCHAR(100) | User who processed payment |
| fechamodificacionauditoria | DATETIME | Last modification timestamp |

## Payment Flows

### 1. Simple Payment (Efectivo/Transferencia)

**Used for:** Single payment method transactions

**Process:**
1. User opens payment module from PageVentas
2. Selects payment method (Efectivo or Transferencia)
3. Optionally selects a discount
4. For Efectivo: Enters amount received (system calculates change)
5. For Transferencia: Enters reference number
6. Clicks COBRAR button
7. System updates `tblposcrumenwebventas`:
   - `estadodeventa = 'COBRADO'`
   - `estatusdepago = 'PAGADO'`
   - `importedepago` = total paid
   - `descuentos` = discount amount
   - `totaldeventa` = subtotal - descuentos
   - `tiempototaldeventa` = current timestamp
   - Updates audit fields
8. Updates all sale details to `estadodetalle = 'COBRADO'`
9. Closes modal and returns to dashboard

**API Endpoint:** `POST /api/pagos/simple`

**Request Body:**
```json
{
  "idventa": 123,
  "formadepago": "EFECTIVO" | "TRANSFERENCIA",
  "importedepago": 100.00,
  "montorecibido": 150.00,  // Optional, for EFECTIVO
  "referencia": "REF123",   // Required for TRANSFERENCIA
  "descuento": 10.00        // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pago procesado exitosamente",
  "data": {
    "idventa": 123,
    "folioventa": "FOLIO123",
    "totaldeventa": 90.00,
    "importedepago": 100.00,
    "cambio": 50.00
  }
}
```

### 2. Mixed Payment (MIXTO)

**Used for:** Multiple payment methods in a single transaction

**Process:**
1. User opens payment module from PageVentas
2. Selects "Mixto" payment method
3. Adds multiple payment entries with different methods
4. Optionally selects a discount
5. Validates all entries (amounts, references)
6. Clicks COBRAR button
7. System:
   - Updates `tblposcrumenwebventas`:
     - `formadepago = 'MIXTO'`
     - `importedepago` = total paid (including previous payments)
     - `estatusdepago` = 'PENDIENTE', 'PARCIAL', or 'PAGADO' (based on total)
     - `estadodeventa = 'COBRADO'` (if fully paid)
   - Inserts records into `tblposcrumenwebdetallepagos` for each payment
   - If total paid ≥ total sale: Updates details to `estadodetalle = 'COBRADO'`
8. Closes modal and returns to dashboard

**API Endpoint:** `POST /api/pagos/mixto`

**Request Body:**
```json
{
  "idventa": 123,
  "detallesPagos": [
    {
      "formadepagodetalle": "EFECTIVO",
      "totaldepago": 50.00,
      "referencia": null
    },
    {
      "formadepagodetalle": "TRANSFERENCIA",
      "totaldepago": 40.00,
      "referencia": "REF456"
    }
  ],
  "descuento": 10.00  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pago completado exitosamente",
  "data": {
    "idventa": 123,
    "folioventa": "FOLIO123",
    "totaldeventa": 90.00,
    "totalPagado": 90.00,
    "estatusdepago": "PAGADO",
    "pendiente": 0.00
  }
}
```

## Frontend Components

### ModuloPagos Component

**Location:** `src/components/ventas/ModuloPagos.tsx`

**Props:**
- `onClose: () => void` - Callback to close modal
- `totalCuenta: number` - Total sale amount
- `ventaId: number | null` - ID of the sale to process payment for

**Features:**
- Three payment method tabs (Efectivo, Transferencia, Mixto)
- Discount selection and calculation
- Real-time payment validation
- Change calculation for cash payments
- Multiple payment entries for mixed payments
- Payment history display
- Error handling and user feedback

### Payment Service

**Location:** `src/services/pagosService.ts`

**Functions:**
- `procesarPagoSimple(pagoData)` - Process simple payment
- `procesarPagoMixto(pagoData)` - Process mixed payment
- `obtenerDetallesPagos(folioventa)` - Get payment details for a sale

## Security Considerations

1. **Authentication Required:** All payment endpoints require JWT authentication
2. **Business Isolation:** Payments can only be processed for sales belonging to the authenticated user's business
3. **Transaction Safety:** Database operations use transactions to ensure data consistency
4. **Audit Trail:** All payments record user and timestamp information
5. **Validation:** Server-side validation for payment amounts, references, and methods

**Known Issue:** Payment routes are not rate-limited. This should be addressed in a future update by implementing rate limiting middleware.

## Migration

To apply the database changes, run:

```bash
cd backend
npx ts-node src/scripts/applyPaymentMigration.ts
```

Or manually execute the SQL script:

```bash
mysql -u [username] -p [database] < backend/src/scripts/add_payment_functionality.sql
```

## Testing

### Prerequisites
1. Create a sale using the PRODUCIR button in PageVentas
2. Note the `idventa` returned

### Test Cases

1. **Simple Payment - Cash**
   - Open payment module
   - Select Efectivo
   - Enter amount greater than or equal to total
   - Verify change calculation
   - Process payment
   - Verify sale status changes to COBRADO

2. **Simple Payment - Transfer**
   - Open payment module
   - Select Transferencia
   - Enter reference number
   - Process payment
   - Verify sale status changes to COBRADO

3. **Mixed Payment - Full Payment**
   - Open payment module
   - Select Mixto
   - Add multiple payment entries totaling the sale amount
   - Process payment
   - Verify payment details are recorded
   - Verify sale status changes to COBRADO

4. **Mixed Payment - Partial Payment**
   - Open payment module
   - Select Mixto
   - Add payment entries less than the sale amount
   - Process payment
   - Verify estatusdepago is PARCIAL
   - Add more payments to complete
   - Verify status changes to PAGADO

5. **Discount Application**
   - Select a discount before processing payment
   - Verify total is adjusted
   - Process payment
   - Verify discount is recorded in database

## Troubleshooting

### "No se ha seleccionado una venta para cobrar"
**Cause:** Payment module opened without a valid `ventaId`
**Solution:** Use the PRODUCIR button before opening payment module

### "El número de referencia es requerido para pagos con TRANSFERENCIA"
**Cause:** Missing reference number for transfer payment
**Solution:** Enter a reference number in the input field

### "El importe de pago no puede ser menor al total de la venta"
**Cause:** Payment amount is less than the sale total for simple payment
**Solution:** Enter the full amount or use mixed payment for partial payments

## Future Enhancements

1. Add rate limiting to payment endpoints
2. Implement payment receipts/invoices
3. Add support for payment cancellation/refund
4. Implement payment history view per sale
5. Add payment analytics and reports
6. Support for tips/propinas in payment flow
7. Integration with payment gateways for card payments
