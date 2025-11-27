// Tipos para tblposcrumenwebnegocio
export interface Negocio {
  idNegocio?: number;
  numeronegocio?: string; // Opcional porque se genera automáticamente
  nombreNegocio: string;
  rfcnegocio: string;
  direccionfiscalnegocio: string;
  contactonegocio: string;
  logotipo?: string | null; // Base64 string o null
  telefonocontacto: string;
  estatusnegocio: number; // 0 = inactivo, 1 = activo
  fechaRegistroauditoria?: string;
  usuarioauditoria?: string;
  fehamodificacionauditoria?: string;
}

// Tipos para tblposcrumenwebparametrosnegocio
export interface ParametrosNegocio {
  idParametro?: number;
  idNegocio: number;
  telefonoNegocio: string;
  telefonoPedidos: string;
  ubicacion: string;
  tipoNegocio: string;
  impresionRecibo: number; // 0 = no, 1 = si
  impresionTablero: number; // 0 = no, 1 = si
  envioWhats: number; // 0 = no, 1 = si
  encabezado: string;
  pie: string;
  impresionComanda: number; // 0 = no, 1 = si
  envioMensaje: number; // 0 = no, 1 = si
  estatus: number; // 0 = inactivo, 1 = activo
  fechaRegistroAuditoria?: string;
  usuarioAuditoria?: string;
  fechaModificacionAuditoria?: string;
}

// Tipo combinado para el formulario
export interface NegocioCompleto {
  negocio: Negocio;
  parametros: ParametrosNegocio;
}

// Tipo para respuestas de la API
export interface NegocioResponse {
  success: boolean;
  message: string;
  data?: Negocio | Negocio[] | NegocioCompleto;
  error?: string;
}
