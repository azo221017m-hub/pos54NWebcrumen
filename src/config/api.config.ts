// Configuración de la API

// La URL base debe incluir /api al final
// Sin VITE_API_URL, se usa una ruta relativa al origen actual (localhost,
// IP de LAN o túnel) para que pase por el proxy /api de Vite hacia el
// backend local, en vez de apuntar siempre a http://localhost:3000.
const rawApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const API_BASE_URL = rawApiUrl ? `${rawApiUrl}/api` : '/api';

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
