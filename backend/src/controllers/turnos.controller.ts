import { Request, Response } from 'express';
import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { AuthRequest } from '../middlewares/auth';
import { formatMySQLDateTime, getMexicoTimeComponents } from '../utils/dateTime';
import { websocketService } from '../services/websocket.service';

// Constantes
const REFERENCIA_FONDO_CAJA = 'FONDO de CAJA';

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

interface ProductoVendidoTurno extends RowDataPacket {
  nombreproducto: string;
  cantidadtotal: number;
  totalproducto: number;
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

/**
 * Helper function to get claveturno from the open turno of a user.
 * Exported for use in related controllers that need to reference open shifts.
 * 
 * @param usuarioturno - The username/alias of the user
 * @param idnegocio - The business ID
 * @returns The claveturno of the open shift, or null if none exists
 */
export const obtenerClaveTurnoAbierto = async (usuarioturno: string, idnegocio: number): Promise<string | null> => {
  const [turnosAbiertos] = await pool.query<RowDataPacket[]>(
    `SELECT claveturno FROM tblposcrumenwebturnos 
     WHERE usuarioturno = ? AND idnegocio = ? AND estatusturno = 'abierto'
     LIMIT 1`,
    [usuarioturno, idnegocio]
  );
  
  return turnosAbiertos.length > 0 ? turnosAbiertos[0].claveturno : null;
};

/**
 * Helper function to get claveturno from the open turno of a negocio.
 * Returns the most recently opened active turno for the business.
 * Used for auto-populating claveturno in GASTOS and COMPRAS operations.
 *
 * @param idnegocio - The business ID
 * @returns The claveturno of the open shift, or null if none exists
 */
export const obtenerClaveTurnoAbiertoByNegocio = async (idnegocio: number): Promise<string | null> => {
  const [turnosAbiertos] = await pool.query<RowDataPacket[]>(
    `SELECT claveturno FROM tblposcrumenwebturnos 
     WHERE idnegocio = ? AND estatusturno = 'abierto'
     ORDER BY fechainicioturno DESC
     LIMIT 1`,
    [idnegocio]
  );
  
  return turnosAbiertos.length > 0 ? turnosAbiertos[0].claveturno : null;
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

    // Calcular numeroturno ANTES de insertar para evitar race condition
    // Usamos SELECT FOR UPDATE para bloquear las filas y prevenir lecturas concurrentes
    const [countResult] = await connection.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM tblposcrumenwebturnos WHERE idnegocio = ? FOR UPDATE`,
      [idnegocio]
    );
    const numeroturno = (countResult[0]?.count || 0) + 1;

    // Generar claveturno antes de insertar
    const claveturno = generarClaveTurno(idusuario, idnegocio);

    // Timestamp de negocio en UTC-6 para persistencia consistente
    const fechaOperacionUtc6 = formatMySQLDateTime();

    // Insertar el nuevo turno en tblposcrumenwebturnos con numeroturno calculado
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
      ) VALUES (?, ?, NULL, 'abierto', ?, ?, ?, ?)`,
      [numeroturno, fechaOperacionUtc6, claveturno, usuarioturno, idnegocio, metaturno || null]
    );

