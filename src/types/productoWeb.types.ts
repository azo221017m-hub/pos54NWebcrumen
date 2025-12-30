// Tipos para Productos Web (tblposcrumenwebproductos)

export type TipoProducto = 'Directo' | 'Inventario' | 'Receta' | 'Materia Prima';

export interface ProductoWeb {
  idProducto: number;
  idCategoria: number;
  nombreCategoria?: string;
  idreferencia: number | null;
  nombre: string;
  descripcion: string;
  precio: number;
  estatus: number;
  imagenProducto: string | null;
  tipoproducto: TipoProducto;
  costoproducto: number;
  fechaRegistroauditoria: Date | string;
  usuarioauditoria: string;
  fehamodificacionauditoria: Date | string;
  idnegocio: number;
  // Campos relacionados (JOIN)
  nombreReceta?: string;
  costoReceta?: number;
  nombreInsumo?: string;
  costoInsumo?: number;
}

export interface ProductoWebCreate {
  idCategoria: number;
  idreferencia: number | null;
  nombre: string;
  descripcion: string;
  precio: number;
  estatus: number;
  imagenProducto: string | null;
  tipoproducto: TipoProducto;
  costoproducto: number;
  usuarioauditoria: string;
  idnegocio: number;
}

export interface ProductoWebUpdate extends ProductoWebCreate {
  idProducto: number;
}
