# Validación y Corrección del Endpoint usuarios.controller.ts

## Fecha
2025-12-28

## Problema Identificado

El problema statement solicitaba validar que: **"Al mostrar los registros se deben mostrar los registros donde tblposcrumenwebusuarios.idNegocio = idnegocio del usuario que hizo login."**

## Análisis Realizado

### Estado Inicial
Se revisó exhaustivamente el archivo `backend/src/controllers/usuarios.controller.ts` que contiene 10 endpoints:

1. ✅ `obtenerUsuarios` - Ya tenía filtrado correcto por idNegocio
2. ✅ `obtenerUsuarioPorId` - Ya tenía filtrado correcto por idNegocio
3. ❌ `crearUsuario` - **Faltaba validación y filtrado**
4. ✅ `actualizarUsuario` - Ya tenía filtrado correcto por idNegocio
5. ✅ `eliminarUsuario` - Ya tenía filtrado correcto por idNegocio
6. ✅ `cambiarEstatusUsuario` - Ya tenía filtrado correcto por idNegocio
7. ❌ `validarAliasUnico` - **Faltaba filtrado por idNegocio**
8. ✅ `actualizarImagenUsuario` - Ya tenía filtrado correcto por idNegocio
9. ✅ `obtenerImagenUsuario` - Ya tenía filtrado correcto por idNegocio
10. ✅ `eliminarImagenUsuario` - Ya tenía filtrado correcto por idNegocio

### Problemas Encontrados

#### 1. Endpoint `crearUsuario`
**Problema:** Usaba `Request` en lugar de `AuthRequest`, no validaba el idNegocio del usuario autenticado, y permitía crear usuarios en otros negocios sin validación.

**Impacto:** Un usuario de un negocio podría crear usuarios en otro negocio diferente, violando el aislamiento de datos entre negocios.

#### 2. Endpoint `validarAliasUnico`
**Problema:** Validaba que el alias fuera único globalmente, no por negocio. Esto impediría que dos negocios diferentes usaran el mismo alias para sus usuarios.

**Impacto:** Restricción innecesaria que impedía a diferentes negocios usar los mismos alias.

## Cambios Implementados

### 1. Corrección de `crearUsuario` (líneas 148-260)

```typescript
// Cambio 1: De Request a AuthRequest
export const crearUsuario = async (req: AuthRequest, res: Response): Promise<void> => {

// Cambio 2: Obtener y validar el usuario autenticado
const userIdNegocio = req.user?.idNegocio;
if (!userIdNegocio) {
  res.status(401).json({
    success: false,
    message: 'Usuario no autenticado'
  });
  return;
}

// Cambio 3: Calcular idNegocio final (usar el del request o el del usuario autenticado)
const finalIdNegocio = idNegocio ?? userIdNegocio;

// Cambio 4: Validar que no se creen usuarios en otros negocios (excepto superusuarios)
if (userIdNegocio !== 99999 && finalIdNegocio !== userIdNegocio) {
  res.status(403).json({
    success: false,
    message: 'No tiene permiso para crear usuarios en otro negocio'
  });
  return;
}

// Cambio 5: Verificar alias único dentro del mismo negocio
const [existente] = await pool.execute<RowDataPacket[]>(
  'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE alias = ? AND idNegocio = ?',
  [alias, finalIdNegocio]
);

// Cambio 6: Insertar con el finalIdNegocio calculado
const [result] = await pool.execute<ResultSetHeader>(
  `INSERT INTO tblposcrumenwebusuarios (...) VALUES (?, ...)`,
  [finalIdNegocio, ...]
);
```

### 2. Corrección de `validarAliasUnico` (líneas 565-610)

