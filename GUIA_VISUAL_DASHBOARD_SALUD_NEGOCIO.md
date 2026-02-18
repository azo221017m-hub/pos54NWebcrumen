# 🎨 Guía Visual: Dashboard "Salud de mi Negocio" Actualizado

**Fecha:** 17 de Febrero de 2026  
**Versión:** 2.5.B12 con Gastos y Utilidad Operativa

---

## 📱 Vista Completa del Dashboard

```
╔═══════════════════════════════════════════════════════════════╗
║                    DASHBOARD - POS Crumen                     ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌──────────────────────────────────────────────────────┐   ║
║  │ 💜 Salud de mi Negocio        Febrero de 2026 ◄─────│   ║
║  │                                         Visible      │   ║
║  ├──────────────────────────────────────────────────────┤   ║
║  │                                                      │   ║
║  │  ╔═══════════════╗  ╔═══════════════════╗           │   ║
║  │  ║ Ventas        ║  ║ Costo de Venta    ║           │   ║
║  │  ║               ║  ║                   ║           │   ║
║  │  ║ $25,000.00    ║  ║ $12,000.00        ║           │   ║
║  │  ╚═══════════════╝  ╚═══════════════════╝           │   ║
║  │   🔵 Azul              🔴 Rojo                       │   ║
║  │                                                      │   ║
║  │  ╔═══════════════╗  ╔═══════════════════╗           │   ║
║  │  ║ Margen Bruto  ║  ║ % Margen          ║           │   ║
║  │  ║               ║  ║                   ║           │   ║
║  │  ║ $13,000.00    ║  ║ 52.00%            ║           │   ║
║  │  ╚═══════════════╝  ╚═══════════════════╝           │   ║
║  │   🟢 Verde             🟣 Púrpura                    │   ║
║  │                                                      │   ║
║  │  ╔═══════════════╗  ╔═══════════════════╗ ◄─ NUEVOS │   ║
║  │  ║ Gastos        ║  ║ Utilidad Operat.  ║           │   ║
║  │  ║               ║  ║                   ║           │   ║
║  │  ║ $3,500.00     ║  ║ $9,500.00         ║           │   ║
║  │  ╚═══════════════╝  ╚═══════════════════╝           │   ║
║  │   🟡 Amarillo          🔵 Azul (positivo)           │   ║
║  │                                                      │   ║
║  │  ──────────────────────────────────────────         │   ║
║  │                                                      │   ║
║  │  Estado: MUY BUENO                                   │   ║
║  │  ████████████████████░░░░░░░░ 52%                   │   ║
║  │  ✓ Excelente desempeño                               │   ║
║  │                                                      │   ║
║  └──────────────────────────────────────────────────────┘   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 🎨 Paleta de Colores por Métrica

### 1. Ventas (Azul)
```
┌────────────────────┐
│ Ventas             │ ← Texto: #6b7280 (gris)
│                    │
│ $25,000.00         │ ← Valor: #3b82f6 (azul fuerte)
└────────────────────┘
Fondo:  #eff6ff (azul muy claro)
Borde:  #dbeafe (azul claro)
```

### 2. Costo de Venta (Rojo)
```
┌────────────────────┐
│ Costo de Venta     │ ← Texto: #6b7280 (gris)
│                    │
│ $12,000.00         │ ← Valor: #ef4444 (rojo fuerte)
└────────────────────┘
Fondo:  #fef2f2 (rojo muy claro)
Borde:  #fecaca (rojo claro)
```

### 3. Margen Bruto (Verde)
```
┌────────────────────┐
│ Margen Bruto       │ ← Texto: #6b7280 (gris)
│                    │
│ $13,000.00         │ ← Valor: #10b981 (verde fuerte)
└────────────────────┘
Fondo:  #f0fdf4 (verde muy claro)
Borde:  #bbf7d0 (verde claro)
```

### 4. % Margen (Púrpura)
```
┌────────────────────┐
│ % Margen           │ ← Texto: #6b7280 (gris)
│                    │
│ 52.00%             │ ← Valor: #8b5cf6 (púrpura fuerte)
└────────────────────┘
Fondo:  #faf5ff (púrpura muy claro)
Borde:  #e9d5ff (púrpura claro)
```

### 5. Gastos (Amarillo/Ámbar) ← NUEVO
```
┌────────────────────┐
│ Gastos             │ ← Texto: #6b7280 (gris)
│                    │
│ $3,500.00          │ ← Valor: #f59e0b (ámbar fuerte)
└────────────────────┘
Fondo:  #fef3c7 (amarillo muy claro)
Borde:  #fde68a (amarillo claro)
```

### 6. Utilidad Operativa (Azul/Rojo Dinámico) ← NUEVO
```
┌────────────────────┐
│ Utilidad Operat.   │ ← Texto: #6b7280 (gris)
│                    │
│ $9,500.00          │ ← Valor: #0ea5e9 (azul cielo) SI >= 0
└────────────────────┘   O bien: #dc2626 (rojo) SI < 0
Fondo:  #dbeafe (azul muy claro)
Borde:  #bfdbfe (azul claro)
```

---

## 📐 Dimensiones y Espaciado

### Grid Container
```css
display: grid;
grid-template-columns: 1fr 1fr;  /* 2 columnas iguales */
gap: 0.75rem;                     /* Espacio entre tarjetas */
margin-bottom: 1rem;              /* Espacio inferior */
```

### Card Individual
```css
padding: 0.75rem;                 /* Relleno interno */
border-radius: 8px;               /* Bordes redondeados */
border: 1px solid [color];        /* Borde sutil */
```

### Texto de Label
```css
font-size: 0.55rem;               /* Pequeño */
color: #6b7280;                   /* Gris medio */
font-weight: 500;                 /* Semi-bold */
margin-bottom: 0.25rem;           /* Espacio con valor */
```

### Texto de Valor
```css
font-size: 1.1rem;                /* Grande */
font-weight: 700;                 /* Bold */
color: [color según métrica];     /* Color específico */
```

---

## 🔄 Lógica de Color Dinámico

### Utilidad Operativa
```typescript
color: saludNegocio.utilidadOperativa >= 0 
  ? '#0ea5e9'  // Azul cielo (positivo) ✓
  : '#dc2626'  // Rojo (negativo) ✗
