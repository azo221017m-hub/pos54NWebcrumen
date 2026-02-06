-- Script to create tblposcrumenwebdetallemovimientos table
-- This table tracks inventory movements for ingredients used in recipes

CREATE TABLE IF NOT EXISTS tblposcrumenwebdetallemovimientos (
  iddetallemovimiento BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  idinsumo BIGINT(20) UNSIGNED NOT NULL COMMENT 'ID of the ingredient/supply',
  nombreinsumo VARCHAR(200) NOT NULL COMMENT 'Name of the ingredient',
  tipoinsumo ENUM('DIRECTO','INVENTARIO','RECETA') NOT NULL COMMENT 'Type of supply',
  tipomovimiento ENUM('ENTRADA','SALIDA') NOT NULL COMMENT 'Movement type (IN/OUT)',
  motivomovimiento ENUM('COMPRA','VENTA','AJUSTE_MANUAL','MERMA','CANCELACION','DEVOLUCION','INV_INICIAL') NOT NULL COMMENT 'Reason for movement',
  cantidad DECIMAL(12,3) NOT NULL COMMENT 'Quantity moved',
  referenciastock DECIMAL(12,3) NULL COMMENT 'Stock reference at time of movement',
  unidadmedida VARCHAR(20) NOT NULL COMMENT 'Unit of measure',
  precio DECIMAL(12,2) NULL COMMENT 'Sale price',
  costo DECIMAL(12,2) NULL COMMENT 'Average weighted cost',
  idreferencia BIGINT(20) UNSIGNED NOT NULL COMMENT 'Reference ID (e.g., sale ID)',
  fechamovimiento DATETIME NOT NULL COMMENT 'Date/time of movement',
  observaciones TEXT NULL COMMENT 'Additional observations',
  usuarioauditoria BIGINT(20) UNSIGNED NOT NULL COMMENT 'User who created the movement',
  idnegocio BIGINT(20) UNSIGNED NOT NULL COMMENT 'Business ID',
  estatusmovimiento ENUM('PROCESADO','PENDIENTE') NOT NULL DEFAULT 'PENDIENTE' COMMENT 'Movement status',
  fecharegistro DATETIME NOT NULL COMMENT 'Registration date',
  fechaauditoria DATETIME NOT NULL COMMENT 'Last modification date',
  PRIMARY KEY (iddetallemovimiento),
  INDEX idx_idinsumo (idinsumo),
  INDEX idx_idnegocio (idnegocio),
  INDEX idx_idreferencia (idreferencia),
  INDEX idx_fechamovimiento (fechamovimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Detailed inventory movements tracking table';
