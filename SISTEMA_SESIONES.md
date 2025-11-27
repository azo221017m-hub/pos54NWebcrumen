# Sistema de Gestión de Sesiones JWT

## 📋 Resumen

Sistema completo de gestión de sesiones con JWT que incluye:
- ✅ Validación automática de tokens
- ✅ Auto-logout en expiración
- ✅ Interceptores axios para errores 401/403
- ✅ Monitoreo continuo de sesión
- ✅ Notificaciones de expiración
- ✅ Soporte para refresh token (opcional)

---

## 🏗️ Arquitectura

### Componentes Principales

```
Frontend Session Management
│
├── sessionService.ts (Core)
│   ├── Token Validation
│   ├── Expiration Checking
│   ├── Auto Logout
│   ├── Session Monitoring
│   └── Refresh Token (Opcional)
│
├── api.ts (HTTP Client)
│   ├── Request Interceptor (Add Token)
│   └── Response Interceptor (Handle 401/403)
│
└── App.tsx (Application Root)
    ├── Initialize Session Monitoring
    ├── Display Logout Messages
    └── Handle Session Warnings
```

---

## 📦 Archivo: `src/services/sessionService.ts`

### Constantes de Configuración

```typescript
const TOKEN_KEY = 'token';
const USUARIO_KEY = 'usuario';
const CHECK_INTERVAL_MS = 60000;      // Verificar cada 1 minuto
const WARNING_TIME_MS = 300000;       // Advertir 5 minutos antes
```

### Tipos TypeScript

```typescript
interface JWTPayload {
  id: number;
  alias: string;
  nombre: string;
  idNegocio: number;
  idRol: number;
  iat: number;  // Timestamp de creación
  exp: number;  // Timestamp de expiración
}
```

### Funciones Principales

#### 1. **Validación de Token**

```typescript
// Decodificar token JWT
decodeToken(token: string): JWTPayload | null

// Verificar si token está expirado
isTokenExpired(token: string): boolean

// Obtener tiempo restante hasta expiración
getTimeUntilExpiration(token: string): number

// Verificar si token expirará pronto
isTokenExpiringSoon(token: string): boolean

// Validar sesión actual
validateSession(): JWTPayload | null
```

#### 2. **Gestión de Sesión**

```typescript
// Limpiar sesión (borrar token y datos)
clearSession(): void

// Logout automático con redirección
autoLogout(redirectUrl?: string, message?: string): void

// Obtener mensaje de logout
getLogoutMessage(): string | null
```

#### 3. **Monitoreo de Sesión**

```typescript
// Verificar expiración periódicamente
checkTokenExpiration(
  onExpired: () => void,
  onExpiringSoon?: (minutesRemaining: number) => void
): ReturnType<typeof setInterval>

// Inicializar monitoreo completo
initSessionMonitoring(
  onExpired?: () => void,
  onExpiringSoon?: (minutesRemaining: number) => void
): () => void
```

#### 4. **Autorización**

```typescript
// Verificar si usuario tiene un rol específico
hasRole(requiredRolId: number): boolean

// Verificar si usuario pertenece a un negocio
belongsToNegocio(negocioId: number): boolean

// Obtener datos completos del usuario
getUsuarioData(): Record<string, unknown> | null
```

#### 5. **Refresh Token (Opcional)**

```typescript
// Renovar token llamando al backend
refreshToken(apiUrl: string): Promise<boolean>

// Auto-renovar antes de expiración
setupAutoRefresh(apiUrl: string): () => void
```

---

## 🔧 Archivo: `src/services/api.ts`

### Interceptor de Requests

```typescript
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

### Interceptor de Responses

```typescript
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // 401 Unauthorized: Token expirado o inválido
    if (error.response?.status === 401) {
      autoLogout('/login', 'Tu sesión ha expirado o es inválida.');
      return Promise.reject(error);
    }
    
    // 403 Forbidden: Sin permisos (no hacer logout)
    if (error.response?.status === 403) {
      console.error('Acceso denegado');
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);
```

---

## 🚀 Integración en App.tsx

```typescript
import { useEffect, useState } from 'react';
import { initSessionMonitoring, getLogoutMessage } from './services/sessionService';

