# Corrección: Error de Truncamiento de Datos en Pago Mixto y Lógica de tiempototaldeventa

## Resumen del Problema
Al procesar pagos mixtos (pago MIXTO), el sistema encontraba dos errores críticos:

1. **Error de Truncamiento de Datos**: 
   ```
   Error: Data truncated for column 'estatusdepago' at row 1
   code: 'WARN_DATA_TRUNCATED'
   errno: 1265
   ```

2. **Lógica Incorrecta de tiempototaldeventa**: 
   El requerimiento establece que para pagos MIXTO, `tiempototaldeventa` debe establecerse con la fecha y hora del **primer pago registrado**, pero el código lo establecía con NOW() cuando la venta se marcaba como COBRADO.

## Análisis de Causa Raíz

### Problema 1: Truncamiento de Datos en estatusdepago
La columna de base de datos `estatusdepago` está definida como ENUM con valores: `'PENDIENTE', 'PAGADO', 'ESPERAR'`, pero el código de la aplicación intenta establecerlo como `'PARCIAL'` cuando un pago mixto está parcialmente completado. Este valor no estaba incluido en la definición ENUM, causando el error SQL.

### Problema 2: Marca de Tiempo de tiempototaldeventa
El código original actualizaba el registro de venta ANTES de insertar los detalles del pago, y usaba `NOW()` para `tiempototaldeventa`. Esto creaba una discrepancia de tiempo entre la marca de tiempo real del pago y la marca de tiempo de completación de venta.

## Solución

### Parte 1: Actualización del Esquema de Base de Datos
Script de migración SQL creado: `backend/src/scripts/fix_estatusdepago_enum.sql`

```sql
ALTER TABLE tblposcrumenwebventas 
MODIFY COLUMN estatusdepago ENUM('PENDIENTE', 'PAGADO', 'PARCIAL', 'ESPERAR') 
NOT NULL DEFAULT 'PENDIENTE';
```

Esto agrega el valor `'PARCIAL'` al ENUM, permitiendo que la aplicación rastree correctamente el estado de pago parcial.

### Parte 2: Refactorización del Código
Modificado `backend/src/controllers/pagos.controller.ts` en la función `procesarPagoMixto`:

**Cambios Clave:**
1. **Operaciones Reordenadas**: Los detalles de pago ahora se insertan ANTES de actualizar el registro de venta
2. **Recuperación Precisa de Marca de Tiempo**: Después de insertar pagos, se consulta MIN(fechadepago) para obtener la marca de tiempo real del primer pago
3. **Lógica de Actualización Condicional**: Solo establece tiempototaldeventa cuando la venta se marca como COBRADO y actualmente es NULL

**Antes:**
```typescript
// Consultar pagos previos
const [pagosPrevios] = await connection.execute(`
  SELECT SUM(totaldepago) as totalPagadoPrevio, MIN(fechadepago) as primerPagoFecha
  FROM tblposcrumenwebdetallepagos 
  WHERE idfolioventa = ? AND idnegocio = ?`);

// Actualizar venta (usando primerPagoFecha potencialmente NULL con COALESCE)
await connection.execute(`UPDATE tblposcrumenwebventas 
  SET ... tiempototaldeventa = IF(? = 'COBRADO' AND tiempototaldeventa IS NULL, 
                                  COALESCE(?, NOW()), 
                                  tiempototaldeventa) ...`);

// Insertar nuevos pagos
for (const detalle of pagoData.detallesPagos) {
  await connection.execute(`INSERT INTO tblposcrumenwebdetallepagos ...`);
}
```

**Después:**
```typescript
// Consultar pagos previos (solo suma, no marca de tiempo aún)
const [pagosPrevios] = await connection.execute(`
  SELECT SUM(totaldepago) as totalPagadoPrevio
  FROM tblposcrumenwebdetallepagos 
  WHERE idfolioventa = ? AND idnegocio = ?`);

// Insertar nuevos pagos PRIMERO
for (const detalle of pagoData.detallesPagos) {
  await connection.execute(`INSERT INTO tblposcrumenwebdetallepagos ...`);
}

// AHORA consultar marca de tiempo del primer pago (incluye pagos recién insertados)
const [primeraFecha] = await connection.execute(`
  SELECT MIN(fechadepago) as primerPagoFecha
  FROM tblposcrumenwebdetallepagos 
  WHERE idfolioventa = ? AND idnegocio = ?`);

// Actualizar venta con marca de tiempo precisa
await connection.execute(`UPDATE tblposcrumenwebventas 
  SET ... tiempototaldeventa = IF(? = 'COBRADO' AND tiempototaldeventa IS NULL, 
                                  ?, 
                                  tiempototaldeventa) ...`);
```

## Impacto

### Archivos Modificados
1. `backend/src/controllers/pagos.controller.ts` - Lógica de procesamiento de pagos refactorizada
2. `backend/src/scripts/fix_estatusdepago_enum.sql` - NUEVO: Script de migración de base de datos

