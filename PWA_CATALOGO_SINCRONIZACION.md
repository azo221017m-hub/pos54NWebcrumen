# PWA + Sincronización Inteligente de Catálogos — POSWEB54N / CRUMEN54N

Documento de referencia de la arquitectura de catálogos locales con PWA,
versionado, eventos y sincronización incremental.

---

## A. Resumen

**Qué se encontró**

| Área | Estado previo |
|---|---|
| PWA / Service Worker | Ya existía (`vite-plugin-pwa` + `workbox-window`, `registerType: 'prompt'`) |
| WebSocket | Ya existía (`ws` nativo, `path: /ws`, broadcast + filtrado por `idnegocio` en cliente). **No** hay Socket.IO |
| React Query | Ya existía (`staleTime` 5 min, `refetchOnMount: false`) |
| Caché de catálogo | Sólo en memoria (`useMenuCatalogo`); se perdía al recargar |
| IndexedDB | **No existía** (cero usos en el repositorio) |
| Versionado de catálogo | **No existía** |
| Multi-tenant | Sólo por `idnegocio`. No hay sucursal ni terminal en el modelo |

**Qué se modificó**

- Versionado de catálogo **por negocio** en MySQL, con bitácora de cambios.
- Endpoints `/api/catalogo/version|sync|full|rebuild`.
- Evento WebSocket `catalogo_update` (sólo la versión, nunca los datos).
- Copia local del catálogo en **IndexedDB** (`posweb54n`), escrita de forma atómica.
- `useMenuCatalogo` ahora lee de IndexedDB en vez de la API, conservando sus
  nombres exportados para no tocar las pantallas de venta.
- Indicador ONLINE / OFFLINE / SINCRONIZANDO / ACTUALIZADO / ERROR, común a web y móvil.
- Service Worker: `navigateFallback` para que la PWA arranque sin conexión.

**Lo que NO se tocó**: ventas, pedidos, carrito, pagos, turnos, impresión,
WhatsApp, reportes, usuarios, privilegios y menú digital conservan su
comportamiento. No se instaló ninguna dependencia nueva.

---

## B. Arquitectura

```text
                            INTERNET
                               │
                               ▼
                     ┌──────────────────┐
                     │  React 19 + PWA  │
                     │    POSWEB54N     │
                     └────────┬─────────┘
                              │
             ┌────────────────┼─────────────────┐
             ▼                ▼                 ▼
      TanStack Query     IndexedDB         Service Worker
      (estado/caché)   (posweb54n)        (app shell)
             │                │                 │
             └────────────────┼─────────────────┘
                              │ HTTPS (JWT)
                              ▼
                     ┌──────────────────┐
                     │  Node / Express  │
                     │       API        │
                     └────────┬─────────┘
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
          Azure MySQL                WebSocket (ws)
            bdcdttx                  catalogo_update
       (fuente de verdad)        (sólo avisa: "hay v+1")
```

**Fuentes de verdad**

```text
MySQL           = fuente de verdad
IndexedDB       = réplica local operativa (permite operar offline)
TanStack Query  = estado/caché de la aplicación (lee de IndexedDB)
```

El Frontend nunca se conecta a MySQL. Toda lectura pasa por la API.

**Flujo de propagación de un cambio**

```text
Administrador cambia un precio
        ↓
API: UPDATE tblposcrumenwebproductos
        ↓
registrarCambioCatalogo()  [transacción]
   ├── version 153 → 154
   └── INSERT en bitácora
        ↓
WebSocket: { type: 'catalogo_update', idnegocio, catalogVersion: 154 }
        ↓
Caja 1 · Caja 2 · Tablet · Celular mesero · Menú digital
        ↓
GET /api/catalogo/sync?since=153
        ↓
IndexedDB (una transacción: datos + versión)
        ↓
React Query invalida → UI actualizada
```

**Arranque de la PWA**

```text
1. Se monta App → useCatalogoSync
2. Las pantallas leen IndexedDB y pintan el catálogo YA
3. En paralelo: GET /api/catalogo/version
4. Si coincide con la versión local → no se descarga nada
5. Si no coincide → GET /api/catalogo/sync?since=N
6. Se aplica en una transacción de IndexedDB
7. Se invalida React Query → la UI se refresca
```

El POS nunca se bloquea esperando la descarga del catálogo.

---

## C. Archivos

