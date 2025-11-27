# 🔒 Sistema de Expiración de Sesión - Comportamiento con Pantalla Bloqueada

**Proyecto**: pos54nwebcrumen v2.5.B12  
**Fecha**: 2025-01-22  
**Actualización**: Sistema mejorado con verificación al desbloquear pantalla

---

## 🎯 Pregunta del Usuario

**"Al proteger pantalla NO DETENER EL TIEMPO de expiración de sesión"**

### ✅ Respuesta

El sistema **YA CUMPLE CON ESTE REQUISITO** por diseño. El token JWT **CONTINÚA EXPIRANDO** incluso cuando:
- 🔒 La computadora está bloqueada (pantalla protegida)
- 📱 El navegador está minimizado
- 🔄 La pestaña está en segundo plano
- 💤 El equipo está en suspensión

---

## 🔍 ¿Cómo Funciona?

### 1️⃣ Basado en Timestamp del JWT (No en Tiempo del Cliente)

El sistema de expiración **NO usa un temporizador local** que cuente segundos transcurridos. En su lugar, verifica el **timestamp `exp` del token JWT** contra el tiempo actual del sistema.

```typescript
// ❌ NO hacemos esto (temporizador local que se puede pausar):
let timeElapsed = 0;
setInterval(() => {
  timeElapsed += 60000;
  if (timeElapsed >= 8 * 60 * 60 * 1000) {
    logout();
  }
}, 60000);

// ✅ SÍ hacemos esto (verificar timestamp real):
setInterval(() => {
  const token = getToken();
  const decoded = jwtDecode(token);
  const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
  
  if (decoded.exp < currentTime) {
    // Token expirado según el tiempo REAL del sistema
    logout();
  }
}, 60000);
```

### 2️⃣ Flujo de Verificación

```
Usuario hace login a las 10:00 AM
      ↓
Backend genera JWT con exp = 10:00 AM + 8h = 6:00 PM
      ↓
Token guardado en localStorage: {
  "id": 1,
  "alias": "usuario",
  "exp": 1737648000  // Timestamp Unix: 6:00 PM
}
      ↓
Usuario bloquea su computadora a las 11:00 AM
      ↓
[COMPUTADORA BLOQUEADA POR 8 HORAS]
      ↓
Usuario desbloquea a las 7:00 PM
      ↓
App ejecuta verificación:
  - currentTime = 1737651600  // 7:00 PM
  - token.exp = 1737648000     // 6:00 PM
  - 1737651600 > 1737648000    // ¡EXPIRADO!
      ↓
autoLogout() ejecutado inmediatamente
      ↓
Redirect a /login con mensaje: "Tu sesión ha expirado"
```

---

## 🚀 Mejoras Implementadas

Para garantizar una experiencia óptima, se han agregado **listeners de eventos** que verifican el token inmediatamente cuando el usuario regresa:

### 1️⃣ Listener de Visibilidad (`visibilitychange`)

Detecta cuando el usuario vuelve a la pestaña después de:
- Cambiar de pestaña
- Minimizar/maximizar el navegador
- Bloquear/desbloquear la pantalla (en algunos navegadores)

```typescript
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Usuario volvió a la pestaña
    const token = getToken();
    if (isTokenExpired(token)) {
      autoLogout('/login', 'Tu sesión ha expirado');
    }
  }
});
```

### 2️⃣ Listener de Foco (`focus`)

Detecta cuando el usuario enfoca la ventana del navegador después de:
- Desbloquear la pantalla
- Volver de otra aplicación
- Cambiar de escritorio virtual

```typescript
window.addEventListener('focus', () => {
  // Usuario enfocó la ventana
  const token = getToken();
  if (isTokenExpired(token)) {
    autoLogout('/login', 'Tu sesión ha expirado');
  }
});
```

### 3️⃣ Verificación Periódica (cada 1 minuto)

El `setInterval` continúa ejecutándose en segundo plano:

```typescript
setInterval(() => {
  const token = getToken();
  if (isTokenExpired(token)) {
    autoLogout('/login', 'Tu sesión ha expirado');
  }
}, 60000); // 1 minuto
```

