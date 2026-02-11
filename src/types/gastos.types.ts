// Tipos para Gastos (registros en tblposcrumenwebventas con tipodeventa='MOVIMIENTO')

export interface Gasto {
  idventa: number;
  folioventa: string;
  fechadeventa: Date | string;
  subtotal: number;
  totaldeventa: number;
  referencia: string | null; // Tipo de gasto
  descripcionmov: string | null; // Descripción del movimiento/gasto
  idnegocio: number;
  usuarioauditoria: string;
  fechamodificacionauditoria: Date | string;
}

export interface GastoCreate {
  importegasto: number; // Será mapeado a subtotal
  tipodegasto: string; // Será mapeado a referencia
  descripcionmov?: string; // Descripción opcional del gasto
}

export interface GastoUpdate {
  importegasto?: number;
  tipodegasto?: string;
  descripcionmov?: string;
}
