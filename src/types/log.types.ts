// Tipos para el sistema de log de acciones (tblposcrumenweblogs)

export interface LogEntry {
  idnegocio: number;
  idusuario: number;
  usuario: string;
  accion: string;
  modulo: string;
  tabla_afectada?: string | null;
  idregistro?: number | null;
  descripcion: string;
  ip?: string | null;
  equipo?: string | null;
  fecha?: string;
}

export interface LogResponse {
  success: boolean;
  message?: string;
  data?: { idlog: number };
}
