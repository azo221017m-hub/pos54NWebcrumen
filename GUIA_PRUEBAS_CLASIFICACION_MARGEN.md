# 🧪 GUÍA DE PRUEBAS - CLASIFICACIÓN DE MARGEN

## Ejemplos de prueba para validar el sistema de clasificación de margen

---

## 📝 Cómo usar esta guía

1. Iniciar el servidor backend
2. Crear ventas con los datos de cada ejemplo
3. Acceder al Dashboard
4. Verificar que la clasificación y alertas coincidan con lo esperado

---

## Test 1: Margen CRÍTICO (< 30%)

### Datos de Entrada:
```
Ventas del mes: $10,000
Costo de venta: $8,000
```

### Cálculo:
```
Margen Bruto = 10,000 - 8,000 = $2,000
% Margen = (2,000 / 10,000) × 100 = 20%
```

### Resultado Esperado:
- ✅ Clasificación: **CRÍTICO**
- ✅ Descripción: "Margen muy bajo (riesgoso)"
- ✅ Color: Rojo (#ef4444)
- ✅ Nivel de Alerta: ALTA
- ✅ Número de alertas: 4
- ✅ Alertas mostradas:
  1. Recetas mal costadas
  2. Mermas no registradas
  3. Precio de venta bajo
  4. Insumos con sobrecosto

### Cómo se ve en Dashboard:
```
┌────────────────────────────────────┐
│ Estado: CRÍTICO                    │
│ ████░░░░░░░░░░░░ 20.0%            │
│ ⚠ Margen muy bajo (riesgoso)      │
│                                    │
│ ⚠️ Sugerencias de Mejora           │
│ [4 alertas amarillas mostradas]    │
└────────────────────────────────────┘
```

---

## Test 2: Margen BAJO (30-39%)

### Datos de Entrada:
```
Ventas del mes: $10,000
Costo de venta: $6,500
```

### Cálculo:
```
Margen Bruto = 10,000 - 6,500 = $3,500
% Margen = (3,500 / 10,000) × 100 = 35%
```

### Resultado Esperado:
- ✅ Clasificación: **BAJO**
- ✅ Descripción: "Requiere revisión"
- ✅ Color: Ámbar (#f59e0b)
- ✅ Nivel de Alerta: MEDIA
- ✅ Número de alertas: 4 (< 40%)
- ✅ Alertas: Las mismas 4 del test anterior

### Cómo se ve en Dashboard:
```
┌────────────────────────────────────┐
│ Estado: BAJO                       │
│ ████████░░░░░░░░ 35.0%            │
│ ⚠ Requiere revisión                │
│                                    │
│ ⚠️ Sugerencias de Mejora           │
│ [4 alertas amarillas mostradas]    │
└────────────────────────────────────┘
```

---

## Test 3: Margen SALUDABLE (40-50%)

### Datos de Entrada:
```
Ventas del mes: $15,000
Costo de venta: $9,000
```

### Cálculo:
```
Margen Bruto = 15,000 - 9,000 = $6,000
% Margen = (6,000 / 15,000) × 100 = 40%
```

### Resultado Esperado:
- ✅ Clasificación: **SALUDABLE**
- ✅ Descripción: "Margen adecuado"
- ✅ Color: Verde (#10b981)
- ✅ Nivel de Alerta: NINGUNA
- ✅ Número de alertas: 0
- ✅ Sin sugerencias de mejora

### Cómo se ve en Dashboard:
```
┌────────────────────────────────────┐
│ Estado: SALUDABLE                  │
│ ████████████████░░░░ 40.0%        │
│ ✓ Margen adecuado                 │
└────────────────────────────────────┘
```

---

## Test 4: Margen MUY BUENO (50-70%)

### Datos de Entrada:
```
Ventas del mes: $20,000
Costo de venta: $8,000
```

### Cálculo:
```
Margen Bruto = 20,000 - 8,000 = $12,000
% Margen = (12,000 / 20,000) × 100 = 60%
```

### Resultado Esperado:
- ✅ Clasificación: **MUY BUENO**
- ✅ Descripción: "Margen excelente"
- ✅ Color: Azul (#3b82f6)
- ✅ Nivel de Alerta: NINGUNA
- ✅ Número de alertas: 0

### Cómo se ve en Dashboard:
```
┌────────────────────────────────────┐
│ Estado: MUY BUENO                  │
│ ████████████████████████ 60.0%    │
│ ✓ Margen excelente                │
└────────────────────────────────────┘
```

---

## Test 5: REVISAR COSTEO (> 70%)

### Datos de Entrada:
```
Ventas del mes: $10,000
Costo de venta: $2,000
```

### Cálculo:
```
Margen Bruto = 10,000 - 2,000 = $8,000
% Margen = (8,000 / 10,000) × 100 = 80%
```

### Resultado Esperado:
- ✅ Clasificación: **REVISAR COSTEO**
- ✅ Descripción: "Posible error en costos"
- ✅ Color: Púrpura (#8b5cf6)
- ✅ Nivel de Alerta: ALTA
- ✅ Número de alertas: 1
- ✅ Alerta mostrada: "Verificar costeo de productos"

### Cómo se ve en Dashboard:
```
┌────────────────────────────────────┐
│ Estado: REVISAR COSTEO             │
│ ████████████████████████████ 80%  │
│ ⚠ Posible error en costos         │
│                                    │
│ ⚠️ Sugerencias de Mejora           │
│ Verificar costeo de productos      │
└────────────────────────────────────┘
```

---

## Test 6: Caso Edge - Sin Ventas

### Datos de Entrada:
```
Ventas del mes: $0
Costo de venta: $0
```

### Cálculo:
```
Margen Bruto = 0 - 0 = $0
% Margen = (0 / 0) → 0% (validación división por cero)
```

### Resultado Esperado:
- ✅ No debe haber error de división por cero
- ✅ Clasificación: **CRÍTICO** (< 30%)
- ✅ % Margen: 0%
- ✅ Debe funcionar sin crashes

---

## Test 7: Caso Edge - Margen Negativo (Pérdidas)

### Datos de Entrada:
```
Ventas del mes: $5,000
Costo de venta: $6,000
```

### Cálculo:
```
Margen Bruto = 5,000 - 6,000 = -$1,000
% Margen = (-1,000 / 5,000) × 100 = -20%
```

### Resultado Esperado:
- ✅ Clasificación: **CRÍTICO** (< 30%)
- ✅ % Margen: -20%
- ✅ Muestra margen negativo
- ✅ 4 alertas mostradas

---

## Test 8: Caso Edge - Límite Exacto 30%

### Datos de Entrada:
```
Ventas del mes: $10,000
Costo de venta: $7,000
```

### Cálculo:
```
Margen Bruto = 10,000 - 7,000 = $3,000
% Margen = (3,000 / 10,000) × 100 = 30%
```

### Resultado Esperado:
- ✅ Clasificación: **BAJO** (>= 30%)
- ✅ NO debe ser CRÍTICO
- ✅ Color: Ámbar
- ✅ 4 alertas (< 40%)

---

## Test 9: Caso Edge - Límite Exacto 40%

### Datos de Entrada:
```
Ventas del mes: $10,000
Costo de venta: $6,000
```

### Cálculo:
```
Margen Bruto = 10,000 - 6,000 = $4,000
% Margen = (4,000 / 10,000) × 100 = 40%
```

### Resultado Esperado:
- ✅ Clasificación: **SALUDABLE** (>= 40%)
- ✅ NO debe ser BAJO
- ✅ Color: Verde
- ✅ Sin alertas (>= 40%)

---

## Test 10: Caso Edge - Límite Exacto 50%

### Datos de Entrada:
```
Ventas del mes: $10,000
Costo de venta: $5,000
```

### Cálculo:
```
Margen Bruto = 10,000 - 5,000 = $5,000
% Margen = (5,000 / 10,000) × 100 = 50%
```

### Resultado Esperado:
- ✅ Clasificación: **SALUDABLE** (<= 50%)
- ✅ NO debe ser MUY BUENO
- ✅ Color: Verde

---

## Test 11: Caso Edge - Límite Exacto 70%

### Datos de Entrada:
```
Ventas del mes: $10,000
Costo de venta: $3,000
```

### Cálculo:
```
Margen Bruto = 10,000 - 3,000 = $7,000
% Margen = (7,000 / 10,000) × 100 = 70%
```

### Resultado Esperado:
- ✅ Clasificación: **MUY BUENO** (<= 70%)
- ✅ NO debe ser REVISAR COSTEO
- ✅ Color: Azul
- ✅ Sin alertas

---

## 📊 Tabla de Resumen de Tests

| Test | Ventas | Costo | % Margen | Clasificación | Alertas | Color |
|------|--------|-------|----------|---------------|---------|-------|
| 1 | $10,000 | $8,000 | 20% | CRÍTICO | 4 | 🔴 Rojo |
| 2 | $10,000 | $6,500 | 35% | BAJO | 4 | 🟡 Ámbar |
| 3 | $15,000 | $9,000 | 40% | SALUDABLE | 0 | 🟢 Verde |
| 4 | $20,000 | $8,000 | 60% | MUY BUENO | 0 | 🔵 Azul |
| 5 | $10,000 | $2,000 | 80% | REVISAR COSTEO | 1 | 🟣 Púrpura |
| 6 | $0 | $0 | 0% | CRÍTICO | 4 | 🔴 Rojo |
| 7 | $5,000 | $6,000 | -20% | CRÍTICO | 4 | 🔴 Rojo |
| 8 | $10,000 | $7,000 | 30% | BAJO | 4 | 🟡 Ámbar |
| 9 | $10,000 | $6,000 | 40% | SALUDABLE | 0 | 🟢 Verde |
| 10 | $10,000 | $5,000 | 50% | SALUDABLE | 0 | 🟢 Verde |
| 11 | $10,000 | $3,000 | 70% | MUY BUENO | 0 | 🔵 Azul |

---

## 🔍 Cómo Verificar Cada Test

### Opción 1: Crear ventas reales
1. Login al sistema
2. Crear ventas hasta alcanzar los montos del test
3. Ir al Dashboard
4. Verificar card "Salud de mi Negocio"

### Opción 2: Probar endpoint directamente
```bash
# Endpoint
GET http://localhost:3000/api/ventas-web/dashboard/salud-negocio

# Headers
Authorization: Bearer <tu_token_jwt>

# Verificar response.data
{
  "porcentajeMargen": 40.00,
  "clasificacion": "SALUDABLE",
  "alertas": []
}
```

### Opción 3: Unit tests (recomendado para CI/CD)
```typescript
import { evaluarMargen } from '../utils/margen.utils';

// Test 1: Margen crítico
test('Margen 20% debe ser CRÍTICO con 4 alertas', () => {
  const resultado = evaluarMargen(20);
  expect(resultado.clasificacion).toBe('CRÍTICO');
  expect(resultado.alertas.length).toBe(4);
});

// Test 3: Margen saludable
test('Margen 40% debe ser SALUDABLE sin alertas', () => {
  const resultado = evaluarMargen(40);
  expect(resultado.clasificacion).toBe('SALUDABLE');
  expect(resultado.alertas.length).toBe(0);
});
```

---

## ✅ Checklist de Validación

Marca cada test después de verificarlo:

- [ ] Test 1: CRÍTICO (20%)
- [ ] Test 2: BAJO (35%)
- [ ] Test 3: SALUDABLE (40%)
- [ ] Test 4: MUY BUENO (60%)
- [ ] Test 5: REVISAR COSTEO (80%)
- [ ] Test 6: Sin ventas (0%)
- [ ] Test 7: Margen negativo (-20%)
- [ ] Test 8: Límite 30% exacto
- [ ] Test 9: Límite 40% exacto
- [ ] Test 10: Límite 50% exacto
- [ ] Test 11: Límite 70% exacto

---

## 🐛 Problemas Comunes

### Problema: Las alertas no aparecen
**Solución:** Verificar que `porcentajeMargen < 40`

### Problema: Clasificación incorrecta
**Solución:** Revisar rangos en `margen.config.ts`

### Problema: Error "division by zero"
**Solución:** Verificar validación `ventas > 0` en utils

### Problema: Colores no se muestran
**Solución:** Verificar que `colorMargen` llegue desde backend

---

## 📝 Notas Finales

- Todos los tests deben pasar sin errores
- La barra de progreso debe reflejar el % correcto
- Los colores deben coincidir con la clasificación
- Las alertas solo aparecen cuando aplican
- El sistema debe manejar casos edge sin crashes

---

**Fecha:** 17 de febrero de 2026  
**Versión:** 1.0  
**Estado:** ✅ **LISTO PARA PRUEBAS**
