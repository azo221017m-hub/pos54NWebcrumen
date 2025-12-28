# Plan de Pruebas - Gestión de Sesiones y Versión

## Objetivo
Verificar que todas las funcionalidades implementadas funcionen correctamente según los requisitos.

## Requisitos Implementados

1. ✅ Actualizar versión en LoginPage a "Ver 25.27.2210"
2. ✅ Expirar sesión al recargar la página
3. ✅ Expirar sesión al hacer logout
4. ✅ Resetear tiempo de expiración con actividad (clicks, navegación)
5. ✅ Filtrar usuarios por idNegocio

---

## Pruebas Detalladas

### Test 1: Verificación de Versión
**Objetivo:** Confirmar que la versión mostrada es correcta

**Pasos:**
1. Abrir navegador
2. Navegar a la página de login
3. Observar el footer de la página de login

**Resultado Esperado:**
- Se debe mostrar "Ver 25.27.2210" en el footer

**Estado:** ✅ Implementado

---

### Test 2: Expiración de Sesión al Recargar Página
**Objetivo:** Verificar que la sesión se limpia al recargar la página

**Pre-requisitos:**
- Usuario con credenciales válidas
- Navegador con DevTools abierto

**Pasos:**
1. Hacer login con credenciales válidas
2. Verificar que se redirige al dashboard
3. Abrir DevTools → Application → Local Storage
4. Verificar que existe 'token' y 'usuario' en localStorage
5. Presionar F5 o hacer click en el botón de recargar
6. Observar el comportamiento

**Resultado Esperado:**
- Al recargar la página, debe:
  - Limpiar localStorage (eliminar 'token' y 'usuario')
  - Redirigir a la página de login
  - Mostrar el formulario de login vacío

**Código responsable:**
```javascript
// src/services/sessionService.ts - setupSessionClearOnReload()
window.addEventListener('beforeunload', () => {
  if (token && window.location.pathname !== '/login') {
    clearSession();
  }
});
```

**Estado:** ✅ Implementado

---

### Test 3: Expiración de Sesión al Hacer Logout
**Objetivo:** Verificar que el logout limpia correctamente la sesión

**Pre-requisitos:**
- Usuario autenticado en el sistema

**Pasos:**
1. Hacer login con credenciales válidas
2. Navegar al dashboard
3. Abrir DevTools → Application → Local Storage
4. Verificar contenido de localStorage (debe tener 'token' y 'usuario')
5. Click en el ícono de usuario (esquina superior derecha)
6. Click en "Cerrar Sesión"
7. Verificar localStorage nuevamente

**Resultado Esperado:**
- Al hacer logout, debe:
  - Eliminar 'token' de localStorage
  - Eliminar 'usuario' de localStorage
  - Redirigir a `/login`
  - No debe haber forma de volver al dashboard sin volver a autenticarse

**Estado:** ✅ Implementado

---

### Test 4: Renovación de Token por Actividad
**Objetivo:** Verificar que el token se renueva automáticamente cuando hay actividad

**Pre-requisitos:**
- Usuario autenticado
- DevTools abierto en pestaña Network

**Escenario A: Renovación por Clicks**

**Pasos:**
1. Hacer login
2. Abrir DevTools → Network → filtrar por "refresh"
3. Esperar aproximadamente 5 minutos (sin interactuar)
4. Hacer click en cualquier parte de la aplicación
5. Observar el panel Network

**Resultado Esperado:**
- Debe aparecer una llamada POST a `/api/auth/refresh`
- Response debe ser: `{ success: true, data: { token: "nuevo_token_jwt" } }`
- El token en localStorage debe actualizarse
- La sesión NO debe expirar

**Escenario B: Renovación por Navegación**

**Pasos:**
1. Hacer login
2. Permanecer en el dashboard por ~5 minutos
3. Navegar a "Configuración" → "Usuarios"
4. Observar DevTools → Network

**Resultado Esperado:**
- Debe llamar a `/api/auth/refresh` antes o durante la navegación
- Token se renueva exitosamente
- Página carga sin problemas

**Escenario C: Sin Renovación Cuando No Es Necesario**

**Pasos:**
1. Hacer login (token nuevo con 10 minutos)
2. Inmediatamente hacer click varias veces
3. Observar DevTools → Network

**Resultado Esperado:**
- NO debe llamar a `/api/auth/refresh`
- Solo renueva si quedan < 5 minutos
- Evita llamadas innecesarias

**Configuración:**
```javascript
const REFRESH_THRESHOLD_MS = 300000; // 5 minutos
const MIN_REFRESH_INTERVAL_MS = 60000; // 1 minuto
```

**Estado:** ✅ Implementado

---

### Test 5: Expiración Natural del Token
**Objetivo:** Verificar que la sesión expira después de 10 minutos SIN actividad

**Pasos:**
1. Hacer login
2. Abrir DevTools → Console
3. NO interactuar con la aplicación por 10 minutos
4. Observar el comportamiento

**Resultado Esperado:**
- A los 10 minutos (sin actividad), debe:
  - Limpiar la sesión automáticamente
  - Redirigir a `/login`
  - Mostrar mensaje opcional "Sesión expirada"
  - Console debe mostrar: `⚠️ Tu sesión expirará en X minuto(s)`

