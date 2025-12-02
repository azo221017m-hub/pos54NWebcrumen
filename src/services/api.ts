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

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const requestUrl = error.config?.url || '';
    
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      // No hacer auto-logout para endpoints de autenticación (login/register)
      // ya que 401 es una respuesta esperada para credenciales incorrectas
      const isAuthEndpoint = AUTH_ENDPOINTS.some(endpoint => requestUrl.includes(endpoint));
      
      if (!isAuthEndpoint) {
        // Token expirado, inválido o no autorizado (en endpoints protegidos)
        autoLogout('/login', 'Tu sesión ha expirado o es inválida. Por favor, inicia sesión nuevamente.');
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
