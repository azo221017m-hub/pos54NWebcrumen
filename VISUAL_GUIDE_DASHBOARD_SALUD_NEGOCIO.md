# Visual Guide: Dashboard UI Changes

## Overview
This guide provides visual specifications for the Dashboard enhancements:
- "Salud de mi Negocio" card with Sales vs Expenses chart
- Enhanced "Ventas Hoy" card with Total Sales label

## 1. "Salud de mi Negocio" Card

### Card Layout Specifications

```
┌─────────────────────────────────────────────────────┐
│ 💜                                                   │
│                                                      │
│ Salud de mi Negocio                                 │
│ Comparativo del mes                                 │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │                                               │   │
│ │      ┌─────────┐          ┌─────────┐       │   │
│ │      │         │          │         │       │   │
│ │      │         │          │         │       │   │
│ │      │         │          │         │       │   │
│ │      │ VENTAS  │          │ GASTOS  │       │   │
│ │      │ (green) │          │  (red)  │       │   │
│ │      │         │          │         │       │   │
│ │      └─────────┘          └─────────┘       │   │
│ │        Ventas               Gastos          │   │
│ │                                               │   │
│ │      ✓ Balance positivo (green)             │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Color Specifications

**Card Icon:**
- Background: Purple gradient `#8b5cf6` to `#7c3aed`
- Icon: Activity/heartbeat SVG in white

**Chart Bars:**
- Ventas (Sales): `#10b981` (emerald green)
- Gastos (Expenses): `#ef4444` (red)

**Labels:**
- Bar Labels: Font weight 600, size 0.6rem
  - Ventas: Color `#10b981`
  - Gastos: Color `#ef4444`

**Balance Indicator:**
- Positive: `#10b981` (green) - "✓ Balance positivo"
- Negative: `#ef4444` (red) - "⚠ Balance negativo"
- Neutral: `#6b7280` (gray) - "— Balance neutro"

### Chart Behavior

**Bar Height Calculation:**
```typescript
const maxValue = Math.max(totalVentas, totalGastos);
const ventasHeight = Math.max((totalVentas / maxValue) * 100, 5);
const gastosHeight = Math.max((totalGastos / maxValue) * 100, 5);
```

**Key Features:**
1. Bars scale proportionally to values
2. Minimum height of 5% ensures visibility
3. Fixed container height: 80px
4. Smooth transitions (0.3s ease)

### Example Scenarios

#### Scenario A: Positive Balance (Ventas > Gastos)
```
Data:
- totalVentas: $50,000
- totalGastos: $20,000

Visual:
     ┌─────┐
     │     │ 100%
     │     │
     │     │
  V  │     │
  E  │     │
  N  │     │        ┌─────┐
  T  │     │        │     │ 40%
  A  │     │        │  G  │
  S  │     │        │  A  │
     └─────┘        │  S  │
     Ventas         │  T  │
                    │  O  │
                    │  S  │
                    └─────┘
                    Gastos

     ✓ Balance positivo (green)
```

#### Scenario B: Negative Balance (Gastos > Ventas)
```
Data:
- totalVentas: $15,000
- totalGastos: $25,000

Visual:
                    ┌─────┐
                    │     │ 100%
                    │     │
                    │     │
                    │  G  │
     ┌─────┐        │  A  │
     │     │ 60%    │  S  │
  V  │     │        │  T  │
  E  │     │        │  O  │
  N  │     │        │  S  │
  T  └─────┘        └─────┘
  A  Ventas         Gastos
  S

     ⚠ Balance negativo (red)
```

#### Scenario C: No Data
```
Data:
- totalVentas: $0
- totalGastos: $0

Visual:
     [Empty chart area]
     
     Sin datos del mes (gray text)
```

---

## 2. "Ventas Hoy" Card (Enhanced)

### Before (Original)
```
┌─────────────────────────────────────────┐
│ 🔵                                       │
│                                          │
│ Ventas Hoy                               │
│ Turno Actual                             │
│                                          │
│ Cobrado:        $3,500.00 (green)       │
│ Ordenado:       $1,200.00 (amber)       │
│                                          │
│ Meta:           $5,000.00                │
│ [████████████░░░░░░] 70.0% completado   │
│                                          │
└─────────────────────────────────────────┘
```

### After (Enhanced)
```
┌─────────────────────────────────────────┐
│ 🔵                                       │
│                                          │
│ Ventas Hoy                               │
│ Turno Actual                             │
│                                          │
│ Total Ventas:   $3,500.00 (blue) ← NEW  │
│ Cobrado:        $3,500.00 (green)       │
│ Ordenado:       $1,200.00 (amber)       │
│                                          │
│ Meta:           $5,000.00                │
│ [████████████░░░░░░] 70.0% completado   │
│                                          │
└─────────────────────────────────────────┘
```

### Color Specifications

**Card Icon:**
- Background: Blue gradient `#3b82f6` to `#2563eb`
- Icon: Shopping cart SVG in white

**Labels & Values:**
- "Total Ventas": `#3b82f6` (blue) - NEW
- "Cobrado": `#10b981` (emerald green)
- "Ordenado": `#f59e0b` (amber)
- Label text: `#718096` (gray-600)

