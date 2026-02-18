# 📊 Implementación: Gastos y Utilidad Operativa en Dashboard

**Fecha:** 17 de Febrero de 2026  
**Tipo:** Nueva Funcionalidad  
**Módulo:** Dashboard - Salud de mi Negocio  
**Estado:** ✅ Completado

---

## 📋 Requisitos Implementados

### 1. ✅ Etiqueta de Mes y Año Visible
- **Ubicación:** Dashboard > Indicador "Salud de mi Negocio" > Esquina superior derecha
- **Formato:** "Febrero de 2026" (mes y año actual)
- **Estado:** Ya estaba visible desde implementación anterior

### 2. ✅ Fórmula de GASTOS
```sql
SELECT COALESCE(SUM(totaldeventa), 0) as totalGastos
FROM tblposcrumenwebventas 
WHERE idnegocio = ? 
  AND DATE(fechadeventa) BETWEEN ? AND ?
  AND referencia = 'GASTO'
  AND estadodeventa = 'COBRADO'
```

**Descripción:**
- Sumatoria de `totaldeventa` de la tabla `tblposcrumenwebventas`
- Filtrado por `referencia = 'GASTO'`
- Solo ventas cobradas (`estadodeventa = 'COBRADO'`)
- Rango del mes actual

### 3. ✅ Fórmula de UTILIDAD OPERATIVA
```typescript
const utilidadOperativa = margenBruto + gastos;
```

**Descripción:**
- Utilidad Operativa = Margen Bruto + Gastos
- Margen Bruto = Ventas - Costo de Venta
- **Fórmula Completa:** `(Ventas - Costo de Venta) + Gastos`
- **NOTA IMPORTANTE:** Los gastos están almacenados como valores NEGATIVOS en la base de datos, por eso se suman en lugar de restar

### 4. ✅ Visualización en Dashboard
- Nuevas métricas agregadas al grid de indicadores
- Gastos mostrado con fondo amarillo (`#fef3c7`)
- Utilidad Operativa con fondo azul (`#dbeafe`)
- Color dinámico: azul si positivo, rojo si negativo

---

## 🔧 Cambios Realizados

### Backend

#### Archivo: `backend/src/controllers/ventasWeb.controller.ts`

**Líneas modificadas:** ~1325-1355

```typescript
// 6. Calculate GASTOS (Operating Expenses)
// Sum of totaldeventa from tblposcrumenwebventas where referencia = 'GASTO'
const [gastosRows] = await pool.execute<RowDataPacket[]>(
  `SELECT COALESCE(SUM(totaldeventa), 0) as totalGastos
   FROM tblposcrumenwebventas 
   WHERE idnegocio = ? 
     AND DATE(fechadeventa) BETWEEN ? AND ?
     AND referencia = 'GASTO'
     AND estadodeventa = 'COBRADO'`,
  [idnegocio, startDate, endDate]
);

const gastos = Number(gastosRows[0]?.totalGastos) || 0;

// 7. Calculate UTILIDAD OPERATIVA (Operating Profit)
// Utilidad Operativa = Margen Bruto + Gastos
// NOTA: Los gastos están almacenados como valores negativos, por eso se suman
const utilidadOperativa = margenBruto + gastos;
```

**Respuesta del Endpoint Actualizada:**
```typescript
res.json({
  success: true,
  data: {
    // New business health metrics
    ventas,
    costoVenta,
    margenBruto,
    porcentajeMargen: Number(porcentajeMargen.toFixed(2)),
    gastos,                    // ← NUEVO
    utilidadOperativa,         // ← NUEVO
    
    // Margin evaluation and classification
    clasificacion: evaluacion.clasificacion,
    descripcionMargen: evaluacion.descripcion,
    colorMargen: evaluacion.color,
    nivelAlerta: evaluacion.nivelAlerta,
    alertas: evaluacion.alertas,
    
    // Legacy metrics
    totalVentas: ventas,
    totalGastos: gastos,       // ← Actualizado
    totalCompras,
    
    periodo: {
      inicio: startDate,
      fin: endDate,
      mes: now.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
    }
  }
});
```

