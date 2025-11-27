# Frontend - Web POS Crumen

Frontend de la aplicación POS desarrollado con React, TypeScript y Vite.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview
```

## 📁 Estructura de Carpetas

```
src/
├── assets/          → Recursos estáticos (imágenes, iconos, fuentes)
├── components/      → Componentes reutilizables globales
├── features/        → Módulos por funcionalidad
│   ├── productos/   → Gestión de productos
│   ├── ventas/      → Punto de venta y transacciones
│   ├── inventario/  → Control de inventario
│   └── auth/        → Autenticación y autorización
├── hooks/           → Hooks personalizados
├── layouts/         → Layouts de página
├── pages/           → Páginas principales
├── router/          → Configuración de rutas
├── store/           → Estado global (Zustand/Redux/Context)
├── types/           → Tipos TypeScript globales
├── utils/           → Funciones auxiliares
├── services/        → Cliente API (Axios/Fetch)
└── config/          → Configuraciones
```

## 🛠️ Tecnologías

- **React 18** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Zustand/Redux** - Estado global
- **TailwindCSS** - Estilos (opcional)

## 📝 Convenciones

- Usar componentes funcionales con hooks
- Nombres de archivos en camelCase
- Componentes en PascalCase
- Tipos en interfaces cuando sea posible
- Comentar lógica compleja

## 🔗 Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Web POS Crumen
```

## 📱 PWA

La aplicación incluye capacidades de PWA configuradas en `vite.config.ts`.
