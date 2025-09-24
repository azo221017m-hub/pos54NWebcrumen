import { Router } from 'express';
import { pool } from '../db.js';
import { RowDataPacket } from 'mysql2/promise';

interface Cliente extends RowDataPacket {
  id_cliente: number;
  numerodecliente: string;
  nombre_cliente: string;
  estado_activo: boolean;
}

interface Usuario extends RowDataPacket {
  id_usuario: number;
  nombredeusuario: string;
  contrasenia: string;
  estado_activo: boolean;
}

const router = Router();

/**
 * Validar cliente por número de cliente
 */
router.post('/validar-cliente', async (req, res) => {
  const { numerodecliente } = req.body;
  console.log('[DEBUG] validar-cliente - Body recibido:', req.body);

  try {
    const [clientes] = await pool.query<Cliente[]>(
      'SELECT * FROM tblcrumenposweb_clientes WHERE numerodecliente = ? AND estado_activo = 1',
      [numerodecliente]
    );

    console.log('[DEBUG] validar-cliente - Resultado query:', clientes);

    // Devolvemos también el contenido para depuración
    res.json({ ok: clientes.length > 0, clientes });
  } catch (error) {
    console.error('[ERROR] validar-cliente:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al consultar la BD' });
  }
});

/**
 * Validar usuario (nombredeusuario + contrasenia)
 */
router.post('/validar-usuario', async (req, res) => {
  const { nombredeusuario, contrasenia } = req.body;
  console.log('[DEBUG] validar-usuario - Body recibido:', req.body);

  try {
    const [usuarios] = await pool.query<Usuario[]>(
      'SELECT * FROM tblcrumenposweb_usuarios WHERE nombredeusuario = ? AND contraseñadeacceso = ? AND estado_activo = 1',
      [nombredeusuario, contrasenia]
    );

    console.log('[DEBUG] validar-usuario - Resultado query:', usuarios);

    res.json({ ok: usuarios.length > 0, usuarios });
  } catch (error) {
    console.error('[ERROR] validar-usuario:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al consultar la BD' });
  }
});

export default router;
