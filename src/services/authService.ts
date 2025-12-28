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
   */
  clearAuthData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('idnegocio');
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