**Nota:** Este test toma tiempo. Para acelerar:
- Modificar temporalmente `expiresIn: '1m'` en backend
- O usar Mock para simular token expirado

**Estado:** ✅ Implementado (mecanismo existente)

---

### Test 6: Filtrado de Usuarios por idNegocio
**Objetivo:** Verificar que los usuarios solo ven registros de su negocio

**Pre-requisitos:**
- Base de datos con múltiples usuarios de diferentes negocios
- Usuario de prueba con `idNegocio = 1`
- Usuario de prueba con `idNegocio = 2`
- Superusuario con `idNegocio = 99999`

**Escenario A: Usuario de Negocio Específico**

**Pasos:**
1. Hacer login con usuario `idNegocio = 1`
2. Navegar a "Configuración" → "Usuarios"
3. Observar la lista de usuarios mostrada
4. Verificar en DevTools → Network → Response de `/api/usuarios`

**Resultado Esperado:**
- Solo debe mostrar usuarios con `idNegocio = 1`
- No debe mostrar usuarios de otros negocios
- Backend filtra automáticamente por `idNegocio`

**Escenario B: Superusuario (idNegocio = 99999)**

**Pasos:**
1. Hacer logout
2. Hacer login con usuario `Crumen` (superusuario)
3. Navegar a "Configuración" → "Usuarios"
4. Observar la lista completa

**Resultado Esperado:**
- Debe mostrar **TODOS** los usuarios de todos los negocios
- No debe aplicar filtro cuando `idNegocio = 99999`
- Útil para administración global

**Verificación en Backend:**
```typescript
if (idnegocio !== 99999) {
  query += ` WHERE idNegocio = ?`;
  params.push(idnegocio);
}
```

**Estado:** ✅ Ya implementado correctamente

---

## Tests de Integración

### Test I1: Flujo Completo de Sesión Activa
**Pasos:**
1. Login → Dashboard
2. Navegar a diferentes páginas cada ~2-3 minutos
3. Hacer clicks en menús
4. Mantener actividad por 15 minutos

**Resultado Esperado:**
- Token se renueva automáticamente
- Sesión permanece activa
- No se pierde el progreso

### Test I2: Flujo Completo de Sesión Inactiva
**Pasos:**
1. Login → Dashboard
2. Abrir la aplicación
3. Dejar inactiva por 10+ minutos
4. Intentar interactuar

**Resultado Esperado:**
- Sesión expira
- Auto-logout
- Redirige a login

---

## Checklist de Validación Final

### Pre-deployment:
- [ ] Frontend build sin errores
- [ ] Backend build sin errores
- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET configurado en backend
- [ ] VITE_API_URL configurado en frontend

### Funcionalidades:
- [ ] Versión "Ver 25.27.2210" visible en login
- [ ] Sesión se limpia al recargar página
- [ ] Sesión se limpia al hacer logout
- [ ] Token se renueva con actividad (clicks/navegación)
- [ ] Usuarios filtrados correctamente por idNegocio
- [ ] Superusuario (99999) ve todos los usuarios

### Seguridad:
- [ ] Token se valida en cada request
- [ ] Token expirado rechaza requests
- [ ] No se puede acceder a rutas protegidas sin token
- [ ] Refresh token solo funciona con token válido
- [ ] Usuario inactivo no puede renovar token

---

## Herramientas de Testing

### Manual Testing:
1. **Chrome DevTools**
   - Network: Monitorear llamadas API
   - Application → Local Storage: Ver token/usuario
   - Console: Ver logs de sesión

2. **Postman**
   - Probar endpoint `/api/auth/refresh` directamente
   - Verificar responses con tokens válidos/expirados

### Automatizado (Opcional):
1. **Playwright/Cypress**
   - Automatizar flujos de login/logout
   - Simular inactividad
   - Verificar redirecciones

2. **Jest**
   - Unit tests para `sessionService`
   - Unit tests para `activityRefreshService`

---

## Problemas Conocidos y Soluciones

### Problema: beforeunload no limpia en ciertos navegadores
**Solución:** Usar también `visibilitychange` y `pagehide` events

### Problema: Token renueva demasiado frecuentemente
**Solución:** Ajustar `MIN_REFRESH_INTERVAL_MS` y `REFRESH_THRESHOLD_MS`

### Problema: Usuario pierde progreso al recargar
**Solución:** Diseño intencional por requisitos. Alternativa: guardar estado en sessionStorage (no localStorage)

---

## Reportar Issues

Si encuentra problemas durante las pruebas:

1. **Capturar información:**
   - Screenshot del error
   - DevTools Console logs
   - DevTools Network logs
   - Pasos para reproducir

2. **Información del sistema:**
   - Navegador y versión
   - Sistema operativo
   - Versión de la aplicación

3. **Reportar a:**
   - GitHub Issues
   - O canal de desarrollo del equipo

---

## Conclusión

Este plan de pruebas cubre todos los requisitos implementados. Ejecutar estos tests garantizará que el sistema funcione correctamente en producción.

**Tiempo estimado de testing:** 30-45 minutos (tests manuales completos)
