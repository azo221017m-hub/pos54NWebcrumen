/**
 * Limpieza del legado de la PWA (reparación emergente).
 *
 * El sistema pasó a operar 100% en línea: ya no hay Service Worker, ni precache
 * de la aplicación, ni catálogo replicado en IndexedDB.
 *
 * Este módulo desmonta lo que quedó instalado en los dispositivos:
 *
 *   1. desregistra cualquier Service Worker previo;
 *   2. borra todas las caches del navegador (precache de la app y api-cache);
 *   3. elimina la base de datos local del catálogo (`posweb54n`);
 *   4. recarga UNA vez si la página venía siendo servida por el Service Worker,
 *      porque en ese caso el HTML/JS mostrado puede ser una versión vieja.
 *
 * Sin el paso 4, un equipo con la PWA instalada seguiría ejecutando el bundle
 * antiguo tomado del precache y nunca vería esta corrección.
 *
 * Nunca lanza: si algo falla, la aplicación debe arrancar igual.
 */

const DB_CATALOGO_LEGADO = 'posweb54n';
const BANDERA_RECARGA = 'pwaCleanupRecargado';

/** Desregistra todos los Service Workers. Devuelve true si había alguno. */
const desregistrarServiceWorkers = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registros = await navigator.serviceWorker.getRegistrations();
    if (registros.length === 0) return false;

    await Promise.all(
      registros.map((registro) =>
        registro.unregister().catch((err) => {
          console.warn('[PWACleanup] no se pudo desregistrar un Service Worker:', err);
          return false;
        })
      )
    );

    console.log(`[PWACleanup] Service Workers desregistrados: ${registros.length}`);
    return true;
  } catch (error) {
    console.warn('[PWACleanup] error al desregistrar Service Workers:', error);
    return false;
  }
};

/** Borra todas las caches del navegador (precache de la app y respuestas de API). */
const borrarCaches = async (): Promise<void> => {
  if (!('caches' in window)) return;

  try {
    const nombres = await caches.keys();
    if (nombres.length === 0) return;

    await Promise.all(nombres.map((nombre) => caches.delete(nombre)));
    console.log(`[PWACleanup] caches eliminadas: ${nombres.join(', ')}`);
  } catch (error) {
    console.warn('[PWACleanup] error al borrar caches:', error);
  }
};

/** Elimina la base de datos local del catálogo que usaba la sincronización. */
const borrarCatalogoLocal = async (): Promise<void> => {
  if (typeof indexedDB === 'undefined' || indexedDB === null) return;

  try {
    await new Promise<void>((resolve) => {
      const solicitud = indexedDB.deleteDatabase(DB_CATALOGO_LEGADO);
      // Es una limpieza de mejor esfuerzo: cualquier desenlace resuelve.
      solicitud.onsuccess = () => {
        console.log(`[PWACleanup] IndexedDB "${DB_CATALOGO_LEGADO}" eliminada`);
        resolve();
      };
      solicitud.onerror = () => resolve();
      solicitud.onblocked = () => resolve();
    });
  } catch (error) {
    console.warn('[PWACleanup] error al eliminar el catálogo local:', error);
  }
};

/**
 * Ejecuta la limpieza completa. Se invoca al arrancar la aplicación.
 */
export const limpiarLegadoPWA = async (): Promise<void> => {
  try {
    // Leer el controlador ANTES de desregistrar: indica que este documento fue
    // servido por el Service Worker y por tanto puede ser una versión vieja.
    const servidaPorServiceWorker = Boolean(
      'serviceWorker' in navigator && navigator.serviceWorker.controller
    );

    const habiaServiceWorker = await desregistrarServiceWorkers();
    await borrarCaches();
    await borrarCatalogoLocal();

    if (!servidaPorServiceWorker && !habiaServiceWorker) return;

    // Recargar una sola vez por sesión de pestaña, para no entrar en un bucle
    // si por cualquier motivo la limpieza no pudo completarse.
    let yaRecargado = false;
    try {
      yaRecargado = sessionStorage.getItem(BANDERA_RECARGA) === '1';
      sessionStorage.setItem(BANDERA_RECARGA, '1');
    } catch {
      // Sin sessionStorage (modo privado) no se arriesga una recarga automática
      return;
    }

    if (!yaRecargado && servidaPorServiceWorker) {
      console.log('[PWACleanup] recargando para obtener la versión en línea...');
      window.location.reload();
    }
  } catch (error) {
    console.warn('[PWACleanup] limpieza incompleta:', error);
  }
};

export default limpiarLegadoPWA;
