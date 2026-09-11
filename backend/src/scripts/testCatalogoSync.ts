import { pool } from '../config/db';
import {
  calcularSync,
  obtenerVersionCatalogo,
  obtenerSnapshotCompleto,
  registrarCambioCatalogo,
  ENTIDADES_CATALOGO,
  COLECCION_POR_ENTIDAD
} from '../services/catalogo.service';
import type { RowDataPacket } from 'mysql2';

/**
 * Verificación de la sincronización de catálogo contra la base de datos real.
 *
 * NO es destructivo sobre los catálogos: sólo escribe en las tablas de
 * versionado/bitácora y limpia al final los registros sintéticos que creó.
 *
 * Uso: npm run test:catalogo-sync
 */

let pruebasOk = 0;
let pruebasFallidas = 0;

const verificar = (descripcion: string, condicion: boolean, detalle = ''): void => {
  if (condicion) {
    pruebasOk += 1;
    console.log(`  ✅ ${descripcion}`);
  } else {
    pruebasFallidas += 1;
    console.error(`  ❌ ${descripcion}${detalle ? ` — ${detalle}` : ''}`);
  }
};

// Id sintético usado en la bitácora; no corresponde a ningún registro real.
const ID_SINTETICO = -99999;

const obtenerNegociosDePrueba = async (): Promise<number[]> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT idNegocio FROM tblposcrumenwebnegocio ORDER BY idNegocio ASC LIMIT 2'
  );
  return rows.map((r) => Number(r.idNegocio));
};

const limpiarRastros = async (negocios: number[]): Promise<void> => {
  for (const idnegocio of negocios) {
    await pool.query(
      'DELETE FROM tblposcrumenwebcatalogocambios WHERE idnegocio = ? AND identidad = ?',
      [idnegocio, ID_SINTETICO]
    );
  }
};

