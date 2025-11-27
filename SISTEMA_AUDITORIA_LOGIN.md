# Sistema de Auditoría de Login y Seguridad con JWT

## 📋 Resumen del Sistema Implementado

Sistema completo de auditoría de intentos de login con bloqueo automático de cuentas, gestión segura de sesiones mediante JWT y control de acceso a rutas protegidas.

---

## 🔐 Características Implementadas

### 1. **Auditoría de Intentos de Login**
- ✅ Registro de todos los intentos de login (exitosos y fallidos)
- ✅ Bloqueo automático después de 3 intentos fallidos
- ✅ Desbloqueo automático después de 30 minutos
- ✅ Almacenamiento de metadata completa (IP, navegador, SO, dispositivo)
- ✅ Historial de intentos por usuario

### 2. **Tabla de Base de Datos**
```sql
Table: tblposcrumenwebintentoslogin
- id: int(11) AI PK
- aliasusuario: varchar(255)
- intentos: smallint(6)
- ultimologin: datetime
- fechabloqueado: datetime
- idnegocio: int(11)
- metaaud: longtext (JSON con metadata)
```

### 3. **Sistema JWT Mejorado**
- ✅ Tokens con información completa del usuario
- ✅ Expiración de 8 horas
- ✅ Secret key segura
- ✅ Información incluida: id, alias, nombre, idNegocio, idRol

---

## 📁 Archivos Creados/Modificados

### Backend

#### **Nuevos Archivos:**

1. **`backend/src/types/intentoLogin.types.ts`**
   - Tipos e interfaces para la tabla de intentos
   - Metadata de auditoría
   - Respuestas del sistema

2. **`backend/src/services/loginAudit.service.ts`**
   - `verificarBloqueo()` - Verifica si usuario está bloqueado
   - `registrarIntentoFallido()` - Registra intento fallido e incrementa contador
   - `registrarLoginExitoso()` - Registra login exitoso y resetea intentos
   - `extraerMetadata()` - Extrae información del navegador, SO, IP, etc.
   - `obtenerHistorialIntentos()` - Obtiene histórico de intentos

#### **Archivos Modificados:**

3. **`backend/src/controllers/auth.controller.ts`**
   - ✅ Integración del sistema de auditoría
   - ✅ Verificación de bloqueo antes de validar credenciales
   - ✅ Registro de intentos fallidos con incremento automático
   - ✅ Registro de logins exitosos con metadata
   - ✅ Mensajes informativos sobre intentos restantes
   - ✅ JWT mejorado con 8 horas de duración

4. **`backend/src/middlewares/auth.ts`**
   - ✅ Verificación robusta de JWT
   - ✅ Validación de usuario activo en BD
   - ✅ Manejo de tokens expirados
   - ✅ Middleware `checkRole()` para control de permisos
   - ✅ Middleware `checkNegocio()` para seguridad multi-tenant
   - ✅ Middleware `optionalAuth()` para endpoints públicos

---

## 🔄 Flujo del Sistema

### **Login Exitoso:**
```
1. Usuario ingresa credenciales
2. Backend verifica si usuario existe
3. Backend verifica si cuenta está bloqueada
4. Backend valida contraseña
5. Si es correcta:
   ├─ Genera JWT (8h de duración)
   ├─ Registra login exitoso en tblposcrumenwebintentoslogin
   ├─ Resetea contador de intentos a 0
   ├─ Guarda metadata (IP, navegador, SO, timestamp)
   └─ Retorna token + datos usuario
6. Frontend guarda token en localStorage
7. Frontend redirige al dashboard
```

### **Login Fallido:**
```
1. Usuario ingresa credenciales incorrectas
2. Backend verifica que usuario existe
3. Backend verifica si ya está bloqueado
4. Si contraseña es incorrecta:
   ├─ Incrementa contador de intentos
   ├─ Registra intento fallido con metadata
   ├─ Si intentos >= 3:
   │  └─ Bloquea cuenta (establece fechabloqueado)
   └─ Retorna error con intentos restantes
5. Frontend muestra mensaje de error
6. Frontend muestra advertencia si quedan pocos intentos
```

### **Cuenta Bloqueada:**
```
1. Usuario intenta login
2. Backend detecta fechabloqueado
3. Calcula minutos transcurridos desde bloqueo
4. Si < 30 minutos:
   └─ Retorna error "Cuenta bloqueada. Intente en X minutos"
5. Si >= 30 minutos:
   ├─ Resetea intentos automáticamente
   └─ Permite intentar login nuevamente
```

---

## 🛡️ Seguridad Implementada

### **Protección de Rutas:**
```typescript
// Aplicar middleware a rutas protegidas
router.get('/protected', authMiddleware, controller);

// Verificar rol específico
router.post('/admin', authMiddleware, checkRole(1), controller);

// Verificar acceso a negocio
router.get('/negocio/:id', authMiddleware, checkNegocio, controller);
```

### **Validaciones:**
- ✅ Token JWT obligatorio en rutas protegidas
- ✅ Verificación de usuario activo en cada request
- ✅ Validación de roles y permisos
- ✅ Control multi-tenant (cada usuario solo ve su negocio)
- ✅ Manejo de tokens expirados con mensajes claros

---

## 📊 Metadata Almacenada

Cada intento de login (exitoso o fallido) guarda:

```json
{
  "timestamp": "2025-11-27T10:30:45.123Z",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "navegador": "Chrome",
  "sistemaOperativo": "Windows",
  "dispositivo": "Desktop",
  "exito": true,
  "mensaje": "Login exitoso",
  "tokenGenerado": true,
  "sessionId": "1701082245123-a7f3k9"
}
```

---

## 🔧 Configuración

### **Variables de Entorno (Backend):**
```env
JWT_SECRET=secret_key_pos54nwebcrumen_2024
PORT=3000
```

### **Constantes Configurables:**
```typescript
// En loginAudit.service.ts
const MAX_INTENTOS_PERMITIDOS = 3;
const TIEMPO_BLOQUEO_MINUTOS = 30;

// En auth.controller.ts
expiresIn: '8h' // Duración del token
```

---

## 📝 Próximos Pasos (Frontend)

### **Pendientes:**
1. ✅ Backend completo
2. ⏳ Actualizar LoginPage para mostrar:
   - Mensajes de cuenta bloqueada
   - Intentos restantes
   - Advertencias de bloqueo inminente
3. ⏳ Crear servicio de gestión de sesión:
   - Detectar token expirado
   - Cerrar sesión automáticamente
   - Renovar token antes de expirar (opcional)
4. ⏳ Mejorar interceptor de Axios para manejar 401

---

## 🎯 Beneficios del Sistema

✅ **Seguridad:**
- Protección contra ataques de fuerza bruta
- Bloqueo automático de cuentas comprometidas
- Auditoría completa de accesos

✅ **Trazabilidad:**
- Registro de cada intento de login
- Metadata completa para investigación
- Historial de accesos por usuario

✅ **Experiencia de Usuario:**
- Mensajes claros sobre el estado de la cuenta
- Información de intentos restantes
- Desbloqueo automático (no requiere admin)

✅ **Escalabilidad:**
- Multi-tenant (múltiples negocios)
- Control de roles y permisos
- Sesiones seguras con JWT

---

## 🔖 Versión
**2.5.B12** - 27 de Noviembre de 2025

## 📅 Estado
✅ **Backend**: Completado
⏳ **Frontend**: En progreso
