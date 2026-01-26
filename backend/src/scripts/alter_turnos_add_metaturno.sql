-- Script para agregar la columna metaturno a la tabla tblposcrumenwebturnos
-- Este script es para bases de datos existentes que no tienen la columna metaturno

-- Agregar columna metaturno si no existe
ALTER TABLE tblposcrumenwebturnos 
ADD COLUMN IF NOT EXISTS metaturno DECIMAL(12,2) NULL DEFAULT NULL
AFTER idnegocio;
