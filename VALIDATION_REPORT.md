# Validación: Filtrado de Lista de Usuarios por ID de Negocio

## Requerimiento

En ListaUsuarios, validar mostrar los datos:
- Mostrar sólo los usuarios con el idnegocio del usuario que hizo login
- Si el idnegocio del usuario que hizo login es = 99999 mostrar todos los usuarios

## Estado de Implementación

✅ **COMPLETAMENTE IMPLEMENTADO**

La funcionalidad solicitada ya está implementada y funcionando correctamente en el backend.

## Detalles de la Implementación

### 1. Autenticación y Token JWT

**Archivo:** `backend/src/middlewares/auth.ts`

El middleware de autenticación extrae el `idNegocio` del token JWT y lo adjunta al objeto `request`:

```typescript
export interface AuthRequest extends Request {
  user?: {
    id: number;
    alias: string;
    nombre: string;
    idNegocio: number;  // ← ID del negocio del usuario autenticado
    idRol: number;
  };
}
```

### 2. Controlador de Usuarios

**Archivo:** `backend/src/controllers/usuarios.controller.ts`

La función `obtenerUsuarios()` implementa la lógica de filtrado (líneas 8-74):

```typescript
export const obtenerUsuarios = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Si idnegocio == 99999, mostrar todos los usuarios
    // Si idnegocio != 99999, mostrar solo usuarios con el mismo idnegocio
    let query = `SELECT ... FROM tblposcrumenwebusuarios`;
    
    const params: any[] = [];
    
    if (idnegocio !== 99999) {
      query += ` WHERE idNegocio = ?`;
      params.push(idnegocio);
    }
    
    query += ` ORDER BY fechaRegistroauditoria DESC`;

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    // ... resto del código
  }
};
```

**Lógica de Filtrado:**
- **Línea 11:** Extrae el `idNegocio` del usuario autenticado desde el token JWT
- **Líneas 13-19:** Valida que el usuario esté autenticado
- **Líneas 46-49:** 
  - Si `idnegocio === 99999`: No agrega filtro WHERE, retorna TODOS los usuarios
  - Si `idnegocio !== 99999`: Agrega `WHERE idNegocio = ?`, retorna solo usuarios del mismo negocio

### 3. Rutas Protegidas

**Archivo:** `backend/src/routes/usuarios.routes.ts`

```typescript
const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);  // ← Protege todas las rutas

router.get('/', obtenerUsuarios);  // ← Usa el filtrado
// ... más rutas
```

**Línea 19:** Asegura que todas las rutas de usuarios requieren autenticación, garantizando que `req.user.idNegocio` siempre esté disponible.

### 4. Frontend

**Archivo:** `src/components/usuarios/ListaUsuarios/ListaUsuarios.tsx`

El componente frontend simplemente muestra los datos que recibe del backend:

```typescript
export const ListaUsuarios: React.FC<ListaUsuariosProps> = ({
  usuarios,  // ← Ya filtrados por el backend
  onEditar,
  onEliminar,
  loading = false
}) => {
  // ... renderiza los usuarios
};
```

**Archivo:** `src/components/usuarios/GestionUsuarios/GestionUsuarios.tsx`

```typescript
const cargarUsuarios = useCallback(async () => {
  try {
    setLoading(true);
    const data = await obtenerUsuarios();  // ← Llama al backend
    setUsuarios(data);  // ← Muestra datos ya filtrados
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    mostrarMensaje('error', 'Error al cargar los usuarios');
  } finally {
    setLoading(false);
  }
}, []);
```

## Operaciones Protegidas

La misma lógica de filtrado se aplica consistentemente en TODAS las operaciones:

