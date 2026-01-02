# Visual Specification: Moderador Selection Modal

## Modal State 1: Options View (Initial State)

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║                   Seleccione una opción                    ║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐   ║
║  │                       🚫                           │   ║
║  │                                                    │   ║
║  │                     LIMPIO                         │   ║
║  │               Sin modificaciones                   │   ║
║  │                                                    │   ║
║  └────────────────────────────────────────────────────┘   ║
║  (Red border: #e74c3c)                                    ║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐   ║
║  │                       ✅                           │   ║
║  │                                                    │   ║
║  │                   CON TODO                         │   ║
║  │            Todas las modificaciones                │   ║
║  │                                                    │   ║
║  └────────────────────────────────────────────────────┘   ║
║  (Green border: #27ae60)                                  ║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐   ║
║  │                       ✏️                           │   ║
║  │                                                    │   ║
║  │                   SOLO CON                         │   ║
║  │            Seleccionar específicas                 │   ║
║  │                                                    │   ║
║  └────────────────────────────────────────────────────┘   ║
║  (Blue border: #3498db)                                   ║
║                                                            ║
║                     [  Cancelar  ]                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

## Modal State 2: List View (After clicking "SOLO CON")

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  [← Volver]        Seleccionar Moderadores                 ║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐   ║
║  │  ☐  Sin picante                                    │   ║
║  └────────────────────────────────────────────────────┘   ║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐   ║
║  │  ☑  Extra queso                                    │   ║
║  └────────────────────────────────────────────────────┘   ║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐   ║
║  │  ☐  Sin cebolla                                    │   ║
║  └────────────────────────────────────────────────────┘   ║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐   ║
║  │  ☑  Término medio                                  │   ║
║  └────────────────────────────────────────────────────┘   ║
║                                                            ║
║                      [  Cerrar  ]                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

## Product Card with Mod Button

### Before Clicking Mod Button:
```
┌─────────────────────────────────────┐
│        [Product Image/Icon]         │
│                                     │
│         Hamburguesa Clásica         │
│              $ 15.00                │
│                                     │
│         [+]        [Mod]            │
└─────────────────────────────────────┘
```

### Mod Button States:

**Enabled** (Category has moderadordef):
```
[Mod]  ← Green background (#16a085), clickable
```

**Disabled** (Category has no moderadordef):
```
[Mod]  ← Gray background (#95a5a6), opacity: 0.5
```

## Comanda Display

### Product with LIMPIO:
```
╔══════════════════════════════════════════════════════╗
║  2  Hamburguesa Clásica              $ 30.00        ║
║     Mod: LIMPIO                                      ║
║     [−] [+]                                          ║
╚══════════════════════════════════════════════════════╝
```

### Product with CON TODO:
```
╔══════════════════════════════════════════════════════╗
║  1  Pizza Napolitana                 $ 12.00        ║
║     Mod: Sin picante, Extra queso, Sin cebolla      ║
║     [−] [+]                                          ║
╚══════════════════════════════════════════════════════╝
```

### Product with SOLO CON (Custom Selection):
```
╔══════════════════════════════════════════════════════╗
║  3  Tacos al Pastor                  $ 45.00        ║
║     Mod: Sin cebolla, Término medio                 ║
║     [−] [+]                                          ║
╚══════════════════════════════════════════════════════╝
```

### Product without Moderadores:
```
╔══════════════════════════════════════════════════════╗
║  2  Refresco                         $ 6.00         ║
║     [−] [+]                                          ║
╚══════════════════════════════════════════════════════╝
```

## Color Scheme

### LIMPIO Option
- Border: `#e74c3c` (Alizarin Red)
- Hover Background: `#ffe6e6` (Light Red)
- Icon: 🚫 (No Entry Sign)

### CON TODO Option
- Border: `#27ae60` (Nephritis Green)
- Hover Background: `#e8f8f0` (Light Green)
- Icon: ✅ (Check Mark)

### SOLO CON Option
- Border: `#3498db` (Peter River Blue)
- Hover Background: `#e8f4f8` (Light Blue)
- Icon: ✏️ (Pencil)

### Common Elements
- Modal Background: `#ffffff` (White)
- Text Color: `#2c3e50` (Midnight Blue)
- Description Text: `#7f8c8d` (Asbestos Gray)
- Back Button: `#95a5a6` (Concrete Gray)

## Hover Effects

### Option Button Hover:
```
Transform: translateY(-2px)
Box Shadow: 0 6px 20px rgba(0, 0, 0, 0.15)
Background: Changes to light tint of border color
```

### Checkbox Hover:
```
Background: #e9ecef (Light Gray)
```

## Responsive Behavior

### Desktop (> 768px):
- Modal width: 500px max
- Button padding: 1.5rem
- Icon size: 3rem
- Font size: 1.3rem for labels

### Mobile (≤ 768px):
- Modal width: 90%
- Button padding: 1.2rem
- Icon size: 2.5rem
- Font size: 1.1rem for labels

## Animation

### Modal Open:
```css
opacity: 0 → 1
transform: scale(0.95) → scale(1)
duration: 0.2s
```

### Button Hover:
```css
transform: translateY(0) → translateY(-2px)
duration: 0.3s
ease: ease-in-out
```

### View Transition (Options ↔ List):
```css
fade-out: 0.15s
fade-in: 0.15s
```

## Accessibility

### ARIA Labels:
```html
<button aria-label="Seleccionar opción LIMPIO - Sin modificaciones">
<button aria-label="Seleccionar opción CON TODO - Todas las modificaciones">
<button aria-label="Seleccionar opción SOLO CON - Seleccionar específicas">
<button aria-label="Volver a opciones principales">
```

### Keyboard Navigation:
- Tab: Navigate through buttons
- Enter/Space: Activate button
- Escape: Close modal
- Checkbox: Tab to navigate, Space to toggle

## User Flow Diagram

```
┌─────────────┐
│ Add Product │
│  to Comanda │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│ Click "Mod" ├────→│ Modal Opens  │
│   Button    │     │ (Options View)│
└─────────────┘     └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   ┌─────────┐       ┌─────────┐      ┌──────────┐
   │ LIMPIO  │       │CON TODO │      │ SOLO CON │
   └────┬────┘       └────┬────┘      └────┬─────┘
        │                 │                 │
        │                 │                 ▼
        │                 │          ┌────────────┐
        │                 │          │ List View  │
        │                 │          │ (Checkboxes)│
        │                 │          └────┬───────┘
        │                 │               │
        ▼                 ▼               ▼
   ┌──────────────────────────────────────────┐
   │        Update Comanda Item               │
   │     (moderadores + moderadoresNames)     │
   └────────────────┬─────────────────────────┘
                    │
                    ▼
              ┌───────────┐
              │Show in    │
              │Comanda    │
              │Display    │
              └───────────┘
```

## Example Scenarios

### Scenario 1: Customer wants pizza without modifications
```
1. Add "Pizza Napolitana" to comanda
2. Click [Mod] button
3. Modal opens with 3 options
4. Click [LIMPIO] button
5. Modal closes
6. Comanda shows: "Mod: LIMPIO"
```

### Scenario 2: Customer wants burger with everything
```
1. Add "Hamburguesa" to comanda
2. Click [Mod] button
3. Modal opens with 3 options
4. Click [CON TODO] button
5. Modal closes
6. Comanda shows: "Mod: Sin picante, Extra queso, Sin cebolla, Término medio"
```

### Scenario 3: Customer wants tacos with specific modifications
```
1. Add "Tacos" to comanda
2. Click [Mod] button
3. Modal opens with 3 options
4. Click [SOLO CON] button
5. View changes to checkbox list
6. Check "Extra queso" and "Término medio"
7. Click [Cerrar]
8. Modal closes
9. Comanda shows: "Mod: Extra queso, Término medio"
```

### Scenario 4: Customer changes mind
```
1. Product already has "CON TODO" selected
2. Click [Mod] button
3. Modal opens with 3 options
4. Click [← Volver] if in list view
5. Click [LIMPIO] button
6. Modal closes
7. Comanda now shows: "Mod: LIMPIO" (previous selection removed)
```
