import { api } from './api';
import { clearServiceWorkerCache } from './sessionService';

export interface Usuario {
  id: number;
  nombre: string;
  alias: string;
  telefono: string;
  idNegocio: number;
  idRol: number;
  estatus: number;
}

export interface LoginRequest {
  alias: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    usuario: Usuario;
  };
  bloqueado?: boolean;
  fechaBloqueado?: string;
  intentosRestantes?: number;
  advertencia?: string;
}

/**
 * Servicio de autenticación
 * Maneja el login validando contra la base de datos tblposcrumenwebusuarios
 */
export const authService = {
  /**
   * Inicia sesión con alias y contraseña
   * @param alias - Nombre de usuario (alias)
   * @param password - Contraseña
   * @returns Respuesta del servidor con token y datos del usuario
   */
  login: async (alias: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email: alias, // El backend espera el campo 'email' pero valida contra 'alias' en la BD
        password
      });
      return response.data;
    } catch (error: any) {
      // Manejar errores de la API
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  /**
   * Almacena los datos del usuario y token en localStorage
   */
  saveAuthData: (token: string, usuario: Usuario) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    // Store idnegocio separately for backward compatibility with legacy components
    if (usuario.idNegocio) {
      localStorage.setItem('idnegocio', usuario.idNegocio.toString());
    }
  },

  /**
   * Elimina los datos de autenticación
   * Limpia localStorage y sessionStorage (excepto mensajes de logout)
   */
  clearAuthData: () => {
    // Limpiar localStorage - datos de autenticación
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('idnegocio');
    
    // Limpiar sessionStorage - excepto el mensaje de logout si existe
    const logoutMessage = sessionStorage.getItem('logoutMessage');
    sessionStorage.clear();
    if (logoutMessage) {
      sessionStorage.setItem('logoutMessage', logoutMessage);
    }
    
    // Limpiar cualquier otro dato relacionado con la sesión del usuario anterior
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('user_') || 
        key.startsWith('session_') || 
        key.startsWith('cache_')
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Limpiar cache del service worker (PWA) de forma asíncrona
    // Esto previene que datos cacheados de API se muestren al siguiente usuario
    // Se ejecuta sin await (fire-and-forget) para no bloquear el flujo de logout
    // Si falla, se loggea pero no interrumpe la sesión
    clearServiceWorkerCache().catch(err => {
      console.error('Error al limpiar cache del service worker:', err);
    });
  },

  /**
   * Verifica si hay una sesión activa
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    return !!(token && usuario);
  }
};
