import { api } from './api';
import type { LogEntry, LogResponse } from '../types/log.types';

/**
 * Obtiene los datos del usuario actual desde localStorage
 */
const getUsuarioActual = (): { idnegocio: number; idusuario: number; usuario: string } | null => {
  try {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) return null;
    const u = JSON.parse(usuarioStr);
    return {
      idnegocio: u.idNegocio ?? 0,
      idusuario: u.id ?? 0,
      usuario: u.alias ?? '',
    };
  } catch {
    return null;
  }
};

/**
 * Registra una acción del usuario en la tabla tblposcrumenweblogs.
 * Es fire-and-forget: nunca lanza excepciones para no interrumpir el flujo principal.
 *
 * @param accion       Nombre del ítem de MenuNav seleccionado (ej. "Mi Operación")
 * @param modulo       Nombre del submenú seleccionado (ej. "Inicia Venta")
 * @param descripcion  Tipo de CRUD o descripción de la acción (ej. "CREATE", "LOGIN")
 * @param opts         Campos opcionales: tabla_afectada, idregistro
 */
export const registrarLog = (
  accion: string,
  modulo: string,
  descripcion: string,
  opts?: { tabla_afectada?: string; idregistro?: number | null }
): void => {
  const u = getUsuarioActual();
  if (!u) return;

  const entry: LogEntry = {
    idnegocio: u.idnegocio,
    idusuario: u.idusuario,
    usuario: u.usuario,
    accion,
    modulo,
    descripcion,
    tabla_afectada: opts?.tabla_afectada ?? null,
    idregistro: opts?.idregistro ?? null,
    equipo: navigator.userAgent,
  };

  // Fire-and-forget: enviar sin await, silenciar errores
  api.post<LogResponse>('/logs', entry).catch(() => {
    // No interrumpir el flujo si el log falla
  });
};
