// Objeto constante para requiere autorización (compatible con erasableSyntaxOnly)
export const RequiereAutorizacion = {
  SI: 'SI',
  NO: 'NO'
} as const;

export type RequiereAutorizacion = typeof RequiereAutorizacion[keyof typeof RequiereAutorizacion];

// Interface principal de Descuento
export interface Descuento {
  id_descuento: number;
  nombre: string;
  tipodescuento: string;
  valor: number;
  estatusdescuento: string;
  requiereautorizacion: RequiereAutorizacion;
  UsuarioCreo: string;
  FechaCreo: string;
  UsuarioModifico: string | null;
  FechaModifico: string | null;
  idnegocio: number;
}

// Interface para crear un nuevo descuento
export interface DescuentoCreate {
  nombre: string;
  tipodescuento: string;
  valor: number;
  estatusdescuento: string;
  requiereautorizacion: RequiereAutorizacion;
  UsuarioCreo: string;
  idnegocio: number;
}

// Interface para actualizar un descuento
export interface DescuentoUpdate {
  nombre: string;
  tipodescuento: string;
  valor: number;
  estatusdescuento: string;
  requiereautorizacion: RequiereAutorizacion;
  UsuarioModifico: string;
}
