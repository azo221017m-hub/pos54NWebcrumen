import { Request, Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';

// Interface para Mesa
interface Mesa extends RowDataPacket {
  idmesa: number;
  nombremesa: string;
  numeromesa: number;
  cantcomensales: number;
  estatusmesa: 'DISPONIBLE' | 'OCUPADA' | 'RESERVADA';
  tiempodeinicio: Date | null;
  tiempoactual: string | null;
  estatustiempo: 'EN_CURSO' | 'DEMORA' | 'INACTIVA';
  usuariocreo?: string;
  fechacreo?: Date;
  usuariomodifico?: string | null;
  fechamodifico?: Date | null;
  idnegocio: number;
}

// Obtener todas las mesas de un negocio
export const obtenerMesas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Usar idnegocio del usuario autenticado para seguridad
    const idnegocio = req.user?.idNegocio;
    
    if (!idnegocio) {
      res.status(401).json({ 
        message: 'Usuario no autenticado o sin negocio asignado'
      });
      return;
    }
    
    console.log('Obteniendo mesas del negocio:', idnegocio);
    
    const [rows] = await pool.query<Mesa[]>(
      `SELECT 
        idmesa,
        nombremesa,
        numeromesa,
        cantcomensales,
        estatusmesa,
        tiempodeinicio,
        tiempoactual,
        estatustiempo,
        idnegocio
      FROM tblposcrumenwebmesas
      WHERE idnegocio = ?
      ORDER BY numeromesa ASC`,
      [idnegocio]
    );

    console.log(`Mesas encontradas: ${rows.length}`);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener mesas:', error);
    res.status(500).json({ 
      message: 'Error al obtener las mesas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Obtener una mesa por ID
export const obtenerMesaPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idmesa } = req.params;
    
    console.log('Obteniendo mesa con ID:', idmesa);
    
    const [rows] = await pool.query<Mesa[]>(
      `SELECT 
        idmesa,
        nombremesa,
        numeromesa,
        cantcomensales,
        estatusmesa,
        tiempodeinicio,
        tiempoactual,
        estatustiempo,
        idnegocio
      FROM tblposcrumenwebmesas
      WHERE idmesa = ?`,
      [idmesa]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'Mesa no encontrada' });
      return;
    }

    console.log('Mesa encontrada:', rows[0].nombremesa);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener mesa:', error);
    res.status(500).json({ 
      message: 'Error al obtener la mesa',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Crear nueva mesa
export const crearMesa = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      nombremesa,
      numeromesa,
      cantcomensales,
      estatusmesa,
      tiempodeinicio,
      tiempoactual,
      estatustiempo
    } = req.body;

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    console.log('Creando nueva mesa:', nombremesa);

    // Validar campos requeridos
    if (!nombremesa || !numeromesa || !cantcomensales || !estatusmesa || !estatustiempo || !idnegocio) {
      res.status(400).json({ 
        message: 'Faltan campos requeridos o el usuario no está autenticado',
        campos: { nombremesa, numeromesa, cantcomensales, estatusmesa, estatustiempo, idnegocio }
      });
      return;
    }

    // Validar ENUM estatusmesa
    const estatusValidosMesa = ['DISPONIBLE', 'OCUPADA', 'RESERVADA'];
    if (!estatusValidosMesa.includes(estatusmesa)) {
      res.status(400).json({ 
        message: 'Estatus de mesa inválido',
        valoresPermitidos: estatusValidosMesa
      });
      return;
    }

    // Validar ENUM estatustiempo
    const estatusValidosTiempo = ['EN_CURSO', 'DEMORA', 'INACTIVA'];
    if (!estatusValidosTiempo.includes(estatustiempo)) {
      res.status(400).json({ 
        message: 'Estatus de tiempo inválido',
        valoresPermitidos: estatusValidosTiempo
      });
      return;
    }

    // Validar que no exista una mesa con el mismo nombre en el mismo negocio
    const [existingMesas] = await pool.query<Mesa[]>(
      'SELECT idmesa FROM tblposcrumenwebmesas WHERE nombremesa = ? AND idnegocio = ?',
      [nombremesa, idnegocio]
    );

    if (existingMesas.length > 0) {
      res.status(400).json({ 
        message: 'Ya existe una mesa con ese nombre en este negocio'
      });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebmesas (
        nombremesa,
        numeromesa,
        cantcomensales,
        estatusmesa,
        tiempodeinicio,
        tiempoactual,
        estatustiempo,
        idnegocio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombremesa,
        numeromesa,
        cantcomensales,
        estatusmesa,
        tiempodeinicio || null,
        tiempoactual || null,
        estatustiempo,
        idnegocio
      ]
    );

    console.log('Mesa creada con ID:', result.insertId);
    res.status(201).json({
      message: 'Mesa creada exitosamente',
      idmesa: result.insertId
    });
  } catch (error) {
    console.error('Error al crear mesa:', error);
    res.status(500).json({ 
      message: 'Error al crear la mesa',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Actualizar mesa
export const actualizarMesa = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { idmesa } = req.params;
    const {
      nombremesa,
      numeromesa,
      cantcomensales,
      estatusmesa,
      tiempodeinicio,
      tiempoactual,
      estatustiempo
    } = req.body;

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    if (!idnegocio) {
      res.status(401).json({ message: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }

    console.log('Actualizando mesa ID:', idmesa);

    // Validar que la mesa existe y pertenece al negocio del usuario
    const [mesaExistente] = await pool.query<Mesa[]>(
      'SELECT idmesa, idnegocio FROM tblposcrumenwebmesas WHERE idmesa = ?',
      [idmesa]
    );

    if (mesaExistente.length === 0) {
      res.status(404).json({ message: 'Mesa no encontrada' });
      return;
    }

    // Validar que la mesa pertenece al negocio del usuario autenticado
    if (mesaExistente[0].idnegocio !== idnegocio) {
      res.status(403).json({ message: 'No tienes permiso para modificar esta mesa' });
      return;
    }

    // Validar ENUM estatusmesa si se proporciona
    if (estatusmesa) {
      const estatusValidosMesa = ['DISPONIBLE', 'OCUPADA', 'RESERVADA'];
      if (!estatusValidosMesa.includes(estatusmesa)) {
        res.status(400).json({ 
          message: 'Estatus de mesa inválido',
          valoresPermitidos: estatusValidosMesa
        });
        return;
      }
    }

    // Validar ENUM estatustiempo si se proporciona
    if (estatustiempo) {
      const estatusValidosTiempo = ['EN_CURSO', 'DEMORA', 'INACTIVA'];
      if (!estatusValidosTiempo.includes(estatustiempo)) {
        res.status(400).json({ 
          message: 'Estatus de tiempo inválido',
          valoresPermitidos: estatusValidosTiempo
        });
        return;
      }
    }

    // Validar que no exista otra mesa con el mismo nombre en el mismo negocio
    if (nombremesa) {
      const [existingMesas] = await pool.query<Mesa[]>(
        'SELECT idmesa FROM tblposcrumenwebmesas WHERE nombremesa = ? AND idnegocio = ? AND idmesa != ?',
        [nombremesa, idnegocio, idmesa]
      );

      if (existingMesas.length > 0) {
        res.status(400).json({ 
          message: 'Ya existe otra mesa con ese nombre en este negocio'
        });
        return;
      }
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebmesas 
       SET nombremesa = ?,
           numeromesa = ?,
           cantcomensales = ?,
           estatusmesa = ?,
           tiempodeinicio = ?,
           tiempoactual = ?,
           estatustiempo = ?
       WHERE idmesa = ?`,
      [
        nombremesa,
        numeromesa,
        cantcomensales,
        estatusmesa,
        tiempodeinicio || null,
        tiempoactual || null,
        estatustiempo,
        idmesa
      ]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'No se pudo actualizar la mesa' });
      return;
    }

    console.log('Mesa actualizada exitosamente');
    res.json({ message: 'Mesa actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar mesa:', error);
    res.status(500).json({ 
      message: 'Error al actualizar la mesa',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Eliminar mesa
export const eliminarMesa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idmesa } = req.params;
    
    console.log('Eliminando mesa ID:', idmesa);

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM tblposcrumenwebmesas WHERE idmesa = ?',
      [idmesa]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Mesa no encontrada' });
      return;
    }

    console.log('Mesa eliminada exitosamente');
    res.json({ message: 'Mesa eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar mesa:', error);
    res.status(500).json({ 
      message: 'Error al eliminar la mesa',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Validar que el número de mesa sea único en el negocio
export const validarNumeroMesaUnico = async (req: Request, res: Response): Promise<void> => {
  try {
    const { numeromesa, idnegocio, idmesa } = req.query;

    console.log('Validando número de mesa único:', numeromesa);

    let query = 'SELECT idmesa FROM tblposcrumenwebmesas WHERE numeromesa = ? AND idnegocio = ?';
    const params: Array<string | number> = [numeromesa as string, idnegocio as string];

    // Si se proporciona idmesa, excluirlo de la validación (para updates)
    if (idmesa) {
      query += ' AND idmesa != ?';
      params.push(idmesa as string);
    }

    const [rows] = await pool.query<Mesa[]>(query, params);

    res.json({ esUnico: rows.length === 0 });
  } catch (error) {
    console.error('Error al validar número de mesa:', error);
    res.status(500).json({ 
      message: 'Error al validar el número de mesa',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Cambiar estatus de mesa (DISPONIBLE/OCUPADA/RESERVADA)
export const cambiarEstatusMesa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idmesa } = req.params;
    const { estatusmesa, UsuarioModifico } = req.body;

    console.log('Cambiando estatus de mesa ID:', idmesa, 'a:', estatusmesa);

    // Validar ENUM
    const estatusValidos = ['DISPONIBLE', 'OCUPADA', 'RESERVADA'];
    if (!estatusValidos.includes(estatusmesa)) {
      res.status(400).json({ 
        message: 'Estatus inválido',
        valoresPermitidos: estatusValidos
      });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebmesas 
       SET estatusmesa = ?,
           UsuarioModifico = ?,
           FechaModifico = NOW()
       WHERE idmesa = ?`,
      [estatusmesa, UsuarioModifico, idmesa]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Mesa no encontrada' });
      return;
    }

    console.log('Estatus de mesa actualizado exitosamente');
    res.json({ message: 'Estatus actualizado exitosamente' });
  } catch (error) {
    console.error('Error al cambiar estatus de mesa:', error);
    res.status(500).json({ 
      message: 'Error al cambiar el estatus de la mesa',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
