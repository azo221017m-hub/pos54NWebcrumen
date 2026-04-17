import apiClient from './api';

const API_BASE = '/reportes';

export interface EstadoResultados {
  ventas_totales: number;
  costo_ventas: number;
  utilidad_bruta: number;
  gastos: number;
  utilidad_neta: number;
  periodo: { inicio: string; fin: string };
}

export interface DetalleVenta {
  fechadetalleventa: string;
  nombreproducto: string;
  cantidad: number;
  preciounitario: number;
  total: number;
  usuarioauditoria: string;
}

export interface DetalleCompra {
  proveedor: string;
  nombreinsumo: string;
  cantidad: number;
  costo: number;
  total: number;
  fechamovimiento: string;
}

export interface DetalleCosto {
  nombreproducto: string;
  costounitario: number;
  cantidad: number;
  total_costo: number;
}

export interface DetalleGasto {
  categoria: string;
  costo: number;
  fechamovimiento: string;
  usuarioauditoria: string;
}

export interface RentabilidadProducto {
  nombreproducto: string;
  ventas: number;
  costos: number;
  utilidad: number;
  margen: number;
}

export interface FlujoCaja {
  fecha: string;
  entradas: number;
  salidas: number;
  balance: number;
}

export type TipoReporte =
  | 'estado-resultados'
  | 'ventas'
  | 'compras'
  | 'costos'
  | 'gastos'
  | 'rentabilidad'
  | 'flujo';

export const REPORTES_INFO: { tipo: TipoReporte; titulo: string; emoji: string; color: string }[] = [
  { tipo: 'estado-resultados', titulo: 'Estado de Resultados', emoji: '🔴', color: '#ef4444' },
  { tipo: 'ventas',            titulo: 'Reporte de Ventas',    emoji: '🟢', color: '#10b981' },
  { tipo: 'compras',           titulo: 'Reporte de Compras',   emoji: '🔵', color: '#3b82f6' },
  { tipo: 'costos',            titulo: 'Costos de Venta',      emoji: '🟣', color: '#8b5cf6' },
  { tipo: 'gastos',            titulo: 'Reporte de Gastos',    emoji: '🟡', color: '#f59e0b' },
  { tipo: 'rentabilidad',      titulo: 'Rentabilidad',         emoji: '🟠', color: '#f97316' },
  { tipo: 'flujo',             titulo: 'Flujo de Caja',        emoji: '⚫', color: '#374151' },
];

function buildParams(fechaInicio?: string, fechaFin?: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (fechaInicio) params.fechaInicio = fechaInicio;
  if (fechaFin) params.fechaFin = fechaFin;
  return params;
}

export const obtenerEstadoResultados = async (
  fechaInicio?: string,
  fechaFin?: string
): Promise<EstadoResultados> => {
  const response = await apiClient.get<{ success: boolean; data: EstadoResultados }>(
    `${API_BASE}/estado-resultados`,
    { params: buildParams(fechaInicio, fechaFin) }
  );
  return response.data.data;
};

export const obtenerReporteVentas = async (
  fechaInicio?: string,
  fechaFin?: string,
  producto?: string,
  comensal?: string
): Promise<DetalleVenta[]> => {
  const params = buildParams(fechaInicio, fechaFin);
  if (producto) params.producto = producto;
  if (comensal) params.comensal = comensal;
  const response = await apiClient.get<{ success: boolean; data: DetalleVenta[] }>(
    `${API_BASE}/ventas`,
    { params }
  );
  return response.data.data;
};

export const obtenerReporteCompras = async (
  fechaInicio?: string,
  fechaFin?: string
): Promise<DetalleCompra[]> => {
  const response = await apiClient.get<{ success: boolean; data: DetalleCompra[] }>(
    `${API_BASE}/compras`,
    { params: buildParams(fechaInicio, fechaFin) }
  );
  return response.data.data;
};

export const obtenerReporteCostos = async (
  fechaInicio?: string,
  fechaFin?: string
): Promise<DetalleCosto[]> => {
  const response = await apiClient.get<{ success: boolean; data: DetalleCosto[] }>(
    `${API_BASE}/costos`,
    { params: buildParams(fechaInicio, fechaFin) }
  );
  return response.data.data;
};

export const obtenerReporteGastos = async (
  fechaInicio?: string,
  fechaFin?: string
): Promise<DetalleGasto[]> => {
  const response = await apiClient.get<{ success: boolean; data: DetalleGasto[] }>(
    `${API_BASE}/gastos`,
    { params: buildParams(fechaInicio, fechaFin) }
  );
  return response.data.data;
};

export const obtenerReporteRentabilidad = async (
  fechaInicio?: string,
  fechaFin?: string
): Promise<RentabilidadProducto[]> => {
  const response = await apiClient.get<{ success: boolean; data: RentabilidadProducto[] }>(
    `${API_BASE}/rentabilidad`,
    { params: buildParams(fechaInicio, fechaFin) }
  );
  return response.data.data;
};

export const obtenerReporteFlujo = async (
  fechaInicio?: string,
  fechaFin?: string
): Promise<FlujoCaja[]> => {
  const response = await apiClient.get<{ success: boolean; data: FlujoCaja[] }>(
    `${API_BASE}/flujo`,
    { params: buildParams(fechaInicio, fechaFin) }
  );
  return response.data.data;
};