### Backend — nuevos
```text
backend/src/services/catalogo.service.ts                 versionado, bitácora, consultas, delta
backend/src/controllers/catalogo.controller.ts           endpoints
backend/src/routes/catalogo.routes.ts                    rutas + auth
backend/src/scripts/create_catalogo_sync_tables.sql      migración SQL
backend/src/scripts/applyCatalogoSyncMigration.ts        migración ejecutable (idempotente)
backend/src/scripts/testCatalogoSync.ts                  verificación contra BD
```

### Backend — modificados
```text
backend/src/app.ts                                       registra /api/catalogo
backend/src/services/websocket.service.ts                + notifyCatalogoUpdate()
backend/src/controllers/categorias.controller.ts         bump de versión en crear/actualizar/eliminar
backend/src/controllers/productosWeb.controller.ts       idem
backend/src/controllers/moderadores.controller.ts        idem
backend/src/controllers/catModeradores.controller.ts     idem
backend/src/controllers/descuentos.controller.ts         idem (+ cambiarEstatus)
backend/package.json                                     + db:catalogo-sync, test:catalogo-sync
```

### Frontend — nuevos
```text
src/services/catalogoDB.ts                               capa IndexedDB
src/services/catalogoSyncService.ts                      sincronización + estado observable
src/hooks/useCatalogoSync.ts                             orquestación (arranque, WS, online, foco)
src/components/catalogo/CatalogoStatus.tsx               indicador de estado
src/components/catalogo/CatalogoStatus.css
```

### Frontend — modificados
```text
src/hooks/useMenuCatalogo.ts                             ahora lee de IndexedDB
src/App.tsx                                              monta <CatalogoStatus />
src/services/sessionService.ts                           purga IndexedDB al cerrar sesión
src/pages/PageVentas/PageVentas.tsx                      moderadores desde catálogo local
src/pages/PageVentasMobile/PageVentasMobile.tsx          idem
src/components/ventas/ModuloPagos.tsx                    descuentos desde catálogo local
vite.config.ts                                           navigateFallback + __APP_VERSION__
src/vite-env.d.ts                                        declara __APP_VERSION__
```

---

## D. Base de datos

### Tablas nuevas

**`tblposcrumenwebcatalogoversion`** — versión actual por negocio

| Columna | Tipo | Notas |
|---|---|---|
| `idnegocio` | INT | PK |
| `version` | BIGINT | arranca en 0; se siembra en 1 |
| `fechaactualizacion` | DATETIME | `ON UPDATE CURRENT_TIMESTAMP` |

**`tblposcrumenwebcatalogocambios`** — bitácora incremental

| Columna | Tipo | Notas |
|---|---|---|
| `idcambio` | BIGINT | PK auto |
| `idnegocio` | INT | |
| `version` | BIGINT | versión resultante del cambio |
| `entidad` | VARCHAR(32) | `producto` \| `categoria` \| `moderador` \| `catmoderador` \| `descuento` |
| `identidad` | BIGINT | PK del registro afectado |
| `accion` | VARCHAR(10) | `CREATE` \| `UPDATE` \| `DELETE` |
| `fecha` | DATETIME | |

### Índices
```text
idx_catalogocambios_negocio_version (idnegocio, version)   ← usado por /sync
idx_catalogocambios_fecha (fecha)                          ← purga por antigüedad
```

### Columnas nuevas en tablas existentes
Ninguna. **No se modificó ni una sola tabla de catálogo.**

### Triggers
**Ninguno, deliberadamente.** El incremento de versión vive en la lógica de
dominio del Backend (`registrarCambioCatalogo`), en la misma transacción que
escribe la bitácora. Un trigger no podría emitir el evento de WebSocket ni
distinguir un borrado lógico de uno físico.

### Migración
```bash
cd backend
npm run db:catalogo-sync      # idempotente: se puede repetir sin daño
```
O aplicando `backend/src/scripts/create_catalogo_sync_tables.sql` directamente.

---

## E. API

Todas las rutas exigen JWT válido. **El negocio se deriva del token
(`req.user.idNegocio`), nunca de parámetros del cliente**: no es posible pedir
el catálogo de otro negocio.

### `GET /api/catalogo/version`
Respuesta mínima; no consulta ninguna tabla de catálogo.
```json
{ "success": true, "idnegocio": 100000, "catalogVersion": 154, "serverTime": "..." }
```

### `GET /api/catalogo/sync?since={version}`
Modo incremental:
```json
{
  "success": true,
  "mode": "incremental",
  "fromVersion": 152,
  "currentVersion": 155,
  "changes": {
    "productos":  { "upserted": [ { "idProducto": 1548, "...": "..." } ], "deleted": [] },
    "categorias": { "upserted": [ { "idCategoria": 12,  "...": "..." } ], "deleted": [] }
  }
}
```
Modo completo (`mode: "full"`) con `snapshot` en lugar de `changes`. Se elige
automáticamente cuando:

