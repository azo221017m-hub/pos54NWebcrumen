import { Request, Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';

// Interface para Descuento
interface Descuento extends RowDataPacket {
  id_descuento: number;
  nombre: string;
  tipodescuento: string;
  valor: number;
  estatusdescuento: string;
  requiereautorizacion: 'SI' | 'NO';
  usuariocreo?: string;
  fechacreo?: Date;
  usuariomodifico?: string | null;
  fechamodifico?: Date | null;
  idnegocio: number;
}

// Obtener todos los descuentos de un negocio
export const obtenerDescuentos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idnegocio } = req.params;
    
    console.log('Obteniendo descuentos del negocio:', idnegocio);
    
    const [rows] = await pool.query<Descuento[]>(
      `SELECT 
        id_descuento,
        nombre,
        tipodescuento,
        valor,
        estatusdescuento,
        requiereautorizacion,
        idnegocio
      FROM tblposcrumenwebdescuentos
      WHERE idnegocio = ?
      ORDER BY nombre ASC`,
      [idnegocio]
    );

    console.log(`Descuentos encontrados: ${rows.length}`);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener descuentos:', error);
    res.status(500).json({ 
      message: 'Error al obtener los descuentos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Obtener un descuento por ID
export const obtenerDescuentoPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_descuento } = req.params;
    
    console.log('Obteniendo descuento con ID:', id_descuento);
    
    const [rows] = await pool.query<Descuento[]>(
      `SELECT 
        id_descuento,
        nombre,
        tipodescuento,
        valor,
        estatusdescuento,
        requiereautorizacion,
        idnegocio
      FROM tblposcrumenwebdescuentos
      WHERE id_descuento = ?`,
      [id_descuento]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'Descuento no encontrado' });
      return;
    }

    console.log('Descuento encontrado:', rows[0].nombre);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener descuento:', error);
    res.status(500).json({ 
      message: 'Error al obtener el descuento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Crear nuevo descuento
export const crearDescuento = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      nombre,
      tipodescuento,
      valor,
      estatusdescuento,
      requiereautorizacion
    } = req.body;

    // Obtener idnegocio del usuario autenticado
    const idnegocio = req.user?.idNegocio;

    console.log('Creando nuevo descuento:', nombre);

    // Validar campos requeridos
    if (!nombre || !tipodescuento || valor === undefined || !estatusdescuento || !requiereautorizacion || !idnegocio) {
      res.status(400).json({ 
        message: 'Faltan campos requeridos o el usuario no está autenticado',
        campos: { nombre, tipodescuento, valor, estatusdescuento, requiereautorizacion, idnegocio }
      });
      return;
    }

    // Validar ENUM requiereautorizacion
    const autorizacionValida = ['SI', 'NO'];
    if (!autorizacionValida.includes(requiereautorizacion)) {
      res.status(400).json({ 
        message: 'Valor de requiereautorizacion inválido',
        valoresPermitidos: autorizacionValida
      });
      return;
    }

    // Validar que el valor sea positivo
    if (valor < 0) {
      res.status(400).json({ 
        message: 'El valor del descuento debe ser positivo'
      });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebdescuentos (
        nombre,
        tipodescuento,
        valor,
        estatusdescuento,
        requiereautorizacion,
        idnegocio
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        tipodescuento,
        valor,
        estatusdescuento,
        requiereautorizacion,
        idnegocio
      ]
    );

    console.log('Descuento creado con ID:', result.insertId);
    res.status(201).json({
      message: 'Descuento creado exitosamente',
      id_descuento: result.insertId
    });
  } catch (error) {
    console.error('Error al crear descuento:', error);
    res.status(500).json({ 
      message: 'Error al crear el descuento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Actualizar descuento
export const actualizarDescuento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_descuento } = req.params;
    const {
      nombre,
      tipodescuento,
      valor,
      estatusdescuento,
      requiereautorizacion
    } = req.body;

    console.log('Actualizando descuento ID:', id_descuento);

    // Validar que el descuento existe
    const [descuentoExistente] = await pool.query<Descuento[]>(
      'SELECT id_descuento FROM tblposcrumenwebdescuentos WHERE id_descuento = ?',
      [id_descuento]
    );

    if (descuentoExistente.length === 0) {
      res.status(404).json({ message: 'Descuento no encontrado' });
      return;
    }

    // Validar ENUM requiereautorizacion si se proporciona
    if (requiereautorizacion) {
      const autorizacionValida = ['SI', 'NO'];
      if (!autorizacionValida.includes(requiereautorizacion)) {
        res.status(400).json({ 
          message: 'Valor de requiereautorizacion inválido',
          valoresPermitidos: autorizacionValida
        });
        return;
      }
    }

    // Validar que el valor sea positivo
    if (valor !== undefined && valor < 0) {
      res.status(400).json({ 
        message: 'El valor del descuento debe ser positivo'
      });
      return;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebdescuentos 
       SET nombre = ?,
           tipodescuento = ?,
           valor = ?,
           estatusdescuento = ?,
           requiereautorizacion = ?
       WHERE id_descuento = ?`,
      [
        nombre,
        tipodescuento,
        valor,
        estatusdescuento,
        requiereautorizacion,
        id_descuento
      ]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'No se pudo actualizar el descuento' });
      return;
    }

    console.log('Descuento actualizado exitosamente');
    res.json({ message: 'Descuento actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar descuento:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el descuento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Eliminar descuento
export const eliminarDescuento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_descuento } = req.params;
    
    console.log('Eliminando descuento ID:', id_descuento);

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM tblposcrumenwebdescuentos WHERE id_descuento = ?',
      [id_descuento]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Descuento no encontrado' });
      return;
    }

    console.log('Descuento eliminado exitosamente');
    res.json({ message: 'Descuento eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar descuento:', error);
    res.status(500).json({ 
      message: 'Error al eliminar el descuento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Validar que el nombre del descuento sea único en el negocio
export const validarNombreDescuentoUnico = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, idnegocio, id_descuento } = req.query;

    console.log('Validando nombre de descuento único:', nombre);

    let query = 'SELECT id_descuento FROM tblposcrumenwebdescuentos WHERE nombre = ? AND idnegocio = ?';
    const params: Array<string | number> = [nombre as string, idnegocio as string];

    // Si se proporciona id_descuento, excluirlo de la validación (para updates)
    if (id_descuento) {
      query += ' AND id_descuento != ?';
      params.push(id_descuento as string);
    }

    const [rows] = await pool.query<Descuento[]>(query, params);

    res.json({ esUnico: rows.length === 0 });
  } catch (error) {
    console.error('Error al validar nombre de descuento:', error);
    res.status(500).json({ 
      message: 'Error al validar el nombre del descuento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Cambiar estatus de descuento
export const cambiarEstatusDescuento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id_descuento } = req.params;
    const { estatusdescuento, UsuarioModifico } = req.body;

    console.log('Cambiando estatus de descuento ID:', id_descuento, 'a:', estatusdescuento);

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE tblposcrumenwebdescuentos 
       SET estatusdescuento = ?,
           UsuarioModifico = ?,
           FechaModifico = NOW()
       WHERE id_descuento = ?`,
      [estatusdescuento, UsuarioModifico, id_descuento]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Descuento no encontrado' });
      return;
    }

    console.log('Estatus de descuento actualizado exitosamente');
    res.json({ message: 'Estatus actualizado exitosamente' });
  } catch (error) {
    console.error('Error al cambiar estatus de descuento:', error);
    res.status(500).json({ 
      message: 'Error al cambiar el estatus del descuento',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
