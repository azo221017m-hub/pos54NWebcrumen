# Checklist de Despliegue a Producción

## Pre-Despliegue

### Base de Datos (⚠️ CRÍTICO)
- [ ] **Verificar migraciones pendientes**
  - [ ] Revisar `backend/src/scripts/README_MIGRATIONS.md`
  - [ ] Ejecutar migraciones requeridas ANTES del deploy
  
- [ ] **Migración: moderadores column** (REQUERIDA)
  ```bash
  # Ver: backend/MIGRATION_MODERADORES_COLUMN.md
  mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME>
  source backend/src/scripts/add_moderadores_to_detalleventas.sql
  ```
  - [ ] Verificar: `DESCRIBE tblposcrumenwebdetalleventas;`
  - [ ] Confirmar que columna `moderadores` existe
  
- [ ] **Respaldo de base de datos**
  ```bash
  mysqldump -h <DB_HOST> -u <DB_USER> -p <DB_NAME> > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

### Backend
- [ ] Actualizar `backend/.env` con valores de producción
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_URL=https://pos54nwebcrumen.onrender.com`
  - [ ] `BACKEND_URL=https://pos54nwebcrumenbackend.onrender.com`
  - [ ] Verificar credenciales de base de datos Azure MySQL

- [ ] Compilar backend
  ```bash
  cd backend
  npm install
  npm run build
  ```

- [ ] Verificar que no hay errores de TypeScript
- [ ] Revisar configuración de CORS en `backend/src/app.ts`

### Frontend
- [ ] Crear/Actualizar `frontend/.env`
  - [ ] `VITE_API_URL=https://pos54nwebcrumenbackend.onrender.com/api`
  - [ ] `VITE_API_TIMEOUT=30000`

- [ ] Compilar frontend
  ```bash
  cd frontend
  npm install
  npm run build
  ```

- [ ] Verificar que se genera la carpeta `dist/`
- [ ] Revisar que no hay errores de build

---

## Despliegue en Render.com

### Backend Deploy

1. **Repositorio Git**
   - [ ] Hacer commit de los cambios
   - [ ] Push al repositorio remoto
   ```bash
   git add .
   git commit -m "Config producción"
   git push origin main
   ```

2. **Render Dashboard - Backend**
   - [ ] Ir a https://dashboard.render.com
   - [ ] Seleccionar servicio backend (o crear nuevo)
   - [ ] Configurar:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Branch**: `main`

3. **Variables de Entorno (Backend)**
   - [ ] `PORT=3000`
   - [ ] `NODE_ENV=production`
   - [ ] `DB_HOST=crumenprod01.mysql.database.azure.com`
   - [ ] `DB_USER=azavala`
   - [ ] `DB_PASSWORD=Z4vaLA$Ant`
   - [ ] `DB_NAME=bdcdttx`
   - [ ] `DB_PORT=3306`
   - [ ] `JWT_SECRET=crumen_pos_secret_key_2024_secure_token`
   - [ ] `FRONTEND_URL=https://pos54nwebcrumen.onrender.com`
   - [ ] `BACKEND_URL=https://pos54nwebcrumenbackend.onrender.com`

4. **Deploy Backend**
   - [ ] Click en "Manual Deploy" → "Clear build cache & deploy"
   - [ ] Esperar a que termine el deploy (5-10 minutos)
   - [ ] Verificar logs por errores

### Frontend Deploy

1. **Render Dashboard - Frontend**
   - [ ] Ir a https://dashboard.render.com
   - [ ] Seleccionar servicio frontend (o crear nuevo)
   - [ ] Configurar:
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`
     - **Type**: Static Site

2. **Variables de Entorno (Frontend)**
   - [ ] `VITE_API_URL=https://pos54nwebcrumenbackend.onrender.com/api`
   - [ ] `VITE_APP_NAME=Web POS Crumen`
   - [ ] `VITE_API_TIMEOUT=30000`

3. **Configuración Adicional**
   - [ ] Añadir rewrite rules para SPA (si es necesario):
     ```
     /*    /index.html   200
     ```

4. **Deploy Frontend**
   - [ ] Click en "Manual Deploy" → "Clear build cache & deploy"
   - [ ] Esperar a que termine el deploy (3-5 minutos)
   - [ ] Verificar logs por errores

---

## Post-Despliegue

### Verificaciones Automáticas

1. **Backend Health Check**
   - [ ] Abrir: https://pos54nwebcrumenbackend.onrender.com/api/health
   - [ ] Verificar respuesta:
     ```json
     {
       "status": "ok",
       "message": "API POS Crumen funcionando correctamente",
       "timestamp": "..."
     }
     ```

