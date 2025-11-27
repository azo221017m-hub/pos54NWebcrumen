# 📚 Guía de Desarrollo - Ejemplos de Uso

Esta guía muestra ejemplos prácticos de cómo usar la estructura del proyecto.

## 🎯 Crear un Nuevo Feature

### Ejemplo: Agregar módulo de "Clientes"

#### 1. Crear estructura de carpetas

```bash
cd frontend/src/features
mkdir -p clientes/components clientes/pages clientes/services
```

#### 2. Crear tipos (clientes/types.ts)

```typescript
export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
}

export interface CreateClienteDto {
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
}
```

#### 3. Crear servicio (clientes/services/clientes.service.ts)

```typescript
import { api } from '../../../services/api';
import { Cliente, CreateClienteDto } from '../types';

export const clientesService = {
  async getAll() {
    const response = await api.get<Cliente[]>('/clientes');
    return response.data;
  },

  async create(data: CreateClienteDto) {
    const response = await api.post<Cliente>('/clientes', data);
    return response.data;
  },
};
```

#### 4. Crear página (clientes/pages/ClientesPage.tsx)

```typescript
import { useState, useEffect } from 'react';
import { clientesService } from '../services/clientes.service';
import { Cliente } from '../types';

export const ClientesPage = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    const data = await clientesService.getAll();
    setClientes(data);
  };

  return (
    <div>
      <h1>Clientes</h1>
      <ul>
        {clientes.map(cliente => (
          <li key={cliente.id}>{cliente.nombre}</li>
        ))}
      </ul>
    </div>
  );
};
```

## 🔌 Crear un Endpoint en el Backend

### Ejemplo: API de Clientes

#### 1. Crear modelo (backend/src/models/cliente.model.ts)

```typescript
import { pool } from '../config/db';
import { Cliente, CreateClienteDto } from '../types/cliente.types';

export const clienteModel = {
  async findAll(): Promise<Cliente[]> {
    const [rows] = await pool.query('SELECT * FROM clientes');
    return rows as Cliente[];
  },

  async create(data: CreateClienteDto): Promise<Cliente> {
    const [result] = await pool.query(
      'INSERT INTO clientes (nombre, email, telefono, direccion) VALUES (?, ?, ?, ?)',
      [data.nombre, data.email, data.telefono, data.direccion]
    );
    return { id: (result as any).insertId, ...data } as Cliente;
  },
};
```

#### 2. Crear servicio (backend/src/services/cliente.service.ts)

```typescript
import { clienteModel } from '../models/cliente.model';
import { CreateClienteDto } from '../types/cliente.types';

export const clienteService = {
  async getAllClientes() {
    return await clienteModel.findAll();
  },

  async createCliente(data: CreateClienteDto) {
    // Validaciones aquí
    return await clienteModel.create(data);
  },
};
```

#### 3. Crear controlador (backend/src/controllers/cliente.controller.ts)

```typescript
import { Request, Response } from 'express';
import { clienteService } from '../services/cliente.service';

export const clienteController = {
  async getAll(req: Request, res: Response) {
    try {
      const clientes = await clienteService.getAllClientes();
      res.json({ success: true, data: clientes });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al obtener clientes' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const cliente = await clienteService.createCliente(req.body);
      res.status(201).json({ success: true, data: cliente });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Error al crear cliente' });
    }
  },
};
```

#### 4. Crear rutas (backend/src/routes/cliente.routes.ts)

```typescript
import { Router } from 'express';
import { clienteController } from '../controllers/cliente.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/', authMiddleware, clienteController.getAll);
router.post('/', authMiddleware, clienteController.create);

export default router;
```

#### 5. Registrar en app.ts

```typescript
// En backend/src/app.ts
import clienteRoutes from './routes/cliente.routes';

// ... otros imports

app.use('/api/clientes', clienteRoutes);
```

## 🎨 Crear un Componente Reutilizable

### Ejemplo: Card Component

```typescript
// frontend/src/components/Card/Card.tsx
import { ReactNode } from 'react';
import './Card.css';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export const Card = ({ title, children, className = '' }: CardProps) => {
  return (
    <div className={`card ${className}`}>
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-content">{children}</div>
    </div>
  );
};
```

