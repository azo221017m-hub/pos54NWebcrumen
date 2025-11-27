# Backend - API REST POS Crumen

API REST desarrollada con Node.js, Express, TypeScript y MySQL.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar en producción
npm start
```

## 📁 Estructura de Carpetas

```
src/
├── config/         → Configuraciones (DB, CORS, etc.)
├── models/         → Modelos y consultas a MySQL
├── services/       → Lógica de negocio
├── controllers/    → Controladores de rutas
├── routes/         → Definición de endpoints
├── middlewares/    → Middleware (auth, validación, errores)
├── utils/          → Funciones auxiliares
├── types/          → Tipos TypeScript
├── app.ts          → Configuración de Express
└── server.ts       → Punto de entrada
```

## 🗄️ Base de Datos

### Configurar MySQL

```sql
CREATE DATABASE pos_crumen;
USE pos_crumen;

-- Las tablas se crearán mediante migraciones o scripts SQL
```

### Estructura básica

- **usuarios** - Usuarios del sistema
- **productos** - Catálogo de productos
- **ventas** - Registro de ventas
- **ventas_items** - Detalle de productos vendidos
- **inventario** - Movimientos de inventario
- **categorias** - Categorías de productos

## 🔐 Autenticación

Se utiliza JWT (JSON Web Tokens) para la autenticación.

```typescript
// Header de autorización
Authorization: Bearer <token>
```

## 📝 API Endpoints

### Auth
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Obtener usuario actual

### Productos
- `GET /api/productos` - Listar productos
- `POST /api/productos` - Crear producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### Ventas
- `GET /api/ventas` - Listar ventas
- `POST /api/ventas` - Registrar venta
- `GET /api/ventas/:id` - Detalle de venta

### Inventario
- `GET /api/inventario` - Listar movimientos
- `POST /api/inventario` - Registrar movimiento
- `GET /api/inventario/stock` - Consultar stocks

## 🛠️ Tecnologías

- **Node.js** - Runtime
- **Express** - Framework web
- **TypeScript** - Lenguaje
- **MySQL** - Base de datos
- **JWT** - Autenticación
- **Bcrypt** - Hash de contraseñas

## 🔒 Variables de Entorno

Ver `.env.example` para la configuración completa.