1. ✅ **GET /usuarios** - `obtenerUsuarios()` (líneas 8-74)
2. ✅ **GET /usuarios/:id** - `obtenerUsuarioPorId()` (líneas 77-145)
3. ✅ **PUT /usuarios/:id** - `actualizarUsuario()` (líneas 263-414)
4. ✅ **DELETE /usuarios/:id** - `eliminarUsuario()` (líneas 417-476)
5. ✅ **PATCH /usuarios/:id/estatus** - `cambiarEstatusUsuario()` (líneas 479-539)
6. ✅ **PATCH /usuarios/:id/imagen** - `actualizarImagenUsuario()` (líneas 571-639)
7. ✅ **GET /usuarios/:id/imagen/:tipo** - `obtenerImagenUsuario()` (líneas 642-707)
8. ✅ **DELETE /usuarios/:id/imagen/:tipo** - `eliminarImagenUsuario()` (líneas 710-759)

Todas estas funciones verifican:
- Si `idnegocio === 99999`: Permiten acceso a cualquier usuario
- Si `idnegocio !== 99999`: Solo permiten acceso a usuarios del mismo negocio

## Casos de Prueba

### Caso 1: Usuario con idnegocio = 99999 (Super Admin)
**Entrada:** Usuario autenticado con `idNegocio: 99999`  
**Resultado Esperado:** Se retornan TODOS los usuarios de TODOS los negocios  
**SQL Ejecutado:** `SELECT ... FROM tblposcrumenwebusuarios ORDER BY fechaRegistroauditoria DESC`  
**Estado:** ✅ Implementado correctamente

### Caso 2: Usuario con idnegocio = 1
**Entrada:** Usuario autenticado con `idNegocio: 1`  
**Resultado Esperado:** Se retornan solo usuarios con `idNegocio = 1`  
**SQL Ejecutado:** `SELECT ... FROM tblposcrumenwebusuarios WHERE idNegocio = 1 ORDER BY fechaRegistroauditoria DESC`  
**Estado:** ✅ Implementado correctamente

### Caso 3: Usuario con idnegocio = 2
**Entrada:** Usuario autenticado con `idNegocio: 2`  
**Resultado Esperado:** Se retornan solo usuarios con `idNegocio = 2`  
**SQL Ejecutado:** `SELECT ... FROM tblposcrumenwebusuarios WHERE idNegocio = 2 ORDER BY fechaRegistroauditoria DESC`  
**Estado:** ✅ Implementado correctamente

### Caso 4: Usuario no autenticado
**Entrada:** Request sin token JWT válido  
**Resultado Esperado:** Error 401 "Usuario no autenticado"  
**Estado:** ✅ Protegido por `authMiddleware`

## Seguridad

1. ✅ **Autenticación Obligatoria:** Todas las rutas de usuarios requieren token JWT válido
2. ✅ **Autorización por Negocio:** Los usuarios solo pueden ver/editar usuarios de su propio negocio
3. ✅ **Excepción Super Admin:** Solo usuarios con `idNegocio = 99999` pueden ver todos los usuarios
4. ✅ **Consistencia:** La misma lógica se aplica en todas las operaciones CRUD
5. ✅ **Validación Backend:** El filtrado se realiza en el servidor, no es manipulable desde el cliente

## Conclusión

La funcionalidad requerida está **completamente implementada y funcionando correctamente**. El sistema:

- ✅ Filtra usuarios por `idNegocio` del usuario autenticado
- ✅ Permite acceso completo a usuarios con `idNegocio = 99999`
- ✅ Protege todas las operaciones con la misma lógica
- ✅ Implementa seguridad adecuada a nivel de backend

**No se requieren cambios adicionales** en el código para cumplir con el requerimiento especificado.

## Referencias

- **Backend Controller:** `backend/src/controllers/usuarios.controller.ts`
- **Auth Middleware:** `backend/src/middlewares/auth.ts`
- **Routes:** `backend/src/routes/usuarios.routes.ts`
- **Frontend Component:** `src/components/usuarios/ListaUsuarios/ListaUsuarios.tsx`
- **Frontend Service:** `src/services/usuariosService.ts`
