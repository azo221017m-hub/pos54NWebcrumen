-- Script to alter usuarioauditoria column from BIGINT to VARCHAR(100)
-- This allows storing the user's alias instead of just the numeric ID

-- Note: Before running this migration, ensure to backup your database
-- If there are existing numeric IDs in usuarioauditoria, they will be converted to strings
-- You may need to run a data migration to convert existing IDs to user aliases

-- Step 1: Alter the tblposcrumenwebdetallemovimientos table
ALTER TABLE tblposcrumenwebdetallemovimientos 
MODIFY COLUMN usuarioauditoria VARCHAR(100) NOT NULL COMMENT 'User alias who created the movement';

-- Step 2: Alter the tblposcrumenwebinsumos table if needed
ALTER TABLE tblposcrumenwebinsumos 
MODIFY COLUMN usuarioauditoria VARCHAR(100) NULL COMMENT 'User alias who last modified the record';

-- Step 3: (Optional) Data migration for existing records
-- Uncomment and modify the following queries if you need to migrate existing numeric IDs to aliases:

-- UPDATE tblposcrumenwebdetallemovimientos m
-- JOIN tblposcrumenwebusuarios u ON CAST(m.usuarioauditoria AS UNSIGNED) = u.idUsuario
-- SET m.usuarioauditoria = u.alias
-- WHERE m.usuarioauditoria REGEXP '^[0-9]+$';

-- UPDATE tblposcrumenwebinsumos i
-- JOIN tblposcrumenwebusuarios u ON CAST(i.usuarioauditoria AS UNSIGNED) = u.idUsuario
-- SET i.usuarioauditoria = u.alias
-- WHERE i.usuarioauditoria REGEXP '^[0-9]+$' AND i.usuarioauditoria IS NOT NULL;
