// Interfaces para el módulo de Clientes

export type CategoriaCliente = 'NUEVO' | 'RECURRENTE' | 'FRECUENTE' | 'VIP' | 'INACTIVO';
export type EstatusSeguimiento = 'NINGUNO' | 'EN_PROSPECCIÓN' | 'EN_NEGOCIACIÓN' | 'CERRADO' | 'PERDIDO';
export type MedioContacto = 'WHATSAPP' | 'LLAMADA' | 'EMAIL' | 'OTRO';

export interface Cliente {
  idCliente: number;
  nombre: string;
  referencia?: string | null;
  cumple?: Date | string | null;
  categoriacliente: CategoriaCliente;
  satisfaccion?: number | null;
  comentarios?: string | null;
  puntosfidelidad: number;
  estatus_seguimiento: EstatusSeguimiento;
  responsable_seguimiento?: string | null;
  medio_contacto: MedioContacto;
  observacionesseguimiento?: string | null;
  fechaultimoseguimiento?: Date | string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  estatus: number;
  fecharegistroauditoria?: Date | string | null;
  usuarioauditoria?: string | null;
  fehamodificacionauditoria?: Date | string | null;
  idnegocio: number;
}

export interface ClienteCreate {
  nombre: string;
  referencia?: string | null;
  cumple?: string | null;
  categoriacliente?: CategoriaCliente;
  satisfaccion?: number | null;
  comentarios?: string | null;
  puntosfidelidad?: number;
  estatus_seguimiento?: EstatusSeguimiento;
  responsable_seguimiento?: string | null;
  medio_contacto?: MedioContacto;
  observacionesseguimiento?: string | null;
  fechaultimoseguimiento?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  estatus?: number;
  usuarioauditoria?: string | null;
  idnegocio: number;
}

export interface ClienteUpdate {
  nombre: string;
  referencia?: string | null;
  cumple?: string | null;
  categoriacliente: CategoriaCliente;
  satisfaccion?: number | null;
  comentarios?: string | null;
  puntosfidelidad: number;
  estatus_seguimiento: EstatusSeguimiento;
  responsable_seguimiento?: string | null;
  medio_contacto: MedioContacto;
  observacionesseguimiento?: string | null;
  fechaultimoseguimiento?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  estatus: number;
  usuarioauditoria?: string | null;
}
