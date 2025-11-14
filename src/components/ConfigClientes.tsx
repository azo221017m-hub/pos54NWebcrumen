// src/components/ConfigClientes.tsx
// Componente para configuración de clientes con minicards y formulario modal

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { 
  ScreenType, 
  Cliente, 
  CreateClienteData, 
  UpdateClienteData,
  CategoriaCliente,
  EstatusSeguimiento,
  MedioContacto,
  ApiResponse 
} from '../types';
import Toast from './Toast';
import apiService from '../services/api';
import '../styles/FormStyles.css';

interface Props {
  onNavigate: (screen: ScreenType) => void;
}

const ConfigClientes: React.FC<Props> = ({ onNavigate }) => {
  console.log('👥 [ConfigClientes] Inicializando componente...');
  
  // Hooks
  const { user } = useAuth();
  
  // Estados del componente
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentCliente, setCurrentCliente] = useState<Cliente | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Estados del formulario
  const [formData, setFormData] = useState<CreateClienteData>({
    nombre: '',
    referencia: '',
    cumple: new Date().toISOString().split('T')[0],
    categoriacliente: 'NUEVO',
    satisfaccion: 5,
    comentarios: '',
    puntosfidelidad: 0,
    estatus_seguimiento: 'NINGUNO',
    responsable_seguimiento: '',
    medio_contacto: 'WHATSAPP',
    observacionesseguimiento: '',
    fechaultimoseguimiento: new Date().toISOString().split('T')[0],
    telefono: '',
    email: '',
    direccion: '',
    estatus: 1,
    usuarioauditoria: user?.alias || 'ADMIN',
    idnegocio: user?.idNegocio || 1
  });

  // Estados para toast
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Función para mostrar toast
  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    console.log(`📢 [ConfigClientes] Toast ${type}:`, message);
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Función para cargar clientes
  const cargarClientes = async () => {
    setIsLoading(true);
    try {
      console.log('👥 [ConfigClientes] Cargando clientes...');
      const response = await apiService.getClientes();
      
      if (response.success && response.data) {
        console.log('🔍 [ConfigClientes] Estructura de datos:', response.data[0]);
        setClientes(response.data);
        console.log(`✅ [ConfigClientes] ${response.data.length} clientes cargados`);
      } else {
        console.error('❌ [ConfigClientes] Error en respuesta:', response.message);
        showToastMessage(`Error al cargar clientes: ${response.message}`, 'error');
      }
    } catch (error) {
      console.error('💥 [ConfigClientes] Error cargando clientes:', error);
      showToastMessage('Error de conexión al cargar clientes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para cargar clientes al montar
  useEffect(() => {
    cargarClientes();
  }, []);

  // Función para resetear formulario
  const resetFormData = () => {
    setFormData({
      nombre: '',
      referencia: '',
      cumple: new Date().toISOString().split('T')[0],
      categoriacliente: 'NUEVO',
      satisfaccion: 5,
      comentarios: '',
      puntosfidelidad: 0,
      estatus_seguimiento: 'NINGUNO',
      responsable_seguimiento: '',
      medio_contacto: 'WHATSAPP',
      observacionesseguimiento: '',
      fechaultimoseguimiento: new Date().toISOString().split('T')[0],
      telefono: '',
      email: '',
      direccion: '',
      estatus: 1,
      usuarioauditoria: user?.alias || 'ADMIN',
      idnegocio: user?.idNegocio || 1
    });
  };

  // Función para abrir modal de creación
  const handleAgregarCliente = () => {
    console.log('➕ [ConfigClientes] Abriendo modal para crear cliente');
    resetFormData();
    setCurrentCliente(null);
    setIsEditing(false);
    setShowModal(true);
  };

  // Función para abrir modal de edición
  const handleEditarCliente = (cliente: Cliente) => {
    console.log('✏️ [ConfigClientes] Editando cliente:', cliente.nombre);
    setFormData({
      nombre: cliente.nombre,
      referencia: cliente.referencia,
      cumple: cliente.cumple,
      categoriacliente: cliente.categoriacliente,
      satisfaccion: cliente.satisfaccion,
      comentarios: cliente.comentarios,
      puntosfidelidad: cliente.puntosfidelidad,
      estatus_seguimiento: cliente.estatus_seguimiento,
      responsable_seguimiento: cliente.responsable_seguimiento,
      medio_contacto: cliente.medio_contacto,
      observacionesseguimiento: cliente.observacionesseguimiento,
      fechaultimoseguimiento: cliente.fechaultimoseguimiento,
      telefono: cliente.telefono,
      email: cliente.email,
      direccion: cliente.direccion,
      estatus: cliente.estatus,
      usuarioauditoria: user?.alias || 'ADMIN',
      idnegocio: cliente.idnegocio
    });
    setCurrentCliente(cliente);
    setIsEditing(true);
    setShowModal(true);
  };

  // Función para cerrar modal
  const handleCerrarModal = () => {
    console.log('❌ [ConfigClientes] Cerrando modal');
    setShowModal(false);
    setCurrentCliente(null);
    setIsEditing(false);
    resetFormData();
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (
    field: keyof CreateClienteData, 
    value: string | number | CategoriaCliente | EstatusSeguimiento | MedioContacto
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para manejar envío del formulario
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('💾 [ConfigClientes] Enviando formulario...');
    
    // Validaciones básicas
    if (!formData.nombre.trim()) {
      showToastMessage('El nombre del cliente es requerido', 'error');
      return;
    }

    if (!formData.telefono.trim()) {
      showToastMessage('El teléfono del cliente es requerido', 'error');
      return;
    }

    if (!formData.email.trim()) {
      showToastMessage('El email del cliente es requerido', 'error');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToastMessage('El formato del email no es válido', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      let response: ApiResponse;
      
      if (isEditing && currentCliente) {
        console.log('🔄 [ConfigClientes] Actualizando cliente...');
        const updateData: UpdateClienteData = {
          ...formData,
          usuarioauditoria: user?.alias || 'ADMIN'
        };
        response = await apiService.updateCliente(currentCliente.idCliente, updateData);
      } else {
        console.log('➕ [ConfigClientes] Creando nuevo cliente...');
        response = await apiService.createCliente(formData);
      }

      if (response.success) {
        const actionText = isEditing ? 'actualizado' : 'creado';
        showToastMessage(`Cliente ${actionText} exitosamente`, 'success');
        handleCerrarModal();
        cargarClientes();
      } else {
        showToastMessage(`Error: ${response.message}`, 'error');
      }
    } catch (error) {
      console.error('💥 [ConfigClientes] Error en operación:', error);
      showToastMessage('Error de conexión al procesar cliente', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar cliente
  const handleEliminarCliente = async (cliente: Cliente) => {
    console.log('🗑️ [ConfigClientes] Solicitando eliminación:', cliente.nombre);
    
    if (!window.confirm(`¿Estás seguro de eliminar el cliente "${cliente.nombre}"?`)) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiService.deleteCliente(cliente.idCliente);
      
      if (response.success) {
        showToastMessage('Cliente eliminado exitosamente', 'success');
        cargarClientes();
      } else {
        showToastMessage(`Error: ${response.message}`, 'error');
      }
    } catch (error) {
      console.error('💥 [ConfigClientes] Error eliminando cliente:', error);
      showToastMessage('Error de conexión al eliminar cliente', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para formatear fecha
  const formatearFecha = (fecha: string): string => {
    try {
      return new Date(fecha).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  // Función para obtener color de categoría
  const getColorCategoria = (categoria: CategoriaCliente): string => {
    switch (categoria) {
      case 'VIP': return '#10b981'; // Verde
      case 'FRECUENTE': return '#3b82f6'; // Azul
      case 'RECURRENTE': return '#8b5cf6'; // Púrpura
      case 'NUEVO': return '#f59e0b'; // Amarillo
      case 'INACTIVO': return '#6b7280'; // Gris
      default: return '#6b7280';
    }
  };

  // Función para obtener color de seguimiento
  const getColorSeguimiento = (estatus: EstatusSeguimiento): string => {
    switch (estatus) {
      case 'CERRADO': return '#10b981'; // Verde
      case 'EN_NEGOCIACIÓN': return '#f59e0b'; // Amarillo
      case 'EN_PROSPECCIÓN': return '#3b82f6'; // Azul
      case 'PERDIDO': return '#ef4444'; // Rojo
      case 'NINGUNO': return '#6b7280'; // Gris
      default: return '#6b7280';
    }
  };

  return (
    <div className="config-screen">
      {/* Header con botón regresar */}
      <div className="config-header">
        <button 
          className="btn-back"
          onClick={() => onNavigate('tablero-inicial')}
          disabled={isLoading}
        >
          ← Regresar al Tablero
        </button>
        <h1 className="config-title">👥 Configuración de Clientes</h1>
      </div>

      {/* Contenido principal */}
      <div className="config-content">
        {isLoading && clientes.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Cargando clientes...</p>
          </div>
        ) : clientes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No hay clientes registrados</h3>
            <p>Comienza agregando tu primer cliente al sistema</p>
            <button className="btn-add-cliente" onClick={handleAgregarCliente}>
              ✨ Agregar Primer Cliente
            </button>
          </div>
        ) : (
          <>
            {/* Botón agregar cliente */}
            <div className="config-actions">
              <button 
                className="btn-primary"
                onClick={handleAgregarCliente}
                disabled={isLoading}
              >
                ➕ Agregar Cliente
              </button>
            </div>

            {/* Grid de clientes */}
            <div className="clientes-grid">
              {clientes.map((cliente) => (
                <div key={cliente.idCliente} className="cliente-card">
                  <div className="cliente-header-card">
                    <h3 className="cliente-nombre">{cliente.nombre}</h3>
                    <div className="cliente-badges">
                      <span 
                        className="badge-categoria"
                        style={{ backgroundColor: getColorCategoria(cliente.categoriacliente) }}
                      >
                        {cliente.categoriacliente}
                      </span>
                      <span 
                        className={`cliente-status ${cliente.estatus === 1 ? 'status-activo' : 'status-inactivo'}`}
                      >
                        {cliente.estatus === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div className="cliente-details">
                    <div className="detail-item">
                      <span className="detail-label">📧 Email</span>
                      <span className="detail-value">{cliente.email}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">📱 Teléfono</span>
                      <span className="detail-value">{cliente.telefono}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">🎯 Seguimiento</span>
                      <span 
                        className="detail-value badge-seguimiento"
                        style={{ backgroundColor: getColorSeguimiento(cliente.estatus_seguimiento) }}
                      >
                        {cliente.estatus_seguimiento.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">💬 Contacto</span>
                      <span className="detail-value">{cliente.medio_contacto}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">🎂 Cumpleaños</span>
                      <span className="detail-value">{formatearFecha(cliente.cumple)}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">⭐ Satisfacción</span>
                      <span className="detail-value">
                        {'★'.repeat(cliente.satisfaccion)}{'☆'.repeat(5 - cliente.satisfaccion)}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">🏆 Puntos</span>
                      <span className="detail-value valor-puntos">{cliente.puntosfidelidad}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">📅 Registro</span>
                      <span className="detail-value">
                        {formatearFecha(cliente.fecharegistroauditoria)}
                      </span>
                    </div>
                  </div>

                  <div className="cliente-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEditarCliente(cliente)}
                      disabled={isLoading}
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleEliminarCliente(cliente)}
                      disabled={isLoading}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal para agregar/editar cliente */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCerrarModal}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">
                  {isEditing ? '✏️ Editar Cliente' : '➕ Agregar Cliente'}
                </h3>
                <button 
                  className="modal-close"
                  onClick={handleCerrarModal}
                  disabled={isLoading}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="modal-form">
                <div className="form-sections">
                  {/* Sección: Información Básica */}
                  <div className="form-section">
                    <h4 className="section-title">📋 Información Básica</h4>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="nombre">Nombre Completo *</label>
                        <input
                          type="text"
                          id="nombre"
                          value={formData.nombre}
                          onChange={(e) => handleInputChange('nombre', e.target.value)}
                          required
                          disabled={isLoading}
                          placeholder="Nombre completo del cliente"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="referencia">Referencia</label>
                        <input
                          type="text"
                          id="referencia"
                          value={formData.referencia}
                          onChange={(e) => handleInputChange('referencia', e.target.value)}
                          disabled={isLoading}
                          placeholder="Referencia o apodo"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          disabled={isLoading}
                          placeholder="cliente@email.com"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="telefono">Teléfono *</label>
                        <input
                          type="tel"
                          id="telefono"
                          value={formData.telefono}
                          onChange={(e) => handleInputChange('telefono', e.target.value)}
                          required
                          disabled={isLoading}
                          placeholder="+52 123 456 7890"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="cumple">Fecha de Cumpleaños</label>
                        <input
                          type="date"
                          id="cumple"
                          value={formData.cumple}
                          onChange={(e) => handleInputChange('cumple', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="categoriacliente">Categoría</label>
                        <select
                          id="categoriacliente"
                          value={formData.categoriacliente}
                          onChange={(e) => handleInputChange('categoriacliente', e.target.value as CategoriaCliente)}
                          disabled={isLoading}
                        >
                          <option value="NUEVO">🆕 Nuevo</option>
                          <option value="RECURRENTE">🔄 Recurrente</option>
                          <option value="FRECUENTE">⚡ Frecuente</option>
                          <option value="VIP">👑 VIP</option>
                          <option value="INACTIVO">😴 Inactivo</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="direccion">Dirección</label>
                      <textarea
                        id="direccion"
                        value={formData.direccion}
                        onChange={(e) => handleInputChange('direccion', e.target.value)}
                        disabled={isLoading}
                        placeholder="Dirección completa del cliente"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Sección: Seguimiento */}
                  <div className="form-section">
                    <h4 className="section-title">🎯 Seguimiento de Cliente</h4>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="estatus_seguimiento">Estado de Seguimiento</label>
                        <select
                          id="estatus_seguimiento"
                          value={formData.estatus_seguimiento}
                          onChange={(e) => handleInputChange('estatus_seguimiento', e.target.value as EstatusSeguimiento)}
                          disabled={isLoading}
                        >
                          <option value="NINGUNO">❌ Ninguno</option>
                          <option value="EN_PROSPECCIÓN">🔍 En Prospección</option>
                          <option value="EN_NEGOCIACIÓN">💼 En Negociación</option>
                          <option value="CERRADO">✅ Cerrado</option>
                          <option value="PERDIDO">❌ Perdido</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="medio_contacto">Medio de Contacto</label>
                        <select
                          id="medio_contacto"
                          value={formData.medio_contacto}
                          onChange={(e) => handleInputChange('medio_contacto', e.target.value as MedioContacto)}
                          disabled={isLoading}
                        >
                          <option value="WHATSAPP">📱 WhatsApp</option>
                          <option value="LLAMADA">📞 Llamada</option>
                          <option value="EMAIL">📧 Email</option>
                          <option value="OTRO">🔄 Otro</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="responsable_seguimiento">Responsable</label>
                        <input
                          type="text"
                          id="responsable_seguimiento"
                          value={formData.responsable_seguimiento}
                          onChange={(e) => handleInputChange('responsable_seguimiento', e.target.value)}
                          disabled={isLoading}
                          placeholder="Nombre del responsable"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="fechaultimoseguimiento">Último Seguimiento</label>
                        <input
                          type="date"
                          id="fechaultimoseguimiento"
                          value={formData.fechaultimoseguimiento}
                          onChange={(e) => handleInputChange('fechaultimoseguimiento', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="observacionesseguimiento">Observaciones</label>
                      <textarea
                        id="observacionesseguimiento"
                        value={formData.observacionesseguimiento}
                        onChange={(e) => handleInputChange('observacionesseguimiento', e.target.value)}
                        disabled={isLoading}
                        placeholder="Notas y observaciones del seguimiento"
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Sección: Información Adicional */}
                  <div className="form-section">
                    <h4 className="section-title">⭐ Información Adicional</h4>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="satisfaccion">Nivel de Satisfacción (1-5)</label>
                        <input
                          type="range"
                          id="satisfaccion"
                          min="1"
                          max="5"
                          value={formData.satisfaccion}
                          onChange={(e) => handleInputChange('satisfaccion', parseInt(e.target.value))}
                          disabled={isLoading}
                        />
                        <div className="range-value">
                          {'★'.repeat(formData.satisfaccion || 0)}{'☆'.repeat(5 - (formData.satisfaccion || 0))} ({formData.satisfaccion}/5)
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="puntosfidelidad">Puntos de Fidelidad</label>
                        <input
                          type="number"
                          id="puntosfidelidad"
                          min="0"
                          value={formData.puntosfidelidad}
                          onChange={(e) => handleInputChange('puntosfidelidad', parseInt(e.target.value) || 0)}
                          disabled={isLoading}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="comentarios">Comentarios Generales</label>
                      <textarea
                        id="comentarios"
                        value={formData.comentarios}
                        onChange={(e) => handleInputChange('comentarios', e.target.value)}
                        disabled={isLoading}
                        placeholder="Comentarios y notas adicionales"
                        rows={3}
                      />
                    </div>

                    {/* Switch de estado */}
                    <div className="form-group">
                      <label>Estado del Cliente</label>
                      <div className="form-switch switch-success">
                        <div className="switch-container">
                          <input
                            type="checkbox"
                            id="estatus"
                            checked={formData.estatus === 1}
                            onChange={(e) => handleInputChange('estatus', e.target.checked ? 1 : 0)}
                            disabled={isLoading}
                          />
                          <span className="switch-slider"></span>
                        </div>
                        <label htmlFor="estatus" className="switch-label">
                          <span className="switch-text">
                            {formData.estatus === 1 ? '🟢 Cliente Activo' : '🔴 Cliente Inactivo'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones del modal */}
                <div className="modal-actions">
                  <button 
                    type="button"
                    className="btn-secondary"
                    onClick={handleCerrarModal}
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Procesando...' : (isEditing ? 'Actualizar Cliente' : 'Crear Cliente')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Toast component */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      <style>{`
        .cliente-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 1.5rem;
          transition: all var(--transition-standard);
          position: relative;
          overflow: hidden;
        }

        .cliente-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--primary-400), var(--primary-600));
          border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
        }

        .cliente-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary-300);
        }

        .cliente-header-card {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .cliente-nombre {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.3;
        }

        .cliente-badges {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-end;
        }

        .badge-categoria {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: var(--border-radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .badge-seguimiento {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.5rem;
          border-radius: var(--border-radius);
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
          text-transform: capitalize;
        }

        .cliente-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-value {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
          word-break: break-word;
        }

        .valor-puntos {
          font-weight: 700;
          color: var(--primary-600);
        }

        .cliente-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .clientes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
          gap: 1.5rem;
          padding: 1rem 0;
        }

        .modal-large {
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .form-sections {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-section {
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border-color);
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 1.5rem 0;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .range-value {
          text-align: center;
          font-size: 1.125rem;
          color: var(--primary-600);
          margin-top: 0.5rem;
        }

        .btn-add-cliente {
          background: var(--primary-gradient);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: var(--border-radius-lg);
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-standard);
          box-shadow: var(--shadow-md);
        }

        .btn-add-cliente:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        @media (max-width: 768px) {
          .clientes-grid {
            grid-template-columns: 1fr;
          }

          .cliente-details {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .modal-large {
            max-width: 95vw;
            margin: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ConfigClientes;