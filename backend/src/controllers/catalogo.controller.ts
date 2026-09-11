import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth';
import {
  obtenerVersionCatalogo,
  obtenerSnapshotCompleto,
  calcularSync,
  forzarReconstruccion
} from '../services/catalogo.service';

/**
 * Endpoints de sincronización de catálogo para la PWA.
 *
 * SEGURIDAD: el negocio SIEMPRE se toma de req.user.idNegocio (JWT verificado en
 * authMiddleware). No se acepta idnegocio por query/body, de modo que un cliente
 * no puede pedir el catálogo de otro negocio aunque lo intente.
 */

const resolverNegocio = (req: AuthRequest, res: Response): number | null => {
  const idnegocio = req.user?.idNegocio;

  if (!idnegocio) {
    res.status(401).json({
      success: false,
      message: 'Usuario no autenticado o sin negocio asignado'
    });
    return null;
  }

  return idnegocio;
};

/**
 * GET /api/catalogo/version
 * Respuesta mínima que el cliente usa para decidir si necesita sincronizar.
 * No consulta ninguna tabla de catálogo.
 */
export const obtenerVersion = async (req: AuthRequest, res: Response): Promise<void> => {
  const idnegocio = resolverNegocio(req, res);
  if (!idnegocio) return;

  try {
    const version = await obtenerVersionCatalogo(idnegocio);

    res.status(200).json({
      success: true,
      idnegocio,
      catalogVersion: version,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('[CatalogoVersion] error:', error instanceof Error ? error.message : error);
    res.status(500).json({ success: false, message: 'Error al obtener la versión del catálogo' });
  }
};

/**
 * GET /api/catalogo/sync?since={version}
 * Devuelve el delta entre la versión del cliente y la actual, o un snapshot
 * completo cuando el incremental no es viable/conveniente.
 */
export const sincronizar = async (req: AuthRequest, res: Response): Promise<void> => {
  const idnegocio = resolverNegocio(req, res);
  if (!idnegocio) return;

  const sinceRaw = req.query.since;
  const since = Number.parseInt(String(sinceRaw ?? '0'), 10);

  if (Number.isNaN(since) || since < 0) {
    res.status(400).json({
      success: false,
      message: 'El parámetro "since" debe ser un entero no negativo'
    });
    return;
  }

  try {
    const inicio = Date.now();
    const resultado = await calcularSync(idnegocio, since);

    const totalCambios =
      resultado.mode === 'full'
        ? Object.values(resultado.snapshot ?? {}).reduce((acc, filas) => acc + filas.length, 0)
        : Object.values(resultado.changes ?? {}).reduce(
            (acc, c) => acc + c.upserted.length + c.deleted.length,
            0
          );

    console.log(
      `[CatalogoSync] business=${idnegocio} fromVersion=${resultado.fromVersion} ` +
        `toVersion=${resultado.currentVersion} mode=${resultado.mode} ` +
        `changes=${totalCambios} ms=${Date.now() - inicio}` +
        (resultado.reason ? ` reason=${resultado.reason}` : '')
    );

    res.status(200).json({ success: true, ...resultado });
  } catch (error) {
    console.error('[CatalogoSync] error:', error instanceof Error ? error.message : error);
    res.status(500).json({ success: false, message: 'Error al sincronizar el catálogo' });
  }
};

/**
 * GET /api/catalogo/full
 * Snapshot completo del catálogo del negocio. Lo usa el cliente para reconstruir
 * su copia local desde cero (primer arranque o recuperación ante corrupción).
 */
export const obtenerCompleto = async (req: AuthRequest, res: Response): Promise<void> => {
  const idnegocio = resolverNegocio(req, res);
  if (!idnegocio) return;

  try {
    const inicio = Date.now();
    const [version, snapshot] = await Promise.all([
      obtenerVersionCatalogo(idnegocio),
      obtenerSnapshotCompleto(idnegocio)
    ]);

    const total = Object.values(snapshot).reduce((acc, filas) => acc + filas.length, 0);
    console.log(
      `[CatalogoSync] business=${idnegocio} full snapshot version=${version} ` +
        `registros=${total} ms=${Date.now() - inicio}`
    );

    res.status(200).json({
      success: true,
      mode: 'full',
      fromVersion: 0,
      currentVersion: version,
      snapshot
    });
  } catch (error) {
    console.error('[CatalogoSync] error en snapshot completo:', error instanceof Error ? error.message : error);
    res.status(500).json({ success: false, message: 'Error al obtener el catálogo completo' });
  }
};

/**
 * POST /api/catalogo/rebuild
 * Obliga a todos los dispositivos del negocio a reconstruir su catálogo local.
 * Requiere privilegio administrativo (ver catalogo.routes.ts).
 */
export const reconstruir = async (req: AuthRequest, res: Response): Promise<void> => {
  const idnegocio = resolverNegocio(req, res);
  if (!idnegocio) return;

  try {
    const nuevaVersion = await forzarReconstruccion(idnegocio);

    if (nuevaVersion === null) {
      res.status(500).json({ success: false, message: 'No se pudo forzar la reconstrucción del catálogo' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Reconstrucción de catálogo solicitada',
      idnegocio,
      catalogVersion: nuevaVersion
    });
  } catch (error) {
    console.error('[CatalogoSync] error en rebuild:', error instanceof Error ? error.message : error);
    res.status(500).json({ success: false, message: 'Error al reconstruir el catálogo' });
  }
};
