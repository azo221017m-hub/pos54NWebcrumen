# Implementación: Auto-Actualización de Dashboards, Indicadores y Listas

## 📋 Resumen Ejecutivo

Se ha implementado exitosamente la actualización automática de dashboards, indicadores y listas en el frontend para que reflejen los cambios en la base de datos en tiempo casi real. La solución utiliza las capacidades de **TanStack Query** para polling automático e invalidación cruzada de queries.

## 🎯 Problema Resuelto

**Requerimiento Original:**
> "Validar que todos los Dashboard, indicadores y Cards de los list en el FRONTEND se actualicen al actualizarse la Base de Datos, ya sea con insert o update."

**Problema Identificado:**
- Solo `resumenVentas` tenía actualización automática (30s)
- La mayoría de queries dependían únicamente de invalidaciones manuales después de mutaciones
- No había actualización automática cuando otros usuarios/procesos modificaban la BD
- Infraestructura WebSocket preparada pero no implementada

## 🏗️ Solución Implementada

### 1. Configuración Global de QueryClient

**Archivo:** `src/main.tsx`

Se mejoró la configuración de TanStack Query para habilitar múltiples mecanismos de actualización automática:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 segundos
      refetchOnWindowFocus: true,     // ✅ Al volver a la ventana
      refetchOnMount: true,            // ✅ Al montar componente
      refetchOnReconnect: true,        // ✅ Al reconectar internet
      retry: 1,
    },
  },
})
```

**Beneficios:**
- Datos frescos cuando el usuario regresa a la aplicación
- Recuperación automática tras pérdida de conexión
- Actualización al navegar entre páginas

---

### 2. Intervalos de Polling Automático

Se implementó `refetchInterval` en las queries de datos operacionales/en tiempo real:

#### 📊 Dashboard Queries (`src/hooks/queries/useDashboard.ts`)

| Query | Intervalo | Justificación |
|-------|-----------|---------------|
| `useResumenVentasQuery` | 30s | Resumen de ventas del turno actual |
| `useTurnoAbiertoQuery` | 60s | Estado del turno activo |
| `useSaludNegocioQuery` | 45s | Métricas de salud del negocio |

#### 💰 Ventas Web (`src/hooks/queries/useVentasWeb.ts`)

```typescript
// Intervalo: 30 segundos
export const useVentasWebQuery = () => {
  return useQuery({
    queryKey: ventasWebKeys.lists(),
    queryFn: obtenerVentasWeb,
    refetchInterval: 30000, // 30 segundos
  });
};
```

**Aplicado a:** Lista de ventas en DashboardPage y PageVentas

#### 💸 Gastos (`src/hooks/queries/useGastos.ts`)

```typescript
// Intervalo: 45 segundos
export const useGastosQuery = () => {
  return useQuery({
    queryKey: gastosKeys.lists(),
    queryFn: obtenerGastos,
    refetchInterval: 45000, // 45 segundos
  });
};
```

**Aplicado a:** Lista de gastos en PageGastos

#### ⏰ Turnos (`src/hooks/queries/useTurnos.ts`)

```typescript
// Intervalo: 60 segundos
export const useTurnosQuery = () => {
  return useQuery({
    queryKey: turnosKeys.lists(),
    queryFn: obtenerTurnos,
    refetchInterval: 60000, // 60 segundos
  });
};
```

**Aplicado a:** Lista de turnos en ConfigTurnos

---

### 3. Invalidación Cruzada de Queries

Se implementó invalidación cruzada para que las mutaciones actualicen múltiples queries relacionadas:

#### VentasWeb Mutations

**Mutaciones actualizadas:**
- `useCrearVentaWebMutation`
- `useActualizarVentaWebMutation`
- `useCancelarVentaWebMutation`
- `useAgregarDetallesMutation`
- `useActualizarEstadoDetalleMutation`

**Queries invalidadas:**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ventasWebKeys.lists() });
  queryClient.invalidateQueries({ queryKey: ['resumenVentas'] });     // ✅ Dashboard
  queryClient.invalidateQueries({ queryKey: ['saludNegocio'] });      // ✅ Dashboard
}
```

#### Gastos Mutations

