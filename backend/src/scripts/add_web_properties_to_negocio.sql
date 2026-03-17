-- Migration: Add web property columns to tblposcrumenwebnegocio
-- These columns control the visible badges shown in PageClientes for each business.
-- Run this script once against the production database if the columns do not yet exist.

ALTER TABLE tblposcrumenwebnegocio
  ADD COLUMN IF NOT EXISTS plancontratado ENUM('EMPRENDEDOR','EMPRESARIO','EJECUTIVO') NULL AFTER estatusnegocio,
  ADD COLUMN IF NOT EXISTS calificacion INT(11) NULL AFTER plancontratado,
  ADD COLUMN IF NOT EXISTS etiquetas MEDIUMTEXT NULL AFTER calificacion,
  ADD COLUMN IF NOT EXISTS abiertoahoraweb INT(11) NOT NULL DEFAULT 0 AFTER etiquetas,
  ADD COLUMN IF NOT EXISTS promohoyweb INT(11) NOT NULL DEFAULT 0 AFTER abiertoahoraweb,
  ADD COLUMN IF NOT EXISTS entregarapidaweb INT(11) NOT NULL DEFAULT 0 AFTER promohoyweb,
  ADD COLUMN IF NOT EXISTS nuevoweb INT(11) NOT NULL DEFAULT 0 AFTER entregarapidaweb,
  ADD COLUMN IF NOT EXISTS operacionweb INT(11) NULL AFTER nuevoweb;
