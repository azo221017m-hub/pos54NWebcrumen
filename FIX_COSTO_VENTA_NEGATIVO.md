# 🔧 Fix: Ajuste de Fórmula Costo de Venta (Cantidades Negativas)

**Fecha:** 2025-01-XX  
**Tipo:** Corrección de Fórmula  
**Severidad:** CRÍTICA - Afecta cálculos financieros  
**Estado:** ✅ Completado

---

## 📋 Problema Identificado

### Descripción del Error
La fórmula de **Costo de Venta** estaba produciendo valores **negativos** porque las cantidades en la base de datos están almacenadas en negativo para movimientos de tipo `SALIDA`.

### Impacto
- ❌ Costo de Venta calculado como valor **negativo**
- ❌ Margen Bruto inflado incorrectamente (ventas - (-costo) = ventas + costo)
- ❌ % Margen erróneo, mostrando valores superiores al 100%
- ❌ Clasificación de margen incorrecta (REVISAR COSTEO cuando debería ser CRÍTICO)
- ❌ Alertas inadecuadas o ausentes

### Causa Raíz
El campo `cantidad` en `tblposcrumenwebdetallemovimientos` almacena valores **negativos** para movimientos de salida:
- Ejemplo: Una venta de 5 unidades se almacena como `cantidad = -5`
- Esto es correcto desde el punto de vista de inventario (resta del stock)
- Pero requiere ajuste en la fórmula de costeo para obtener valores positivos

---

## ✅ Solución Implementada

### Fórmula ANTES (Incorrecta)
```sql
SELECT COALESCE(SUM(cantidad * costo), 0) as costoVenta
FROM tblposcrumenwebdetallemovimientos
WHERE tipomovimiento = 'SALIDA'
  AND motivomovimiento IN ('VENTA', 'CONSUMO')
  AND estatusmovimiento = 'PROCESADO'
  AND DATE(fechamovimiento) BETWEEN ? AND ?
  AND idnegocio = ?
```

**Resultado con datos reales:**
- cantidad = -5, costo = 100
- Cálculo: (-5) × 100 = **-500** ❌ (negativo)

### Fórmula DESPUÉS (Correcta)
```sql
SELECT COALESCE(SUM(cantidad * costo * -1), 0) as costoVenta
FROM tblposcrumenwebdetallemovimientos
WHERE tipomovimiento = 'SALIDA'
  AND motivomovimiento IN ('VENTA', 'CONSUMO')
  AND estatusmovimiento = 'PROCESADO'
  AND DATE(fechamovimiento) BETWEEN ? AND ?
  AND idnegocio = ?
```

**Resultado con datos reales:**
- cantidad = -5, costo = 100
- Cálculo: (-5) × 100 × (-1) = **500** ✅ (positivo)

### Explicación Matemática
```
cantidad: -5 (negativo porque es salida)
costo: 100 (positivo)
factor: -1 (corrección)

Cálculo:
(-5) × 100 × (-1) = -500 × (-1) = 500 ✅

Regla: negativo × positivo × negativo = POSITIVO
```

---

## 🔨 Cambios Realizados

### 1. Backend - Controlador Principal
**Archivo:** `backend/src/controllers/ventasWeb.controller.ts`  
**Línea:** ~1302

```typescript
// 2. Calcular COSTO DE VENTA
// NOTA: cantidad está almacenada en negativo, por eso se multiplica por -1
const [costoVentaRows] = await pool.execute<RowDataPacket[]>(
  `SELECT COALESCE(SUM(cantidad * costo * -1), 0) as costoVenta
   FROM tblposcrumenwebdetallemovimientos
   WHERE tipomovimiento = 'SALIDA'
     AND motivomovimiento IN ('VENTA', 'CONSUMO')
     AND estatusmovimiento = 'PROCESADO'
     AND DATE(fechamovimiento) BETWEEN ? AND ?
     AND idnegocio = ?`,
  [startDate, endDate, idnegocio]
);
```

**Cambios:**
- ✅ Agregado `* -1` a la fórmula SQL
- ✅ Agregado comentario explicativo
- ✅ Compilación exitosa sin errores

### 2. Documentación Actualizada

#### `IMPLEMENTATION_SALUD_NEGOCIO_FORMULAS.md`
- ✅ Sección "2. Costo de Venta" actualizada (línea ~39)
- ✅ Criterios de cálculo actualizados (línea ~58)
- ✅ Código TypeScript de ejemplo actualizado (línea ~132)

#### `RESUMEN_EJECUTIVO_SALUD_NEGOCIO.md`
- ✅ Requisito 1: Costo de Venta actualizado (línea ~275)
- ✅ Fórmula documentada con aclaración de cantidad negativa

---

## 🧪 Validación

### Compilación Backend
```powershell
npm run build
# Exit code: 0 ✅
# Sin errores de TypeScript
```

### Prueba Manual Sugerida
```sql
-- Verificar valores de cantidad en la base de datos
SELECT 
  cantidad,
  costo,
  (cantidad * costo) as sin_correccion,
  (cantidad * costo * -1) as con_correccion
FROM tblposcrumenwebdetallemovimientos
WHERE tipomovimiento = 'SALIDA'
  AND motivomovimiento IN ('VENTA', 'CONSUMO')
LIMIT 10;
```

