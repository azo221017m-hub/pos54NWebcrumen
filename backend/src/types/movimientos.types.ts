// Types for tblposcrumenwebmovimientos and tblposcrumenwebdetallemovimientos tables

export type TipoInsumo = 'DIRECTO' | 'INVENTARIO' | 'RECETA';
export type TipoMovimiento = 'ENTRADA' | 'SALIDA';
export type MotivoMovimiento = 'COMPRA' | 'VENTA' | 'AJUSTE_MANUAL' | 'MERMA' | 'INV_INICIAL' | 'CONSUMO';
export type EstatusMovimiento = 'PROCESADO' | 'PENDIENTE' | 'ELIMINADO';

// Movimiento principal (tblposcrumenwebmovimientos)
export interface Movimiento {
  idmovimiento: number;
  tipomovimiento: TipoMovimiento;
  motivomovimiento: MotivoMovimiento;
  idreferencia: number | null;
  fechamovimiento: Date | string;
  observaciones: string | null;
  usuarioauditoria: string;
  idnegocio: number;
  estatusmovimiento: EstatusMovimiento;
  fecharegistro: Date | string;
  fechaauditoria: Date | string | null;
}

// Movimiento con detalles
export interface MovimientoConDetalles extends Movimiento {
  detalles: DetalleMovimiento[];
}

// DTO para crear movimiento completo
export interface MovimientoCreate {
  tipomovimiento: TipoMovimiento;
  motivomovimiento: MotivoMovimiento;
  fechamovimiento: Date | string;
  observaciones?: string | null;
  estatusmovimiento: EstatusMovimiento;
  detalles: DetalleMovimientoCreateDTO[];
}

// DTO para detalle al crear movimiento
export interface DetalleMovimientoCreateDTO {
  idinsumo: number;
  nombreinsumo: string;
  tipoinsumo: TipoInsumo;
  cantidad: number;
  unidadmedida: string;
  costo?: number | null;
  precio?: number | null;
  observaciones?: string | null;
  proveedor?: string | null;
}

// DTO para actualizar movimiento
export interface MovimientoUpdate {
  motivomovimiento?: MotivoMovimiento;
  observaciones?: string | null;
  estatusmovimiento?: EstatusMovimiento;
}

// Detalle de movimiento (tblposcrumenwebdetallemovimientos)

export interface DetalleMovimiento {
  iddetallemovimiento: number;
  idinsumo: number;
  nombreinsumo: string;
  tipoinsumo: TipoInsumo;
  tipomovimiento: TipoMovimiento;
  motivomovimiento: MotivoMovimiento;
  cantidad: number;
  referenciastock: number | null;
  unidadmedida: string;
  precio: number | null;
  costo: number | null;
  idreferencia: number;
  fechamovimiento: Date | string;
  observaciones: string | null;
  proveedor: string | null;
  usuarioauditoria: string;
  idnegocio: number;
  estatusmovimiento: EstatusMovimiento;
  fecharegistro: Date | string;
  fechaauditoria: Date | string;
}

export interface DetalleMovimientoCreate {
  idinsumo: number;
  nombreinsumo: string;
  tipoinsumo: TipoInsumo;
  tipomovimiento: TipoMovimiento;
  motivomovimiento: MotivoMovimiento;
  cantidad: number;
  referenciastock?: number | null;
  unidadmedida: string;
  precio?: number | null;
  costo?: number | null;
  idreferencia: number;
  observaciones?: string | null;
  proveedor?: string | null;
  usuarioauditoria: string;
  idnegocio: number;
  estatusmovimiento?: EstatusMovimiento;
}
