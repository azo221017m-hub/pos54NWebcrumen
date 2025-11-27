// Tipos globales compartidos en el frontend

export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: 'admin' | 'vendedor' | 'gerente';
  activo: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';
