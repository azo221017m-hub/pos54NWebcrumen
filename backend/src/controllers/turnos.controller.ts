import { Request, Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';
import { getMexicoTimeComponents } from '../utils/dateTime';

// Interface para Turno
interface Turno extends RowDataPacket {
  idturno: number;
  numeroturno: number;
  fechainicioturno: Date;
  fechafinturno: Date | null;
  estatusturno: string;
  claveturno: string;
  usuarioturno: string;
  idnegocio: number;
  metaturno?: number | null;
  totalventas?: number;
}

// Función auxiliar para generar claveturno
// Formato: [AAMMDD]+[idnegocio]+[idusuario]+[HHMMSS]
// Usa hora del servidor en zona horaria de México
const generarClaveTurno = (idusuario: number, idnegocio: number): string => {
  const time = getMexicoTimeComponents();
  const aa = time.year.slice(-2); // Últimos 2 dígitos del año
  const mm = time.month;
  const dd = time.day;
  const HH = time.hours;
  const MM = time.minutes;
  const SS = time.seconds;
  
  return `${aa}${mm}${dd}${idnegocio}${idusuario}${HH}${MM}${SS}`;
};

// Obtener todos los turnos de un negocio
export const obtenerTurnos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Usar idnegocio del usuario autenticado para seguridad
    const idnegocio = req.user?.idNegocio;
    
    if (!idnegocio) {
      res.status(401).json({ 
        message: 'Usuario no autenticado o sin negocio asignado'
      });
      return;
    }
    
    console.log('Obteniendo turnos del negocio:', idnegocio);
    
    const [rows] = await pool.query<Turno[]>(
      `SELECT 
        t.idturno,
        t.numeroturno,
        t.fechainicioturno,
        t.fechafinturno,
        t.estatusturno,
        t.claveturno,
        t.usuarioturno,
        t.idnegocio,
        t.metaturno,
        COALESCE(SUM(CASE 
          WHEN v.estatusdepago = 'PAGADO' THEN v.totaldeventa 
          ELSE 0 
        END), 0) as totalventas
      FROM tblposcrumenwebturnos t
      LEFT JOIN tblposcrumenwebventas v ON t.claveturno = v.claveturno
      WHERE t.idnegocio = ?
      GROUP BY t.idturno, t.numeroturno, t.fechainicioturno, t.fechafinturno, 
               t.estatusturno, t.claveturno, t.usuarioturno, t.idnegocio, t.metaturno
      ORDER BY t.idturno DESC`,
      [idnegocio]
    );

    console.log(`Turnos encontrados: ${rows.length}`);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener turnos:', error);
    res.status(500).json({ 
      message: 'Error al obtener los turnos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Obtener un turno por ID
export const obtenerTurnoPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idturno } = req.params;
    
    console.log('Obteniendo turno con ID:', idturno);
    
    const [rows] = await pool.query<Turno[]>(
      `SELECT 
        idturno,
        numeroturno,
        fechainicioturno,
        fechafinturno,
        estatusturno,
        claveturno,
        usuarioturno,
        idnegocio,
        metaturno
      FROM tblposcrumenwebturnos
      WHERE idturno = ?`,
      [idturno]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'Turno no encontrado' });
      return;
    }

    console.log('Turno encontrado:', rows[0].claveturno);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener turno:', error);
    res.status(500).json({ 
      message: 'Error al obtener el turno',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Crear un nuevo turno (iniciar turno)
export const crearTurno = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const idnegocio = req.user?.idNegocio;
    const idusuario = req.user?.id;
    const usuarioturno = req.user?.alias;
    const { metaturno, fondoCaja } = req.body; // Optional: objetivo de venta y fondo de caja

    if (!idnegocio || !idusuario || !usuarioturno) {
      res.status(401).json({ 
        message: 'Usuario no autenticado o datos incompletos'
      });
      return;
    }

    console.log('Creando nuevo turno para usuario:', usuarioturno);

    // Verificar si ya hay un turno abierto para este usuario/negocio
    // Según los requerimientos: validar que NO EXISTA registro con usuarioturno = alias del usuario
    // que hizo login y idnegocio = idnegocio del usuario con estatusturno='ABIERTO'
    const [turnosAbiertos] = await connection.query<Turno[]>(
      `SELECT idturno FROM tblposcrumenwebturnos 
       WHERE usuarioturno = ? AND idnegocio = ? AND estatusturno = 'abierto'
       LIMIT 1`,
      [usuarioturno, idnegocio]
    );

    if (turnosAbiertos.length > 0) {
      connection.release();
      res.status(400).json({ 
        message: 'Ya existe un turno abierto para este usuario en este negocio. Cierra el turno actual antes de iniciar uno nuevo.'
      });
      return;
    }

    // Iniciar transacción
    await connection.beginTransaction();

    // Generar claveturno antes de insertar
    const claveturno = generarClaveTurno(idusuario, idnegocio);

    // Insertar el nuevo turno en tblposcrumenwebturnos
    // Nota: numeroturno se actualiza después porque debe ser igual a idturno (auto-increment)
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebturnos (
        numeroturno,
        fechainicioturno,
        fechafinturno,
        estatusturno,
        claveturno,
        usuarioturno,
        idnegocio,
        metaturno
      ) VALUES (0, NOW(), NULL, 'abierto', ?, ?, ?, ?)`,
      [claveturno, usuarioturno, idnegocio, metaturno || null]
    );

    const idturno = result.insertId;

    // Actualizar numeroturno = idturno (consecutivo según requerimientos)
    const numeroturno = idturno;
    await connection.query(
      `UPDATE tblposcrumenwebturnos 
       SET numeroturno = ?
       WHERE idturno = ?`,
      [numeroturno, idturno]
    );

    // Crear registro en tblposcrumenwebventas como MOVIMIENTO inicial del turno
    // Nota: folioventa se actualiza después porque depende de idventa (auto-increment)
    // fondoCaja se almacena en subtotal y totaldeventa según los requerimientos
    // Validar que fondoCaja sea un número válido, si no, usar 0.00
    const fondoCajaValue = fondoCaja && !isNaN(parseFloat(fondoCaja)) ? parseFloat(fondoCaja) : 0.00;
    const [ventaResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO tblposcrumenwebventas (
        tipodeventa,
        folioventa,
        estadodeventa,
        fechadeventa,
        fechapreparacion,
        fechaenvio,
        fechaentrega,
        subtotal,
        descuentos,
        impuestos,
        totaldeventa,
        cliente,
        direcciondeentrega,
        contactodeentrega,
        telefonodeentrega,
        propinadeventa,
        formadepago,
        estatusdepago,
        tiempototaldeventa,
        claveturno,
        idnegocio,
        usuarioauditoria,
        fechamodificacionauditoria
      ) VALUES (
        'MOVIMIENTO',
        '',
        'COBRADO',
        NOW(),
        NULL,
        NULL,
        NULL,
        ?,
        0,
        0,
        ?,
        'SISTEMA',
        NULL,
        NULL,
        NULL,
        0,
        'EFECTIVO',
        'PAGADO',
        NULL,
        ?,
        ?,
        ?,
        NOW()
      )`,
      [fondoCajaValue, fondoCajaValue, claveturno, idnegocio, usuarioturno]
    );

    const idventa = ventaResult.insertId;

    // Generar HHMMSS para el folio usando hora del servidor en zona horaria de México
    const time = getMexicoTimeComponents();
    const HHMMSS = `${time.hours}${time.minutes}${time.seconds}`;

    // Actualizar folioventa con formato: claveturno+HHMMSS+[primer letra del tipo de venta]+idventa
    // Para MOVIMIENTO, usamos 'M'
    const folioventa = `${claveturno}${HHMMSS}M${idventa}`;
    await connection.query(
      `UPDATE tblposcrumenwebventas 
       SET folioventa = ?
       WHERE idventa = ?`,
      [folioventa, idventa]
    );

    // Commit de la transacción
    await connection.commit();
    connection.release();

    console.log('Turno creado con ID:', idturno, 'y venta inicial con ID:', idventa);
    res.status(201).json({ 
      message: 'Turno iniciado exitosamente',
      idturno,
      numeroturno,
      claveturno,
      idventa,
      folioventa
    });
  } catch (error) {
    // Rollback en caso de error
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error('Error al hacer rollback:', rollbackError);
    }
    connection.release();
    
    console.error('Error al crear turno y venta inicial:', error);
    
    // Determinar mensaje de error más específico
    let errorMessage = 'Error al iniciar el turno. ';
    if (error instanceof Error) {
      if (error.message.includes('Duplicate entry')) {
        errorMessage += 'Ya existe un turno con estos datos.';
      } else if (error.message.includes('claveturno')) {
        errorMessage += 'Error al generar la clave del turno.';
      } else if (error.message.includes('ventas')) {
        errorMessage += 'Error al crear el registro de venta inicial.';
      } else {
        errorMessage += error.message;
      }
    }
    
    res.status(500).json({ 
      message: errorMessage,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Actualizar un turno (cerrar turno)
export const actualizarTurno = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idturno } = req.params;
    const { estatusturno } = req.body;

    console.log('Actualizando turno ID:', idturno, 'a estatus:', estatusturno);

    // Validar que el turno existe
    const [turnoExistente] = await pool.query<Turno[]>(
      'SELECT idturno, estatusturno FROM tblposcrumenwebturnos WHERE idturno = ?',
      [idturno]
    );

    if (turnoExistente.length === 0) {
      res.status(404).json({ message: 'Turno no encontrado' });
      return;
    }

    // Si se está cerrando el turno, actualizar fechafinturno
    if (estatusturno === 'cerrado') {
      await pool.query(
        `UPDATE tblposcrumenwebturnos 
         SET estatusturno = ?, fechafinturno = NOW()
         WHERE idturno = ?`,
        [estatusturno, idturno]
      );
    } else {
      await pool.query(
        `UPDATE tblposcrumenwebturnos 
         SET estatusturno = ?
         WHERE idturno = ?`,
        [estatusturno, idturno]
      );
    }

    console.log('Turno actualizado exitosamente');
    res.json({ message: 'Turno actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar turno:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el turno',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Eliminar un turno
export const eliminarTurno = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idturno } = req.params;

    console.log('Eliminando turno ID:', idturno);

    // Validar que el turno existe
    const [turnoExistente] = await pool.query<Turno[]>(
      'SELECT idturno FROM tblposcrumenwebturnos WHERE idturno = ?',
      [idturno]
    );

    if (turnoExistente.length === 0) {
      res.status(404).json({ message: 'Turno no encontrado' });
      return;
    }

    // Eliminar el turno
    await pool.query('DELETE FROM tblposcrumenwebturnos WHERE idturno = ?', [idturno]);

    console.log('Turno eliminado exitosamente');
    res.json({ message: 'Turno eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar turno:', error);
    res.status(500).json({ 
      message: 'Error al eliminar el turno',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Cerrar turno actual
export const cerrarTurnoActual = async (req: AuthRequest, res: Response): Promise<void> => {
  const connection = await pool.getConnection();
  
  try {
    const idnegocio = req.user?.idNegocio;
    const usuarioauditoria = req.user?.alias;

    if (!idnegocio || !usuarioauditoria) {
      res.status(401).json({ 
        message: 'Usuario no autenticado o sin negocio asignado'
      });
      return;
    }

    // Extraer datos del cuerpo de la petición
    const { 
      retiroFondo, 
      totalArqueo, 
      detalleDenominaciones, 
      estatusCierre 
    } = req.body;

    console.log('Cerrando turno actual del negocio:', idnegocio);
    console.log('Estatus de cierre:', estatusCierre);

    await connection.beginTransaction();

    // Buscar turno abierto
    const [turnosAbiertos] = await connection.query<Turno[]>(
      `SELECT idturno, claveturno FROM tblposcrumenwebturnos 
       WHERE idnegocio = ? AND estatusturno = 'abierto'
       LIMIT 1`,
      [idnegocio]
    );

    if (turnosAbiertos.length === 0) {
      await connection.rollback();
      res.status(404).json({ message: 'No hay turno abierto para cerrar' });
      return;
    }

    const turno = turnosAbiertos[0];
    const idturno = turno.idturno;
    const claveturno = turno.claveturno;

    // Si el estatus de cierre es 'sin_novedades', insertar registro MOVIMIENTO
    if (estatusCierre === 'sin_novedades' && retiroFondo && retiroFondo > 0) {
      console.log('Insertando venta MOVIMIENTO por retiro de fondo:', retiroFondo);

      // Insertar venta con folioventa vacío (se actualizará después)
      const [ventaResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO tblposcrumenwebventas (
          tipodeventa, folioventa, estadodeventa, fechadeventa, 
          fechaprogramadaentrega, fechapreparacion, fechaenvio, fechaentrega,
          subtotal, descuentos, impuestos, 
          totaldeventa, cliente, direcciondeentrega, contactodeentrega, 
          telefonodeentrega, propinadeventa, formadepago, importedepago, estatusdepago, 
          tiempototaldeventa, claveturno, idnegocio, usuarioauditoria, fechamodificacionauditoria, detalledescuento
        ) VALUES (?, ?, ?, NOW(), NULL, NULL, NULL, NULL, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, ?, ?, ?, NULL, ?, ?, ?, NOW(), NULL)`,
        [
          'MOVIMIENTO',      // tipodeventa
          '',                // folioventa (se actualiza después)
          'COBRADO',         // estadodeventa
          retiroFondo,       // subtotal
          0,                 // descuentos
          0,                 // impuestos
          retiroFondo,       // totaldeventa
          'EFECTIVO',        // formadepago
          0,                 // importedepago
          'PAGADO',          // estatusdepago
          claveturno,        // claveturno
          idnegocio,         // idnegocio
          usuarioauditoria   // usuarioauditoria
        ]
      );

      const ventaId = ventaResult.insertId;

      // Generar HHMMSS para el folio usando hora del servidor en zona horaria de México
      const time = getMexicoTimeComponents();
      const HHMMSS = `${time.hours}${time.minutes}${time.seconds}`;

      // Generar folioventa con formato: claveturno+HHMMSS+M+idventa
      const folioFinal = `${claveturno}${HHMMSS}M${ventaId}`;
      
      await connection.execute(
        `UPDATE tblposcrumenwebventas 
         SET folioventa = ?
         WHERE idventa = ?`,
        [folioFinal, ventaId]
      );

      console.log('Venta MOVIMIENTO creada con folio:', folioFinal);
    }

    // Cerrar el turno
    await connection.query(
      `UPDATE tblposcrumenwebturnos 
       SET estatusturno = 'cerrado', fechafinturno = NOW()
       WHERE idturno = ?`,
      [idturno]
    );

    await connection.commit();

    console.log('Turno cerrado exitosamente');
    res.json({ 
      message: 'Turno cerrado exitosamente',
      idturno
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al cerrar turno:', error);
    res.status(500).json({ 
      message: 'Error al cerrar el turno',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    connection.release();
  }
};

// Verificar si hay comandas abiertas en un turno
export const verificarComandasAbiertas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { claveturno } = req.params;
    const idnegocio = req.user?.idNegocio;
    
    if (!idnegocio) {
      res.status(401).json({ 
        message: 'Usuario no autenticado o sin negocio asignado'
      });
      return;
    }
    
    if (!claveturno) {
      res.status(400).json({ 
        message: 'Clave de turno es requerida'
      });
      return;
    }
    
    console.log('Verificando comandas abiertas para turno:', claveturno);
    
    // Count comandas with estadodeventa = 'ORDENADO' or 'EN_CAMINO'
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as comandasAbiertas
       FROM tblposcrumenwebventas
       WHERE claveturno = ? 
       AND idnegocio = ?
       AND estadodeventa IN ('ORDENADO', 'EN_CAMINO')`,
      [claveturno, idnegocio]
    );
    
    const comandasAbiertas = rows[0]?.comandasAbiertas || 0;
    
    console.log(`Comandas abiertas encontradas: ${comandasAbiertas}`);
    
    res.json({
      success: true,
      comandasAbiertas: comandasAbiertas,
      puedeCerrar: comandasAbiertas === 0
    });
  } catch (error) {
    console.error('Error al verificar comandas abiertas:', error);
    res.status(500).json({ 
      message: 'Error al verificar comandas abiertas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
