# Render Build Configuration for Frontend

## Service Type
Static Site

## Build Settings
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

## Environment Variables
Set these in Render Dashboard:

```
VITE_API_URL=https://pos54nwebcrumenbackend.onrender.com
VITE_APP_NAME=Web POS Crumen
VITE_API_TIMEOUT=30000
```

## Root Directory
**IMPORTANTE**: Si el repositorio contiene tanto frontend como backend, configurar:
- **Root Directory**: `frontend`

Esto le indica a Render que busque el `package.json` en la carpeta `frontend/` en lugar de la raíz del repositorio.

## Rewrite Rules
Para SPA (Single Page Application), añadir rewrite rule:
```
/*    /index.html   200
```

## Node Version
Render usa automáticamente la versión especificada en `.nvmrc` o `package.json`.
Para especificar manualmente, agregar en `package.json`:

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Deploy
1. Push cambios a GitHub
2. Render detectará automáticamente y hará build
3. O hacer deploy manual desde Dashboard
