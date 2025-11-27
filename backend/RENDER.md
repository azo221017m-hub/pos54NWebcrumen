# Render Build Configuration for Backend

## Service Type
Web Service

## Build Settings
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

## Environment Variables
Set these in Render Dashboard:

```
PORT=3000
NODE_ENV=production
DB_HOST=crumenprod01.mysql.database.azure.com
DB_USER=azavala
DB_PASSWORD=Z4vaLA$Ant
DB_NAME=bdcdttx
DB_PORT=3306
JWT_SECRET=crumen_pos_secret_key_2024_secure_token
FRONTEND_URL=https://pos54nwebcrumen.onrender.com
BACKEND_URL=https://pos54nwebcrumenbackend.onrender.com
```

## Root Directory
**IMPORTANTE**: Si el repositorio contiene tanto frontend como backend, configurar:
- **Root Directory**: `backend`

Esto le indica a Render que busque el `package.json` en la carpeta `backend/` en lugar de la raíz del repositorio.

## Health Check Path
- **Health Check Path**: `/api/health`

Render verificará esta ruta para asegurar que el servicio está funcionando.

## Node Version
Render usa automáticamente la versión especificada en `.nvmrc` o `package.json`.

## Deploy
1. Push cambios a GitHub
2. Render detectará automáticamente y hará build
3. O hacer deploy manual desde Dashboard
