# PageVentas Modal - Visual Design Specification

## Modal Appearance

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│              SELECCIONE tipo de VENTA                   │
│              (Green Gradient Text)                      │
│                                                         │
│   ┌───────────────────────────────────────────────┐   │
│   │                                                │   │
│   │  🏠  DOMICILIO                                 │   │
│   │  (Blue Icon + Text)                           │   │
│   │                                                │   │
│   └───────────────────────────────────────────────┘   │
│                                                         │
│   ┌───────────────────────────────────────────────┐   │
│   │                                                │   │
│   │  🛍️  LLEVAR                                    │   │
│   │  (Orange Icon + Text)                         │   │
│   │                                                │   │
│   └───────────────────────────────────────────────┘   │
│                                                         │
│   ┌───────────────────────────────────────────────┐   │
│   │                                                │   │
│   │  🪑  MESA                                      │   │
│   │  (Green Icon + Text)                          │   │
│   │                                                │   │
│   └───────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
      ↑                                         ↑
      Floating Up                    Floating Down
      (0s, 3s, 6s...)                (1.5s, 4.5s...)
```

## Floating Animation Visualization

```
Time: 0.0s  |  Modal at baseline position (0px)
       ↓
Time: 1.5s  |  Modal moves up (-10px) 
       ↓
Time: 3.0s  |  Modal returns to baseline (0px)
       ↓
       [CYCLE REPEATS INFINITELY]
```

## Color Palette

### DOMICILIO (Blue)
```
Border:     #dbeafe (light blue)
Background: Linear gradient #eff6ff → #dbeafe
Icon:       Linear gradient #3b82f6 → #2563eb
Text:       #1e40af (dark blue)
```

### LLEVAR (Orange)
```
Border:     #fef3c7 (light orange)
Background: Linear gradient #fffbeb → #fef3c7
Icon:       Linear gradient #f59e0b → #d97706
Text:       #92400e (dark orange)
```

### MESA (Green)
```
Border:     #d1fae5 (light green)
Background: Linear gradient #ecfdf5 → #d1fae5
Icon:       Linear gradient #10b981 → #059669
Text:       #065f46 (dark green)
```

### Title
```
Text:       Linear gradient #10b981 → #34d399
Font Size:  1.75rem (28px)
Weight:     700 (bold)
Transform:  UPPERCASE
```

## Hover Effects

```
Before Hover:
┌──────────────────────┐
│ 🏠 DOMICILIO         │
└──────────────────────┘

During Hover:
   ┌──────────────────────┐
   │ 🏠 DOMICILIO         │ ← Slides right 8px
   └──────────────────────┘
   └─ Shadow expands
      └─ Icon rotates 5° and scales 110%
         └─ Shine effect slides across
```

## Responsive Behavior

### Desktop (> 768px)
```
Modal Width:  600px
Padding:      2.5rem (40px)
Icon Size:    64px × 64px
Label Size:   1.5rem (24px)
Gap:          1.25rem (20px)
```

### Tablet (≤ 768px)
```
Modal Width:  90% of screen
Padding:      2rem (32px)
Icon Size:    56px × 56px
Label Size:   1.25rem (20px)
Gap:          1rem (16px)
```

### Mobile (≤ 480px)
```
Modal Width:  90% of screen
Padding:      1.5rem (24px)
Icon Size:    48px × 48px
Label Size:   1.125rem (18px)
Gap:          0.875rem (14px)
Title:        1.25rem (20px)
```

## Animation Timings

```
Modal Entry:
  Fade In:    0.3s ease-out
  Scale In:   0.4s ease-out
  Float:      Starts at 0.4s, continues forever

Button Hover:
  Transform:  0.3s ease
  Shine:      0.5s ease

Icon Hover:
  Rotate:     0.3s ease
  Scale:      0.3s ease

Modal Close:
  Immediate (no animation)
