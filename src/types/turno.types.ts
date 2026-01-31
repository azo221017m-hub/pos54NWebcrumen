// Estatus del turno
export const EstatusTurno = {
  ABIERTO: 'abierto',
  CERRADO: 'cerrado'
} as const;

export type EstatusTurno = typeof EstatusTurno[keyof typeof EstatusTurno];

// Interface principal de Turno
export interface Turno {
  idturno: number;
  numeroturno: number;
  fechainicioturno: string;
  fechafinturno: string | null;
  estatusturno: EstatusTurno;
  claveturno: string;
  usuarioturno: string;
  idnegocio: number;
  metaturno?: number | null;
  totalventas?: number; // Total de ventas del turno
  porcentajemeta?: number; // Porcentaje de meta alcanzado
}

// Interface para crear un nuevo turno (iniciar turno)
// Solo se necesita para enviar al backend si hubiera campos personalizados
// En este caso, todos los campos son autogenerados
export interface TurnoCreate {
  // Todos los campos son autogenerados en el backend
}

// Interface para actualizar un turno (cerrar turno)
export interface TurnoUpdate {
  estatusturno: EstatusTurno;
}
