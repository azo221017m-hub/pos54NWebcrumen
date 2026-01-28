-- Migration script for payment functionality
-- This script adds the importedepago field to tblposcrumenwebventas
-- and creates the tblposcrumenwebdetallepagos table

-- Step 1: Add importedepago field to tblposcrumenwebventas if it doesn't exist
ALTER TABLE tblposcrumenwebventas 
ADD COLUMN IF NOT EXISTS importedepago DECIMAL(10, 2) NOT NULL DEFAULT 0.00 
AFTER formadepago;

-- Step 2: Create the payment details table if it doesn't exist
CREATE TABLE IF NOT EXISTS tblposcrumenwebdetallepagos (
  iddetallepagos INT AUTO_INCREMENT PRIMARY KEY,
  idfolioventa VARCHAR(100) NOT NULL,
  fechadepago DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  totaldepago DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  formadepagodetalle ENUM('EFECTIVO', 'TARJETA', 'TRANSFERENCIA') NOT NULL,
  referencia VARCHAR(255) NULL,
  claveturno VARCHAR(50) NULL,
  idnegocio INT NOT NULL,
  usuarioauditoria VARCHAR(100) NOT NULL,
  fechamodificacionauditoria DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Add indexes for better query performance
  INDEX idx_idfolioventa (idfolioventa),
  INDEX idx_idnegocio (idnegocio),
  INDEX idx_fechadepago (fechadepago)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verification queries
SELECT 'Migration completed successfully!' as status;
SELECT COUNT(*) as count_detallepagos FROM tblposcrumenwebdetallepagos;