function App() {
  // Obtener mensaje de logout si existe
  const [logoutMessage, setLogoutMessage] = useState<string | null>(() => {
    return getLogoutMessage();
  });

  // Auto-limpiar mensaje después de 5 segundos
  useEffect(() => {
    if (logoutMessage) {
      const timeout = setTimeout(() => setLogoutMessage(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [logoutMessage]);

  // Inicializar monitoreo de sesión
  useEffect(() => {
    const cleanup = initSessionMonitoring(
      undefined, // Usar autoLogout por defecto
      (minutesRemaining) => {
        // Advertir cuando queden 5 minutos o menos
        if (minutesRemaining <= 5) {
          console.warn(`Tu sesión expirará en ${minutesRemaining} minuto(s)`);
        }
      }
    );

    return cleanup;
  }, []);

  return (
    <>
      {logoutMessage && (
        <div className="logout-notification">
          {logoutMessage}
        </div>
      )}
      <AppRouter />
    </>
  );
}
```

---

## 📊 Flujo de Sesión

### 1. Login Exitoso
```
Usuario → LoginPage → Backend (/api/auth/login)
                         ↓
                    JWT Token generado
                         ↓
                localStorage.setItem('token', token)
                         ↓
                    Redirect a /dashboard
                         ↓
                App.tsx inicia monitoreo
```

### 2. Request Autenticado
```
Componente → apiClient.get('/data')
                  ↓
        Request Interceptor
                  ↓
        Añade header: Authorization: Bearer {token}
                  ↓
        Envía a Backend
                  ↓
        Backend valida JWT (auth.middleware)
                  ↓
        Response → Componente
```

### 3. Token Expirado (401)
```
apiClient.get('/data')
     ↓
Backend responde 401
     ↓
Response Interceptor detecta 401
     ↓
autoLogout() ejecutado
     ↓
clearSession() → localStorage limpio
     ↓
sessionStorage.setItem('logoutMessage', 'Tu sesión ha expirado')
     ↓
window.location.href = '/login'
     ↓
App.tsx muestra mensaje de logout
```

### 4. Monitoreo Automático
```
App.tsx monta
     ↓
initSessionMonitoring() inicia
     ↓
setInterval cada 1 minuto
     ↓
Verificar: isTokenExpired()
     ↓
Si expirará pronto (< 5 min): onExpiringSoon callback
     ↓
Si expiró: autoLogout()
```

---

## ⚙️ Configuración

### Variables de Entorno

```env
VITE_API_URL=http://localhost:3000
```

### Constantes Modificables

En `sessionService.ts`:
```typescript
const CHECK_INTERVAL_MS = 60000;      // Frecuencia de verificación
const WARNING_TIME_MS = 300000;       // Tiempo de advertencia (5 min)
```

En `backend/src/middlewares/auth.ts`:
```typescript
const expiresIn = '8h';  // Expiración del token JWT
```

---

## 🔐 Seguridad

### Almacenamiento de Token
- ✅ Almacenado en `localStorage` (persistente entre sesiones)
- ⚠️ Alternativa más segura: `httpOnly cookies` (requiere cambios en backend)

### Validación Multi-Nivel
1. **Frontend**: Decodificación y verificación de expiración
2. **Backend**: Verificación completa con secret key
3. **Database**: Validación de estado activo del usuario

### Protección CSRF
- ✅ Tokens JWT son stateless (no requieren CSRF token)
- ✅ Backend valida origen con CORS

---

## 🧪 Pruebas de Funcionalidad

### 1. Prueba de Expiración Manual
```typescript
// En consola del navegador:
localStorage.setItem('token', 'invalid_token');
// Hacer cualquier request → Debe hacer auto-logout
```

### 2. Prueba de Monitoreo
```typescript
// En consola del navegador:
// Observar logs cada 1 minuto verificando sesión
```

### 3. Prueba de 403 (Sin Permisos)
```typescript
// Intentar acceder a ruta protegida sin rol adecuado
// No debe hacer logout, solo mostrar error
```

---

## 📈 Mejoras Futuras

### 1. Refresh Token
Implementar endpoint `/api/auth/refresh` en backend:
```typescript
// Backend
POST /api/auth/refresh
Authorization: Bearer {current_token}
→ Respuesta: { token: new_jwt_token }

// Frontend (ya implementado en sessionService.ts)
setupAutoRefresh(apiUrl); // Renovar automáticamente
```

### 2. Notificaciones Toast
Integrar librería como `react-toastify`:
```typescript
import { toast } from 'react-toastify';

const cleanup = initSessionMonitoring(
  undefined,
  (minutesRemaining) => {
    toast.warning(`Tu sesión expirará en ${minutesRemaining} minutos`);
  }
);
```

### 3. Modal de Extensión de Sesión
Mostrar modal cuando falten 5 minutos:
```typescript
const [showExtendModal, setShowExtendModal] = useState(false);

const cleanup = initSessionMonitoring(
  undefined,
  (minutesRemaining) => {
    if (minutesRemaining === 5) {
      setShowExtendModal(true);
    }
  }
);
```

### 4. Logout en Múltiples Tabs
Usar `BroadcastChannel` API:
```typescript
const logoutChannel = new BroadcastChannel('logout');

logoutChannel.onmessage = (event) => {
  if (event.data === 'logout') {
    autoLogout('/login', 'Sesión cerrada en otra pestaña');
  }
};

// Al hacer logout:
logoutChannel.postMessage('logout');
```

---

## 🐛 Debugging

### Logs Útiles

```typescript
// Ver token decodificado
import { decodeToken } from './services/sessionService';
console.log(decodeToken(localStorage.getItem('token')));

// Ver tiempo restante
import { getTimeUntilExpiration, formatTimeRemaining } from './services/sessionService';
const token = localStorage.getItem('token');
const timeMs = getTimeUntilExpiration(token);
console.log('Tiempo restante:', formatTimeRemaining(timeMs));

// Verificar sesión
import { validateSession } from './services/sessionService';
console.log('Sesión válida:', validateSession());
```

---

## 📚 Dependencias

```json
{
  "dependencies": {
    "axios": "^1.7.9",
    "jwt-decode": "^4.0.0",  // ← Nueva dependencia instalada
    "react": "^19.0.0",
    "react-router-dom": "^7.1.1"
  }
}
```

Instalar:
```bash
npm install jwt-decode
```

---

## ✅ Estado de Implementación

- [x] sessionService.ts creado con todas las funciones
- [x] Integración en api.ts con interceptores
- [x] Integración en App.tsx con monitoreo automático
- [x] Manejo de mensajes de logout
- [x] Animaciones CSS para notificaciones
- [x] Validación de roles y negocios
- [x] Funciones de refresh token (opcionales)
- [x] TypeScript sin errores
- [x] Documentación completa

---

## 🎯 Próximos Pasos Sugeridos

1. **Probar en desarrollo**: Hacer login y verificar logs de consola cada minuto
2. **Simular expiración**: Modificar `expiresIn` en backend a `'1m'` y probar auto-logout
3. **Implementar refresh token**: Crear endpoint en backend y habilitar `setupAutoRefresh()`
4. **Añadir notificaciones visuales**: Integrar toast o modal para advertencias de expiración
5. **Sincronizar tabs**: Implementar BroadcastChannel para logout multi-tab
6. **Migrar a httpOnly cookies**: Mayor seguridad (requiere refactor de auth en backend)

---

## 📞 Soporte

Sistema desarrollado para: **pos54nwebcrumen v2.5.B12**

Última actualización: 2025-01-22

---
