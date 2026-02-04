# Visual Guide - Seat Assignment and Shift Closing Changes

## 1. CierreTurno Component Changes

### Before
The CierreTurno component would allow closing a shift based only on the cash count (arqueo).

### After
Now includes real-time validation against open comandas:

#### When NO Open Comandas Exist:
```
┌─────────────────────────────────────────────────────┐
│  Usted está CERRANDO el turno         ID: 2602041   │
│                                                       │
│  [Retiro de fondo]                                   │
│  [Cash denomination counter]                         │
│                                                       │
│  Estatus del cierre: ✓ Cierre sin novedades         │
│                      (green background)              │
│                                                       │
│  [ Cerrar TURNO ]  [ CANCELAR ]                      │
│     (enabled)        (enabled)                       │
└─────────────────────────────────────────────────────┘
```

#### When Open Comandas Exist:
```
┌─────────────────────────────────────────────────────┐
│  Usted está CERRANDO el turno         ID: 2602041   │
│                                                       │
│  [Retiro de fondo]                                   │
│  [Cash denomination counter]                         │
│                                                       │
│  Estatus del cierre: ⚠ NO PUEDE CERRAR TURNO,       │
│                         Existen comandas abiertas    │
│                      (red background)                │
│                                                       │
│  [ Cerrar TURNO ]  [ CANCELAR ]                      │
│    (DISABLED)        (enabled)                       │
└─────────────────────────────────────────────────────┘
```

#### Loading State:
```
┌─────────────────────────────────────────────────────┐
│  Usted está CERRANDO el turno         ID: 2602041   │
│                                                       │
│  [Retiro de fondo]                                   │
│  [Cash denomination counter]                         │
│                                                       │
│  Estatus del cierre: ⌛ Verificando comandas...      │
│                      (blue background)               │
│                                                       │
│  [ Cerrar TURNO ]  [ CANCELAR ]                      │
│    (DISABLED)        (enabled)                       │
└─────────────────────────────────────────────────────┘
```

**Color Legend:**
- 🟢 Green (`#bbf7d0` to `#86efac`): No issues, can close shift
- 🔴 Red (`#fecaca` to `#fca5a5`): Has open comandas, cannot close
- 🔵 Blue (`#dbeafe` to `#bfdbfe`): Loading/verifying

---

## 2. PageVentas Component Changes

### Seat Assignment Button (Mesa Sales Only)

#### When tipoServicio = 'Mesa'
Each product in the comanda now has a seat assignment button:

