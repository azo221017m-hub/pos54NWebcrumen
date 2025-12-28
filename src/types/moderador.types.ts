/**
 * Tipos para Moderador
 * 
 * IMPORTANTE: Los moderadores son opciones de modificación para productos
 * (ej: "Sin picante", "Extra queso", "Sin cebolla", "Término medio")
 * 
 * NO deben confundirse con usuarios del sistema. El campo "nombremoderador"
 * debe contener el nombre de la opción de modificación, NO nombres de personas.
 */

export interface Moderador {
  idmoderador: number;
  nombremoderador: string; // Nombre de la opción de modificación (ej: "Sin picante")
  fechaRegistroauditoria: string | null;
  usuarioauditoria: string | null;
  fehamodificacionauditoria: string | null;
  idnegocio: number;
  estatus: number;
}

export interface ModeradorCreate {
  nombremoderador: string; // Nombre de la opción de modificación (ej: "Extra queso")
  usuarioauditoria: string;
  idnegocio: number;
  estatus: number;
}

export interface ModeradorUpdate {
  nombremoderador: string; // Nombre de la opción de modificación (ej: "Sin cebolla")
  usuarioauditoria: string;
  estatus: number;
}
