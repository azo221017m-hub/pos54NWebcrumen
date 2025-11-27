// Tipos para Recetas
export interface Receta {
  idReceta: number;
  nombreReceta: string;
  instrucciones: string;
  archivoInstrucciones: string;
  costoReceta: number;
  estatus: number;
  fechaRegistroauditoria: Date | string;
  usuarioauditoria: string;
  fehamodificacionauditoria: Date | string;
  idnegocio: number;
  detalles?: DetalleReceta[];
}

export interface DetalleReceta {
  idDetalleReceta?: number;
  dtlRecetaId?: number;
  nombreinsumo?: string;
  umInsumo: string;
  cantidadUso: number;
  costoInsumo: number;
  estatus: number;
  idreferencia: string;
  fechaRegistroauditoria?: Date | string;
  usuarioauditoria?: string;
  fehamodificacionauditoria?: Date | string;
  idnegocio?: number;
}

export interface RecetaCreate {
  nombreReceta: string;
  instrucciones: string;
  archivoInstrucciones: string;
  costoReceta: number;
  estatus: number;
  usuarioauditoria: string;
  idnegocio: number;
  detalles: DetalleReceta[];
}

export interface RecetaUpdate {
  nombreReceta: string;
  instrucciones: string;
  archivoInstrucciones: string;
  costoReceta: number;
  estatus: number;
  usuarioauditoria: string;
  idnegocio: number;
  detalles: DetalleReceta[];
}
