// Tipos para Roles de Usuarios

export interface Rol {
  idRol?: number;
  nombreRol: string;
  descripcion: string;
  privilegio: string;
  estatus: number;
  fechaRegistroauditoria?: string;
  usuarioauditoria?: string;
  fehamodificacionauditoria?: string;
}

export interface RolResponse {
  success: boolean;
  message: string;
  data?: Rol | Rol[];
}
