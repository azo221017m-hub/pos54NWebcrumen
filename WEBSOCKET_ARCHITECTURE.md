# Arquitectura de Sincronización en Tiempo Real - WebSocket (Socket.IO) + React Query

## Descripción General

Este proyecto implementa una arquitectura de sincronización en tiempo real utilizando **WebSocket (Socket.IO)** en el backend y **React Query** en el frontend. Cuando se realiza cualquier operación de INSERT, UPDATE o DELETE en el backend, todos los dashboards, indicadores y listas del frontend se actualizan inmediatamente en todos los dispositivos conectados.

## Características Principales

✅ **Sin polling ni setInterval** - Las actualizaciones son instantáneas mediante eventos WebSocket
✅ **Arquitectura escalable** - Preparado para usar rooms por sucursal (idnegocio)
✅ **Conexión singleton** - Una sola conexión WebSocket por cliente
✅ **TypeScript completo** - Tipado fuerte en backend y frontend
✅ **Compatible con producción** - Funciona en Render, Railway, Azure, etc.
✅ **Fallback automático** - Si WebSocket falla, usa HTTP polling como respaldo

## Stack Tecnológico

### Backend
- **Node.js + Express** - Servidor HTTP
- **Socket.IO** (v4.x) - WebSocket bidireccional
- **TypeScript** - Tipado estático

### Frontend
- **Vite + React** - Aplicación SPA
- **@tanstack/react-query** - State management y caché
- **socket.io-client** - Cliente WebSocket
- **TypeScript** - Tipado estático

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE 1                               │
│  ┌──────────────┐        ┌──────────────┐                      │
│  │ Componente   │───────▶│ React Query  │                      │
│  │  (UI View)   │◀───────│  (useQuery)  │                      │
│  └──────────────┘        └──────┬───────┘                      │
│                                  │                               │
│                          ┌───────▼────────┐                     │
│                          │ WebSocket      │                     │
│                          │ Listener       │                     │
│                          └───────┬────────┘                     │
│                                  │                               │
└──────────────────────────────────┼───────────────────────────────┘
                                   │
                                   │ Socket.IO Events
                                   │
┌──────────────────────────────────▼───────────────────────────────┐
│                         SERVIDOR                                 │
│  ┌──────────────┐        ┌──────────────┐                       │
│  │ Controller   │───────▶│ Socket.IO    │                       │
│  │ (POST/PUT)   │        │ emitToNegocio│                       │
│  └──────┬───────┘        └──────┬───────┘                       │
│         │                       │                                │
│         ▼                       │                                │
│  ┌──────────────┐              │                                │
│  │   Database   │              │                                │
│  │    (MySQL)   │              │                                │
│  └──────────────┘              │                                │
│                                 │                                │
└─────────────────────────────────┼────────────────────────────────┘
                                  │
                                  │ Socket.IO Events
                                  │
┌─────────────────────────────────▼────────────────────────────────┐
│                         CLIENTE 2                                │
│  ┌──────────────┐        ┌──────────────┐                       │
│  │ Componente   │───────▶│ React Query  │                       │
│  │  (UI View)   │◀───────│  (useQuery)  │                       │
│  └──────────────┘        └──────┬───────┘                       │
│                                  │                                │
│                          ┌───────▼────────┐                      │
│                          │ WebSocket      │                      │
│                          │ Listener       │                      │
│                          └────────────────┘                      │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Flujo de Actualización

1. **Usuario realiza acción** (ej: crear venta) en Cliente 1
2. **Frontend envía petición HTTP** (POST) al backend
3. **Backend procesa** y guarda en base de datos
4. **Backend emite evento WebSocket** después de confirmar persistencia
5. **Todos los clientes conectados reciben el evento**
6. **WebSocketListener invalida las queries** correspondientes
7. **React Query refetch automático** de los datos
8. **UI se actualiza automáticamente** en todos los dispositivos

## Estructura de Archivos

### Backend

