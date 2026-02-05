# Solución al Error de Conexión MySQL (ECONNREFUSED)

## Fecha: 5 de Febrero de 2026

---

## Problema Original

El servidor mostraba el siguiente error al iniciar en producción:

```
✅ Variables de entorno cargadas desde: /etc/secrets/.env
✅ Variables de entorno validadas correctamente
❌ Error al conectar a MySQL: AggregateError [ECONNREFUSED]: 
    at internalConnectMultiple (node:net:1139:18)
    at afterConnectMultiple (node:net:1714:7) {
  code: 'ECONNREFUSED',
  fatal: true,
  [errors]: [
    Error: connect ECONNREFUSED ::1:3306
    Error: connect ECONNREFUSED 127.0.0.1:3306
  ]
}
❌ No se pudo conectar a la base de datos
```

### Causa del Problema

El error `ECONNREFUSED` ocurre cuando la aplicación intenta conectarse a MySQL en `localhost` (127.0.0.1 o ::1), pero:

1. MySQL no está corriendo en ese host
2. En producción, la base de datos está en un servidor remoto (Azure MySQL, Railway, Render, etc.)
3. La variable de entorno `DB_HOST` está configurada incorrectamente como `localhost`

---

## Solución Implementada

### 1. **Diagnóstico Mejorado** 📊

Se mejoró la función `testConnection()` en `/backend/src/config/db.ts` para mostrar información detallada:

```typescript
🔄 Intento de conexión a MySQL (1/3)...
   📍 Host: localhost:3306
   👤 Usuario: root
   🗄️  Base de datos: pos_crumen
❌ Intento 1 fallido: connect ECONNREFUSED 127.0.0.1:3306
```

### 2. **Lógica de Reintentos** 🔄

Se agregó retry logic con 3 intentos y 2 segundos de delay entre cada intento:

```typescript
export const testConnection = async (maxRetries = 3, retryDelay = 2000)
```

### 3. **Mensajes de Error Contextuales** 💡

Se agregaron mensajes específicos según el tipo de error:

#### Para `ECONNREFUSED`:
```
💡 POSIBLES CAUSAS:
   1. MySQL no está corriendo en el host especificado
   2. El firewall está bloqueando la conexión
   3. El host o puerto son incorrectos
   4. En producción: verifica las variables de entorno en /etc/secrets/.env
```

#### Para `ER_ACCESS_DENIED_ERROR`:
```
💡 POSIBLES CAUSAS:
   1. Usuario o contraseña incorrectos
   2. El usuario no tiene permisos para acceder a la base de datos
```

#### Para `ENOTFOUND`:
```
💡 POSIBLES CAUSAS:
   1. El nombre del host es incorrecto o no existe
   2. Problemas de DNS o de red
```

### 4. **Validación de Localhost en Producción** ⚠️

Se agregó validación en `/backend/src/app.ts` para advertir si se usa localhost en producción:

```typescript
if (process.env.NODE_ENV === 'production') {
  const dbHost = requiredEnvVars.DB_HOST || '';
  if (dbHost === 'localhost' || dbHost === '127.0.0.1' || dbHost === '::1') {
    console.error('\n⚠️  ADVERTENCIA CRÍTICA: DB_HOST configurado como localhost en PRODUCCIÓN');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('Esto causará errores de conexión a la base de datos.');
    console.error('En producción, DB_HOST debe apuntar al servidor MySQL real.');
    console.error('');
    console.error('Ejemplos de configuración correcta:');
    console.error('  DB_HOST=crumenprod01.mysql.database.azure.com  (Azure MySQL)');
    console.error('  DB_HOST=mysql.railway.app                      (Railway)');
    console.error('  DB_HOST=dpg-xxxxx-a.render.com                 (Render MySQL)');
    console.error('═══════════════════════════════════════════════════════════');
  }
}
```

### 5. **Documentación Mejorada** 📖

Se actualizó `/backend/.env.example` con ejemplos claros:

