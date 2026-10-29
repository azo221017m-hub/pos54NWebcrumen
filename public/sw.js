/**
 * Service Worker AUTODESTRUCTIVO.
 *
 * El sistema dejó de usar PWA: opera 100% en línea. Este archivo existe
 * únicamente para desmontar las instalaciones previas.
 *
 * Los dispositivos que ya tenían la PWA conservan un Service Worker registrado
 * con el bundle viejo en su precache. Su navegador sigue pidiendo /sw.js por su
 * cuenta en cada navegación; al recibir este archivo, el SW viejo se reemplaza
 * por éste, que borra las caches, se desregistra y renavega las pestañas para
 * que tomen la versión de red.
 *
 * Se sirve como archivo estático (public/) en lugar de generarlo con
 * vite-plugin-pwa para que exista también en el servidor de desarrollo: con el
 * plugin, /sw.js devolvía 404 en dev y los perfiles con el SW viejo quedaban
 * atascados sin forma de recuperarse.
 *
 * NO declara un handler de `fetch`, así que no intercepta ninguna petición.
 *
 * NO BORRAR mientras queden dispositivos con la PWA antigua instalada: si
 * /sw.js devolviera 404, esos equipos podrían seguir sirviendo el bundle viejo
 * de forma indefinida.
 */

self.addEventListener('install', () => {
  // Tomar el control de inmediato, sin esperar a que se cierren las pestañas.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 1. Borrar todo lo precacheado (shell de la app y respuestas de API).
      try {
        const nombres = await caches.keys();
        await Promise.all(nombres.map((nombre) => caches.delete(nombre)));
      } catch (error) {
        console.warn('[sw] no se pudieron borrar las caches:', error);
      }

      // 2. Desregistrarse: a partir de aquí ya no controla ninguna página.
      try {
        await self.registration.unregister();
      } catch (error) {
        console.warn('[sw] no se pudo desregistrar:', error);
      }

      // 3. Renavegar las pestañas abiertas para que carguen desde la red.
      try {
        const clientes = await self.clients.matchAll({ type: 'window' });
        await Promise.all(
          clientes.map((cliente) => {
            try {
              return cliente.navigate(cliente.url);
            } catch {
              return Promise.resolve();
            }
          })
        );
      } catch (error) {
        console.warn('[sw] no se pudieron renavegar los clientes:', error);
      }
    })()
  );
});
