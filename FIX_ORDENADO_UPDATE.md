# Fix: ORDENADO Value Not Updating in VentasHoy Dashboard Indicator

## Problem Statement
En dashboard : En INDICADOR VentasHoy : Actualizar la etiqueta el valor de ORDENADO. Actualmente no se actualiza.

(In dashboard: In INDICATOR VentasHoy: Update the label for the ORDENADO value. Currently it is not updating.)

## Root Cause Analysis

### Data Flow
1. **PageVentas** → User clicks "Producir" → Creates sale with `estadodeventa='ORDENADO'`
2. **Navigation** → User navigates back to `/dashboard`
3. **Dashboard** → Should show updated ORDENADO value immediately

### The Problem
The dashboard's `resumenVentas` state (which includes `totalOrdenado`) only refreshes in two scenarios:
1. **On component mount** - via useEffect with `[navigate]` dependency
2. **Every 30 seconds** - via setInterval polling

When a user navigates from PageVentas back to Dashboard after creating an ORDENADO sale:
- React Router keeps the Dashboard component mounted (doesn't unmount/remount)
- The useEffect doesn't re-run (navigate dependency hasn't changed)
- User must wait up to 30 seconds for the next interval refresh to see the updated ORDENADO value

## Solution Implemented

### Approach
Added a location-aware useEffect that triggers an immediate refresh when the user navigates to the dashboard path.

### Technical Details

#### 1. Import Required Hooks
```typescript
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
```

#### 2. Add State Variables
```typescript
const location = useLocation();
const isInitialMount = useRef(true);
```

#### 3. Add Location-Based Refresh Effect
```typescript
// Force refresh when navigating back to dashboard (e.g., after creating ORDENADO sale)
useEffect(() => {
  // Skip on initial mount to avoid duplicate API calls
  if (isInitialMount.current) {
    isInitialMount.current = false;
    return;
  }
  
  if (location.pathname === '/dashboard') {
    // Immediately refresh sales data to show updated ORDENADO values
    cargarResumenVentas();
    cargarVentasSolicitadas();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [location.pathname]);
```

### Why This Works
- **React Router's `useLocation`** returns the current location object
- **location.pathname** changes whenever the user navigates to a different route
- **useEffect dependency** `[location.pathname]` ensures the effect runs whenever the path changes
- **isInitialMount ref** prevents duplicate API calls on the first render
- **Conditional check** `if (location.pathname === '/dashboard')` ensures we only refresh on dashboard

## Files Modified
- `src/pages/DashboardPage.tsx`
  - Added imports: `useLocation` and `useRef`
  - Added state: `location` and `isInitialMount`
  - Added new useEffect for location-based refresh

## Testing Guide

### Manual Testing Steps

#### Test 1: ORDENADO Value Updates Immediately
1. Open the application and log in
2. Navigate to Dashboard
3. Note the current "Ordenado" value in the "Ventas Hoy" card
4. Navigate to PageVentas (click "Nueva Venta" or similar)
5. Create a new sale:
   - Add products to the comanda
   - Click "Producir" button
   - This creates a sale with `estadodeventa='ORDENADO'`
6. Observe: You're automatically navigated back to Dashboard
7. **VERIFY**: The "Ordenado" value updates IMMEDIATELY (without waiting 30 seconds)

#### Test 2: No Duplicate Calls on Initial Load
1. Open browser DevTools → Network tab
2. Clear network log
3. Navigate to Dashboard for the first time
4. **VERIFY**: Only ONE call to `/api/ventas-web/resumen/turno-actual` is made
5. (Not two duplicate calls)

#### Test 3: Polling Still Works
1. Stay on Dashboard
2. Open another browser tab
3. Create a new ORDENADO sale via API or another session
4. Return to original Dashboard tab
5. Wait up to 30 seconds
6. **VERIFY**: The ORDENADO value updates via the polling mechanism

#### Test 4: Navigate Between Other Pages
1. From Dashboard, navigate to other pages (e.g., Productos, Insumos, etc.)
2. Navigate back to Dashboard
3. **VERIFY**: Data refreshes immediately when returning to Dashboard
4. **VERIFY**: No errors in console

## Backend Query (Reference)

The `totalOrdenado` value is calculated in `backend/src/controllers/ventasWeb.controller.ts` (getSalesSummary function):

```sql
SELECT 
  COALESCE(SUM(CASE WHEN estadodeventa = 'ORDENADO' THEN totaldeventa ELSE 0 END), 0) as totalOrdenado
FROM tblposcrumenwebventas 
WHERE claveturno = ? AND idnegocio = ?
```

## Performance Impact

### Minimal Overhead
- **Additional API calls**: Only when navigating TO dashboard (expected behavior)
- **Memory**: One additional ref variable (negligible)
- **Render cycles**: No additional renders (useEffect doesn't trigger state changes)

### Benefits
- ✅ Immediate feedback to users
- ✅ Better UX (no waiting 30 seconds)
- ✅ Data consistency
- ✅ No breaking changes to existing functionality

## Edge Cases Handled

1. **Initial mount** - Skipped via `isInitialMount` ref to avoid duplicate calls
2. **Other routes** - Conditional check ensures refresh only on `/dashboard`
3. **No turno abierto** - Backend returns `totalOrdenado: 0` safely
4. **Authentication** - Existing auth checks still apply

## Backwards Compatibility

✅ **Fully backwards compatible**
- Existing polling mechanism still works
- No changes to backend
- No changes to database schema
- No changes to API contracts
- Other components unaffected

## Future Enhancements

Potential improvements for future iterations:

1. **WebSocket/SSE** - Real-time updates instead of polling
2. **Optimistic UI** - Update UI immediately after creating sale, before API call completes
3. **React Query/SWR** - Automatic cache invalidation and refetching
4. **Global refresh trigger** - Context-based refresh mechanism for cross-component updates

## Summary

This fix ensures that the ORDENADO value in the VentasHoy dashboard indicator updates immediately when users navigate back to the dashboard after creating a sale, improving user experience and data consistency.

**Status**: ✅ **IMPLEMENTED AND READY FOR TESTING**

---

**Implementation Date**: February 19, 2026  
**Modified Files**: 1 (`src/pages/DashboardPage.tsx`)  
**Lines Changed**: +22 lines added  
**Breaking Changes**: None