```
backend/src/
├── config/
│   └── socket.ts              # Configuración de Socket.IO
├── controllers/
│   ├── ventas.controller.ts   # Emite eventos después de operaciones
│   ├── ventasWeb.controller.ts
│   ├── pagos.controller.ts
│   └── ...
└── server.ts                  # Inicializa Socket.IO con Express
```

### Frontend

```
src/
├── config/
│   ├── socket.ts              # Cliente Socket.IO (singleton)
│   └── queryKeys.ts           # Query keys centralizadas
├── components/
│   └── WebSocketListener.tsx  # Escucha eventos y invalida queries
├── hooks/
│   └── queries/
│       ├── useVentasWeb.ts    # Hooks de React Query
│       ├── useDashboard.ts
│       └── ...
└── App.tsx                    # Monta WebSocketListener
```

## Eventos WebSocket Estándar

### Eventos de Ventas
- `ventas:updated` - Lista de ventas actualizada
- `venta:created` - Nueva venta creada
- `venta:updated` - Venta actualizada
- `venta:cancelled` - Venta cancelada

### Eventos de Turnos
- `turnos:updated` - Lista de turnos actualizada
- `turno:opened` - Nuevo turno abierto
- `turno:closed` - Turno cerrado

### Eventos de Pagos
- `pagos:updated` - Lista de pagos actualizada
- `pago:created` - Nuevo pago registrado
- `pago:updated` - Pago actualizado

### Eventos de Gastos
- `gastos:updated` - Lista de gastos actualizada
- `gasto:created` - Nuevo gasto registrado
- `gasto:updated` - Gasto actualizado
- `gasto:deleted` - Gasto eliminado

### Eventos de Inventario
- `movimientos:updated` - Movimientos de inventario actualizados
- `movimiento:created` - Nuevo movimiento registrado
- `inventario:updated` - Stock de inventario actualizado
- `productos:updated` - Lista de productos actualizada
- `insumos:updated` - Lista de insumos actualizada

### Evento General
- `dashboard:updated` - Invalidar todas las métricas del dashboard

## Cómo Agregar Nuevos Endpoints

### 1. Backend - Emitir Eventos

En el controller después de una operación exitosa:

```typescript
import { emitToNegocio, SOCKET_EVENTS } from '../config/socket';

export const createItem = async (req: AuthRequest, res: Response) => {
  const connection = await pool.getConnection();
  try {
    // ... operaciones de base de datos ...
    await connection.commit();

    // Emitir eventos WebSocket DESPUÉS de confirmar persistencia
    emitToNegocio(idnegocio, SOCKET_EVENTS.ITEMS_UPDATED, { timestamp: new Date() });
    emitToNegocio(idnegocio, SOCKET_EVENTS.DASHBOARD_UPDATED, { timestamp: new Date() });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    await connection.rollback();
    // ...
  } finally {
    connection.release();
  }
};
```

### 2. Frontend - Agregar Query Keys

En `src/config/queryKeys.ts`:

```typescript
export const itemsKeys = {
  all: ['items'] as const,
  lists: () => [...itemsKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...itemsKeys.lists(), { filters }] as const,
  details: () => [...itemsKeys.all, 'detail'] as const,
  detail: (id: number) => [...itemsKeys.details(), id] as const,
};
```

### 3. Frontend - Actualizar WebSocketListener

En `src/components/WebSocketListener.tsx`:

```typescript
// Importar query keys
import { itemsKeys } from '../config/queryKeys';

// Agregar listener en useEffect
const handleItemsUpdated = () => {
  console.log('📡 Evento recibido: items:updated');
  queryClient.invalidateQueries({ queryKey: itemsKeys.all });
};

socket.on('items:updated', handleItemsUpdated);

// No olvidar el cleanup
return () => {
  socket.off('items:updated', handleItemsUpdated);
};
```

### 4. Frontend - Crear Hook de Query

