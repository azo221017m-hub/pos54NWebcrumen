import React, { useState, useEffect } from 'react';
import type { ScreenType, Proveedor, CreateProveedorData, UpdateProveedorData } from '../types';
import { useAuth } from '../hooks/useAuth';
import Toast from './Toast';
import apiService from '../services/api';

interface Props {
  onNavigate: (screen: ScreenType) => void;
}

const ConfigProveedores: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  
  // Estados del componente
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentProveedor, setCurrentProveedor] = useState<Proveedor | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Estados del formulario
  const [formData, setFormData] = useState<CreateProveedorData>({
    nombre: '',
    rfc: '',
    telefono: '',
    correo: '',
    direccion: '',
    banco: '',
    cuenta: '',
    activo: true,
    usuarioauditoria: user?.nombre || 'ADMIN',
    idnegocio: user?.idNegocio || 1
  });

  // Estados para toast
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Función para mostrar toast
  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Función para cargar proveedores
  const cargarProveedores = async () => {
    setIsLoading(true);
    try {
      console.log('🏪 Cargando proveedores...');
      const response = await apiService.getProveedores();
      
      if (response.success && response.data) {
        setProveedores(response.data);
        console.log(`✅ Proveedores cargados: ${response.data.length}`);
        
        if (response.data.length === 0) {
          showToastMessage('No se encontraron proveedores', 'info');
        }
      } else {
        console.error('❌ Error en respuesta:', response.message);
        showToastMessage(`Error al cargar proveedores: ${response.message}`, 'error');
        setProveedores([]);
      }
    } catch (error) {
      console.error('💥 Error cargando proveedores:', error);
      showToastMessage('Error de conexión al cargar proveedores', 'error');
      setProveedores([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para cargar proveedores al montar el componente
  useEffect(() => {
    cargarProveedores();
  }, []);

  // Función para abrir modal de creación
  const handleAgregarProveedor = () => {
    setFormData({
      nombre: '',
      rfc: '',
      telefono: '',
      correo: '',
      direccion: '',
      banco: '',
      cuenta: '',
      activo: true,
      usuarioauditoria: user?.nombre || 'ADMIN',
      idnegocio: user?.idNegocio || 1
    });
    setCurrentProveedor(null);
    setIsEditing(false);
    setShowModal(true);
  };

  // Función para abrir modal de edición
  const handleEditarProveedor = (proveedor: Proveedor) => {
    setFormData({
      nombre: proveedor.nombre,
      rfc: proveedor.rfc,
      telefono: proveedor.telefono,
      correo: proveedor.correo,
      direccion: proveedor.direccion,
      banco: proveedor.banco,
      cuenta: proveedor.cuenta,
      activo: proveedor.activo,
      usuarioauditoria: user?.nombre || 'ADMIN',
      idnegocio: proveedor.idnegocio
    });
    setCurrentProveedor(proveedor);
    setIsEditing(true);
    setShowModal(true);
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (field: keyof CreateProveedorData, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para cerrar modal
  const handleCerrarModal = () => {
    setShowModal(false);
    setCurrentProveedor(null);
    setIsEditing(false);
  };

  // Función para guardar proveedor
  const handleGuardarProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre.trim()) {
      showToastMessage('El nombre del proveedor es requerido', 'error');
      return;
    }
    if (!formData.rfc.trim()) {
      showToastMessage('El RFC es requerido', 'error');
      return;
    }
    if (!formData.telefono.trim()) {
      showToastMessage('El teléfono es requerido', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      let response;
      
      if (isEditing && currentProveedor) {
        // Actualizar proveedor existente
        const updateData: UpdateProveedorData = {
          nombre: formData.nombre.trim(),
          rfc: formData.rfc.trim(),
          telefono: formData.telefono.trim(),
          correo: formData.correo.trim(),
          direccion: formData.direccion.trim(),
          banco: formData.banco.trim(),
          cuenta: formData.cuenta.trim(),
          activo: formData.activo,
          usuarioauditoria: formData.usuarioauditoria
        };
        
        console.log('🔄 Actualizando proveedor:', updateData);
        response = await apiService.updateProveedor(currentProveedor.id_proveedor, updateData);
      } else {
        // Crear nuevo proveedor
        console.log('✨ Creando nuevo proveedor:', formData);
        response = await apiService.createProveedor(formData);
      }

      if (response.success) {
        const action = isEditing ? 'actualizado' : 'creado';
        showToastMessage(`Proveedor ${action} exitosamente`, 'success');
        console.log(`✅ Proveedor ${action} exitosamente`);
        
        // Recargar lista de proveedores
        await cargarProveedores();
        handleCerrarModal();
      } else {
        console.error('❌ Error en la respuesta:', response.message);
        showToastMessage(`Error: ${response.message}`, 'error');
      }
    } catch (error) {
      console.error('💥 Error al guardar proveedor:', error);
      showToastMessage('Error de conexión al guardar proveedor', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cambiar estado de proveedor
  const handleToggleEstatus = async (proveedor: Proveedor) => {
    try {
      const nuevoEstatus = !proveedor.activo;
      console.log(`🔄 Cambiando estatus de proveedor ${proveedor.id_proveedor} a ${nuevoEstatus}`);
      
      const updateData: UpdateProveedorData = {
        activo: nuevoEstatus,
        usuarioauditoria: user?.nombre || 'ADMIN'
      };

      const response = await apiService.updateProveedor(proveedor.id_proveedor, updateData);
      
      if (response.success) {
        showToastMessage(`Proveedor ${nuevoEstatus ? 'activado' : 'desactivado'} exitosamente`, 'success');
        await cargarProveedores(); // Recargar lista
      } else {
        showToastMessage(`Error: ${response.message}`, 'error');
      }
    } catch (error) {
      console.error('💥 Error al cambiar estatus:', error);
      showToastMessage('Error de conexión al cambiar estatus', 'error');
    }
  };

  return (
    <div className="config-screen">
      {/* Header */}
      <div className="config-header">
        <button 
          onClick={() => onNavigate('tablero-inicial')}
          className="btn-back"
        >
          ← Regresar
        </button>
        <h1>Configuración de Proveedores</h1>
        <button 
          onClick={handleAgregarProveedor}
          className="btn-primary"
          disabled={isLoading}
        >
          + Agregar Proveedor
        </button>
      </div>

      {/* Contenido principal */}
      <div className="config-content">
        {isLoading && !showModal ? (
          <div className="loading">
            <p>🔄 Cargando proveedores...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>RFC</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="no-data">
                      No hay proveedores registrados
                    </td>
                  </tr>
                ) : (
                  proveedores.map((proveedor) => (
                    <tr key={proveedor.id_proveedor}>
                      <td>{proveedor.id_proveedor}</td>
                      <td>{proveedor.nombre}</td>
                      <td>{proveedor.rfc}</td>
                      <td>{proveedor.telefono}</td>
                      <td>{proveedor.correo}</td>
                      <td>
                        <button
                          onClick={() => handleToggleEstatus(proveedor)}
                          className={`btn-toggle ${proveedor.activo ? 'active' : 'inactive'}`}
                          title={`${proveedor.activo ? 'Desactivar' : 'Activar'} proveedor`}
                        >
                          {proveedor.activo ? '✅ Activo' : '❌ Inactivo'}
                        </button>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEditarProveedor(proveedor)}
                            className="btn-edit"
                            title="Editar proveedor"
                          >
                            ✏️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para agregar/editar proveedor */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {isEditing ? '✏️ Editar Proveedor' : '✨ Nuevo Proveedor'}
              </h3>
              <button className="btn-close" onClick={handleCerrarModal}>×</button>
            </div>

            <form onSubmit={handleGuardarProveedor} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre del Proveedor *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Nombre completo del proveedor"
                    maxLength={150}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">RFC *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.rfc}
                    onChange={(e) => handleInputChange('rfc', e.target.value.toUpperCase())}
                    placeholder="RFC del proveedor"
                    maxLength={20}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Teléfono *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    placeholder="Teléfono de contacto"
                    maxLength={30}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.correo}
                    onChange={(e) => handleInputChange('correo', e.target.value)}
                    placeholder="correo@ejemplo.com"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="form-row full-width">
                <div className="form-group">
                  <label className="form-label">Dirección</label>
                  <textarea
                    className="form-input"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    placeholder="Dirección completa del proveedor"
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Banco</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.banco}
                    onChange={(e) => handleInputChange('banco', e.target.value)}
                    placeholder="Nombre del banco"
                    maxLength={100}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Número de Cuenta</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.cuenta}
                    onChange={(e) => handleInputChange('cuenta', e.target.value)}
                    placeholder="Número de cuenta bancaria"
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Estado del Proveedor *</label>
                  <div className="switch-container">
                    <div className="switch-group">
                      <button
                        type="button"
                        className={`switch-option ${formData.activo ? 'active' : ''}`}
                        onClick={() => handleInputChange('activo', true)}
                      >
                        ✅ ACTIVO
                      </button>
                      <button
                        type="button"
                        className={`switch-option ${!formData.activo ? 'active' : ''}`}
                        onClick={() => handleInputChange('activo', false)}
                      >
                        ❌ INACTIVO
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCerrarModal}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={isLoading}
                >
                  {isLoading ? '🔄 Guardando...' : (isEditing ? 'Actualizar' : 'Crear Proveedor')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Component */}
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

export default ConfigProveedores;
