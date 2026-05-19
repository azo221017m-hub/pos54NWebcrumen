-- Migration: Replace idreferencia with claveturno in movimientos tables
-- Run this script once on the production database.
-- After running, all application code must use claveturno instead of idreferencia.

-- -----------------------------------------------------------
-- 1. tblposcrumenwebmovimientos
--    idreferencia (BIGINT) → claveturno (VARCHAR 50)
-- -----------------------------------------------------------
ALTER TABLE tblposcrumenwebmovimientos
  CHANGE COLUMN idreferencia claveturno VARCHAR(50) NULL
    COMMENT 'Clave del turno asociado al movimiento (COMPRA). Para otros tipos: folio único de referencia.';

-- -----------------------------------------------------------
-- 2. tblposcrumenwebdetallemovimientos
--    idreferencia (BIGINT) → claveturno (VARCHAR 50)
--    This field stores the idmovimiento (as VARCHAR) to maintain
--    the 1:N relationship with tblposcrumenwebmovimientos.
--    For VENTA detalles it stores the idventa as VARCHAR.
-- -----------------------------------------------------------
ALTER TABLE tblposcrumenwebdetallemovimientos
  CHANGE COLUMN idreferencia claveturno VARCHAR(50) NULL
    COMMENT 'Referencia al idmovimiento padre (como VARCHAR) para movimientos CRUD. Para VENTA: idventa como VARCHAR.';

-- Update existing index on tblposcrumenwebdetallemovimientos
ALTER TABLE tblposcrumenwebdetallemovimientos
  DROP INDEX IF EXISTS idx_idreferencia;

ALTER TABLE tblposcrumenwebdetallemovimientos
  ADD INDEX idx_claveturno (claveturno);

-- -----------------------------------------------------------
-- 3. Back-fill: convert existing numeric idreferencia values
--    to their VARCHAR equivalents (no-op since CHANGE already
--    preserves values via implicit CAST in MySQL).
-- -----------------------------------------------------------
-- MySQL preserves the numeric value as a string automatically
-- when changing BIGINT → VARCHAR, so no explicit UPDATE is needed.