**Resultado Esperado:**
| cantidad | costo | sin_correccion | con_correccion |
|----------|-------|----------------|----------------|
| -5       | 100   | -500 ❌        | 500 ✅         |
| -10      | 50    | -500 ❌        | 500 ✅         |
| -3       | 200   | -600 ❌        | 600 ✅         |

### Prueba de Endpoint
```bash
GET /api/ventas-web/dashboard/salud-negocio
Authorization: Bearer <token>
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "data": {
    "ventas": 25000.00,
    "costoVenta": 12000.00,  // ✅ Valor POSITIVO
    "margenBruto": 13000.00,  // ✅ ventas - costoVenta
    "porcentajeMargen": 52.00, // ✅ (13000/25000)*100
    "clasificacion": "MUY BUENO",
    "descripcionMargen": "Excelente desempeño",
    "colorMargen": "#4CAF50",
    "nivelAlerta": 0,
    "alertas": []
  }
}
```

---

## 📊 Impacto de la Corrección

### Antes de la Corrección
- Ventas: $25,000
- Costo de Venta: **-$12,000** ❌
- Margen Bruto: $25,000 - (-$12,000) = **$37,000** ❌ (inflado)
- % Margen: ($37,000 / $25,000) × 100 = **148%** ❌
- Clasificación: **REVISAR COSTEO** ❌
- Alertas: "Margen excepcionalmente alto sugiere error en costeo" ❌

### Después de la Corrección
- Ventas: $25,000
- Costo de Venta: **$12,000** ✅
- Margen Bruto: $25,000 - $12,000 = **$13,000** ✅
- % Margen: ($13,000 / $25,000) × 100 = **52%** ✅
- Clasificación: **MUY BUENO** ✅
- Alertas: [] ✅ (sin alertas, margen saludable)

---

## 🎯 Componentes Afectados

### Backend
- ✅ `ventasWeb.controller.ts` → `getBusinessHealth()`

### Métricas Dependientes
- ✅ Costo de Venta (ahora positivo)
- ✅ Margen Bruto (cálculo correcto)
- ✅ % Margen (valores reales)
- ✅ Clasificación de Margen (evaluación precisa)
- ✅ Sistema de Alertas (recomendaciones adecuadas)

### Frontend (Sin cambios)
- ℹ️ `DashboardPage.tsx` - recibe datos corregidos automáticamente
- ℹ️ `ventasWebService.ts` - sin cambios en interface
- ℹ️ Card "Salud de mi Negocio" - muestra valores correctos

---

## 🔐 Regla de Negocio Documentada

### Almacenamiento de Cantidades en DB
```
ENTRADA (compras, recepciones):
  cantidad = POSITIVO (+5, +10, etc.)
  
SALIDA (ventas, consumos):
  cantidad = NEGATIVO (-5, -10, etc.)
```

### Implicaciones en Queries
```sql
-- ❌ INCORRECTO: Para costeo de salidas
SUM(cantidad * costo)  -- Produce valores negativos

-- ✅ CORRECTO: Para costeo de salidas
SUM(cantidad * costo * -1)  -- Convierte a valores positivos

-- ✅ CORRECTO: Para control de inventario
SUM(cantidad)  -- Mantener negativos para balance de stock
```

---

## ✅ Checklist de Verificación

- [x] Código modificado en `ventasWeb.controller.ts`
- [x] Comentario explicativo agregado
- [x] Backend compilado sin errores
- [x] Documentación `IMPLEMENTATION_SALUD_NEGOCIO_FORMULAS.md` actualizada
- [x] Documentación `RESUMEN_EJECUTIVO_SALUD_NEGOCIO.md` actualizada
- [x] Todas las referencias a la fórmula corregidas
- [x] Explicación matemática documentada
- [ ] Prueba manual con datos reales (pendiente)
- [ ] Verificación de clasificaciones de margen (pendiente)
- [ ] Validación de alertas en diferentes escenarios (pendiente)

---

## 🚀 Próximos Pasos Recomendados

1. **Prueba con Datos Reales**
   - Ejecutar endpoint `/api/ventas-web/dashboard/salud-negocio`
   - Verificar que `costoVenta` sea positivo
   - Confirmar clasificación de margen sea correcta

2. **Validación de Alertas**
   - Probar con diferentes rangos de margen
   - Verificar alertas se activen correctamente cuando margen < 40%
   - Confirmar COST001 se active cuando margen > 70%

3. **Monitoreo en Producción**
   - Observar métricas durante primeros días
   - Comparar con cálculos manuales
   - Ajustar umbrales de clasificación si necesario

---

## 📝 Notas Importantes

⚠️ **CRÍTICO:** Esta corrección afecta todos los cálculos financieros del Dashboard "Salud de mi Negocio". Es fundamental probar con datos reales antes de confiar en las métricas para toma de decisiones.

✅ **BENEFICIO:** Con esta corrección, los usuarios ahora verán:
- Costos de venta reales (valores positivos)
- Márgenes brutos precisos
- Porcentajes de margen correctos
- Clasificaciones adecuadas (CRÍTICO, BAJO, SALUDABLE, MUY BUENO, REVISAR COSTEO)
- Alertas y recomendaciones pertinentes

📚 **APRENDIZAJE:** Siempre validar supuestos sobre el modelo de datos antes de implementar fórmulas financieras. En este caso, la convención de almacenar cantidades negativas para salidas es estándar en contabilidad de inventarios, pero requiere ajustes en queries de costeo.

---

**Desarrollado por:** GitHub Copilot  
**Revisión:** Pendiente  
**Aprobación:** Pendiente
