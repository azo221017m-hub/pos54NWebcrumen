// backend/src/controllers/clientesController.ts
// Controlador para gestión de clientes

import type { Request, Response } from 'express'; // Importa tipos de Express
import { executeQuery } from '../config/database'; // Importa función para ejecutar consultas
import type { ApiResponse, CreateClienteData } from '../types'; // Importa tipos personalizados

// Controlador para obtener todos los clientes
export const getClientesController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('👥 Obteniendo lista de clientes'); // Log de inicio

    // Consulta todos los clientes de la base de datos
    const clientes = await executeQuery(
      'SELECT idCliente, nombre, telefono, email, direccion, estatus, fechaRegistro, fechaActualizacion, usuario FROM tblposcrumenwebclientes ORDER BY fechaRegistro DESC',
      []
    );

    console.log(`✅ ${clientes.length} clientes encontrados`); // Log de resultados

    // Retorna la lista de clientes
    res.json({
      success: true,
      message: 'Clientes obtenidos exitosamente',
      data: clientes
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error obteniendo clientes:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};

// Controlador para crear un nuevo cliente
export const createClienteController = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('👥 Creando nuevo cliente'); // Log de inicio
    const clienteData: CreateClienteData = req.body; // Extrae datos del cuerpo

    // Valida campos requeridos
    const requiredFields = ['nombre', 'telefono', 'email', 'direccion'];
    const missingFields = requiredFields.filter(field => !clienteData[field as keyof CreateClienteData]);
    
    if (missingFields.length > 0) {
      console.log('❌ Faltan campos requeridos:', missingFields); // Log de error
      res.status(400).json({
        success: false,
        message: `Faltan campos requeridos: ${missingFields.join(', ')}`,
        error: 'MISSING_FIELDS'
      } as ApiResponse);
      return;
    }

    // Verifica si ya existe un cliente con el mismo email
    const existingCliente = await executeQuery(
      'SELECT idCliente FROM tblposcrumenwebclientes WHERE email = ?',
      [clienteData.email]
    );

    if (existingCliente.length > 0) {
      console.log('❌ Cliente ya existe'); // Log de error
      res.status(409).json({
        success: false,
        message: 'Ya existe un cliente con ese email',
        error: 'CLIENT_EXISTS'
      } as ApiResponse);
      return;
    }

    // Inserta el nuevo cliente
    const result = await executeQuery(`
      INSERT INTO tblposcrumenwebclientes 
      (nombre, telefono, email, direccion, estatus, fechaRegistro, fechaActualizacion, usuario)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?)
    `, [
      clienteData.nombre,
      clienteData.telefono,
      clienteData.email,
      clienteData.direccion,
      clienteData.estatus || 1, // Por defecto activo
      clienteData.usuario || 'system'
    ]);

    console.log('✅ Cliente creado exitosamente'); // Log de éxito
    
    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: { 
        idCliente: (result as any).insertId,
        nombre: clienteData.nombre 
      }
    } as ApiResponse);

  } catch (error) {
    console.error('❌ Error creando cliente:', error); // Log de error
    res.status(500).json({
      success: false,
      message: 'Error creando cliente',
      error: 'INTERNAL_ERROR'
    } as ApiResponse);
  }
};