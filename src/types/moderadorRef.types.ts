// Tipos para Moderadores de Referencia (tblposcrumenwebmodref)
export interface ModeradorRef {
  idmoderadorref: number; // Mapeado desde idmodref en el backend
  nombremodref: string;
  fechaRegistroauditoria: Date | string;
  usuarioauditoria: string;
  fehamodificacionauditoria: Date | string;
  idnegocio: number;
  estatus: number;
  moderadores?: string; // Campo longtext opcional
}
