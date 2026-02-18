# 📐 Explicación Visual: Fórmula Utilidad Operativa

**Fecha:** 18 de Febrero de 2026

---

## 🔢 El Problema: Signos en la Base de Datos

### Modelo de Datos
```
┌─────────────────────────────────────────────┐
│ tblposcrumenwebventas                       │
├─────────────────────────────────────────────┤
│ idventa │ totaldeventa │ referencia         │
├─────────┼──────────────┼────────────────────┤
│ 1       │  +25,000.00  │ VENTA    ← Ingreso│
│ 2       │   -3,500.00  │ GASTO    ← Egreso │
│ 3       │   -1,200.00  │ GASTO    ← Egreso │
│ 4       │  +15,000.00  │ VENTA    ← Ingreso│
└─────────┴──────────────┴────────────────────┘
              ↑                ↑
           SIGNO          TIPO DE MOVIMIENTO
```

**Convención:**
- **Ingresos** (VENTA) = **Positivos** (+)
- **Egresos** (GASTO) = **Negativos** (-)

---

## 🧮 Matemática de la Fórmula

### Caso Real
```
Margen Bruto:  $13,000.00  (positivo)
Gastos:        -$3,500.00  (negativo en BD)
```

### ❌ FÓRMULA INCORRECTA (Resta)
```
Utilidad = Margen Bruto - Gastos
         = 13,000 - (-3,500)
         = 13,000 + 3,500
         = $16,500.00

Problema: 
  ❌ Los gastos se SUMARON en lugar de restarse
  ❌ Utilidad inflada artificialmente
  ❌ Resultado INCORRECTO
```

### ✅ FÓRMULA CORRECTA (Suma)
```
Utilidad = Margen Bruto + Gastos
         = 13,000 + (-3,500)
         = 13,000 - 3,500
         = $9,500.00

Resultado:
  ✓ Los gastos se RESTARON correctamente
  ✓ Utilidad real después de gastos
  ✓ Resultado CORRECTO
```

---

## 🎯 Regla de Álgebra

```
SUMAR un número negativo = RESTAR el valor absoluto

Ejemplos:
  10 + (-3) = 10 - 3 = 7 ✓
  20 + (-5) = 20 - 5 = 15 ✓
  13,000 + (-3,500) = 13,000 - 3,500 = 9,500 ✓
```

---

## 📊 Flujo Visual de Cálculo

```
PASO 1: Obtener Margen Bruto
┌──────────────────────────┐
│ Ventas:      $25,000.00  │
│ - Costo:     $12,000.00  │
│ ─────────────────────────│
│ = Margen:    $13,000.00  │ ← Positivo ✓
└──────────────────────────┘

PASO 2: Obtener Gastos de la BD
┌──────────────────────────┐
│ Query:                   │
│ SELECT SUM(totaldeventa) │
│ WHERE referencia='GASTO' │
│ ─────────────────────────│
│ Resultado: -$3,500.00    │ ← Negativo ✓
└──────────────────────────┘

PASO 3: Sumar (algebraicamente se resta)
┌──────────────────────────┐
│ Margen Bruto: $13,000.00 │
│ + Gastos:     -$3,500.00 │
│ ─────────────────────────│
│ = Utilidad:   $9,500.00  │ ← Correcto ✓
└──────────────────────────┘
```

---

## 🔄 Comparación Lado a Lado

```
┌─────────────────────────┬─────────────────────────┐
│   FÓRMULA INCORRECTA    │   FÓRMULA CORRECTA      │
│         (Resta)         │        (Suma)           │
├─────────────────────────┼─────────────────────────┤
│ utilidadOperativa =     │ utilidadOperativa =     │
│   margenBruto - gastos  │   margenBruto + gastos  │
│                         │                         │
│ = 13,000 - (-3,500)     │ = 13,000 + (-3,500)     │
│ = 13,000 + 3,500        │ = 13,000 - 3,500        │
│ = $16,500 ❌            │ = $9,500 ✅             │
│                         │                         │
│ Problema:               │ Correcto:               │
│ - Gastos sumados        │ - Gastos restados       │
│ - Utilidad inflada      │ - Utilidad real         │
└─────────────────────────┴─────────────────────────┘
```