```typescript
// Cambio 1: De Request a AuthRequest
export const validarAliasUnico = async (req: AuthRequest, res: Response): Promise<void> => {

// Cambio 2: Obtener y validar el usuario autenticado
const idnegocio = req.user?.idNegocio;
if (!idnegocio) {
  res.status(401).json({
    success: false,
    message: 'Usuario no autenticado'
  });
  return;
}

// Cambio 3: Filtrar por negocio (excepto superusuarios)
let query = 'SELECT idUsuario FROM tblposcrumenwebusuarios WHERE alias = ?';
const params: any[] = [alias];

if (idnegocio !== 99999) {
  query += ' AND idNegocio = ?';
  params.push(idnegocio);
}

if (idUsuario) {
  query += ' AND idUsuario != ?';
  params.push(idUsuario);
}

const [rows] = await pool.execute<RowDataPacket[]>(query, params);
```

### 3. Limpieza de código

```typescript
// Se removió import innecesario
- import { Request, Response } from 'express';
+ import { Response } from 'express';
```

## Lógica de Negocio Implementada

### Usuarios Regulares (idNegocio != 99999)
- Solo pueden ver usuarios de su propio negocio
- Solo pueden crear usuarios en su propio negocio
- Solo pueden actualizar usuarios de su propio negocio
- Solo pueden eliminar usuarios de su propio negocio
- Los alias deben ser únicos solo dentro de su negocio

### Superusuarios (idNegocio = 99999)
- Pueden ver todos los usuarios de todos los negocios
- Pueden crear usuarios en cualquier negocio
- Pueden actualizar usuarios de cualquier negocio
- Pueden eliminar usuarios de cualquier negocio
- Los alias deben ser únicos globalmente (a menos que se especifique un idNegocio específico)

## Mejoras de Calidad

1. **Uso de Nullish Coalescing (`??`)**: Se utiliza el operador `??` en lugar de `||` para manejar correctamente el caso donde `idNegocio` podría ser `0` (un valor válido).

2. **Orden de Validación**: Se calcula `finalIdNegocio` antes de realizar las validaciones para evitar errores lógicos.

3. **Mensajes de Error Claros**: Se proporcionan mensajes específicos para cada tipo de error:
   - 401: Usuario no autenticado
   - 403: No tiene permisos para crear usuarios en otro negocio
   - 400: Validaciones de datos (alias ya existe, campos obligatorios)

## Verificación

### Compilación
```bash
cd backend && npm run build
```
✅ Sin errores de TypeScript

### Seguridad (CodeQL)
```bash
# Se ejecutó análisis de seguridad CodeQL
```
✅ No se encontraron vulnerabilidades

### Revisión de Código
Se realizaron 3 iteraciones de revisión de código para garantizar:
- ✅ Lógica de validación correcta
- ✅ Orden apropiado de operaciones
- ✅ Manejo seguro de valores falsy
- ✅ Consistencia con el resto del código

## Archivos Modificados

- `backend/src/controllers/usuarios.controller.ts`

## Commits Realizados

1. `a93fec0` - Initial plan
2. `cb4daa0` - Fix: Add idNegocio filtering to crearUsuario and validarAliasUnico endpoints
3. `9129218` - Fix: Move finalIdNegocio calculation before validation to prevent logic errors
4. `3d25013` - Fix: Use nullish coalescing operator for safer idNegocio fallback

## Conclusión

✅ **El endpoint usuarios.controller.ts ahora cumple completamente con el requerimiento de filtrar por idNegocio.**

Todos los endpoints ahora respetan el aislamiento de datos entre negocios, permitiendo que cada negocio vea y gestione únicamente sus propios usuarios, mientras que los superusuarios mantienen acceso global para tareas administrativas.

## Recomendaciones para el Futuro

1. **Pruebas Automatizadas**: Considerar agregar pruebas unitarias para validar el comportamiento de filtrado por idNegocio.

2. **Auditoría**: Revisar otros controladores para asegurar que también implementen el filtrado por idNegocio de manera consistente.

3. **Documentación de API**: Actualizar la documentación de la API para reflejar las restricciones de acceso basadas en idNegocio.
