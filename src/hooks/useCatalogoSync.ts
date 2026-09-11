import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';
import {
  forzarSincronizacion,
  marcarOffline,
  obtenerEstadoCatalogo,
  reconstruirCatalogoLocal,
  restablecerCatalogoLocal,
  sincronizarCatalogo,
  sincronizarSiCorresponde,
  suscribirCambioCatalogo,
  suscribirEstadoCatalogo,
  type EstadoCatalogo
} from '../services/catalogoSyncService';
import { MENU_CATALOGO_QUERY_KEYS } from './useMenuCatalogo';

/**
 * Negocio de la sesión actual. Se lee del usuario autenticado guardado en
 * localStorage por sessionService (el Backend igualmente valida el JWT y
 * resuelve el negocio por su cuenta; esto sólo sirve para particionar la
 * copia local por negocio).
 */
export const obtenerIdNegocioSesion = (): number | null => {
  try {
    const usuarioRaw = localStorage.getItem('usuario');
    if (usuarioRaw) {
      const usuario = JSON.parse(usuarioRaw) as { idNegocio?: number | string };
      const id = Number(usuario?.idNegocio);
      if (Number.isFinite(id) && id > 0) return id;
    }

    const idPlano = Number(localStorage.getItem('idnegocio'));
    return Number.isFinite(idPlano) && idPlano > 0 ? idPlano : null;
  } catch {
    return null;
  }
};

const haySesion = (): boolean => Boolean(localStorage.getItem('token'));

/**
 * Orquesta la sincronización del catálogo durante toda la vida de la app.
 *
 * Debe montarse UNA sola vez (en App). Dispara la sincronización en el arranque,
 * al recibir el evento `catalogo_update` del propio negocio, al recuperar la
 * conexión y al reactivar la pestaña (con un mínimo de 5 minutos entre chequeos).
 * No hace polling.
 */
export const useCatalogoSync = (): EstadoCatalogo & {
  sincronizarAhora: () => void;
  reconstruir: () => void;
  restablecer: () => void;
} => {
  const queryClient = useQueryClient();
  const [estado, setEstado] = useState<EstadoCatalogo>(obtenerEstadoCatalogo);
  const idNegocioRef = useRef<number | null>(null);

  // Reflejar el estado del servicio en el componente
  useEffect(() => suscribirEstadoCatalogo(setEstado), []);

  // Cuando la sincronización cambió datos, invalidar las queries del catálogo
  // para que las pantallas de venta vuelvan a leer de IndexedDB.
  useEffect(
    () =>
      suscribirCambioCatalogo(() => {
        Object.values(MENU_CATALOGO_QUERY_KEYS).forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }),
    [queryClient]
  );

  // Arranque: sincronizar en segundo plano sin bloquear la UI
  useEffect(() => {
    const idnegocio = obtenerIdNegocioSesion();
    idNegocioRef.current = idnegocio;

    if (idnegocio && haySesion()) {
      void sincronizarCatalogo(idnegocio);
    }
  }, []);

  // Recuperación de conexión y cambio de visibilidad
  useEffect(() => {
    const alRecuperarConexion = () => {
      const idnegocio = obtenerIdNegocioSesion();
      if (idnegocio && haySesion()) void forzarSincronizacion(idnegocio);
    };

    const alPerderConexion = () => marcarOffline();

    const alCambiarVisibilidad = () => {
      if (document.visibilityState !== 'visible') return;
      const idnegocio = obtenerIdNegocioSesion();
      if (idnegocio && haySesion()) void sincronizarSiCorresponde(idnegocio);
    };

    window.addEventListener('online', alRecuperarConexion);
    window.addEventListener('offline', alPerderConexion);
    document.addEventListener('visibilitychange', alCambiarVisibilidad);

    return () => {
      window.removeEventListener('online', alRecuperarConexion);
      window.removeEventListener('offline', alPerderConexion);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
    };
  }, []);

  // Evento del servidor: "existe una versión nueva del catálogo".
  // Se ignora cualquier evento que no sea del negocio de esta sesión.
  useWebSocket({
    onMessage: (data) => {
      if (data.type !== 'catalogo_update') return;

      const idnegocio = obtenerIdNegocioSesion();
      if (!idnegocio || Number(data.idnegocio) !== idnegocio) return;
      if (!haySesion()) return;

      const versionRemota = Number(data.catalogVersion);
      if (Number.isFinite(versionRemota) && versionRemota === obtenerEstadoCatalogo().version) {
        return; // ya aplicada (p. ej. este mismo dispositivo hizo el cambio)
      }

      void forzarSincronizacion(idnegocio);
    }
  });

  const sincronizarAhora = useCallback(() => {
    const idnegocio = obtenerIdNegocioSesion();
    if (idnegocio) void forzarSincronizacion(idnegocio);
  }, []);

  const reconstruir = useCallback(() => {
    const idnegocio = obtenerIdNegocioSesion();
    if (idnegocio) void reconstruirCatalogoLocal(idnegocio);
  }, []);

  const restablecer = useCallback(() => {
    const idnegocio = obtenerIdNegocioSesion();
    if (idnegocio) void restablecerCatalogoLocal(idnegocio);
  }, []);

  return { ...estado, sincronizarAhora, reconstruir, restablecer };
};

export default useCatalogoSync;
