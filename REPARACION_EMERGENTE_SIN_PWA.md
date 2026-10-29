# Reparación emergente: sistema 100% en línea (sin PWA ni catálogo local)

**Fecha:** 2026-10-28
**Revierte:** commit `fb33e3f` ("pwa-fix") — PWA + sincronización incremental de catálogos.
**Conserva:** la corrección de seguridad multi-negocio incluida en ese mismo commit.

---

## 1. Qué se desactivó

| Antes | Ahora |
|---|---|
| Service Worker con precache de la app | Sin Service Worker |
| App instalable (manifest) | No instalable |
| Catálogo replicado en IndexedDB (`posweb54n`) | Sin copia local; todo se lee de la API |
| Versionado de catálogo + sincronización incremental | Eliminado |
| Evento WebSocket `catalogo_update` | Eliminado |
| Indicador ONLINE/OFFLINE/SINCRONIZANDO | Eliminado |
| Operación offline del catálogo | **El sistema requiere conexión** |

El catálogo (categorías, platillos, modificadores, precios y descuentos) se
consulta directamente a la API en cada carga. React Query lo conserva en memoria
durante la sesión según `src/config/queryClient.ts` (`staleTime` 5 min), que es
el comportamiento previo a la PWA: navegar entre pasos del flujo de venta no
vuelve a descargar el catálogo completo, pero recargar la página sí.

---

## 2. El punto crítico: rescatar los equipos ya instalados

Quitar el plugin de PWA **no basta**. Los dispositivos que ya tienen la PWA
instalada conservan un Service Worker registrado con el bundle viejo en su
precache. Si `/sw.js` simplemente dejara de existir (404), esos equipos podrían
seguir sirviendo indefinidamente la versión antigua y nunca recibirían esta
corrección.

Por eso el plugin se mantiene, en modo autodestructivo:

Por eso se conserva un `/sw.js`, pero cuyo único trabajo es desmontarse. Es un
**archivo estático** (`public/sw.js`), no generado por `vite-plugin-pwa`: con el
plugin, `/sw.js` devolvía **404 en el servidor de desarrollo** (sus `devOptions`
vienen desactivados), así que un perfil local con el Service Worker viejo quedaba
atascado sin forma de recuperarse. Como archivo estático se sirve igual en
desarrollo y en producción, y `vite-plugin-pwa` ya no participa del build.

```js
install  → self.skipWaiting()                 // toma el control de inmediato
activate → caches.delete(...)                 // borra todas las caches
         → self.registration.unregister()     // se desregistra
         → client.navigate(client.url)        // renavega las pestañas abiertas
```

Todo dentro de `event.waitUntil()`, para que el navegador no corte el trabajo a
medias.

**Dos capas de limpieza:**

1. **`public/sw.js` autodestructivo** — rescata a los equipos atascados en el JS
   viejo. Su navegador sigue pidiendo `/sw.js` por su cuenta, recibe este SW y
   suelta el precache. Es la única vía de escape para un cliente que no puede
   ejecutar el código nuevo.
2. **`src/services/pwaCleanup.ts`** — para los equipos que sí cargan el código
   nuevo: desregistra Service Workers, borra todas las caches y elimina la base
   `posweb54n` de IndexedDB.

   **No recarga la página.** De eso se encarga el propio `sw.js`, que renavega
   las pestañas que controlaba. Forzar un `location.reload()` aquí era además
   contraproducente: `setupSessionClearOnReload` (en `sessionService`) borra el
   token en el evento `unload`, de modo que la recarga **cerraba la sesión del
   usuario**.

Se invoca desde `src/main.tsx` después del render, y nunca lanza: si la limpieza
falla, la aplicación arranca igual.

### Retirar el Service Worker más adelante

Cuando el parque de dispositivos esté limpio (semanas después del despliegue),
se pueden borrar `public/sw.js` y `src/services/pwaCleanup.ts`. **No antes**:
mientras exista un equipo con el Service Worker viejo, `/sw.js` debe seguir
respondiendo con el autodestructivo.

---

## 2-bis. Rutas del SPA: el 404 que destapó el retiro de la PWA

**Síntoma reportado:** `https://pos54nwebcrumen.onrender.com/login` no abría
(tampoco en incógnito), y la lista de negocios (`/clientes`) tampoco.

**Diagnóstico medido en producción:**

```text
GET /            -> 200   sirve index.html
GET /login       -> 404   "Not Found"  (del hosting, no de la app)
GET /clientes    -> 404   "Not Found"
GET /api/health  -> 200   backend sano
```

**Causa raíz.** La aplicación usa `BrowserRouter`: rutas como `/login` o
`/clientes` sólo existen en el cliente. El hosting devuelve 404 para cualquier
ruta que no exista como archivo en disco, así que entrar directo a una ruta,
recargar la página o abrir un enlace guardado fallaba.

