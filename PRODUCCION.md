# Configuración de Producción

## URLs de Producción

### Frontend
- **URL Principal**: https://pos54nwebcrumen.onrender.com
- **Hosting**: Render.com

### Backend
- **URL API**: https://pos54nwebcrumenbackend.onrender.com
- **Endpoint Health**: https://pos54nwebcrumenbackend.onrender.com/api/health
- **Hosting**: Render.com

---

## Configuración del Frontend

### Archivo `.env` (Frontend)

Crear el archivo `frontend/.env` con:

```env
# URL de la API backend en producción (SIN /api al final)
# El /api se agrega automáticamente en api.config.ts
VITE_API_URL=https://pos54nwebcrumenbackend.onrender.com

# Nombre de la aplicación
VITE_APP_NAME=Web POS Crumen

# Timeout para peticiones API (ms)
VITE_API_TIMEOUT=30000
```

**IMPORTANTE**: La URL NO debe incluir `/api` al final. Se agrega automáticamente en el código.

### Build del Frontend

```bash
cd frontend
npm install
npm run build
```

El build genera la carpeta `dist/` que se debe subir a Render.

---

## Configuración del Backend

### Archivo `.env` (Backend)

El archivo `backend/.env` debe contener:

```env
# Configuración de la base de datos MySQL Azure
DB_HOST=crumenprod01.mysql.database.azure.com
DB_USER=azavala
DB_PASSWORD=Z4vaLA$Ant
DB_NAME=bdcdttx
DB_PORT=3306

# Puerto del servidor
PORT=3000

# JWT Secret
JWT_SECRET=crumen_pos_secret_key_2024_secure_token

# Entorno
NODE_ENV=production

# URL del Frontend (para CORS)
FRONTEND_URL=https://pos54nwebcrumen.onrender.com

# URL del Backend (para referencia)
BACKEND_URL=https://pos54nwebcrumenbackend.onrender.com
```

### Build del Backend

```bash
cd backend
npm install
npm run build
```

---

## CORS Configuration

El backend está configurado para aceptar peticiones desde:

1. **Desarrollo local**: `http://localhost:5173`
2. **Producción**: `https://pos54nwebcrumen.onrender.com`

La configuración de CORS se encuentra en `backend/src/app.ts`:

```typescript
const allowedOrigins = [
  'http://localhost:5173', // Desarrollo local
  process.env.FRONTEND_URL || 'https://pos54nwebcrumen.onrender.com' // Producción
];
```

---

## Variables de Entorno en Render

### Frontend (Render.com)
1. Ir a Dashboard → Web Service (Frontend)
2. **IMPORTANTE**: Configurar Root Directory = `frontend`
3. Environment → Agregar:
   - `VITE_API_URL` = `https://pos54nwebcrumenbackend.onrender.com` (SIN /api)
   - `VITE_APP_NAME` = `Web POS Crumen`
   - `VITE_API_TIMEOUT` = `30000`

### Backend (Render.com)
1. Ir a Dashboard → Web Service (Backend)
2. **IMPORTANTE**: Configurar Root Directory = `backend`
3. Environment → Agregar todas las variables del archivo `.env`

---

## Comandos de Build en Render

### Frontend
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run preview` o usar servidor estático
- **Publish Directory**: `dist`

### Backend
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

---

## Verificación de Producción

### 1. Backend Health Check
```bash
curl https://pos54nwebcrumenbackend.onrender.com/api/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "message": "API POS Crumen funcionando correctamente",
  "timestamp": "2025-11-27T..."
}
```

### 2. Frontend Access
Abrir en navegador: https://pos54nwebcrumen.onrender.com

### 3. CORS Test
Desde la consola del navegador (Frontend):
```javascript
fetch('https://pos54nwebcrumenbackend.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
```

---

## Troubleshooting

### Error: "No permitido por CORS"
- Verificar que `FRONTEND_URL` esté configurada en las variables de entorno del backend
- Confirmar que la URL del frontend coincida exactamente (con/sin barra final)

### Error: "Network Error" o Timeout
- Aumentar `VITE_API_TIMEOUT` en el frontend
- Verificar que el backend esté activo (Render duerme servicios gratuitos)

### Error: 502 Bad Gateway
- El backend puede estar iniciando (esperar 30-60 segundos)
- Verificar logs en Render Dashboard

---

## Notas Importantes

1. **Render Free Tier**: Los servicios gratuitos se duermen después de 15 minutos de inactividad
2. **Primera Petición**: Puede tardar 30-60 segundos en responder al despertar
3. **Base de Datos**: Azure MySQL siempre activa (no se duerme)
4. **SSL**: Render proporciona certificados SSL automáticos (HTTPS)

---

## Actualización de URLs

Si cambias las URLs de producción:

1. **Frontend**: Actualizar `VITE_API_URL` en `.env` y recompilar
2. **Backend**: Actualizar `FRONTEND_URL` en `.env` y reiniciar
3. **Render**: Actualizar variables de entorno en el dashboard
4. Hacer push a GitHub (si está configurado auto-deploy)

---

## Monitoreo

### Logs del Backend
```bash
# En Render Dashboard → Logs
```

### Health Check Automático
Configurar en Render un health check path: `/api/health`

---

Última actualización: 27 de noviembre de 2025
