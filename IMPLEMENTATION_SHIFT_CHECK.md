# Implementation: Shift Check Before Sales (Iniciaventa)

## Overview
This document describes the implementation of the shift (turno) validation logic before allowing users to start a sale in the PageVentas component.

## Requirements
From the problem statement (Spanish):
- **En el menú Iniciaventa**: SI `tblposcrumenwebturnos.estatusturno=abierto` y `tblposcrumenwebturnos.idnegocio= idnegocio` del usuario que hizo login ENTONCES mostrar Modal "Seleccione tipo de venta"
- SI no existe ningún registro con `tblposcrumenwebturnos.estatusturno=abierto` y `tblposcrumenwebturnos.idnegocio= idnegocio` del usuario que hizo login ENTONCES mostrar de manera MODAL el formulario "Inicia turno"

Translation:
- In the Iniciaventa menu (PageVentas): IF there is an open shift (`estatusturno=abierto`) for the logged-in user's business (`idnegocio`), THEN show the "Select sale type" modal
- IF there is NO open shift for the logged-in user's business, THEN show the "Start shift" modal

## Implementation Details

### 1. Service Layer (`src/services/turnosService.ts`)
Added a new function to check for open shifts:

```typescript
export const verificarTurnoAbierto = async (): Promise<Turno | null> => {
  try {
    console.log('Servicio: Verificando si existe turno abierto');
    const turnos = await obtenerTurnos();
    // Filter for open shifts (estatusturno = 'abierto')
    const turnoAbierto = turnos.find(turno => turno.estatusturno === 'abierto');
    if (turnoAbierto) {
      console.log('Servicio: Turno abierto encontrado:', turnoAbierto.claveturno);
    } else {
      console.log('Servicio: No se encontró turno abierto');
    }
    return turnoAbierto || null;
  } catch (error) {
    console.error('Error en servicio verificarTurnoAbierto:', error);
    throw error;
  }
};
```

**How it works:**
- Calls `obtenerTurnos()` which already filters by the authenticated user's `idnegocio` (via JWT token in the backend)
- Searches for a turno with `estatusturno === 'abierto'`
- Returns the turno if found, or `null` if not found

### 2. Modal Component (`src/components/turnos/ModalIniciaTurno.tsx`)
Created a modal version of the IniciaTurno component:

**Key features:**
- Modal overlay that displays over the PageVentas
- Form fields:
  - Fondo de Caja (cash float) - required
  - Objetivo de venta (sales target) - optional
- Calls `crearTurno()` API when user clicks "Iniciar TURNO"
- Shows loading state while creating the shift
- Notifies parent component when shift is successfully created
- Displays personalized message with user's alias

**Props:**
```typescript
interface ModalIniciaTurnoProps {
  isOpen: boolean;
  onTurnoIniciado: (turnoId: number, claveturno: string) => void;
  usuarioAlias?: string;
}
```

### 3. PageVentas Integration (`src/pages/PageVentas/PageVentas.tsx`)

#### Added State Variables
```typescript
// Turno states
const [showIniciaTurnoModal, setShowIniciaTurnoModal] = useState(false);
const [hasTurnoAbierto, setHasTurnoAbierto] = useState<boolean | null>(null);
const [isCheckingTurno, setIsCheckingTurno] = useState(true);
```

#### Check for Open Turno on Component Mount
```typescript
useEffect(() => {
  const checkTurno = async () => {
    // Only check if not loaded from dashboard
    if (!isLoadedFromDashboard) {
      try {
        setIsCheckingTurno(true);
        const turnoAbierto = await verificarTurnoAbierto();
        setHasTurnoAbierto(turnoAbierto !== null);
        
        // If no open turno, show IniciaTurno modal
        if (turnoAbierto === null) {
          console.log('No hay turno abierto, mostrando modal Inicia Turno');
          setTimeout(() => {
            setShowIniciaTurnoModal(true);
          }, SELECTION_MODAL_DISPLAY_DELAY_MS);
        }
      } catch (error) {
        console.error('Error al verificar turno:', error);
        // On error, allow user to proceed
        setHasTurnoAbierto(true);
      } finally {
        setIsCheckingTurno(false);
      }
    } else {
      // If loaded from dashboard, skip turno check
      setHasTurnoAbierto(true);
      setIsCheckingTurno(false);
    }
  };

  checkTurno();
}, [isLoadedFromDashboard]);
```

#### Updated Selection Modal Logic
Modified the existing useEffect that shows the sale type selection modal to only show when there's an open turno:

