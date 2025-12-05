// Interfaces para el módulo de Proveedores

export interface Proveedor {
  id_proveedor: number;
  nombre: string;
  rfc: string;
  telefono: string;
  correo: string;
  direccion: string;
  banco: string;
  cuenta: string;
  activo: number;
  fechaRegistroauditoria: Date | string;
  usuarioauditoria: string;
  fehamodificacionauditoria: Date | string;
  idnegocio: number;
}

export interface ProveedorCreate {
  nombre: string;
  rfc?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  banco?: string;
  cuenta?: string;
  activo: number;
  usuarioauditoria: string;
  idnegocio: number;
}

export interface ProveedorUpdate extends ProveedorCreate {
  id_proveedor: number;
}