const main = async (): Promise<void> => {
  console.log('🧪 Verificación de sincronización de catálogo\n');

  // ── 1. Esquema ──────────────────────────────────────────────────────────
  console.log('1) Esquema de base de datos');
  for (const tabla of ['tblposcrumenwebcatalogoversion', 'tblposcrumenwebcatalogocambios']) {
    const [rows] = await pool.query<RowDataPacket[]>('SHOW TABLES LIKE ?', [tabla]);
    verificar(`existe la tabla ${tabla}`, rows.length > 0, 'ejecuta: npm run db:catalogo-sync');
  }

  if (pruebasFallidas > 0) {
    console.error('\n⛔ Falta la migración. Aborto antes de continuar.');
    return;
  }

  const negocios = await obtenerNegociosDePrueba();
  if (negocios.length === 0) {
    console.error('⛔ No hay negocios en la base de datos; no se puede verificar.');
    pruebasFallidas += 1;
    return;
  }

  const [negocioA, negocioB] = negocios;
  console.log(`\n   Negocio A = ${negocioA}${negocioB ? `, Negocio B = ${negocioB}` : ' (sólo hay uno)'}`);

  await limpiarRastros(negocios);

  // ── 2. Versionado ───────────────────────────────────────────────────────
  console.log('\n2) Versionado');
  const versionInicial = await obtenerVersionCatalogo(negocioA);
  console.log(`   versión inicial = ${versionInicial}`);

  const versionSinCambios = await obtenerVersionCatalogo(negocioA);
  verificar(
    'la versión NO cambia cuando no hay cambios',
    versionSinCambios === versionInicial,
    `${versionInicial} → ${versionSinCambios}`
  );

  const v1 = await registrarCambioCatalogo(negocioA, {
    entidad: 'producto',
    identidad: ID_SINTETICO,
    accion: 'UPDATE'
  });
  verificar('la versión aumenta al registrar un cambio', v1 === versionInicial + 1, `esperado ${versionInicial + 1}, obtenido ${v1}`);

  const v2 = await registrarCambioCatalogo(negocioA, {
    entidad: 'categoria',
    identidad: ID_SINTETICO,
    accion: 'UPDATE'
  });
  verificar('cada cambio produce una versión nueva', v2 === (v1 ?? 0) + 1, `esperado ${(v1 ?? 0) + 1}, obtenido ${v2}`);

  const versionActual = await obtenerVersionCatalogo(negocioA);
  verificar('la versión persistida coincide con la última emitida', versionActual === v2);

  // ── 3. Sincronización según el atraso del cliente ────────────────────────
  console.log('\n3) Sincronización');

  const alDia = await calcularSync(negocioA, versionActual);
  verificar(
    'cliente al día: modo incremental sin cambios',
    alDia.mode === 'incremental' && Object.keys(alDia.changes ?? {}).length === 0,
    `mode=${alDia.mode}`
  );

  const unaAtras = await calcularSync(negocioA, versionActual - 1);
  verificar('cliente atrasado 1 versión: incremental', unaAtras.mode === 'incremental', `mode=${unaAtras.mode}`);

  const dosAtras = await calcularSync(negocioA, versionActual - 2);
  verificar('cliente atrasado varias versiones: incremental', dosAtras.mode === 'incremental', `mode=${dosAtras.mode}`);
  verificar(
    'los cambios sintéticos se reportan como eliminaciones (no existen en el catálogo)',
    Object.values(dosAtras.changes ?? {}).some((c) => c.deleted.includes(ID_SINTETICO))
  );

  const sinVersion = await calcularSync(negocioA, 0);
  verificar('cliente sin versión local: reconstrucción completa', sinVersion.mode === 'full', `mode=${sinVersion.mode}`);
  verificar('la reconstrucción completa incluye todas las colecciones',
    ENTIDADES_CATALOGO.every((e) => Array.isArray(sinVersion.snapshot?.[COLECCION_POR_ENTIDAD[e]]))
  );

  const adelantado = await calcularSync(negocioA, versionActual + 1000);
  verificar('cliente con versión adelantada (dato corrupto): reconstrucción completa',
    adelantado.mode === 'full', `mode=${adelantado.mode}`);

  // ── 4. Aislamiento multi-negocio ────────────────────────────────────────
  console.log('\n4) Aislamiento multi-negocio');
  const snapshotA = await obtenerSnapshotCompleto(negocioA);
  let filasAjenas = 0;

  for (const [coleccion, filas] of Object.entries(snapshotA)) {
    for (const fila of filas) {
      if (Number((fila as RowDataPacket).idnegocio) !== negocioA) {
        filasAjenas += 1;
        console.error(`     fuga en ${coleccion}: idnegocio=${(fila as RowDataPacket).idnegocio}`);
      }
    }
  }

  const totalA = Object.values(snapshotA).reduce((acc, f) => acc + f.length, 0);
  verificar(
    `el catálogo del negocio ${negocioA} sólo contiene sus propios registros (${totalA} filas)`,
    filasAjenas === 0,
    `${filasAjenas} filas ajenas`
  );

  if (negocioB !== undefined) {
    const versionB = await obtenerVersionCatalogo(negocioB);
    await registrarCambioCatalogo(negocioB, {
      entidad: 'producto',
      identidad: ID_SINTETICO,
      accion: 'UPDATE'
    });

    const versionADespues = await obtenerVersionCatalogo(negocioA);
    verificar(
      `un cambio en el negocio ${negocioB} NO altera la versión del negocio ${negocioA}`,
      versionADespues === versionActual,
      `${versionActual} → ${versionADespues}`
    );

    const syncA = await calcularSync(negocioA, versionActual);
    verificar(
      `el negocio ${negocioA} no recibe los cambios del negocio ${negocioB}`,
      Object.keys(syncA.changes ?? {}).length === 0
    );

    const snapshotB = await obtenerSnapshotCompleto(negocioB);
    const idsA = new Set(
      (snapshotA.productos ?? []).map((p) => Number((p as RowDataPacket).idProducto))
    );
    const solapamiento = (snapshotB.productos ?? []).filter((p) =>
      idsA.has(Number((p as RowDataPacket).idProducto))
    );
    verificar(
      'los catálogos de ambos negocios no comparten productos',
      solapamiento.length === 0,
      `${solapamiento.length} productos compartidos`
    );

    console.log(`   (versión previa del negocio ${negocioB} = ${versionB})`);
  } else {
    console.log('   ⚠️  Sólo hay un negocio en la BD: no se pudo cruzar negocios.');
  }

  // ── 5. Limpieza ─────────────────────────────────────────────────────────
  console.log('\n5) Limpieza de registros sintéticos');
  await limpiarRastros(negocios);
  const [restantes] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS total FROM tblposcrumenwebcatalogocambios WHERE identidad = ?',
    [ID_SINTETICO]
  );
  verificar('no quedan registros sintéticos en la bitácora', Number(restantes[0]?.total) === 0);
  console.log('   ℹ️  Las versiones de catálogo quedaron incrementadas; los clientes');
  console.log('      simplemente sincronizarán una vez. No requiere acción.');
};

main()
  .catch((error) => {
    console.error('\n💥 Error inesperado:', error instanceof Error ? error.message : error);
    pruebasFallidas += 1;
  })
  .finally(async () => {
    console.log('\n═══════════════════════════════════════════');
    console.log(`   Correctas: ${pruebasOk}   Fallidas: ${pruebasFallidas}`);
    console.log('═══════════════════════════════════════════');
    await pool.end();
    process.exit(pruebasFallidas > 0 ? 1 : 0);
  });
