// Tipos para la tabla tblposcrumenwebintentoslogin
export interface IntentoLogin {
  id: number;
  aliasusuario: string;
  intentos: number;
  ultimologin: Date | null;
  fechabloqueado: Date | null;
  idnegocio: number;
  metaaud: string | null; // JSON string con metadata
}

// Tipo para crear un nuevo registro de intento
export interface IntentoLoginCreate {
  aliasusuario: string;
  intentos: number;
  ultimologin?: Date;
  fechabloqueado?: Date;
  idnegocio: number;
  metaaud?: string;
}

// Tipo para actualizar un registro existente
export interface IntentoLoginUpdate {
  intentos?: number;
  ultimologin?: Date;
  fechabloqueado?: Date;
  metaaud?: string;
}

// Metadata de auditoría que se guarda en metaaud
export interface LoginMetadata {
  timestamp: string;
  ip?: string;
  userAgent?: string;
  navegador?: string;
  sistemaOperativo?: string;
  dispositivo?: string;
  ubicacion?: string;
  exito: boolean;
  mensaje?: string;
  tokenGenerado?: boolean;
  sessionId?: string;
}

// Respuesta del sistema de login
export interface LoginAuditResponse {
  permitido: boolean;
  bloqueado: boolean;
  intentosRestantes?: number;
  mensaje: string;
  fechaBloqueado?: Date;
}