```

## Z-Index Stack

```
Layer 10000: Modal Overlay & Content
Layer 9999:  Screen Lock Overlay
Layer 100:   Sticky Header
Layer 1:     Page Content
```

## Interaction Flow Diagram

```
┌─────────────────┐
│  User enters    │
│  PageVentas     │
└────────┬────────┘
         │
         ↓
    ┌────────────┐    YES    ┌────────────────┐
    │  Comanda   │─────────→ │  Hide Modal    │
    │  has items?│           └────────────────┘
    └────────────┘
         │ NO
         ↓
    ┌────────────┐    YES    ┌────────────────┐
    │  Service   │─────────→ │  Hide Modal    │
    │ configured?│           └────────────────┘
    └────────────┘
         │ NO
         ↓
    ┌────────────┐
    │  Wait      │
    │  500ms     │
    └────────┬───┘
         │
         ↓
    ┌────────────┐
    │  SHOW      │
    │  MODAL     │ ← Floating animation starts
    └────────┬───┘
         │
         ↓
    ┌────────────┐
    │  User      │
    │  selects   │
    │  type      │
    └────────┬───┘
         │
         ↓
    ┌────────────┐
    │  Close     │
    │  selection │
    │  modal     │
    └────────┬───┘
         │
         ↓
    ┌────────────┐
    │  Wait      │
    │  300ms     │
    └────────┬───┘
         │
         ↓
    ┌────────────┐
    │  Open      │
    │  config    │
    │  modal     │
    └────────────┘
```

## Component Structure

```
ModalSeleccionVentaPageVentas (Parent)
│
├── Overlay (div.modal-seleccion-venta-pageventas-overlay)
│   │
│   └── Content (div.modal-seleccion-venta-pageventas-content.floating)
│       │
│       ├── Header (div.modal-seleccion-venta-pageventas-header)
│       │   └── Title (h2)
│       │
│       └── Body (div.modal-seleccion-venta-pageventas-body)
│           │
│           ├── Button DOMICILIO (button.btn-tipo-venta-pv.btn-domicilio-pv)
│           │   ├── Icon Container (div.tipo-venta-icon-pv)
│           │   │   └── SVG (House icon)
│           │   └── Label (span.tipo-venta-label-pv)
│           │
│           ├── Button LLEVAR (button.btn-tipo-venta-pv.btn-llevar-pv)
│           │   ├── Icon Container (div.tipo-venta-icon-pv)
│           │   │   └── SVG (Bag icon)
│           │   └── Label (span.tipo-venta-label-pv)
│           │
│           └── Button MESA (button.btn-tipo-venta-pv.btn-mesa-pv)
│               ├── Icon Container (div.tipo-venta-icon-pv)
│               │   └── SVG (Table icon)
│               └── Label (span.tipo-venta-label-pv)
```

## CSS Classes Reference

### Modal Structure
- `.modal-seleccion-venta-pageventas-overlay` - Full screen overlay
- `.modal-seleccion-venta-pageventas-content` - Modal card
- `.floating` - Adds floating animation
- `.modal-seleccion-venta-pageventas-header` - Title section
- `.modal-seleccion-venta-pageventas-body` - Buttons container

### Buttons
- `.btn-tipo-venta-pv` - Base button style
- `.btn-domicilio-pv` - Domicilio specific colors
- `.btn-llevar-pv` - Llevar specific colors
- `.btn-mesa-pv` - Mesa specific colors

### Icons & Labels
- `.tipo-venta-icon-pv` - Icon container (64px × 64px)
- `.tipo-venta-label-pv` - Text label (1.5rem)

## Accessibility Features

### Keyboard Navigation
- Click outside overlay closes modal
- ESC key support (via onClose prop)

### Visual Feedback
- Clear hover states
- Active states on click
- Focus indicators (browser default)

### Screen Readers
- Semantic HTML structure
- Proper heading hierarchy
- SVG icons with implicit roles

## Performance Considerations

### Optimizations
- CSS animations (GPU accelerated)
- Pure CSS for all effects
- No JavaScript-based animations
- Conditional rendering (returns null when closed)

### Bundle Impact
- Component: ~2.8 KB
- CSS: ~5 KB
- Total: ~7.8 KB (uncompressed)

## Browser Compatibility

### Supported Features
✅ Flexbox layout
✅ CSS Grid (not used)
✅ Transform animations
✅ Linear gradients
✅ Backdrop filter
✅ SVG rendering

### Tested Browsers
✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+

## Implementation Notes

### Constants Used
```typescript
SELECTION_MODAL_DISPLAY_DELAY_MS = 500
SERVICE_CONFIG_MODAL_DELAY_MS = 300
```

### State Management
```typescript
const [showSelectionModal, setShowSelectionModal] = useState(false);
```

### Event Handlers
```typescript
handleSelectionModalVentaSelect(tipo: TipoServicio)
  → Sets tipo servicio
  → Closes selection modal
  → Opens config modal after delay
```

---

**Design System**: Custom POS Crumen
**Version**: 2.5.B12
**Created**: December 30, 2025
