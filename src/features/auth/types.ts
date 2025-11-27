// Tipos para el módulo de autenticación

export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: 'admin' | 'vendedor' | 'gerente';
  activo: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  nombre: string;
  rol: 'admin' | 'vendedor' | 'gerente';
}
