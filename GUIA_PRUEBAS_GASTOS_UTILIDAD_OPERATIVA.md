# 🧪 Guía de Pruebas: Gastos y Utilidad Operativa

**Fecha:** 17 de Febrero de 2026  
**Sistema:** POS Crumen v2.5.B12  
**Módulo:** Dashboard - Salud de mi Negocio

---

## 📋 Objetivos de las Pruebas

1. ✅ Verificar que los **Gastos** se calculen correctamente
2. ✅ Verificar que la **Utilidad Operativa** se calcule correctamente
3. ✅ Validar que la **etiqueta de mes/año** sea visible
4. ✅ Confirmar que los **colores dinámicos** funcionen
5. ✅ Asegurar que los **formatos de moneda** sean correctos

---

## 🔍 Prueba 1: Verificar Query de Gastos

### Objetivo
Confirmar que la consulta SQL de gastos retorna datos correctos.

### SQL de Prueba
```sql
-- Verificar gastos del mes actual
SELECT 
  SUM(totaldeventa) as totalGastos
FROM tblposcrumenwebventas 
WHERE idnegocio = 1  -- Reemplazar con ID real
  AND DATE(fechadeventa) BETWEEN '2026-02-01' AND '2026-02-28'
  AND referencia = 'GASTO'
  AND estadodeventa = 'COBRADO';
```

### Resultado Esperado
```
┌──────────────┐
│ totalGastos  │
├──────────────┤
│ 3500.00      │
└──────────────┘
```

### Validación
- [ ] Query se ejecuta sin errores
- [ ] Resultado es un número positivo o cero
- [ ] Solo incluye registros con `referencia='GASTO'`
- [ ] Solo incluye registros con `estadodeventa='COBRADO'`

---

## 🔍 Prueba 2: Verificar Endpoint API

### Objetivo
Confirmar que el endpoint retorna los nuevos campos.

### Curl de Prueba
```bash
curl -X GET "http://localhost:3001/api/ventas-web/dashboard/salud-negocio" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json"
```

### Respuesta Esperada
```json
{
  "success": true,
  "data": {
    "ventas": 25000.00,
    "costoVenta": 12000.00,
    "margenBruto": 13000.00,
    "porcentajeMargen": 52.00,
    "gastos": 3500.00,              // ← VERIFICAR
    "utilidadOperativa": 9500.00,   // ← VERIFICAR
    "clasificacion": "MUY BUENO",
    "colorMargen": "#4CAF50",
    "totalGastos": 3500.00,
    "periodo": {
      "inicio": "2026-02-01",
      "fin": "2026-02-28",
      "mes": "febrero de 2026"      // ← VERIFICAR
    }
  }
}
```

### Validación
- [ ] Status code: 200 OK
- [ ] Campo `gastos` presente en respuesta
- [ ] Campo `utilidadOperativa` presente en respuesta
- [ ] Campo `periodo.mes` presente en respuesta
- [ ] Valores son números válidos
- [ ] `utilidadOperativa = margenBruto - gastos`

### Cálculo Manual
```
Verificar:
  margenBruto - gastos = utilidadOperativa
  13000.00 - 3500.00 = 9500.00 ✓
```

---

## 🔍 Prueba 3: Verificar UI del Dashboard

### Objetivo
Confirmar que las nuevas tarjetas se muestren correctamente.

### Pasos
1. Abrir navegador en `http://localhost:5173` (o URL de producción)
2. Iniciar sesión con credenciales válidas
3. Navegar al Dashboard
4. Localizar card "Salud de mi Negocio"

