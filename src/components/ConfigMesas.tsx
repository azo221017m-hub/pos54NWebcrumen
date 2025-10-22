// src/components/ConfigMesas.tsx
// Componente para gestión de mesas

import React, { useState, useEffect } from 'react';
import type { Mesa, CreateMesaData, ApiResponse, Usuario, ScreenType } from '../types/index';
import { getMesas, createMesa, updateMesa, deleteMesa } from '../services/api';
import Toast from './Toast';
import '../styles/ConfigScreens.css';

// Interfaz para props del componente
interface ConfigMesasProps {
  onNavigate: (screen: ScreenType) => void; // Función para navegar entre pantallas
  currentUser: Usuario; // Usuario autenticado actual
}

// Componente principal de configuración de mesas
const ConfigMesas: React.FC<ConfigMesasProps> = ({ onNavigate, currentUser }) => {
  // Estados para el manejo de datos y UI
  const [mesas, setMesas] = useState<Mesa[]>([]); // Lista de mesas
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga
  const [submitting, setSubmitting] = useState<boolean>(false); // Estado de envío de formulario
  const [isEditing, setIsEditing] = useState<boolean>(false); // Control del modo edición
  const [editingId, setEditingId] = useState<number | null>(null); // ID de la mesa siendo editada

  // Estados para el formulario de nueva mesa
  const [formData, setFormData] = useState<CreateMesaData>({
    nombremesa: '',
    numeromesa: 1,
    cantcomensales: 1,
    estatusmesa: 'DISPONIBLE',
    creado_por: currentUser.usuario // Llenar automáticamente con el usuario logueado
  });

  // Estados para Toast de notificaciones
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Función para mostrar notificaciones
  const mostrarToast = (message: string, type: 'success' | 'error' | 'info') => {
    console.log('🎯 [ConfigMesas] Mostrando toast:', { message, type });
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
      console.log('⏰ [ConfigMesas] Ocultando toast automáticamente');
      setShowToast(false);
    }, 3000);
  };

  // Función para cargar mesas
  const cargarMesas = async () => {
    try {
      setLoading(true);
      console.log('Cargando mesas...');
      
      const response: ApiResponse<Mesa[]> = await getMesas();
      console.log('Respuesta de mesas:', response);
      
      if (response.success && response.data) {
        setMesas(response.data);
      } else {
        setMesas([]);
        mostrarToast('Error al cargar mesas', 'error');
      }
    } catch (error) {
      console.error('Error al obtener mesas:', error);
      setMesas([]);
      mostrarToast('Error de conexión al cargar mesas', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cargar mesas al montar el componente
  useEffect(() => {
    cargarMesas();
  }, []);

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: ['numeromesa', 'cantcomensales'].includes(name) ? Number(value) : value
    }));
  };

  // Función para manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombremesa.trim()) {
      mostrarToast('El nombre de la mesa es obligatorio', 'error');
      return;
    }

    if (formData.numeromesa <= 0) {
      mostrarToast('El número de mesa debe ser mayor a 0', 'error');
      return;
    }

    if (formData.cantcomensales <= 0) {
      mostrarToast('La cantidad de comensales debe ser mayor a 0', 'error');
      return;
    }

    try {
      setSubmitting(true);

      let response: ApiResponse<any>;
      
      if (isEditing && editingId) {
        // Actualizar mesa existente
        const updateData = {
          ...formData,
          actualizado_por: currentUser.usuario
        };
        response = await updateMesa(editingId, updateData);
      } else {
        // Crear nueva mesa
        response = await createMesa(formData);
      }

      if (response.success) {
        mostrarToast(
          isEditing ? 'Mesa actualizada exitosamente' : 'Mesa creada exitosamente',
          'success'
        );
        
        // Limpiar formulario y recargar datos
        setFormData({
          nombremesa: '',
          numeromesa: 1,
          cantcomensales: 1,
          estatusmesa: 'DISPONIBLE',
          creado_por: currentUser.usuario
        });
        
        setIsEditing(false);
        setEditingId(null);
        await cargarMesas();
      } else {
        mostrarToast(response.message || 'Error al procesar mesa', 'error');
      }
    } catch (error) {
      console.error('Error al procesar mesa:', error);
      mostrarToast('Error de conexión al procesar mesa', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Función para editar una mesa
  const handleEdit = (mesa: Mesa) => {
    setFormData({
      nombremesa: mesa.nombremesa,
      numeromesa: mesa.numeromesa,
      cantcomensales: mesa.cantcomensales,
      estatusmesa: mesa.estatusmesa,
      creado_por: currentUser.usuario
    });
    setIsEditing(true);
    setEditingId(mesa.idmesa);
    
    // Scroll al formulario
    const formElement = document.querySelector('.config-form');
    formElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Función para cancelar edición
  const handleCancelEdit = () => {
    setFormData({
      nombremesa: '',
      numeromesa: 1,
      cantcomensales: 1,
      estatusmesa: 'DISPONIBLE',
      creado_por: currentUser.usuario
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Función para eliminar una mesa
  const handleDelete = async (mesa: Mesa) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la mesa "${mesa.nombremesa}"?`)) {
      return;
    }

    try {
      const response = await deleteMesa(mesa.idmesa, {
        actualizado_por: currentUser.usuario
      });

      if (response.success) {
        mostrarToast('Mesa eliminada exitosamente', 'success');
        await cargarMesas();
      } else {
        mostrarToast(response.message || 'Error al eliminar mesa', 'error');
      }
    } catch (error) {
      console.error('Error al eliminar mesa:', error);
      mostrarToast('Error de conexión al eliminar mesa', 'error');
    }
  };

  // Función para formatear fecha
  const formatearFecha = (fecha: string | undefined) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener el color del estatus
  const getStatusColor = (estatus: string) => {
    switch (estatus) {
      case 'DISPONIBLE': return 'success';
      case 'OCUPADA': return 'error';
      case 'RESERVADA': return 'warning';
      case 'INACTIVA': return 'secondary';
      default: return 'secondary';
    }
  };

  // Función para obtener el icono del estatus
  const getStatusIcon = (estatus: string) => {
    switch (estatus) {
      case 'DISPONIBLE': return '✅';
      case 'OCUPADA': return '🔴';
      case 'RESERVADA': return '🟡';
      case 'INACTIVA': return '⚫';
      default: return '❓';
    }
  };

  return (
    <div className="config-screen">
      <div className="config-container">
        {/* Header */}
        <div className="config-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="config-title">
                <span className="title-icon">🍽️</span>
                Configuración de Mesas
              </h1>
              <p className="config-subtitle">
                Gestiona las mesas de tu restaurante
              </p>
            </div>
            <button 
              className="btn-back"
              onClick={() => onNavigate('home')}
              title="Volver al inicio"
            >
              ← Volver
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="config-content">
          {/* Formulario */}
          <div className="config-form">
            <div className="form-card">
              <div className="form-header">
                <h2 className="form-title">
                  {isEditing ? '✏️ Editar Mesa' : '➕ Agregar Nueva Mesa'}
                </h2>
                {isEditing && (
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={handleCancelEdit}
                    title="Cancelar edición"
                  >
                    ✕ Cancelar
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="config-form-grid">
                <div className="form-row">
                  {/* Campo nombre de mesa */}
                  <div className="form-group">
                    <label htmlFor="nombremesa" className="form-label">
                      Nombre de la Mesa *
                    </label>
                    <input
                      type="text"
                      id="nombremesa"
                      name="nombremesa"
                      value={formData.nombremesa}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ej. Mesa Principal, Mesa Terraza..."
                      required
                      maxLength={100}
                    />
                  </div>

                  {/* Campo número de mesa */}
                  <div className="form-group">
                    <label htmlFor="numeromesa" className="form-label">
                      Número de Mesa *
                    </label>
                    <input
                      type="number"
                      id="numeromesa"
                      name="numeromesa"
                      value={formData.numeromesa}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="1"
                      required
                      min="1"
                      max="999"
                    />
                  </div>
                </div>

                <div className="form-row">
                  {/* Campo cantidad de comensales */}
                  <div className="form-group">
                    <label htmlFor="cantcomensales" className="form-label">
                      Cantidad de Comensales *
                    </label>
                    <input
                      type="number"
                      id="cantcomensales"
                      name="cantcomensales"
                      value={formData.cantcomensales}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="1"
                      required
                      min="1"
                      max="50"
                    />
                  </div>

                  {/* Campo estatus de mesa */}
                  <div className="form-group">
                    <label htmlFor="estatusmesa" className="form-label">
                      Estatus de la Mesa *
                    </label>
                    <select
                      id="estatusmesa"
                      name="estatusmesa"
                      value={formData.estatusmesa}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="DISPONIBLE">✅ Disponible</option>
                      <option value="OCUPADA">🔴 Ocupada</option>
                      <option value="RESERVADA">🟡 Reservada</option>
                      <option value="INACTIVA">⚫ Inactiva</option>
                    </select>
                  </div>
                </div>

                {/* Botón de envío */}
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>⏳ Procesando...</>
                    ) : isEditing ? (
                      <>💾 Actualizar Mesa</>
                    ) : (
                      <>➕ Crear Mesa</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Tabla de mesas */}
          <div className="config-table">
            <div className="table-header">
              <h3 className="table-title">📋 Lista de Mesas ({mesas.length})</h3>
              <button 
                className="btn-refresh"
                onClick={cargarMesas}
                disabled={loading}
                title="Actualizar lista"
              >
                {loading ? '⏳' : '🔄'}
              </button>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Cargando mesas...</p>
              </div>
            ) : mesas.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍽️</div>
                <h3>No hay mesas registradas</h3>
                <p>Agrega tu primera mesa usando el formulario superior</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mesa</th>
                      <th>Número</th>
                      <th>Comensales</th>
                      <th>Estatus</th>
                      <th>Creado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mesas.map((mesa) => (
                      <tr key={mesa.idmesa}>
                        <td className="mesa-name">
                          <div className="mesa-info">
                            <span className="mesa-title">{mesa.nombremesa}</span>
                            <span className="mesa-id">ID: {mesa.idmesa}</span>
                          </div>
                        </td>
                        <td className="text-center mesa-number">
                          <span className="number-badge">#{mesa.numeromesa}</span>
                        </td>
                        <td className="text-center mesa-capacity">
                          <span className="capacity-badge">
                            👥 {mesa.cantcomensales}
                          </span>
                        </td>
                        <td className="text-center mesa-status">
                          <span className={`status-badge status-${getStatusColor(mesa.estatusmesa)}`}>
                            {getStatusIcon(mesa.estatusmesa)} {mesa.estatusmesa}
                          </span>
                        </td>
                        <td className="text-center mesa-date">
                          {formatearFecha(mesa.creado_en)}
                        </td>
                        <td className="text-center mesa-actions">
                          <div className="action-buttons">
                            <button
                              className="btn-edit"
                              onClick={() => handleEdit(mesa)}
                              title="Editar mesa"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDelete(mesa)}
                              title="Eliminar mesa"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Botón de regreso inferior */}
          <div className="config-footer">
            <button 
              className="btn-back"
              onClick={() => onNavigate('home')}
              title="Regresar al menú principal"
            >
              🏠 Regresar al Menú Principal
            </button>
          </div>
        </div>
      </div>

      {/* Toast para notificaciones */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default ConfigMesas;