// Objetos constantes para los estatus (compatible con erasableSyntaxOnly)
export const EstatusMesa = {
  DISPONIBLE: 'DISPONIBLE',
  OCUPADA: 'OCUPADA',
  RESERVADA: 'RESERVADA'
} as const;

export type EstatusMesa = typeof EstatusMesa[keyof typeof EstatusMesa];

export const EstatusTiempo = {
  EN_CURSO: 'EN_CURSO',
  DEMORA: 'DEMORA',
  INACTIVA: 'INACTIVA'
} as const;

export type EstatusTiempo = typeof EstatusTiempo[keyof typeof EstatusTiempo];

// Tipo de servicio compartido
export type TipoServicio = 'Domicilio' | 'Llevar' | 'Mesa';

// Interface principal de Mesa
export interface Mesa {
  idmesa: number;
  nombremesa: string;
  numeromesa: number;
  cantcomensales: number;
  estatusmesa: EstatusMesa;
  tiempodeinicio: string | null;
  tiempoactual: string | null;
  estatustiempo: EstatusTiempo;
  UsuarioCreo: string;
  FechaCreo: string;
  UsuarioModifico: string | null;
  FechaModifico: string | null;
  idnegocio: number;
}

// Interface para crear una nueva mesa
export interface MesaCreate {
  nombremesa: string;
  numeromesa: number;
  cantcomensales: number;
  estatusmesa: EstatusMesa;
  tiempodeinicio?: string;
  tiempoactual?: string;
  estatustiempo: EstatusTiempo;
  UsuarioCreo: string;
  idnegocio?: number; // Optional - backend uses authenticated user's idNegocio
}

// Interface para actualizar una mesa
export interface MesaUpdate {
  nombremesa: string;
  numeromesa: number;
  cantcomensales: number;
  estatusmesa: EstatusMesa;
  tiempodeinicio?: string | null;
  tiempoactual?: string | null;
  estatustiempo: EstatusTiempo;
  UsuarioModifico: string;
}
