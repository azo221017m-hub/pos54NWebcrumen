# 🔐 Guía de Autenticación - Login con Base de Datos Real

## ✅ Implementación Completada

Se ha integrado el sistema de login con la tabla real de la base de datos MySQL en Azure:

### Tabla Utilizada
```
tblposcrumenwebusuarios
```

### Campos Mapeados
- `alias` → Usuario para login
- `password` → Contraseña (hasheada con bcrypt)
- `nombre` → Nombre completo del usuario
- `idUsuario` → ID único
- `idNegocio` → ID del negocio
- `idRol` → Rol del usuario (1=Admin, 2=Vendedor, etc.)
- `estatus` → Estado activo (1=activo, 0=inactivo)

---

## 🚀 Cómo Usar el Sistema

### 1. Verificar Usuarios Existentes

Ejecuta este comando en el backend para ver los usuarios disponibles:

```bash
cd backend
npm run db:seed-user
```

Este script:
- ✅ Lista los primeros 5 usuarios en la base de datos
- ✅ Muestra sus alias y nombres
- ✅ Crea un usuario de prueba si no existe ninguno

### 2. Usuario de Prueba (si se crea automáticamente)

```
Usuario: admin
Contraseña: admin123
Rol: Administrador
```

### 2.1 Usuario poscrumen (Producción)

Para actualizar/crear el usuario `poscrumen` con una nueva contraseña:

```bash
cd backend
POSCRUMEN_PASSWORD=tu_contraseña npm run db:update-poscrumen
```

Este script:
- ✅ Busca el usuario `poscrumen` en la base de datos
- ✅ Actualiza la contraseña con el hash bcrypt proporcionado
- ✅ Activa el usuario (estatus = 1)
- ✅ Limpia el historial de intentos de login fallidos

**Nota:** La contraseña debe proporcionarse mediante variable de entorno por seguridad.

### 2.2 SUPERUSUARIO (Crumen)

Para crear/actualizar el SUPERUSUARIO del sistema con credenciales predefinidas:

```bash
cd backend
npm run db:create-superuser
```

Este script:
- ✅ Crea o actualiza el usuario SUPERUSUARIO
- ✅ Establece las credenciales:
  - **Usuario:** `Crumen`
  - **Contraseña:** `Crumen.*`
- ✅ Asigna rol de Administrador (idRol = 1)
- ✅ Activa el usuario (estatus = 1)
- ✅ Limpia el historial de intentos de login fallidos

**Uso para login:**
```
Usuario: Crumen
Contraseña: Crumen.*
```

### 2.3 Desbloquear Cuenta

Si una cuenta está bloqueada por múltiples intentos fallidos:

```bash
cd backend
npm run db:reset-login-attempts
```

Este script resetea los intentos de login del usuario `poscrumen` y desbloquea la cuenta.

### 3. Iniciar Servidores

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
El backend estará en: http://localhost:3000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
El frontend estará en: http://localhost:5173

---

## 🔑 Proceso de Login

1. **Abrir la aplicación**: http://localhost:5173
2. **Landing Page**: Verás 5 frases animadas que se muestran secuencialmente
3. **Redirección automática**: Después de ver las frases, serás redirigido a `/login`
4. **Ingresar credenciales**:
   - Usuario: El `alias` del usuario (ej: `admin`)
   - Contraseña: La contraseña del usuario (ej: `admin123`)
5. **Submit**: El sistema validará contra la base de datos real
6. **Dashboard**: Si las credenciales son correctas, serás redirigido al dashboard

---

## 🔒 Seguridad Implementada

### Backend
- ✅ **Bcrypt**: Contraseñas hasheadas con 10 rondas
- ✅ **JWT**: Tokens con expiración de 24 horas
- ✅ **Validación**: Campo `estatus = 1` para usuarios activos
- ✅ **Middleware**: Protección de rutas con `authMiddleware`

### Frontend
- ✅ **LocalStorage**: Almacena token y datos del usuario
- ✅ **Axios**: Cliente HTTP con interceptores
- ✅ **Validación**: Manejo de errores de conexión y autenticación

---

## 📝 Flujo de Autenticación

```
┌─────────────┐
│ LoginPage   │
│ (Frontend)  │
└──────┬──────┘
       │ POST /api/auth/login
       │ { alias, password }
       ▼
┌──────────────────────┐
│ Backend Controller   │
│ 1. Buscar usuario    │
│    en BD por alias   │
│ 2. Verificar         │
│    password (bcrypt) │
│ 3. Generar JWT       │
└──────┬───────────────┘
       │ Response
       │ { token, usuario }
       ▼
┌─────────────┐
│ Frontend    │
│ 1. Guardar  │
│    token    │
│ 2. Guardar  │
│    usuario  │
│ 3. Redirect │
│    dashboard│
└─────────────┘
```

---

## 🛠️ Endpoints de Autenticación

### POST /api/auth/login
Iniciar sesión con usuario y contraseña.

**Request:**
```json
{
  "email": "admin",
  "password": "admin123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "nombre": "Administrador",
      "alias": "admin",
      "telefono": "",
      "idNegocio": 1,
      "idRol": 1
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Usuario o contraseña incorrectos"
}
```

### POST /api/auth/register
Registrar un nuevo usuario.

**Request:**
```json
{
  "nombre": "Juan Pérez",
  "alias": "juanp",
  "password": "password123",
  "telefono": "5551234567",
  "idNegocio": 1,
  "idRol": 2
}
```

### GET /api/auth/verify
Verificar si el token es válido.

**Headers:**
```
Authorization: Bearer <token>
```

---

## 🐛 Troubleshooting

### Error: "Error de conexión con el servidor"
**Solución**: Verifica que el backend esté ejecutándose en http://localhost:3000
```bash
cd backend
npm run dev
```

### Error: "Usuario o contraseña incorrectos"
**Solución**: 
1. Verifica que el usuario exista en la BD
2. Ejecuta `npm run db:seed-user` para ver usuarios disponibles
3. Usa el usuario de prueba: `admin` / `admin123`

### Error: Passwords no hasheadas en la BD
Si las contraseñas en la BD no están hasheadas, modifica el controlador:

En `backend/src/controllers/auth.controller.ts`, línea 45:
```typescript
// Cambiar de:
const passwordValida = await bcrypt.compare(password, usuario.password);

// A comparación directa:
const passwordValida = password === usuario.password;
```

### Frontend no se conecta al Backend
Verifica la URL de la API en `frontend/src/pages/LoginPage.tsx`:
```typescript
const API_URL = 'http://localhost:3000';
```

O crea un archivo `.env` en el frontend:
```env
VITE_API_URL=http://localhost:3000
```

---

## 📊 Testing con cURL

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"admin123"}'
```

### Test con Token
```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 🎯 Próximos Pasos

- [x] Agregar límite de intentos de login
- [x] Agregar logs de auditoría de login
- [ ] Implementar "Olvidé mi contraseña"
- [ ] Agregar 2FA (autenticación de dos factores)
- [ ] Implementar refresh tokens
- [ ] Implementar sesiones concurrentes

---

## 📞 Soporte

Si tienes problemas con la autenticación:
1. Verifica que ambos servidores estén corriendo
2. Revisa los logs del backend para ver errores SQL
3. Usa `npm run db:seed-user` para verificar usuarios
4. Revisa la consola del navegador para errores del frontend
