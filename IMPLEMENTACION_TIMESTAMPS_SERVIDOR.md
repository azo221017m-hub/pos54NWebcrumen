# Implementación de Timestamps del Servidor con Zona Horaria de México

## Resumen

Este documento describe los cambios implementados para garantizar que todas las fechas y horas almacenadas en el sistema sean generadas por el servidor y utilicen la zona horaria de México (America/Mexico_City), cumpliendo con los siguientes requisitos:

1. **Fuente inmutable**: Las fechas/horas deben ser generadas por el servidor (el usuario no puede modificarlas)
2. **Zona horaria de México**: Todas las operaciones de fecha/hora deben usar la hora de México

## Cambios Implementados

### 1. Utilidad de Fecha/Hora del Servidor (`backend/src/utils/dateTime.ts`)

Se creó un nuevo módulo de utilidad que centraliza toda la generación de fechas/horas del servidor:

```typescript
// Constantes de zona horaria
export const MEXICO_TIMEZONE = 'America/Mexico_City';
export const MEXICO_TIMEZONE_OFFSET = '-06:00';  // UTC-6 (horario estándar)

// Funciones principales:
- getMexicoTime(): Date                      // Retorna Date actual del servidor
- getMexicoTimeISO(): string                 // Retorna ISO string
- formatMySQLDateTime(): string              // Formato MySQL en zona horaria México
- getMexicoTimestamp(): number               // Timestamp en milisegundos
- getMexicoTimeComponents(): object          // Componentes de tiempo en zona horaria México
```

**Implementación clave:**
- `getMexicoTimeComponents()` usa `Intl.DateTimeFormat` con zona horaria México
- Retorna componentes (año, mes, día, hora, minuto, segundo) ya formateados para México
- Estos componentes se usan para generar folios y claves de turno

**Beneficios:**
- Centraliza la lógica de zona horaria
- Usa APIs estándar de JavaScript para conversión de zona horaria
- Garantiza consistencia en todo el backend
- Facilita el mantenimiento y pruebas

### 2. Configuración de Base de Datos (`backend/src/config/db.ts`)

Se actualizó la configuración del pool de conexiones MySQL para usar el offset de zona horaria de México:

```typescript
const dbConfig = {
  // ... otras configuraciones
  timezone: MEXICO_TIMEZONE_OFFSET  // '-06:00' para México (horario estándar)
};
```

**Impacto:**
- Todas las funciones MySQL como `NOW()`, `CURRENT_TIMESTAMP` usan hora con offset de México
- Las conversiones de fecha/hora son consistentes
- Los datos almacenados reflejan la hora local del negocio
- Usa formato de offset numérico (`-06:00`) compatible con MySQL sin necesidad de tablas de zona horaria

**Nota sobre horario de verano:**
Desde octubre de 2022, México abolió el horario de verano a nivel nacional (excepto algunas regiones fronterizas). El país usa UTC-6 todo el año. El offset `-06:00` es apropiado para la mayoría de los casos de uso.

### 3. Actualización de Controladores Backend

#### ventasWeb.controller.ts
- **Antes**: `const now = new Date()`
- **Después**: `const time = getMexicoTimeComponents()`
- **Afecta**: Generación de folios de venta con timestamp HHMMSS en zona horaria de México

#### turnos.controller.ts
- **Antes**: `const now = new Date()`
- **Después**: `const time = getMexicoTimeComponents()`
- **Afecta**: 
  - Generación de `claveturno` (formato: AAMMDD+idnegocio+idusuario+HHMMSS) con hora de México
  - Generación de folios para movimientos de turno

#### loginAudit.service.ts
- **Antes**: `new Date().toISOString()` y `Date.now()`
- **Después**: `getMexicoTimeISO()` y `getMexicoTimestamp()`
- **Afecta**:
  - Metadata de intentos de login con timestamp ISO
  - Timestamps de auditoría
  - Cálculo de bloqueos de cuenta (30 minutos)
  - Generación de IDs de sesión únicos

#### helpers.ts
- **Antes**: `Date.now().toString(36)`
- **Después**: `getMexicoTimestamp().toString(36)`
- **Afecta**: Generación de códigos únicos con timestamp del servidor

### 4. Frontend (`src/pages/PageVentas/PageVentas.tsx`)

Se eliminó la creación de timestamps del lado del cliente que no se utilizaban:

- **Antes**: `fechaRegistroauditoria: new Date().toISOString()`
- **Después**: `fechaRegistroauditoria: ''`

**Nota importante**: El frontend NUNCA envía timestamps de auditoría al servidor. Todos los campos de auditoría (`fechaRegistroauditoria`, `fechamodificacionauditoria`, `fehamodificacionauditoria`, etc.) son generados por el servidor usando `NOW()` en las consultas SQL.

**Nota sobre typo**: El campo `fehamodificacionauditoria` (sin 'c' en 'fecha') es un typo existente en el esquema de base de datos que se mantiene para compatibilidad.

## Campos de Auditoría Automáticos

Todos estos campos son generados AUTOMÁTICAMENTE por el servidor:

### En Ventas (tblposcrumenwebventas)
- `fechadeventa` → `NOW()`
- `fechapreparacion` → `NOW()`
- `fechaenvio` → `NOW()`
- `fechaentrega` → `NOW()`
- `fechamodificacionauditoria` → `NOW()`