```

**Ejemplos:**

**Caso 1: Utilidad Positiva**
```
Margen Bruto:       $13,000.00
Gastos:             $3,500.00
─────────────────────────────
Utilidad Operativa: $9,500.00  ← Color: #0ea5e9 (azul) ✓
```

**Caso 2: Utilidad Negativa**
```
Margen Bruto:       $8,000.00
Gastos:             $10,500.00
─────────────────────────────
Utilidad Operativa: -$2,500.00  ← Color: #dc2626 (rojo) ✗
```

**Caso 3: Utilidad Cero (Punto de Equilibrio)**
```
Margen Bruto:       $7,000.00
Gastos:             $7,000.00
─────────────────────────────
Utilidad Operativa: $0.00  ← Color: #0ea5e9 (azul) ✓
```

---

## 📊 Layout Responsivo

### Grid 3x2 (6 métricas)
```
┌───────────────┬───────────────┐
│   Ventas      │  Costo Venta  │  Fila 1
├───────────────┼───────────────┤
│ Margen Bruto  │   % Margen    │  Fila 2
├───────────────┼───────────────┤
│   Gastos      │ Util. Operat. │  Fila 3 ← NUEVA
└───────────────┴───────────────┘
```

### Orden Visual de Lectura
```
1 → 2
↓   ↓
3 → 4
↓   ↓
5 → 6
```

**Secuencia de lectura natural:**
1. Ventas
2. Costo de Venta
3. Margen Bruto
4. % Margen
5. Gastos (NUEVO)
6. Utilidad Operativa (NUEVO)

---

## 🎭 Estados del Dashboard

### Estado 1: Negocio Saludable
```
Ventas:             $25,000.00  ✓
Costo de Venta:     $12,000.00  ✓
Margen Bruto:       $13,000.00  ✓
% Margen:           52.00%      ✓ MUY BUENO
Gastos:             $3,500.00   ✓
Utilidad Operativa: $9,500.00   ✓ AZUL (positivo)

Estado: MUY BUENO
████████████████████░░░░░░░░ 52%
✓ Excelente desempeño
```

### Estado 2: Negocio con Pérdida Operativa
```
Ventas:             $18,000.00  ⚠
Costo de Venta:     $11,000.00  ⚠
Margen Bruto:       $7,000.00   ⚠
% Margen:           38.89%      ⚠ BAJO
Gastos:             $9,500.00   ⚠ Altos
Utilidad Operativa: -$2,500.00  ✗ ROJO (negativo)

Estado: BAJO
████████████░░░░░░░░░░░░░░░░ 39%
⚠ Revisar gastos operativos
```

### Estado 3: Negocio Crítico
```
Ventas:             $15,000.00  ✗
Costo de Venta:     $12,000.00  ✗
Margen Bruto:       $3,000.00   ✗
% Margen:           20.00%      ✗ CRÍTICO
Gastos:             $5,000.00   ✗
Utilidad Operativa: -$2,000.00  ✗ ROJO (pérdida)

