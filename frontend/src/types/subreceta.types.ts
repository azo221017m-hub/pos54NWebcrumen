// Tipos para Subrecetas
export interface Subreceta {
  idSubReceta: number;
  nombreSubReceta: string;
  instruccionesSubr: string;
  archivoInstruccionesSubr: string;
  costoSubReceta: number;
  estatusSubr: number;
  fechaRegistroauditoria: Date | string;
  usuarioauditoria: string;
  fehamodificacionauditoria: Date | string;
  idnegocio: number;
  detalles?: DetalleSubreceta[];
}

export interface DetalleSubreceta {
  idDetalleSubReceta?: number;
  dtlSubRecetaId?: number;
  nombreInsumoSubr: string;
  umInsumoSubr: string;
  cantidadUsoSubr: number;
  costoInsumoSubr: number;
  estatus: number;
  fechaRegistroauditoria?: Date | string;
  usuarioauditoria?: string;
  fehamodificacionauditoria?: Date | string;
  idnegocio?: number;
}

export interface SubrecetaCreate {
  nombreSubReceta: string;
  instruccionesSubr: string;
  archivoInstruccionesSubr: string;
  costoSubReceta: number;
  estatusSubr: number;
  usuarioauditoria: string;
  idnegocio: number;
  detalles: DetalleSubreceta[];
}

export interface SubrecetaUpdate {
  nombreSubReceta: string;
  instruccionesSubr: string;
  archivoInstruccionesSubr: string;
  costoSubReceta: number;
  estatusSubr: number;
  usuarioauditoria: string;
  idnegocio: number;
  detalles: DetalleSubreceta[];
}
