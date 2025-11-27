// Tipos para el módulo de ventas

export interface Venta {
  id: number;
  fecha: Date;
  total: number;
  subtotal: number;
  impuestos: number;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia';
  items: VentaItem[];
  clienteId?: number;
  vendedorId: number;
}

export interface VentaItem {
  id: number;
  productoId: number;
  producto?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CreateVentaDto {
  items: {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
  }[];
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia';
  clienteId?: number;
}
