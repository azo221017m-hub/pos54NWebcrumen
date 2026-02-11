# Visual Guide - Gastos Page

## User Interface Overview

### 1. Dashboard Navigation
- **Menu Location**: MI OPERACION → GASTOS
- **Access**: No turno (shift) required
- **Icon**: Document/Receipt icon

### 2. Main Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [← Volver]  [📄 Gastos - Registra y gestiona...]  [+ Nuevo]│
├─────────────────────────────────────────────────────────────┤
│  [Success/Error Message Bar]                                 │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Table/Card View of Expenses                           │  │
│  │                                                        │  │
│  │ Folio | Tipo | Importe | Fecha | Usuario | [Actions] │  │
│  │ ───────────────────────────────────────────────────── │  │
│  │ 202402... | Renta | $5,000 | 10/02... | admin | ✏️🗑️ │  │
│  │ 202402... | Luz   | $800   | 09/02... | admin | ✏️🗑️ │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 3. Nuevo Gasto Modal

```
┌─────────────────────────────────────┐
│ Nuevo Gasto                    [X]  │
├─────────────────────────────────────┤
│                                     │
│  Tipo de Gasto *                    │
│  [______________________________]   │
│  Ej: Renta, Luz, Agua              │
│                                     │
│  Importe del Gasto *                │
│  [______________________________]   │
│  0.00                               │
│                                     │
├─────────────────────────────────────┤
│           [Cancelar]  [Guardar]     │
└─────────────────────────────────────┘
```

### 4. Mobile View

```
┌──────────────────────────┐
│ [← Volver]      [+ Nuevo]│
├──────────────────────────┤
│ [📄 Gastos]              │
│ Registra y gestiona...   │
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │ 202402... │ $5,000   │ │
│ │ Tipo: Renta          │ │
│ │ Fecha: 10/02/26 10:30│ │
│ │ Usuario: admin       │ │
│ │ [✏️ Editar] [🗑️ Elim]│ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ 202402... │ $800     │ │
│ │ Tipo: Luz            │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

## Color Scheme

### Primary Colors
- **Blue (#3b82f6)**: Primary actions, links, icons
- **Red (#dc2626)**: Delete button, negative amounts
- **Green (#10b981)**: Success messages
- **Gray (#6b7280)**: Secondary text, disabled states

### Status Colors
- **Success**: Light green background (#d1fae5), dark green text (#065f46)
- **Error**: Light red background (#fee2e2), dark red text (#991b1b)
- **Info**: Light blue background (#dbeafe), dark blue text (#1e40af)

## Responsive Breakpoints

- **Desktop**: 769px and above
  - Table view
  - Full header with description

- **Tablet**: 481px - 768px
  - Card view
  - Compact header

- **Mobile**: 480px and below
  - Vertical card layout
  - Minimal header
  - Full-width buttons

## User Interactions

### Creating a Gasto
1. Click "Nuevo Gasto" button
2. Modal opens
3. Fill in "Tipo de Gasto" (e.g., "Renta")
4. Fill in "Importe del Gasto" (e.g., 5000)
5. Click "Guardar"
6. Success message appears
7. Modal closes
8. List refreshes with new gasto

### Editing a Gasto
1. Click edit icon (✏️) on desired row
2. Modal opens with pre-filled data
3. Modify fields as needed
4. Click "Guardar"
5. Success message appears
6. List refreshes with updated data

### Deleting a Gasto
1. Click delete icon (🗑️) on desired row
2. Confirmation dialog appears
3. Click "OK" to confirm
4. Success message appears
5. List refreshes without deleted item

## Form Validations

### Client-Side
- ✅ Tipo de Gasto: Required, cannot be empty
- ✅ Importe: Required, must be > 0, numeric only

### Server-Side
- ✅ User authentication required
- ✅ Tipo de Gasto: Required, cannot be empty string
- ✅ Importe: Required, must be > 0
- ✅ User must belong to a valid negocio

## Data Display Formats

### Currency
- Format: Mexican Pesos (MXN)
- Display: $5,000.00
- Symbol: $ prefix
- Decimals: 2 decimal places

### Date/Time
- Format: es-MX locale
- Display: 10/02/2026, 10:30
- Full format: DD/MM/YYYY, HH:MM

### Folio
- Format: AAAAMMDDHHMMSS
- Example: 20260210103045
- Display: Monospace font
- Color: Gray for readability

## Empty State

```
┌─────────────────────────────────────┐
│                                     │
│         No hay gastos registrados   │
│  Haz clic en "Nuevo Gasto" para     │
│         agregar uno                 │
│                                     │
└─────────────────────────────────────┘
```

## Loading State

```
┌─────────────────────────────────────┐
│                                     │
│            [Spinner Icon]           │
│         Cargando gastos...          │
│                                     │
└─────────────────────────────────────┘
```

## Error Messages

### Examples
- ❌ "El importe del gasto debe ser mayor a 0"
- ❌ "El tipo de gasto es requerido"
- ❌ "Error al cargar los gastos"
- ❌ "Error al guardar el gasto"
- ❌ "Gasto no encontrado"

### Success Messages
- ✅ "Gasto creado correctamente"
- ✅ "Gasto actualizado correctamente"
- ✅ "Gasto eliminado correctamente"

## Accessibility Features

- ✅ Semantic HTML elements
- ✅ ARIA labels where needed
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Color contrast compliance
- ✅ Responsive touch targets (min 44px)

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- ✅ Lazy loading of data
- ✅ Optimized re-renders
- ✅ Debounced actions
- ✅ Minimal bundle size
- ✅ CSS optimizations
