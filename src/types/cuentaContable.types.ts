// Interfaces para el módulo de Cuentas Contables

export interface CuentaContable {
  id_cuentacontable: string;
  naturalezacuentacontable: 'COMPRA' | 'GASTO';
  nombrecuentacontable: string;
  tipocuentacontable: string;
  fechaRegistroauditoria?: Date | null;
  usuarioauditoria?: string | null;
  fechamodificacionauditoria?: Date | null;
  idnegocio: number;
}
