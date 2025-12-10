// Tipos para Cuenta Contable
export type NaturalezaCuentaContable = 'COMPRA' | 'GASTO';

export interface CuentaContable {
  id_cuentacontable: number;
  naturalezacuentacontable: NaturalezaCuentaContable;
  nombrecuentacontable: string;
  tipocuentacontable: string;
  fechaRegistroauditoria: string | null;
  usuarioauditoria: string | null;
  fechamodificacionauditoria: string | null;
  idnegocio: number;
}

export interface CuentaContableCreate {
  naturalezacuentacontable: NaturalezaCuentaContable;
  nombrecuentacontable: string;
  tipocuentacontable: string;
  idnegocio: number;
}

export interface CuentaContableUpdate {
  naturalezacuentacontable: NaturalezaCuentaContable;
  nombrecuentacontable: string;
  tipocuentacontable: string;
}
