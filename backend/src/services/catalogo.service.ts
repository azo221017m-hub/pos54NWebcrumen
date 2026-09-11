import { pool } from '../config/db';
import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { websocketService } from './websocket.service';

/**
 * Servicio de catálogo: versionado por negocio, bitácora de cambios y
 * consultas canónicas usadas por la sincronización incremental de la PWA.
 *
 * Aislamiento multi-negocio: TODAS las consultas filtran por idnegocio.
 * El idnegocio proviene siempre del JWT (req.user.idNegocio), nunca del cliente.
 */

export type EntidadCatalogo =
  | 'producto'
  | 'categoria'
  | 'moderador'
  | 'catmoderador'
  | 'descuento';

export type AccionCatalogo = 'CREATE' | 'UPDATE' | 'DELETE';

export const ENTIDADES_CATALOGO: EntidadCatalogo[] = [
  'categoria',
  'producto',
  'moderador',
  'catmoderador',
  'descuento'
];

// Si el cliente está más atrasado que esto (o su versión ya no está cubierta por
// la bitácora), se responde con una reconstrucción completa en vez de incremental.
const MAX_CAMBIOS_INCREMENTAL = 200;

// Mapa entidad -> nombre de la colección expuesta al cliente (y store de IndexedDB)
export const COLECCION_POR_ENTIDAD: Record<EntidadCatalogo, string> = {
  categoria: 'categorias',
  producto: 'productos',
  moderador: 'moderadores',
  catmoderador: 'catModeradores',
  descuento: 'descuentos'
};

// ─────────────────────────────────────────────────────────────────────────────
// Versionado
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Devuelve la versión actual del catálogo de un negocio.
 * Si el negocio aún no tiene fila de versión, devuelve 0 (el cliente hará full sync).
 */
export const obtenerVersionCatalogo = async (idnegocio: number): Promise<number> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT version FROM tblposcrumenwebcatalogoversion WHERE idnegocio = ?',
    [idnegocio]
  );
  return rows.length > 0 ? Number(rows[0].version) : 0;
};

/**
 * Incrementa la versión del catálogo del negocio y registra el/los cambios en la
 * bitácora, todo dentro de una misma transacción para que versión y cambios nunca
 * queden desincronizados. Devuelve la nueva versión.
 *
 * Se usa SELECT ... FOR UPDATE para serializar bumps concurrentes (varias cajas
 * editando a la vez) y evitar que dos cambios reciban el mismo número de versión.
 */
const incrementarVersion = async (
  connection: PoolConnection,
  idnegocio: number
): Promise<number> => {
  // Garantizar que exista la fila del negocio sin sobrescribir su versión actual
  await connection.query(
    `INSERT INTO tblposcrumenwebcatalogoversion (idnegocio, version) VALUES (?, 0)
     ON DUPLICATE KEY UPDATE idnegocio = tblposcrumenwebcatalogoversion.idnegocio`,
    [idnegocio]
  );

  const [rows] = await connection.query<RowDataPacket[]>(
    'SELECT version FROM tblposcrumenwebcatalogoversion WHERE idnegocio = ? FOR UPDATE',
    [idnegocio]
  );

  const nuevaVersion = Number(rows[0]?.version ?? 0) + 1;

  await connection.query(
    'UPDATE tblposcrumenwebcatalogoversion SET version = ? WHERE idnegocio = ?',
    [nuevaVersion, idnegocio]
  );

  return nuevaVersion;
};

export interface CambioCatalogo {
  entidad: EntidadCatalogo;
  identidad: number;
  accion: AccionCatalogo;
}

/**
 * Registra uno o varios cambios de catálogo: sube la versión del negocio, escribe
 * la bitácora y emite el evento CATALOG_UPDATED por WebSocket.
 *
 * IMPORTANTE: nunca lanza. Un fallo aquí NO debe tumbar el CRUD que la invocó;
 * se registra en log y, en el peor caso, el cliente se entera en el siguiente
 * arranque/reconexión (o vía reconstrucción manual).
 */
