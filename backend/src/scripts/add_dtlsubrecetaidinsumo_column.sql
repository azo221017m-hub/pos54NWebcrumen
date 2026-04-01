-- Migration: Add dtlsubrecetaidinsumo column to tblposcrumenwebdetallesubrecetas
-- This column stores the id_insumo from tblposcrumenwebinsumos for each detail row

ALTER TABLE tblposcrumenwebdetallesubrecetas
ADD COLUMN dtlsubrecetaidinsumo int(11) DEFAULT NULL;
