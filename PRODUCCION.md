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

### Variables de Entorno en Producción

**⚠️ IMPORTANTE**: El sistema está configurado para cargar el archivo `.env` desde diferentes ubicaciones según el ambiente:

El sistema ahora está configurado para:
- **Desarrollo** (`NODE_ENV !== 'production'`): Lee variables del archivo `.env` desde el directorio del proyecto
- **Producción** (`NODE_ENV === 'production'`): Lee variables del archivo `.env` desde `/etc/secrets/.env`

**Ubicación del archivo .env en producción**: `/etc/secrets/.env`

Este archivo debe ser creado en el servidor de producción con las credenciales correctas. Asegúrate de que el directorio `/etc/secrets/` existe y que el archivo tiene los permisos adecuados.

### Variables Requeridas en Producción

⚠️ **NOTA DE SEGURIDAD**: Los valores mostrados a continuación son ejemplos de la estructura de producción existente. En un entorno real, estas credenciales deben ser rotadas y gestionadas de forma segura. Nunca commits credenciales reales en el repositorio.

El archivo `/etc/secrets/.env` debe contener las siguientes variables:

```
# Configuración de la base de datos MySQL Azure
DB_HOST=crumenprod01.mysql.database.azure.com
DB_USER=azavala
DB_PASSWORD=Z4vaLA$Ant  # ⚠️ NOTA: Cambiar por credenciales seguras
DB_NAME=bdcdttx
DB_PORT=3306

# Puerto del servidor
PORT=3000

# JWT Secret
JWT_SECRET=crumen_pos_secret_key_2024_secure_token  # ⚠️ NOTA: Cambiar por secret seguro

# Entorno (CRÍTICO: debe ser 'production')
NODE_ENV=production

# URL del Frontend (para CORS)
FRONTEND_URL=https://pos54nwebcrumen.onrender.com

# URL del Backend (para referencia)
BACKEND_URL=https://pos54nwebcrumenbackend.onrender.com
```

### Configuración del Servidor de Producción

Para configurar el archivo `.env` en producción:

1. **Crear el directorio de secrets** (si no existe):
   ```bash
   sudo mkdir -p /etc/secrets
   ```

2. **Crear el archivo `.env`**:
   ```bash
   sudo nano /etc/secrets/.env
   ```

3. **Copiar el contenido** de las variables de entorno mostradas arriba.

4. **Establecer permisos adecuados**:
   ```bash
   sudo chmod 600 /etc/secrets/.env
   sudo chown <usuario_app>:<grupo_app> /etc/secrets/.env
   ```
   Donde `<usuario_app>` es el usuario bajo el cual se ejecuta la aplicación.

**NOTA**: Si estás usando Render.com u otro servicio de hosting, consulta con el proveedor sobre la mejor forma de configurar el directorio `/etc/secrets/` o monta un volumen persistente para almacenar el archivo `.env`.

### Archivo `.env` para Desarrollo Local

⚠️ **NOTA DE SEGURIDAD**: El archivo `.env` nunca debe ser commiteado al repositorio. Está incluido en `.gitignore`. Los valores mostrados son ejemplos - usar credenciales de desarrollo o prueba localmente.

El archivo `backend/.env` solo se usa en desarrollo local:

```env
# Configuración de la base de datos MySQL Azure
DB_HOST=crumenprod01.mysql.database.azure.com
DB_USER=azavala
DB_PASSWORD=Z4vaLA$Ant  # ⚠️ NOTA: Usar credenciales de desarrollo
DB_NAME=bdcdttx
DB_PORT=3306

# Puerto del servidor
PORT=3000

# JWT Secret
JWT_SECRET=crumen_pos_secret_key_2024_secure_token  # ⚠️ NOTA: Usar secret de desarrollo

# Entorno
NODE_ENV=development

# URL del Frontend (para CORS)
FRONTEND_URL=http://localhost:5173

# URL del Backend (para referencia)
BACKEND_URL=http://localhost:3000
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

**⚠️ CRÍTICO**: Las variables de entorno DEBEN configurarse en el panel de Render. NO subir archivos `.env` al repositorio ni confiar en ellos en producción.

### Frontend (Render.com)
1. Ir a Dashboard → Web Service (Frontend)
2. **IMPORTANTE**: Configurar Root Directory = `frontend`
3. Environment → Agregar:
   - `VITE_API_URL` = `https://pos54nwebcrumenbackend.onrender.com` (SIN /api)
   - `VITE_APP_NAME` = `Web POS Crumen`
   - `VITE_API_TIMEOUT` = `30000`

### Backend (Render.com)

⚠️ **NOTA DE SEGURIDAD**: Los valores de DB_PASSWORD y JWT_SECRET mostrados son ejemplos. En producción, usar credenciales seguras generadas específicamente para el entorno.

1. Ir a Dashboard → Web Service (Backend)
2. **IMPORTANTE**: Configurar Root Directory = `backend`
3. Environment → Agregar TODAS las variables requeridas:
   - `NODE_ENV` = `production` ⚠️ **CRÍTICO**
   - `DB_HOST` = `crumenprod01.mysql.database.azure.com`
   - `DB_USER` = `azavala`
   - `DB_PASSWORD` = `Z4vaLA$Ant` ⚠️ **Cambiar en producción**
   - `DB_NAME` = `bdcdttx`
   - `DB_PORT` = `3306`
   - `PORT` = `3000`
   - `JWT_SECRET` = `crumen_pos_secret_key_2024_secure_token` ⚠️ **Cambiar en producción**
   - `FRONTEND_URL` = `https://pos54nwebcrumen.onrender.com`
   - `BACKEND_URL` = `https://pos54nwebcrumenbackend.onrender.com`

**Nota**: El sistema ahora carga el archivo `.env` desde `/etc/secrets/.env` cuando `NODE_ENV=production`.

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
