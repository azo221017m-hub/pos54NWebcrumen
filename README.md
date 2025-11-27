# Web POS Crumen

Sistema moderno de Punto de Venta (POS) construido con React, TypeScript, Vite y MySQL. Esta aplicación funciona tanto como app web como aplicación progresiva (PWA) para dispositivos móviles.

## ✨ Estado del Proyecto

### ✅ Completado

#### Frontend
- ✅ Página de inicio (Landing) con animaciones y frases rotativas
- ✅ Página de login con diseño moderno y minimalista
- ✅ Dashboard con navegación y tarjetas de acceso rápido
- ✅ React Router configurado con rutas públicas
- ✅ Diseño responsive sin scroll (optimizado para toda la pantalla)
- ✅ PWA configurado con Service Worker

#### Backend
- ✅ Servidor Express con TypeScript
- ✅ Conexión a base de datos MySQL Azure
- ✅ Endpoints de autenticación (login, register, verify)
- ✅ Endpoints de productos (CRUD completo)
- ✅ Endpoints de ventas (crear, listar, estadísticas)
- ✅ Endpoints de inventario (consultar, actualizar, bajo stock)
- ✅ Middleware de autenticación JWT
- ✅ Documentación completa de API

## 🚀 Características

- ⚡️ **Vite** - Build tool ultrarrápido
- ⚛️ **React 18** - Framework moderno con hooks
- 🎯 **TypeScript** - Type safety en frontend y backend
- 📱 **PWA Support** - Instalable en móviles y desktop
- 🔒 **JWT Auth** - Autenticación segura con tokens
- 🗄️ **MySQL Azure** - Base de datos en la nube
- 🎨 **UI Moderna** - Diseño minimalista con animaciones

### Módulos Funcionales

- **🛍️ Productos** - Gestión completa del catálogo
- **💰 Ventas** - Punto de venta y registro de transacciones
- **📦 Inventario** - Control de stock y movimientos
- **🔐 Autenticación** - Login, registro y control de acceso

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 7
- **Language**: TypeScript
- **Routing**: React Router
- **HTTP Client**: Axios
- **State Management**: Zustand / Redux / Context API
- **PWA**: vite-plugin-pwa with Workbox
- **Styling**: CSS / TailwindCSS (opcional)

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Bcrypt
- **Validation**: Express Validator (opcional)

### Database
- **MySQL 8.0+** - Base de datos relacional

## 📦 Instalación

Este proyecto está dividido en dos partes: **frontend** y **backend**.

### Instalación del Frontend

```bash
cd frontend
npm install
```

### Instalación del Backend

```bash
cd backend
npm install
```

### Configuración de Base de Datos

El backend está conectado a MySQL en Azure. Las credenciales están en `backend/.env`:

```env
DB_HOST=crumenprod01.mysql.database.azure.com
DB_USER=azavala
DB_PASSWORD=Z4vaLA$Ant
DB_NAME=bdcdttx
DB_PORT=3306
```

## 🏃‍♂️ Desarrollo

### Iniciar Frontend

```bash
cd frontend
npm run dev
```

El frontend estará disponible en `http://localhost:5173/`

**Páginas disponibles:**
- `/` - Landing page con animaciones
- `/login` - Página de inicio de sesión
- `/dashboard` - Panel principal (requiere login)

### Iniciar Backend

```bash
cd backend
npm run dev
```

La API estará disponible en `http://localhost:3000/`

**Verificar conexión a BD:**
```bash
cd backend
npm run db:verify
```

## 🏗️ Compilación para Producción

### Frontend

```bash
cd frontend
npm run build
npm run preview  # Previsualizar build
```

Los archivos compilados estarán en `frontend/dist/`

### Backend

```bash
cd backend
npm run build
npm start
```

Los archivos compilados estarán en `backend/dist/`

## 📱 PWA Features

Esta aplicación incluye capacidades PWA:

- **Soporte Offline**: Funciona sin conexión a internet
- **Instalable**: Se puede instalar en dispositivos móviles y desktop
- **Auto Updates**: Service worker se actualiza automáticamente
- **Experiencia de App**: Modo pantalla completa con iconos de app

## 🔌 API Endpoints

