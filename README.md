# POS54N Web Crumen - Sistema POS y Comanda Digital

**Versión:** 2.5.B12  
**Proyecto**: Pos54nwebCrumen
**Organización**: Crumen

Frontend de la aplicación POS54N Web Crumen desarrollado con React, TypeScript y Vite. Sistema profesional de Punto de Venta (POS) con comanda digital para restaurantes.

## 📚 Documentación del Proyecto

### Documentación PMI (Project Management Institute)
- [📄 **PMI Documentation Index**](./PMI_DOCUMENTATION_INDEX.md) - Índice completo de documentación
- [📄 **Project Charter**](./PMI_PROJECT_CHARTER.md) - Acta de constitución del proyecto
- [📄 **Project Management Plan**](./PMI_PROJECT_MANAGEMENT_PLAN.md) - Plan de gestión completo

### Guías de Inicio Rápido
- [⚡ **Quick Start**](./QUICKSTART.md) - Inicio rápido
- [🚀 **How to Run**](./HOW_TO_RUN.md) - Instrucciones detalladas de ejecución
- [💻 **Development Guide**](./DEVELOPMENT_GUIDE.md) - Guía de desarrollo

### Seguridad y Autenticación
- [🔐 **Authentication Guide**](./AUTHENTICATION_GUIDE.md) - Sistema de autenticación
- [🔐 **Solución Login Crumen**](./SOLUCION_LOGIN_CRUMEN.md) - ⚠️ Solución para problemas de login con usuario Crumen
- [🔐 **Sistema de Auditoría de Login**](./SISTEMA_AUDITORIA_LOGIN.md) - Auditoría completa
- [🔐 **Sistema de Sesiones**](./SISTEMA_SESIONES.md) - Gestión de sesiones JWT
- [🔐 **Comportamiento de Expiración**](./COMPORTAMIENTO_EXPIRACION_SESION.md) - Sesiones con pantalla bloqueada

### Despliegue y Producción
- [🚀 **Deploy Checklist**](./DEPLOY_CHECKLIST.md) - Lista de verificación
- [🚀 **Producción**](./PRODUCCION.md) - Guía de producción
- [🚀 **Render Deploy**](./RENDER.md) - Despliegue en Render.com

---

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

Equipo CRUMEN-420IA ♥️