export const registrarCambioCatalogo = async (
  idnegocio: number | undefined | null,
  cambios: CambioCatalogo | CambioCatalogo[]
): Promise<number | null> => {
  if (!idnegocio) {
    console.warn('[CatalogoEvent] cambio ignorado: idnegocio no definido');
    return null;
  }

  const lista = Array.isArray(cambios) ? cambios : [cambios];
  if (lista.length === 0) return null;

  let connection: PoolConnection | null = null;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const nuevaVersion = await incrementarVersion(connection, idnegocio);

    for (const cambio of lista) {
      await connection.query(
        `INSERT INTO tblposcrumenwebcatalogocambios
           (idnegocio, version, entidad, identidad, accion)
         VALUES (?, ?, ?, ?, ?)`,
        [idnegocio, nuevaVersion, cambio.entidad, cambio.identidad, cambio.accion]
      );
    }

    await connection.commit();

    const resumen = lista.map((c) => `${c.entidad}:${c.identidad}:${c.accion}`).join(',');
    console.log(
      `[CatalogoVersion] business=${idnegocio} version=${nuevaVersion} cambios=${lista.length} [${resumen}]`
    );

    // Evento ligero: sólo avisa "hay una versión nueva", nunca lleva el catálogo.
    websocketService.notifyCatalogoUpdate(idnegocio, nuevaVersion, lista);

    return nuevaVersion;
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {
        /* rollback best-effort */
      }
    }
    console.error(
      `[CatalogoEvent] error al registrar cambio (business=${idnegocio}):`,
      error instanceof Error ? error.message : error
    );
    return null;
  } finally {
    if (connection) connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Consultas canónicas del catálogo
//
// Las columnas replican exactamente las que ya devuelven los endpoints existentes
// (/api/categorias, /api/productos-web, /api/moderadores, /api/cat-moderadores,
// /api/descuentos) para que el cliente pueda usar los mismos tipos de TypeScript
// sin transformaciones adicionales.
// ─────────────────────────────────────────────────────────────────────────────

interface ConsultaEntidad {
  /** Columna PK, usada para filtrar por ids concretos en la sync incremental */
  pk: string;
  /** SELECT ... FROM ... WHERE <filtro de negocio> (sin ORDER BY) */
  sql: (filtroIds: boolean) => string;
}

const CONSULTAS: Record<EntidadCatalogo, ConsultaEntidad> = {
  categoria: {
    pk: 'idCategoria',
    sql: (filtroIds) => `
      SELECT
        idCategoria,
        nombre,
        CAST(imagencategoria AS CHAR) as imagencategoria,
        descripcion,
        estatus,
        fechaRegistroauditoria,
        usuarioauditoria,
        fechamodificacionauditoria,
        idnegocio,
        idmoderadordef,
        orden
      FROM tblposcrumenwebcategorias
      WHERE idnegocio = ?${filtroIds ? ' AND idCategoria IN (?)' : ''}
      ORDER BY orden ASC, nombre ASC`
  },

  producto: {
    pk: 'idProducto',
    sql: (filtroIds) => `
      SELECT
        p.idProducto,
        p.idCategoria,
        c.nombre AS nombreCategoria,
        p.idreferencia,
        p.nombre,
        p.descripcion,
        p.precio,
        p.estatus,
        TO_BASE64(p.imagenProducto) AS imagenProducto,
        p.tipoproducto,
        p.costoproducto,
        p.fechaRegistroauditoria,
        p.usuarioauditoria,
        p.fehamodificacionauditoria,
        p.idnegocio,
        p.menudia,
        CASE WHEN p.tipoproducto = 'Receta' THEN r.nombreReceta ELSE NULL END AS nombreReceta,
        CASE WHEN p.tipoproducto = 'Receta' THEN r.costoReceta ELSE NULL END AS costoReceta,
        CASE WHEN p.tipoproducto = 'Inventario' THEN i.nombre ELSE NULL END AS nombreInsumo,
        CASE WHEN p.tipoproducto = 'Inventario' THEN i.costo_promedio_ponderado ELSE NULL END AS costoInsumo
      FROM tblposcrumenwebproductos p
      LEFT JOIN tblposcrumenwebcategorias c ON p.idCategoria = c.idCategoria
      LEFT JOIN tblposcrumenwebrecetas r ON p.tipoproducto = 'Receta' AND p.idreferencia = r.idReceta
      LEFT JOIN tblposcrumenwebinsumos i ON p.tipoproducto = 'Inventario' AND p.idreferencia = i.id_insumo
      WHERE p.idnegocio = ?${filtroIds ? ' AND p.idProducto IN (?)' : ''}
      ORDER BY p.nombre ASC`
  },

  moderador: {
    pk: 'idmoderador',
    sql: (filtroIds) => `
      SELECT
        idmoderador,
        nombremoderador,
        fechaRegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio,
        estatus
      FROM tblposcrumenwebmoderadores
      WHERE idnegocio = ?${filtroIds ? ' AND idmoderador IN (?)' : ''}
      ORDER BY nombremoderador ASC`
  },

  catmoderador: {
    pk: 'idmodref',
    sql: (filtroIds) => `
      SELECT
        idmodref,
        nombremodref,
        fechaRegistroauditoria,
        usuarioauditoria,
        fehamodificacionauditoria,
        idnegocio,
        estatus,
        moderadores
      FROM tblposcrumenwebmodref
      WHERE idnegocio = ?${filtroIds ? ' AND idmodref IN (?)' : ''}
      ORDER BY nombremodref ASC`
  },

  descuento: {
    pk: 'id_descuento',
    sql: (filtroIds) => `
      SELECT
        id_descuento,
        nombre,
        tipodescuento,
        valor,
        estatusdescuento,
        requiereautorizacion,
        idnegocio
      FROM tblposcrumenwebdescuentos
      WHERE idnegocio = ?${filtroIds ? ' AND id_descuento IN (?)' : ''}
      ORDER BY nombre ASC`
  }
};

export const obtenerPkEntidad = (entidad: EntidadCatalogo): string => CONSULTAS[entidad].pk;

/**
 * Obtiene filas de una entidad del catálogo de un negocio.
 * Si `ids` se proporciona, sólo devuelve esos registros (sync incremental).
 */
export const obtenerFilasCatalogo = async (
  entidad: EntidadCatalogo,
  idnegocio: number,
  ids?: number[]
): Promise<RowDataPacket[]> => {
  const consulta = CONSULTAS[entidad];

  if (ids && ids.length === 0) return [];

  const usarFiltro = Array.isArray(ids) && ids.length > 0;
  const params: unknown[] = usarFiltro ? [idnegocio, ids] : [idnegocio];

  // pool.query (no execute) expande el array de ids en la cláusula IN (?)
  const [rows] = await pool.query<RowDataPacket[]>(consulta.sql(usarFiltro), params);
  return rows;
};

// ─────────────────────────────────────────────────────────────────────────────
// Snapshot completo e incremental
// ─────────────────────────────────────────────────────────────────────────────

export type SnapshotCatalogo = Record<string, RowDataPacket[]>;

/** Descarga completa del catálogo de un negocio (arranque en frío o reconstrucción). */
export const obtenerSnapshotCompleto = async (idnegocio: number): Promise<SnapshotCatalogo> => {
  const resultados = await Promise.all(
    ENTIDADES_CATALOGO.map(async (entidad) => {
      const filas = await obtenerFilasCatalogo(entidad, idnegocio);
      return [COLECCION_POR_ENTIDAD[entidad], filas] as const;
    })
  );

  return Object.fromEntries(resultados) as SnapshotCatalogo;
};

export interface CambiosPorColeccion {
  /** Filas creadas o actualizadas, listas para escribir en IndexedDB */
  upserted: RowDataPacket[];
  /** PKs de registros borrados físicamente que deben eliminarse del cliente */
  deleted: number[];
}

export interface ResultadoSync {
  mode: 'incremental' | 'full';
  fromVersion: number;
  currentVersion: number;
  /** Presente sólo en modo incremental */
  changes?: Record<string, CambiosPorColeccion>;
  /** Presente sólo en modo full */
  snapshot?: SnapshotCatalogo;
  /** Motivo de haber elegido reconstrucción completa (diagnóstico) */
  reason?: string;
}

/**
 * Calcula lo que un cliente en `since` necesita para llegar a la versión actual.
 *
 * Devuelve modo 'full' cuando:
 *   - el cliente no envía versión o envía 0 (arranque en frío);
 *   - la versión del cliente es mayor que la del servidor (dato local corrupto/
 *     restaurado de otro entorno);
 *   - la bitácora ya no cubre el rango solicitado (fue purgada);
 *   - el volumen de cambios supera MAX_CAMBIOS_INCREMENTAL (sale más barato
 *     reconstruir que aplicar miles de deltas).
 */
export const calcularSync = async (
  idnegocio: number,
  since: number
): Promise<ResultadoSync> => {
  const currentVersion = await obtenerVersionCatalogo(idnegocio);

  const full = async (reason: string): Promise<ResultadoSync> => ({
    mode: 'full',
    fromVersion: since,
    currentVersion,
    snapshot: await obtenerSnapshotCompleto(idnegocio),
    reason
  });

  if (!since || since <= 0) return full('sin-version-local');
  if (since > currentVersion) return full('version-local-adelantada');

  // Ya está al día: respuesta mínima, sin tocar las tablas de catálogo.
  if (since === currentVersion) {
    return { mode: 'incremental', fromVersion: since, currentVersion, changes: {} };
  }

  const [cambios] = await pool.query<RowDataPacket[]>(
    `SELECT entidad, identidad, accion
     FROM tblposcrumenwebcatalogocambios
     WHERE idnegocio = ? AND version > ? AND version <= ?
     ORDER BY version ASC, idcambio ASC`,
    [idnegocio, since, currentVersion]
  );

  if (cambios.length === 0) {
    // Hay salto de versión pero no hay bitácora que lo explique: purgada o
    // inconsistente. Reconstruir es la única respuesta segura.
    return full('bitacora-incompleta');
  }

  if (cambios.length > MAX_CAMBIOS_INCREMENTAL) {
    return full('demasiados-cambios');
  }

  // Consolidar: el último estado de cada (entidad, id) es el que importa.
  const estadoFinal = new Map<string, { entidad: EntidadCatalogo; id: number; accion: AccionCatalogo }>();
  for (const cambio of cambios) {
    const entidad = String(cambio.entidad) as EntidadCatalogo;
    if (!ENTIDADES_CATALOGO.includes(entidad)) continue;
    const id = Number(cambio.identidad);
    estadoFinal.set(`${entidad}:${id}`, {
      entidad,
      id,
      accion: String(cambio.accion) as AccionCatalogo
    });
  }

  const changes: Record<string, CambiosPorColeccion> = {};

  for (const entidad of ENTIDADES_CATALOGO) {
    const pendientes = [...estadoFinal.values()].filter((c) => c.entidad === entidad);
    if (pendientes.length === 0) continue;

    const idsBorrados = pendientes.filter((c) => c.accion === 'DELETE').map((c) => c.id);
    const idsVigentes = pendientes.filter((c) => c.accion !== 'DELETE').map((c) => c.id);

    // Se vuelven a leer las filas vigentes desde MySQL (fuente de verdad), en vez
    // de confiar en lo que decía la bitácora al momento del cambio.
    const upserted = idsVigentes.length > 0
      ? await obtenerFilasCatalogo(entidad, idnegocio, idsVigentes)
      : [];

    // Un id marcado como vigente que ya no aparece en la consulta (p. ej. borrado
    // físico posterior no registrado) también debe eliminarse del cliente.
    const pk = CONSULTAS[entidad].pk;
    const encontrados = new Set(upserted.map((fila) => Number(fila[pk])));
    const faltantes = idsVigentes.filter((id) => !encontrados.has(id));

    changes[COLECCION_POR_ENTIDAD[entidad]] = {
      upserted,
      deleted: [...idsBorrados, ...faltantes]
    };
  }

  return { mode: 'incremental', fromVersion: since, currentVersion, changes };
};

/**
 * Fuerza la reconstrucción completa del catálogo en todos los dispositivos del negocio.
 *
 * Purga la bitácora y sube la versión: cualquier cliente que pida /sync?since=<anterior>
 * ya no encontrará cambios que expliquen el salto y recibirá modo 'full'. Es la vía de
 * recuperación ante corrupción o inconsistencia de la copia local.
 */
export const forzarReconstruccion = async (idnegocio: number): Promise<number | null> => {
  let connection: PoolConnection | null = null;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const nuevaVersion = await incrementarVersion(connection, idnegocio);

    await connection.query(
      'DELETE FROM tblposcrumenwebcatalogocambios WHERE idnegocio = ?',
      [idnegocio]
    );

    await connection.commit();

    console.log(`[CatalogoSync] rebuild business=${idnegocio} nuevaVersion=${nuevaVersion}`);
    websocketService.notifyCatalogoUpdate(idnegocio, nuevaVersion, []);

    return nuevaVersion;
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {
        /* rollback best-effort */
      }
    }
    console.error(
      `[CatalogoSync] error al forzar reconstruccion (business=${idnegocio}):`,
      error instanceof Error ? error.message : error
    );
    return null;
  } finally {
    if (connection) connection.release();
  }
};