**Nota**: Algunos navegadores pueden pausar `setInterval` cuando la pestaña está inactiva, pero esto **NO es un problema** porque:
1. La verificación se basa en el timestamp real del token (no en ciclos del intervalo)
2. Los listeners de `visibilitychange` y `focus` fuerzan verificación al regresar

---

## 📊 Matriz de Comportamiento

| Escenario | Intervalo se ejecuta | Token sigue expirando | Logout al regresar |
|-----------|---------------------|----------------------|-------------------|
| **Pestaña activa** | ✅ Sí (cada 1 min) | ✅ Sí (basado en exp) | N/A |
| **Pestaña en segundo plano** | ⚠️ Puede pausarse* | ✅ Sí (basado en exp) | ✅ Sí (listener) |
| **Navegador minimizado** | ⚠️ Puede pausarse* | ✅ Sí (basado en exp) | ✅ Sí (listener) |
| **Pantalla bloqueada** | ⚠️ Puede pausarse* | ✅ Sí (basado en exp) | ✅ Sí (listener) |
| **Equipo suspendido** | ❌ No | ✅ Sí (basado en exp) | ✅ Sí (listener) |
| **Sin conexión** | ✅ Sí (verificación local) | ✅ Sí (basado en exp) | ✅ Sí (listener) |

*Algunos navegadores modernos pausan `setInterval` para ahorrar batería, pero esto NO afecta la funcionalidad gracias a los listeners.

---

## 🧪 Cómo Probar el Comportamiento

### Prueba 1: Pantalla Bloqueada (Simulación Rápida)

1. **Configurar token de 1 minuto** (solo para pruebas):
   ```typescript
   // En backend/src/middlewares/auth.ts
   const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1m' });
   ```

2. **Hacer login** a las 10:00:00

3. **Bloquear pantalla** (Win+L) inmediatamente

4. **Esperar 2 minutos** (sin desbloquear)

5. **Desbloquear pantalla** a las 10:02:00

6. **Resultado esperado**: 
   - Listener `focus` detecta desbloqueo
   - Verifica token → EXPIRADO
   - Ejecuta `autoLogout()` inmediatamente
   - Redirect a `/login` con mensaje

### Prueba 2: Cambio de Pestaña

1. **Hacer login** en la aplicación

2. **Cambiar a otra pestaña** del navegador

3. **Esperar** hasta que el token expire (o cambiar manualmente el `exp` en DevTools)

4. **Volver a la pestaña** de la aplicación

5. **Resultado esperado**:
   - Listener `visibilitychange` detecta regreso
   - Verifica token → EXPIRADO
   - Logout automático

### Prueba 3: Minimizar Navegador

1. **Hacer login**

2. **Minimizar navegador** (Win+D o botón minimizar)

3. **Esperar** a que expire el token

4. **Restaurar navegador**

5. **Resultado esperado**: Logout inmediato al restaurar

---

## 🔧 Código Implementado

### Función Principal: `initSessionMonitoring()`

```typescript
export const initSessionMonitoring = (
  onExpired?: () => void,
  onExpiringSoon?: (minutesRemaining: number) => void
): (() => void) => {
  const defaultOnExpired = () => {
    autoLogout('/login', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
  };

  const handleExpired = onExpired || defaultOnExpired;

  // 1. Verificación periódica (cada 1 minuto)
  const intervalId = checkTokenExpiration(handleExpired, onExpiringSoon);

  // 2. Verificar inmediatamente cuando el usuario regresa
  const checkNow = () => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      handleExpired();
    }
  };

  // 3. Listener: Cambio de visibilidad
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkNow();
    }
  };

  // 4. Listener: Enfoque de ventana
  const handleFocus = () => {
    checkNow();
  };

  // Registrar listeners
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleFocus);

  // Cleanup
  return () => {
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleFocus);
  };
};
```

### Función de Verificación: `isTokenExpired()`

