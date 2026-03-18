import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import config from '../config/api.config';
import { autoLogout } from './sessionService';

// Crear instancia de Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json',
    // Prevent caching of API responses - always fetch fresh data
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
});

// Interceptor para agregar token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Endpoints de autenticación que no deben disparar auto-logout en 401
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register'];

// Claves de localStorage que identifican una sesión de cliente web
// (deben coincidir con las definidas en clienteWebService.ts)
const CLIENTE_MODE_KEY = 'clienteMode';
const CLIENTE_SESSION_KEY = 'clienteWebSession';

// Estructura estándar de respuesta de error del servidor
interface ApiErrorResponse {
  success: boolean;
  message: string;
  error?: string;
}

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const requestUrl = error.config?.url || '';
    
    // Extraer el mensaje de error del servidor si está disponible,
    // para reemplazar el mensaje genérico de Axios (e.g. "Request failed with status code 500")
    const responseData = error.response?.data as ApiErrorResponse | undefined;
    if (responseData?.message && typeof responseData.message === 'string') {
      error.message = responseData.message;
    }

    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      // No hacer auto-logout para endpoints de autenticación (login/register)
      // ya que 401 es una respuesta esperada para credenciales incorrectas
      const isAuthEndpoint = AUTH_ENDPOINTS.some(endpoint => requestUrl.includes(endpoint));
      
      if (!isAuthEndpoint) {
        // Token expirado, inválido o no autorizado (en endpoints protegidos)
        const isClienteMode = localStorage.getItem(CLIENTE_MODE_KEY) === 'true';
        const isClientePath = window.location.pathname.startsWith('/clientes');
        if (isClienteMode || isClientePath) {
          // Clear cliente-specific session data so PageClientes shows login options
          localStorage.removeItem(CLIENTE_MODE_KEY);
          localStorage.removeItem(CLIENTE_SESSION_KEY);
          autoLogout('/clientes');
        } else {
          autoLogout('/login');
        }
      }
      return Promise.reject(error);
    }
    
    // Manejar errores de autorización
    if (error.response?.status === 403) {
      console.error('Acceso denegado: no tienes permisos para realizar esta acción');
      // No hacer logout, solo rechazar la promesa
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// Funciones helper
export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.get<T>(url, config);
  },
  
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.post<T>(url, data, config);
  },
  
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.put<T>(url, data, config);
  },
  
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.patch<T>(url, data, config);
  },
  
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.delete<T>(url, config);
  },
};

export default apiClient;
