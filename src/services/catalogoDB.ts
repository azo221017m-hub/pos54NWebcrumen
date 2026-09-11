/**
 * Capa de persistencia local del catálogo (IndexedDB).
 *
 * Base de datos: `posweb54n`
 * Stores:        categorias, productos, moderadores, catModeradores, descuentos, catalogMetadata
 *
 * AISLAMIENTO MULTI-NEGOCIO
 * Cada registro se guarda con clave compuesta [_negocio, <pk>]. Todas las lecturas
 * usan el índice `porNegocio`, de modo que un negocio jamás lee registros de otro
 * aunque compartan dispositivo. Al cambiar de negocio (login distinto) se purga
 * la copia local; ver `purgarOtrosNegocios` y `limpiarCatalogoLocal`.
 *
 * NO se almacena aquí ningún dato sensible: ni tokens, ni contraseñas, ni
 * credenciales. Sólo catálogo operativo (categorías, platillos, modificadores,
 * precios y descuentos) del negocio autenticado.
 *
 * Se usa la API nativa de IndexedDB en vez de añadir una dependencia (idb/dexie):
 * el modelo es pequeño y no justifica una librería extra.
 */

export const DB_NOMBRE = 'posweb54n';
export const DB_VERSION = 1;

export const STORE_METADATA = 'catalogMetadata';

/** Colecciones de catálogo y la PK de cada una (debe coincidir con el Backend). */
export const COLECCIONES = {
  categorias: 'idCategoria',
  productos: 'idProducto',
  moderadores: 'idmoderador',
  catModeradores: 'idmodref',
  descuentos: 'id_descuento'
} as const;

export type NombreColeccion = keyof typeof COLECCIONES;

export const NOMBRES_COLECCIONES = Object.keys(COLECCIONES) as NombreColeccion[];

/** Campo inyectado en cada registro para el aislamiento por negocio. */
const CAMPO_NEGOCIO = '_negocio';
const INDICE_NEGOCIO = 'porNegocio';

export interface CatalogoMetadata {
  /** Clave del registro de metadatos: el idnegocio */
  idnegocio: number;
  /** Versión del catálogo replicada localmente */
  catalogVersion: number;
  /** ISO de la última sincronización exitosa */
  lastSync: string | null;
  /** Conteo por colección, útil para diagnóstico */
  conteos?: Partial<Record<NombreColeccion, number>>;
}

type RegistroCatalogo = Record<string, unknown>;

let dbPromise: Promise<IDBDatabase> | null = null;

/** ¿El navegador soporta IndexedDB? (modo privado de algunos navegadores lo bloquea) */
export const soportaIndexedDB = (): boolean =>
  typeof indexedDB !== 'undefined' && indexedDB !== null;

/** Abre (y crea/migra si hace falta) la base de datos local. */
export const abrirDB = (): Promise<IDBDatabase> => {
  if (!soportaIndexedDB()) {
    return Promise.reject(new Error('IndexedDB no está disponible en este navegador'));
  }

  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NOMBRE, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;

        for (const coleccion of NOMBRES_COLECCIONES) {
          if (!db.objectStoreNames.contains(coleccion)) {
            const store = db.createObjectStore(coleccion, {
              keyPath: [CAMPO_NEGOCIO, COLECCIONES[coleccion]]
            });
            store.createIndex(INDICE_NEGOCIO, CAMPO_NEGOCIO, { unique: false });
          }
        }

        if (!db.objectStoreNames.contains(STORE_METADATA)) {
          db.createObjectStore(STORE_METADATA, { keyPath: 'idnegocio' });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        // Si otra pestaña solicita una versión superior, cerramos para no bloquearla
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };

      request.onerror = () => reject(request.error ?? new Error('No se pudo abrir IndexedDB'));
      request.onblocked = () =>
        reject(new Error('IndexedDB bloqueada por otra pestaña con versión anterior'));
    }).catch((error) => {
      // No dejar cacheada una promesa rechazada: el siguiente intento debe reintentar
      dbPromise = null;
      throw error;
    });
  }

  return dbPromise;
};

/** Convierte una IDBRequest en promesa. */
const promesaDe = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

/** Espera a que una transacción complete (o falle) de verdad. */
const esperarTransaccion = (tx: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error('Transacción de IndexedDB abortada'));
  });

/** Devuelve el registro sin el campo interno de partición por negocio. */
const sinCampoNegocio = <T>(registro: RegistroCatalogo): T => {
  const copia = { ...registro };
  delete copia[CAMPO_NEGOCIO];
  return copia as T;
};