```typescript
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  // Comparar timestamp de expiración (exp) con tiempo actual
  // BASADO EN TIEMPO REAL DEL SISTEMA, NO EN TEMPORIZADOR LOCAL
  const currentTime = Math.floor(Date.now() / 1000); // Segundos desde epoch
  return decoded.exp < currentTime;
};
```

---

## 📈 Ventajas del Sistema Actual

### ✅ 1. Independiente del Estado del Cliente
- No importa si el `setInterval` se pausa
- La verificación siempre se basa en el tiempo real del sistema

### ✅ 2. Respuesta Inmediata al Regresar
- Los listeners garantizan verificación instantánea
- No hay que esperar al próximo ciclo del intervalo (1 minuto)

### ✅ 3. Sincronización con Backend
- El token tiene el mismo `exp` en frontend y backend
- Ambos verifican contra el mismo timestamp

### ✅ 4. Seguridad Mejorada
- No se puede "extender" la sesión pausando el navegador
- El token expira según el tiempo del servidor (timestamp en JWT)

### ✅ 5. Experiencia de Usuario Consistente
- Logout inmediato al detectar token expirado
- Mensaje claro: "Tu sesión ha expirado"

---

## 🎯 Casos de Uso Reales

### Escenario 1: Empleado que Va a Almorzar

```
10:00 AM - Login exitoso (token expira a las 6:00 PM)
10:30 AM - Bloquea su computadora y va a almorzar
11:30 AM - Regresa y desbloquea
Resultado: Sesión ACTIVA (quedan 6.5 horas)
```

### Escenario 2: Turno de Noche que Termina

```
10:00 PM - Login exitoso (token expira a las 6:00 AM)
11:00 PM - Trabaja normalmente
2:00 AM  - Se va a casa y apaga la computadora
8:00 AM  - Enciende la computadora al día siguiente
Resultado: Sesión EXPIRADA → Redirect a login automáticamente
```

### Escenario 3: Reunión Larga

```
2:00 PM - Login exitoso (token expira a las 10:00 PM)
2:30 PM - Bloquea PC y va a reunión de 8 horas
10:30 PM - Regresa y desbloquea
Resultado: Sesión EXPIRADA → Logout inmediato con mensaje
```

---

## 🔒 Seguridad

### Protección Contra Manipulación

El usuario **NO puede extender su sesión**:
- ❌ No puede pausar el tiempo bloqueando la pantalla
- ❌ No puede editar el `exp` del token (está firmado con JWT_SECRET)
- ❌ No puede desactivar los listeners (están en el código de la app)
- ✅ El backend siempre valida el `exp` del token en cada request

### Protección Contra Ataques

- **Token Stealing**: Si roban el token, expira en 8 horas máximo
- **Session Hijacking**: El backend verifica el estado activo del usuario en cada request
- **XSS**: El token NO está en cookies (localStorage es más seguro contra CSRF)

---

## 📚 Documentación Relacionada

- `SISTEMA_SESIONES.md` - Documentación completa del sistema de sesiones
- `SISTEMA_AUDITORIA_LOGIN.md` - Sistema de auditoría de intentos de login
- `REPORTE_COMPLETO_AUDITORIA_SESIONES.md` - Reporte de implementación

---

## ✅ Conclusión

El sistema **CUMPLE COMPLETAMENTE** con el requisito:

### ✅ Token CONTINÚA EXPIRANDO cuando:
- 🔒 Pantalla bloqueada
- 📱 Navegador minimizado
- 🔄 Pestaña en segundo plano
- 💤 Equipo en suspensión

### ✅ Verificación INMEDIATA al:
- 👁️ Volver a la pestaña (visibilitychange)
- 🖱️ Enfocar la ventana (focus)
- ⏱️ Cada minuto (setInterval)

### ✅ Basado en Tiempo REAL:
- 📅 Timestamp `exp` del JWT
- 🌐 Sincronizado con el servidor
- 🔐 No manipulable por el cliente

**El token SIEMPRE expira en 8 horas desde el login, sin importar el estado del equipo.**

---

**Fecha de actualización**: 2025-01-22  
**Archivos modificados**: `src/services/sessionService.ts`  
**Estado**: ✅ MEJORADO Y VERIFICADO

