import apiClient from './api';

const BASE = '/reportes';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface SaludNegocioData {
  ventas_totales: number;
  costo_ventas: number;
  utilidad_bruta: number;
  gastos_operativos: number;
  descuentos_totales: number;
  compras_totales: number;
  utilidad_neta: number;
  margen_contribucion: number;   // (ventas - costo) / ventas
  punto_equilibrio_monto: number;
  punto_equilibrio_tickets: number;
  ticket_promedio: number;
  semaforo: 'UTILIDAD' | 'EQUILIBRIO' | 'PERDIDA';
  periodo: { inicio: string; fin: string };
}

export interface GastoCategoria {
  categoria: string;
  total: number;
  cantidad: number;
}

export interface DescuentoResumen {
  nombre: string;
  colaborador: string;
  operaciones: number;
  monto: number;
}

export interface GastosDescuentosData {
  gastos_por_categoria: GastoCategoria[];
  descuentos_por_nombre: DescuentoResumen[];
  total_gastos: number;
  total_descuentos: number;
  periodo: { inicio: string; fin: string };
}

export interface SugerenciaCompra {
  id_insumo: number;
  nombre: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  deficit: number;
  cantidad_sugerida: number;
  promedio_compra: number;
  proveedor_habitual: string | null;
  ultima_compra: string | null;
  dias_desde_ultima_compra: number | null;
  frecuencia_dias: number | null;
  urgencia: 'CRITICA' | 'ALTA' | 'MEDIA';
}

export interface SugerenciaCompraData {
  items: SugerenciaCompra[];
  total_estimado: number;
  generado_en: string;
}

export interface StockItem {
  id_insumo: number;
  nombre: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  costo_promedio_ponderado: number;
  valor_inventario: number;
  proveedor: string | null;
  estado: 'CRITICO' | 'ADVERTENCIA' | 'OPTIMO';
}

export interface StockData {
  items: StockItem[];
  total_items: number;
  valor_total: number;
  items_criticos: number;
  items_advertencia: number;
}

export interface BajoMinimoItem {
  id_insumo: number;
  nombre: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  deficit: number;
  proveedor: string | null;
}

export interface CompraProveedor {
  proveedor: string;
  total_monto: number;
  total_operaciones: number;
  productos: string[];
  ultima_compra: string;
  primera_compra: string;
}

export interface RotacionItem {
  nombre: string;
  cantidad_vendida: number;
  stock_actual: number;
  indice_rotacion: number;
  nivel: 'ALTA' | 'MEDIA' | 'BAJA';
}

export interface VentasHoyData {
  fecha: string;
  total_cobrado: number;
  total_tickets: number;
  ticket_promedio: number;
  total_descuentos: number;
  por_forma_pago: { formadepago: string; total: number; cantidad: number }[];
  por_turno: {
    claveturno: string;
    usuarioturno: string;
    total: number;
    tickets: number;
    metaturno: number | null;
    logrometa: number | null;
  }[];
  periodo_anterior: { total: number; variacion_pct: number } | null;
}

export interface VentasTurnoItem {
  claveturno: string;
  usuarioturno: string;
  fechainicioturno: string;
  fechafinturno: string | null;
  estatusturno: string;
  total_ventas: number;
  total_tickets: number;
  ticket_promedio: number;
  total_descuentos: number;
  metaturno: number | null;
  logrometa: number | null;
  semaforo: 'SUPERO' | 'CUMPLIO' | 'NO_CUMPLIO' | null;
}

export interface TopProducto {
  nombreproducto: string;
  cantidad_vendida: number;
  total_ventas: number;
  ticket_promedio: number;
  porcentaje_ventas: number;
}

export interface VentasMensual {
  mes: string;          // "2026-01"
  mes_nombre: string;   // "Ene 2026"
  total: number;
  tickets: number;
  ticket_promedio: number;
}