// ─────────────────────────────────────────────────────────────────────────────
// Lectura
// ─────────────────────────────────────────────────────────────────────────────

/** Lee una colección completa del negocio indicado. */
export const leerColeccion = async <T>(
  coleccion: NombreColeccion,
  idnegocio: number
): Promise<T[]> => {
  const db = await abrirDB();
  const tx = db.transaction(coleccion, 'readonly');
  const indice = tx.objectStore(coleccion).index(INDICE_NEGOCIO);
  const registros = await promesaDe<RegistroCatalogo[]>(
    indice.getAll(idnegocio) as IDBRequest<RegistroCatalogo[]>
  );
  return registros.map((registro) => sinCampoNegocio<T>(registro));
};

/** Lee los metadatos locales del catálogo de un negocio. */
export const leerMetadata = async (idnegocio: number): Promise<CatalogoMetadata | null> => {
  const db = await abrirDB();
  const tx = db.transaction(STORE_METADATA, 'readonly');
  const resultado = await promesaDe<CatalogoMetadata | undefined>(
    tx.objectStore(STORE_METADATA).get(idnegocio) as IDBRequest<CatalogoMetadata | undefined>
  );
  return resultado ?? null;
};

/** Versión del catálogo replicada localmente (0 si aún no hay copia). */
export const leerVersionLocal = async (idnegocio: number): Promise<number> => {
  try {
    const metadata = await leerMetadata(idnegocio);
    return metadata?.catalogVersion ?? 0;
  } catch {
    return 0;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Escritura atómica
// ─────────────────────────────────────────────────────────────────────────────

export interface CambiosColeccion {
  upserted?: RegistroCatalogo[];
  deleted?: number[];
}

/**
 * Aplica un snapshot COMPLETO: reemplaza todas las colecciones del negocio y
 * fija la nueva versión, todo en UNA sola transacción de IndexedDB.
 *
 * ATOMICIDAD: si cualquier paso falla, la transacción se aborta y ni los datos
 * ni la versión local avanzan. Nunca queda un catálogo a medias.
 */
export const aplicarSnapshotCompleto = async (
  idnegocio: number,
  snapshot: Partial<Record<NombreColeccion, RegistroCatalogo[]>>,
  nuevaVersion: number
): Promise<void> => {
  const db = await abrirDB();
  const tx = db.transaction([...NOMBRES_COLECCIONES, STORE_METADATA], 'readwrite');
  const conteos: Partial<Record<NombreColeccion, number>> = {};

  // Primero se resuelven TODAS las claves a borrar (un request por colección) y
  // después se encolan borrados y altas. El orden importa: IndexedDB ejecuta las
  // peticiones en el orden en que se encolan, así que los delete deben quedar
  // encolados antes que los put para no eliminar lo que se acaba de escribir.
  const clavesPorColeccion = await Promise.all(
    NOMBRES_COLECCIONES.map((coleccion) =>
      promesaDe<IDBValidKey[]>(
        tx.objectStore(coleccion).index(INDICE_NEGOCIO).getAllKeys(idnegocio)
      )
    )
  );

  NOMBRES_COLECCIONES.forEach((coleccion, i) => {
    const store = tx.objectStore(coleccion);
    const pk = COLECCIONES[coleccion];
    const filas = snapshot[coleccion] ?? [];

    // Borrar sólo los registros de ESTE negocio; los de otros no se tocan.
    for (const clave of clavesPorColeccion[i]) {
      store.delete(clave);
    }

    for (const fila of filas) {
      if (fila[pk] === undefined || fila[pk] === null) continue;
      store.put({ ...fila, [CAMPO_NEGOCIO]: idnegocio });
    }

    conteos[coleccion] = filas.length;
  });

  const metadata: CatalogoMetadata = {
    idnegocio,
    catalogVersion: nuevaVersion,
    lastSync: new Date().toISOString(),
    conteos
  };
  tx.objectStore(STORE_METADATA).put(metadata);

  await esperarTransaccion(tx);
};

/**
 * Aplica cambios INCREMENTALES (altas/cambios/bajas) y fija la nueva versión,
 * todo en UNA sola transacción de IndexedDB.
 *
 * La versión local sólo avanza si la transacción completa con éxito; si falla,
 * queda en la versión anterior y el siguiente intento vuelve a pedir el mismo delta.
 */
export const aplicarCambiosIncrementales = async (
  idnegocio: number,
  cambios: Partial<Record<NombreColeccion, CambiosColeccion>>,
  nuevaVersion: number
): Promise<void> => {
  const db = await abrirDB();
  const tx = db.transaction([...NOMBRES_COLECCIONES, STORE_METADATA], 'readwrite');

  for (const coleccion of NOMBRES_COLECCIONES) {
    const delta = cambios[coleccion];
    if (!delta) continue;

    const store = tx.objectStore(coleccion);
    const pk = COLECCIONES[coleccion];

    for (const id of delta.deleted ?? []) {
      store.delete([idnegocio, id]);
    }

    for (const fila of delta.upserted ?? []) {
      if (fila[pk] === undefined || fila[pk] === null) continue;
      store.put({ ...fila, [CAMPO_NEGOCIO]: idnegocio });
    }
  }

  const metadataStore = tx.objectStore(STORE_METADATA);
  const actual = await promesaDe<CatalogoMetadata | undefined>(
    metadataStore.get(idnegocio) as IDBRequest<CatalogoMetadata | undefined>
  );

  metadataStore.put({
    idnegocio,
    catalogVersion: nuevaVersion,
    lastSync: new Date().toISOString(),
    conteos: actual?.conteos
  } satisfies CatalogoMetadata);

  await esperarTransaccion(tx);
};

/** Actualiza sólo `lastSync` (cuando el servidor confirma que ya estamos al día). */
export const marcarSincronizado = async (
  idnegocio: number,
  version: number
): Promise<void> => {
  const db = await abrirDB();
  const tx = db.transaction(STORE_METADATA, 'readwrite');
  const store = tx.objectStore(STORE_METADATA);
  const actual = await promesaDe<CatalogoMetadata | undefined>(
    store.get(idnegocio) as IDBRequest<CatalogoMetadata | undefined>
  );

  store.put({
    idnegocio,
    catalogVersion: version,
    lastSync: new Date().toISOString(),
    conteos: actual?.conteos
  } satisfies CatalogoMetadata);

  await esperarTransaccion(tx);
};

// ─────────────────────────────────────────────────────────────────────────────
// Limpieza
// ─────────────────────────────────────────────────────────────────────────────

/** Borra la copia local del catálogo de un negocio (o de todos si se omite). */
export const limpiarCatalogoLocal = async (idnegocio?: number): Promise<void> => {
  if (!soportaIndexedDB()) return;

  const db = await abrirDB();
  const tx = db.transaction([...NOMBRES_COLECCIONES, STORE_METADATA], 'readwrite');

  if (idnegocio === undefined) {
    for (const coleccion of NOMBRES_COLECCIONES) {
      tx.objectStore(coleccion).clear();
    }
    tx.objectStore(STORE_METADATA).clear();
  } else {
    const clavesPorColeccion = await Promise.all(
      NOMBRES_COLECCIONES.map((coleccion) =>
        promesaDe<IDBValidKey[]>(
          tx.objectStore(coleccion).index(INDICE_NEGOCIO).getAllKeys(idnegocio)
        )
      )
    );

    NOMBRES_COLECCIONES.forEach((coleccion, i) => {
      const store = tx.objectStore(coleccion);
      for (const clave of clavesPorColeccion[i]) {
        store.delete(clave);
      }
    });

    tx.objectStore(STORE_METADATA).delete(idnegocio);
  }

  await esperarTransaccion(tx);
};

/**
 * Elimina del dispositivo el catálogo de cualquier negocio distinto al activo.
 * Se ejecuta antes de sincronizar, para que un dispositivo compartido nunca
 * conserve datos de un negocio al que ya no pertenece la sesión.
 */
export const purgarOtrosNegocios = async (idnegocioActivo: number): Promise<void> => {
  if (!soportaIndexedDB()) return;

  const db = await abrirDB();
  const metadatos = await (async () => {
    const tx = db.transaction(STORE_METADATA, 'readonly');
    return promesaDe<CatalogoMetadata[]>(
      tx.objectStore(STORE_METADATA).getAll() as IDBRequest<CatalogoMetadata[]>
    );
  })();

  const ajenos = metadatos
    .map((m) => Number(m.idnegocio))
    .filter((id) => Number.isFinite(id) && id !== idnegocioActivo);

  for (const id of ajenos) {
    await limpiarCatalogoLocal(id);
  }
};

/** Destruye por completo la base local (recuperación ante corrupción). */
export const destruirDB = async (): Promise<void> => {
  if (!soportaIndexedDB()) return;

  try {
    const db = await abrirDB();
    db.close();
  } catch {
    /* si no abre, igual intentamos borrarla */
  }

  dbPromise = null;

  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(DB_NOMBRE);
    request.onsuccess = () => resolve();
    // No propagamos el fallo: es una operación de último recurso
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
};
