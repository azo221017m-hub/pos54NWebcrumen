// Obtener los grupos de moderadores (tblposcrumenwebmodref)
export async function getGruposModeradores(_req: Request, res: Response) {
  try {
    const [rows] = await pool.execute(
      'SELECT idmodref, nombremodref FROM tblposcrumenwebmodref WHERE estatus = 1'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener grupos', error: String(error) });
  }
}
// backend/src/controllers/moderadoresMiembrosController.ts
// Controlador para asignaciones de moderadores a grupos
// CRUD sobre tblposcrumenwebmoderadoresmiembros

import { Request, Response } from 'express';
import pool from '../config/database';
import type { ApiResponse } from '../types/index';

// Obtener todas las asignaciones
export async function getModeradoresMiembros(req: Request, res: Response) {
  try {
    const { idnegocio } = req.query;
    console.log('📡 [API] GET /api/moderadores-miembros', { idnegocio });
    const [rows] = await pool.execute(
      `SELECT m.id, m.idmoderador_grupo, m.idmoderador_miembro, m.fechaRegistro, m.idnegocio,
              g.nombremodref, r.nombremoderador
         FROM tblposcrumenwebmoderadoresmiembros m
         JOIN tblposcrumenwebmodref g ON m.idmoderador_grupo = g.idmodref
         JOIN tblposcrumenwebmoderadores r ON m.idmoderador_miembro = r.idmoderador
         WHERE m.idnegocio = ?`,
      [idnegocio]
    );
    res.json({ success: true, message: 'Asignaciones obtenidas', data: rows } as ApiResponse);
  } catch (error) {
    console.error('❌ [API] Error GET /api/moderadores-miembros:', error);
    res.status(500).json({ success: false, message: 'Error al obtener asignaciones', error: String(error) } as ApiResponse);
  }
}

// Crear nuevas asignaciones
export async function createModeradoresMiembros(req: Request, res: Response) {
  try {
    const { idmoderador_grupo, miembros, idnegocio } = req.body;
    console.log('📡 [API] POST /api/moderadores-miembros BODY:', req.body);
    if (!idmoderador_grupo) {
      return res.status(400).json({ success: false, message: 'Falta idmoderador_grupo', error: 'Datos incompletos' } as ApiResponse);
    }
    if (!Array.isArray(miembros)) {
      return res.status(400).json({ success: false, message: 'Falta array miembros', error: 'Datos incompletos' } as ApiResponse);
    }
    if (!idnegocio) {
      return res.status(400).json({ success: false, message: 'Falta idnegocio', error: 'Datos incompletos' } as ApiResponse);
    }
    try {
      console.log('🔍 [DEBUG] miembros recibidos:', miembros);
      const miembrosChecked = Array.isArray(miembros)
        ? miembros.filter((item: any) => item && item.checked === true && typeof item.id === 'number').map((item: any) => item.id)
        : [];
      console.log('🔍 [DEBUG] miembrosChecked:', miembrosChecked);
      if (miembrosChecked.length === 0) {
        return res.status(400).json({ success: false, message: 'No se seleccionó ningún miembro', error: 'Sin miembros seleccionados' } as ApiResponse);
      }
      const miembrosString = miembrosChecked.join('-');
      const now = new Date();
      const result = await pool.execute(
        `INSERT INTO tblposcrumenwebmoderadoresmiembros (idmoderador_grupo, idmoderador_miembro, fechaRegistro, idnegocio)
         VALUES (?, ?, ?, ?)`,
        [idmoderador_grupo, miembrosString, now, idnegocio]
      );
      console.log('✅ [DB] Insert result:', result);
      res.json({ success: true, message: 'Asignación guardada', miembros: miembrosString } as ApiResponse);
    } catch (err) {
      console.error('❌ [API] Error en insert moderadores-miembros:', err);
      res.status(500).json({ success: false, message: 'Error al guardar asignaciones', error: String(err) } as ApiResponse);
    }
  } catch (error) {
    console.error('❌ [API] Error POST /api/moderadores-miembros:', error);
    res.status(500).json({ success: false, message: 'Error al guardar asignaciones', error: String(error) } as ApiResponse);
  }
}

// Editar una asignación
export async function updateModeradoresMiembros(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { idmoderador_grupo, idmoderador_miembro } = req.body;
    console.log('📡 [API] PUT /api/moderadores-miembros', { id, ...req.body });
    if (!idmoderador_grupo || !idmoderador_miembro) {
      return res.status(400).json({ success: false, message: 'Faltan datos requeridos', error: 'Datos incompletos' } as ApiResponse);
    }
    await pool.execute(
      `UPDATE tblposcrumenwebmoderadoresmiembros SET idmoderador_grupo = ?, idmoderador_miembro = ? WHERE id = ?`,
      [idmoderador_grupo, idmoderador_miembro, id]
    );
    res.json({ success: true, message: 'Asignación actualizada' } as ApiResponse);
  } catch (error) {
    console.error('❌ [API] Error PUT /api/moderadores-miembros:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar asignación', error: String(error) } as ApiResponse);
  }
}

// Eliminar una asignación
export async function deleteModeradoresMiembros(req: Request, res: Response) {
  try {
    const { id } = req.params;
    console.log('📡 [API] DELETE /api/moderadores-miembros', { id });
    await pool.execute(
      `DELETE FROM tblposcrumenwebmoderadoresmiembros WHERE id = ?`,
      [id]
    );
    res.json({ success: true, message: 'Asignación eliminada' } as ApiResponse);
  } catch (error) {
    console.error('❌ [API] Error DELETE /api/moderadores-miembros:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar asignación', error: String(error) } as ApiResponse);
  }
}
