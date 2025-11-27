export interface Usuario {
  idUsuario?: number;
  idNegocio?: number;
  idRol?: number;
  nombre: string;
  alias: string;
  password?: string;
  telefono?: string;
  cumple?: string; // Formato: 'YYYY-MM-DD'
  frasepersonal?: string;
  fotoine?: string | null;
  fotopersona?: string | null;
  fotoavatar?: string | null;
  desempeno?: number;
  popularidad?: number;
  estatus: number;
  fechaRegistroauditoria?: string;
  usuarioauditoria?: string;
  fehamodificacionauditoria?: string;
  // Campos adicionales para mostrar tamaños de imágenes
  fotoine_size?: number;
  fotopersona_size?: number;
  fotoavatar_size?: number;
}

export interface UsuarioResponse {
  success: boolean;
  message?: string;
  data?: Usuario | Usuario[] | { idUsuario: number } | { esUnico: boolean };
  error?: string;
}

export interface UsuarioFormData {
  idNegocio?: number;
  idRol?: number;
  nombre: string;
  alias: string;
  password?: string;
  telefono?: string;
  cumple?: string;
  frasepersonal?: string;
  desempeno?: number;
  popularidad?: number;
  estatus: number;
  usuarioauditoria?: string;
  fotoine?: string;
  fotopersona?: string;
  fotoavatar?: string;
}