**Progress Bar:**
- Container: `#e5e7eb` (gray-200)
- Bar (< 100%): `#3b82f6` (blue)
- Bar (≥ 100%): `#10b981` (green)

### Typography

**Labels:**
- Font size: `0.55rem`
- Color: `#718096`
- Weight: Normal

**Values:**
- Font size: `0.7rem`
- Weight: `700` (bold)

**Meta:**
- Font size: `0.65rem`
- Weight: `600` (semi-bold)
- Color: `#6b7280`

---

## 3. Complete Dashboard Layout

```
╔═══════════════════════════════════════════════════════════════════╗
║                      DASHBOARD PAGE                                ║
║                                                                    ║
║  ¡Bienvenido, [Usuario]!                                          ║
║  Panel de control del sistema POS Crumen                          ║
║                                                                    ║
║  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ ║
║  │   Salud de mi   │  │   Ventas Hoy    │  │   Inventario    │ ║
║  │    Negocio      │  │                 │  │                 │ ║
║  │                 │  │                 │  │                 │ ║
║  │  [Bar Chart]    │  │ Total Ventas ← │  │   0 alertas     │ ║
║  │   V    G        │  │ Cobrado        │  │                 │ ║
║  │ Balance +/-     │  │ Ordenado       │  │                 │ ║
║  └─────────────────┘  │ Meta [Bar]     │  └─────────────────┘ ║
║                       └─────────────────┘                        ║
║                                                                    ║
║  Comandas del Día                                                 ║
║  ┌──────────────────────────────────────────────────────────────┐║
║  │ [Order Cards Display]                                        │║
║  └──────────────────────────────────────────────────────────────┘║
║                                                                    ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## 4. Responsive Behavior

### Desktop (≥ 768px)
- Cards displayed in 3-column grid
- Each card equal width (~30% each)
- Chart bars visible with full height (80px)

### Mobile (< 768px)
- Cards stack vertically
- Each card full width
- Chart bars maintain proportions
- Font sizes remain readable

---

## 5. Interactive States

### Loading State
```
┌─────────────────────────────────────────┐
│ 💜                                       │
│                                          │
│ Salud de mi Negocio                     │
│ Comparativo del mes                     │
│                                          │
│     [Loading spinner or skeleton]       │
│                                          │
│                                          │
└─────────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────────┐
│ 💜                                       │
│                                          │
│ Salud de mi Negocio                     │
│ Comparativo del mes                     │
│                                          │
│  ⚠ Error al cargar datos               │
│                                          │
│                                          │
└─────────────────────────────────────────┘
```

### Empty State
```
┌─────────────────────────────────────────┐
│ 💜                                       │
│                                          │
│ Salud de mi Negocio                     │
│ Comparativo del mes                     │
│                                          │
│     Sin datos del mes                   │
│                                          │
│                                          │
└─────────────────────────────────────────┘
```

---

## 6. Animation & Transitions

### Chart Bars
- Property: `height`
- Duration: `0.3s`
- Easing: `ease`
- Trigger: Data update

### Progress Bar
- Property: `width`
- Duration: `0.3s`
- Easing: `ease`
- Trigger: Meta progress change

### Auto-refresh
- Interval: 30 seconds
- No visual flash/reload
- Smooth data updates

---

## 7. Accessibility

### Color Contrast
- All text meets WCAG AA standards
- Icon colors have sufficient contrast
- Balance indicators use symbols + text (✓, ⚠, —)

### Screen Readers
- All values announced as currency
- Balance status announced
- Chart values accessible via labels

### Keyboard Navigation
- All interactive elements focusable
- Tab order logical
- Focus indicators visible

---

## 8. CSS Classes Used

```css
/* Card container */
.dashboard-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Card icon */
.card-icon.purple {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  /* ... */
}

.card-icon.blue {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  /* ... */
}

/* Typography */
.card-title {
  font-size: 0.8rem;
  font-weight: 700;
  /* ... */
}

.card-text {
  font-size: 0.55rem;
  color: #718096;
  /* ... */
}

.card-stat {
  font-size: 0.9rem;
  font-weight: 600;
  /* ... */
}
```

---

## Implementation Notes

1. **No external chart libraries** - Pure CSS/HTML implementation
2. **Inline styles used** for dynamic values (heights, colors)
3. **Responsive without media queries** - Uses flex layout
4. **Maintains consistency** with existing dashboard style
5. **Minimal CSS changes** - Leverages existing styles

---

## Testing Checklist

Visual verification for each scenario:

### "Salud de mi Negocio"
- [ ] Both bars visible when data present
- [ ] Bar heights proportional to values
- [ ] Colors correct (green for sales, red for expenses)
- [ ] Labels below bars
- [ ] Balance indicator shows correct state
- [ ] Empty state when no data
- [ ] Smooth transitions on data update

### "Ventas Hoy"
- [ ] "Total Ventas" label appears first
- [ ] Value formatted as currency
- [ ] Color is blue
- [ ] Existing labels maintain order and style
- [ ] Progress bar works when meta present
- [ ] All values update on refresh

### Overall
- [ ] Cards aligned properly in grid
- [ ] Responsive on mobile
- [ ] Auto-refresh works (30s interval)
- [ ] No layout shift on data update
- [ ] Accessible via keyboard
- [ ] Screen reader friendly
