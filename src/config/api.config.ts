// Configuración de la API

// La URL base debe incluir /api al final
const rawApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const API_BASE_URL = rawApiUrl
  ? `${rawApiUrl}/api`
  : 'http://localhost:3000/api';

const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

export const config = {
  apiUrl: API_BASE_URL,
  timeout: API_TIMEOUT,
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      me: '/auth/me',
    },
    productos: {
      list: '/productos',
      create: '/productos',
      update: (id: number) => `/productos/${id}`,
      delete: (id: number) => `/productos/${id}`,
    },
    ventas: {
      list: '/ventas',
      create: '/ventas',
      detail: (id: number) => `/ventas/${id}`,
    },
    inventario: {
      list: '/inventario',
      create: '/inventario',
      stock: '/inventario/stock',
    },
  },
};

export default config;
