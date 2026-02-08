# Fix: FormularioMovimientos 404 Error on SOLICITAR Button

## Problem Statement

When clicking the SOLICITAR button in the FormularioMovimientos component, the application would fail with a 404 error and no database insert would occur.

### Error Message
```
Error al guardar movimiento: AxiosError: Request failed with status code 404
code: "ERR_BAD_REQUEST"
message: "Request failed with status code 404"
name: "AxiosError"
status: 404
```

## Root Cause Analysis

The `movimientosService.ts` file was using an outdated pattern for making API calls:

```typescript
// OLD PATTERN (BROKEN)
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const crearMovimiento = async (movimiento: MovimientoCreate) => {
  const response = await axios.post(
    `${API_URL}/movimientos`,
    movimiento,
    getAuthHeaders()
  );
  return response.data.data;
};
```

### Why This Was Broken

1. **Inconsistent URL Construction**: The hardcoded fallback included `/api` (`'http://localhost:3000/api'`), but in production, `VITE_API_URL` might be set without `/api` causing double or missing `/api` in the URL path.

2. **Manual Header Management**: The service manually managed authentication headers, which could get out of sync with the application's auth state.

3. **No Centralized Error Handling**: Each service handled errors independently, missing out on centralized error interceptors for token expiration, 401/403 handling, etc.

## Solution

Migrated `movimientosService.ts` to use the centralized `apiClient` pattern that's already used by other services in the application.

```typescript
// NEW PATTERN (FIXED)
import apiClient from './api';

const API_BASE = '/movimientos';

export const crearMovimiento = async (movimiento: MovimientoCreate) => {
  const response = await apiClient.post<MovimientoResponse>(API_BASE, movimiento);
  if (!response.data.data) {
    throw new Error('No se pudo crear el movimiento');
  }
  return response.data.data;
};
```

### Why This Works

1. **Centralized URL Configuration**: The `apiClient` uses `api.config.ts` which properly constructs the base URL:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL 
     ? `${import.meta.env.VITE_API_URL}/api`
     : 'http://localhost:3000/api';
   ```

2. **Automatic Header Injection**: The `apiClient` has an interceptor that automatically adds the JWT token from localStorage to every request.

3. **Centralized Error Handling**: The `apiClient` has response interceptors that handle 401 (auto-logout), 403, and other common errors consistently across the application.

4. **Consistent with Other Services**: Now matches the pattern used by `insumosService.ts`, `proveedoresService.ts`, `ventasWebService.ts`, etc.

## Changes Made

**File Modified**: `src/services/movimientosService.ts`

### Imports Changed
- ❌ Removed: `import axios from 'axios'`
- ✅ Added: `import apiClient from './api'`

### Configuration Changed
- ❌ Removed: `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'`
- ❌ Removed: `getAuthHeaders()` helper function
- ✅ Added: `const API_BASE = '/movimientos'`

### Functions Updated (7 total)
1. `obtenerMovimientos()` - List all movements
2. `obtenerMovimientoPorId(id)` - Get movement by ID
3. `crearMovimiento(movimiento)` - **CREATE** (this fixes the SOLICITAR button)
4. `actualizarMovimiento(id, movimiento)` - Update movement
5. `eliminarMovimiento(id)` - Delete movement
6. `procesarMovimiento(id)` - Process pending movement
7. `obtenerUltimaCompra(idInsumo)` - Get last purchase data

## Testing

### Build Verification
✅ **Status**: Passed
- TypeScript compilation successful
- Vite build completed without errors
- Bundle size: 1,080.76 kB

### Code Review
✅ **Status**: No issues found
- No code review comments
- Code follows established patterns

### Security Scan
✅ **Status**: No vulnerabilities
- CodeQL JavaScript analysis: 0 alerts
- No security issues detected

## Expected Behavior After Fix

### Before Fix
1. User fills out FormularioMovimientos form
2. User clicks SOLICITAR button
3. ❌ 404 error occurs
4. ❌ No database insert
5. ❌ Error message displayed

### After Fix
1. User fills out FormularioMovimientos form
2. User clicks SOLICITAR button
3. ✅ API call to `/api/movimientos` succeeds
4. ✅ Database insert occurs
5. ✅ Success message displayed
6. ✅ List refreshes with new movement

## API Endpoint Verification

The backend endpoint is correctly configured:

**File**: `backend/src/routes/movimientos.routes.ts`
```typescript
router.post('/', crearMovimiento);  // POST /api/movimientos
```

**File**: `backend/src/app.ts`
```typescript
app.use('/api/movimientos', movimientosRoutes);
```

**Expected URL**: `POST https://pos54nwebcrumen.onrender.com/api/movimientos`

## Related Files

- ✅ **Frontend Service**: `src/services/movimientosService.ts` (FIXED)
- ✅ **API Client**: `src/services/api.ts` (No changes needed)
- ✅ **API Config**: `src/config/api.config.ts` (No changes needed)
- ✅ **Backend Route**: `backend/src/routes/movimientos.routes.ts` (Already correct)
- ✅ **Backend Controller**: `backend/src/controllers/movimientos.controller.ts` (Already correct)

## Impact

- **Scope**: Minimal - Only modified 1 file
- **Risk**: Low - Follows established patterns used by other services
- **Breaking Changes**: None
- **Dependencies**: No new dependencies added

## Verification Steps

To verify the fix works in production:

1. **Login** to the application
2. Navigate to **Movimientos de Inventario**
3. Click **Nuevo Movimiento**
4. Fill in the form:
   - Select motivo de movimiento (e.g., COMPRA)
   - Click **+ INSUMO**
   - Select an insumo from the dropdown
   - Enter cantidad and costo
   - Select a proveedor
5. Click **SOLICITAR** button
6. **Expected**: Success message appears
7. **Expected**: Movement appears in the list
8. **Expected**: No 404 error in console

## Notes

- This fix addresses the specific 404 error when creating movements via SOLICITAR button
- All other movement operations (list, edit, delete, process) also benefit from the improved error handling
- The fix aligns the codebase with best practices already used throughout the application
- No changes needed in FormularioMovimiento component itself - the fix is at the service layer
