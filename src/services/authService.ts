import { api } from './api';

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
   * Verifica si la tabla tblposcrumenwebusuarios está vacía
   */
  checkUsersTableEmpty: async (): Promise<{ isEmpty: boolean; count: number }> => {
    try {
      const response = await api.get<{ success: boolean; data: { isEmpty: boolean; count: number } }>('/auth/check-users-empty');
      return response.data.data;
    } catch (error) {
      console.error('Error al verificar tabla de usuarios:', error);
      throw error;
    }
  },

  /**
   * Realiza auto-login cuando la tabla está vacía
   * Crea una sesión temporal de 2 minutos
   */
  autoLogin: async (): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/auto-login');
      return response.data;
    } catch (error: any) {
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
  },

  /**
   * Elimina los datos de autenticación
   */
  clearAuthData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
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
