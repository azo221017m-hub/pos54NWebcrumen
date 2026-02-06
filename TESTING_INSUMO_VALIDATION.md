# Manual Testing Guide - Insumo Name Validation

## Overview
This document provides manual testing steps to verify the insumo name validation functionality.

## Prerequisites
- Backend server running
- Frontend application running
- Valid user credentials with access to insumos
- At least one cuenta contable and one proveedor in the database

## Test Cases

### Test Case 1: Create New Insumo with Valid Name
**Objective**: Verify that a new insumo can be created with a unique name

**Steps**:
1. Navigate to "Gestión de Insumos" page
2. Click "Nuevo Insumo" button
3. Enter the following data:
   - Nombre: "Harina de Trigo Test"
   - Unidad de Medida: "kilo"
   - Stock Mínimo: 10
   - Select a Grupo de Movimiento (cuenta contable)
   - Select a Proveedor
4. Click outside the "Nombre" field (to trigger validation)
5. Click "Guardar" button

**Expected Result**:
- No validation error appears
- Success message: "Insumo creado exitosamente"
- New insumo appears in the list
- Form closes automatically

---

### Test Case 2: Create New Insumo with Duplicate Name (Exact Match)
**Objective**: Verify that duplicate names are rejected

**Steps**:
1. Navigate to "Gestión de Insumos" page
2. Click "Nuevo Insumo" button
3. Enter the following data:
   - Nombre: Use the same name as an existing insumo (e.g., "Harina de Trigo Test")
   - Unidad de Medida: "kilo"
   - Stock Mínimo: 5
4. Click outside the "Nombre" field (to trigger validation)

**Expected Result**:
- Error message appears below nombre field: "Ya existe un insumo con ese nombre"
- "Guardar" button remains enabled but clicking it shows error message
- Form does not close

---

### Test Case 3: Create New Insumo with Duplicate Name (Case Insensitive)
**Objective**: Verify that case-insensitive duplicate names are rejected

**Steps**:
1. Navigate to "Gestión de Insumos" page
2. Click "Nuevo Insumo" button
3. Enter the following data:
   - Nombre: Use the same name as an existing insumo but with different case (e.g., "HARINA DE TRIGO TEST" or "harina de trigo test")
   - Unidad de Medida: "kilo"
   - Stock Mínimo: 5
4. Click outside the "Nombre" field (to trigger validation)

**Expected Result**:
- Error message appears below nombre field: "Ya existe un insumo con ese nombre"
- "Guardar" button remains enabled but clicking it shows error message
- Form does not close

---

### Test Case 4: Update Insumo with Same Name (No Change)
**Objective**: Verify that updating an insumo without changing the name is allowed

**Steps**:
1. Navigate to "Gestión de Insumos" page
2. Click "Editar" on an existing insumo
3. Change Stock Mínimo to a different value
4. Do NOT change the "Nombre" field
5. Click outside any field
6. Click "Actualizar" button

**Expected Result**:
- No validation error appears
- Success message: "Insumo actualizado exitosamente"
- Changes are saved
- Form closes automatically

---

### Test Case 5: Update Insumo with Duplicate Name
**Objective**: Verify that updating an insumo to have a name that already exists (on a different insumo) is rejected

**Steps**:
1. Create two insumos: "Insumo A" and "Insumo B"
2. Navigate to "Gestión de Insumos" page
3. Click "Editar" on "Insumo A"
4. Change nombre to "Insumo B"
5. Click outside the "Nombre" field (to trigger validation)

**Expected Result**:
- Error message appears below nombre field: "Ya existe un insumo con ese nombre"
- Form does not close when clicking "Actualizar"

---

### Test Case 6: Verify ID Mapping for Cuenta Contable
**Objective**: Verify that id_cuentacontable is correctly stored

**Steps**:
1. Navigate to "Gestión de Insumos" page
2. Click "Nuevo Insumo" button
3. Fill required fields including selecting a Grupo de Movimiento (e.g., "Compra de Insumos")
4. Save the insumo
5. Check the database or API response to verify:
   - `id_cuentacontable` field contains the ID (number) not the name

**Expected Result**:
- `id_cuentacontable` contains the correct ID from tblposcrumenwebcuentacontable
- The dropdown displayed the name, but the ID was stored

