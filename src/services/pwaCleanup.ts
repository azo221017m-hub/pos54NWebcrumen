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
 *   3. elimina la base de datos local del catálogo (`posweb54n`).
 *
 * NO recarga la página. De eso se encarga `public/sw.js`, que renavega las
 * pestañas que todavía controlaba. Forzar aquí un `location.reload()` sería
 * además contraproducente: `setupSessionClearOnReload` (sessionService) borra
 * el token en el evento `unload`, de modo que la recarga cerraría la sesión
 * del usuario.
 *
 * Nunca lanza: si algo falla, la aplicación debe arrancar igual.
 */

const DB_CATALOGO_LEGADO = 'posweb54n';

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
    await desregistrarServiceWorkers();
    await borrarCaches();
    await borrarCatalogoLocal();
  } catch (error) {
    console.warn('[PWACleanup] limpieza incompleta:', error);
  }
};

export default limpiarLegadoPWA;