export interface ColaboradorRanking {
  colaborador: string;
  total_ventas: number;
  total_tickets: number;
  ticket_promedio: number;
  total_descuentos: number;
  posicion: number;
}

export interface ColaboradorMeta {
  colaborador: string;
  claveturno: string;
  fecha_turno: string;
  meta: number;
  venta_real: number;
  cumplimiento_pct: number;
  semaforo: 'SUPERO' | 'CUMPLIO' | 'NO_CUMPLIO';
}

export interface ColaboradorKpi {
  colaborador: string;
  total_ventas: number;
  total_tickets: number;
  ticket_promedio: number;
  total_descuentos: number;
  total_devoluciones: number;
  turnos_trabajados: number;
  monto_devoluciones: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function params(fechaInicio?: string, fechaFin?: string, extra?: Record<string, string>) {
  const p: Record<string, string> = {};
  if (fechaInicio) p.fechaInicio = fechaInicio;
  if (fechaFin) p.fechaFin = fechaFin;
  return { ...p, ...extra };
}

type ApiResponse<T> = { success: boolean; data: T };

async function get<T>(url: string, qp?: Record<string, string>): Promise<T> {
  const res = await apiClient.get<ApiResponse<T>>(url, { params: qp });
  return res.data.data;
}

// ─── Salud del Negocio ───────────────────────────────────────────────────────

export const obtenerSaludNegocio = (fi?: string, ff?: string) =>
  get<SaludNegocioData>(`${BASE}/salud/estado`, params(fi, ff));

export const obtenerGastosDescuentos = (fi?: string, ff?: string) =>
  get<GastosDescuentosData>(`${BASE}/salud/gastos-descuentos`, params(fi, ff));

export const obtenerSugerenciaCompra = () =>
  get<SugerenciaCompraData>(`${BASE}/inventario/sugerencia-compra`);

// ─── Inventario ──────────────────────────────────────────────────────────────

export const obtenerStockActual = () =>
  get<StockData>(`${BASE}/inventario/stock`);

export const obtenerStockBajoMinimo = () =>
  get<BajoMinimoItem[]>(`${BASE}/inventario/bajo-minimo`);

export const obtenerComprasPorProveedor = (fi?: string, ff?: string) =>
  get<CompraProveedor[]>(`${BASE}/inventario/compras-proveedor`, params(fi, ff));

export const obtenerRotacionInventario = (fi?: string, ff?: string) =>
  get<RotacionItem[]>(`${BASE}/inventario/rotacion`, params(fi, ff));

// ─── Ventas ──────────────────────────────────────────────────────────────────

export const obtenerVentasHoy = () =>
  get<VentasHoyData>(`${BASE}/ventas/hoy`);

export const obtenerVentasPorTurno = (fi?: string, ff?: string) =>
  get<VentasTurnoItem[]>(`${BASE}/ventas/por-turno`, params(fi, ff));

export const obtenerTopProductos = (fi?: string, ff?: string, limit?: number) =>
  get<TopProducto[]>(`${BASE}/ventas/top-productos`, params(fi, ff, limit ? { limit: String(limit) } : {}));

export const obtenerVentasMensual = (anio?: number) =>
  get<VentasMensual[]>(`${BASE}/ventas/mensual`, anio ? { anio: String(anio) } : {});

// ─── Colaboradores ───────────────────────────────────────────────────────────

export const obtenerRankingColaboradores = (fi?: string, ff?: string) =>
  get<ColaboradorRanking[]>(`${BASE}/colaboradores/ranking`, params(fi, ff));

export const obtenerCumplimientoMeta = (fi?: string, ff?: string) =>
  get<ColaboradorMeta[]>(`${BASE}/colaboradores/cumplimiento-meta`, params(fi, ff));

export const obtenerKpiColaboradores = (fi?: string, ff?: string) =>
  get<ColaboradorKpi[]>(`${BASE}/colaboradores/kpi`, params(fi, ff));