Ver documentación completa en: `backend/API_DOCUMENTATION.md`

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/verify` - Verificar token

### Productos
- `GET /api/productos` - Listar productos (con paginación y filtros)
- `POST /api/productos` - Crear nuevo producto
- `GET /api/productos/:id` - Obtener detalle de producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### Ventas
- `GET /api/ventas` - Listar ventas
- `POST /api/ventas` - Registrar nueva venta
- `GET /api/ventas/:id` - Detalle de venta
- `GET /api/ventas/reportes` - Reportes de ventas

### Inventario
- `GET /api/inventario` - Listar movimientos de inventario
- `POST /api/inventario` - Registrar movimiento (entrada/salida/ajuste)
- `GET /api/inventario/stock` - Consultar stocks actuales
- `GET /api/inventario/alertas` - Productos con stock bajo

## 🏗️ Arquitectura

### Frontend - Feature-Based Architecture

El frontend utiliza una arquitectura basada en features/módulos:

```
features/
├── productos/      → Todo relacionado a productos
├── ventas/         → Todo relacionado a ventas
├── inventario/     → Todo relacionado a inventario
└── auth/           → Todo relacionado a autenticación
```

Cada feature contiene:
- `components/` - Componentes específicos del feature
- `pages/` - Páginas del feature
- `services/` - Llamadas a la API específicas
- `types.ts` - Tipos TypeScript del feature

### Backend - Layered Architecture

El backend sigue una arquitectura en capas:

```
Routes → Controllers → Services → Models → Database
```

- **Routes**: Define los endpoints
- **Controllers**: Maneja requests/responses
- **Services**: Lógica de negocio
- **Models**: Interacción con la base de datos
- **Middlewares**: Autenticación, validación, errores

## 📝 Available Scripts

### Frontend (cd frontend)
- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm run preview` - Previsualizar build de producción
- `npm run lint` - Ejecutar ESLint

### Backend (cd backend)
- `npm run dev` - Iniciar servidor en modo desarrollo (con hot reload)
- `npm run build` - Compilar TypeScript a JavaScript
- `npm start` - Iniciar servidor en modo producción
- `npm run lint` - Ejecutar ESLint

## 🌐 Browser Support

Works on all modern browsers that support ES6+:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## 📄 Project Structure

```
pos/
│
├── frontend/                → Aplicación React Vite TS
│   ├── public/              → Recursos estáticos públicos
│   ├── src/                 → Código principal del frontend
│   │   ├── assets/          → Imágenes, íconos, fuentes
│   │   ├── components/      → Componentes reutilizables
│   │   ├── features/        → Módulos funcionales (productos, ventas, inventarios...)
│   │   │   ├── productos/
│   │   │   │   ├── components/
│   │   │   │   ├── pages/
│   │   │   │   ├── services/ → llamadas a la API
│   │   │   │   └── types.ts
│   │   │   ├── ventas/
│   │   │   ├── inventario/
│   │   │   └── auth/
│   │   ├── hooks/           → Hooks personalizados (useAuth, useFetch, etc.)
│   │   ├── layouts/         → Estructuras visuales maestras (DashboardLayout)
│   │   ├── pages/           → Páginas principales del sitio
│   │   ├── router/          → React Router config
│   │   ├── store/           → Estado global (Zustand, Redux o Context)
│   │   ├── types/           → Tipos globales TS
│   │   ├── utils/           → Funciones auxiliares (formatos, validaciones)
│   │   ├── services/        → Cliente API general (Axios/Fetch)
│   │   ├── config/          → Configuraciones globales (env, rutas API)
│   │   └── main.tsx         → Punto de entrada
│   │
│   ├── index.html           → HTML template
│   ├── vite.config.ts       → Configuración de Vite
│   └── package.json         → Dependencias frontend
│
│
├── backend/                 → API REST Node.js + Express + MySQL
│   ├── src/
│   │   ├── config/          → Configuración global (DB, cors, env)
│   │   │   └── db.ts
│   │   ├── models/          → Consultas a MySQL / entidades
│   │   ├── services/        → Regla de negocio (cálculo recetas, inventario)
│   │   ├── controllers/     → Reciben peticiones y devuelven respuestas
│   │   ├── routes/          → Rutas públicas de la API
│   │   ├── middlewares/     → Autenticación, validaciones, manejo de errores
│   │   ├── utils/           → Helpers y herramientas generales
│   │   ├── types/           → Tipos TypeScript para backend (DTOs, entidades)
│   │   ├── app.ts           → Configuración principal de Express
│   │   └── server.ts        → Inicio del servidor
│   │
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                → Documentación general del proyecto
```

## 🔧 Configuration

PWA configuration is in `vite.config.ts`. Customize the manifest, icons, and service worker behavior as needed.

## 📚 Documentación Adicional

Este proyecto incluye guías detalladas para facilitar el desarrollo:

- **[QUICKSTART.md](./QUICKSTART.md)** - Guía de inicio rápido paso a paso
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Resumen completo del proyecto y estructura
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Ejemplos prácticos de desarrollo
- **[frontend/README.md](./frontend/README.md)** - Documentación específica del frontend
- **[backend/README.md](./backend/README.md)** - Documentación específica del backend

## 🤝 Contribuir

1. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
2. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
3. Push a la rama (`git push origin feature/nueva-funcionalidad`)
4. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y propietario.

---

## React + TypeScript + Vite - Technical Notes

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
