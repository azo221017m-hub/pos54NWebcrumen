-- Script to add proveedor field to tblposcrumenwebdetallemovimientos table
-- This field will store the supplier name for each movement detail

ALTER TABLE tblposcrumenwebdetallemovimientos 
ADD COLUMN proveedor VARCHAR(200) NULL COMMENT 'Supplier name' AFTER observaciones;