```
┌────────────────────────────────────────────────────┐
│  Total de cuenta                                   │
├────────────────────────────────────────────────────┤
│  Total: $450.00                                    │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ [3] Hamburguesa                    $150.00   │ │
│  │                                               │ │
│  │ [-] [+] [📝] [🍴 A1]                         │ │
│  │              ^^^ NEW SEAT BUTTON              │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ [2] Pizza                          $300.00   │ │
│  │                                               │ │
│  │ [-] [+] [📝] [🍴 A2]                         │ │
│  │              ^^^ Incremented seat             │ │
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

#### Button Appearance
```
┌──────────────┐
│ 🍴 A1        │  ← Default state
└──────────────┘
   Purple (#9b59b6)

┌──────────────┐
│ 🍴 A2        │  ← After left-click
└──────────────┘
   Purple (#9b59b6)

┌──────────────┐
│ 🍴 A1        │  ← After right-click (reset)
└──────────────┘
   Purple (#9b59b6)
```

#### Seat Button Interaction
- **Left Click**: Increments seat number (A1 → A2 → A3 → A4...)
- **Right Click**: Resets to A1
- **Icon**: Utensils (🍴) from lucide-react
- **Label**: Shows current seat (A1, A2, A3, etc.)
- **Color**: Purple to distinguish from other buttons
- **Only visible when**: `tipoServicio === 'Mesa'`

#### Button States
1. **Normal**: Purple background, white text, clickable
2. **Hover**: Darker purple (#8e44ad)
3. **Disabled**: Gray background (#bdc3c7), reduced opacity, not clickable
   - Disabled when item has ORDENADO status

#### Full Comanda Item with All Buttons
```
┌──────────────────────────────────────────────────┐
│ [3] ▼  Hamburguesa Especial           $150.00   │ ← Quantity, Name, Price
│                                                  │
│ Mod: Sin Cebolla, Extra Queso                   │ ← Moderadores (if any)
│ Nota: Sin pepinillos                            │ ← Notes (if any)
│                                                  │
│ Action Buttons:                                 │
│  ┌────┐ ┌────┐ ┌────┐ ┌─────────┐              │
│  │ -  │ │ +  │ │ 📝 │ │ 🍴 A3  │              │
│  └────┘ └────┘ └────┘ └─────────┘              │
│   Minus  Plus   Note    Seat                    │
│  (green) (green)(orange)(purple)                │
└──────────────────────────────────────────────────┘
```

### When NOT Mesa Service
For 'Llevar' or 'Domicilio' sales, the seat button is not shown:

```
┌──────────────────────────────────────────────────┐
│ [3] ▼  Hamburguesa Especial           $150.00   │
│                                                  │
│ Action Buttons:                                 │
│  ┌────┐ ┌────┐ ┌────┐                          │
│  │ -  │ │ +  │ │ 📝 │   (No seat button)       │
│  └────┘ └────┘ └────┘                          │
└──────────────────────────────────────────────────┘
```

---

## 3. Data Flow

### Seat Assignment Flow
```
1. User selects Mesa service
   ↓
2. Adds products to comanda
   ↓
3. Each item shows seat button (default: A1)
   ↓
4. User clicks/right-clicks to set seat
   ↓
5. User clicks PRODUCIR or ESPERAR
   ↓
6. Backend receives comensal field with each detail
   ↓
7. Database stores comensal in tblposcrumenwebdetalleventas
   ↓
8. When venta is loaded later, comensal is restored
```

### Shift Closing Flow
```
1. User clicks to close shift
   ↓
2. CierreTurno modal opens
   ↓
3. Component calls verificarComandasAbiertas API
   ↓
4. Backend queries for ORDENADO/EN_CAMINO ventas
   ↓
5. API returns count of open comandas
   ↓
6. If count > 0:
   - Show warning message
   - Disable "Cerrar TURNO" button
   ↓
7. If count = 0:
   - Show success message
   - Enable "Cerrar TURNO" button
```

---

## 4. CSS Styling Details

### CierreTurno Status Styles
```css
.estatus-ok {
  background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
  color: #166534; /* dark green */
}

.estatus-error {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
  color: #991b1b; /* dark red */
}

.estatus-loading {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af; /* dark blue */
}
```

### Seat Button Styles
```css
.btn-asiento {
  background: #9b59b6; /* purple */
  color: white;
  display: flex;
  align-items: center;
  gap: 0.219rem; /* 3.5px */
}

.btn-asiento:hover {
  background: #8e44ad; /* darker purple */
}

.btn-asiento .asiento-label {
  font-size: 0.563rem; /* 9px */
  font-weight: 700;
  letter-spacing: 0.016rem; /* 0.25px */
}

.btn-asiento:disabled {
  background: #bdc3c7; /* gray */
  cursor: not-allowed;
  opacity: 0.6;
}
```

---

## 5. Button Color Scheme

The PageVentas action buttons now use distinct colors:

| Button | Color | Purpose |
|--------|-------|---------|
| **Minus (-)** | 🟢 Green (`#16a085`) | Remove quantity |
| **Plus (+)** | 🟢 Green (`#16a085`) | Add quantity |
| **Note (📝)** | 🟠 Orange (`#f39c12`) | Add/edit notes |
| **Seat (🍴)** | 🟣 Purple (`#9b59b6`) | Assign seat (Mesa only) |

This color coding helps users quickly identify button functions.

---

## 6. Accessibility

- All buttons have proper `title` attributes for tooltips
- Disabled states are clearly visible (grayed out)
- Right-click context menu is prevented only for seat button
- Color contrast meets readability standards
- Icon + text labels for clarity

---

## 7. Responsive Behavior

The implementation follows the existing scaling pattern:
- All measurements use rem units for consistent scaling
- Buttons maintain aspect ratio at different screen sizes
- Text remains readable at all scales
- Touch targets are appropriately sized for mobile use