### Cambios en Lógica de Negocio
- **Seguimiento de Estado de Pago**: El sistema ahora puede rastrear correctamente el estado de pago `PARCIAL`
- **Precisión de Auditoría**: `tiempototaldeventa` ahora refleja precisamente la marca de tiempo del primer pago
- **Sin Cambios Incompatibles**: Funcionalidad existente preservada, solo correcciones aplicadas

## Instrucciones de Despliegue

### 1. Migración de Base de Datos (Requerido)
Antes de desplegar los cambios de código, ejecutar el script de migración:

```bash
mysql -u usuario -p nombre_base_datos < backend/src/scripts/fix_estatusdepago_enum.sql
```

**Consulta de Verificación:**
```sql
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'tblposcrumenwebventas' 
AND COLUMN_NAME = 'estatusdepago';
```

El resultado esperado debe mostrar:
```
COLUMN_TYPE: enum('PENDIENTE','PAGADO','PARCIAL','ESPERAR')
```

### 2. Despliegue de Código
Desplegar el código backend actualizado con el `pagos.controller.ts` modificado.

### 3. Verificación
Probar el endpoint de pago mixto:

```bash
POST /api/pagos/mixto
{
  "idventa": 123,
  "detallesPagos": [
    {
      "formadepagodetalle": "EFECTIVO",
      "totaldepago": 50.00
    }
  ],
  "descuento": 0
}
```

**Comportamientos Esperados:**
1. ✅ Sin errores SQL para pagos parciales
2. ✅ estatusdepago correctamente establecido como 'PARCIAL' cuando está parcialmente pagado
3. ✅ tiempototaldeventa establecido con marca de tiempo del primer pago cuando está totalmente pagado
4. ✅ Pagos subsiguientes preservan el tiempototaldeventa original

## Escenarios de Prueba

### Escenario 1: Primer Pago Parcial
- **Acción**: Enviar primer pago que no cubre el total
- **Esperado**: estatusdepago = 'PARCIAL', tiempototaldeventa = NULL

### Escenario 2: Pago Completo de Una Vez
- **Acción**: Enviar pago(s) que cubren el total en la primera transacción
- **Esperado**: estatusdepago = 'PAGADO', tiempototaldeventa = marca de tiempo del primer pago

### Escenario 3: Múltiples Pagos para Completar
- **Acción**: Enviar primer pago parcial, luego segundo pago para completar
- **Esperado**: 
  - Después del primero: estatusdepago = 'PARCIAL', tiempototaldeventa = NULL
  - Después del segundo: estatusdepago = 'PAGADO', tiempototaldeventa = marca de tiempo del PRIMER pago

### Escenario 4: Pagos Subsiguientes Después de Completar
- **Acción**: Enviar pago adicional después de que la venta ya está COBRADO
- **Esperado**: tiempototaldeventa permanece sin cambios (preserva marca de tiempo del primer pago)

## Resumen de Seguridad

### Resultados de Escaneo CodeQL
- **0 Alertas Nuevas**: No se introdujeron vulnerabilidades de seguridad con estos cambios
- **1 Alerta Pre-existente**: Problema de limitación de tasa en rutas de pagos (no abordado por estar fuera de alcance)

### Consideraciones de Seguridad
- ✅ Sin riesgos de inyección SQL (usando consultas parametrizadas)
- ✅ Integridad de transacciones mantenida (todas las operaciones dentro de transacción)
- ✅ Autenticación requerida (usa middleware AuthRequest)
- ✅ Validación de entrada presente (valida detalles y montos de pago)

## Plan de Reversión

Si surgen problemas, la reversión puede realizarse en dos pasos:

### 1. Reversión de Código
```bash
git revert <commit-hash>
```

### 2. Reversión de Base de Datos (Opcional)
Solo si necesita eliminar 'PARCIAL' del ENUM:
```sql
-- Verificar registros PARCIAL existentes primero
SELECT COUNT(*) FROM tblposcrumenwebventas WHERE estatusdepago = 'PARCIAL';

-- Si el conteo es 0, es seguro revertir
ALTER TABLE tblposcrumenwebventas 
MODIFY COLUMN estatusdepago ENUM('PENDIENTE', 'PAGADO', 'ESPERAR') 
NOT NULL DEFAULT 'PENDIENTE';
```

**⚠️ Advertencia**: No revertir la base de datos si hay registros con estatusdepago = 'PARCIAL'.

## Documentación Relacionada
- Reporte de error original en declaración del problema
- Esquema de base de datos: `backend/src/scripts/add_payment_functionality.sql`
- Tipos de pago: `backend/src/types/ventasWeb.types.ts`
- Rutas de pago: `backend/src/routes/pagos.routes.ts`

---
**Fecha de Corrección**: 29 de enero de 2026  
**Estado**: ✅ Completo y Probado  
**Nivel de Riesgo**: Bajo (Cambios mínimos, migración de base de datos requerida)  
**Cambios Incompatibles**: Ninguno
