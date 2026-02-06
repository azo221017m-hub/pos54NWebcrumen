import type { Request, Response } from 'express';
import { pool } from '../config/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';

interface Insumo extends RowDataPacket {
  id_insumo: number;
  nombre: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  costo_promedio_ponderado: number;
  precio_venta: number;
  idinocuidad: string | null;
  id_cuentacontable: string | null;
  nombrecuentacontable?: string | null; // Nombre de la cuenta contable (JOIN)
  activo: number;
  inventariable: number;
  fechaRegistroauditoria: Date | null;
  usuarioauditoria: string | null;
  fechamodificacionauditoria: Date | null;
  idnegocio: number;
  idproveedor: string | null; // Stores provider name instead of ID
}

// Obtener todos los insumos por negocio
export const obtenerInsumos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Usar idnegocio del usuario autenticado para seguridad
    const idnegocio = req.user?.idNegocio;
    
    if (!idnegocio) {
      res.status(401).json({ message: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }
    
    const [rows] = await pool.query<Insumo[]>(
      `SELECT 
        i.id_insumo,
        i.nombre,
        i.unidad_medida,
        i.stock_actual,
        i.stock_minimo,
        i.costo_promedio_ponderado,
        i.precio_venta,
        i.idinocuidad,
        i.id_cuentacontable,
        cc.nombrecuentacontable,
        i.activo,
        i.inventariable,
        i.fechaRegistroauditoria,
        i.usuarioauditoria,
        i.fechamodificacionauditoria,
        i.idnegocio,
        i.idproveedor
      FROM tblposcrumenwebinsumos i
      LEFT JOIN tblposcrumenwebcuentacontable cc ON i.id_cuentacontable = cc.id_cuentacontable
      WHERE i.idnegocio = ?
      ORDER BY i.nombre ASC`,
      [idnegocio]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener insumos:', error);
    res.status(500).json({ 
      message: 'Error al obtener insumos', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Obtener un insumo por ID
export const obtenerInsumoPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_insumo } = req.params;
    
    const [rows] = await pool.query<Insumo[]>(
      `SELECT 
        i.id_insumo,
        i.nombre,
        i.unidad_medida,
        i.stock_actual,
        i.stock_minimo,
        i.costo_promedio_ponderado,
        i.precio_venta,
        i.idinocuidad,
        i.id_cuentacontable,
        cc.nombrecuentacontable,
        i.activo,
        i.inventariable,
        i.fechaRegistroauditoria,
        i.usuarioauditoria,
        i.fechamodificacionauditoria,
        i.idnegocio,
        i.idproveedor
      FROM tblposcrumenwebinsumos i
      LEFT JOIN tblposcrumenwebcuentacontable cc ON i.id_cuentacontable = cc.id_cuentacontable
      WHERE i.id_insumo = ?`,
      [id_insumo]
    );
    
    if (rows.length === 0) {
      res.status(404).json({ message: 'Insumo no encontrado' });
      return;
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener insumo:', error);
    res.status(500).json({ 
      message: 'Error al obtener insumo', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Helper function to get account name from ID
const obtenerNombreCuentaContable = async (id_cuentacontable: string): Promise<string | null> => {
  const [cuentas] = await pool.query<RowDataPacket[]>(
    'SELECT nombrecuentacontable FROM tblposcrumenwebcuentacontable WHERE id_cuentacontable = ?',
    [id_cuentacontable]
  );
  return cuentas.length > 0 ? cuentas[0].nombrecuentacontable : null;
};

// Helper function to get provider name from ID
const obtenerNombreProveedor = async (idproveedor: number): Promise<string | null> => {
  const [proveedores] = await pool.query<RowDataPacket[]>(
    'SELECT nombre FROM tblposcrumenwebproveedores WHERE id_proveedor = ?',
    [idproveedor]
  );
  return proveedores.length > 0 ? proveedores[0].nombre : null;
};

// Helper function to validate duplicate insumo names
const validarNombreDuplicado = async (
  nombre: string, 
  idnegocio: number, 
  id_insumo?: number
): Promise<boolean> => {
  let query = 'SELECT id_insumo FROM tblposcrumenwebinsumos WHERE LOWER(nombre) = LOWER(?) AND idnegocio = ?';
  const params: (string | number)[] = [nombre, idnegocio];

  // Si se proporciona id_insumo, excluirlo de la búsqueda (para validación en edición)
  if (id_insumo) {
    query += ' AND id_insumo != ?';
    params.push(id_insumo);
  }

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows.length > 0;
};

// Validar si existe un insumo con el mismo nombre
export const validarNombreInsumo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nombre } = req.params;
    const { id_insumo } = req.query; // Opcional: para excluir un insumo específico al editar
    
    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;
    
    if (!idnegocio) {
      res.status(401).json({ message: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }

    const existe = await validarNombreDuplicado(
      nombre, 
      idnegocio, 
      id_insumo ? Number(id_insumo) : undefined
    );
    
    res.json({ existe });
  } catch (error) {
    console.error('Error al validar nombre de insumo:', error);
    res.status(500).json({ 
      message: 'Error al validar nombre de insumo', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Crear nuevo insumo
export const crearInsumo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      nombre,
      unidad_medida,
      stock_actual,
      stock_minimo,
      costo_promedio_ponderado,
      precio_venta,
      idinocuidad,
      id_cuentacontable,
      activo,
      inventariable,
      idproveedor
    } = req.body;

    // Obtener idnegocio y alias del usuario autenticado
    const idnegocio = req.user?.idNegocio;
    const usuarioauditoria = req.user?.alias;

    // Validar campos requeridos
    if (!nombre || !unidad_medida || stock_actual === undefined || 
        stock_minimo === undefined || costo_promedio_ponderado === undefined || 
        precio_venta === undefined || activo === undefined || 
        inventariable === undefined || !idnegocio || !usuarioauditoria) {
      res.status(400).json({ message: 'Faltan campos requeridos o el usuario no está autenticado' });
      return;
    }

    // Validar que el nombre de insumo no exista para este negocio
    const existe = await validarNombreDuplicado(nombre, idnegocio);

    if (existe) {
      res.status(409).json({ message: 'Ya existe un insumo con ese nombre para este negocio' });
      return;
    }

    // Buscar el nombre de la cuenta contable si se proporciona id_cuentacontable
    const nombreCuentaContable = id_cuentacontable ? await obtenerNombreCuentaContable(id_cuentacontable) : null;

    // Buscar el nombre del proveedor si se proporciona idproveedor
    const nombreProveedor = idproveedor ? await obtenerNombreProveedor(idproveedor) : null;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebinsumos (
        nombre,
        unidad_medida,
        stock_actual,
        stock_minimo,
        costo_promedio_ponderado,
        precio_venta,
        idinocuidad,
        id_cuentacontable,
        activo,
        inventariable,
        fechaRegistroauditoria,
        usuarioauditoria,
        idnegocio,
        idproveedor
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)`,
      [
        nombre,
        unidad_medida,
        stock_actual,
        stock_minimo,
        costo_promedio_ponderado,
        precio_venta,
        idinocuidad || null,
        nombreCuentaContable || null,
        activo,
        inventariable,
        usuarioauditoria,
        idnegocio,
        nombreProveedor || null
      ]
    );

    res.status(201).json({ 
      message: 'Insumo creado exitosamente', 
      id_insumo: result.insertId 
    });
  } catch (error) {
    console.error('Error al crear insumo:', error);
    res.status(500).json({ 
      message: 'Error al crear insumo', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Actualizar insumo
export const actualizarInsumo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id_insumo } = req.params;
    const {
      nombre,
      unidad_medida,
      stock_actual,
      stock_minimo,
      costo_promedio_ponderado,
      precio_venta,
      idinocuidad,
      id_cuentacontable,
      activo,
      inventariable,
      usuarioauditoria,
      idproveedor
    } = req.body;

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({ message: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }

    // Verificar si existe el insumo
    const [exist] = await pool.query<RowDataPacket[]>(
      'SELECT id_insumo FROM tblposcrumenwebinsumos WHERE id_insumo = ?',
      [id_insumo]
    );
    
    if (exist.length === 0) {
      res.status(404).json({ message: 'Insumo no encontrado' });
      return;
    }

    // Validar que el nombre de insumo no exista para este negocio (excluyendo el insumo actual)
    const existe = await validarNombreDuplicado(nombre, idnegocio, Number(id_insumo));

    if (existe) {
      res.status(409).json({ message: 'Ya existe un insumo con ese nombre para este negocio' });
      return;
    }

    // Buscar el nombre de la cuenta contable si se proporciona id_cuentacontable
    const nombreCuentaContable = id_cuentacontable ? await obtenerNombreCuentaContable(id_cuentacontable) : null;

    // Buscar el nombre del proveedor si se proporciona idproveedor
    const nombreProveedor = idproveedor ? await obtenerNombreProveedor(idproveedor) : null;

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebinsumos SET
        nombre = ?,
        unidad_medida = ?,
        stock_actual = ?,
        stock_minimo = ?,
        costo_promedio_ponderado = ?,
        precio_venta = ?,
        idinocuidad = ?,
        id_cuentacontable = ?,
        activo = ?,
        inventariable = ?,
        fechamodificacionauditoria = NOW(),
        usuarioauditoria = ?,
        idproveedor = ?
      WHERE id_insumo = ?`,
      [
        nombre,
        unidad_medida,
        stock_actual,
        stock_minimo,
        costo_promedio_ponderado,
        precio_venta,
        idinocuidad || null,
        nombreCuentaContable || null,
        activo,
        inventariable,
        usuarioauditoria || null,
        nombreProveedor || null,
        id_insumo
      ]
    );

    if (result.affectedRows === 0) {
      res.status(500).json({ message: 'No se pudo actualizar el insumo' });
      return;
    }

    res.json({ message: 'Insumo actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar insumo:', error);
    res.status(500).json({ 
      message: 'Error al actualizar insumo', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};

// Eliminar insumo
export const eliminarInsumo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_insumo } = req.params;
    
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM tblposcrumenwebinsumos WHERE id_insumo = ?',
      [id_insumo]
    );
    
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Insumo no encontrado' });
      return;
    }
    
    res.json({ message: 'Insumo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar insumo:', error);
    res.status(500).json({ 
      message: 'Error al eliminar insumo', 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    });
  }
};