### Checklist Visual
- [ ] **Etiqueta de fecha visible** en esquina superior derecha
  - Formato: "Febrero de 2026" o similar
  - Color: Gris (#6b7280)
  - Tamaño: Pequeño (0.7rem)

- [ ] **Tarjeta de Gastos visible** (posición fila 3, columna 1)
  - Label: "Gastos"
  - Valor: "$3,500.00" (con comas y decimales)
  - Fondo: Amarillo claro (#fef3c7)
  - Color de texto: Ámbar (#f59e0b)

- [ ] **Tarjeta de Utilidad Operativa visible** (posición fila 3, columna 2)
  - Label: "Utilidad Operativa"
  - Valor: "$9,500.00" (con comas y decimales)
  - Fondo: Azul claro (#dbeafe)
  - Color de texto: Azul (#0ea5e9) si positivo, Rojo (#dc2626) si negativo

- [ ] **Grid 3x2 completo**
  - Fila 1: Ventas, Costo de Venta
  - Fila 2: Margen Bruto, % Margen
  - Fila 3: Gastos, Utilidad Operativa

---

## 🔍 Prueba 4: Caso de Utilidad Positiva

### Objetivo
Verificar que la utilidad operativa positiva muestre color azul.

### Datos de Prueba
```sql
-- Insertar venta de $25,000
INSERT INTO tblposcrumenwebventas 
(idnegocio, totaldeventa, descripcionmov, estadodeventa, fechadeventa)
VALUES (1, 25000, 'VENTA', 'COBRADO', NOW());

-- Insertar gasto de $3,500
INSERT INTO tblposcrumenwebventas 
(idnegocio, totaldeventa, referencia, estadodeventa, fechadeventa)
VALUES (1, 3500, 'GASTO', 'COBRADO', NOW());

-- Insertar costo de venta (cantidad negativa)
INSERT INTO tblposcrumenwebdetallemovimientos
(cantidad, costo, tipomovimiento, motivomovimiento, estatusmovimiento, fechamovimiento, idnegocio)
VALUES (-120, 100, 'SALIDA', 'VENTA', 'PROCESADO', NOW(), 1);
-- Costo total: 120 * 100 = $12,000
```

### Resultado Esperado
```
Ventas:             $25,000.00
Costo de Venta:     $12,000.00
Margen Bruto:       $13,000.00
Gastos:             $3,500.00
Utilidad Operativa: $9,500.00  ← Color: AZUL ✓
```

### Validación Visual
- [ ] Utilidad Operativa muestra color azul (#0ea5e9)
- [ ] Valor es positivo: $9,500.00
- [ ] No hay signo negativo

---

## 🔍 Prueba 5: Caso de Utilidad Negativa

### Objetivo
Verificar que la utilidad operativa negativa muestre color rojo.

### Datos de Prueba
```sql
-- Misma venta de $25,000
-- Mismo costo de venta de $12,000
-- Gastos altos de $15,000

INSERT INTO tblposcrumenwebventas 
(idnegocio, totaldeventa, referencia, estadodeventa, fechadeventa)
VALUES (1, 15000, 'GASTO', 'COBRADO', NOW());
```

### Resultado Esperado
```
Ventas:             $25,000.00
Costo de Venta:     $12,000.00
Margen Bruto:       $13,000.00
Gastos:             $15,000.00
Utilidad Operativa: -$2,000.00  ← Color: ROJO ✗
```

### Validación Visual
- [ ] Utilidad Operativa muestra color rojo (#dc2626)
- [ ] Valor es negativo: $-2,000.00
- [ ] Signo negativo presente antes del símbolo $

---

## 🔍 Prueba 6: Caso de Utilidad Cero

### Objetivo
Verificar comportamiento cuando gastos = margen bruto.

### Datos de Prueba
```sql
-- Venta: $25,000
-- Costo: $12,000
-- Margen: $13,000
-- Gastos: $13,000 (igual al margen)

INSERT INTO tblposcrumenwebventas 
(idnegocio, totaldeventa, referencia, estadodeventa, fechadeventa)
VALUES (1, 13000, 'GASTO', 'COBRADO', NOW());
```

### Resultado Esperado
```
Ventas:             $25,000.00
Costo de Venta:     $12,000.00
Margen Bruto:       $13,000.00
Gastos:             $13,000.00
Utilidad Operativa: $0.00  ← Color: AZUL (>= 0)
```

### Validación Visual
- [ ] Utilidad Operativa muestra color azul (#0ea5e9)
- [ ] Valor es exactamente: $0.00
- [ ] No hay signo negativo

---

## 🔍 Prueba 7: Caso Sin Gastos

### Objetivo
Verificar comportamiento cuando no hay gastos registrados.

### Datos de Prueba
```sql
-- Eliminar todos los gastos del mes actual
DELETE FROM tblposcrumenwebventas 
WHERE referencia = 'GASTO' 
  AND DATE(fechadeventa) BETWEEN '2026-02-01' AND '2026-02-28';
```

### Resultado Esperado
```
Ventas:             $25,000.00
Costo de Venta:     $12,000.00
Margen Bruto:       $13,000.00
Gastos:             $0.00  ← Sin gastos
Utilidad Operativa: $13,000.00  ← Igual al margen bruto
```

### Validación
- [ ] Gastos muestra $0.00
- [ ] Utilidad Operativa = Margen Bruto
- [ ] No hay error en el cálculo
- [ ] Color de utilidad es azul

---

## 🔍 Prueba 8: Formato de Moneda

### Objetivo
Verificar que todos los valores monetarios tengan formato correcto.

### Checklist de Formato
```
Formato esperado: $X,XXX.XX

Ejemplos:
  25000    → $25,000.00  ✓
  3500.5   → $3,500.50   ✓
  9500     → $9,500.00   ✓
  0        → $0.00       ✓
  -2500    → $-2,500.00  ✓
  1234.567 → $1,234.57   ✓ (redondeado)
```

### Validación Visual
- [ ] Todos los valores tienen símbolo `$`
- [ ] Separador de miles: coma `,`
- [ ] Siempre 2 decimales: `.XX`
- [ ] Valores negativos muestran `-` antes del `$`

---

## 🔍 Prueba 9: Persistencia del Mes/Año

### Objetivo
Verificar que la etiqueta del mes/año se actualice dinámicamente.

### Pasos
1. Abrir Dashboard en febrero de 2026
2. Verificar que muestre "febrero de 2026"
3. Cambiar fecha del sistema a marzo de 2026
4. Recargar Dashboard
5. Verificar que muestre "marzo de 2026"

### Validación
- [ ] Mes se actualiza según fecha actual
- [ ] Año se actualiza según fecha actual
- [ ] Formato en español (meses en minúsculas)
- [ ] Ubicación: esquina superior derecha del card

---

## 🔍 Prueba 10: Clasificación de Margen

### Objetivo
Verificar que la clasificación de margen no se vea afectada por gastos.

### Nota Importante
La **clasificación de margen** (CRÍTICO, BAJO, SALUDABLE, MUY BUENO, REVISAR COSTEO) se basa en el **% Margen**, **no** en la Utilidad Operativa.

### Casos de Prueba

#### Caso A: Margen Alto + Utilidad Baja
```
Ventas:             $25,000.00
Costo de Venta:     $12,000.00
Margen Bruto:       $13,000.00
% Margen:           52% ← MUY BUENO

Gastos:             $12,000.00 (altos)
Utilidad Operativa: $1,000.00 (baja)
```

**Validación:**
- [ ] Clasificación: "MUY BUENO" (basada en 52% de margen)
- [ ] Barra de progreso: verde (52%)
- [ ] Utilidad Operativa: azul (positiva)
- [ ] **Conclusión:** Margen bueno, pero gastos muy altos

#### Caso B: Margen Bajo + Utilidad Alta
```
Ventas:             $25,000.00
Costo de Venta:     $20,000.00
Margen Bruto:       $5,000.00
% Margen:           20% ← CRÍTICO

Gastos:             $500.00 (bajos)
Utilidad Operativa: $4,500.00 (alta)
```

**Validación:**
- [ ] Clasificación: "CRÍTICO" (basada en 20% de margen)
- [ ] Barra de progreso: roja (20%)
- [ ] Utilidad Operativa: azul (positiva)
- [ ] **Conclusión:** Margen crítico, pero gastos muy bajos

---

## 🔍 Prueba 11: Responsive Design

### Objetivo
Verificar que el grid se adapte a diferentes tamaños de pantalla.

### Dispositivos de Prueba
- [ ] **Desktop (1920x1080):** Grid 2x3 (2 columnas, 3 filas)
- [ ] **Tablet (768x1024):** Grid 2x3 (2 columnas, 3 filas)
- [ ] **Mobile (375x667):** Grid 1x6 (1 columna, 6 filas)

### Validación Visual
- [ ] Tarjetas se reorganizan correctamente
- [ ] Texto legible en todos los tamaños
- [ ] Sin overflow horizontal
- [ ] Espaciado consistente

---

## 🔍 Prueba 12: Manejo de Errores

### Objetivo
Verificar que el sistema maneje errores gracefully.

### Caso 1: API Error 500
```bash
# Simular error deteniendo el backend
npm stop
```

**Validación:**
- [ ] Frontend no crashea
- [ ] Muestra valores en $0.00
- [ ] No muestra clasificación de margen
- [ ] Console log muestra error

### Caso 2: Token Expirado
```bash
# Usar token inválido o expirado
curl -X GET "http://localhost:3001/api/ventas-web/dashboard/salud-negocio" \
  -H "Authorization: Bearer INVALID_TOKEN"
```

**Validación:**
- [ ] Status code: 401 Unauthorized
- [ ] Usuario redirigido a login
- [ ] Mensaje de error apropiado

### Caso 3: Base de Datos Desconectada
```bash
# Detener MySQL
systemctl stop mysql  # Linux
net stop MySQL80       # Windows
```

**Validación:**
- [ ] Backend retorna error 500
- [ ] Frontend muestra estado de error
- [ ] No hay crash de la aplicación

---

## 📊 Matriz de Casos de Prueba

| # | Caso | Ventas | Costo | Gastos | Margen % | Utilidad | Color | Estado |
|---|------|--------|-------|--------|----------|----------|-------|--------|
| 1 | Normal | $25k | $12k | $3.5k | 52% | $9.5k | Azul | ✅ |
| 2 | Sin gastos | $25k | $12k | $0 | 52% | $13k | Azul | ⏳ |
| 3 | Gastos altos | $25k | $12k | $15k | 52% | -$2k | Rojo | ⏳ |
| 4 | Punto equilibrio | $25k | $12k | $13k | 52% | $0 | Azul | ⏳ |
| 5 | Margen bajo | $25k | $20k | $500 | 20% | $4.5k | Azul | ⏳ |
| 6 | Crítico total | $10k | $9k | $2k | 10% | -$1k | Rojo | ⏳ |

**Leyenda:**
- ✅ Aprobado
- ⏳ Pendiente de prueba
- ❌ Fallido

---

## 🚀 Comandos de Prueba Rápida

### Backend
```bash
# Compilar backend
cd backend
npm run build

# Ejecutar tests (si existen)
npm test

# Verificar endpoint manualmente
curl -X GET "http://localhost:3001/api/ventas-web/dashboard/salud-negocio" \
  -H "Authorization: Bearer <TOKEN>"
```

### Frontend
```bash
# Iniciar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Preview de producción
npm run preview
```

### Base de Datos
```sql
-- Verificar datos de gastos
SELECT 
  COUNT(*) as total_gastos,
  SUM(totaldeventa) as suma_gastos
FROM tblposcrumenwebventas
WHERE referencia = 'GASTO'
  AND estadodeventa = 'COBRADO'
  AND DATE(fechadeventa) BETWEEN '2026-02-01' AND '2026-02-28';

-- Verificar costos de venta
SELECT 
  COUNT(*) as total_movimientos,
  SUM(cantidad * costo * -1) as suma_costos
FROM tblposcrumenwebdetallemovimientos
WHERE tipomovimiento = 'SALIDA'
  AND motivomovimiento IN ('VENTA', 'CONSUMO')
  AND estatusmovimiento = 'PROCESADO'
  AND DATE(fechamovimiento) BETWEEN '2026-02-01' AND '2026-02-28';
```

---

## ✅ Checklist Final de Pruebas

### Funcionalidad
- [ ] Gastos se calculan correctamente desde DB
- [ ] Utilidad Operativa = Margen Bruto - Gastos
- [ ] Etiqueta de mes/año visible en UI
- [ ] Colores dinámicos funcionan (azul/rojo)
- [ ] Formato de moneda correcto ($X,XXX.XX)

### Performance
- [ ] Endpoint responde en < 500ms
- [ ] Sin lag en renderizado del Dashboard
- [ ] Queries SQL optimizadas

### UX/UI
- [ ] Grid 3x2 se muestra correctamente
- [ ] Tarjetas alineadas y espaciadas
- [ ] Texto legible en todos los tamaños
- [ ] Colores accesibles (contraste suficiente)

### Seguridad
- [ ] Autenticación JWT requerida
- [ ] Filtrado por idnegocio funciona
- [ ] No hay SQL injection vulnerabilities
- [ ] Prepared statements usados

### Documentación
- [ ] README actualizado
- [ ] Documentación técnica completa
- [ ] Guía de pruebas clara
- [ ] Ejemplos de uso incluidos

---

## 📝 Reporte de Pruebas

### Formato de Reporte
```
┌─────────────────────────────────────────────────────┐
│           REPORTE DE PRUEBAS                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Fecha: __/__/____                                  │
│  Tester: _______________                            │
│  Versión: v2.5.B12                                  │
│                                                     │
│  Pruebas Ejecutadas: ___                            │
│  Pruebas Aprobadas:  ___                            │
│  Pruebas Fallidas:   ___                            │
│                                                     │
│  Bugs Encontrados:                                  │
│  1. _______________________________                 │
│  2. _______________________________                 │
│  3. _______________________________                 │
│                                                     │
│  Recomendaciones:                                   │
│  - _______________________________                  │
│  - _______________________________                  │
│                                                     │
│  Estado Final: [ ] APROBADO  [ ] RECHAZADO         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

**Guía de Pruebas creada:** 17 de Febrero de 2026  
**Autor:** GitHub Copilot  
**Versión del Sistema:** v2.5.B12
