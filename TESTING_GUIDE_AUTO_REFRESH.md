# Guía de Testing: Auto-Actualización de Dashboards

## 🎯 Objetivo del Testing

Verificar que los dashboards, indicadores y listas se actualicen automáticamente cuando la base de datos cambia, ya sea mediante:
1. Acciones del usuario actual (crear/actualizar)
2. Acciones de otros usuarios
3. Cambios directos en la base de datos

## 📋 Pre-requisitos

1. **Backend corriendo:** Puerto 3000 (o configurado en .env)
2. **Frontend corriendo:** `npm run dev`
3. **Base de datos:** Accesible y con datos de prueba
4. **Navegador:** Dos pestañas/ventanas abiertas (simular múltiples usuarios)
5. **Usuario autenticado:** Con turno abierto

## 🧪 Test Cases

### Test 1: Dashboard - Resumen de Ventas (30s polling)

#### Objetivo
Verificar que el resumen de ventas se actualice automáticamente

#### Pasos
1. Abrir DashboardPage
2. Anotar valores actuales:
   - Total de ventas
   - Cantidad de ventas
   - Promedio de venta
3. En otra pestaña o cliente MySQL:
   - Crear una nueva venta en la BD
   - O actualizar el monto de una venta existente
4. **Esperar 30 segundos (máximo)**
5. Verificar que el resumen de ventas se actualiza automáticamente

#### Resultado Esperado
✅ Los indicadores del dashboard muestran los nuevos valores sin refrescar la página

---

### Test 2: Dashboard - Salud del Negocio (45s polling)

#### Objetivo
Verificar que las métricas de salud del negocio se actualicen

#### Pasos
1. Abrir DashboardPage
2. Anotar métricas actuales de "Salud del Negocio"
3. Crear un nuevo gasto en PageGastos
4. **Esperar 45 segundos (máximo)**
5. Volver al dashboard
6. Verificar que las métricas se actualizaron

#### Resultado Esperado
✅ Las métricas de salud del negocio reflejan el nuevo gasto

---

### Test 3: Lista de Ventas (30s polling)

#### Objetivo
Verificar que la lista de ventas se actualice automáticamente

#### Pasos
1. Abrir DashboardPage (que muestra lista de ventas)
2. Contar número de ventas en la lista
3. En otra pestaña:
   - Ir a PageVentas
   - Crear una nueva venta
4. Volver a DashboardPage
5. **Esperar 30 segundos (máximo)**

#### Resultado Esperado
✅ La nueva venta aparece en la lista automáticamente

---

### Test 4: Lista de Gastos (45s polling)

#### Objetivo
Verificar que la lista de gastos se actualice

#### Pasos
1. Abrir PageGastos
2. Contar número de gastos
3. En otra pestaña o BD directamente:
   - Insertar un nuevo gasto
4. **Esperar 45 segundos (máximo)**

#### Resultado Esperado
✅ El nuevo gasto aparece en la lista

---

### Test 5: Estado del Turno (60s polling)

#### Objetivo
Verificar que el estado del turno se actualice

#### Pasos
1. Abrir DashboardPage con turno abierto
2. Verificar que muestra "Turno Abierto"
3. En otra sesión o BD:
   - Cerrar el turno actual
4. **Esperar 60 segundos (máximo)**

#### Resultado Esperado
✅ El dashboard muestra que no hay turno abierto

---

### Test 6: Invalidación Cruzada - Crear Venta

#### Objetivo
Verificar que al crear una venta se actualicen múltiples queries

#### Pasos
1. Abrir DashboardPage
2. Anotar valores de:
   - Lista de ventas (número de items)
   - Resumen de ventas (totales)
   - Salud del negocio
3. Crear una nueva venta desde el mismo cliente
4. **No esperar** - debería ser instantáneo

#### Resultado Esperado
✅ Inmediatamente después de crear:
- La venta aparece en la lista
- El resumen se actualiza
- La salud del negocio se actualiza

---

### Test 7: Invalidación Cruzada - Crear Gasto

#### Objetivo
Verificar que al crear un gasto se actualice la salud del negocio

#### Pasos
1. Abrir DashboardPage
2. Anotar métricas de "Salud del Negocio"
3. Crear un nuevo gasto desde PageGastos
4. Volver al Dashboard
5. **No esperar** - debería ser instantáneo

#### Resultado Esperado
✅ Las métricas de salud se actualizan inmediatamente

---

### Test 8: RefetchOnWindowFocus

#### Objetivo
Verificar que al volver a la ventana se refresquen los datos

#### Pasos
1. Abrir DashboardPage
2. Cambiar a otra aplicación (Chrome → Slack, etc.)
3. Mientras está fuera, crear/modificar datos en BD
4. Volver a la ventana del navegador

#### Resultado Esperado
✅ Los datos se refrescan automáticamente al volver al foco

---

### Test 9: RefetchOnReconnect

