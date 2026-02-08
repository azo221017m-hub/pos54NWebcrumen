# Quick Testing Guide: SOLICITAR and Existencia Fixes

## Overview
This PR fixes two critical issues in FormularioMovimiento:
1. SOLICITAR button validation (prevents submission with incomplete data)
2. Existencia field displays stock_actual correctly (not from ultima compra API)

---

## Quick Test Scenarios

### ✅ Test 1: Validation Prevents Empty Submission (2 minutes)

**Steps:**
1. Navigate to Movimientos de Inventario
2. Click "Nuevo Movimiento"
3. Click "+ INSUMO" button
4. Do NOT select an insumo or enter quantity
5. Click "SOLICITAR" button

**Expected Result:**
- Alert appears: "Todos los insumos deben tener seleccionado un producto y una cantidad mayor a cero"
- Form does NOT submit
- Modal stays open

**Pass/Fail:** ____

---

### ✅ Test 2: Validation Requires Quantity (2 minutes)

**Steps:**
1. Navigate to Movimientos de Inventario
2. Click "Nuevo Movimiento"
3. Click "+ INSUMO" button
4. Select an insumo from dropdown
5. Leave cantidad as 0 (or empty)
6. Click "SOLICITAR" button

**Expected Result:**
- Alert appears: "Todos los insumos deben tener seleccionado un producto y una cantidad mayor a cero"
- Form does NOT submit
- Modal stays open

**Pass/Fail:** ____

---

### ✅ Test 3: Valid Submission Works (3 minutes)

**Steps:**
1. Navigate to Movimientos de Inventario
2. Click "Nuevo Movimiento"
3. Select "COMPRA" as motivo
4. Click "+ INSUMO" button
5. Select an insumo from dropdown
6. Enter cantidad: 10
7. Select a proveedor (optional)
8. Click "SOLICITAR" button

**Expected Result:**
- Success message: "Movimiento creado correctamente"
- Modal closes
- New movimiento appears in the list
- Database record created

**Pass/Fail:** ____

---

### ✅ Test 4: Existencia Shows Correct Value (3 minutes)

**Prerequisites:** 
- You need to know the stock_actual value of at least one insumo
- Check database or insumos page first to verify stock value

**Steps:**
1. Navigate to Movimientos de Inventario
2. Click "Nuevo Movimiento"
3. Click "+ INSUMO" button
4. Select an insumo (e.g., "Azúcar" with stock_actual = 50)
5. Look at the "EXIST." column in the table

**Expected Result:**
- EXIST. field shows the correct stock_actual value (50 in example)
- Value matches what you see in the insumos list/database
- Value is NOT from ultima compra (verify in browser console logs)

**Console Check:**
- Open browser DevTools (F12)
- Check console for log: "EXIST.: [number]"
- This should match the stock_actual from insumo

**Pass/Fail:** ____

---

### ✅ Test 5: Multiple Rows Validation (4 minutes)

**Steps:**
1. Navigate to Movimientos de Inventario
2. Click "Nuevo Movimiento"
3. Add 3 rows with "+ INSUMO"
4. Fill Row 1: Select insumo, cantidad = 5
5. Fill Row 3: Select insumo, cantidad = 3
6. Leave Row 2 EMPTY (no insumo selected)
7. Click "SOLICITAR"

**Expected Result:**
- Alert appears about incomplete rows
- Form does NOT submit

**Continue:**
8. Fill Row 2: Select insumo, cantidad = 2
9. Click "SOLICITAR" again

**Expected Result:**
- Success message
- Modal closes
- Movimiento created with 3 detalles

**Pass/Fail:** ____

---

## Regression Tests (Ensure Nothing Broke)

### ✅ Test 6: Other Fields Still Work (2 minutes)

**Steps:**
1. Create a new movimiento with complete data
2. Verify all fields work:
   - ✅ Motivo dropdown changes
   - ✅ Observaciones text input works
   - ✅ COSTO can be edited
   - ✅ PROVEEDOR can be selected
   - ✅ Delete button (trash icon) removes rows

**Pass/Fail:** ____

---

### ✅ Test 7: Toast Message Shows Insumo Info (2 minutes)

**Steps:**
1. Navigate to Movimientos de Inventario
2. Click "Nuevo Movimiento"
3. Click "+ INSUMO"
4. Select an insumo from dropdown
5. Wait for toast notification to appear

**Expected Result:**
- Toast message appears with insumo details:
  - INSUMO: [name]
  - CANT.: [quantity]
  - COSTO: [cost]
  - PROVEEDOR: [supplier]
  - U.M.: [unit]
  - EXIST.: [stock]
  - COSTO POND.: [weighted cost]
  - CANT. ÚLT.: [last purchase quantity]
  - PROV. ÚLT.: [last purchase supplier]
  - COSTO ÚLT.: [last purchase cost]

**Pass/Fail:** ____

---

## Edge Cases

### ✅ Test 8: Zero Cantidad Blocked (1 minute)

**Steps:**
1. Create new movimiento
2. Add row, select insumo
3. Manually set cantidad to 0
4. Click SOLICITAR

**Expected:** Validation error

**Pass/Fail:** ____

---

### ✅ Test 9: Negative Cantidad (1 minute)

**Steps:**
1. Create new movimiento
2. Add row, select insumo
3. Try to enter negative cantidad

**Expected:** Browser should prevent negative numbers (number input type)

**Pass/Fail:** ____

---

### ✅ Test 10: Add/Delete Multiple Times (2 minutes)

**Steps:**
1. Create new movimiento
2. Add 5 rows
3. Delete rows 2 and 4
4. Add 2 more rows
5. Select insumos for all remaining rows
6. Check EXIST. values

**Expected:** All EXIST. values show correctly

**Pass/Fail:** ____

---

## Browser Console Checks

### Debug Logs to Verify

When selecting an insumo, check console for:

```
=== DEBUG: Insumo Seleccionado ===
INSUMO: [name]
CANT.: [number]
COSTO: [number]
PROVEEDOR: [name]
U.M.: [unit]
EXIST.: [number]  ← Should match stock_actual
COSTO POND.: [number]
CANT. ÚLT.: [number]
PROV. ÚLT.: [name]
COSTO ÚLT.: [number]
================================
```

**Verify:** EXIST. value matches the insumo's stock_actual in database

---

## Known Limitations

### Validation is Client-Side Only
- Backend should still validate data
- Frontend validation is for user experience
- Backend validation prevents malicious submissions

### Stock Values Are Cached
- Stock values come from insumos loaded when form opens
- If stock changes in another session, it won't update until form reopens
- This is expected behavior

---

## Bug Report Template

If you find an issue:

**Issue:**
[Describe what went wrong]

**Expected:**
[What should have happened]

**Actual:**
[What actually happened]

**Steps to Reproduce:**
1. 
2. 
3. 

**Browser:**
[Chrome/Firefox/Safari/Edge + version]

**Screenshots:**
[Attach if relevant]

**Console Errors:**
[Copy any errors from browser console]

---

## Success Criteria

All tests should pass:
- ✅ Validation prevents submission with incomplete data
- ✅ Validation shows clear error messages
- ✅ Valid submissions work correctly
- ✅ Existencia shows stock_actual value
- ✅ Multiple rows work correctly
- ✅ No regression in existing functionality

---

## Estimated Testing Time

- Quick Tests: ~15 minutes
- Regression Tests: ~5 minutes
- Edge Cases: ~5 minutes
- **Total: ~25 minutes**

---

**Testing completed by:** _______________
**Date:** _______________
**Result:** ✅ PASS / ❌ FAIL
**Notes:** 
