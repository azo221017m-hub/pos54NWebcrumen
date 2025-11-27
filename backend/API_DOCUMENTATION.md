# Documentación API - POS Crumen

## 📋 Tabla de Contenido
- [Configuración](#configuración)
- [Autenticación](#autenticación)
- [Productos](#productos)
- [Ventas](#ventas)
- [Inventario](#inventario)

---

## 🔧 Configuración

### Variables de Entorno (.env)

```env
# Base de Datos MySQL Azure
DB_HOST=crumenprod01.mysql.database.azure.com
DB_USER=azavala
DB_PASSWORD=Z4vaLA$Ant
DB_NAME=bdcdttx
DB_PORT=3306

# Servidor
PORT=3000

# JWT
JWT_SECRET=crumen_pos_secret_key_2024_secure_token

# Entorno
NODE_ENV=development
```

### Iniciar Servidor

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm run build
npm start

# Verificar base de datos
npm run db:verify
```

---

## 🔐 Autenticación

Todos los endpoints (excepto `/api/auth/login` y `/api/auth/register`) requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

### POST /api/auth/login

Iniciar sesión y obtener token JWT.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "usuario@example.com",
      "rol": "admin"
    }
  }
}
```

**Errores:**
- `400` - Email y contraseña requeridos
- `401` - Credenciales inválidas

---

### POST /api/auth/register

Registrar un nuevo usuario.

**Request Body:**
```json
{
  "nombre": "María García",
  "email": "maria@example.com",
  "password": "segura123",
  "rol": "vendedor"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente"
}
```

**Errores:**
- `400` - Campos requeridos faltantes
- `409` - Email ya registrado

---

### GET /api/auth/verify

Verificar si el token JWT es válido.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token válido",
  "data": {
    "usuario": {
      "id": 1,
      "email": "usuario@example.com",
      "rol": "admin"
    }
  }
}
```

---

## 📦 Productos

### GET /api/productos

Obtener todos los productos activos.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Café Americano",
      "descripcion": "Café negro tradicional",
      "precio": 25.00,
      "costo": 10.00,
      "codigo_barras": "7501234567890",
      "categoria_id": 1,
      "categoria_nombre": "Bebidas",
      "stock_actual": 50,
      "activo": true
    }
  ]
}
```

---

### GET /api/productos/:id

Obtener un producto específico por ID.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Café Americano",
    "descripcion": "Café negro tradicional",
    "precio": 25.00,
    "costo": 10.00,
    "codigo_barras": "7501234567890",
    "categoria_id": 1,
    "categoria_nombre": "Bebidas",
    "stock_actual": 50,
    "activo": true
  }
}
```

**Errores:**
- `404` - Producto no encontrado

---

### POST /api/productos

Crear un nuevo producto.

**Request Body:**
```json
{
  "nombre": "Latte",
  "descripcion": "Café con leche",
  "precio": 35.00,
  "costo": 15.00,
  "codigo_barras": "7501234567891",
  "categoria_id": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": {
    "id": 2
  }
}
```

**Errores:**
- `400` - Campos requeridos faltantes

---

### PUT /api/productos/:id

Actualizar un producto existente.

**Request Body:**
```json
{
  "nombre": "Latte Grande",
  "precio": 40.00
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Producto actualizado exitosamente"
}
```

**Errores:**
- `404` - Producto no encontrado

---

### DELETE /api/productos/:id

Eliminar un producto (soft delete).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Producto eliminado exitosamente"
}
```

**Errores:**
- `404` - Producto no encontrado

---

## 💰 Ventas

### GET /api/ventas

Obtener las últimas 100 ventas.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuario_id": 1,
      "cliente_id": 5,
      "total": 125.50,
      "metodo_pago": "efectivo",
      "fecha": "2024-11-19T20:30:00.000Z",
      "usuario_nombre": "Juan Pérez",
      "cliente_nombre": "Ana López"
    }
  ]
}
```

---

### GET /api/ventas/:id

Obtener una venta específica con sus items.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "usuario_id": 1,
    "cliente_id": 5,
    "total": 125.50,
    "metodo_pago": "efectivo",
    "fecha": "2024-11-19T20:30:00.000Z",
    "usuario_nombre": "Juan Pérez",
    "cliente_nombre": "Ana López",
    "items": [
      {
        "id": 1,
        "venta_id": 1,
        "producto_id": 1,
        "cantidad": 3,
        "precio_unitario": 25.00,
        "subtotal": 75.00,
        "producto_nombre": "Café Americano"
      },
      {
        "id": 2,
        "venta_id": 1,
        "producto_id": 2,
        "cantidad": 1,
        "precio_unitario": 50.50,
        "subtotal": 50.50,
        "producto_nombre": "Sandwich"
      }
    ]
  }
}
```

**Errores:**
- `404` - Venta no encontrada

