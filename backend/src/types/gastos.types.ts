// Tipos para Gastos (registros en tblposcrumenwebventas con tipodeventa='MOVIMIENTO')

export interface Gasto {
  idventa: number;
  folioventa: string;
  fechadeventa: Date | string;
  subtotal: number;
  totaldeventa: number;
  referencia: string | null; // Tipo de gasto
  descripcionmov: string | null; // Descripción del movimiento/gasto
  estatusdepago: string | null; // Estado de pago (PAGADO, PENDIENTE, etc.)
  idnegocio: number;
  usuarioauditoria: string;
  fechamodificacionauditoria: Date | string;
}

export interface GastoCreate {
  importegasto: number; // Será mapeado a subtotal
  tipodegasto: string; // Será mapeado a descripcionmov
  // claveturno is now auto-fetched server-side from the open turno of the authenticated user's negocio
}

export interface GastoUpdate {
  importegasto?: number;
  tipodegasto?: string;
}
