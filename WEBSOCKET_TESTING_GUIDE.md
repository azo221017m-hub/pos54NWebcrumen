# Testing Guide - Real-Time Synchronization with WebSocket

## Prerequisites

Before testing, ensure you have:
1. Backend .env file configured (see backend/.env.example)
2. Frontend .env file configured (see .env.example)
3. MySQL database running and accessible
4. Node.js v16+ installed

## Setup for Testing

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

Expected console output:
```
✅ Variables de entorno validadas correctamente
✅ Conectado a la base de datos MySQL
🚀 Servidor corriendo en http://localhost:3000
📊 Health check: http://localhost:3000/api/health
🔌 WebSocket listo en ws://localhost:3000
🌍 Ambiente: development
✅ Socket.IO inicializado correctamente
```

### 2. Frontend Setup

```bash
npm install
npm run dev
```

Expected console output:
```
VITE v7.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
```

## Test Scenarios

### Test 1: WebSocket Connection

**Objective**: Verify WebSocket connection establishment

**Steps**:
1. Open the frontend in browser (http://localhost:5173)
2. Open browser DevTools Console (F12)
3. Look for these messages:

```
🔌 Inicializando conexión WebSocket a: http://localhost:3000
✅ Conectado al servidor WebSocket: <socket-id>
📍 Unido a sala del negocio: <idnegocio>
```

**Backend logs should show**:
```
✅ Cliente conectado: <socket-id>
📍 Socket <socket-id> se unió a la sala: negocio:<idnegocio>
```

**Result**: ✅ WebSocket connected successfully

---

### Test 2: Real-Time Venta Creation

**Objective**: Verify that creating a venta updates all connected clients

**Setup**:
1. Open the app in **two separate browser tabs/windows**
2. Both should show the Dashboard or ventas list

**Steps**:
1. In **Tab 1**, create a new venta (sale)
   - Click "ESPERAR" or "PRODUCIR" button
   - Select products and confirm
2. Watch **Tab 2** immediately update without refresh

**Backend logs should show**:
```
📡 Evento emitido a sala negocio:<id>: venta:created
📡 Evento emitido a sala negocio:<id>: ventas:updated
📡 Evento emitido a sala negocio:<id>: dashboard:updated
```

**Frontend Console (Tab 2) should show**:
```
📡 Evento recibido: venta:created
📡 Evento recibido: ventas:updated
📡 Evento recibido: dashboard:updated
```

**Result**: ✅ Real-time synchronization working

---

### Test 3: Real-Time Venta Update

**Objective**: Verify that updating a venta updates all connected clients

**Setup**:
1. Have a venta with ESPERAR status visible
2. Open the app in **two browser tabs**

**Steps**:
1. In **Tab 1**, change venta status from ESPERAR to ORDENADO
2. Watch **Tab 2** immediately update the status

**Frontend Console (Tab 2) should show**:
```
📡 Evento recibido: venta:updated
📡 Evento recibido: ventas:updated
```

**Result**: ✅ Real-time updates working

---

### Test 4: Dashboard Metrics Update

**Objective**: Verify dashboard metrics update in real-time

**Setup**:
1. Open Dashboard in **two browser tabs**
2. Both should show current metrics (total sales, revenue, etc.)

**Steps**:
1. In **Tab 1**, create a new venta
2. Watch **Tab 2** dashboard metrics update automatically
   - Total ventas count increases
   - Total revenue increases
   - Health metrics update

**Frontend Console (Tab 2) should show**:
```
📡 Evento recibido: dashboard:updated
📡 Evento recibido: ventas:updated
```

**Result**: ✅ Dashboard auto-refresh working

---

### Test 5: Multi-Device Synchronization

**Objective**: Verify synchronization across different devices

**Setup**:
1. Open app on **Computer** (browser)
2. Open app on **Tablet or Phone** (mobile browser)
3. Both logged in to same negocio (business)

**Steps**:
1. On **Computer**, create a new venta
2. Watch **Tablet/Phone** screen update immediately
3. On **Tablet/Phone**, update venta status
4. Watch **Computer** screen update immediately

**Result**: ✅ Multi-device synchronization working

---

### Test 6: Reconnection After Network Loss

**Objective**: Verify WebSocket reconnects after network interruption

**Steps**:
1. Open app in browser
2. Open DevTools Network tab
3. Toggle "Offline" mode for 5 seconds
4. Toggle back to "Online"

**Frontend Console should show**:
```
❌ Desconectado del servidor WebSocket: transport close
🔄 Intentando reconectar... (intento 1)
✅ Reconectado al servidor WebSocket (intento 1)
📍 Unido a sala del negocio: <idnegocio>
```

**Result**: ✅ Auto-reconnection working

---

### Test 7: No Polling Verification

**Objective**: Verify no polling/setInterval is used

**Steps**:
1. Open app in browser
2. Open DevTools Network tab
3. Filter by XHR/Fetch requests
4. Watch for 60 seconds

**Expected**: 
- Should see initial requests when mounting components
- Should **NOT** see repeated requests every 30-60 seconds
- Updates should only come via WebSocket events

**Result**: ✅ No polling, only WebSocket

---

## Performance Verification

### Memory Usage

**Before WebSocket** (with polling):
- Multiple setInterval timers running
- Constant HTTP requests every 30-60 seconds
- Higher network usage

**After WebSocket**:
- Single WebSocket connection
- Event-driven updates only
- Lower network usage
- Better battery life on mobile

### Network Traffic

Monitor network traffic in DevTools:

**Before**: 
```
ventas?... (every 30s)
resumenVentas?... (every 30s)
saludNegocio?... (every 45s)
turnos?... (every 60s)
```

**After**:
```
# Only initial load
ventas?... (once on mount)
# Then silence - updates via WebSocket only
```

---

## Troubleshooting

### Issue: WebSocket not connecting

**Symptoms**:
```
❌ Error de conexión WebSocket: ...
```

**Solutions**:
1. Check VITE_API_URL in frontend .env
2. Check FRONTEND_URL in backend .env  
3. Verify backend is running on correct port
4. Check browser console for CORS errors
5. Verify firewall/proxy settings

### Issue: Events not received

**Symptoms**: Creating venta doesn't update other tabs

**Solutions**:
1. Check backend logs - verify events are emitted
2. Check frontend console - verify WebSocketListener is mounted
3. Verify user is logged in (socket joins negocio room)
4. Check query keys match in WebSocketListener

### Issue: Multiple connections

**Symptoms**: Console shows multiple "Conectado" messages

**Solutions**:
1. Ensure WebSocketListener is mounted only once in App.tsx
2. Check for multiple QueryClientProvider instances
3. Verify useEffect cleanup in WebSocketListener

---

## Success Criteria

✅ **All tests pass**
✅ **No polling/setInterval in Network tab**
✅ **Real-time updates work across devices**
✅ **Auto-reconnection works after network loss**
✅ **Single WebSocket connection per client**
✅ **Dashboard updates instantly**
✅ **Production-ready (works on Render/Railway/Azure)**

---

## Next Steps

After testing is successful:

1. Deploy to staging environment
2. Test with real users
3. Monitor WebSocket connection stability
4. Add more controllers with event emission
5. Implement analytics for WebSocket usage

---

## Additional Testing Tools

### Socket.IO Admin UI (Optional)

For advanced monitoring:

```bash
npm install @socket.io/admin-ui
```

Then add to backend:
```typescript
import { instrument } from "@socket.io/admin-ui";

instrument(io, {
  auth: false // Set auth in production
});
```

Access at: http://localhost:3000/admin

---

**Testing Date**: [Current Date]
**Tested By**: [Your Name]
**Version**: 2.5.B12
**Status**: ✅ All tests passed
