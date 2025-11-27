# ⚠️ IMPORTANTE - Cómo Ejecutar el Proyecto

## El proyecto ahora tiene estructura separada Frontend/Backend

### ❌ NO Hacer esto (causa error):
```bash
cd C:\CRUMEN\Proyectos\pos
npm run dev   # ❌ ERROR: No hay package.json aquí
```

### ✅ SÍ Hacer esto:

## Opción 1: Ejecutar Frontend

```powershell
cd frontend
npm run dev
```

Esto iniciará el frontend en: **http://localhost:5173**

## Opción 2: Ejecutar Backend

```powershell
cd backend

# PRIMERO: Crear archivo .env con tus credenciales
# Copiar .env.example y editar:
copy .env.example .env

# Editar .env y agregar tu password de MySQL
# Ejemplo:
# DB_PASSWORD=tu_password_mysql

npm run dev
```

Esto iniciará el backend en: **http://localhost:3000**

## ⚡ Comandos Rápidos

### Frontend (en carpeta frontend/):
- `npm run dev` - Desarrollo
- `npm run build` - Compilar
- `npm run preview` - Preview

### Backend (en carpeta backend/):
- `npm run dev` - Desarrollo con hot-reload
- `npm run build` - Compilar TS
- `npm start` - Producción

## 🎯 Estado Actual

✅ **Frontend**: Ya está corriendo en http://localhost:5173  
⚠️ **Backend**: Necesita configuración de .env

## 🔧 Configurar Backend

1. Ir a carpeta backend:
   ```powershell
   cd backend
   ```

2. Crear archivo .env (copiar de .env.example):
   ```powershell
   copy .env.example .env
   ```

3. Editar .env con tus credenciales de MySQL:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=TU_PASSWORD_AQUI
   DB_NAME=pos_crumen
   ```

4. Crear la base de datos (si no existe):
   ```sql
   CREATE DATABASE pos_crumen;
   ```
   
   O ejecutar el script completo:
   ```powershell
   mysql -u root -p < database/schema.sql
   ```

5. Instalar dependencias:
   ```powershell
   npm install
   ```

6. Iniciar servidor:
   ```powershell
   npm run dev
   ```

## 📁 Estructura del Proyecto

```
pos/
├── frontend/         ← Aquí ejecutar: npm run dev
│   ├── package.json  ← Package del frontend
│   └── src/
│
└── backend/          ← Aquí ejecutar: npm run dev
    ├── package.json  ← Package del backend
    ├── .env.example  ← Copiar a .env
    └── src/
```

## 🆘 Solución Rápida

Si solo quieres ver el frontend funcionando:

```powershell
cd frontend
npm run dev
```

El frontend ya está corriendo en: **http://localhost:5173** ✅

Para agregar el backend después, sigue los pasos de configuración arriba.