---

## 📈 Casos de Ejemplo

### Ejemplo 1: Negocio Rentable
```
Margen Bruto:  $10,000.00
Gastos:        -$2,000.00

Utilidad = 10,000 + (-2,000)
         = 10,000 - 2,000
         = $8,000.00 ✓ (positivo → azul)
```

### Ejemplo 2: Pérdida Operativa
```
Margen Bruto:  $5,000.00
Gastos:        -$8,000.00

Utilidad = 5,000 + (-8,000)
         = 5,000 - 8,000
         = -$3,000.00 ✓ (negativo → rojo)
```

### Ejemplo 3: Punto de Equilibrio
```
Margen Bruto:  $7,000.00
Gastos:        -$7,000.00

Utilidad = 7,000 + (-7,000)
         = 7,000 - 7,000
         = $0.00 ✓ (cero → azul)
```

### Ejemplo 4: Sin Gastos
```
Margen Bruto:  $10,000.00
Gastos:        $0.00

Utilidad = 10,000 + 0
         = $10,000.00 ✓ (igual al margen)
```

---

## 🎓 Lección Aprendida

### Regla General para Fórmulas con Signos
```
SI los valores en BD tienen signo contable (+ ingresos, - egresos):
  ✓ Usar SUMA para combinar
  ✓ La álgebra maneja los signos automáticamente

SI los valores en BD son absolutos (todos positivos):
  ✓ Usar RESTA para egresos
  ✓ Aplicar lógica manualmente
```

### En Nuestro Caso
```
Gastos en BD: NEGATIVOS (-3,500)
Fórmula: SUMA (margenBruto + gastos)
Resultado: Correcto ✓
```

---

## 🔍 Cómo Verificar

### Paso 1: Verificar Signo de Gastos en BD
```sql
SELECT 
  totaldeventa,
  referencia
FROM tblposcrumenwebventas
WHERE referencia = 'GASTO'
LIMIT 5;
```

**Si ves valores NEGATIVOS:**
```
┌──────────────┬────────────┐
│ totaldeventa │ referencia │
├──────────────┼────────────┤
│ -1500.00     │ GASTO      │ ← NEGATIVO ✓
│ -2000.00     │ GASTO      │ ← NEGATIVO ✓
└──────────────┴────────────┘

✓ Usar SUMA: margenBruto + gastos
```

**Si ves valores POSITIVOS:**
```
┌──────────────┬────────────┐
│ totaldeventa │ referencia │
├──────────────┼────────────┤
│ 1500.00      │ GASTO      │ ← POSITIVO
│ 2000.00      │ GASTO      │ ← POSITIVO
└──────────────┴────────────┘

✗ Usar RESTA: margenBruto - gastos
```

### Paso 2: Verificar Cálculo Manual
```
Obtener del endpoint:
  margenBruto: X
  gastos: Y
  utilidadOperativa: Z

Verificar:
  X + Y = Z  ✓
  
Ejemplo:
  13,000 + (-3,500) = 9,500 ✓
```

---

## 💡 Diagrama de Decisión

```
┌─────────────────────────────────────────┐
│ ¿Cómo están los GASTOS en la BD?        │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌───────────────┐  ┌──────────────┐
│ NEGATIVOS     │  │ POSITIVOS    │
│ (ej: -3500)   │  │ (ej: +3500)  │
└───────┬───────┘  └──────┬───────┘
        │                 │
        ▼                 ▼
┌───────────────┐  ┌──────────────┐
│ USAR SUMA     │  │ USAR RESTA   │
│ MB + Gastos   │  │ MB - Gastos  │
└───────────────┘  └──────────────┘
```

---

## ✅ Estado Actual

```
✓ Gastos almacenados como NEGATIVOS
✓ Fórmula usa SUMA
✓ Álgebra funciona correctamente
✓ Utilidad Operativa = Margen Bruto + Gastos
✓ Resultado: CORRECTO
```

---

**Guía Visual creada:** 18 de Febrero de 2026  
**Autor:** GitHub Copilot  
**Propósito:** Explicar cambio de fórmula con claridad visual
