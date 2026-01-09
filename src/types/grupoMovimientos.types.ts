// Tipos para Grupo de Movimientos
export type NaturalezaGrupoMovimientos = 'COMPRA' | 'GASTO';

export interface GrupoMovimientos {
  id_cuentacontable: number;
  naturalezacuentacontable: NaturalezaGrupoMovimientos;
  nombrecuentacontable: string;
  tipocuentacontable: string;
  fechaRegistroauditoria: string | null;
  usuarioauditoria: string | null;
  fechamodificacionauditoria: string | null;
  idnegocio: number;
}

export interface GrupoMovimientosCreate {
  naturalezacuentacontable: NaturalezaGrupoMovimientos;
  nombrecuentacontable: string;
  tipocuentacontable: string;
  idnegocio: number;
}

export interface GrupoMovimientosUpdate {
  naturalezacuentacontable: NaturalezaGrupoMovimientos;
  nombrecuentacontable: string;
  tipocuentacontable: string;
}
