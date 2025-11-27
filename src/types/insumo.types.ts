// Interfaces para el módulo de Insumos

export interface Insumo {
  id_insumo: number;
  nombre: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  costo_promedio_ponderado: number;
  precio_venta: number;
  idinocuidad?: string | null;
  id_cuentacontable?: string | null;
  nombrecuentacontable?: string | null; // Nombre de la cuenta contable (JOIN)
  activo: number;
  inventariable: number;
  fechaRegistroauditoria?: Date | null;
  usuarioauditoria?: string | null;
  fechamodificacionauditoria?: Date | null;
  idnegocio: number;
}

export interface InsumoCreate {
  nombre: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  costo_promedio_ponderado: number;
  precio_venta: number;
  idinocuidad?: string | null;
  id_cuentacontable?: string | null;
  activo: number;
  inventariable: number;
  usuarioauditoria?: string | null;
  idnegocio: number;
}

export interface InsumoUpdate {
  nombre: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  costo_promedio_ponderado: number;
  precio_venta: number;
  idinocuidad?: string | null;
  id_cuentacontable?: string | null;
  activo: number;
  inventariable: number;
  usuarioauditoria?: string | null;
}