**Mutaciones actualizadas:**
- `useCrearGastoMutation`
- `useActualizarGastoMutation`
- `useEliminarGastoMutation`

**Queries invalidadas:**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: gastosKeys.lists() });
  queryClient.invalidateQueries({ queryKey: ['saludNegocio'] });      // ✅ Dashboard
}
```

#### Turnos Mutations

**Mutaciones actualizadas:**
- `useCerrarTurnoMutation`

**Queries invalidadas:**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: turnosKeys.lists() });
  queryClient.invalidateQueries({ queryKey: turnosKeys.verifyOpen() });
  queryClient.invalidateQueries({ queryKey: ['resumenVentas'] });     // ✅ Dashboard
  queryClient.invalidateQueries({ queryKey: ['saludNegocio'] });      // ✅ Dashboard
}
```

---

## 📊 Impacto de los Cambios

### Cambios en Código

| Archivo | Líneas Modificadas | Tipo de Cambio |
|---------|-------------------|----------------|
| `src/main.tsx` | +6 líneas | Configuración global mejorada |
| `src/hooks/queries/useDashboard.ts` | +10 líneas | Intervalos de polling añadidos |
| `src/hooks/queries/useVentasWeb.ts` | +21 líneas | Polling + invalidación cruzada |
| `src/hooks/queries/useGastos.ts` | +12 líneas | Polling + invalidación cruzada |
| `src/hooks/queries/useTurnos.ts` | +9 líneas | Polling + invalidación cruzada |
| **TOTAL** | **58 líneas** | Cambios mínimos y quirúrgicos |

### Páginas Afectadas (Actualizaciones Automáticas Habilitadas)

✅ **Páginas Operacionales con Auto-Refresh:**
1. **DashboardPage** - Resumen ventas, salud negocio, turno abierto, lista ventas
2. **PageVentas** - Lista de ventas activas
3. **PageGastos** - Lista de gastos del turno
4. **ConfigTurnos** - Lista de turnos

🔵 **Páginas de Configuración (Sin Auto-Refresh):**
- ConfigCategorias, ConfigProductosWeb, ConfigClientes, ConfigUsuarios, etc.
- *Decisión de diseño:* Datos de catálogo no cambian frecuentemente

---

## 🔄 Flujo de Actualización

### Escenario 1: Usuario Crea una Venta

```
1. Usuario ejecuta: createVentaWeb()
2. Mutation ejecuta: useCrearVentaWebMutation
3. onSuccess invalida:
   - ventasWebKeys.lists() → Refresca lista de ventas
   - ['resumenVentas'] → Refresca resumen en dashboard
   - ['saludNegocio'] → Refresca métricas de negocio
4. TanStack Query refetch automático de todas las queries invalidadas
5. UI se actualiza con nuevos datos
```

### Escenario 2: Otro Usuario Modifica BD (Sin Mutación Local)

```
1. Otro usuario/proceso inserta/actualiza en BD
2. Polling automático detecta cambios:
   - ventasWeb refresca cada 30s
   - resumenVentas refresca cada 30s
   - saludNegocio refresca cada 45s
3. UI se actualiza automáticamente
```

### Escenario 3: Usuario Vuelve a la Ventana

```
1. Usuario cambia de pestaña/ventana
2. Usuario regresa a la aplicación
3. refetchOnWindowFocus: true → Refresca todas las queries activas
4. UI muestra datos actualizados
```

---

## ⚙️ Configuración de Intervalos

### Criterios de Selección

| Intervalo | Tipo de Datos | Ejemplos |
|-----------|---------------|----------|
| **30s** | Críticos en tiempo real | Ventas activas, resumen ventas |
| **45s** | Métricas calculadas | Salud negocio, gastos |
| **60s** | Estado del sistema | Turno abierto, lista turnos |

**Nota:** Intervalos balancean entre frescura de datos y carga del servidor.

---

## ✅ Validación y Testing

### Build
```bash
npm run build
# ✅ Exitoso - Sin errores de TypeScript
```

### Queries con Auto-Refresh Habilitado