2. **Frontend Access**
   - [ ] Abrir: https://pos54nwebcrumen.onrender.com
   - [ ] Verificar que carga la página principal
   - [ ] No debe haber errores en la consola del navegador

3. **CORS Test**
   - [ ] Desde la consola del navegador (en el frontend):
     ```javascript
     fetch('https://pos54nwebcrumenbackend.onrender.com/api/health')
       .then(r => r.json())
       .then(console.log)
     ```
   - [ ] Debe retornar el objeto JSON sin errores CORS

### Pruebas Funcionales

- [ ] **Login**
  - Ingresar con usuario de prueba
  - Verificar que se recibe el token
  - Verificar que redirige al dashboard

- [ ] **Carga de Datos**
  - [ ] Negocios se cargan correctamente
  - [ ] Usuarios se cargan correctamente
  - [ ] Productos/Inventario accesible

- [ ] **Operaciones CRUD**
  - [ ] Crear un nuevo registro (cualquier módulo)
  - [ ] Editar un registro existente
  - [ ] Eliminar un registro de prueba

- [ ] **Imágenes**
  - [ ] Cargar avatar de usuario
  - [ ] Verificar que se muestra correctamente
  - [ ] Validar que se guarda en la base de datos

- [ ] **Navegación**
  - [ ] Todos los menús funcionan
  - [ ] Rutas protegidas requieren autenticación
  - [ ] Logout funciona correctamente

### Performance

- [ ] **Tiempos de Respuesta**
  - [ ] Primera carga < 5 segundos
  - [ ] Peticiones API < 2 segundos
  - [ ] Navegación entre páginas fluida

- [ ] **Consola del Navegador**
  - [ ] Sin errores JavaScript
  - [ ] Sin warnings críticos
  - [ ] Sin errores 404

### Monitoreo

- [ ] **Render Dashboard**
  - [ ] Servicio backend: "Live"
  - [ ] Servicio frontend: "Live"
  - [ ] Sin reiniciar constantemente

- [ ] **Logs**
  - [ ] Backend logs sin errores recurrentes
  - [ ] No hay memory leaks
  - [ ] Peticiones se registran correctamente

---

## Troubleshooting

### Problema: "Unknown column 'moderadores' in field list"
**Solución:**
1. Falta ejecutar migración de base de datos
2. Ver documentación: `SOLUCION_ERROR_MODERADORES.md`
3. Ejecutar: `backend/src/scripts/add_moderadores_to_detalleventas.sql`
4. Reiniciar backend después de aplicar migración

### Problema: CORS Error
**Solución:**
1. Verificar `FRONTEND_URL` en variables de entorno del backend
2. Asegurar que la URL coincide exactamente (sin `/` al final)
3. Reiniciar servicio backend

### Problema: 502 Bad Gateway
**Solución:**
1. Backend está iniciando (esperar 30-60 segundos)
2. Verificar logs del backend en Render
3. Verificar que la base de datos Azure está accesible

### Problema: Frontend no carga
**Solución:**
1. Verificar que `dist/` se generó correctamente
2. Verificar "Publish Directory" = `dist`
3. Añadir rewrite rules para SPA

### Problema: Timeout en peticiones
**Solución:**
1. Aumentar `VITE_API_TIMEOUT` a 60000 (60 segundos)
2. Verificar que el backend no está dormido (Free Tier)
3. Hacer petición de "wake up" al backend primero

---

## Rollback

Si algo sale mal:

1. **Render Dashboard**
   - Ir al servicio afectado
   - Click en "Deploys"
   - Seleccionar deploy anterior exitoso
   - Click en "Rollback to this deploy"

2. **Variables de Entorno**
   - Revertir cambios en variables
   - Restart services

3. **Base de Datos**
   - Si hay cambios en schema, ejecutar SQL de rollback
   - Restaurar backup si es necesario

---

## Contactos de Emergencia

- **Render Support**: support@render.com
- **Azure Support**: portal.azure.com

---

## Notas

- **Render Free Tier**: Servicios se duermen después de 15 minutos de inactividad
- **Primera petición**: Puede tardar 30-60 segundos al despertar
- **SSL**: Automático por Render (HTTPS)
- **Custom Domain**: Configurar en Render Dashboard → Settings

---

✅ **Última verificación**: ___________ (fecha)
🔄 **Próximo deploy**: ___________ (fecha programada)

