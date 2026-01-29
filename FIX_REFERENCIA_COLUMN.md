# Fix: Error al procesar pago mixto - Unknown column 'referencia' in 'field list'

## Problema
Al procesar un pago mixto, se genera el siguiente error:

```
Error al procesar pago mixto: Error: Unknown column 'referencia' in 'field list'
    at PromisePoolConnection.execute
    at procesarPagoMixto (/opt/render/project/src/backend/dist/controllers/pagos.controller.js:212:30)
```

## Causa
La tabla `tblposcrumenwebdetallepagos` en la base de datos no tiene la columna `referencia` que el código intenta usar al insertar registros de pago.

## Solución
Se ha creado un script de migración para agregar la columna faltante a la tabla.

### Archivos creados
1. **backend/src/scripts/fix_referencia_column.sql** - Script SQL para agregar la columna
2. **backend/src/scripts/applyReferenciaMigration.ts** - Script TypeScript para aplicar la migración

### Cómo aplicar la migración

#### Opción 1: Usando el script TypeScript (Recomendado)

```bash
cd backend
npm run db:fix-referencia
```

Este script:
- Verifica si la columna `referencia` ya existe
- Si no existe, la agrega a la tabla
- Valida que la migración se aplicó correctamente

#### Option 2: Ejecutar el SQL directamente

Conectarse a la base de datos MySQL y ejecutar:

```sql
-- First verify the column doesn't exist
DESCRIBE tblposcrumenwebdetallepagos;

-- Then add the column (only if it doesn't exist)
ALTER TABLE tblposcrumenwebdetallepagos 
ADD COLUMN referencia VARCHAR(255) NULL 
AFTER formadepagodetalle;
```

### Estructura de la columna
- **Nombre**: `referencia`
- **Tipo**: `VARCHAR(255)`
- **Permite NULL**: Sí
- **Posición**: Después de `formadepagodetalle`

### Uso de la columna
La columna `referencia` se utiliza para almacenar el número de referencia cuando la forma de pago es `TRANSFERENCIA`. Es opcional para pagos en `EFECTIVO` o `TARJETA`.

### Validación
Después de aplicar la migración, verificar que la tabla tiene la estructura correcta:

```sql
DESCRIBE tblposcrumenwebdetallepagos;
```

Debería mostrar:
```
+---------------------------+-----------------------------------------+------+-----+-------------------+
| Field                     | Type                                    | Null | Key | Default           |
+---------------------------+-----------------------------------------+------+-----+-------------------+
| iddetallepagos            | int                                     | NO   | PRI | NULL              |
| idfolioventa              | varchar(100)                            | NO   | MUL | NULL              |
| fechadepago               | datetime                                | NO   |     | CURRENT_TIMESTAMP |
| totaldepago               | decimal(10,2)                           | NO   |     | 0.00              |
| formadepagodetalle        | enum('EFECTIVO','TARJETA','TRANSFERENCIA') | NO  |     | NULL              |
| referencia                | varchar(255)                            | YES  |     | NULL              |
| claveturno                | varchar(50)                             | YES  |     | NULL              |
| idnegocio                 | int                                     | NO   |     | NULL              |
| usuarioauditoria          | varchar(100)                            | NO   |     | NULL              |
| fechamodificacionauditoria| datetime                                | NO   |     | CURRENT_TIMESTAMP |
+---------------------------+-----------------------------------------+------+-----+-------------------+
```

## Implementación en producción

### Para Azure MySQL en Render
1. Conectarse a la base de datos de producción
2. Ejecutar el script de migración
3. Verificar que no hay errores
4. Probar un pago mixto para confirmar que el error se resolvió

### Comando para ejecutar en producción
```bash
# Desde el servidor de Render o con acceso a la base de datos de producción
cd backend
npm run db:fix-referencia
```

## Notas
- Esta migración es **segura** ya que solo agrega una columna que permite valores NULL
- No afecta datos existentes
- Es compatible con versiones anteriores del código
- La columna ya está contemplada en el esquema original (`create_detallepagos_table.sql`)
