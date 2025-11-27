import { Request, Response } from 'express';
import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// ========== OBTENER TODOS LOS ROLES ==========
export const obtenerRoles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [roles] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tblposcrumenwebrolesdeusuario ORDER BY nombreRol ASC'
    );

    res.json({
      success: true,
      message: 'Roles obtenidos exitosamente',
      data: roles,
    });
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener roles',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

// ========== OBTENER ROL POR ID ==========
export const obtenerRolPorId = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const [roles] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM tblposcrumenwebrolesdeusuario WHERE idRol = ?',
      [id]
    );

    if (roles.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Rol no encontrado',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Rol obtenido exitosamente',
      data: roles[0],
    });
  } catch (error) {
    console.error('Error al obtener rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener rol',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

// ========== CREAR NUEVO ROL ==========
export const crearRol = async (req: Request, res: Response): Promise<void> => {
  const { nombreRol, descripcion, privilegio, estatus, usuarioauditoria } = req.body;

  console.log('➕ Creando nuevo rol');
  console.log('📝 Datos recibidos:', { nombreRol, descripcion, privilegio, estatus, usuarioauditoria });

  try {
    // Validar que el nombre sea único
    const [rolesExistentes] = await pool.execute<RowDataPacket[]>(
      'SELECT idRol FROM tblposcrumenwebrolesdeusuario WHERE nombreRol = ?',
      [nombreRol]
    );

    if (rolesExistentes.length > 0) {
      console.log('❌ Ya existe un rol con ese nombre');
      res.status(400).json({
        success: false,
        message: 'Ya existe un rol con ese nombre',
      });
      return;
    }

    // Insertar nuevo rol (sin idnegocio)
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebrolesdeusuario 
       (nombreRol, descripcion, privilegio, estatus, fechaRegistroauditoria, usuarioauditoria) 
       VALUES (?, ?, ?, ?, NOW(), ?)`,
      [nombreRol, descripcion, privilegio, estatus, usuarioauditoria]
    );

    console.log('✅ Rol creado exitosamente, ID:', result.insertId);

    res.status(201).json({
      success: true,
      message: 'Rol creado exitosamente',
      data: {
        idRol: result.insertId,
        nombreRol,
        descripcion,
        privilegio,
        estatus,
      },
    });
  } catch (error) {
    console.error('❌ Error al crear rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear rol',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

// ========== ACTUALIZAR ROL ==========
export const actualizarRol = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nombreRol, descripcion, privilegio, estatus, usuarioauditoria } = req.body;

  console.log('🔄 Actualizando rol - ID:', id);
  console.log('🔄 Datos recibidos:', { nombreRol, descripcion, privilegio, estatus, usuarioauditoria });
  console.log('🔄 Body completo:', JSON.stringify(req.body, null, 2));

  try {
    // Verificar si el rol existe
    const [rolExistente] = await pool.execute<RowDataPacket[]>(
      'SELECT idRol FROM tblposcrumenwebrolesdeusuario WHERE idRol = ?',
      [id]
    );

    console.log('🔍 Rol existente:', rolExistente);

    if (rolExistente.length === 0) {
      console.log('❌ Rol no encontrado');
      res.status(404).json({
        success: false,
        message: 'Rol no encontrado',
      });
      return;
    }

    // Validar nombre único (excepto el mismo rol)
    const [rolesConMismoNombre] = await pool.execute<RowDataPacket[]>(
      'SELECT idRol FROM tblposcrumenwebrolesdeusuario WHERE nombreRol = ? AND idRol != ?',
      [nombreRol, id]
    );

    console.log('🔍 Roles con mismo nombre:', rolesConMismoNombre);

    console.log('🔍 Roles con mismo nombre:', rolesConMismoNombre);

    if (rolesConMismoNombre.length > 0) {
      console.log('❌ Ya existe otro rol con ese nombre');
      res.status(400).json({
        success: false,
        message: 'Ya existe otro rol con ese nombre',
      });
      return;
    }

    console.log('💾 Ejecutando UPDATE con valores:', {
      nombreRol,
      descripcion,
      privilegio,
      estatus,
      usuarioauditoria,
      id
    });

    // Actualizar rol (sin idnegocio)
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE tblposcrumenwebrolesdeusuario 
       SET nombreRol = ?, descripcion = ?, privilegio = ?, estatus = ?, 
           usuarioauditoria = ?, fehamodificacionauditoria = NOW()
       WHERE idRol = ?`,
      [nombreRol, descripcion, privilegio, estatus, usuarioauditoria, id]
    );

    console.log('✅ Rol actualizado, resultado:', result);

    res.json({
      success: true,
      message: 'Rol actualizado exitosamente',
      data: {
        idRol: id,
        nombreRol,
        descripcion,
        privilegio,
        estatus,
      },
    });
  } catch (error) {
    console.error('❌ Error al actualizar rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar rol',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

// ========== ELIMINAR ROL (SOFT DELETE) ==========
export const eliminarRol = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const [rolExistente] = await pool.execute<RowDataPacket[]>(
      'SELECT idRol FROM tblposcrumenwebrolesdeusuario WHERE idRol = ?',
      [id]
    );

    if (rolExistente.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Rol no encontrado',
      });
      return;
    }

    // Soft delete: cambiar estatus a 0
    await pool.execute(
      'UPDATE tblposcrumenwebrolesdeusuario SET estatus = 0, fehamodificacionauditoria = NOW() WHERE idRol = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Rol eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar rol',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

// ========== CAMBIAR ESTATUS DEL ROL ==========
export const cambiarEstatusRol = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { estatus } = req.body;

  try {
    const [rolExistente] = await pool.execute<RowDataPacket[]>(
      'SELECT idRol FROM tblposcrumenwebrolesdeusuario WHERE idRol = ?',
      [id]
    );

    if (rolExistente.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Rol no encontrado',
      });
      return;
    }

    await pool.execute(
      'UPDATE tblposcrumenwebrolesdeusuario SET estatus = ?, fehamodificacionauditoria = NOW() WHERE idRol = ?',
      [estatus, id]
    );

    res.json({
      success: true,
      message: `Rol ${estatus === 1 ? 'activado' : 'desactivado'} exitosamente`,
    });
  } catch (error) {
    console.error('Error al cambiar estatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estatus del rol',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};

// ========== VALIDAR NOMBRE ÚNICO ==========
export const validarNombreUnico = async (req: Request, res: Response): Promise<void> => {
  const { nombreRol, idRol } = req.body;

  try {
    let query = 'SELECT idRol FROM tblposcrumenwebrolesdeusuario WHERE nombreRol = ?';
    const params: (string | number)[] = [nombreRol];

    if (idRol) {
      query += ' AND idRol != ?';
      params.push(idRol);
    }

    const [roles] = await pool.execute<RowDataPacket[]>(query, params);

    res.json({
      success: true,
      disponible: roles.length === 0,
    });
  } catch (error) {
    console.error('Error al validar nombre:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar nombre',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};