#### Objetivo
Verificar que al reconectar internet se refresquen los datos

#### Pasos
1. Abrir DashboardPage
2. Desconectar internet (WiFi off)
3. Esperar unos segundos
4. Reconectar internet

#### Resultado Esperado
✅ Los datos se refrescan automáticamente al reconectar

---

### Test 10: Múltiples Usuarios Simultáneos

#### Objetivo
Simular entorno multi-usuario

#### Setup
- Usuario A: En DashboardPage
- Usuario B: En PageVentas
- Usuario C: En PageGastos

#### Pasos
1. Usuario B crea una venta
2. Usuario C crea un gasto
3. **Esperar intervalos de polling**

#### Resultado Esperado
✅ Usuario A ve ambos cambios aparecer en su dashboard:
- Nueva venta en la lista (≤30s)
- Métricas actualizadas (≤45s)

---

## 📊 Matriz de Intervalos de Actualización

| Query | Intervalo | Acción Manual | Acción Otro Usuario |
|-------|-----------|---------------|---------------------|
| `resumenVentas` | 30s | ⚡ Instantáneo | ⏱️ Hasta 30s |
| `saludNegocio` | 45s | ⚡ Instantáneo | ⏱️ Hasta 45s |
| `turnoAbierto` | 60s | ⚡ Instantáneo | ⏱️ Hasta 60s |
| `ventasWeb` | 30s | ⚡ Instantáneo | ⏱️ Hasta 30s |
| `gastos` | 45s | ⚡ Instantáneo | ⏱️ Hasta 45s |
| `turnos` | 60s | ⚡ Instantáneo | ⏱️ Hasta 60s |

**Nota:**
- ⚡ **Instantáneo:** Mutaciones locales invalidan queries inmediatamente
- ⏱️ **Polling:** Cambios externos se detectan en el próximo intervalo

---

## 🔍 Verificación Visual

### Console DevTools

Abrir DevTools → Console y buscar mensajes de TanStack Query:

```
Refetching query: ['ventasWeb', 'list']
Refetching query: ['resumenVentas', 'summary']
Query invalidated: ['saludNegocio']
```

### React Query DevTools (Solo en Desarrollo)

1. Abrir aplicación en modo desarrollo
2. Buscar el ícono de React Query DevTools (esquina inferior)
3. Ver queries activas y sus estados:
   - `stale` - Datos antiguos
   - `fetching` - Actualizando
   - `fresh` - Datos recientes

---

## ⚠️ Troubleshooting

### Los datos no se actualizan

**Verificar:**
1. ✅ Backend está corriendo
2. ✅ No hay errores en Console
3. ✅ Token JWT válido (no expirado)
4. ✅ Red estable

**Soluciones:**
- Refrescar página manualmente (F5)
- Logout y Login de nuevo
- Verificar configuración de intervalos en el código

### Actualizaciones muy lentas

**Causa:** Intervalos de polling largos (diseño intencional)

**Solución temporal:**
- Reducir intervalos en el código (no recomendado en producción)
- Cambiar de pestaña y volver (activa `refetchOnWindowFocus`)

### Errores 401 Unauthorized

**Causa:** Token JWT expirado

**Solución:**
- Logout y Login de nuevo
- Sistema debe manejar automáticamente con refresh tokens

---

## 📝 Registro de Testing

Completar esta tabla durante el testing:

| Test # | Descripción | Resultado | Tiempo Real | Notas |
|--------|-------------|-----------|-------------|-------|
| 1 | Resumen ventas | ✅ / ❌ | ___s | |
| 2 | Salud negocio | ✅ / ❌ | ___s | |
| 3 | Lista ventas | ✅ / ❌ | ___s | |
| 4 | Lista gastos | ✅ / ❌ | ___s | |
| 5 | Estado turno | ✅ / ❌ | ___s | |
| 6 | Crear venta | ✅ / ❌ | ___s | |
| 7 | Crear gasto | ✅ / ❌ | ___s | |
| 8 | Window focus | ✅ / ❌ | ___s | |
| 9 | Reconnect | ✅ / ❌ | ___s | |
| 10 | Multi-user | ✅ / ❌ | ___s | |

---

## 🎓 Tips para el Testing

1. **Usar dos navegadores:** Chrome + Firefox para simular usuarios diferentes
2. **Modo Incógnito:** Para segunda sesión con credenciales diferentes
3. **Network Throttling:** DevTools → Network → Slow 3G para simular red lenta
4. **React Query DevTools:** Muy útil para ver estado de queries en tiempo real
5. **Console logging:** Verificar mensajes de polling y fetching

---

## 📞 Soporte

Si encuentra problemas durante el testing:

1. Revisar documentación: `IMPLEMENTATION_AUTO_REFRESH_DASHBOARDS.md`
2. Verificar logs del backend
3. Revisar console del navegador
4. Contactar al equipo de desarrollo

---

**Última actualización:** 2024
**Versión:** 2.5.B12
