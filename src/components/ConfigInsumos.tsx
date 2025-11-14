// Componente ConfigInsumos - Gestión de Insumos
import React, { useState, useEffect } from 'react';
import type { 
  ScreenType, 
  InsumoWeb, 
  CreateInsumoWebData, 
  UpdateInsumoWebData, 
  UnidadMedidaInsumo,
  CuentaContable
} from '../types';
import { UNIDADES_MEDIDA_INSUMO } from '../types';
import Toast from './Toast';
// import apiService from '../services/api'; // No usado actualmente
import { useAuth } from '../hooks/useAuth';

interface Props {
  onNavigate: (screen: ScreenType) => void;
}

const ConfigInsumos: React.FC<Props> = ({ onNavigate }) => {
  const { user: currentUser } = useAuth();
  
  // Estados del componente
  const [insumos, setInsumos] = useState<InsumoWeb[]>([]);
  const [cuentasContables, setCuentasContables] = useState<CuentaContable[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentInsumo, setCurrentInsumo] = useState<InsumoWeb | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Estados del formulario
  const [formData, setFormData] = useState<CreateInsumoWebData>({
    nombre: '',
    unidad_medida: 'Kg' as UnidadMedidaInsumo,
    stock_actual: 0,
    stock_minimo: 0,
    id_cuentacontable_insumo: '',
    activo: true,
    inventariable: true,
    usuarioauditoria: currentUser?.nombre || 'system',
    idnegocio: currentUser?.idNegocio || 1
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

  // Función para cargar insumos
  const cargarInsumos = async () => {
    setIsLoading(true);
    try {
      console.log('📦 Cargando insumos...');
      const response = await fetch('/api/insumos');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('📊 Insumos cargados:', data.data.length);
        setInsumos(data.data);
        showToastMessage(`✅ ${data.data.length} insumos cargados exitosamente`, 'success');
      } else {
        console.error('❌ Error en respuesta:', data);
        showToastMessage('❌ Error al cargar insumos', 'error');
      }
    } catch (error) {
      console.error('❌ Error cargando insumos:', error);
      showToastMessage('❌ Error de conexión al cargar insumos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar cuentas contables
  const cargarCuentasContables = async () => {
    try {
      console.log('💰 Cargando cuentas contables...');
      const response = await fetch('/api/cuentas-contables');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        console.log('📊 Cuentas contables cargadas:', data.data.length);
        setCuentasContables(data.data);
        
        // Si no hay cuenta seleccionada y hay cuentas disponibles, seleccionar la primera
        if (!formData.id_cuentacontable_insumo && data.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            id_cuentacontable_insumo: data.data[0].id_cuentacontable.toString()
          }));
        }
      } else {
        console.error('❌ Error en respuesta de cuentas contables:', data);
      }
    } catch (error) {
      console.error('❌ Error cargando cuentas contables:', error);
    }
  };

  // Función para resetear el formulario y abrir modal para nuevo insumo
  const handleNuevoInsumo = () => {
    console.log('➕ Abriendo modal para nuevo insumo');
    setIsEditing(false);
    setCurrentInsumo(null);
    setFormData({
      nombre: '',
      unidad_medida: 'Kg' as UnidadMedidaInsumo,
      stock_actual: 0,
      stock_minimo: 0,
      id_cuentacontable_insumo: cuentasContables.length > 0 ? cuentasContables[0].id_cuentacontable.toString() : '',
      activo: true,
      inventariable: true,
      usuarioauditoria: currentUser?.nombre || 'system',
      idnegocio: currentUser?.idNegocio || 1
    });
    setShowModal(true);
  };

  // Función para abrir modal de edición
  const handleEditarInsumo = (insumo: InsumoWeb) => {
    console.log('✏️ Abriendo modal para editar insumo:', insumo.nombre);
    setIsEditing(true);
    setCurrentInsumo(insumo);
    setFormData({
      nombre: insumo.nombre,
      unidad_medida: insumo.unidad_medida,
      stock_actual: insumo.stock_actual,
      stock_minimo: insumo.stock_minimo,
      id_cuentacontable_insumo: insumo.id_cuentacontable_insumo,
      activo: insumo.activo,
      inventariable: insumo.inventariable,
      usuarioauditoria: currentUser?.nombre || 'system',
      idnegocio: currentUser?.idNegocio || 1
    });
    setShowModal(true);
  };

  // Función para manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Manejar campos numéricos
    if (name === 'stock_actual' || name === 'stock_minimo') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } 
    // Manejar campos booleanos (switches)
    else if (name === 'activo' || name === 'inventariable') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } 
    // Manejar campos de texto
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Función para guardar insumo (crear o actualizar)
  const handleGuardarInsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre.trim()) {
      showToastMessage('❌ El nombre del insumo es requerido', 'error');
      return;
    }
    
    if (formData.stock_actual < 0) {
      showToastMessage('❌ El stock actual debe ser mayor o igual a 0', 'error');
      return;
    }
    
    if (formData.stock_minimo < 0) {
      showToastMessage('❌ El stock mínimo debe ser mayor o igual a 0', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isEditing && currentInsumo) {
        // Actualizar insumo existente
        console.log('🔄 Actualizando insumo:', currentInsumo.id_insumo);
        
        const updateData: UpdateInsumoWebData = {
          nombre: formData.nombre.trim(),
          unidad_medida: formData.unidad_medida,
          stock_actual: formData.stock_actual,
          stock_minimo: formData.stock_minimo,
          id_cuentacontable_insumo: formData.id_cuentacontable_insumo,
          activo: formData.activo,
          inventariable: formData.inventariable,
          usuarioauditoria: formData.usuarioauditoria
        };
        
        const response = await fetch(`/api/insumos/${currentInsumo.id_insumo}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
        
        const data = await response.json();
        
        if (data.success) {
          showToastMessage('✅ Insumo actualizado exitosamente', 'success');
          handleCloseModal();
          await cargarInsumos();
        } else {
          showToastMessage(`❌ Error: ${data.message}`, 'error');
        }
      } else {
        // Crear nuevo insumo
        console.log('➕ Creando nuevo insumo');
        
        const response = await fetch('/api/insumos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        const data = await response.json();
        
        if (data.success) {
          showToastMessage('✅ Insumo creado exitosamente', 'success');
          handleCloseModal();
          await cargarInsumos();
        } else {
          showToastMessage(`❌ Error: ${data.message}`, 'error');
        }
      }
    } catch (error) {
      console.error('❌ Error guardando insumo:', error);
      showToastMessage('❌ Error de conexión al guardar insumo', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar insumo
  const handleEliminarInsumo = async (insumo: InsumoWeb) => {
    if (!window.confirm(`¿Estás seguro de eliminar el insumo "${insumo.nombre}"?`)) {
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🗑️ Eliminando insumo:', insumo.id_insumo);
      
      const response = await fetch(`/api/insumos/${insumo.id_insumo}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        showToastMessage('✅ Insumo eliminado exitosamente', 'success');
        await cargarInsumos();
      } else {
        showToastMessage(`❌ Error: ${data.message}`, 'error');
      }
    } catch (error) {
      console.error('❌ Error eliminando insumo:', error);
      showToastMessage('❌ Error de conexión al eliminar insumo', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentInsumo(null);
    setIsEditing(false);
  };

  // Efecto para cargar insumos y cuentas contables al montar el componente
  useEffect(() => {
    cargarInsumos();
    cargarCuentasContables();
  }, []);

  return (
    <div className="config-screen">
      {/* Header */}
      <div className="config-header">
        <div className="header-left">
          <button 
            className="btn-back"
            onClick={() => onNavigate('tablero-inicial')}
            title="Regresar al Tablero Inicial"
          >
            ← Regresar
          </button>
          <h1>📦 Configuración de Insumos</h1>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={handleNuevoInsumo}
            disabled={isLoading}
          >
            ➕ Agregar Insumo Nuevo
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Cargando...</span>
        </div>
      )}

      {/* Contenido principal - Minicards */}
      <div className="minicards-container">
        {insumos.length === 0 && !isLoading ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No hay insumos registrados</h3>
            <p>Comienza agregando tu primer insumo</p>
            <button className="btn-primary" onClick={handleNuevoInsumo}>
              ➕ Agregar Insumo
            </button>
          </div>
        ) : (
          <div className="minicards-grid">
            {insumos.map((insumo) => (
              <div key={insumo.id_insumo} className="minicard">
                <div className="minicard-header">
                  <h3 className="minicard-title">{insumo.nombre}</h3>
                  <div className="minicard-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditarInsumo(insumo)}
                      title="Editar insumo"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleEliminarInsumo(insumo)}
                      title="Eliminar insumo"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="minicard-content">
                  <div className="field-row">
                    <span className="field-label">Unidad:</span>
                    <span className="field-value">{insumo.unidad_medida}</span>
                  </div>
                  
                  <div className="field-row">
                    <span className="field-label">Stock Actual:</span>
                    <span className="field-value">{insumo.stock_actual.toFixed(2)}</span>
                  </div>
                  
                  <div className="field-row">
                    <span className="field-label">Stock Mínimo:</span>
                    <span className="field-value">{insumo.stock_minimo.toFixed(2)}</span>
                  </div>
                  
                  <div className="field-row">
                    <span className="field-label">Cuenta Contable:</span>
                    <span className="field-value">
                      {cuentasContables.find(cc => cc.id_cuentacontable.toString() === insumo.id_cuentacontable_insumo)?.nombrecuentacontable || insumo.id_cuentacontable_insumo}
                    </span>
                  </div>
                  
                  <div className="field-row">
                    <span className="field-label">Estado:</span>
                    <span className={`status-badge ${insumo.activo ? 'active' : 'inactive'}`}>
                      {insumo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  <div className="field-row">
                    <span className="field-label">Inventariable:</span>
                    <span className="field-value">{insumo.inventariable ? 'Sí' : 'No'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para formulario */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? '✏️ Editar Insumo' : '➕ Nuevo Insumo'}</h2>
              <button 
                className="modal-close"
                onClick={handleCloseModal}
                type="button"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarInsumo} className="modal-form">
              <div className="form-content">
                {/* Primera fila - Nombre */}
                <div className="form-row full-width">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre del Insumo *</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: Harina de trigo, Aceite vegetal..."
                    />
                  </div>
                </div>

                {/* Segunda fila - Unidad de medida y cuenta contable */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="unidad_medida">Unidad de Medida *</label>
                    <select
                      id="unidad_medida"
                      name="unidad_medida"
                      value={formData.unidad_medida}
                      onChange={handleInputChange}
                      required
                      className="form-select"
                    >
                      {UNIDADES_MEDIDA_INSUMO.map((unidad) => (
                        <option key={unidad.value} value={unidad.value}>
                          {unidad.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="id_cuentacontable_insumo">Cuenta Contable *</label>
                    <select
                      id="id_cuentacontable_insumo"
                      name="id_cuentacontable_insumo"
                      value={formData.id_cuentacontable_insumo}
                      onChange={handleInputChange}
                      required
                      className="form-select"
                    >
                      {cuentasContables.length === 0 ? (
                        <option value="">Cargando cuentas contables...</option>
                      ) : (
                        cuentasContables.map((cuenta) => (
                          <option key={cuenta.id_cuentacontable} value={cuenta.id_cuentacontable.toString()}>
                            {cuenta.nombrecuentacontable} ({cuenta.naturalezacuentacontable})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Tercera fila - Stocks */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="stock_actual">Stock Actual *</label>
                    <input
                      type="number"
                      id="stock_actual"
                      name="stock_actual"
                      value={formData.stock_actual}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="stock_minimo">Stock Mínimo *</label>
                    <input
                      type="number"
                      id="stock_minimo"
                      name="stock_minimo"
                      value={formData.stock_minimo}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Cuarta fila - Inventariable y Estado */}
                <div className="form-row">
                  <div className="form-group">
                    <div className="form-switch-container">
                      <label className="form-switch-label">Inventariable *</label>
                      <label className="form-switch">
                        <input
                          type="checkbox"
                          id="inventariable"
                          name="inventariable"
                          checked={formData.inventariable}
                          onChange={handleInputChange}
                        />
                        <span className="form-slider"></span>
                      </label>
                      <span className="form-switch-label">
                        {formData.inventariable ? 'Sí' : 'No'}
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="form-switch-container">
                      <label className="form-switch-label">Insumo Activo *</label>
                      <label className="form-switch">
                        <input
                          type="checkbox"
                          id="activo"
                          name="activo"
                          checked={formData.activo}
                          onChange={handleInputChange}
                        />
                        <span className="form-slider"></span>
                      </label>
                      <span className="form-switch-label">
                        {formData.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
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

export default ConfigInsumos;