### En Detalles de Venta (tblposcrumenwebdetalleventas)
- `fechadetalleventa` → `NOW()`
- `fechamodificacionauditoria` → `NOW()`

### En Turnos (tblposcrumenwebturnos)
- `fechainicioturno` → `NOW()`
- `fechafinturno` → `NOW()` (cuando se cierra)

### En Usuarios (tblposcrumenwebusuarios)
- `fechaRegistroauditoria` → `NOW()`
- `fehamodificacionauditoria` → `NOW()` (nota: typo existente en esquema)

### En Intentos de Login (tblposcrumenwebintentoslogin)
- `fechabloqueado` → `NOW()`
- `ultimologin` → `NOW()`

## Datos que SÍ envía el Cliente

El cliente solo puede enviar datos de negocio que requieren input del usuario:

- `fechaprogramadaentrega`: Fecha/hora programada para entrega (ej: "2026-01-29 14:30")
- Datos de cliente, productos, cantidades, precios, etc.

## Verificación de Seguridad

### ¿Puede el cliente manipular timestamps de auditoría?
**NO**. Razones:

1. El frontend no envía campos de auditoría al servidor
2. Los campos de auditoría se generan con `NOW()` en SQL (ejecutado en el servidor)
3. La conexión MySQL usa timezone configurada del servidor
4. Las funciones de utilidad usan `getMexicoTime()` que se ejecuta en el servidor

### ¿Puede el cliente cambiar su hora local y afectar el sistema?
**NO**. Razones:

1. Todas las fechas se generan en el servidor, no en el cliente
2. El cliente solo envía datos de negocio, no timestamps
3. Incluso si el cliente modifica su reloj local, no afecta al servidor

### ¿Qué pasa si el servidor está en otra zona horaria?
**No hay problema**. Razones:

1. `getMexicoTimeComponents()` usa `Intl.DateTimeFormat` con zona horaria México
2. MySQL está configurado con `timezone: '-06:00'` (offset de México)
3. Las consultas SQL con `NOW()` respetan la configuración de timezone
4. Los Date objects y timestamps son universales - la zona horaria solo afecta el formato de salida

**Concepto importante:** Los objetos Date y los timestamps (milisegundos desde epoch) son UNIVERSALES. Representan el mismo momento en tiempo sin importar la zona horaria. La zona horaria solo afecta cómo MOSTRAMOS o FORMATEAMOS ese momento.

## Testing

Se creó un script de prueba en `backend/src/scripts/testMexicoTime.ts`:

```bash
cd backend
npx ts-node src/scripts/testMexicoTime.ts
```

Este script verifica:
- Generación correcta de hora de México
- Formatos ISO y MySQL
- Timestamps inmutables
- Comparación con hora local del sistema

## Ejemplos de Uso

### Al crear una venta:
```typescript
// Generar folio con timestamp del servidor en zona horaria de México
const time = getMexicoTimeComponents();
const HHMMSS = `${time.hours}${time.minutes}${time.seconds}`;
const folioventa = `${claveturno}${HHMMSS}V${ventaId}`;

// Insertar con NOW() para campos de auditoría (usa timezone configurada en MySQL)
await pool.execute(
  `INSERT INTO tblposcrumenwebventas 
   (..., fechadeventa, fechamodificacionauditoria) 
   VALUES (..., NOW(), NOW())`,
  [...]
);
```

### Al iniciar turno:
```typescript
// Generar clave de turno con fecha/hora del servidor en zona horaria de México
const generarClaveTurno = (idusuario: number, idnegocio: number): string => {
  const time = getMexicoTimeComponents();
  const aa = time.year.slice(-2);
  const mm = time.month;
  const dd = time.day;
  const HH = time.hours;
  const MM = time.minutes;
  const SS = time.seconds;
  return `${aa}${mm}${dd}${idnegocio}${idusuario}${HH}${MM}${SS}`;
};
```

### Al auditar login:
```typescript
const metadata = {
  timestamp: getMexicoTimeISO(),  // ISO string de hora de México
  // ... otros campos
  sessionId: `${getMexicoTimestamp()}-${Math.random()}`
};
```

## Impacto en Funcionalidad Existente

### ✅ Sin Cambios de Comportamiento
- La lógica de negocio sigue funcionando igual
- Los usuarios no notan ninguna diferencia
- Los formatos de fecha siguen siendo los mismos

### ✅ Mejoras de Seguridad
- Timestamps ahora son inmutables por el cliente
- Auditoría más confiable
- Zona horaria consistente en todo el sistema

### ✅ Mejoras de Mantenibilidad
- Código centralizado en `dateTime.ts`
- Fácil de probar y modificar
- Documentación clara de intención

## Conclusión

La implementación cumple con ambos requisitos:

1. ✅ **Fuente inmutable**: Todas las fechas son generadas por el servidor
2. ✅ **Zona horaria de México**: Configurado en MySQL y funciones de utilidad

Los cambios son mínimos, quirúrgicos y no afectan la funcionalidad existente. El sistema ahora tiene timestamps confiables e inmutables que reflejan la hora local del negocio en México.
