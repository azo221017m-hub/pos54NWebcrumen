# Instrucciones de Migración de Base de Datos - estatusdepago

## ⚠️ ACCIÓN REQUERIDA: Migración de Base de Datos

### Problema
El sistema está presentando el siguiente error al procesar pagos mixtos:

```
Error: Data truncated for column 'estatusdepago' at row 1
code: 'WARN_DATA_TRUNCATED'
errno: 1265
```

### Causa
La columna `estatusdepago` en la tabla `tblposcrumenwebventas` no incluye el valor `'PARCIAL'` en su definición ENUM. El código de la aplicación intenta guardar este valor cuando un pago mixto está parcialmente pagado, pero la base de datos lo rechaza.

### Solución

#### Paso 1: Validar el Estado Actual
Ejecutar el siguiente script para verificar si la migración es necesaria:

```bash
mysql -u [usuario] -p [nombre_base_datos] < backend/src/scripts/validate_estatusdepago_schema.sql
```

O directamente en MySQL:

```sql
SELECT COLUMN_NAME, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'tblposcrumenwebventas' 
  AND COLUMN_NAME = 'estatusdepago';
```

**Resultado Esperado (CORRECTO):**
```
COLUMN_TYPE: enum('PENDIENTE','PAGADO','PARCIAL','ESPERAR')
```

**Resultado que Necesita Corrección:**
```
COLUMN_TYPE: enum('PENDIENTE','PAGADO','ESPERAR')
```
^ Falta 'PARCIAL'

#### Paso 2: Aplicar la Migración (Si es Necesario)

**IMPORTANTE:** Esta migración debe ejecutarse en la base de datos de producción.

```bash
mysql -u [usuario] -p [nombre_base_datos] < backend/src/scripts/fix_estatusdepago_enum.sql
```

O directamente en MySQL:

```sql
ALTER TABLE tblposcrumenwebventas 
MODIFY COLUMN estatusdepago ENUM('PENDIENTE', 'PAGADO', 'PARCIAL', 'ESPERAR') 
NOT NULL DEFAULT 'PENDIENTE';
```

#### Paso 3: Verificar la Migración

Ejecutar nuevamente el script de validación para confirmar que el cambio se aplicó correctamente:

```bash
mysql -u [usuario] -p [nombre_base_datos] < backend/src/scripts/validate_estatusdepago_schema.sql
```

Debe mostrar: `validation_status: OK: Column includes PARCIAL value`

### Impacto de la Migración

- ✅ **Sin Tiempo de Inactividad:** La migración ALTER TABLE es rápida y no requiere downtime
- ✅ **Retrocompatible:** Los valores existentes ('PENDIENTE', 'PAGADO', 'ESPERAR') siguen siendo válidos
- ✅ **Sin Pérdida de Datos:** Solo se agrega un nuevo valor permitido al ENUM
- ⚠️ **Advertencia:** NO revierta esta migración si ya existen registros con `estatusdepago = 'PARCIAL'`

### Rollback (Solo si NO hay datos con PARCIAL)

Si necesita revertir la migración y está seguro de que no hay registros con `estatusdepago = 'PARCIAL'`:

```sql
ALTER TABLE tblposcrumenwebventas 
MODIFY COLUMN estatusdepago ENUM('PENDIENTE', 'PAGADO', 'ESPERAR') 
NOT NULL DEFAULT 'PENDIENTE';
```

### Preguntas Frecuentes

**P: ¿Por qué el error menciona "Data truncated"?**  
R: MySQL intenta insertar el valor 'PARCIAL' en un ENUM que solo acepta 'PENDIENTE', 'PAGADO', 'ESPERAR'. Como el valor no está en la lista, MySQL genera este error.

**P: ¿Puedo aplicar esta migración en cualquier momento?**  
R: Sí, es seguro aplicarla en cualquier momento. Es una operación rápida que solo extiende los valores permitidos.

**P: ¿Qué pasa con los registros existentes?**  
R: No se modifican. Solo se permite un nuevo valor para futuros registros.

**P: ¿Debo reiniciar el servidor después de la migración?**  
R: No es necesario. El cambio es inmediato en la base de datos.

### Contacto

Si tiene problemas aplicando esta migración, contacte al equipo de desarrollo con los siguientes detalles:
- Resultado del script de validación
- Mensaje de error completo (si aplica)
- Versión de MySQL/MariaDB