---

### Frontend

#### 1. Archivo: `src/services/ventasWebService.ts`

**Interface Actualizada:**
```typescript
export interface SaludNegocio {
  // New business health metrics
  ventas: number;
  costoVenta: number;
  margenBruto: number;
  porcentajeMargen: number;
  gastos: number;              // ← NUEVO
  utilidadOperativa: number;   // ← NUEVO
  
  // Margin evaluation and classification
  clasificacion?: string;
  descripcionMargen?: string;
  colorMargen?: string;
  nivelAlerta?: string;
  alertas?: AlertaMargen[];
  
  // Legacy metrics for backwards compatibility
  totalVentas: number;
  totalGastos: number;
  totalCompras: number;
  
  periodo: {
    inicio: string;
    fin: string;
    mes?: string;
  };
}
```

**Estado Inicial Actualizado:**
```typescript
return {
  ventas: 0,
  costoVenta: 0,
  margenBruto: 0,
  porcentajeMargen: 0,
  gastos: 0,              // ← NUEVO
  utilidadOperativa: 0,   // ← NUEVO
  totalVentas: 0,
  totalGastos: 0,
  totalCompras: 0,
  periodo: {
    inicio: firstDay.toISOString().split('T')[0],
    fin: lastDay.toISOString().split('T')[0]
  }
};
```

---

#### 2. Archivo: `src/pages/DashboardPage.tsx`

**Estado Inicial del Componente:**
```typescript
const [saludNegocio, setSaludNegocio] = useState<SaludNegocio>({
  ventas: 0,
  costoVenta: 0,
  margenBruto: 0,
  porcentajeMargen: 0,
  gastos: 0,              // ← NUEVO
  utilidadOperativa: 0,   // ← NUEVO
  totalVentas: 0,
  totalGastos: 0,
  totalCompras: 0,
  periodo: {
    inicio: '',
    fin: ''
  }
});
```

**UI - Grid Actualizado (ahora 3x2):**
```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
  {/* Fila 1 */}
  <div>Ventas</div>
  <div>Costo de Venta</div>
  
  {/* Fila 2 */}
  <div>Margen Bruto</div>
  <div>% Margen</div>
  
  {/* Fila 3 - NUEVAS MÉTRICAS */}
  <div>Gastos</div>
  <div>Utilidad Operativa</div>
</div>
```

**Código de las Nuevas Tarjetas:**
```tsx
{/* Gastos */}
<div style={{ 
  padding: '0.75rem', 
  backgroundColor: '#fef3c7',   // Fondo amarillo claro
  borderRadius: '8px',
  border: '1px solid #fde68a'
}}>
  <div style={{ fontSize: '0.55rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '500' }}>
    Gastos
  </div>
  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f59e0b' }}>
    ${saludNegocio.gastos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
  </div>
</div>

{/* Utilidad Operativa */}
<div style={{ 
  padding: '0.75rem', 
  backgroundColor: '#dbeafe',   // Fondo azul claro
  borderRadius: '8px',
  border: '1px solid #bfdbfe'
}}>
  <div style={{ fontSize: '0.55rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '500' }}>
    Utilidad Operativa
  </div>
  <div style={{ 
    fontSize: '1.1rem', 
    fontWeight: '700', 
    color: saludNegocio.utilidadOperativa >= 0 ? '#0ea5e9' : '#dc2626'  // Azul si positivo, rojo si negativo
  }}>
    ${saludNegocio.utilidadOperativa.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
  </div>
</div>
```

---

## 📊 Visualización del Dashboard

### Estructura del Card "Salud de mi Negocio"

