# 🚀 Guía de Inicio Rápido - Web POS Crumen

Esta guía te ayudará a configurar y ejecutar el proyecto en tu máquina local.

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (v18 o superior) - [Descargar](https://nodejs.org/)
- **MySQL** (v8.0 o superior) - [Descargar](https://dev.mysql.com/downloads/)
- **Git** - [Descargar](https://git-scm.com/)
- **npm** o **yarn** (incluido con Node.js)

## Paso 1: Configurar la Base de Datos

1. Inicia MySQL y crea la base de datos:

```sql
CREATE DATABASE pos_crumen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. (Opcional) Crea un usuario específico para el proyecto:

```sql
CREATE USER 'pos_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON pos_crumen.* TO 'pos_user'@'localhost';
FLUSH PRIVILEGES;
```

## Paso 2: Configurar el Backend

1. Navega a la carpeta del backend:

```bash
cd backend
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea el archivo de variables de entorno:

```bash
cp .env.example .env
```

4. Edita el archivo `.env` con tus credenciales:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=pos_user          # o 'root'
DB_PASSWORD=tu_password_seguro
DB_NAME=pos_crumen
JWT_SECRET=clave_secreta_muy_segura_cambiala
NODE_ENV=development
```

5. Inicia el servidor backend:

```bash
npm run dev
```

El backend estará corriendo en `http://localhost:3000`

## Paso 3: Configurar el Frontend

1. Abre una **nueva terminal** y navega a la carpeta del frontend:

```bash
cd frontend
```

2. Instala las dependencias:

```bash
npm install
```

3. (Opcional) Crea archivo de variables de entorno:

```bash
cp .env.example .env
```

4. Edita el archivo `.env` si es necesario:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Web POS Crumen
```

5. Inicia el servidor de desarrollo:

```bash
npm run dev
```

El frontend estará corriendo en `http://localhost:5173`

## Paso 4: Verificar que Todo Funciona

1. Abre tu navegador en `http://localhost:5173`
2. Verifica que el backend responde visitando `http://localhost:3000/api/health`

Deberías ver:
```json
{
  "status": "ok",
  "message": "API POS Crumen funcionando correctamente",
  "timestamp": "2025-11-19T..."
}
```

## 🎉 ¡Listo!

Tu entorno de desarrollo está configurado. Ahora puedes:

- Explorar el código en `frontend/src/`
- Crear rutas de API en `backend/src/routes/`
- Desarrollar componentes en `frontend/src/features/`

## Solución de Problemas Comunes

### Error: "Cannot connect to MySQL"

- Verifica que MySQL esté corriendo
- Revisa las credenciales en `backend/.env`
- Asegúrate de que la base de datos existe

### Error: "Port 3000 already in use"

- Cambia el puerto en `backend/.env` (ej: PORT=3001)
- O detén el proceso que usa el puerto 3000

### Error: "Module not found"

- Asegúrate de haber ejecutado `npm install` en ambas carpetas
- Intenta borrar `node_modules/` y reinstalar:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

## Próximos Pasos

1. **Crear tablas en la base de datos** - Ver `backend/README.md`
2. **Configurar rutas** - Agregar endpoints en `backend/src/routes/`
3. **Desarrollar features** - Implementar módulos en `frontend/src/features/`
4. **Agregar autenticación** - Implementar login y JWT

## Recursos Adicionales

- [Documentación de React](https://react.dev/)
- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de Express](https://expressjs.com/)
- [Documentación de MySQL](https://dev.mysql.com/doc/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Necesitas Ayuda?

- Revisa el `README.md` principal
- Consulta los README específicos en `frontend/` y `backend/`
- Busca en la documentación de las tecnologías utilizadas
