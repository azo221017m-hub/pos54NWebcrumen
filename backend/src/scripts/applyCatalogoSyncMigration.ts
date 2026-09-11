import { pool } from '../config/db';

/**
 * Aplica la migración de sincronización de catálogo (PWA / IndexedDB):
 *   - tblposcrumenwebcatalogoversion  (versión actual por negocio)
 *   - tblposcrumenwebcatalogocambios  (bitácora incremental de cambios)
 *
 * Es idempotente: se puede ejecutar varias veces sin efectos secundarios.
 * Uso: npm run db:catalogo-sync
 */
async function applyCatalogoSyncMigration(): Promise<void> {
  console.log('🔄 Aplicando migración de sincronización de catálogo...');

  const statements: Array<{ label: string; sql: string }> = [
    {
      label: 'tblposcrumenwebcatalogoversion',
      sql: `CREATE TABLE IF NOT EXISTS tblposcrumenwebcatalogoversion (
              idnegocio INT NOT NULL,
              version BIGINT NOT NULL DEFAULT 0,
              fechaactualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              PRIMARY KEY (idnegocio)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
              COMMENT='Versión actual del catálogo por negocio'`
    },
    {
      label: 'tblposcrumenwebcatalogocambios',
      sql: `CREATE TABLE IF NOT EXISTS tblposcrumenwebcatalogocambios (
              idcambio BIGINT NOT NULL AUTO_INCREMENT,
              idnegocio INT NOT NULL,
              version BIGINT NOT NULL,
              entidad VARCHAR(32) NOT NULL,
              identidad BIGINT NOT NULL,
              accion VARCHAR(10) NOT NULL,
              fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              PRIMARY KEY (idcambio),
              KEY idx_catalogocambios_negocio_version (idnegocio, version),
              KEY idx_catalogocambios_fecha (fecha)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
              COMMENT='Bitácora incremental de cambios de catálogo'`
    },
    {
      label: 'seed de versiones iniciales',
      sql: `INSERT INTO tblposcrumenwebcatalogoversion (idnegocio, version)
            SELECT idNegocio, 1 FROM tblposcrumenwebnegocio
            ON DUPLICATE KEY UPDATE idnegocio = tblposcrumenwebcatalogoversion.idnegocio`
    }
  ];

  try {
    for (const { label, sql } of statements) {
      console.log(`⏳ ${label}...`);
      await pool.query(sql);
      console.log(`✅ ${label} OK`);
    }

    // Verificación
    const [versiones] = await pool.query<any[]>(
      'SELECT COUNT(*) AS total FROM tblposcrumenwebcatalogoversion'
    );
    console.log(`\n🔍 Negocios con versión de catálogo: ${versiones[0]?.total ?? 0}`);
    console.log('✅ Migración de sincronización de catálogo completada');
  } catch (error) {
    console.error('❌ Error al aplicar la migración:', error instanceof Error ? error.message : error);
    throw error;
  } finally {
    await pool.end();
  }
}

applyCatalogoSyncMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