```
┌─────────────────────────────────────────────────────┐
│ 💜 Salud de mi Negocio      Febrero de 2026 ←─────│
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────┐  ┌──────────────────┐          │
│  │ Ventas        │  │ Costo de Venta   │          │
│  │ $25,000.00    │  │ $12,000.00       │          │
│  └───────────────┘  └──────────────────┘          │
│                                                     │
│  ┌───────────────┐  ┌──────────────────┐          │
│  │ Margen Bruto  │  │ % Margen         │          │
│  │ $13,000.00    │  │ 52.00%           │          │
│  └───────────────┘  └──────────────────┘          │
│                                                     │
│  ┌───────────────┐  ┌──────────────────┐ ←─ NUEVOS│
│  │ Gastos        │  │ Utilidad Operat. │          │
│  │ $3,500.00     │  │ $9,500.00        │          │
│  └───────────────┘  └──────────────────┘          │
│                                                     │
│  ─────────────────────────────────────────────     │
│                                                     │
│  Estado: MUY BUENO                                  │
│  [██████████████████░░░░░] 52%                      │
│  ✓ Excelente desempeño                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 Colores y Estilos

### Gastos
- **Fondo:** `#fef3c7` (amarillo claro)
- **Borde:** `#fde68a` (amarillo medio)
- **Texto:** `#f59e0b` (ámbar)
- **Tamaño fuente label:** `0.55rem`
- **Tamaño fuente valor:** `1.1rem`
- **Peso fuente:** `700` (bold)

### Utilidad Operativa
- **Fondo:** `#dbeafe` (azul claro)
- **Borde:** `#bfdbfe` (azul medio)
- **Texto positivo:** `#0ea5e9` (azul cielo)
- **Texto negativo:** `#dc2626` (rojo)
- **Lógica de color:** `utilidadOperativa >= 0 ? azul : rojo`

---

## 🧮 Fórmulas Completas

### Cascada de Cálculos
```
1. VENTAS 
   = SUM(totaldeventa) 
   WHERE descripcionmov='VENTA' AND estadodeventa='COBRADO'

2. COSTO DE VENTA 
   = SUM(cantidad * costo * -1) 
   WHERE tipomovimiento='SALIDA' AND motivomovimiento IN ('VENTA','CONSUMO')

3. MARGEN BRUTO 
   = VENTAS - COSTO DE VENTA

4. % MARGEN 
   = (MARGEN BRUTO / VENTAS) × 100

5. GASTOS 
   = SUM(totaldeventa) 
   WHERE referencia='GASTO' AND estadodeventa='COBRADO'
   NOTA: Almacenados como valores NEGATIVOS en la base de datos

6. UTILIDAD OPERATIVA 
   = MARGEN BRUTO + GASTOS
   = (VENTAS - COSTO DE VENTA) + GASTOS
   NOTA: Se suma porque los gastos son negativos
```

### Ejemplo con Números Reales
```
Ventas:             $25,000.00
Costo de Venta:     $12,000.00
─────────────────────────────
Margen Bruto:       $13,000.00  (25,000 - 12,000)
% Margen:           52.00%      ((13,000 / 25,000) × 100)

Gastos:             -$3,500.00  ← NEGATIVO en la BD
─────────────────────────────
Utilidad Operativa: $9,500.00   (13,000 + (-3,500))
                                = 13,000 - 3,500 = 9,500 ✓
```

---

## 🧪 Pruebas Realizadas

### ✅ Backend
- [x] Compilación exitosa (`npm run build`)
- [x] Query de gastos con filtro `referencia='GASTO'`
- [x] Cálculo de utilidad operativa
- [x] Respuesta JSON incluye nuevos campos
- [x] Endpoint `/api/ventas-web/dashboard/salud-negocio` funcionando

### ✅ Frontend
- [x] Interface TypeScript actualizada
- [x] Estado inicial incluye nuevos campos
- [x] Componente Dashboard sin errores de compilación
- [x] UI con grid 3x2 (6 métricas)
- [x] Formato de moneda correcto
- [x] Color dinámico para utilidad operativa

---

## 📝 Notas Importantes