---

### Test Case 7: Verify ID Mapping for Proveedor
**Objective**: Verify that idproveedor is correctly stored

**Steps**:
1. Navigate to "Gestión de Insumos" page
2. Click "Nuevo Insumo" button
3. Fill required fields including selecting a Proveedor (e.g., "Proveedor XYZ")
4. Save the insumo
5. Check the database or API response to verify:
   - `idproveedor` field contains the ID (number) not the name

**Expected Result**:
- `idproveedor` contains the correct ID from tblposcrumenwebproveedores
- The dropdown displayed the name, but the ID was stored

---

### Test Case 8: Validation Loading State
**Objective**: Verify that the validation loading state is displayed

**Steps**:
1. Navigate to "Gestión de Insumos" page
2. Click "Nuevo Insumo" button
3. Enter a name in the "Nombre" field
4. Click outside the field to trigger validation
5. Observe the loading message

**Expected Result**:
- A message "Validando nombre..." appears briefly while validation is in progress
- The "Nombre" field is disabled during validation
- The "Guardar" button is disabled during validation
- Loading message disappears once validation completes

---

### Test Case 9: Backend Validation on Create
**Objective**: Verify that backend validation works even if frontend validation is bypassed

**Steps**:
1. Use API testing tool (like Postman or curl) to call POST /api/insumos
2. Send a request with a nombre that already exists for the same idnegocio
3. Include valid authentication token

**Expected Result**:
- HTTP 409 Conflict status code
- Response body contains: `{ "message": "Ya existe un insumo con ese nombre para este negocio" }`

---

### Test Case 10: Backend Validation on Update
**Objective**: Verify that backend validation works on update

**Steps**:
1. Use API testing tool to call PUT /api/insumos/:id
2. Send a request with a nombre that already exists for a different insumo with the same idnegocio
3. Include valid authentication token

**Expected Result**:
- HTTP 409 Conflict status code
- Response body contains: `{ "message": "Ya existe un insumo con ese nombre para este negocio" }`

---

## Database Verification Queries

### Verify No Duplicate Names per Business
```sql
SELECT nombre, idnegocio, COUNT(*) as count
FROM tblposcrumenwebinsumos
GROUP BY LOWER(nombre), idnegocio
HAVING COUNT(*) > 1;
```
**Expected**: No rows returned (no duplicates)

### Verify ID Mappings
```sql
SELECT 
    i.id_insumo,
    i.nombre as insumo_nombre,
    i.id_cuentacontable,
    cc.nombrecuentacontable,
    i.idproveedor,
    p.nombre as proveedor_nombre
FROM tblposcrumenwebinsumos i
LEFT JOIN tblposcrumenwebcuentacontable cc ON i.id_cuentacontable = cc.id_cuentacontable
LEFT JOIN tblposcrumenwebproveedores p ON i.idproveedor = p.id_proveedor
WHERE i.idnegocio = ?;
```
**Expected**: All insumos have proper JOINs showing the correct cuenta contable and proveedor names

---

## Accessibility Testing

### Test Case 11: Screen Reader Compatibility
**Objective**: Verify that validation messages are announced to screen readers

**Steps**:
1. Enable a screen reader (NVDA, JAWS, VoiceOver, etc.)
2. Navigate to "Gestión de Insumos" page
3. Click "Nuevo Insumo" button
4. Enter a name in the "Nombre" field
5. Tab out of the field to trigger validation

**Expected Result**:
- Screen reader announces "Validando nombre..." message
- Screen reader announces error message if name exists
- All interactive elements have proper focus indicators

---

## Error Scenarios

### Test Case 12: Network Error During Validation
**Objective**: Verify graceful handling of network errors

**Steps**:
1. Open browser developer tools
2. Navigate to "Gestión de Insumos" page
3. Set network throttling to "Offline" in developer tools
4. Click "Nuevo Insumo" button
5. Enter a name and tab out

**Expected Result**:
- Error is logged to console
- User sees an error message or validation continues to backend
- Application remains functional

---

## Notes
- All tests should be performed for both creating and updating insumos
- Test with different user accounts to verify idnegocio isolation
- Verify that insumos from different businesses can have the same name
