# ⏱️ Sistema de Sesión con Temporizador

## 📋 Descripción

Se ha implementado un sistema de gestión de sesiones con temporizador visible en el Dashboard. La sesión tiene una duración de **10 segundos** y al expirar, se realiza un logout automático.

---

## ✨ Características Implementadas

### 1. **Contador de Sesión Visible**
- ⏱️ Contador en tiempo real en el navbar del Dashboard
- 🎨 Diseño con gradiente morado (normal)
- ⚠️ Cambia a rojo cuando quedan 5 segundos o menos
- 💫 Animación de pulso que aumenta cuando quedan pocos segundos

### 2. **Logout Automático**
- 🔒 Sesión expira automáticamente después de 10 segundos
- 🚪 Redirección automática al login
- 🗑️ Limpieza de token y datos del usuario
- 📢 Banner de notificación de sesión expirada

### 3. **Experiencia de Usuario**
- ⏲️ Contador descendente desde 10s hasta 0s
- 🔴 Alerta visual cuando quedan ≤5 segundos
- 📢 Mensaje de sesión expirada antes de redirigir
- 🔄 Transición suave al login

---

## 🎨 Elementos Visuales

### Contador de Sesión (Normal)
```
┌─────────────┐
│ 🕐 10s      │  ← Gradiente morado
└─────────────┘
```

### Contador de Sesión (Advertencia)
```
┌─────────────┐
│ 🕐 5s       │  ← Gradiente rojo con pulso rápido
└─────────────┘
```

### Banner de Sesión Expirada
```
╔═══════════════════════════════════╗
║ ⚠️  Sesión Expirada               ║
║                                   ║
║ Tu sesión ha finalizado.          ║
║ Serás redirigido al login...     ║
╚═══════════════════════════════════╝
```

---

## 🔧 Implementación Técnica

### Archivo: `DashboardPage.tsx`

```typescript
// Estados
const [timeRemaining, setTimeRemaining] = useState(10); // 10 segundos
const [sessionExpired, setSessionExpired] = useState(false);

// Contador de sesión
useEffect(() => {
  const timer = setInterval(() => {
    setTimeRemaining((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        setSessionExpired(true);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [usuario, navigate]);

// Logout automático al expirar
useEffect(() => {
  if (sessionExpired) {
    const timeout = setTimeout(() => {
      handleLogout();
    }, 1000);

    return () => clearTimeout(timeout);
  }
}, [sessionExpired, handleLogout]);
```

### Archivo: `DashboardPage.css`

```css
.session-timer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  font-weight: 700;
  animation: pulse-slow 2s ease-in-out infinite;
}

.session-timer.warning {
  background: linear-gradient(135deg, #f56565 0%, #c53030 100%);
  animation: pulse-fast 0.5s ease-in-out infinite;
}
```

---

## 📊 Flujo de Sesión

```
┌──────────────┐
│ Login        │
│ Exitoso      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Dashboard    │
│ Carga        │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Contador:    │
│ 10s → 9s     │
│ → 8s → ...   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Tiempo ≤5s   │
│ Alerta Roja  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Tiempo = 0s  │
│ Sesión       │
│ Expirada     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Mostrar      │
│ Banner       │
│ (1 segundo)  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Logout       │
│ Automático   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Redirect     │
│ → /login     │
└──────────────┘
```

---

## ⚙️ Configuración

### Cambiar Duración de la Sesión

Para modificar el tiempo de sesión, edita el valor inicial en `DashboardPage.tsx`:

```typescript
// Cambiar de 10 segundos a otro valor
const [timeRemaining, setTimeRemaining] = useState(10); // ← Cambiar aquí

// Ejemplos:
// 30 segundos: useState(30)
// 1 minuto: useState(60)
// 5 minutos: useState(300)
```

### Cambiar Tiempo de Advertencia

Para modificar cuándo aparece la alerta roja, edita la condición:

```typescript
// En el JSX del contador
className={`session-timer ${timeRemaining <= 5 ? 'warning' : ''}`}
//                                           ↑
//                                    Cambiar este valor
```