```text
sin-version-local          el cliente no tiene copia local (since = 0)
version-local-adelantada   la versión local es mayor que la del servidor (dato corrupto)
bitacora-incompleta        la bitácora ya no cubre el rango solicitado
demasiados-cambios         más de 200 cambios: sale más barato reconstruir
```

Las filas devueltas se releen de MySQL en el momento de la petición, no se toman
de la bitácora: el cliente siempre recibe el estado vigente.

### `GET /api/catalogo/full`
Snapshot completo del catálogo del negocio.

### `POST /api/catalogo/rebuild`
Requiere **privilegio ≥ 5**. Purga la bitácora y sube la versión, con lo que
todos los dispositivos del negocio reconstruyen su copia local.

### Endpoints existentes
Ninguno fue modificado ni retirado. `/api/categorias`, `/api/productos-web`,
`/api/moderadores`, `/api/cat-moderadores` y `/api/descuentos` siguen operando
igual; las pantallas de administración los usan tal cual, y sirven de respaldo
cuando IndexedDB no está disponible.

---

## F. Eventos

### `catalogo_update` (CATALOG_UPDATED)

| | |
|---|---|
| **Emisor** | `catalogo.service.ts` → `websocketService.notifyCatalogoUpdate()` |
| **Transporte** | WebSocket existente (`ws`, ruta `/ws`) |
| **Receptor** | `useCatalogoSync` en cada cliente |
| **Disparo** | Cualquier alta/cambio/baja de catálogo, y `POST /rebuild` |

```json
{
  "type": "catalogo_update",
  "idnegocio": 100000,
  "catalogVersion": 154,
  "entidades": [ { "entity": "producto", "entityId": 1548, "action": "UPDATE" } ],
  "timestamp": "2026-09-10T18:22:41.000Z"
}
```

El evento significa **"existe una versión nueva del catálogo"**, nunca
*"aquí están los datos"*. El payload no transporta catálogo, así que el
broadcast (que llega a todos los clientes conectados, como el resto de eventos
de este sistema) no expone datos de ningún negocio. El receptor descarta todo
evento cuyo `idnegocio` no sea el de su sesión, y descarga el delta por HTTP
autenticado.

### Eventos existentes
`nuevo_pedido_web`, `estado_cambio_web`, `venta_update`, `gasto_update`,
`turno_update`, `inventario_update`, `mensaje_pedido_transito` — intactos.

---

## G. IndexedDB

```text
database: posweb54n   (versión de esquema: 1)

stores:
  categorias       keyPath [_negocio, idCategoria]    índice porNegocio
  productos        keyPath [_negocio, idProducto]     índice porNegocio
  moderadores      keyPath [_negocio, idmoderador]    índice porNegocio
  catModeradores   keyPath [_negocio, idmodref]       índice porNegocio
  descuentos       keyPath [_negocio, id_descuento]   índice porNegocio
  catalogMetadata  keyPath idnegocio
```

`catalogMetadata` guarda por negocio:
```text
idnegocio
catalogVersion     versión replicada localmente
lastSync           ISO de la última sincronización exitosa
conteos            registros por colección (diagnóstico)
```

**Aislamiento multi-negocio.** La clave compuesta `[_negocio, <pk>]` y el índice
`porNegocio` garantizan que una lectura jamás devuelva registros de otro negocio.
Además:

- antes de cada sincronización se purga el catálogo de cualquier negocio distinto
  al activo (`purgarOtrosNegocios`);
- al cerrar sesión se borra la base local completa (`clearSession`);
- el Backend filtra por `idnegocio` del JWT, así que el cliente nunca recibe
  datos ajenos que pudiera almacenar.

```text
business 100000 ──► catalog v154
business 100006 ──► catalog v89     (nunca se mezclan)
```

**Atomicidad.** Tanto `aplicarSnapshotCompleto` como `aplicarCambiosIncrementales`
escriben datos **y** versión en **una sola transacción** que abarca las seis
stores. Si cualquier paso falla, la transacción se aborta: la versión local se
queda en la anterior y el siguiente intento vuelve a pedir el mismo delta. Nunca
queda un catálogo a medias.

**Qué NO se guarda**: contraseñas, tokens JWT, secretos ni credenciales de MySQL.
Sólo catálogo operativo del negocio autenticado.

---

## H. Estrategia offline

