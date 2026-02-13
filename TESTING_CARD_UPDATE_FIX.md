# Testing Guide: Card Update Fix After Payment

## Problem Statement
When pressing COBRAR (pay button) in PageVentas ModuloPagos or Dashboard card, the card components in the lists don't update after INSERT or UPDATE operations (payments).

## Solution Implemented
Created TanStack Query mutation hooks for payment processing that automatically invalidate relevant queries after successful payment operations.

## Testing Scenarios

### Scenario 1: Simple Payment from Dashboard (Efectivo)

**Steps:**
1. Navigate to Dashboard
2. Locate a comanda in "Comandas del Día" section
3. Click the "Pagar" button on a comanda card
4. In ModuloPagos:
   - Select "Efectivo" payment method
   - Enter amount received (equal or greater than total)
   - Click "COBRAR" button
5. Close the payment modal (should auto-close after success)
6. Return to Dashboard

**Expected Results:**
- ✅ Payment should process successfully
- ✅ Alert should show "Pago procesado exitosamente" with change if applicable
- ✅ Dashboard should refresh automatically
- ✅ Comanda card should update to show new payment status
- ✅ "Ventas Hoy" card should show updated totals
- ✅ "Salud de mi Negocio" card should reflect new data
- ✅ Console should log: "✅ Pago simple exitoso, invalidando queries..."

### Scenario 2: Simple Payment from PageVentas (Transferencia)

**Steps:**
1. Navigate to Dashboard
2. Click "Ver detalle" on a comanda card
3. In PageVentas, click the "COBRAR" button
4. In ModuloPagos:
   - Select "Transferencia" payment method
   - Enter reference number
   - Click "COBRAR" button
5. Navigate back to Dashboard

**Expected Results:**
- ✅ Payment should process successfully
- ✅ Alert should show "Pago procesado exitosamente"
- ✅ Should navigate back to Dashboard
- ✅ Dashboard should show updated data immediately
- ✅ Comanda card should reflect the payment

### Scenario 3: Mixed Payment (Pago Mixto)

**Steps:**
1. Navigate to Dashboard
2. Click "Pagar" on a comanda card
3. In ModuloPagos:
   - Select "Mixto" payment method
   - Add payment details (e.g., Efectivo $100, Transferencia $50)
   - Enter reference for transferencia
   - Click "COBRAR" button
4. Return to Dashboard

**Expected Results:**
- ✅ Payment should process successfully
- ✅ Alert should show payment success message
- ✅ Dashboard should refresh with updated data
- ✅ "Pagos realizados" section should show the registered payments
- ✅ Console should log: "✅ Pago mixto exitoso, invalidando queries..."

### Scenario 4: Multiple Sequential Payments

**Steps:**
1. Process payment for Comanda A
2. Immediately process payment for Comanda B
3. Check Dashboard updates

**Expected Results:**
- ✅ Both payments should process successfully
- ✅ Dashboard should update after each payment
- ✅ No stale data should be displayed
- ✅ All cards should reflect current state

## Technical Verification

### Query Invalidation Check
Open browser console and look for these log messages after successful payment:
```
✅ Pago simple exitoso, invalidando queries...
```
or
```
✅ Pago mixto exitoso, invalidando queries...
```

### React Query DevTools
If React Query DevTools is available:
1. Open DevTools
2. Process a payment
3. Check that these queries are invalidated:
   - `['ventasWeb', 'list']`
   - `['resumenVentas']`
   - `['saludNegocio']`
   - `['pagos', 'detail', <folioventa>]`
   - `['ventasWeb', 'detail', <idventa>]`

### Network Tab Verification
1. Open Browser Developer Tools → Network tab
2. Process a payment
3. After payment success, verify new GET requests are made for:
   - `/ventasweb` (comandas list)
   - `/ventasweb/resumen` (sales summary)
   - `/ventasweb/salud-negocio` (business health)

## Edge Cases to Test

### Edge Case 1: Payment with Discount
1. Select a discount before payment
2. Process payment
3. Verify dashboard updates with discounted amount

### Edge Case 2: Partial Mixed Payment
1. Make a partial mixed payment
2. Verify "Pagos realizados" shows correctly
3. Make another payment to complete
4. Verify final status updates

### Edge Case 3: Payment Failure
1. Attempt payment with invalid data
2. Verify error message shows
3. Verify dashboard state doesn't change
4. Correct the data and retry
5. Verify successful payment updates dashboard

## Success Criteria

All of the following must be true for the fix to be considered successful:

- [ ] No manual refresh needed to see updated data in Dashboard
- [ ] Card components update immediately after successful payment
- [ ] Console logs show query invalidation messages
- [ ] Network requests are made automatically to fetch fresh data
- [ ] Multiple consecutive payments work without issues
- [ ] Error cases are handled gracefully without breaking state
- [ ] No TypeScript compilation errors
- [ ] Existing payment functionality remains unchanged

## Files Changed

1. **Created:** `src/hooks/queries/usePagos.ts`
   - Contains mutation hooks with automatic query invalidation

2. **Modified:** `src/components/ventas/ModuloPagos.tsx`
   - Updated to use mutation hooks instead of direct service calls
   - Uses `mutateAsync` for async/await pattern

3. **Modified:** `src/hooks/queries/index.ts`
   - Exports new payment hooks

## Rollback Plan

If issues are found, rollback steps:
1. Revert ModuloPagos.tsx to use direct service calls
2. Remove usePagos.ts file
3. Remove export from index.ts

The service functions remain unchanged, so reverting is safe.
