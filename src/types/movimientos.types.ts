// Tipos para tblposcrumenwebmovimientos y tblposcrumenwebdetallemovimientos

export type TipoMovimiento = 'ENTRADA' | 'SALIDA';

export type MotivoMovimiento = 
  | 'COMPRA' 
  | 'AJUSTE_MANUAL' 
  | 'MERMA' 
  | 'INV_INICIAL' 
  | 'CONSUMO';

export type EstatusMovimiento = 'PROCESADO' | 'PENDIENTE' | 'ELIMINADO';

export type TipoInsumo = 'DIRECTO' | 'INVENTARIO' | 'RECETA';

// Detalle de movimiento individual
export interface DetalleMovimiento {
  iddetallemovimiento?: number;
  idinsumo: number;
  nombreinsumo: string;
  tipoinsumo: TipoInsumo;
  tipomovimiento: TipoMovimiento;
  motivomovimiento: MotivoMovimiento;
  cantidad: number;
  referenciastock: number;
  unidadmedida: string;
  precio?: number;
  costo?: number;
  idreferencia?: number;
  fechamovimiento?: string;
  observaciones?: string;
  proveedor?: string;
  usuarioauditoria?: string;
  idnegocio?: number;
  estatusmovimiento: EstatusMovimiento;
  fecharegistro?: string;
  fechaauditoria?: string;
}

// Movimiento principal
export interface Movimiento {
  idmovimiento: number;
  tipomovimiento: TipoMovimiento;
  motivomovimiento: MotivoMovimiento;
  idreferencia?: number;
  fechamovimiento: string;
  observaciones?: string;
  usuarioauditoria: string;
  idnegocio: number;
  estatusmovimiento: EstatusMovimiento;
  fecharegistro: string;
  fechaauditoria?: string;
}

// Movimiento con detalles para lectura
export interface MovimientoConDetalles extends Movimiento {
  detalles: DetalleMovimiento[];
}

// DTO para crear movimiento
export interface MovimientoCreate {
  tipomovimiento: TipoMovimiento;
  motivomovimiento: MotivoMovimiento;
  fechamovimiento: string;
  observaciones?: string;
  estatusmovimiento: EstatusMovimiento;
  detalles: DetalleMovimientoCreate[];
}

// DTO para detalle al crear
export interface DetalleMovimientoCreate {
  idinsumo: number;
  nombreinsumo: string;
  tipoinsumo: TipoInsumo;
  cantidad: number;
  unidadmedida: string;
  costo?: number;
  precio?: number;
  observaciones?: string;
  proveedor?: string;
}

// DTO para actualizar movimiento
export interface MovimientoUpdate {
  motivomovimiento?: MotivoMovimiento;
  observaciones?: string;
  estatusmovimiento?: EstatusMovimiento;
}

// Respuesta del API
export interface MovimientoResponse {
  success: boolean;
  message: string;
  data?: MovimientoConDetalles;
}

export interface MovimientosListResponse {
  success: boolean;
  message: string;
  data: MovimientoConDetalles[];
}

// Response for ultima compra endpoint
export interface UltimaCompraData {
  existencia: number;
  costoUltimoPonderado: number;
  unidadMedida: string;
  cantidadUltimaCompra: number;
  proveedorUltimaCompra: string;
  costoUltimaCompra: number;
}