### Funciona sin conexión
```text
✔ Arranque de la PWA (app shell precacheado)
✔ Categorías
✔ Platillos/productos, con sus imágenes
✔ Precios
✔ Moderadores (modificadores) y sus categorías
✔ Descuentos
✔ Navegar el menú y armar la comanda en pantalla
```

### NO funciona sin conexión
```text
✘ Registrar ventas y pedidos      → API
✘ Pagos                            → API
✘ Turnos y cortes                  → API
✘ Movimientos de inventario        → API
✘ Mesas, clientes, reportes        → API
✘ Impresión que dependa del negocio no cacheado
```

Esta separación es deliberada: **catálogo** se replica localmente,
**datos transaccionales** siguen yendo a la API. Convertir ventas en datos
locales exigiría resolver conflictos, folios y cortes, y está fuera de alcance.
No se tocó ningún mecanismo offline preexistente de ventas.

### Detección de conectividad
`navigator.onLine` se usa como pista, **no** como verdad: puede haber WiFi con la
API caída. El estado real sale del resultado de las peticiones —
`esFalloDeRed()` distingue un fallo de red de un error del servidor (si hubo
`response`, el servidor contestó: no es problema de red).

### Indicador
`<CatalogoStatus />`, montado una vez en `App`, sirve para web y móvil:

```text
ONLINE · OFFLINE · SINCRONIZANDO · ACTUALIZADO · ERROR DE SINCRONIZACIÓN
```

Se oculta solo cuando todo está normal; al tocarlo muestra versión de catálogo,
versión de aplicación, última sincronización y los botones **Sincronizar ahora**
y **Reconstruir catálogo**.

### Sin polling
La sincronización se dispara por:
```text
· arranque de la PWA
· evento WebSocket catalogo_update del propio negocio
· recuperación de conexión (evento 'online')
· reactivación de la pestaña, con mínimo 5 minutos entre chequeos
· acción explícita del usuario
```
No hay ningún intervalo consultando categorías, productos ni moderadores.

### APP VERSION ≠ CATALOG VERSION
```text
App:     v2.5.B13   ← Service Worker, banner de UpdateNotification
Catalog: v154       ← IndexedDB, /api/catalogo/sync
```
Ciclos de vida independientes. `skipWaiting: false` y `cleanupOutdatedCaches: true`
siguen vigentes: una versión vieja del JavaScript no queda pegada indefinidamente.

---

## I. Pruebas

### Estado real de la ejecución

- `npm run build` (frontend) — **ejecutado, pasa**.
- `npm run build` (backend, `tsc`) — **ejecutado, pasa**.
- `npx tsc -b` / `npx tsc --noEmit` — **ejecutados, sin errores**.
- `npx eslint` sobre los archivos nuevos y modificados — **ejecutado, sin errores**
  (quedan errores preexistentes en `PageVentas.tsx` y `PageVentasMobile.tsx`, en
  líneas no tocadas por este trabajo).
- **`npm test` NO existe** en ninguno de los dos `package.json`: el proyecto no
  tiene framework de pruebas. No se ejecutó.
- `npm run test:catalogo-sync` — **NO ejecutado**. El `.env` del backend apunta a
  la base de producción en Azure (`bdcdttx`); requiere autorización explícita.

### Verificación disponible

```bash
cd backend
npm run db:catalogo-sync      # 1) aplicar la migración
npm run test:catalogo-sync    # 2) verificar
```

`testCatalogoSync.ts` no es destructivo sobre los catálogos: sólo escribe en las
tablas de versionado/bitácora, usa el id sintético `-99999` y lo borra al
terminar. Comprueba:

```text
Esquema          existencia de ambas tablas

Versionado       la versión aumenta cuando corresponde
                 la versión NO cambia cuando no hay cambios
                 la versión persistida coincide con la emitida

Sincronización   cliente al día          → incremental sin cambios
                 cliente atrasado 1      → incremental
                 cliente atrasado varias → incremental
                 cliente sin versión     → reconstrucción completa
                 versión adelantada      → reconstrucción completa

Multi-negocio    el catálogo de A sólo contiene registros de A
                 un cambio en B no altera la versión de A
                 A no recibe los cambios de B
                 los catálogos de A y B no comparten productos
```

### Verificación manual pendiente (requiere navegador)