---

### POST /api/ventas

Registrar una nueva venta.

**Request Body:**
```json
{
  "usuario_id": 1,
  "cliente_id": 5,
  "metodo_pago": "tarjeta",
  "items": [
    {
      "producto_id": 1,
      "cantidad": 2,
      "precio_unitario": 25.00,
      "subtotal": 50.00
    },
    {
      "producto_id": 2,
      "cantidad": 1,
      "precio_unitario": 35.00,
      "subtotal": 35.00
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Venta registrada exitosamente",
  "data": {
    "id": 10
  }
}
```

**Errores:**
- `400` - Campos requeridos faltantes
- `500` - Error al procesar la venta

---

### GET /api/ventas/dia

Obtener estadísticas de ventas del día actual.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_ventas": 25,
    "total_vendido": 3450.75,
    "promedio_venta": 138.03
  }
}
```

---

## 📊 Inventario

### GET /api/inventario

Obtener todo el inventario.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "producto_id": 1,
      "cantidad": 50,
      "stock_minimo": 10,
      "ultima_actualizacion": "2024-11-19T20:00:00.000Z",
      "producto_nombre": "Café Americano",
      "producto_precio": 25.00
    }
  ]
}
```

---

### GET /api/inventario/producto/:producto_id

Obtener inventario de un producto específico.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "producto_id": 1,
    "cantidad": 50,
    "stock_minimo": 10,
    "ultima_actualizacion": "2024-11-19T20:00:00.000Z",
    "producto_nombre": "Café Americano",
    "producto_precio": 25.00
  }
}
```

**Errores:**
- `404` - Inventario no encontrado

---

### GET /api/inventario/bajo-stock

Obtener productos con stock bajo o agotado.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "producto_id": 15,
      "cantidad": 5,
      "stock_minimo": 20,
      "ultima_actualizacion": "2024-11-19T19:00:00.000Z",
      "producto_nombre": "Azúcar",
      "producto_precio": 15.00
    }
  ]
}
```

---

### PUT /api/inventario/producto/:producto_id

Actualizar inventario de un producto.

**Request Body:**
```json
{
  "cantidad": 100,
  "stock_minimo": 20
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Inventario actualizado exitosamente"
}
```

**Errores:**
- `400` - Debe proporcionar cantidad o stock_minimo

---

### POST /api/inventario/producto/:producto_id/ajustar

Ajustar stock (sumar o restar).

**Request Body:**
```json
{
  "cantidad": 50,
  "tipo": "suma"
}
```

O para restar:

```json
{
  "cantidad": 10,
  "tipo": "resta"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Stock ajustado exitosamente"
}
```

**Errores:**
- `400` - Cantidad y tipo requeridos
- `400` - Tipo debe ser "suma" o "resta"

---

## 🏥 Health Check

### GET /api/health

Verificar que el servidor está funcionando.

**Response (200 OK):**
```json
{
  "status": "ok",
  "message": "API POS Crumen funcionando correctamente",
  "timestamp": "2024-11-19T20:45:00.000Z"
}
```

---

## ⚠️ Manejo de Errores

Todos los endpoints pueden retornar estos códigos de error:

- `400 Bad Request` - Parámetros inválidos o faltantes
- `401 Unauthorized` - Token inválido o expirado
- `404 Not Found` - Recurso no encontrado
- `409 Conflict` - Conflicto (ej: email duplicado)
- `500 Internal Server Error` - Error del servidor

**Formato de respuesta de error:**
```json
{
  "success": false,
  "message": "Descripción del error"
}
```

---

## 🔒 Seguridad

- **Autenticación JWT**: Tokens con expiración de 24 horas
- **Bcrypt**: Contraseñas hasheadas con 10 rondas
- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configurado para permitir peticiones cross-origin

---

## 📝 Notas Adicionales

### Tablas Existentes en la Base de Datos

La base de datos `bdcdttx` contiene las siguientes tablas con prefijo `tblposcrumenweb`:

- `tblposcrumenwebusuarios`
- `tblposcrumenwebproductos`
- `tblposcrumenwebcategorias`
- `tblposcrumenwebclientes`
- `tblposcrumenwebmovimientos`
- `tblposcrumenwebdetallemovimientos`
- `tblposcrumenwebinsumos`
- Y más...

Los endpoints actuales están configurados para usar los nombres de tabla estándar (`usuarios`, `productos`, etc.). Si necesitas adaptarlos a las tablas existentes, modifica los queries SQL en los controladores.

---

## 🚀 Testing con cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pos.com","password":"admin123"}'
```

### Obtener Productos (con token)
```bash
curl -X GET http://localhost:3000/api/productos \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Crear Producto
```bash
curl -X POST http://localhost:3000/api/productos \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Cappuccino","precio":30,"categoria_id":1}'
```
