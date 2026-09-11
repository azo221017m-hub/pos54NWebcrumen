/**
 * Sincronización del catálogo entre Azure MySQL (fuente de verdad) y la copia
 * local en IndexedDB.
 *
 * Fuentes de verdad:
 *   MySQL          = fuente de verdad
 *   IndexedDB      = réplica local operativa (permite operar offline)
 *   TanStack Query = estado/caché de la aplicación (lee de IndexedDB)
 *
 * La sincronización NO hace polling. Se dispara por:
 *   - arranque de la PWA,
 *   - evento WebSocket `catalogo_update` del propio negocio,
 *   - recuperación de la conexión (`online`),
 *   - reactivación de la pestaña, con un mínimo de 5 minutos entre chequeos,
 *   - solicitud explícita del usuario (forzar sincronización / reconstruir).
 */

import apiClient from './api';
import {
  aplicarCambiosIncrementales,
  aplicarSnapshotCompleto,
  destruirDB,
  leerVersionLocal,
  limpiarCatalogoLocal,
  marcarSincronizado,
  purgarOtrosNegocios,
  soportaIndexedDB,
  type CambiosColeccion,
  type NombreColeccion
} from './catalogoDB';

const API_BASE = '/catalogo';

/** Mínimo entre chequeos de versión disparados por foco de la pestaña. */
const MIN_MS_ENTRE_CHEQUEOS = 5 * 60 * 1000;

export type EstadoSync =
  | 'inactivo'
  | 'sincronizando'
  | 'actualizado'
  | 'offline'
  | 'error';

export interface EstadoCatalogo {
  estado: EstadoSync;
  /** Versión del catálogo replicada localmente */
  version: number;
  lastSync: string | null;
  /** Conectividad efectiva: hubo respuesta real de la API, no sólo navigator.onLine */
  online: boolean;
  mensaje?: string;
}

type Suscriptor = (estado: EstadoCatalogo) => void;

let estadoActual: EstadoCatalogo = {
  estado: 'inactivo',
  version: 0,
  lastSync: null,
  online: typeof navigator === 'undefined' ? true : navigator.onLine
};

const suscriptores = new Set<Suscriptor>();

/** Suscribe un observador al estado de sincronización. Devuelve la función de baja. */
export const suscribirEstadoCatalogo = (suscriptor: Suscriptor): (() => void) => {
  suscriptores.add(suscriptor);
  suscriptor(estadoActual);
  return () => {
    suscriptores.delete(suscriptor);
  };
};

export const obtenerEstadoCatalogo = (): EstadoCatalogo => estadoActual;

const emitirEstado = (parcial: Partial<EstadoCatalogo>): void => {
  estadoActual = { ...estadoActual, ...parcial };
  suscriptores.forEach((s) => s(estadoActual));
};

/** Se dispara tras cada sincronización que modificó datos, para refrescar la UI. */
const oyentesCambio = new Set<() => void>();

export const suscribirCambioCatalogo = (oyente: () => void): (() => void) => {
  oyentesCambio.add(oyente);
  return () => {
    oyentesCambio.delete(oyente);
  };
};

const notificarCambio = (): void => oyentesCambio.forEach((o) => o());

// ─────────────────────────────────────────────────────────────────────────────
// Contratos de la API
// ─────────────────────────────────────────────────────────────────────────────

type FilaCatalogo = Record<string, unknown>;

interface RespuestaVersion {
  success: boolean;
  idnegocio: number;
  catalogVersion: number;
}

interface RespuestaSync {
  success: boolean;
  mode: 'incremental' | 'full';
  fromVersion: number;
  currentVersion: number;
  changes?: Partial<Record<NombreColeccion, { upserted: FilaCatalogo[]; deleted: number[] }>>;
  snapshot?: Partial<Record<NombreColeccion, FilaCatalogo[]>>;
  reason?: string;
}

/**
 * Distingue un fallo de red/API de un error de lógica.
 * `navigator.onLine` no basta: puede haber WiFi sin backend accesible.
 */
