// Types for tblposcrumenwebdetallemovimientos table

export type TipoInsumo = 'DIRECTO' | 'INVENTARIO' | 'RECETA';
export type TipoMovimiento = 'ENTRADA' | 'SALIDA';
export type MotivoMovimiento = 'COMPRA' | 'VENTA' | 'AJUSTE_MANUAL' | 'MERMA' | 'CANCELACION' | 'DEVOLUCION' | 'INV_INICIAL';
export type EstatusMovimiento = 'PROCESADO' | 'PENDIENTE';

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
  usuarioauditoria: number;
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
  usuarioauditoria: number;
  idnegocio: number;
  estatusmovimiento?: EstatusMovimiento;
}
