// Tipos para tblposcrumenwebventas y tblposcrumenwebdetalleventas - Frontend

export type TipoDeVenta = 'DOMICILIO' | 'LLEVAR' | 'MESA' | 'ONLINE' | 'MOVIMIENTO';
export type EstadoDeVenta = 'SOLICITADO' | 'LEIDO' | 'PREPARANDO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO' | 'DEVUELTO' | 'COBRADO' | 'ESPERAR' | 'ORDENADO';
export type FormaDePago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'MIXTO' | 'sinFP';
export type EstatusDePago = 'PENDIENTE' | 'PAGADO' | 'PARCIAL' | 'ESPERAR';
export type TipoAfectacion = 'DIRECTO' | 'INVENTARIO' | 'RECETA';
export type EstadoDetalle = 'ORDENADO' | 'CANCELADO' | 'DEVUELTO' | 'PREPARACION' | 'COBRADO' | 'ESPERAR';

export interface VentaWeb {
  idventa: number;
  tipodeventa: TipoDeVenta;
  folioventa: string;
  estadodeventa: EstadoDeVenta;
  fechadeventa: Date | string;
  fechaprogramadaentrega: Date | string | null;
  fechapreparacion: Date | string | null;
  fechaenvio: Date | string | null;
  fechaentrega: Date | string | null;
  subtotal: number;
  descuentos: number;
  impuestos: number;
  totaldeventa: number;
  cliente: string;
  direcciondeentrega: string | null;
  contactodeentrega: string | null;
  telefonodeentrega: string | null;
  propinadeventa: number;
  formadepago: FormaDePago;
  estatusdepago: EstatusDePago;
  tiempototaldeventa: number | null;
  claveturno?: string | null;
  idnegocio: number;
  usuarioauditoria: string;
  fechamodificacionauditoria: Date | string;
}

export interface DetalleVentaWeb {
  iddetalleventa: number;
  idventa: number;
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
  tipoafectacion: TipoAfectacion;
  inventarioprocesado: number;
  fechadetalleventa: Date | string;
  estadodetalle: EstadoDetalle;
  observaciones: string | null;
  moderadores: string | null;
  idnegocio: number;
  usuarioauditoria: string;
  fechamodificacionauditoria: Date | string;
}

export interface VentaWebCreate {
  tipodeventa: TipoDeVenta;
  cliente: string;
  direcciondeentrega?: string | null;
  contactodeentrega?: string | null;
  telefonodeentrega?: string | null;
  formadepago: FormaDePago;
  fechaprogramadaentrega?: Date | string | null;
  estadodeventa?: EstadoDeVenta;
  estatusdepago?: EstatusDePago;
  estadodetalle?: EstadoDetalle;
  detalles: DetalleVentaWebCreate[];
}

export interface DetalleVentaWebCreate {
  idproducto: number;
  nombreproducto: string;
  idreceta?: number | null;
  tipoproducto?: string;
  cantidad: number;
  preciounitario: number;
  costounitario: number;
  observaciones?: string | null;
  moderadores?: string | null;
}

export interface VentaWebUpdate {
  estadodeventa?: EstadoDeVenta;
  estatusdepago?: EstatusDePago;
  fechaprogramadaentrega?: Date | string | null;
  fechapreparacion?: Date | string | null;
  fechaenvio?: Date | string | null;
  fechaentrega?: Date | string | null;
  propinadeventa?: number;
}

export interface DetalleVentaWebUpdate {
  estadodetalle?: EstadoDetalle;
}

export interface VentaWebWithDetails extends VentaWeb {
  detalles: DetalleVentaWeb[];
}
