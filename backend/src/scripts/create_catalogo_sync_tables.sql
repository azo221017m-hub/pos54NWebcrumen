-- Migration: Catálogo local (PWA) - versionado y bitácora de cambios
-- Date: 2026-09-10
-- Description: Soporte para sincronización incremental de catálogos en PWA/IndexedDB.
--              La versión es POR NEGOCIO (tblposcrumenwebnegocio.idNegocio), que es el
--              único nivel de aislamiento multi-tenant que maneja POSWEB54N hoy
--              (no existe sucursal ni terminal en el modelo actual).

-- Versión actual del catálogo de cada negocio.
-- Se incrementa desde la lógica de dominio del Backend (NO por triggers),
-- para mantener el bump y el registro del cambio en una sola transacción.
CREATE TABLE IF NOT EXISTS tblposcrumenwebcatalogoversion (
  idnegocio INT NOT NULL,
  version BIGINT NOT NULL DEFAULT 0,
  fechaactualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (idnegocio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Versión actual del catálogo por negocio';

-- Bitácora de cambios de catálogo. Permite responder /api/catalogo/sync?since=N
-- devolviendo únicamente lo que cambió entre la versión del cliente y la actual.
CREATE TABLE IF NOT EXISTS tblposcrumenwebcatalogocambios (
  idcambio BIGINT NOT NULL AUTO_INCREMENT,
  idnegocio INT NOT NULL,
  version BIGINT NOT NULL COMMENT 'Versión del catálogo resultante de este cambio',
  entidad VARCHAR(32) NOT NULL COMMENT 'producto|categoria|moderador|catmoderador|descuento',
  identidad BIGINT NOT NULL COMMENT 'PK del registro afectado',
  accion VARCHAR(10) NOT NULL COMMENT 'CREATE|UPDATE|DELETE',
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (idcambio),
  KEY idx_catalogocambios_negocio_version (idnegocio, version),
  KEY idx_catalogocambios_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Bitácora incremental de cambios de catálogo';

-- Sembrar versión 1 para los negocios existentes, para que los clientes
-- arranquen con una versión válida en lugar de forzar reconstrucción completa.
INSERT INTO tblposcrumenwebcatalogoversion (idnegocio, version)
SELECT idNegocio, 1 FROM tblposcrumenwebnegocio
ON DUPLICATE KEY UPDATE idnegocio = tblposcrumenwebcatalogoversion.idnegocio;
