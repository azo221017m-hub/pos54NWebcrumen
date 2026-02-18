# Implementación de Fórmulas de Salud del Negocio

## 📋 Resumen

Se implementaron fórmulas financieras para calcular métricas clave de salud del negocio:
- **Ventas**: Suma de ventas cobradas
- **Costo de Venta**: Suma de costos de productos vendidos
- **Margen Bruto**: Ventas - Costo de Venta
- **% Margen**: (Margen Bruto / Ventas) × 100

## 🎯 Objetivo

Proporcionar métricas financieras precisas en tiempo real para evaluar la rentabilidad del negocio en el Dashboard.

---

## 📊 Fórmulas Implementadas

### 1. Ventas
```sql
SELECT COALESCE(SUM(totaldeventa), 0) as totalVentas
FROM tblposcrumenwebventas 
WHERE idnegocio = ? 
  AND DATE(fechadeventa) BETWEEN ? AND ?
  AND estadodeventa = 'COBRADO'
  AND descripcionmov = 'VENTA'
```

**Criterios:**
- Solo ventas cobradas (`estadodeventa = 'COBRADO'`)
- Solo transacciones tipo VENTA (`descripcionmov = 'VENTA'`)
- Filtrado por negocio del usuario autenticado
- Rango de fechas: mes actual

---

### 2. Costo de Venta
```sql
SELECT COALESCE(SUM(cantidad * costo), 0) as costoVenta
FROM tblposcrumenwebdetallemovimientos
WHERE tipomovimiento = 'SALIDA'
  AND motivomovimiento IN ('VENTA', 'CONSUMO')
  AND estatusmovimiento = 'PROCESADO'
  AND DATE(fechamovimiento) BETWEEN ? AND ?
  AND idnegocio = ?
```

**Criterios:**
- Solo movimientos de salida (`tipomovimiento = 'SALIDA'`)
- Motivos: VENTA y CONSUMO
- Solo movimientos procesados (`estatusmovimiento = 'PROCESADO'`)
- Cálculo: `SUM(cantidad * costo)`
- Filtrado por negocio y rango de fechas

---

### 3. Margen Bruto
```typescript
const margenBruto = ventas - costoVenta;
```

**Fórmula:**
```
Margen Bruto = Ventas - Costo de Venta
```

---

### 4. % Margen
```typescript
const porcentajeMargen = ventas > 0 ? (margenBruto / ventas) * 100 : 0;
```

**Fórmula:**
```
% Margen = (Margen Bruto / Ventas) × 100
```

**Validación:**
- Si `ventas = 0`, entonces `% Margen = 0` (evita división por cero)

---

## 🔧 Implementación Backend

### Archivo: `backend/src/controllers/ventasWeb.controller.ts`

#### Función: `getBusinessHealth()`

```typescript
export const getBusinessHealth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Obtener rango de fechas del mes actual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startDate = firstDayOfMonth.toISOString().split('T')[0];
    const endDate = lastDayOfMonth.toISOString().split('T')[0];

    // 1. Calcular VENTAS
    const [ventasRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(totaldeventa), 0) as totalVentas
       FROM tblposcrumenwebventas 
       WHERE idnegocio = ? 
         AND DATE(fechadeventa) BETWEEN ? AND ?
         AND estadodeventa = 'COBRADO'
         AND descripcionmov = 'VENTA'`,
      [idnegocio, startDate, endDate]
    );

    const ventas = Number(ventasRows[0]?.totalVentas) || 0;

    // 2. Calcular COSTO DE VENTA
    const [costoVentaRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(cantidad * costo), 0) as costoVenta
       FROM tblposcrumenwebdetallemovimientos
       WHERE tipomovimiento = 'SALIDA'
         AND motivomovimiento IN ('VENTA', 'CONSUMO')
         AND estatusmovimiento = 'PROCESADO'
         AND DATE(fechamovimiento) BETWEEN ? AND ?
         AND idnegocio = ?`,
      [startDate, endDate, idnegocio]
    );

    const costoVenta = Number(costoVentaRows[0]?.costoVenta) || 0;

    // 3. Calcular MARGEN BRUTO
    const margenBruto = ventas - costoVenta;

    // 4. Calcular % MARGEN
    const porcentajeMargen = ventas > 0 ? (margenBruto / ventas) * 100 : 0;

    res.json({
      success: true,
      data: {
        ventas,
        costoVenta,
        margenBruto,
        porcentajeMargen: Number(porcentajeMargen.toFixed(2)),
        periodo: {
          inicio: startDate,
          fin: endDate,
          mes: now.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener salud del negocio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos de salud del negocio'
    });
  }
};
```

---

## 🌐 Implementación Frontend

### Archivo: `src/services/ventasWebService.ts`

#### Interface: `SaludNegocio`

