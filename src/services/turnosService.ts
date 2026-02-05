import apiClient from './api';
import type { Turno, TurnoUpdate } from '../types/turno.types';

const API_BASE = '/turnos';

// Obtener todos los turnos del negocio autenticado
export const obtenerTurnos = async (): Promise<Turno[]> => {
  try {
    console.log('Servicio: Obteniendo turnos del negocio autenticado');
    const response = await apiClient.get<Turno[]>(API_BASE);
    console.log('Servicio: Turnos obtenidos:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('Error en servicio obtenerTurnos:', error);
    throw error;
  }
};

// Obtener un turno por ID
export const obtenerTurnoPorId = async (idturno: number): Promise<Turno> => {
  try {
    console.log('Servicio: Obteniendo turno con ID', idturno);
    const response = await apiClient.get<Turno>(`${API_BASE}/${idturno}`);
    console.log('Servicio: Turno obtenido:', response.data.claveturno);
    return response.data;
  } catch (error) {
    console.error('Error en servicio obtenerTurnoPorId:', error);
    throw error;
  }
};

// Crear un nuevo turno (iniciar turno)
export const crearTurno = async (metaturno?: number | null, fondoCaja?: number | null): Promise<Turno> => {
  try {
    console.log('Servicio: Iniciando nuevo turno');
    const body: Record<string, number> = {};
    if (metaturno !== undefined && metaturno !== null) {
      body.metaturno = metaturno;
    }
    if (fondoCaja !== undefined && fondoCaja !== null) {
      body.fondoCaja = fondoCaja;
    }
    const response = await apiClient.post<Turno>(API_BASE, body);
    console.log('Servicio: Turno iniciado con ID:', response.data.idturno);
    return response.data;
  } catch (error) {
    console.error('Error en servicio crearTurno:', error);
    throw error;
  }
};

// Actualizar un turno (cambiar estatus)
export const actualizarTurno = async (idturno: number, turno: TurnoUpdate): Promise<Turno> => {
  try {
    console.log('Servicio: Actualizando turno ID:', idturno);
    const response = await apiClient.put<Turno>(`${API_BASE}/${idturno}`, turno);
    console.log('Servicio: Turno actualizado');
    return response.data;
  } catch (error) {
    console.error('Error en servicio actualizarTurno:', error);
    throw error;
  }
};

// Eliminar un turno
export const eliminarTurno = async (idturno: number): Promise<number> => {
  try {
    console.log('Servicio: Eliminando turno ID:', idturno);
    await apiClient.delete(`${API_BASE}/${idturno}`);
    console.log('Servicio: Turno eliminado');
    return idturno;
  } catch (error) {
    console.error('Error en servicio eliminarTurno:', error);
    throw error;
  }
};

// Cerrar turno actual
export const cerrarTurnoActual = async (datosFormulario?: {
  idTurno: string;
  retiroFondo: number;
  totalArqueo: number;
  detalleDenominaciones: any;
  estatusCierre: 'sin_novedades' | 'cuentas_pendientes';
}): Promise<{ message: string; idturno: number }> => {
  try {
    console.log('Servicio: Cerrando turno actual');
    const response = await apiClient.post<{ message: string; idturno: number }>(`${API_BASE}/cerrar-actual`, datosFormulario || {});
    console.log('Servicio: Turno actual cerrado');
    return response.data;
  } catch (error) {
    console.error('Error en servicio cerrarTurnoActual:', error);
    throw error;
  }
};

// Verificar si existe un turno abierto para el negocio autenticado
export const verificarTurnoAbierto = async (): Promise<Turno | null> => {
  try {
    console.log('Servicio: Verificando si existe turno abierto');
    const turnos = await obtenerTurnos();
    // Filter for open shifts (estatusturno = 'abierto')
    const turnoAbierto = turnos.find(turno => turno.estatusturno === 'abierto');
    if (turnoAbierto) {
      console.log('Servicio: Turno abierto encontrado:', turnoAbierto.claveturno);
    } else {
      console.log('Servicio: No se encontró turno abierto');
    }
    return turnoAbierto ?? null;
  } catch (error) {
    console.error('Error en servicio verificarTurnoAbierto:', error);
    throw error;
  }
};

// Verificar si hay comandas abiertas en un turno
export const verificarComandasAbiertas = async (claveturno: string): Promise<{ comandasAbiertas: number; puedeCerrar: boolean }> => {
  try {
    console.log('Servicio: Verificando comandas abiertas para turno:', claveturno);
    const response = await apiClient.get<{ success: boolean; comandasAbiertas: number; puedeCerrar: boolean }>(`${API_BASE}/verificar-comandas/${claveturno}`);
    console.log('Servicio: Comandas abiertas:', response.data.comandasAbiertas);
    return {
      comandasAbiertas: response.data.comandasAbiertas,
      puedeCerrar: response.data.puedeCerrar
    };
  } catch (error) {
    console.error('Error en servicio verificarComandasAbiertas:', error);
    throw error;
  }
};
