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

### Error: No se pueden cargar las variables de entorno en producción
- Verificar que el directorio `/etc/secrets/` existe
- Verificar que el archivo `/etc/secrets/.env` existe y tiene el contenido correcto
- Verificar los permisos del archivo (debe ser legible por el usuario que ejecuta la aplicación)
- Verificar en los logs del servidor que se muestra el mensaje: "📁 Cargando variables de entorno desde: /etc/secrets/.env"

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
