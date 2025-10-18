# POSWEBCrumen

🏪 **Sistema de Punto de Venta Completo** - Aplicación fullstack desarrollada con React + TypeScript + Vite (Frontend) y Node.js + Express + MySQL (Backend).

## 🚀 Características Principales

✅ **Pantalla de Presentación** - Logotipo animado con frases rotativas  
✅ **Sistema de Autenticación** - Validación contra base de datos con control de intentos  
✅ **Dashboard Principal** - Indicadores de ventas, servicios y estadísticas  
✅ **Gestión de Usuarios** - CRUD completo para administrar usuarios  
✅ **Gestión de Negocios** - CRUD completo para administrar negocios  
✅ **Navegación Intuitiva** - Menú lateral con categorías organizadas  
✅ **Responsive Design** - Funciona en desktop, tablet y móvil  

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Vite** como build tool
- **CSS puro** para estilos (sin frameworks)
- **Hooks personalizados** para lógica de negocio
- **Fetch API** para comunicación con backend

### Backend
- **Node.js** con Express
- **TypeScript** para tipado estricto
- **MySQL** como base de datos
- **bcrypt** para encriptación de contraseñas
- **CORS** configurado para frontend

### Base de Datos
- **MySQL** alojado en Azure
- Tablas: `tblposcrumenwebusuarios`, `tblposcrumenwebnegocio`, `tbl_access_attempts`

## 🚀 Ejecutar la Aplicación

### Desarrollo Local

1. **Iniciar Backend** (Terminal 1):
```bash
cd backend
npm run dev
```
✅ Backend corriendo en: `http://localhost:4000`

2. **Iniciar Frontend** (Terminal 2):
```bash
npm run dev
```
✅ Frontend corriendo en: `http://localhost:5173`

## 🎯 Flujo de la Aplicación

1. **Pantalla de Presentación** (5 frases, 2 segundos c/u)
2. **Pantalla de Login** (validación con control de intentos)
3. **Dashboard Principal** (4 indicadores + menú lateral)
4. **Navegación por Módulos**:
   - CONFIGURAR: Usuarios, Negocios, Productos, Recetas, Perfil, Recibos
   - VENTAS: Iniciar Venta, Indicadores
   - SISTEMA: Configuración, Reportes, Respaldos

## 📋 API Endpoints

### Autenticación
- `POST /api/auth/login` - Login de usuarios

### Usuarios
- `GET /api/usuarios` - Obtener todos los usuarios
- `POST /api/usuarios` - Crear nuevo usuario
- `PUT /api/usuarios/:id` - Actualizar usuario

### Negocios
- `GET /api/negocios` - Obtener todos los negocios
- `POST /api/negocios` - Crear nuevo negocio
- `PUT /api/negocios/:id` - Actualizar negocio

### Sistema
- `GET /health` - Health check del servidor

## 🧪 Testing

Para probar la aplicación:

1. ✅ Verificar backend: `http://localhost:4000/health`
2. ✅ Acceder al frontend: `http://localhost:5173`
3. ✅ Ver presentación animada
4. ✅ Probar login con credenciales válidas
5. ✅ Navegar por el dashboard
6. ✅ Crear usuarios y negocios

---

**POSWEBCrumen v1.0.0** - Sistema de Punto de Venta Completo  
Desarrollado con ❤️ por el equipo de CrumenDev
