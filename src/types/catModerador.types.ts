// Tipos para Categoría Moderadores (tblposcrumenwebmodref)
export interface CatModerador {
  idmodref: number;
  nombremodref: string;
  fechaRegistroauditoria: Date | string;
  usuarioauditoria: string;
  fehamodificacionauditoria: Date | string;
  idnegocio: number;
  estatus: number;
  moderadores: string; // IDs separados por comas de tblposcrumenwebmoderadores
}

export interface CatModeradorCreate {
  nombremodref: string;
  usuarioauditoria: string;
  idnegocio: number;
  estatus: number;
  moderadores: string; // IDs separados por comas
}

export interface CatModeradorUpdate extends CatModeradorCreate {
  idmodref: number;
}
