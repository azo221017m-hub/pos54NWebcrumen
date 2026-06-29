// Estatus del turno
export const EstatusTurno = {
  ABIERTO: 'abierto',
  CERRADO: 'cerrado'
} as const;

export type EstatusTurno = typeof EstatusTurno[keyof typeof EstatusTurno];

// Interface principal de Turno
export interface Turno {
  idturno: number;
  numeroturno: number;
  fechainicioturno: string;
  fechafinturno: string | null;
  estatusturno: EstatusTurno;
  claveturno: string;
  usuarioturno: string;
  idnegocio: number;
  metaturno?: number | string | null;
  totalventas?: number | string; // Total de ventas del turno (puede venir como string del backend)
}

// Interface para crear un nuevo turno (iniciar turno)
// Solo se necesita para enviar al backend si hubiera campos personalizados
// En este caso, todos los campos son autogenerados
export interface TurnoCreate {
  // Todos los campos son autogenerados en el backend
}

// Interface para actualizar un turno (cerrar turno)
export interface TurnoUpdate {
  estatusturno: EstatusTurno;
}

// ——— Tipos para el Ticket de Fin de Turno (Corte de Caja) ———

export interface CorteFinTurnoTurno {
  idturno: number;
  numeroturno: number;
  claveturno: string;
  usuarioturno: string;
  fechainicioturno: string;
  fechafinturno: string | null;
  estatusturno: string;
  metaturno?: number | null;
  nombreNegocio: string;
  rfcnegocio: string;
  direccionnegocio?: string;
}

export interface CorteFinTurnoResumen {
  fondoInicial: number;
  ingresosCaja: number;
  retirosCaja: number;
  retiroFondo: number;
  ventasBrutas: number;
  totalDescuentos: number;
  ventasNetas: number;
  totalGastos: number;
}

export interface CorteFinTurnoGasto {
  concepto: string;
  importe: number;
}

export interface CorteFinTurnoFormaDePago {
  formadepago: string;
  total: number;
  count: number;
}

export interface CorteFinTurnoTipoVenta {
  tipodeventa: string;
  total: number;
  count: number;
}

export interface CorteFinTurnoDescuento {
  nombre: string;
  operaciones: number;
  montoDescuento: number;
}

export interface CorteFinTurnoConciliacion {
  fondoInicial: number;
  ingresosCaja: number;
  retirosCaja: number;
  retiroFondo: number;
  ventasEfectivo: number;
  totalGastos: number;
  efectivoEsperado: number;
}

export interface CorteFinTurnoProducto {
  nombreproducto: string;
  cantidad: number;
  total: number;
}

export interface CorteFinTurnoIndicadores {
  totalTickets: number;
  totalUnidades: number;
  ventaPromedio: number;
  promedioArticulos: number;
}

export interface CorteFinTurnoAuditoria {
  usuarioGenerador: string;
  fechaGeneracion: string;
}

export interface CorteFinTurnoData {
  turno: CorteFinTurnoTurno;
  resumen: CorteFinTurnoResumen;
  gastos: CorteFinTurnoGasto[];
  totalGastos: number;
  ventasPorFormaDePago: CorteFinTurnoFormaDePago[];
  totalVentasPago: number;
  /** Suma de conteos por forma de pago (puede superar totalTickets si hay ventas MIXTO) */
  totalVentasPagoCount?: number;
  /** true cuando al menos una venta del turno tuvo formadepago = 'MIXTO' */
  hasMixtoVentas?: boolean;
  ventasPorTipoDeVenta: CorteFinTurnoTipoVenta[];
  descuentosAplicados: CorteFinTurnoDescuento[];
  conciliacion: CorteFinTurnoConciliacion;
  productosVendidos: CorteFinTurnoProducto[];
  totalUnidades: number;
  totalVentaProductos: number;
  indicadores: CorteFinTurnoIndicadores;
  auditoria: CorteFinTurnoAuditoria;
  /** Órdenes en estado ORDENADO o EN_CAMINO al momento del corte */
  comandasAbiertas?: number;
  /** Efectivo contado (arqueo) capturado al cerrar el turno; opcional */
  efectivoContado?: number | null;
}