### Cambiar Tiempo del Banner

Para modificar cuánto tiempo se muestra el banner antes del logout:

```typescript
useEffect(() => {
  if (sessionExpired) {
    const timeout = setTimeout(() => {
      handleLogout();
    }, 1000); // ← Cambiar aquí (en milisegundos)
    //   ↑
    //   1000ms = 1 segundo
```

---

## 🎯 Casos de Uso

### Desarrollo/Testing
```typescript
const [timeRemaining, setTimeRemaining] = useState(10); // 10 segundos
```

### Demo/Presentación
```typescript
const [timeRemaining, setTimeRemaining] = useState(30); // 30 segundos
```

### Producción/Real
```typescript
const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutos
```

---

## 🔒 Funciones de Seguridad

### 1. **Limpieza Completa al Logout**
```typescript
const handleLogout = useCallback(() => {
  localStorage.removeItem('token');      // Elimina token JWT
  localStorage.removeItem('usuario');    // Elimina datos del usuario
  navigate('/login');                    // Redirige al login
}, [navigate]);
```

### 2. **Verificación al Cargar**
```typescript
useEffect(() => {
  if (!usuario) {
    navigate('/login');  // Si no hay usuario, redirige
    return;
  }
  // ... resto del código
}, [usuario, navigate]);
```

### 3. **Limpieza de Timers**
```typescript
return () => clearInterval(timer);  // Limpia el intervalo al desmontar
return () => clearTimeout(timeout); // Limpia el timeout al desmontar
```

---

## 🐛 Troubleshooting

### El contador no aparece
**Solución**: Verifica que hayas iniciado sesión correctamente y que `usuario` no sea null.

### El logout no ocurre automáticamente
**Solución**: Verifica que no haya errores en la consola del navegador. El useEffect debe ejecutarse correctamente.

### El contador se reinicia inesperadamente
**Solución**: Asegúrate de que las dependencias del useEffect estén correctamente definidas.

### El contador va muy rápido/lento
**Solución**: Verifica que el intervalo esté configurado en 1000ms (1 segundo).

---

## 📈 Mejoras Futuras

- [ ] Agregar opción para extender sesión
- [ ] Mostrar advertencia a los 30 segundos
- [ ] Persistir tiempo de sesión en localStorage
- [ ] Agregar pausa del contador en modales
- [ ] Implementar "Cerrar otras sesiones"
- [ ] Agregar sonido de alerta
- [ ] Mostrar tiempo en formato MM:SS para sesiones largas

---

## 🧪 Testing

### Test Manual

1. **Iniciar sesión**:
   - Ir a http://localhost:5173
   - Login con usuario válido
   - Verificar que el contador aparece en 10s

2. **Observar contador**:
   - Verificar que disminuye cada segundo
   - Confirmar que cambia a rojo en 5s

3. **Esperar expiración**:
   - Esperar a que llegue a 0s
   - Verificar banner de sesión expirada
   - Confirmar redirección al login

4. **Verificar limpieza**:
   - Abrir DevTools → Application → Local Storage
   - Confirmar que token y usuario fueron eliminados

### Test con cURL (Backend)

```bash
# Obtener token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin","password":"admin123"}' | jq -r '.data.token')

# Usar token (debe funcionar)
curl -X GET http://localhost:3000/api/productos \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 Notas

- ⏱️ El tiempo de sesión actual es de **10 segundos** para fines de demostración
- 🚀 En producción, se recomienda aumentar a **15-30 minutos**
- 🔐 El token JWT tiene su propia expiración (24 horas)
- 💡 El contador es solo visual, el token JWT sigue siendo válido después
- 🎨 Los colores y animaciones son personalizables en el CSS

---

## 🔗 Archivos Relacionados

- `frontend/src/pages/DashboardPage.tsx` - Lógica del contador
- `frontend/src/pages/DashboardPage.css` - Estilos del contador
- `backend/src/controllers/auth.controller.ts` - Autenticación
- `AUTHENTICATION_GUIDE.md` - Guía de autenticación completa
