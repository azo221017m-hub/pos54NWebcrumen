// Tipos para el módulo de inventario

export interface MovimientoInventario {
  id: number;
  productoId: number;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  motivo: string;
  fecha: Date;
  usuarioId: number;
}

export interface StockProducto {
  productoId: number;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  alertaBajoStock: boolean;
}

export interface CreateMovimientoDto {
  productoId: number;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  motivo: string;
}