Eso estuvo mal configurado desde antes, pero **el Service Worker lo tapaba**: su
`navigateFallback: 'index.html'` servía el shell del SPA desde el precache. Al
retirar la PWA dejó de haber quien lo tapara y el defecto quedó expuesto.

Los archivos de configuración presentes no cubren este hosting:

| Archivo | Contiene el fallback | ¿Lo lee Render? |
|---|---|---|
| `vercel.json` (`routes` → `/index.html`) | sí | **no** (es de Vercel) |
| `public/_redirects` (`/* /index.html 200`) | sí | **no** (sintaxis de Netlify) |

Render usa su propio sistema de *Redirects/Rewrites* y no interpreta ninguno de
los dos. Ambos se conservan por si se vuelve a desplegar en esas plataformas,
pero **en Render son inertes**.

### Corrección aplicada (funciona sin tocar el panel)

Render sirve `/404.html` del directorio publicado cuando la ruta no existe. El
plugin `spaFallback404` de `vite.config.ts` genera `dist/404.html` como copia
exacta de `index.html`, así que cualquier ruta desconocida entrega el shell del
SPA y React Router la resuelve en el cliente.

Verificado sirviendo `dist` con el mismo comportamiento de Render:

```text
/            -> 200   shell del SPA
/login       -> 404   shell del SPA   (la app carga y enruta bien)
/clientes    -> 404   shell del SPA
/sw.js       -> 200   Service Worker autodestructivo
```

### Pendiente recomendado (requiere acceso al panel)

El fallback anterior funciona, pero responde con código **404** en lugar de 200.
Lo correcto para un SPA es un *rewrite*. En el panel de Render:

```text
Static Site → Settings → Redirects/Rewrites → Add Rule
  Source:      /*
  Destination: /index.html
  Action:      Rewrite
```

Render no aplica las reglas a rutas que sí existen en disco, así que
`/assets/*` y `/sw.js` siguen sirviéndose con normalidad. Con esa regla puesta,
`404.html` queda como red de seguridad.

---

## 3. Archivos

### Eliminados — frontend
```text
src/services/catalogoDB.ts                     capa IndexedDB
src/services/catalogoSyncService.ts            sincronización
src/hooks/useCatalogoSync.ts                   orquestación
src/components/catalogo/CatalogoStatus.tsx     indicador de estado
src/components/catalogo/CatalogoStatus.css
```

### Eliminados — backend
```text
src/services/catalogo.service.ts               versionado, bitácora, delta
src/controllers/catalogo.controller.ts          endpoints
src/routes/catalogo.routes.ts                   rutas
src/scripts/applyCatalogoSyncMigration.ts       migración
src/scripts/create_catalogo_sync_tables.sql     migración SQL
src/scripts/testCatalogoSync.ts                 verificación
```

### Nuevo
```text
src/services/pwaCleanup.ts   limpieza del legado de la PWA en el cliente
public/sw.js                 Service Worker autodestructivo (archivo estático)
```

### Modificados
```text
vite.config.ts                     sin vite-plugin-pwa; plugin spaFallback404
src/main.tsx                       ya no registra SW; invoca la limpieza
src/App.tsx                        sin <CatalogoStatus> ni <UpdateNotification>
src/hooks/useMenuCatalogo.ts       vuelve a leer de la API
src/services/sessionService.ts     sin purga de IndexedDB al cerrar sesión
src/vite-env.d.ts                  sin __APP_VERSION__
backend/src/app.ts                 sin la ruta /api/catalogo
backend/src/services/websocket.service.ts   sin notifyCatalogoUpdate
backend/src/controllers/{categorias,productosWeb,moderadores,
                         catModeradores,descuentos}.controller.ts
                                   sin los enganches de versionado
backend/package.json               sin los scripts db:/test:catalogo-sync
```

### Quedaron sin uso (no se borraron)
```text
src/components/UpdateNotification.tsx    banner de actualización del SW
src/services/swUpdateService.ts          registro/actualización del SW
```
No se importan desde ningún punto vivo, así que el empaquetador los excluye del
bundle. Se conservan por si la PWA se reactiva.

---

## 4. Lo que NO se revirtió: corrección de seguridad multi-negocio

El commit `fb33e3f` traía, además de la PWA, una **corrección de IDOR** en los
CRUD de catálogo. **Sigue vigente y no debe revertirse.**

Antes, las operaciones por id localizaban el registro sólo por su clave
primaria: un usuario del negocio A podía leer, modificar o borrar registros del
negocio B cambiando el id en la URL. Los dos borrados físicos (moderadores y
descuentos) permitían destruir datos ajenos sin vuelta atrás.

Ahora todas filtran también por el negocio del JWT (23 filtros en 5
controladores); un id de otro negocio responde **404**:

