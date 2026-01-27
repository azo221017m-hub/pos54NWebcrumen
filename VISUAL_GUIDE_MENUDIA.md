# Visual Guide: Menu del Día Components

## Form Component (FormularioProductoWeb)

### Location in Form
The "Menú del Día" toggle appears in the form after the "Estatus" field.

### Visual Description

```
┌─────────────────────────────────────────┐
│  Menú del Día                           │
│  ┌──────┐                               │
│  │ ◯────│  Parte del menú               │
│  └──────┘                               │
└─────────────────────────────────────────┘
```

When **Active (menudia = 1)**:
```
┌─────────────────────────────────────────┐
│  Menú del Día                           │
│  ┌──────┐                               │
│  │──────◯│  Parte del menú              │
│  └──────┘                               │
│  Green toggle slider →                  │
└─────────────────────────────────────────┘
```

When **Inactive (menudia = 0)**:
```
┌─────────────────────────────────────────┐
│  Menú del Día                           │
│  ┌──────┐                               │
│  │ ◯────│  No parte del menú            │
│  └──────┘                               │
│  Gray toggle slider ←                   │
└─────────────────────────────────────────┘
```

### Implementation Code
```tsx
<div className="form-group">
  <label className="form-label">Menú del Día</label>
  <div className="toggle-switch-container">
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={formData.menudia === 1}
        onChange={(e) => setFormData(prev => ({ 
          ...prev, 
          menudia: e.target.checked ? 1 : 0 
        }))}
      />
      <span className="toggle-slider"></span>
    </label>
    <span className="toggle-label">
      {formData.menudia === 1 ? 'Parte del menú' : 'No parte del menú'}
    </span>
  </div>
</div>
```

---

## List Component (ListaProductosWeb)

### Location in Product Card
The checkbox appears in the footer of each product card, alongside Edit and Delete buttons.

### Visual Description

```
┌────────────────────────────────────────────────┐
│  [Product Image] Product Name                  │
│                  Category Name                 │
│  [Badges: Type, Status, Menu Badge if active] │
│                                                │
│  Description text...                           │
│  Price: $10.00    Cost: $5.00                 │
├────────────────────────────────────────────────┤
│  [🍽] Menú del Día  [Edit] [Delete]          │
└────────────────────────────────────────────────┘
```

### Checkbox States

**Unchecked (menudia = 0)**:
```
┌────────┐
│   🍽   │ Menú del Día
│  (-)   │
└────────┘
White background, gray border
Icon invisible
```

**Checked (menudia = 1)**:
```
┌────────┐
│   🍽   │ Menú del Día
│  (✓)   │
└────────┘
Orange gradient background
Icon visible (white utensils)
Text becomes darker brown
```

### Implementation Code
```tsx
<label className="checkbox-menudia-container">
  <input
    type="checkbox"
    checked={producto.menudia === 1}
    onChange={() => onToggleMenuDia(producto.idProducto, producto.menudia)}
    className="checkbox-menudia-input"
  />
  <span className="checkbox-menudia-custom">
    <Utensils size={14} className="checkbox-menudia-icon" />
  </span>
  <span className="checkbox-menudia-label">Menú del Día</span>
</label>
```

### CSS Styling
```css
/* Modern Checkbox for Menu del Día */
.checkbox-menudia-container {
  display: flex;
  align-items: center;
  gap: 0.38rem;
  cursor: pointer;
}

.checkbox-menudia-custom {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  transition: all 0.2s;
}

/* When checked */
.checkbox-menudia-input:checked + .checkbox-menudia-custom {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  border-color: #f59e0b;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

/* Icon animation */
.checkbox-menudia-icon {
  opacity: 0;
  transform: scale(0);
  transition: all 0.2s;
  color: white;
}

.checkbox-menudia-input:checked + .checkbox-menudia-custom .checkbox-menudia-icon {
  opacity: 1;
  transform: scale(1);
}
```

---

## Badge Display

Products with `menudia = 1` also display a badge in the card header:

```
┌────────────────────────────────────────┐
│  [Product Image]  Product Name         │
│                   Category             │
│  [Directo] [Activo] [🍽️ Menú del Día]│
└────────────────────────────────────────┘
```

### Badge Code
```tsx
{producto.menudia === 1 && (
  <span className="badge badge-menudia">
    🍽️ Menú del Día
  </span>
)}
```

### Badge Styling
```css
.badge-menudia {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border: 1px solid #fbbf24;
}
```

---

## User Interaction Flow

### 1. Creating New Product
1. Click "Nuevo Producto" button
2. Fill in product details
3. Toggle "Menú del Día" switch to **ON** (if desired)
4. Click "Guardar"
5. ✅ Product saved with `menudia = 1`

### 2. Editing Existing Product
1. Click "Editar" button on product card
2. Form opens with current menudia state
3. Toggle "Menú del Día" switch (if changing)
4. Click "Actualizar"
5. ✅ Product updated with new menudia value

### 3. Quick Toggle from List
1. Find product in list
2. Click checkbox in footer "🍽 Menú del Día"
3. ✅ Database updated immediately
4. Success message shown
5. Product list refreshes with new state
6. Badge appears/disappears in header

---

## Success Messages

When toggling menudia from the list:

**Adding to menu:**
```
✅ Producto agregado al Menú del Día
```

**Removing from menu:**
```
✅ Producto removido del Menú del Día
```

---

## Responsive Behavior

### Desktop (> 768px)
- Checkbox appears inline with Edit/Delete buttons
- All buttons in a single row

### Mobile (≤ 768px)
- Checkbox stacks vertically
- Full width layout
- Each action button takes full width

---

## Color Scheme

### Form Toggle
- **Inactive:** Gray (#cbd5e1)
- **Active:** Green gradient (#10b981 to #34d399)

### List Checkbox
- **Unchecked:** White background, gray border (#cbd5e1)
- **Checked:** Orange gradient (#f59e0b to #fbbf24)
- **Icon:** White utensils icon
- **Label:** Gray (#475569) unchecked, Brown (#92400e) checked

### Badge
- **Background:** Yellow gradient (#fef3c7 to #fde68a)
- **Text:** Brown (#92400e)
- **Border:** Yellow (#fbbf24)

---

## Technical Notes

1. **Icon Used:** `Utensils` from lucide-react (fork and knife icon)
2. **Animations:** 
   - Smooth 0.2s transitions on all state changes
   - Scale animation for icon appearance
   - Box shadow on checked state
3. **Accessibility:** 
   - Proper label associations
   - Cursor pointer on interactive elements
   - Visual feedback on hover
4. **Database Field:** `menudia` TINYINT (0 or 1)
5. **API Updates:** Direct PUT request to `/api/productos-web/:id`
