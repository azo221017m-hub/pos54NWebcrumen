// Tipos para tblposcrumenwebcompras y tblposcrumenwebdetallecompras - Frontend

export type TipoDeCompra = 'DOMICILIO' | 'LLEVAR' | 'MESA' | 'ONLINE' | 'MOVIMIENTO';
export type EstadoDeCompra = 'ELIMINADA' | 'ESPERAR' | 'RECIBIDA' | 'CANCELADA' | 'DEVUELTA' | 'GENERADA';
export type EstatusDePago = 'PENDIENTE' | 'PAGADO' | 'ESPERAR';
export type TipoAfectacion = 'INVENTARIO';
export type EstadoDetalle = 'ESPERAR' | 'RECIBIDA' | 'CANCELADA' | 'DEVUELTA' | 'GENERADA';

export interface Compra {
  idcompra: number;
  tipodecompra: TipoDeCompra;
  foliocompra: string;
  estadodecompra: EstadoDeCompra;
  fechaordendecompra: Date | string;
  fechaprogramadacompra: Date | string | null;
  fechacompra: Date | string | null;
  subtotal: number;
  descuentos: number;
  impuestos: number;
  totaldeventa: number;
  direcciondeentrega: string | null;
  contactodeentrega: string | null;
  telefonodeentrega: string | null;
  importedepago: number;
  estatusdepago: EstatusDePago;
  referencia: string | null;
  claveturno: string | null;
  idnegocio: number;
  usuarioauditoria: string;
  fechamodificacionauditoria: Date | string;
  detalledescuento: string | null;
}

export interface DetalleCompra {
  iddetallecompra: number;
  idcompra: number;
  idproducto: number;
  nombreproducto: string;
  idreceta: number | null;
  cantidad: number;
  preciounitario: number;
  costounitario: number;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  afectainventario: number;
  tipoafectacion: TipoAfectacion | null;
  inventarioprocesado: number;
  fechadetalleventa: Date | string;
  estadodetalle: EstadoDetalle;
  observaciones: string | null;
  idnegocio: number;
  usuarioauditoria: string;
  fechamodificacionauditoria: Date | string;
}

export interface CompraCreate {
  tipodecompra: TipoDeCompra;
  direcciondeentrega?: string | null;
  contactodeentrega?: string | null;
  telefonodeentrega?: string | null;
  fechaprogramadacompra?: Date | string | null;
  estadodecompra?: EstadoDeCompra;
  estatusdepago?: EstatusDePago;
  referencia?: string | null;
  detalledescuento?: string | null;
  detalles: DetalleCompraCreate[];
}

export interface DetalleCompraCreate {
  idproducto: number;
  nombreproducto: string;
  idreceta?: number | null;
  cantidad: number;
  preciounitario: number;
  costounitario: number;
  observaciones?: string | null;
}

export interface CompraUpdate {
  estadodecompra?: EstadoDeCompra;
  estatusdepago?: EstatusDePago;
  fechaprogramadacompra?: Date | string | null;
  fechacompra?: Date | string | null;
  direcciondeentrega?: string | null;
  contactodeentrega?: string | null;
  telefonodeentrega?: string | null;
  referencia?: string | null;
  detalledescuento?: string | null;
}

export interface DetalleCompraUpdate {
  estadodetalle?: EstadoDetalle;
  cantidad?: number;
  preciounitario?: number;
  costounitario?: number;
  observaciones?: string | null;
}

export interface CompraWithDetails extends Compra {
  detalles: DetalleCompra[];
}