```text
Offline      DevTools → Network → Offline → recargar el POS
             El catálogo debe seguir visible y el chip marcar OFFLINE

API caída    detener el backend con la red activa
             Debe marcar OFFLINE, no ERROR, y seguir operando

Restaurar    reactivar la red → sincronización automática al volver 'online'

Concurrencia abrir dos pestañas del mismo negocio; cambiar un precio en una
             La otra debe recibir catalogo_update y actualizarse sin recargar

Aislamiento  iniciar sesión con negocio A, cerrar sesión, entrar con negocio B
             IndexedDB no debe conservar registros de A
```

---

## J. Impacto en rendimiento

**Antes** — cada montaje de pantalla de venta:
```text
GET /api/productos-web   → 3 JOINs + TO_BASE64 de todas las imágenes
GET /api/categorias
GET /api/moderadores
GET /api/cat-moderadores
GET /api/descuentos      (al abrir pagos)
```
Con recarga de página se perdía la caché en memoria y se repetía todo.

**Después** — arranque en caliente con catálogo sin cambios:
```text
GET /api/catalogo/version   → 1 SELECT por PK, respuesta de ~100 bytes
(lo demás sale de IndexedDB)
```
Con cambios: una sola petición `/sync` que trae **sólo los registros afectados**.

Reducción esperada: de 5 peticiones con carga útil pesada (imágenes Base64) a
1 petición trivial por sesión, y de ~10 consultas MySQL con JOINs a 1 SELECT por
clave primaria. La medición real en producción queda pendiente de ejecutar sobre
datos reales.

---

## K. Despliegue

No se introdujo ninguna URL fija ni `localhost`. Se conservan los mecanismos
existentes:

```text
Frontend   VITE_API_URL (y ruta relativa /api si no está definida)
           La URL del WebSocket se sigue derivando de VITE_API_URL
Backend    /etc/secrets/.env en producción, .env del proyecto en desarrollo
```

Funciona igual en local (proxy `/api` y `/ws` de Vite) y en producción (Render).

### Orden de despliegue

1. Aplicar la migración: `npm run db:catalogo-sync`.
2. Desplegar el Backend.
3. Desplegar el Frontend.

Si el Frontend se despliega antes que el Backend, `/api/catalogo/version`
devuelve 404: el cliente lo trata como error de sincronización y cae al respaldo
HTTP de siempre. No se pierde funcionalidad, pero conviene respetar el orden.

---

## L. Asuntos abiertos

1. **~~IDOR en los CRUD de catálogo~~ — CORREGIDO.** Las operaciones por id
   localizaban el registro sólo por su PK, sin verificar que perteneciera al
   negocio del usuario. Ahora todas filtran también por `idnegocio` del JWT:

   | Controlador | Lectura por id | Actualizar | Eliminar | Otros |
   |---|---|---|---|---|
   | categorías | ✔ | ✔ | ✔ (lógico) | |
   | productos web | ✔ | ✔ | ✔ (lógico) | validación de nombre duplicado |
   | moderadores | ✔ | ✔ | ✔ (**físico**) | |
   | cat. moderadores | ✔ | ✔ | ✔ (lógico) | |
   | descuentos | ✔ | ✔ | ✔ (**físico**) | cambiar estatus |

   Un id de otro negocio responde **404**, igual que uno inexistente, para no
   revelar que el registro existe. Antes de aplicarlo se verificó que ningún
   flujo dependiera del acceso entre negocios: cada usuario —incluido el
   superusuario— pertenece a un único `idNegocio`, `checkNegocio` no está
   conectado a ninguna ruta, y todos los listados ya filtraban por negocio.
   Guardar un registro sin cambios no produce un 404 falso: mysql2 activa
   `FOUND_ROWS` por defecto, así que `affectedRows` cuenta filas encontradas.

   Además, `actualizarProductoWeb` validaba el nombre duplicado contra el negocio
   *del producto* en vez del negocio *del usuario*; ahora usa el del usuario.

2. **Purga de la bitácora.** `tblposcrumenwebcatalogocambios` crece sin límite.
   No hace daño (un rango sin cobertura degrada a reconstrucción completa, que es
   correcta), pero conviene un borrado periódico de filas con más de 30–90 días.
   El índice `idx_catalogocambios_fecha` ya está puesto para eso.

3. **Imágenes en Base64.** `productos` sigue transportando las imágenes dentro
   del JSON. Ahora se descargan una sola vez en lugar de en cada navegación, pero
   moverlas a URLs servidas por el Service Worker reduciría bastante más el peso.

4. **Autenticación del WebSocket.** El canal sigue siendo un broadcast sin
   autenticar, como ya era. `catalogo_update` no expone datos, así que no agrega
   riesgo, pero autenticar el socket y segmentar por negocio sería una mejora
   general.