- ✅ `useResumenVentasQuery` - 30s
- ✅ `useTurnoAbiertoQuery` - 60s
- ✅ `useSaludNegocioQuery` - 45s
- ✅ `useVentasWebQuery` - 30s
- ✅ `useGastosQuery` - 45s
- ✅ `useTurnosQuery` - 60s

### Invalidaciones Cruzadas

- ✅ Crear/Actualizar/Cancelar Venta → Invalida Dashboard
- ✅ Crear/Actualizar/Eliminar Gasto → Invalida SaludNegocio
- ✅ Cerrar Turno → Invalida Dashboard completo

---

## 🔮 Mejoras Futuras (No Implementadas)

### WebSocket Integration (Preparada pero No Conectada)

**Archivo:** `src/hooks/queries/websocketUtils.ts`

La infraestructura para WebSocket ya está creada pero no implementada:

```typescript
// Preparado para futura implementación
export const setupWebSocketListeners = (config: WebSocketInvalidationConfig) => {
  // TODO: Conectar con servidor WebSocket
  // socket.on('dashboard:update', () => invalidateQueries(...))
}
```

**Beneficios de WebSocket (futuro):**
- Actualizaciones instantáneas (sin esperar polling)
- Menor carga del servidor (push vs pull)
- Mejor experiencia de usuario

**Razón de no implementar ahora:**
- Requiere cambios en backend (servidor WebSocket)
- Solución con polling es suficiente para requerimientos actuales
- Cambios mínimos priorizados

---

## 📝 Recomendaciones de Uso

### Para Desarrolladores

1. **Nuevas Queries Operacionales:**
   ```typescript
   export const useNuevaQuery = () => {
     return useQuery({
       queryKey: ['nuevaQuery'],
       queryFn: obtenerDatos,
       refetchInterval: 30000, // Si son datos en tiempo real
     });
   };
   ```

2. **Nuevas Mutaciones:**
   ```typescript
   export const useNuevaMutation = () => {
     const queryClient = useQueryClient();
     return useMutation({
       mutationFn: crearDato,
       onSuccess: () => {
         // Invalidar propias queries
         queryClient.invalidateQueries({ queryKey: ['propiaQuery'] });
         // Invalidar queries relacionadas (ej. dashboard)
         queryClient.invalidateQueries({ queryKey: ['resumenVentas'] });
       },
     });
   };
   ```

### Para Ajustar Intervalos

Editar constantes en los archivos de hooks:

```typescript
// src/hooks/queries/useDashboard.ts
const RESUMEN_VENTAS_REFRESH_INTERVAL = 30000; // Cambiar si es necesario
const TURNO_ABIERTO_REFRESH_INTERVAL = 60000;
const SALUD_NEGOCIO_REFRESH_INTERVAL = 45000;
```

---

## 🔐 Consideraciones de Seguridad

- ✅ Sin cambios en autenticación/autorización
- ✅ Queries usan tokens JWT existentes
- ✅ No se exponen nuevos endpoints
- ✅ Polling no aumenta superficie de ataque

---

## 📦 Dependencias

No se agregaron nuevas dependencias. Se utilizan las existentes:

- `@tanstack/react-query: ^5.90.21` (ya existente)
- `@tanstack/react-query-devtools: ^5.91.3` (ya existente)

---

## 🎯 Conclusión

Se implementó exitosamente la actualización automática de dashboards, indicadores y listas mediante:

1. ✅ **Configuración global** de TanStack Query mejorada
2. ✅ **Polling automático** en queries operacionales (30-60s)
3. ✅ **Invalidación cruzada** entre mutaciones y queries relacionadas
4. ✅ **Cambios mínimos** (58 líneas en 5 archivos)
5. ✅ **Build exitoso** sin errores

**Resultado:** El frontend ahora se actualiza automáticamente cuando la base de datos cambia, cumpliendo con el requerimiento original.

---

## 📚 Referencias

- [TanStack Query - Automatic Refetching](https://tanstack.com/query/latest/docs/react/guides/window-focus-refetching)
- [TanStack Query - Polling](https://tanstack.com/query/latest/docs/react/guides/disabling-queries#refetchinterval)
- [Documentación interna - IMPLEMENTACION_TANSTACK_QUERY_COMPLETA.md](./IMPLEMENTACION_TANSTACK_QUERY_COMPLETA.md)