const esFalloDeRed = (error: unknown): boolean => {
  const err = error as { response?: unknown; code?: string; message?: string };
  if (err?.response) return false; // el servidor respondió: no es fallo de red
  return (
    err?.code === 'ECONNABORTED' ||
    err?.code === 'ERR_NETWORK' ||
    err?.message === 'Network Error' ||
    !err?.response
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sincronización
// ─────────────────────────────────────────────────────────────────────────────

/** Serializa las sincronizaciones: nunca dos a la vez sobre la misma copia local. */
let sincronizacionEnCurso: Promise<boolean> | null = null;
let ultimoChequeo = 0;

export interface OpcionesSync {
  /** Ignora el throttle y la comparación de versiones: siempre consulta al servidor */
  forzar?: boolean;
  /** Descarta la copia local y descarga el catálogo completo */
  reconstruir?: boolean;
}

/**
 * Sincroniza el catálogo local del negocio indicado.
 * Devuelve true si la copia local quedó al día (aunque no hubiera cambios).
 */
export const sincronizarCatalogo = async (
  idnegocio: number,
  opciones: OpcionesSync = {}
): Promise<boolean> => {
  if (!idnegocio || !soportaIndexedDB()) return false;

  // Si ya hay una sincronización en curso, reutilizarla en vez de lanzar otra.
  if (sincronizacionEnCurso) return sincronizacionEnCurso;

  sincronizacionEnCurso = ejecutarSync(idnegocio, opciones).finally(() => {
    sincronizacionEnCurso = null;
  });

  return sincronizacionEnCurso;
};

const ejecutarSync = async (idnegocio: number, opciones: OpcionesSync): Promise<boolean> => {
  const { forzar = false, reconstruir = false } = opciones;

  try {
    // Un dispositivo compartido no debe conservar el catálogo de otro negocio.
    await purgarOtrosNegocios(idnegocio);

    if (reconstruir) {
      await limpiarCatalogoLocal(idnegocio);
    }

    const versionLocal = reconstruir ? 0 : await leerVersionLocal(idnegocio);
    emitirEstado({ estado: 'sincronizando', version: versionLocal });

    // Chequeo barato de versión: evita pedir el delta si ya estamos al día.
    if (!forzar && !reconstruir && versionLocal > 0) {
      const { data } = await apiClient.get<RespuestaVersion>(`${API_BASE}/version`);

      if (data.catalogVersion === versionLocal) {
        await marcarSincronizado(idnegocio, versionLocal);
        ultimoChequeo = Date.now();
        emitirEstado({
          estado: 'actualizado',
          version: versionLocal,
          lastSync: new Date().toISOString(),
          online: true,
          mensaje: undefined
        });
        return true;
      }
    }

    const { data } = await apiClient.get<RespuestaSync>(`${API_BASE}/sync`, {
      params: { since: versionLocal }
    });

    // ATOMICIDAD: datos y versión local se escriben en una sola transacción de
    // IndexedDB. Si falla, la versión local NO avanza y el próximo intento
    // vuelve a pedir el mismo delta.
    if (data.mode === 'full') {
      await aplicarSnapshotCompleto(
        idnegocio,
        (data.snapshot ?? {}) as Partial<Record<NombreColeccion, FilaCatalogo[]>>,
        data.currentVersion
      );
      console.log(
        `[CatalogoSync] reconstrucción completa business=${idnegocio} ` +
          `version=${data.currentVersion}${data.reason ? ` motivo=${data.reason}` : ''}`
      );
    } else {
      const cambios = (data.changes ?? {}) as Partial<Record<NombreColeccion, CambiosColeccion>>;
      const totalCambios = Object.values(cambios).reduce(
        (acc, c) => acc + (c?.upserted?.length ?? 0) + (c?.deleted?.length ?? 0),
        0
      );

      if (totalCambios === 0 && data.currentVersion === versionLocal) {
        await marcarSincronizado(idnegocio, versionLocal);
      } else {
        await aplicarCambiosIncrementales(idnegocio, cambios, data.currentVersion);
        console.log(
          `[CatalogoSync] incremental business=${idnegocio} ` +
            `${versionLocal} → ${data.currentVersion} cambios=${totalCambios}`
        );
      }
    }

    ultimoChequeo = Date.now();
    emitirEstado({
      estado: 'actualizado',
      version: data.currentVersion,
      lastSync: new Date().toISOString(),
      online: true,
      mensaje: undefined
    });

    notificarCambio();
    return true;
  } catch (error) {
    const versionLocal = await leerVersionLocal(idnegocio).catch(() => 0);

    if (esFalloDeRed(error)) {
      // Sin API accesible: se sigue operando con la copia local.
      emitirEstado({
        estado: 'offline',
        version: versionLocal,
        online: false,
        mensaje: 'Sin conexión con el servidor; se usa el catálogo local'
      });
      return false;
    }

    console.error('[CatalogoSync] error de sincronización:', error);
    emitirEstado({
      estado: 'error',
      version: versionLocal,
      online: true,
      mensaje: error instanceof Error ? error.message : 'Error de sincronización'
    });
    return false;
  }
};

/**
 * Chequeo throttleado: sólo consulta al servidor si pasaron al menos 5 minutos
 * desde el último. Se usa al reactivar la pestaña; NO es polling.
 */
export const sincronizarSiCorresponde = async (idnegocio: number): Promise<boolean> => {
  if (Date.now() - ultimoChequeo < MIN_MS_ENTRE_CHEQUEOS) return false;
  return sincronizarCatalogo(idnegocio);
};

/** Fuerza una sincronización inmediata ignorando el throttle. */
export const forzarSincronizacion = (idnegocio: number): Promise<boolean> =>
  sincronizarCatalogo(idnegocio, { forzar: true });

/**
 * Reconstruye la copia local desde cero (recuperación ante corrupción o
 * inconsistencia). Sólo afecta a ESTE dispositivo.
 */
export const reconstruirCatalogoLocal = (idnegocio: number): Promise<boolean> =>
  sincronizarCatalogo(idnegocio, { forzar: true, reconstruir: true });

/**
 * Reconstrucción de emergencia: destruye la base local completa y vuelve a
 * descargar el catálogo. Para cuando IndexedDB quedó en un estado ilegible.
 */
export const restablecerCatalogoLocal = async (idnegocio: number): Promise<boolean> => {
  await destruirDB();
  ultimoChequeo = 0;
  return sincronizarCatalogo(idnegocio, { forzar: true, reconstruir: true });
};

/** Limpia la copia local. Se invoca al cerrar sesión. */
export const olvidarCatalogoLocal = async (idnegocio?: number): Promise<void> => {
  ultimoChequeo = 0;
  estadoActual = {
    estado: 'inactivo',
    version: 0,
    lastSync: null,
    online: typeof navigator === 'undefined' ? true : navigator.onLine
  };

  try {
    await limpiarCatalogoLocal(idnegocio);
  } catch (error) {
    console.warn('[CatalogoSync] no se pudo limpiar el catálogo local:', error);
  }
};

/** Marca el estado como offline sin lanzar una sincronización (evento `offline`). */
export const marcarOffline = (): void => {
  emitirEstado({ estado: 'offline', online: false });
};
