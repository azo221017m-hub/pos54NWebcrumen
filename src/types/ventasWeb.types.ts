// Tipos para tblposcrumenwebventas y tblposcrumenwebdetalleventas - Frontend

export type TipoDeVenta = 'DOMICILIO' | 'LLEVAR' | 'MESA' | 'ONLINE';
export type EstadoDeVenta = 'SOLICITADO' | 'LEIDO' | 'PREPARANDO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO' | 'DEVUELTO' | 'COBRADO';
export type FormaDePago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'MIXTO';
export type EstatusDePago = 'PENDIENTE' | 'PAGADO' | 'PARCIAL';
export type TipoAfectacion = 'DIRECTO' | 'RECETA' | 'NO_APLICA';
export type EstadoDetalle = 'ORDENADO' | 'CANCELADO' | 'DEVUELTO' | 'PREPARACION' | 'COBRADO';

export interface VentaWeb {
  idventa: number;
  tipodeventa: TipoDeVenta;
  folioventa: string;
  estadodeventa: EstadoDeVenta;
  fechadeventa: Date | string;
  fechaprogramadaventa: Date | string | null;
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
  nombrereceta: string | null;
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
  fechaprogramadaventa?: Date | string | null;
  detalles: DetalleVentaWebCreate[];
}

export interface DetalleVentaWebCreate {
  idproducto: number;
  nombreproducto: string;
  idreceta?: number | null;
  nombrereceta?: string | null;
  cantidad: number;
  preciounitario: number;
  costounitario: number;
  observaciones?: string | null;
}

export interface VentaWebUpdate {
  estadodeventa?: EstadoDeVenta;
  estatusdepago?: EstatusDePago;
  fechaprogramadaventa?: Date | string | null;
  fechapreparacion?: Date | string | null;
  fechaenvio?: Date | string | null;
  fechaentrega?: Date | string | null;
  propinadeventa?: number;
}

export interface VentaWebWithDetails extends VentaWeb {
  detalles: DetalleVentaWeb[];
}