    const idturno = result.insertId;

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
        referencia,
        tiempototaldeventa,
        claveturno,
        idnegocio,
        usuarioauditoria,
        fechamodificacionauditoria
      ) VALUES (
        'MOVIMIENTO',
        '',
        'COBRADO',
        ?,
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
        ?,
        NULL,
        ?,
        ?,
        ?,
        ?
      )`,
      [fechaOperacionUtc6, fondoCajaValue, fondoCajaValue, REFERENCIA_FONDO_CAJA, claveturno, idnegocio, usuarioturno, fechaOperacionUtc6]
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

    websocketService.notifyTurnoUpdate(idnegocio);

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

    // Si se está cerrando el turno, actualizar fechafinturno en UTC-6
    if (estatusturno === 'cerrado') {
      const fechaCierreUtc6 = formatMySQLDateTime();
      await pool.query(
        `UPDATE tblposcrumenwebturnos 
         SET estatusturno = ?, fechafinturno = ?
         WHERE idturno = ?`,
        [estatusturno, fechaCierreUtc6, idturno]
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
  let connection;
  
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
      estatusCierre 
    } = req.body;

    console.log('Cerrando turno actual del negocio:', idnegocio);
    console.log('Estatus de cierre:', estatusCierre);

    // Acquire database connection
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Buscar turno abierto
    const [turnosAbiertos] = await connection.query<Turno[]>(
      `SELECT idturno, claveturno, metaturno FROM tblposcrumenwebturnos 
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
    const metaturno = turno.metaturno;

    // Timestamp de cierre en UTC-6 para operaciones de fin de turno
    const fechaCierreUtc6 = formatMySQLDateTime();

    // Si el estatus de cierre es 'sin_novedades', insertar registro MOVIMIENTO
    if (estatusCierre === 'sin_novedades' && retiroFondo && retiroFondo > 0) {
      console.log('Insertando venta MOVIMIENTO por retiro de fondo:', retiroFondo);

      // Calcular el valor negativo del retiro de fondo según requerimiento
      const retiroFondoNegativo = -retiroFondo;

      // Insertar venta con folioventa vacío (se actualizará después)
      // Nota: importedepago se establece en 0 según especificación, aunque el pago es efectivo
      // Nota: subtotal y totaldeventa deben ser NEGATIVOS para retiros de fondo
      const [ventaResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO tblposcrumenwebventas (
          tipodeventa, folioventa, estadodeventa, fechadeventa, 
          fechaprogramadaentrega, fechapreparacion, fechaenvio, fechaentrega,
          subtotal, descuentos, impuestos, 
          totaldeventa, cliente, direcciondeentrega, contactodeentrega, 
          telefonodeentrega, propinadeventa, formadepago, importedepago, estatusdepago, 
          referencia, tiempototaldeventa, claveturno, idnegocio, usuarioauditoria, fechamodificacionauditoria, detalledescuento
        ) VALUES (?, ?, ?, ?, NULL, NULL, NULL, NULL, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, ?, ?, ?, ?, NULL, ?, ?, ?, ?, NULL)`,
        [
          'MOVIMIENTO',          // tipodeventa
          '',                    // folioventa (se actualiza después)
          'COBRADO',             // estadodeventa
          fechaCierreUtc6,       // fechadeventa
          retiroFondoNegativo,   // subtotal (NEGATIVO)
          0,                     // descuentos
          0,                     // impuestos
          retiroFondoNegativo,   // totaldeventa (NEGATIVO)
          'EFECTIVO',            // formadepago
          0,                     // importedepago (per specification)
          'PAGADO',              // estatusdepago
          REFERENCIA_FONDO_CAJA, // referencia
          claveturno,            // claveturno
          idnegocio,             // idnegocio
          usuarioauditoria,      // usuarioauditoria
          fechaCierreUtc6        // fechamodificacionauditoria
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

    // Calculate logrometa if metaturno is not null or zero
    let logrometa = null;
    if (metaturno !== null && metaturno !== undefined && metaturno > 0) {
      // Get total sales for this shift
      const [salesResult] = await connection.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(totaldeventa), 0) as totalventas 
         FROM tblposcrumenwebventas 
         WHERE claveturno = ? AND estatusdepago = 'PAGADO'`,
        [claveturno]
      );

      const totalventas = Number(salesResult[0]?.totalventas) || 0;
      
      // Calculate achievement percentage: (totalventas / metaturno) * 100
      // Round to 2 decimal places for consistent storage
      logrometa = Math.round((totalventas / metaturno) * 100 * 100) / 100;
      
      console.log('Calculando logrometa:', {
        totalventas,
        metaturno,
        logrometa: logrometa.toFixed(2) + '%'
      });
    }

    // Cerrar el turno
    await connection.query(
      `UPDATE tblposcrumenwebturnos 
       SET estatusturno = 'cerrado', fechafinturno = ?, logrometa = ?
       WHERE idturno = ?`,
      [fechaCierreUtc6, logrometa, idturno]
    );

    const [productosVendidosRows] = await connection.query<ProductoVendidoTurno[]>(
      `SELECT
         d.nombreproducto,
         COALESCE(SUM(d.cantidad), 0) AS cantidadtotal,
         COALESCE(SUM(d.subtotal), 0) AS totalproducto
       FROM tblposcrumenwebdetalleventas d
       INNER JOIN tblposcrumenwebventas v ON d.idventa = v.idventa
       WHERE v.claveturno = ?
         AND v.idnegocio = ?
         AND v.estadodeventa = 'COBRADO'
         AND v.estatusdepago = 'PAGADO'
         AND v.descripcionmov = 'VENTA'
       GROUP BY d.nombreproducto
       ORDER BY COALESCE(NULLIF(TRIM(d.nombreproducto), ''), 'Producto sin nombre') ASC`,
      [claveturno, idnegocio]
    );

    // Ventas agrupadas por forma de pago
    const [ventasPorFormaDePagoRows] = await connection.query<RowDataPacket[]>(
      `SELECT formadepago, COALESCE(SUM(totaldeventa), 0) AS total
       FROM tblposcrumenwebventas
       WHERE claveturno = ? AND idnegocio = ?
         AND estadodeventa = 'COBRADO' AND estatusdepago = 'PAGADO'
         AND descripcionmov = 'VENTA'
       GROUP BY formadepago
       ORDER BY total DESC`,
      [claveturno, idnegocio]
    );

    // Ventas agrupadas por tipo de venta
    const [ventasPorTipoDeVentaRows] = await connection.query<RowDataPacket[]>(
      `SELECT tipodeventa, COALESCE(SUM(totaldeventa), 0) AS total
       FROM tblposcrumenwebventas
       WHERE claveturno = ? AND idnegocio = ?
         AND estadodeventa = 'COBRADO' AND estatusdepago = 'PAGADO'
         AND descripcionmov = 'VENTA'
       GROUP BY tipodeventa
       ORDER BY total DESC`,
      [claveturno, idnegocio]
    );

    // Total ventas donde formadepago = 'EFECTIVO'
    const [totalVentasEfectivoRows] = await connection.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(totaldeventa), 0) AS total
       FROM tblposcrumenwebventas
       WHERE claveturno = ? AND idnegocio = ?
         AND estadodeventa = 'COBRADO' AND estatusdepago = 'PAGADO'
         AND descripcionmov = 'VENTA' AND formadepago = 'EFECTIVO'`,
      [claveturno, idnegocio]
    );

    // Total gastos del turno (referencia = 'GASTO')
    const [totalGastosRows] = await connection.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(ABS(totaldeventa)), 0) AS total
       FROM tblposcrumenwebventas
       WHERE claveturno = ? AND idnegocio = ?
         AND referencia = 'GASTO'`,
      [claveturno, idnegocio]
    );

    // Total venta donde referencia = 'FONDO de CAJA'
    const [totalFondoCajaRows] = await connection.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(ABS(totaldeventa)), 0) AS total
       FROM tblposcrumenwebventas
       WHERE claveturno = ? AND idnegocio = ?
         AND referencia = ?`,
      [claveturno, idnegocio, REFERENCIA_FONDO_CAJA]
    );

    const totalVentasEfectivo = Number(totalVentasEfectivoRows[0]?.total) || 0;
    const totalGastos = Number(totalGastosRows[0]?.total) || 0;
    const totalEfectivo = totalVentasEfectivo - totalGastos;
    const totalFondoCaja = Number(totalFondoCajaRows[0]?.total) || 0;

    await connection.commit();

    console.log('Turno cerrado exitosamente');

    websocketService.notifyTurnoUpdate(idnegocio);

    res.json({ 
      message: 'Turno cerrado exitosamente',
      idturno,
      productosVendidos: productosVendidosRows.map((producto) => {
        const nombreproducto = typeof producto.nombreproducto === 'string' && producto.nombreproducto.trim().length > 0
          ? producto.nombreproducto.trim()
          : 'Producto sin nombre';

        return {
          nombreproducto,
          cantidadtotal: Number(producto.cantidadtotal) || 0,
          totalproducto: Number(producto.totalproducto) || 0
        };
      }),
      ventasPorFormaDePago: ventasPorFormaDePagoRows.map(r => ({
        formadepago: String(r.formadepago || ''),
        total: Number(r.total) || 0
      })),
      ventasPorTipoDeVenta: ventasPorTipoDeVentaRows.map(r => ({
        tipodeventa: String(r.tipodeventa || ''),
        total: Number(r.total) || 0
      })),
      totalEfectivo,
      totalFondoCaja
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error al cerrar turno:', error);
    res.status(500).json({ 
      message: 'Error al cerrar el turno',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  } finally {
    if (connection) {
      connection.release();
    }
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

// Obtener fondo de caja de un turno
export const obtenerFondoCaja = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    const { claveturno } = req.params;
    
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
    
    console.log('Obteniendo fondo de caja para turno:', claveturno);
    
    // Get fondo de caja from tblposcrumenwebventas
    // WHERE tipodeventa='MOVIMIENTO' AND referencia='FONDO de CAJA'
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT totaldeventa as fondoCaja
       FROM tblposcrumenwebventas
       WHERE claveturno = ? 
       AND idnegocio = ?
       AND tipodeventa = 'MOVIMIENTO'
       AND referencia = ?
       LIMIT 1`,
      [claveturno, idnegocio, REFERENCIA_FONDO_CAJA]
    );
    
    const fondoCaja = rows[0]?.fondoCaja || 0;
    
    console.log(`Fondo de caja encontrado: ${fondoCaja}`);
    
    res.json({
      success: true,
      fondoCaja: fondoCaja
    });
  } catch (error) {
    console.error('Error al obtener fondo de caja:', error);
    res.status(500).json({ 
      message: 'Error al obtener fondo de caja',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// GET /api/turnos/turno-abierto - Obtener el turno abierto del usuario actual
export const obtenerTurnoAbierto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    const usuarioturno = req.user?.alias;

    if (!idnegocio || !usuarioturno) {
      res.status(401).json({ 
        message: 'Usuario no autenticado o sin negocio asignado'
      });
      return;
    }

    console.log('Buscando turno abierto para usuario:', usuarioturno, 'negocio:', idnegocio);

    // Buscar turno abierto del usuario actual
    const [turnos] = await pool.query<Turno[]>(
      `SELECT idturno, numeroturno, fechainicioturno, estatusturno, claveturno, usuarioturno, idnegocio, metaturno
       FROM tblposcrumenwebturnos 
       WHERE usuarioturno = ? AND idnegocio = ? AND estatusturno = 'abierto'
       LIMIT 1`,
      [usuarioturno, idnegocio]
    );

    if (turnos.length === 0) {
      res.status(404).json({ 
        success: false,
        message: 'No hay turno abierto para el usuario actual'
      });
      return;
    }

    const turno = turnos[0];
    console.log('Turno abierto encontrado:', turno.claveturno);

    res.json({
      success: true,
      data: turno
    });
  } catch (error) {
    console.error('Error al obtener turno abierto:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener turno abierto',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// GET /api/turnos/corte/:claveturno - Obtener todos los datos para el Ticket de Fin de Turno
export const obtenerCorteFinTurno = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idnegocio = req.user?.idNegocio;
    const usuarioGenerador = req.user?.alias || '';
    const { claveturno } = req.params;

    if (!idnegocio) {
      res.status(401).json({ success: false, message: 'Usuario no autenticado o sin negocio asignado' });
      return;
    }

    if (!claveturno) {
      res.status(400).json({ success: false, message: 'Clave de turno es requerida' });
      return;
    }

    // 1. Turno + Negocio
    const [turnoRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        t.idturno, t.numeroturno, t.claveturno, t.usuarioturno,
        t.fechainicioturno, t.fechafinturno, t.estatusturno, t.metaturno,
        n.nombreNegocio, n.rfcnegocio
       FROM tblposcrumenwebturnos t
       LEFT JOIN tblposcrumenwebnegocio n ON t.idnegocio = n.idNegocio
       WHERE t.claveturno = ? AND t.idnegocio = ?
       LIMIT 1`,
      [claveturno, idnegocio]
    );

    if (turnoRows.length === 0) {
      res.status(404).json({ success: false, message: 'Turno no encontrado' });
      return;
    }

    const turno = turnoRows[0];

    // 2. Fondo inicial (MOVIMIENTO FONDO de CAJA positivo - primer registro)
    const [fondoInicialRows] = await pool.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(totaldeventa), 0) AS fondoInicial
       FROM tblposcrumenwebventas
       WHERE claveturno = ? AND idnegocio = ?
         AND tipodeventa = 'MOVIMIENTO' AND referencia = 'FONDO de CAJA'
         AND totaldeventa > 0`,
      [claveturno, idnegocio]
    );
    const fondoInicial = Number(fondoInicialRows[0]?.fondoInicial) || 0;

    // 3. Retiro de fondo (MOVIMIENTO FONDO de CAJA negativo)
    const [retiroFondoRows] = await pool.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(ABS(totaldeventa)), 0) AS retiroFondo
       FROM tblposcrumenwebventas
       WHERE claveturno = ? AND idnegocio = ?
         AND tipodeventa = 'MOVIMIENTO' AND referencia = 'FONDO de CAJA'
         AND totaldeventa < 0`,
      [claveturno, idnegocio]
    );
    const retiroFondo = Number(retiroFondoRows[0]?.retiroFondo) || 0;

    // 4. Ventas brutas, descuentos, ventas netas (solo ventas reales)
    const [ventasResumenRows] = await pool.query<RowDataPacket[]>(
      `SELECT
         COALESCE(SUM(subtotal + descuentos), 0) AS ventasBrutas,
         COALESCE(SUM(descuentos), 0) AS totalDescuentos,
         COALESCE(SUM(totaldeventa), 0) AS ventasNetas,
         COUNT(*) AS totalTickets
       FROM tblposcrumenwebventas
       WHERE claveturno = ? AND idnegocio = ?
         AND estadodeventa = 'COBRADO' AND estatusdepago = 'PAGADO'
         AND descripcionmov = 'VENTA'`,
      [claveturno, idnegocio]
    );
    const ventasBrutas = Number(ventasResumenRows[0]?.ventasBrutas) || 0;
    const totalDescuentos = Number(ventasResumenRows[0]?.totalDescuentos) || 0;
    const ventasNetas = Number(ventasResumenRows[0]?.ventasNetas) || 0;
    const totalTickets = Number(ventasResumenRows[0]?.totalTickets) || 0;

    // 5. Gastos del turno (referencia = 'GASTO'), solo si existen
    const [gastosRows] = await pool.query<RowDataPacket[]>(
      `SELECT descripcionmov AS concepto, COALESCE(SUM(totaldeventa), 0) AS importe
       FROM tblposcrumenwebventas
       WHERE claveturno = ? AND idnegocio = ?
         AND tipodeventa = 'MOVIMIENTO' AND referencia = 'GASTO'
       GROUP BY descripcionmov
       ORDER BY descripcionmov ASC`,
      [claveturno, idnegocio]
    );
    const [totalGastosRows] = await pool.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(totaldeventa), 0) AS totalGastos
       FROM tblposcrumenwebventas
       WHERE claveturno = ? AND idnegocio = ?
         AND tipodeventa = 'MOVIMIENTO' AND referencia = 'GASTO'`,
      [claveturno, idnegocio]
    );
    const totalGastos = Number(totalGastosRows[0]?.totalGastos) || 0;

    // 6. Ventas por forma de pago (simple + detallepagos para MIXTO)
    const [ventasFormaPagoRows] = await pool.query<RowDataPacket[]>(
      `SELECT formadepago, COALESCE(SUM(totaldeventa), 0) AS total
       FROM tblposcrumenwebventas
       WHERE claveturno = ? AND idnegocio = ?
         AND estadodeventa = 'COBRADO' AND estatusdepago = 'PAGADO'
         AND descripcionmov = 'VENTA' AND formadepago != 'MIXTO'
       GROUP BY formadepago
       ORDER BY total DESC`,
      [claveturno, idnegocio]
    );

    // For MIXTO payments, get details from tblposcrumenwebdetallepagos
    const [mixtoDetalleRows] = await pool.query<RowDataPacket[]>(
      `SELECT dp.formadepagodetalle AS formadepago, COALESCE(SUM(dp.totaldepago), 0) AS total
       FROM tblposcrumenwebdetallepagos dp
       INNER JOIN tblposcrumenwebventas v ON dp.idfolioventa = v.folioventa
       WHERE v.claveturno = ? AND v.idnegocio = ?
         AND v.estadodeventa = 'COBRADO' AND v.estatusdepago = 'PAGADO'
         AND v.formadepago = 'MIXTO'
       GROUP BY dp.formadepagodetalle`,
      [claveturno, idnegocio]
    );

    // Merge simple + mixto payment details
    const pagoMap: Record<string, number> = {};
    for (const row of ventasFormaPagoRows) {
      const fp = String(row.formadepago || '');
      pagoMap[fp] = (pagoMap[fp] || 0) + (Number(row.total) || 0);
    }
    for (const row of mixtoDetalleRows) {
      const fp = String(row.formadepago || '');
      pagoMap[fp] = (pagoMap[fp] || 0) + (Number(row.total) || 0);
    }
    const ventasPorFormaDePago = Object.entries(pagoMap)
      .map(([formadepago, total]) => ({ formadepago, total }))
      .sort((a, b) => b.total - a.total);

    const totalVentasPago = ventasPorFormaDePago.reduce((s, r) => s + r.total, 0);
    const ventasEfectivo = pagoMap['EFECTIVO'] || 0;

    // 7. Ventas por tipo de venta
    const [ventasTipoRows] = await pool.query<RowDataPacket[]>(
      `SELECT tipodeventa, COALESCE(SUM(totaldeventa), 0) AS total
       FROM tblposcrumenwebventas
       WHERE claveturno = ? AND idnegocio = ?
         AND estadodeventa = 'COBRADO' AND estatusdepago = 'PAGADO'
         AND descripcionmov = 'VENTA'
       GROUP BY tipodeventa
       ORDER BY total DESC`,
      [claveturno, idnegocio]
    );

    // 8. Descuentos aplicados agrupados por detalledescuento
    const [descuentosRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
         COALESCE(NULLIF(TRIM(detalledescuento), ''), 'Sin nombre') AS nombre,
         COUNT(*) AS operaciones,
         COALESCE(SUM(descuentos), 0) AS montoDescuento
       FROM tblposcrumenwebventas
       WHERE claveturno = ? AND idnegocio = ?
         AND estadodeventa = 'COBRADO' AND estatusdepago = 'PAGADO'
         AND descripcionmov = 'VENTA' AND descuentos > 0
       GROUP BY detalledescuento
       ORDER BY montoDescuento DESC`,
      [claveturno, idnegocio]
    );

    // 9. Productos vendidos
    const [productosRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
         d.nombreproducto,
         COALESCE(SUM(d.cantidad), 0) AS cantidad,
         COALESCE(SUM(d.subtotal), 0) AS total
       FROM tblposcrumenwebdetalleventas d
       INNER JOIN tblposcrumenwebventas v ON d.idventa = v.idventa
       WHERE v.claveturno = ? AND v.idnegocio = ?
         AND v.estadodeventa = 'COBRADO' AND v.estatusdepago = 'PAGADO'
         AND v.descripcionmov = 'VENTA'
       GROUP BY d.nombreproducto
       ORDER BY SUM(d.cantidad) DESC`,
      [claveturno, idnegocio]
    );

    const [totalesProductosRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
         COALESCE(SUM(d.cantidad), 0) AS totalUnidades,
         COALESCE(SUM(d.subtotal), 0) AS totalVentaProductos
       FROM tblposcrumenwebdetalleventas d
       INNER JOIN tblposcrumenwebventas v ON d.idventa = v.idventa
       WHERE v.claveturno = ? AND v.idnegocio = ?
         AND v.estadodeventa = 'COBRADO' AND v.estatusdepago = 'PAGADO'
         AND v.descripcionmov = 'VENTA'`,
      [claveturno, idnegocio]
    );
    const totalUnidades = Number(totalesProductosRows[0]?.totalUnidades) || 0;
    const totalVentaProductos = Number(totalesProductosRows[0]?.totalVentaProductos) || 0;

    // 10. Indicadores operativos
    const ventaPromedio = totalTickets > 0 ? ventasNetas / totalTickets : 0;
    const promedioArticulos = totalTickets > 0 ? totalUnidades / totalTickets : 0;

    // 11. Conciliación de efectivo
    const efectivoEsperado = fondoInicial - retiroFondo + ventasEfectivo - totalGastos;

    // Fecha de generación
    const fechaGeneracion = new Date().toISOString();

    res.json({
      success: true,
      data: {
        // Turno + Negocio
        turno: {
          idturno: turno.idturno,
          numeroturno: turno.numeroturno,
          claveturno: turno.claveturno,
          usuarioturno: turno.usuarioturno,
          fechainicioturno: turno.fechainicioturno,
          fechafinturno: turno.fechafinturno,
          estatusturno: turno.estatusturno,
          metaturno: turno.metaturno,
          nombreNegocio: turno.nombreNegocio || '',
          rfcnegocio: turno.rfcnegocio || ''
        },
        // Resumen general
        resumen: {
          fondoInicial,
          retiroFondo,
          ventasBrutas,
          totalDescuentos,
          ventasNetas,
          totalGastos
        },
        // Gastos del turno (solo si existen)
        gastos: gastosRows.map(r => ({
          concepto: String(r.concepto || ''),
          importe: Number(r.importe) || 0
        })),
        totalGastos,
        // Ventas por forma de pago
        ventasPorFormaDePago,
        totalVentasPago,
        // Ventas por tipo de venta
        ventasPorTipoDeVenta: ventasTipoRows.map(r => ({
          tipodeventa: String(r.tipodeventa || ''),
          total: Number(r.total) || 0
        })),
        // Descuentos aplicados
        descuentosAplicados: descuentosRows.map(r => ({
          nombre: String(r.nombre || ''),
          operaciones: Number(r.operaciones) || 0,
          montoDescuento: Number(r.montoDescuento) || 0
        })),
        // Conciliación de efectivo
        conciliacion: {
          fondoInicial,
          retiroFondo,
          ventasEfectivo,
          totalGastos,
          efectivoEsperado
        },
        // Productos vendidos
        productosVendidos: productosRows.map(r => ({
          nombreproducto: String(r.nombreproducto || ''),
          cantidad: Number(r.cantidad) || 0,
          total: Number(r.total) || 0
        })),
        totalUnidades,
        totalVentaProductos,
        // Indicadores operativos
        indicadores: {
          totalTickets,
          totalUnidades,
          ventaPromedio,
          promedioArticulos
        },
        // Auditoría
        auditoria: {
          usuarioGenerador,
          fechaGeneracion
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener corte de fin de turno:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener corte de fin de turno',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
