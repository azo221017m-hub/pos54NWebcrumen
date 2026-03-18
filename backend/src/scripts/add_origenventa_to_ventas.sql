-- Migración: Agregar campo origenventa a tblposcrumenwebventas
-- Este campo distingue si la venta se originó desde el SITIO (POS del negocio) o la WEB (portal cliente online)
-- Se aplica automáticamente al iniciar el servidor (backend/src/server.ts)

ALTER TABLE tblposcrumenwebventas ADD COLUMN IF NOT EXISTS origenventa ENUM('SITIO','WEB') NULL DEFAULT NULL;