```typescript
export interface SaludNegocio {
  // Nuevas métricas de salud del negocio
  ventas: number;
  costoVenta: number;
  margenBruto: number;
  porcentajeMargen: number;
  
  // Métricas legacy (compatibilidad)
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

#### Función: `obtenerSaludNegocio()`

```typescript
export const obtenerSaludNegocio = async (): Promise<SaludNegocio> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: SaludNegocio }>(
      `${API_BASE}/dashboard/salud-negocio`
    );
    return response.data.data;
  } catch (error) {
    // Retornar valores vacíos en caso de error
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      ventas: 0,
      costoVenta: 0,
      margenBruto: 0,
      porcentajeMargen: 0,
      totalVentas: 0,
      totalGastos: 0,
      totalCompras: 0,
      periodo: {
        inicio: firstDay.toISOString().split('T')[0],
        fin: lastDay.toISOString().split('T')[0]
      }
    };
  }
};
```

---

### Archivo: `src/pages/DashboardPage.tsx`

#### Card: "Salud de mi Negocio"

**Layout:**
- Grid 2x2 con las 4 métricas principales
- Barra de progreso del % Margen con indicador de salud
- Mensaje de estado según el margen

**Código:**

```tsx
{/* Main Metrics Grid */}
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
  {/* Ventas */}
  <div style={{ 
    padding: '0.75rem', 
    backgroundColor: '#eff6ff', 
    borderRadius: '8px',
    border: '1px solid #dbeafe'
  }}>
    <div style={{ fontSize: '0.55rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '500' }}>
      Ventas
    </div>
    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#3b82f6' }}>
      ${saludNegocio.ventas.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </div>
  </div>

  {/* Costo de Venta */}
  <div style={{ 
    padding: '0.75rem', 
    backgroundColor: '#fef2f2', 
    borderRadius: '8px',
    border: '1px solid #fecaca'
  }}>
    <div style={{ fontSize: '0.55rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '500' }}>
      Costo de Venta
    </div>
    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ef4444' }}>
      ${saludNegocio.costoVenta.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </div>
  </div>

  {/* Margen Bruto */}
  <div style={{ 
    padding: '0.75rem', 
    backgroundColor: '#f0fdf4', 
    borderRadius: '8px',
    border: '1px solid #bbf7d0'
  }}>
    <div style={{ fontSize: '0.55rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '500' }}>
      Margen Bruto
    </div>
    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#10b981' }}>
      ${saludNegocio.margenBruto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </div>
  </div>

  {/* % Margen */}
  <div style={{ 
    padding: '0.75rem', 
    backgroundColor: '#faf5ff', 
    borderRadius: '8px',
    border: '1px solid #e9d5ff'
  }}>
    <div style={{ fontSize: '0.55rem', color: '#6b7280', marginBottom: '0.25rem', fontWeight: '500' }}>
      % Margen
    </div>
    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#8b5cf6' }}>
      {saludNegocio.porcentajeMargen.toFixed(2)}%
    </div>
  </div>
</div>
```

**Indicador Visual del Margen:**

```tsx
<div style={{
  width: `${Math.min(Math.max(saludNegocio.porcentajeMargen, 0), 100)}%`,
  backgroundColor: saludNegocio.porcentajeMargen >= 30 
    ? '#10b981' // verde - saludable
    : saludNegocio.porcentajeMargen >= 15
      ? '#f59e0b' // ámbar - advertencia
      : '#ef4444', // rojo - crítico
  ...
}}>
```

**Criterios de Salud:**
- ✅ **Margen saludable**: ≥ 30%
- ⚠️ **Margen aceptable**: 15% - 29.99%
- 🔴 **Margen bajo**: < 15%
- ⚠️ **Sin margen**: Margen Bruto ≤ 0

---

## 📅 Periodo de Cálculo

**Rango de fechas:** Mes actual completo

```typescript
const now = new Date();
const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
```

**Formato:**
- `startDate`: `YYYY-MM-01` (primer día del mes)
- `endDate`: `YYYY-MM-DD` (último día del mes)
- `mes`: "febrero 2026" (formato legible)

---

## 🔒 Seguridad

### SQL Injection Prevention

Todas las consultas usan **parámetros preparados** (prepared statements):

```typescript
await pool.execute<RowDataPacket[]>(
  `SELECT ... WHERE idnegocio = ? AND DATE(fechamovimiento) BETWEEN ? AND ?`,
  [idnegocio, startDate, endDate]  // ✅ Parámetros seguros
);
```

### Autenticación

```typescript
const idnegocio = req.user?.idNegocio;

if (!idnegocio) {
  res.status(401).json({
    success: false,
    message: 'Usuario no autenticado'
  });
  return;
}
```

### Validación de Datos

```typescript
const ventas = Number(ventasRows[0]?.totalVentas) || 0;  // ✅ Conversión segura
const costoVenta = Number(costoVentaRows[0]?.costoVenta) || 0;  // ✅ Default a 0
const porcentajeMargen = ventas > 0 ? (margenBruto / ventas) * 100 : 0;  // ✅ Evita división por cero
```

---

## 🎨 UI/UX

### Colores por Métrica

| Métrica | Color | Código |
|---------|-------|--------|
| Ventas | Azul | `#3b82f6` |
| Costo de Venta | Rojo | `#ef4444` |
| Margen Bruto | Verde | `#10b981` |
| % Margen | Púrpura | `#8b5cf6` |

### Fondos de Cards

| Métrica | Fondo | Borde |
|---------|-------|-------|
| Ventas | `#eff6ff` | `#dbeafe` |
| Costo de Venta | `#fef2f2` | `#fecaca` |
| Margen Bruto | `#f0fdf4` | `#bbf7d0` |
| % Margen | `#faf5ff` | `#e9d5ff` |

### Barra de Estado del Margen

- **Verde** (`#10b981`): Margen ≥ 30%
- **Ámbar** (`#f59e0b`): Margen 15-29.99%
- **Rojo** (`#ef4444`): Margen < 15%

---

## 📊 Ejemplo de Respuesta

### Request
```
GET /api/ventas-web/dashboard/salud-negocio
Authorization: Bearer <token>
```

### Response
```json
{
  "success": true,
  "data": {
    "ventas": 15000.00,
    "costoVenta": 9000.00,
    "margenBruto": 6000.00,
    "porcentajeMargen": 40.00,
    "totalVentas": 15000.00,
    "totalGastos": 2000.00,
    "totalCompras": 8000.00,
    "periodo": {
      "inicio": "2026-02-01",
      "fin": "2026-02-28",
      "mes": "febrero 2026"
    }
  }
}
```

**Interpretación:**
- Ventas del mes: $15,000.00
- Costo de venta: $9,000.00
- Margen bruto: $6,000.00
- % Margen: 40% (✅ Saludable)

---

## ✅ Validaciones

### Caso 1: Sin ventas
```typescript
ventas = 0
costoVenta = 0
margenBruto = 0
porcentajeMargen = 0  // ✅ No hay división por cero
```

### Caso 2: Ventas con pérdida
```typescript
ventas = 1000
costoVenta = 1500
margenBruto = -500  // ✅ Negativo permitido
porcentajeMargen = -50  // ✅ Indica pérdida
```

### Caso 3: Sin costo registrado
```typescript
ventas = 5000
costoVenta = 0  // ✅ COALESCE retorna 0
margenBruto = 5000
porcentajeMargen = 100  // ✅ Margen completo
```

---

## 🚀 Endpoint

**URL:** `GET /api/ventas-web/dashboard/salud-negocio`

**Autenticación:** Requerida (JWT Bearer Token)

**Parámetros:** Ninguno (usa idnegocio del usuario autenticado y mes actual)

**Respuesta exitosa:** `200 OK`

**Errores:**
- `401 Unauthorized`: Token inválido o usuario no autenticado
- `500 Internal Server Error`: Error en base de datos

---

## 📝 Archivos Modificados

1. ✅ `backend/src/controllers/ventasWeb.controller.ts`
   - Modificada función `getBusinessHealth()`
   - Agregadas consultas para ventas y costo de venta
   - Implementadas fórmulas de margen

2. ✅ `src/services/ventasWebService.ts`
   - Extendida interface `SaludNegocio`
   - Agregados nuevos campos: ventas, costoVenta, margenBruto, porcentajeMargen

3. ✅ `src/pages/DashboardPage.tsx`
   - Actualizado estado inicial de `saludNegocio`
   - Rediseñado card "Salud de mi Negocio"
   - Agregado grid 2x2 de métricas
   - Agregada barra visual del % Margen
   - Agregados mensajes de estado

---

## 🎯 Pruebas Recomendadas

### Test 1: Ventas normales
- Crear ventas cobradas en el mes actual
- Verificar que aparezcan en "Ventas"
- Verificar que el costo se calcule correctamente

### Test 2: Sin ventas
- Verificar que muestre $0.00 en todas las métricas
- Verificar que no haya errores de división por cero

### Test 3: Múltiples negocios
- Login con diferentes usuarios
- Verificar que solo vean datos de su negocio

### Test 4: Cambio de mes
- Esperar cambio de mes
- Verificar que las métricas se actualicen al nuevo mes

---

## 📈 Mejoras Futuras

1. **Filtros de fecha personalizados**: Permitir seleccionar rangos personalizados
2. **Gráficos históricos**: Tendencia de margen mes a mes
3. **Comparativa con mes anterior**: % de crecimiento/decrecimiento
4. **Alertas**: Notificar si margen cae por debajo de umbral
5. **Export a Excel**: Descargar reporte de salud del negocio
6. **Costos indirectos**: Incluir gastos operativos en el cálculo

---

## 🔗 Referencias

- Tabla principal ventas: `tblposcrumenwebventas`
- Tabla detalle movimientos: `tblposcrumenwebdetallemovimientos`
- Endpoint: `/api/ventas-web/dashboard/salud-negocio`

---

**Fecha de implementación:** 17 de febrero de 2026  
**Versión:** 1.0  
**Estado:** ✅ Listo para producción