| Controlador | Leer por id | Actualizar | Eliminar |
|---|---|---|---|
| categorías | ✔ | ✔ | ✔ |
| productos web | ✔ | ✔ | ✔ |
| moderadores | ✔ | ✔ | ✔ (físico) |
| cat. moderadores | ✔ | ✔ | ✔ |
| descuentos | ✔ | ✔ | ✔ (físico) |

También sigue corregida la validación de nombre duplicado de productos, que
comparaba contra el negocio del producto en lugar del negocio del usuario.

---

## 5. Base de datos

**No se ejecutó ninguna operación sobre la base de datos.** No se requiere
migración para esta reparación.

Si en algún momento se aplicó la migración del catálogo, estas tablas quedaron
huérfanas y **sin uso**:

```text
tblposcrumenwebcatalogoversion
tblposcrumenwebcatalogocambios
```

No se eliminaron a propósito: borrarlas es destructivo y no hace falta para que
el sistema funcione. Pueden quedarse ahí sin efecto alguno, o eliminarse más
adelante con calma si se confirma que la sincronización no se va a retomar.

Ninguna tabla de catálogo fue modificada en ningún momento.

---

## 6. Verificación

### Ejecutado
- `npm run build` (frontend, `tsc -b && vite build`) — **pasa**.
- `npm run build` (backend, `tsc`) — **pasa**.
- `npx tsc --noEmit` en backend y `npx tsc -b` en frontend — **sin errores**.
- `npx eslint` sobre los archivos modificados — **sin errores**.
- `dist/sw.js` inspeccionado: es el autodestructivo (se desregistra, renavega y
  borra caches).
- `dist/index.html`: **cero** referencias a manifest o Service Worker.
- `manifest.webmanifest` y los chunks de workbox **ya no se generan**.
- `workbox` **no aparece** en el bundle.
- Bundle principal: 1 027.67 kB → 1 008.16 kB (el código muerto no se envía).
- Búsqueda de referencias vivas a `api/catalogo`, `catalogVersion`,
  `catalogo_update`, `indexedDB` y `posweb54n`: **ninguna** fuera de
  `pwaCleanup.ts`.

### NO ejecutado
- **No hay framework de pruebas**: `npm test` no existe en ninguno de los dos
  `package.json`.
- **No se probó contra base de datos ni en navegador.** `backend/.env` apunta a
  la base de **producción en Azure**; no se ejecutó nada contra ella.

### Pendiente de comprobar en navegador tras desplegar

```text
1. Equipo con la PWA ya instalada
   Abrir la app → debe recargarse una vez sola y quedar en la versión nueva.
   DevTools → Application → Service Workers: sin ninguno registrado.
   DevTools → Application → Cache Storage: vacío.
   DevTools → Application → IndexedDB: sin la base "posweb54n".

2. Equipo nuevo
   No debe registrarse Service Worker ni ofrecerse "instalar aplicación".

3. Operación normal
   Pantallas de venta web y móvil: categorías, platillos, moderadores y
   descuentos cargan desde la API.
   Guardar/editar/eliminar catálogo desde Configuración.
   Cobrar con descuento en el módulo de pagos.

4. Sin conexión
   Comportamiento esperado AHORA: el catálogo no carga. Es intencional.
```

**Orden de despliegue:** backend primero, luego frontend. (Si se invierte, el
frontend llamaría a `/api/catalogo`, que ya no existe — pero el frontend nuevo
tampoco lo llama, así que el riesgo real es nulo.)

---

## 7. Cómo reactivar la sincronización más adelante

Todo el trabajo está íntegro en el commit `fb33e3f`:

```bash
# ver qué traía
git show --stat fb33e3f

# recuperar un archivo concreto
git checkout fb33e3f -- src/services/catalogoDB.ts

# recuperar todo el conjunto
git checkout fb33e3f -- \
  src/services/catalogoDB.ts src/services/catalogoSyncService.ts \
  src/hooks/useCatalogoSync.ts src/components/catalogo/ \
  src/hooks/useMenuCatalogo.ts \
  backend/src/services/catalogo.service.ts \
  backend/src/controllers/catalogo.controller.ts \
  backend/src/routes/catalogo.routes.ts \
  backend/src/scripts/applyCatalogoSyncMigration.ts \
  backend/src/scripts/create_catalogo_sync_tables.sql \
  backend/src/scripts/testCatalogoSync.ts
```

Haría falta además: volver a registrar la ruta en `backend/src/app.ts`,
reponer `notifyCatalogoUpdate` en `websocket.service.ts`, los enganches
`registrarCambioCatalogo` en los 5 controladores de CRUD, y revertir
`vite.config.ts` a la configuración de PWA con precache.

**Antes de reintentarlo**, conviene aclarar qué falló esta vez. La documentación
del intento anterior está en `git show fb33e3f:PWA_CATALOGO_SINCRONIZACION.md`,
donde también consta que la migración nunca se aplicó ni se probó contra la base
de datos.
