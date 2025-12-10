// Tipos para Categorías
export interface Categoria {
  idCategoria: number;
  nombre: string;
  imagencategoria: string;
  descripcion: string;
  estatus: number;
  fechaRegistroauditoria: Date | string;
  usuarioauditoria: string;
  fechamodificacionauditoria: Date | string;
  idnegocio: number;
  idmoderadordef: number | string; // Puede ser número único o string "1,2,3"
  orden: number;
}

export interface CategoriaCreate {
  nombre: string;
  imagencategoria: string;
  descripcion: string;
  estatus: number;
  usuarioauditoria: string;
  idnegocio?: number; // Optional - backend uses authenticated user's idNegocio
  idmoderadordef: number | string; // Puede ser número único o string "1,2,3"
  orden: number;
}

export interface CategoriaUpdate extends CategoriaCreate {
  idCategoria: number;
}
