-- Script to alter usuarioauditoria column from BIGINT to VARCHAR(100)
-- This allows storing the user's alias instead of just the numeric ID

-- Alter the tblposcrumenwebdetallemovimientos table
ALTER TABLE tblposcrumenwebdetallemovimientos 
MODIFY COLUMN usuarioauditoria VARCHAR(100) NOT NULL COMMENT 'User alias who created the movement';

-- Alter the tblposcrumenwebinsumos table if needed
ALTER TABLE tblposcrumenwebinsumos 
MODIFY COLUMN usuarioauditoria VARCHAR(100) NULL COMMENT 'User alias who last modified the record';