### Uso:

```typescript
import { Card } from '../../components/Card/Card';

<Card title="Producto">
  <p>Detalles del producto...</p>
</Card>
```

## 🪝 Crear un Hook Personalizado

### Ejemplo: useLocalStorage

```typescript
// frontend/src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

### Uso:

```typescript
const [user, setUser] = useLocalStorage('user', null);
```

## 🌐 Conectar Frontend con Backend

### 1. Agregar endpoint en config

```typescript
// frontend/src/config/api.config.ts
export const config = {
  // ...
  endpoints: {
    // ...
    clientes: {
      list: '/clientes',
      create: '/clientes',
      update: (id: number) => `/clientes/${id}`,
      delete: (id: number) => `/clientes/${id}`,
    },
  },
};
```

### 2. Usar el servicio en un componente

```typescript
import { useState } from 'react';
import { clientesService } from '../services/clientes.service';

export const CreateClienteForm = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await clientesService.create({ nombre, email });
      alert('Cliente creado!');
    } catch (error) {
      alert('Error al crear cliente');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button type="submit">Crear</button>
    </form>
  );
};
```

## 🔐 Proteger Rutas

### Frontend - Componente ProtectedRoute

```typescript
// frontend/src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

### Uso en Router:

```typescript
<Route
  path="/productos"
  element={
    <ProtectedRoute>
      <ProductosPage />
    </ProtectedRoute>
  }
/>
```

## 📊 Usar el Hook useFetch

```typescript
import { useFetch } from '../../hooks/useFetch';
import { productosService } from '../features/productos/services/productos.service';

export const ProductsList = () => {
  const { data, loading, error } = useFetch(
    () => productosService.getAll()
  );

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data?.map(producto => (
        <li key={producto.id}>{producto.nombre}</li>
      ))}
    </ul>
  );
};
```

## 🎯 Buenas Prácticas

### 1. Manejo de Errores

```typescript
// Backend
try {
  const result = await service.doSomething();
  res.json({ success: true, data: result });
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    error: error.message || 'Error interno del servidor'
  });
}

// Frontend
try {
  const data = await api.get('/endpoint');
  // Manejar éxito
} catch (error) {
  // Mostrar mensaje de error al usuario
  console.error('Error:', error);
}
```

### 2. Validación de Datos

```typescript
// Backend
const validateCliente = (data: CreateClienteDto) => {
  if (!data.nombre || data.nombre.trim() === '') {
    throw new Error('El nombre es requerido');
  }
  if (!data.email || !isValidEmail(data.email)) {
    throw new Error('Email inválido');
  }
};
```

### 3. Tipado Fuerte

```typescript
// Siempre usa tipos explícitos
const getProducto = async (id: number): Promise<Producto> => {
  // ...
};

// Evita 'any'
const productos: Producto[] = []; // ✅
const productos: any[] = [];      // ❌
```

## 🚀 Comandos Útiles

```bash
# Frontend
npm run dev          # Desarrollo
npm run build        # Compilar
npm run preview      # Preview producción

# Backend
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TS a JS
npm start            # Producción

# Ambos
npm install <paquete>     # Instalar dependencia
npm install -D <paquete>  # Instalar dev dependency
```

## 📝 Checklist para Nuevo Feature

- [ ] Crear estructura de carpetas
- [ ] Definir tipos TypeScript
- [ ] Crear servicio de API (frontend)
- [ ] Crear modelo de datos (backend)
- [ ] Crear servicio de lógica (backend)
- [ ] Crear controlador (backend)
- [ ] Crear rutas (backend)
- [ ] Registrar rutas en app.ts
- [ ] Crear componentes (frontend)
- [ ] Crear páginas (frontend)
- [ ] Agregar al router
- [ ] Probar endpoint con Postman/Thunder Client
- [ ] Conectar frontend con backend
- [ ] Manejar estados de carga y error
- [ ] Agregar validaciones

---

**Siguiente paso**: ¡Empieza a desarrollar tus features! 🎉