```env
# Configuración de base de datos MySQL
# IMPORTANTE: En producción, DB_HOST debe ser el servidor MySQL real, NO localhost
# Ejemplos:
#   - Azure MySQL: crumenprod01.mysql.database.azure.com
#   - Railway: mysql.railway.app
#   - Render MySQL: dpg-xxxxx-a.render.com
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=pos_crumen
```

---

## Cómo Resolver el Error

### Paso 1: Verificar la Configuración

Revisa el archivo `/etc/secrets/.env` en producción y asegúrate de que `DB_HOST` apunte al servidor MySQL correcto:

**❌ Incorrecto (causa el error):**
```env
DB_HOST=localhost
```

**✅ Correcto (ejemplo Azure MySQL):**
```env
DB_HOST=crumenprod01.mysql.database.azure.com
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password_seguro
DB_NAME=bdcdttx
```

### Paso 2: Reiniciar el Servidor

Después de actualizar las variables de entorno, reinicia el servidor para que tome los nuevos valores.

### Paso 3: Verificar los Logs

Con las mejoras implementadas, ahora verás mensajes detallados:

```
✅ Variables de entorno cargadas desde: /etc/secrets/.env
✅ Variables de entorno validadas correctamente
🔄 Intento de conexión a MySQL (1/3)...
   📍 Host: crumenprod01.mysql.database.azure.com:3306
   👤 Usuario: adminuser
   🗄️  Base de datos: bdcdttx
✅ Conexión exitosa a MySQL
🚀 Servidor corriendo en http://localhost:3000
```

---

## Archivos Modificados

### `/backend/src/config/db.ts`
- ✅ Agregada función `testConnection()` con retry logic
- ✅ Agregados mensajes de diagnóstico detallados
- ✅ Agregados mensajes de error contextuales
- ✅ Mejorada seguridad de tipos (Error | unknown)

### `/backend/src/app.ts`
- ✅ Agregada validación de localhost en producción
- ✅ Agregados mensajes de advertencia con ejemplos

### `/backend/.env.example`
- ✅ Agregada documentación sobre configuración de producción
- ✅ Agregados ejemplos de diferentes proveedores (Azure, Railway, Render)

---

## Beneficios de los Cambios

1. **Diagnóstico Rápido** 🚀
   - Los usuarios pueden identificar inmediatamente el problema
   - Se muestran los parámetros exactos de conexión intentados

2. **Recuperación Automática** 🔄
   - 3 intentos de reconexión ayudan con problemas temporales de red
   - Útil cuando el servidor MySQL está iniciando

3. **Guía Clara** 📖
   - Mensajes específicos según el tipo de error
   - Ejemplos concretos de configuración correcta

4. **Prevención Proactiva** ⚠️
   - Detecta configuraciones incorrectas antes de intentar conectar
   - Advierte sobre localhost en producción

5. **Seguridad Mejorada** 🔒
   - Mejor manejo de tipos (Error | unknown en lugar de any)
   - Sin vulnerabilidades encontradas por CodeQL

---

## Estado del Proyecto

✅ **Problema identificado** - ECONNREFUSED al conectar a localhost  
✅ **Solución implementada** - Diagnóstico y validación mejorados  
✅ **Build exitoso** - Sin errores de compilación  
✅ **Code review aprobado** - Comentarios resueltos  
✅ **CodeQL scan aprobado** - 0 vulnerabilidades encontradas  

---

## Próximos Pasos

1. **Actualizar /etc/secrets/.env** con el host correcto de MySQL
2. **Reiniciar el servidor** para aplicar los cambios
3. **Verificar logs** para confirmar conexión exitosa

---

## Notas Técnicas

### Type Safety
```typescript
// Antes
let lastError: any = null;

// Después
let lastError: Error | unknown = null;
const errorCode = (lastError as any)?.code;
const errorMessage = lastError instanceof Error ? lastError.message : String(lastError);
```

### Retry Logic
```typescript
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    // Intentar conexión
  } catch (error) {
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}
```

---

**Actualización**: 5 de Febrero de 2026  
**Versión**: 2.5.B12  
**Status**: ✅ Resuelto