En `src/hooks/queries/useItems.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsKeys } from '../../config/queryKeys';

export const useItemsQuery = () => {
  return useQuery({
    queryKey: itemsKeys.lists(),
    queryFn: fetchItems,
    // NO usar refetchInterval - actualizaciones por WebSocket
  });
};

export const useCreateItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      // WebSocket invalidará automáticamente, esto es solo fallback
      queryClient.invalidateQueries({ queryKey: itemsKeys.lists() });
    },
  });
};
```

## Soporte para Multi-Sucursal

El sistema está preparado para soportar múltiples sucursales usando **rooms** de Socket.IO:

### Backend
```typescript
// El cliente se une automáticamente a su room al conectar
socket.on('join:negocio', (idnegocio: number) => {
  const room = `negocio:${idnegocio}`;
  socket.join(room);
});

// Emitir solo a un negocio específico
emitToNegocio(idnegocio, 'ventas:updated', { ... });
```

### Frontend
```typescript
// El socket se une automáticamente al room del usuario
// al conectar (ver src/config/socket.ts)
const usuario = JSON.parse(localStorage.getItem('usuario'));
socket.emit('join:negocio', usuario.idNegocio);
```

## Configuración de Producción

### Variables de Entorno

**Backend** (`backend/.env`):
```bash
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://pos54nwebcrumen.onrender.com
```

**Frontend** (`.env.production`):
```bash
VITE_API_URL=https://pos54nwebcrumenbackend.onrender.com
```

### Render.com

1. **Backend Service**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: Node
   - Plan: Starter o superior (WebSocket requiere persistencia)

2. **Frontend Service**:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Environment: Static Site

### Nota Importante
⚠️ **WebSocket requiere conexiones persistentes**. Asegúrate de usar un plan que no suspenda el servicio (Render Starter o superior).

## Depuración

### Logs del Backend
```bash
# Desarrollo
cd backend
npm run dev

# Buscar en logs:
✅ Socket.IO inicializado correctamente
✅ Cliente conectado: <socket-id>
📡 Evento emitido a sala negocio:1: ventas:updated
```

### Logs del Frontend
```javascript
// Abrir DevTools Console
// Buscar:
🔌 Inicializando conexión WebSocket a: http://localhost:3000
✅ Conectado al servidor WebSocket: <socket-id>
📡 Evento recibido: ventas:updated
```

### Herramientas de Desarrollo

**React Query DevTools** - Ver estado de queries:
```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<QueryClientProvider client={queryClient}>
  <App />
  {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
</QueryClientProvider>
```

## Solución de Problemas

### WebSocket no conecta
1. Verificar que VITE_API_URL esté correctamente configurada
2. Verificar que el backend esté corriendo
3. Verificar CORS en backend (FRONTEND_URL)
4. Revisar console del navegador para errores

### Actualizaciones no se reflejan
1. Verificar que el evento se emite en el backend (logs)
2. Verificar que WebSocketListener esté montado en App.tsx
3. Verificar que las query keys coincidan
4. Verificar que el listener esté registrado correctamente

### Múltiples conexiones
1. WebSocketListener debe montarse UNA SOLA VEZ en App.tsx
2. Verificar que no haya múltiples instancias de QueryClientProvider
3. Verificar cleanup en useEffect

## Beneficios de esta Arquitectura

✅ **Experiencia de usuario mejorada** - Actualizaciones instantáneas
✅ **Reducción de carga del servidor** - Sin polling constante
✅ **Sincronización multi-dispositivo** - Todos ven lo mismo al mismo tiempo
✅ **Código limpio y mantenible** - Separación de responsabilidades
✅ **Escalable** - Soporte para múltiples sucursales
✅ **Type-safe** - TypeScript en todo el stack

## Notas de Seguridad

- ✅ Los eventos WebSocket respetan la autenticación JWT
- ✅ Los clientes solo reciben eventos de su negocio (room)
- ✅ Las queries de React Query respetan los permisos del usuario
- ✅ No se expone información sensible en eventos WebSocket

## Autor

Implementado como parte del proyecto POS Crumen (v2.5.B12)

## Licencia

ISC
