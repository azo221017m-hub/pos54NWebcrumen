# 🔓 Implementación de Auto-Login

## Descripción

Esta funcionalidad implementa un sistema de auto-login automático cuando la tabla `tblposcrumenwebusuarios` está vacía. Es útil para la inicialización del sistema cuando no existen usuarios en la base de datos.

## Flujo de Auto-Login

1. **Al cargar LoginPage**: La aplicación verifica automáticamente si la tabla de usuarios está vacía
2. **Si está vacía**: Se ejecuta el auto-login con credenciales del sistema
3. **Creación de sesión temporal**: Se genera un token JWT válido por 2 minutos
4. **Redirección automática**: El usuario es redirigido al DashboardPage

## Credenciales del Sistema

Cuando se ejecuta el auto-login, se crea una sesión con los siguientes datos:

```javascript
{
  alias: 'crumensys',
  password: 'Crumen420.',
  nombre: 'adminsistemas',
  idNegocio: 99999,
  idUsuario: 99999,
  idRol: 1, // Administrador
  estatus: 1
}
```

## Endpoints Nuevos

### 1. Verificar si la tabla está vacía

```bash
GET /api/auth/check-users-empty
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "isEmpty": true,
    "count": 0
  }
}
```

### 2. Ejecutar auto-login

```bash
POST /api/auth/auto-login
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Auto-login exitoso - Sesión temporal de 2 minutos",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "idUsuario": 99999,
      "alias": "crumensys",
      "nombre": "adminsistemas",
      "idNegocio": 99999,
      "idRol": 1,
      "estatus": 1
    },
    "isTemporary": true,
    "expiresIn": "2m"
  }
}
```

**Respuesta cuando la tabla NO está vacía:**
```json
{
  "success": false,
  "message": "Auto-login solo disponible cuando la tabla de usuarios está vacía"
}
```

## Uso en Frontend

El auto-login se ejecuta automáticamente en `LoginPage.tsx`:

```typescript
useEffect(() => {
  // ... otras verificaciones ...
  
  // Check if users table is empty and perform auto-login if needed
  const checkAndAutoLogin = async () => {
    try {
      const { isEmpty } = await authService.checkUsersTableEmpty();
      
      if (isEmpty) {
        console.log('🔓 Tabla de usuarios vacía - Iniciando auto-login...');
        const response = await authService.autoLogin();
        
        if (response.success && response.data) {
          // Guardar token y datos del usuario temporal
          authService.saveAuthData(response.data.token, response.data.usuario);
          
          console.log('✅ Auto-login exitoso - Sesión temporal de 2 minutos');
          
          // Redirigir al dashboard
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Error al verificar/auto-login:', err);
      // Si falla el auto-login, simplemente continuar con el login normal
    }
  };

  checkAndAutoLogin();
}, [navigate]);
```

## Seguridad

### ✅ Medidas de Seguridad Implementadas

1. **Verificación en tiempo de ejecución**: El endpoint `auto-login` verifica que la tabla esté vacía antes de crear la sesión
2. **Sesión temporal**: El token JWT expira en exactamente 2 minutos
3. **Rol de administrador**: El usuario temporal tiene acceso completo (idRol=1)
4. **Protección contra tabla poblada**: Retorna 403 si se intenta usar cuando hay usuarios

### ⚠️ Consideraciones de Seguridad

1. **Endpoints públicos**: Los nuevos endpoints son públicos por diseño, necesarios para la inicialización
2. **Sin rate limiting**: Los endpoints no tienen limitación de tasa (aceptable para escenario de inicialización)
3. **Solo para inicialización**: Esta funcionalidad está diseñada para usarse únicamente durante la inicialización del sistema

## Escenarios de Uso

### Caso 1: Base de datos nueva (tabla vacía)
1. Usuario abre la aplicación
2. Se detecta que la tabla está vacía
3. Auto-login se ejecuta automáticamente
4. Usuario ve el DashboardPage con sesión temporal de 2 minutos
5. Usuario debe crear usuarios permanentes antes de que expire la sesión

### Caso 2: Base de datos con usuarios
1. Usuario abre la aplicación
2. Se detecta que la tabla tiene usuarios
3. Se muestra el formulario de login normal
4. Usuario ingresa sus credenciales manualmente

## Testing

### Probar el auto-login manualmente:

1. Asegurarse de que la tabla `tblposcrumenwebusuarios` esté vacía
2. Acceder a la aplicación
3. Verificar que se redirija automáticamente al dashboard
4. Verificar que el token expire después de 2 minutos

### Usando cURL:

```bash
# Verificar si la tabla está vacía
curl http://localhost:3000/api/auth/check-users-empty

# Ejecutar auto-login (solo funciona si la tabla está vacía)
curl -X POST http://localhost:3000/api/auth/auto-login
```

## Archivos Modificados

1. `backend/src/controllers/auth.controller.ts` - Nuevos endpoints
2. `backend/src/routes/auth.routes.ts` - Nuevas rutas
3. `src/services/authService.ts` - Nuevos métodos de servicio
4. `src/pages/LoginPage.tsx` - Lógica de auto-login en useEffect

## Notas Importantes

- ⚠️ **La sesión temporal dura EXACTAMENTE 2 minutos**
- ⚠️ **El auto-login SOLO funciona cuando la tabla está completamente vacía**
- ✅ **El usuario temporal tiene permisos de administrador completos**
- ✅ **Se puede acceder al DashboardPage inmediatamente después del auto-login**