```typescript
useEffect(() => {
  // Only show if:
  // - Not loaded from dashboard
  // - Service is not configured
  // - Comanda is empty
  // - Has open turno (shift)
  // - Not checking turno
  if (!isLoadedFromDashboard && !isServiceConfigured && comanda.length === 0 && hasTurnoAbierto && !isCheckingTurno) {
    const timer = setTimeout(() => {
      setShowSelectionModal(true);
    }, SELECTION_MODAL_DISPLAY_DELAY_MS);

    return () => clearTimeout(timer);
  } else {
    setShowSelectionModal(false);
  }
}, [comanda.length, isServiceConfigured, isLoadedFromDashboard, hasTurnoAbierto, isCheckingTurno]);
```

#### Handler for Turno Initiated
```typescript
const handleTurnoIniciado = (turnoId: number, claveturno: string) => {
  console.log('Turno iniciado exitosamente:', turnoId, claveturno);
  setShowIniciaTurnoModal(false);
  setHasTurnoAbierto(true);
  // After turno is opened, show selection modal
  setTimeout(() => {
    setShowSelectionModal(true);
  }, SELECTION_MODAL_DISPLAY_DELAY_MS);
};
```

#### Render Modal
```typescript
{/* Modal para iniciar turno */}
<ModalIniciaTurno
  isOpen={showIniciaTurnoModal}
  onTurnoIniciado={handleTurnoIniciado}
  usuarioAlias={usuario?.alias}
/>
```

## Flow Diagram

```
User navigates to /ventas
         |
         v
PageVentas component loads
         |
         v
Check: Is loaded from dashboard?
    |           |
   YES          NO
    |           |
    v           v
Skip turno    Call verificarTurnoAbierto()
check         (checks for estatusturno='abierto'
    |          for user's idnegocio)
    |              |
    |              v
    |         Has open turno?
    |         |            |
    |        YES           NO
    |         |            |
    v         v            v
Show sale   Show sale   Show IniciaTurno
type        type        modal
selection   selection       |
modal       modal           v
                       User fills form
                       and clicks "Iniciar TURNO"
                            |
                            v
                       API creates turno
                       (POST /api/turnos)
                            |
                            v
                       Success → Show sale
                                type selection
                                modal
```

## Backend API

The implementation relies on the existing backend endpoint:

**GET /api/turnos**
- Requires authentication (JWT token)
- Automatically filters by the authenticated user's `idnegocio`
- Returns array of turnos for the user's business

The service function `verificarTurnoAbierto()` filters this array for shifts with `estatusturno === 'abierto'`.

**POST /api/turnos**
- Creates a new turno (shift)
- Automatically sets:
  - `idnegocio` from authenticated user
  - `usuarioturno` from authenticated user's alias
  - `estatusturno = 'abierto'`
  - `fechainicioturno = NOW()`
  - Generates `numeroturno` and `claveturno`
- Returns created turno info

## Testing Instructions

To test this functionality:

1. **Scenario 1: No open shift**
   - Ensure there are no open shifts for the test user's business in `tblposcrumenwebturnos`
   - Log in as a user
   - Navigate to `/ventas`
   - Expected: ModalIniciaTurno should appear
   - Fill in the form and click "Iniciar TURNO"
   - Expected: Modal closes, and ModalSeleccionVentaPageVentas appears

2. **Scenario 2: Open shift exists**
   - Ensure there is an open shift for the test user's business (estatusturno='abierto')
   - Log in as the same user
   - Navigate to `/ventas`
   - Expected: ModalSeleccionVentaPageVentas appears immediately (no IniciaTurno modal)

3. **Scenario 3: Loaded from dashboard**
   - From Dashboard, click on an existing sale to edit
   - Expected: Both modals are skipped, sale loads directly

## Files Changed

1. `src/services/turnosService.ts` - Added `verificarTurnoAbierto()` function
2. `src/components/turnos/ModalIniciaTurno.tsx` - New modal component
3. `src/components/turnos/ModalIniciaTurno.css` - New modal styles
4. `src/pages/PageVentas/PageVentas.tsx` - Integrated turno check logic

## Notes

- The turno check is only performed when accessing PageVentas directly (not when loading from dashboard)
- If there's an error checking for turnos, the system allows the user to proceed (fail-safe)
- The modal cannot be dismissed by clicking outside - user must either start a turno or navigate away
- After successfully starting a turno, the sale type selection modal appears automatically
