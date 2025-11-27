// Tipos para Moderador
export interface Moderador {
  idmoderador: number;
  nombremoderador: string;
  fechaRegistroauditoria: string | null;
  usuarioauditoria: string | null;
  fehamodificacionauditoria: string | null;
  idnegocio: number;
  estatus: number;
}

export interface ModeradorCreate {
  nombremoderador: string;
  usuarioauditoria: string;
  idnegocio: number;
  estatus: number;
}

export interface ModeradorUpdate {
  nombremoderador: string;
  usuarioauditoria: string;
  estatus: number;
}
