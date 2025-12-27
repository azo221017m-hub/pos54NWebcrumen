import { api } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    usuario: {
      id: number;
      nombre: string;
      alias: string;
      telefono: string;
      idNegocio: number;
      idRol: number;
      estatus: number;
    };
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
        email: alias, // El backend espera 'email' pero valida contra 'alias'
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
  saveAuthData: (token: string, usuario: any) => {
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
