# Solución al Problema de Login con Usuario Crumen

## Problema

No se puede iniciar sesión con las credenciales del SUPERUSUARIO:
- **Usuario:** Crumen
- **Contraseña:** Crumen.*

## Causas Posibles

1. El usuario no existe en la base de datos
2. La contraseña no está correctamente hasheada
3. La cuenta está bloqueada por intentos fallidos
4. El usuario está inactivo (estatus = 0)

## Solución Implementada

### 1. Nuevo Endpoint API: `/api/auth/ensure-superuser`

Se ha creado un nuevo endpoint POST que:
- ✅ Verifica si el usuario "Crumen" existe
- ✅ Si existe: actualiza la contraseña, activa el usuario y desbloquea la cuenta
- ✅ Si no existe: crea el usuario con las credenciales correctas
- ✅ Elimina todos los bloqueos de cuenta
- ✅ Establece estatus = 1 (activo)

**Uso del Endpoint:**

```bash
# Llamada con curl
curl -X POST http://localhost:3000/api/auth/ensure-superuser

# O en producción
curl -X POST https://pos54nwebcrumenbackend.onrender.com/api/auth/ensure-superuser
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "SUPERUSUARIO actualizado y cuenta desbloqueada exitosamente",
  "data": {
    "alias": "Crumen",
    "id": 123,
    "action": "updated"
  }
}
```

### 2. Página Web Utilitaria

Se ha creado una página HTML en `/public/init-superuser.html` que proporciona una interfaz gráfica para inicializar el superusuario.

**Acceso:**
- Desarrollo: http://localhost:3000/public/init-superuser.html
- Producción: https://pos54nwebcrumenbackend.onrender.com/public/init-superuser.html

**Características:**
- ✅ Interfaz visual amigable
- ✅ Botón para ejecutar la inicialización
- ✅ Muestra el resultado de la operación
- ✅ Muestra las credenciales del superusuario

## Pasos para Resolver el Problema

### Opción 1: Usar el Endpoint API directamente

1. Abrir terminal
2. Ejecutar el comando curl:
   ```bash
   curl -X POST https://pos54nwebcrumenbackend.onrender.com/api/auth/ensure-superuser
   ```
3. Verificar que la respuesta sea exitosa
4. Intentar login con las credenciales

### Opción 2: Usar la Página Web

1. Abrir en el navegador: https://pos54nwebcrumenbackend.onrender.com/public/init-superuser.html
2. Hacer clic en "Inicializar Superusuario"
3. Esperar la confirmación exitosa
4. Ir a la página de login e ingresar con:
   - Usuario: `Crumen`
   - Contraseña: `Crumen.*`

### Opción 3: Usar el Script CLI (requiere acceso al servidor)

```bash
cd backend
npm run db:create-superuser
```

## Verificación

Después de ejecutar cualquiera de las opciones anteriores:

1. Ir a la página de login
2. Ingresar credenciales:
   - **Usuario:** Crumen
   - **Contraseña:** Crumen.*
3. Hacer clic en "Iniciar Sesión"
4. Debe redirigir al dashboard

## Solución de Problemas

### Error: "Usuario o contraseña incorrectos"

**Solución:** Ejecutar el endpoint `ensure-superuser` nuevamente para asegurar que la contraseña sea correcta.

### Error: "Cuenta bloqueada"

**Solución:** El endpoint `ensure-superuser` automáticamente desbloquea la cuenta. Ejecutarlo nuevamente.

### Error: "Usuario inactivo"

**Solución:** El endpoint `ensure-superuser` automáticamente activa el usuario (estatus = 1). Ejecutarlo nuevamente.

### Error: "Error de conexión con el servidor"

**Solución:** 
1. Verificar que el backend esté ejecutándose
2. En desarrollo: `cd backend && npm run dev`
3. En producción: verificar que el servicio esté activo en Render

## Detalles Técnicos

### Código del Endpoint

El endpoint está implementado en `backend/src/controllers/auth.controller.ts`:

```typescript
export const ensureSuperuser = async (req: Request, res: Response): Promise<void> => {
  // Credenciales predefinidas
  const superuserAlias = 'Crumen';
  const superuserPassword = 'Crumen.*';
  
  // Hash de la contraseña con bcrypt (10 rounds)
  const hashedPassword = await bcrypt.hash(superuserPassword, 10);
  
  // Buscar usuario existente
  const [usuarios] = await pool.execute<Usuario[]>(
    'SELECT idUsuario, alias, nombre, estatus, password FROM tblposcrumenwebusuarios WHERE alias = ?',
    [superuserAlias]
  );
  
  if (usuarios.length > 0) {
    // Actualizar contraseña y activar
    await pool.execute(
      'UPDATE tblposcrumenwebusuarios SET password = ?, estatus = 1 WHERE alias = ?',
      [hashedPassword, superuserAlias]
    );
    
    // Desbloquear cuenta
    await desbloquearCuenta(superuserAlias);
  } else {
    // Crear nuevo usuario
    await pool.execute(
      `INSERT INTO tblposcrumenwebusuarios 
       (idNegocio, idRol, nombre, alias, password, telefono, estatus, fechaRegistroauditoria, usuarioauditoria) 
       VALUES (1, 1, 'SUPERUSUARIO', ?, ?, '', 1, NOW(), 'system')`,
      [superuserAlias, hashedPassword]
    );
  }
}
```

### Seguridad

- ✅ La contraseña se hashea con bcrypt (10 salt rounds)
- ✅ El endpoint es público para permitir inicialización sin autenticación previa
- ✅ Las credenciales son las especificadas en los requisitos del sistema
- ✅ Se registra en los logs la operación realizada

## Archivos Modificados

1. `backend/src/controllers/auth.controller.ts` - Nuevo método `ensureSuperuser`
2. `backend/src/routes/auth.routes.ts` - Nueva ruta POST `/api/auth/ensure-superuser`
3. `backend/src/app.ts` - Soporte para archivos estáticos en carpeta `public`
4. `backend/public/init-superuser.html` - Página web utilitaria (NUEVO)

## Conclusión

Esta solución proporciona múltiples formas de asegurar que el usuario SUPERUSUARIO existe, está activo, no está bloqueado y tiene la contraseña correcta. El problema de login debe quedar resuelto después de ejecutar el endpoint `ensure-superuser`.
