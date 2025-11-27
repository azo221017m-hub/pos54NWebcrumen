// Tipos para el módulo de productos

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: string;
  stock: number;
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProductoDto {
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria: string;
  stock: number;
}

export interface UpdateProductoDto extends Partial<CreateProductoDto> {
  id: number;
}