Estado: CRÍTICO
████████░░░░░░░░░░░░░░░░░░░░ 20%
⚠ Margen bajo
⚠ Pérdida operativa
```

---

## 🔍 Detalles de Formato

### Formato de Moneda
```typescript
value.toLocaleString('en-US', { 
  minimumFractionDigits: 2, 
  maximumFractionDigits: 2 
})
```

**Ejemplos:**
- `25000` → `$25,000.00`
- `3500.5` → `$3,500.50`
- `9500.123` → `$9,500.12`
- `-2500` → `$-2,500.00`

### Formato de Porcentaje
```typescript
value.toFixed(2) + '%'
```

**Ejemplos:**
- `52` → `52.00%`
- `38.8888` → `38.89%`
- `20.1` → `20.10%`

---

## 📅 Etiqueta de Fecha

### Ubicación
```
┌─────────────────────────────────────────┐
│ 💜 Salud de mi Negocio    Feb 2026 ◄───│ Esquina superior derecha
│                                    ↑    │
│                              Visible    │
```

### Formato
```typescript
saludNegocio.periodo.mes
// Output: "febrero de 2026"
```

### Estilos
```css
position: absolute;
top: 1rem;
right: 1rem;
font-size: 0.7rem;
color: #6b7280;
font-weight: 500;
```

### Fallback
Si `periodo.mes` no existe:
```typescript
const meses = ['Enero', 'Febrero', ..., 'Diciembre'];
const now = new Date();
return `${meses[now.getMonth()]} ${now.getFullYear()}`;
```

---

## 🎯 Interpretación Visual Rápida

### Colores = Significado
```
🔵 Azul    → Ingresos (Ventas, Utilidad positiva)
🔴 Rojo    → Costos (Costo de Venta, Utilidad negativa)
🟢 Verde   → Ganancia (Margen Bruto)
🟣 Púrpura → Eficiencia (% Margen)
🟡 Amarillo → Gastos (Operativos)
```

### Semáforo de Salud
```
Verde  (50-70%)  → MUY BUENO ✓
Verde  (40-50%)  → SALUDABLE ✓
Ámbar  (30-40%)  → BAJO ⚠
Rojo   (<30%)    → CRÍTICO ✗
Verde  (>70%)    → REVISAR COSTEO ⚠
```

---

## 🧮 Flujo de Cálculo Visual

```
     ┌──────────┐
     │ VENTAS   │ $25,000
     └────┬─────┘
          │
          │ menos
          ▼
     ┌──────────────┐
     │ COSTO VENTA  │ $12,000
     └────┬─────────┘
          │
          │ igual
          ▼
     ┌──────────────┐
     │ MARGEN BRUTO │ $13,000 ◄── % MARGEN: 52%
     └────┬─────────┘
          │
          │ menos
          ▼
     ┌──────────┐
     │ GASTOS   │ $3,500 ← NUEVO
     └────┬─────┘
          │
          │ igual
          ▼
     ┌──────────────────┐
     │ UTILIDAD OPERAT. │ $9,500 ← NUEVO
     └──────────────────┘
```

---

## 💡 Tips de UX

### 1. Lectura Rápida
El usuario puede ver en **3 segundos**:
- ✓ Ventas del mes
- ✓ Ganancia bruta (margen)
- ✓ Ganancia neta después de gastos (utilidad)

### 2. Color Coding
Los colores ayudan a identificar:
- **Azul/Verde:** Positivo, buenas noticias
- **Rojo/Amarillo:** Atención requerida
- **Púrpura:** Métrica de eficiencia

### 3. Jerarquía Visual
```
Grande y Bold  → Valores monetarios (lo más importante)
Pequeño y Gris → Labels (contexto)
Color Vibrante → Valor numérico (llamar atención)
```

---

## 📱 Responsive Behavior

### Desktop (>768px)
```
┌─────────┬─────────┐
│ Metric1 │ Metric2 │
├─────────┼─────────┤
│ Metric3 │ Metric4 │
├─────────┼─────────┤
│ Metric5 │ Metric6 │
└─────────┴─────────┘
```

### Mobile (<768px)
```
┌───────────┐
│ Metric1   │
├───────────┤
│ Metric2   │
├───────────┤
│ Metric3   │
├───────────┤
│ Metric4   │
├───────────┤
│ Metric5   │
├───────────┤
│ Metric6   │
└───────────┘
```

---

## 🎨 Códigos de Color Completos

### Tarjeta: Ventas
```css
background-color: #eff6ff;  /* Blue-50 */
border: 1px solid #dbeafe;  /* Blue-100 */
color: #3b82f6;             /* Blue-500 */
```

### Tarjeta: Costo de Venta
```css
background-color: #fef2f2;  /* Red-50 */
border: 1px solid #fecaca;  /* Red-100 */
color: #ef4444;             /* Red-500 */
```

### Tarjeta: Margen Bruto
```css
background-color: #f0fdf4;  /* Green-50 */
border: 1px solid #bbf7d0;  /* Green-200 */
color: #10b981;             /* Green-500 */
```

### Tarjeta: % Margen
```css
background-color: #faf5ff;  /* Purple-50 */
border: 1px solid #e9d5ff;  /* Purple-200 */
color: #8b5cf6;             /* Purple-500 */
```

### Tarjeta: Gastos
```css
background-color: #fef3c7;  /* Amber-100 */
border: 1px solid #fde68a;  /* Amber-200 */
color: #f59e0b;             /* Amber-500 */
```

### Tarjeta: Utilidad Operativa
```css
background-color: #dbeafe;  /* Blue-100 */
border: 1px solid #bfdbfe;  /* Blue-200 */
color: #0ea5e9;             /* Sky-500 (si >= 0) */
color: #dc2626;             /* Red-600 (si < 0) */
```

---

**Guía Visual creada:** 17 de Febrero de 2026  
**Versión del Dashboard:** v2.5.B12  
**Autor:** GitHub Copilot