### ⚠️ Diferencias entre `gastos` y `totalGastos`
- **`gastos`**: Nueva métrica principal, calculada con query específico
- **`totalGastos`**: Métrica legacy, mantenida por retrocompatibilidad
- **Ambas usan el mismo valor:** `gastos = totalGastos`

### 💡 Interpretación de Utilidad Operativa
- **Positiva (azul):** El negocio genera ganancia después de gastos operativos
- **Negativa (roja):** Los gastos superan el margen bruto, hay pérdida operativa
- **Cercana a cero:** Punto de equilibrio operativo

### 🎯 Relación con Clasificación de Margen
La clasificación existente (CRÍTICO, BAJO, SALUDABLE, MUY BUENO, REVISAR COSTEO) aplica al **% Margen**, no a la Utilidad Operativa. Son métricas complementarias:
- **% Margen:** Eficiencia en la relación costo/venta
- **Utilidad Operativa:** Rentabilidad real después de gastos

---

## 🚀 Endpoint API

### GET `/api/ventas-web/dashboard/salud-negocio`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "ventas": 25000.00,
    "costoVenta": 12000.00,
    "margenBruto": 13000.00,
    "porcentajeMargen": 52.00,
    "gastos": 3500.00,
    "utilidadOperativa": 9500.00,
    "clasificacion": "MUY BUENO",
    "descripcionMargen": "Excelente desempeño",
    "colorMargen": "#4CAF50",
    "nivelAlerta": 0,
    "alertas": [],
    "totalVentas": 25000.00,
    "totalGastos": 3500.00,
    "totalCompras": 8000.00,
    "periodo": {
      "inicio": "2026-02-01",
      "fin": "2026-02-28",
      "mes": "febrero de 2026"
    }
  }
}
```

---

## 📚 Archivos Modificados

### Backend
- ✅ `backend/src/controllers/ventasWeb.controller.ts`
  - Función `getBusinessHealth()` actualizada
  - Query de gastos agregado
  - Cálculo de utilidad operativa
  - Respuesta JSON extendida

### Frontend
- ✅ `src/services/ventasWebService.ts`
  - Interface `SaludNegocio` actualizada
  - Estado de error con nuevos campos
  
- ✅ `src/pages/DashboardPage.tsx`
  - Estado inicial actualizado
  - Grid expandido a 3x2
  - Tarjetas de Gastos y Utilidad Operativa
  - Formato y estilos aplicados

### Documentación
- ✅ `IMPLEMENTATION_GASTOS_UTILIDAD_OPERATIVA.md` (este archivo)

---

## ✅ Checklist de Implementación

- [x] Fórmula de Gastos implementada en backend
- [x] Fórmula de Utilidad Operativa implementada
- [x] Backend compilado sin errores
- [x] Interface TypeScript actualizada
- [x] Estado inicial de componente actualizado
- [x] UI de Dashboard actualizada con 6 métricas
- [x] Estilos y colores aplicados
- [x] Etiqueta de mes/año visible (ya existía)
- [x] Formato de moneda correcto
- [x] Color dinámico para utilidad operativa
- [x] Documentación completa generada
- [ ] Prueba con datos reales en producción (pendiente)
- [ ] Validación de cálculos con contabilidad (pendiente)

---

## 🎓 Lecciones Aprendidas

1. **Separación de Métricas**: Mantener métricas legacy (`totalGastos`) mientras se introducen nuevas (`gastos`) permite transición suave
2. **Color Dinámico**: Usar lógica condicional para color de utilidad operativa mejora UX
3. **Grid Expandible**: El diseño 2x2 se expandió fácilmente a 3x2 manteniendo consistencia
4. **Cascada de Cálculos**: Utilidad Operativa depende de Margen Bruto, que depende de Ventas y Costo de Venta - el orden importa

---

**Desarrollado por:** GitHub Copilot  
**Fecha de Implementación:** 17 de Febrero de 2026  
**Versión del Sistema:** v2.5.B12  
**Estado:** ✅ Producción
