import React, { useState, useEffect } from 'react';
import type { ScreenType, RolUsuario, CreateRolUsuarioData, PrivilegioRol } from '../types';
import Toast from './Toast';
import apiService from '../services/api';
import '../styles/FormStyles.css';

interface Props {
  onNavigate: (screen: ScreenType) => void;
}

const ConfigRoldeUsuario: React.FC<Props> = ({ onNavigate }) => {
  // Estados del componente
  const [roles, setRoles] = useState<RolUsuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRol, setCurrentRol] = useState<RolUsuario | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Estados del formulario
  const [formData, setFormData] = useState<CreateRolUsuarioData>({
    nombreRol: '',
    descripcion: '',
    privilegio: '1',
    estatus: 1,
    usuarioauditoria: 'ADMIN',
    idnegocio: 1
  });

  // Función para mostrar mensajes Toast
  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Función para cargar roles desde la API
  const cargarRoles = async () => {
    try {
      setIsLoading(true);
      console.log('📋 Cargando roles de usuario');
      
      const response = await apiService.getRoles();
      
      if (response.success && response.data) {
        setRoles(response.data);
        console.log(`✅ Roles cargados: ${response.data.length}`);
      } else {
        console.error('❌ Error en la respuesta de roles:', response);
        showToastMessage('Error al cargar los roles', 'error');
        setRoles([]);
      }
    } catch (error) {
      console.error('❌ Error cargando roles:', error);
      showToastMessage('Error de conexión al cargar roles', 'error');
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar roles al montar el componente
  useEffect(() => {
    cargarRoles();
  }, []);

  // Función para abrir modal para crear nuevo rol
  const handleNuevoRol = () => {
    setIsEditing(false);
    setCurrentRol(null);
    setFormData({
      nombreRol: '',
      descripcion: '',
      privilegio: '1',
      estatus: 1,
      usuarioauditoria: 'ADMIN',
      idnegocio: 1
    });
    setShowModal(true);
  };

  // Función para abrir modal para editar rol
  const handleEditarRol = (rol: RolUsuario) => {
    setIsEditing(true);
    setCurrentRol(rol);
    setFormData({
      nombreRol: rol.nombreRol,
      descripcion: rol.descripcion,
      privilegio: rol.privilegio as PrivilegioRol,
      estatus: rol.estatus,
      usuarioauditoria: 'ADMIN',
      idnegocio: rol.idnegocio
    });
    setShowModal(true);
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estatus' ? parseInt(value) : value
    }));
  };

  // Función para guardar rol (crear o actualizar)
  const handleGuardarRol = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombreRol.trim() || !formData.descripcion.trim()) {
      showToastMessage('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    try {
      setIsLoading(true);

      let response;
      if (isEditing && currentRol) {
        console.log('🔄 Actualizando rol:', formData);
        response = await apiService.updateRol(currentRol.idRol, formData);
      } else {
        console.log('👤 Creando nuevo rol:', formData);
        response = await apiService.createRol(formData);
      }

      if (response.success) {
        showToastMessage(
          isEditing ? 'Rol actualizado exitosamente' : 'Rol creado exitosamente',
          'success'
        );
        await cargarRoles();
        setShowModal(false);
      } else {
        showToastMessage(response.message || 'Error al guardar el rol', 'error');
      }
    } catch (error) {
      console.error('❌ Error guardando rol:', error);
      showToastMessage('Error de conexión al guardar rol', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar rol
  const handleEliminarRol = async (rol: RolUsuario) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el rol "${rol.nombreRol}"?`)) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('🗑️ Eliminando rol:', rol.idRol);
      
      const response = await apiService.deleteRol(rol.idRol, {
        usuarioauditoria: 'ADMIN'
      });

      if (response.success) {
        showToastMessage('Rol eliminado exitosamente', 'success');
        await cargarRoles();
      } else {
        showToastMessage(response.message || 'Error al eliminar el rol', 'error');
      }
    } catch (error) {
      console.error('❌ Error eliminando rol:', error);
      showToastMessage('Error de conexión al eliminar rol', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para formatear el nivel de privilegio
  const formatearPrivilegio = (privilegio: string): string => {
    const privilegios: Record<string, string> = {
      '1': 'Básico',
      '2': 'Intermedio',
      '3': 'Avanzado',
      '4': 'Administrador'
    };
    return privilegios[privilegio] || privilegio;
  };

  // Función para formatear el estatus
  const formatearEstatus = (estatus: number): string => {
    return estatus === 1 ? 'Activo' : 'Inactivo';
  };

  // Estilos CSS inline para minicards y modal
  const componentStyles = `
    .roles-container {
      padding: 1.5rem;
      background: #f8fafc;
      min-height: 100vh;
    }
    
    .roles-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
    
    .roles-title {
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .btn-add-rol {
      padding: 0.75rem 1.5rem;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .btn-add-rol:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
    }
    
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .rol-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;
      position: relative;
    }
    
    .rol-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }
    
    .card-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0;
      margin-bottom: 0.5rem;
    }
    
    .card-status {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .status-active {
      background: #c6f6d5;
      color: #22543d;
    }
    
    .status-inactive {
      background: #fed7d7;
      color: #742a2a;
    }
    
    .card-description {
      color: #718096;
      margin-bottom: 1rem;
      line-height: 1.5;
      min-height: 2.5rem;
    }
    
    .card-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
    }
    
    .info-label {
      font-weight: 600;
      color: #4a5568;
      margin-bottom: 0.25rem;
    }
    
    .info-value {
      color: #718096;
    }
    
    .privilege-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    
    .privilege-1 { background: #e6fffa; color: #234e52; }
    .privilege-2 { background: #ebf8ff; color: #2a4365; }
    .privilege-3 { background: #fef5e7; color: #744210; }
    .privilege-4 { background: #fed7d7; color: #742a2a; }
    
    .card-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
    }
    
    .btn-card-action {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .btn-edit-card {
      background: #e6fffa;
      color: #234e52;
      border: 1px solid #b2f5ea;
    }
    
    .btn-edit-card:hover {
      background: #b2f5ea;
      transform: translateY(-2px);
    }
    
    .btn-delete-card {
      background: #fed7d7;
      color: #742a2a;
      border: 1px solid #feb2b2;
    }
    
    .btn-delete-card:hover {
      background: #feb2b2;
      transform: translateY(-2px);
    }
    
    .btn-regresar {
      padding: 0.75rem 1.5rem;
      background: #4a5568;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .btn-regresar:hover {
      background: #2d3748;
      transform: translateY(-2px);
    }
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 0;
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px 12px 0 0;
    }
    
    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .btn-close {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: white;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    
    .btn-close:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    .modal-body {
      padding: 1.5rem;
    }
    
    .modal-footer {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #374151;
    }
    
    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      transition: border-color 0.2s ease;
    }
    
    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .form-group textarea {
      resize: vertical;
      min-height: 80px;
    }
    
    .toggle-container {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .toggle-switch {
      position: relative;
      width: 60px;
      height: 30px;
      background: #cbd5e0;
      border-radius: 30px;
      cursor: pointer;
      transition: background 0.3s ease;
    }
    
    .toggle-switch.active {
      background: #48bb78;
    }
    
    .toggle-knob {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 24px;
      height: 24px;
      background: white;
      border-radius: 50%;
      transition: transform 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .toggle-switch.active .toggle-knob {
      transform: translateX(30px);
    }
    
    .toggle-label {
      font-weight: 600;
      color: #374151;
    }
    
    .loading-message {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
      font-size: 1.1rem;
    }
    
    .empty-message {
      text-align: center;
      padding: 3rem 2rem;
      color: #6b7280;
    }
    
    .empty-message h3 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: #374151;
    }
    
    .empty-message p {
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }
  `;

  return (
    <>
      {/* Estilos CSS inline */}
      <style>{componentStyles}</style>

      <div className="roles-container">
        {/* Botón regresar */}
        <button
          className="btn-regresar"
          onClick={() => onNavigate('tablero-inicial')}
          disabled={isLoading}
        >
          ← Regresar al Tablero
        </button>

        {/* Header con título y botón agregar */}
        <div className="roles-header">
          <h1 className="roles-title">
            👤 Roles de Usuario
          </h1>
          <button
            className="btn-add-rol"
            onClick={handleNuevoRol}
            disabled={isLoading}
          >
            + Agregar Rol
          </button>
        </div>

        {/* Contenido principal */}
        {isLoading && roles.length === 0 ? (
          <div className="loading-message">
            <p>Cargando roles de usuario...</p>
          </div>
        ) : roles.length === 0 ? (
          <div className="empty-message">
            <h3>No hay roles de usuario</h3>
            <p>Comienza agregando el primer rol de usuario para tu sistema.</p>
            <button
              className="btn-add-rol"
              onClick={handleNuevoRol}
              style={{ position: 'static', transform: 'none' }}
            >
              + Crear Primer Rol
            </button>
          </div>
        ) : (
          <div className="cards-grid">
            {roles.map((rol) => (
              <div key={rol.idRol} className="rol-card">
                <div className="card-header">
                  <h3 className="card-title">{rol.nombreRol}</h3>
                  <span className={`card-status ${rol.estatus === 1 ? 'status-active' : 'status-inactive'}`}>
                    {formatearEstatus(rol.estatus)}
                  </span>
                </div>

                <p className="card-description">{rol.descripcion}</p>

                <div className="card-info">
                  <div className="info-item">
                    <span className="info-label">Privilegio:</span>
                    <span className={`privilege-badge privilege-${rol.privilegio}`}>
                      {formatearPrivilegio(rol.privilegio)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Usuario:</span>
                    <span className="info-value">{rol.usuarioauditoria}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="btn-card-action btn-edit-card"
                    onClick={() => handleEditarRol(rol)}
                    disabled={isLoading}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btn-card-action btn-delete-card"
                    onClick={() => handleEliminarRol(rol)}
                    disabled={isLoading}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal para crear/editar rol */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{isEditing ? 'Editar Rol' : 'Nuevo Rol'}</h2>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  disabled={isLoading}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleGuardarRol}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Nombre del Rol *</label>
                    <input
                      type="text"
                      name="nombreRol"
                      value={formData.nombreRol}
                      onChange={handleInputChange}
                      placeholder="Ingrese el nombre del rol"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Descripción *</label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      placeholder="Describe las responsabilidades y permisos de este rol"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Nivel de Privilegio *</label>
                    <select
                      name="privilegio"
                      value={formData.privilegio}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    >
                      <option value="1">1 - Básico</option>
                      <option value="2">2 - Intermedio</option>
                      <option value="3">3 - Avanzado</option>
                      <option value="4">4 - Administrador</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Estado del Rol</label>
                    <div className="toggle-container">
                      <div
                        className={`toggle-switch ${formData.estatus === 1 ? 'active' : ''}`}
                        onClick={() => {
                          if (!isLoading) {
                            setFormData(prev => ({
                              ...prev,
                              estatus: prev.estatus === 1 ? 0 : 1
                            }));
                          }
                        }}
                      >
                        <div className="toggle-knob"></div>
                      </div>
                      <span className="toggle-label">
                        {formData.estatus === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast para notificaciones */}
        {showToast && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </>
  );
};

export default ConfigRoldeUsuario;