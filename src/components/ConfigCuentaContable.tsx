// Componente ConfigCuentaContable - Gestión de Cuentas Contables
import React, { useState, useEffect } from 'react';
import type { 
  ScreenType, 
  CuentaContable, 
  CreateCuentaContableData, 
  UpdateCuentaContableData, 
  NaturalezaCuentaContable,
  TipoCuentaContable
} from '../types';
import { 
  TIPOS_CUENTA_COMPRA, 
  TIPOS_CUENTA_GASTO 
} from '../types';
import Toast from './Toast';
import { useAuth } from '../hooks/useAuth';

interface Props {
  onNavigate: (screen: ScreenType) => void;
}

const ConfigCuentaContable: React.FC<Props> = ({ onNavigate }) => {
  const { user: currentUser } = useAuth();
  
  // Estados del componente
  const [cuentasContables, setCuentasContables] = useState<CuentaContable[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentCuenta, setCurrentCuenta] = useState<CuentaContable | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Estados del formulario
  const [formData, setFormData] = useState<CreateCuentaContableData>({
    naturalezacuentacontable: 'COMPRA' as NaturalezaCuentaContable,
    nombrecuentacontable: '',
    tipocuentacontable: 'Inventario' as TipoCuentaContable,
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

  // Función para cargar cuentas contables
  const cargarCuentasContables = async () => {
    setIsLoading(true);
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
        showToastMessage(`✅ ${data.data.length} cuentas contables cargadas exitosamente`, 'success');
      } else {
        console.error('❌ Error en respuesta:', data);
        showToastMessage('❌ Error al cargar cuentas contables', 'error');
      }
    } catch (error) {
      console.error('❌ Error cargando cuentas contables:', error);
      showToastMessage('❌ Error de conexión al cargar cuentas contables', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para resetear el formulario y abrir modal para nueva cuenta
  const handleNuevaCuenta = () => {
    console.log('➕ Abriendo modal para nueva cuenta contable');
    setIsEditing(false);
    setCurrentCuenta(null);
    setFormData({
      naturalezacuentacontable: 'COMPRA' as NaturalezaCuentaContable,
      nombrecuentacontable: '',
      tipocuentacontable: 'Inventario' as TipoCuentaContable,
      usuarioauditoria: currentUser?.nombre || 'system',
      idnegocio: currentUser?.idNegocio || 1
    });
    setShowModal(true);
  };

  // Función para abrir modal de edición
  const handleEditarCuenta = (cuenta: CuentaContable) => {
    console.log('✏️ Abriendo modal para editar cuenta contable:', cuenta.nombrecuentacontable);
    setIsEditing(true);
    setCurrentCuenta(cuenta);
    setFormData({
      naturalezacuentacontable: cuenta.naturalezacuentacontable,
      nombrecuentacontable: cuenta.nombrecuentacontable,
      tipocuentacontable: cuenta.tipocuentacontable,
      usuarioauditoria: currentUser?.nombre || 'system',
      idnegocio: currentUser?.idNegocio || 1
    });
    setShowModal(true);
  };

  // Función para manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Si cambia la naturaleza, resetear el tipo a un valor válido
      if (name === 'naturalezacuentacontable') {
        newData.tipocuentacontable = value === 'COMPRA' ? 'Inventario' : 'Operativo';
      }
      
      return newData;
    });
  };

  // Función para manejar cambio en radio buttons
  const handleRadioChange = (value: NaturalezaCuentaContable) => {
    setFormData(prev => ({
      ...prev,
      naturalezacuentacontable: value,
      tipocuentacontable: value === 'COMPRA' ? 'Inventario' : 'Operativo'
    }));
  };

  // Función para obtener opciones de tipo según naturaleza
  const getTiposDisponibles = () => {
    return formData.naturalezacuentacontable === 'COMPRA' 
      ? TIPOS_CUENTA_COMPRA 
      : TIPOS_CUENTA_GASTO;
  };

  // Función para guardar cuenta contable (crear o actualizar)
  const handleGuardarCuenta = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombrecuentacontable.trim()) {
      showToastMessage('❌ El nombre de la cuenta contable es requerido', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isEditing && currentCuenta) {
        // Actualizar cuenta existente
        console.log('🔄 Actualizando cuenta contable:', currentCuenta.id_cuentacontable);
        
        const updateData: UpdateCuentaContableData = {
          naturalezacuentacontable: formData.naturalezacuentacontable,
          nombrecuentacontable: formData.nombrecuentacontable.trim(),
          tipocuentacontable: formData.tipocuentacontable,
          usuarioauditoria: formData.usuarioauditoria
        };
        
        const response = await fetch(`/api/cuentas-contables/${currentCuenta.id_cuentacontable}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
        
        const data = await response.json();
        
        if (data.success) {
          showToastMessage('✅ Cuenta contable actualizada exitosamente', 'success');
          handleCloseModal();
          await cargarCuentasContables();
        } else {
          showToastMessage(`❌ Error: ${data.message}`, 'error');
        }
      } else {
        // Crear nueva cuenta
        console.log('➕ Creando nueva cuenta contable');
        
        const response = await fetch('/api/cuentas-contables', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        const data = await response.json();
        
        if (data.success) {
          showToastMessage('✅ Cuenta contable creada exitosamente', 'success');
          handleCloseModal();
          await cargarCuentasContables();
        } else {
          showToastMessage(`❌ Error: ${data.message}`, 'error');
        }
      }
    } catch (error) {
      console.error('❌ Error guardando cuenta contable:', error);
      showToastMessage('❌ Error de conexión al guardar cuenta contable', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar cuenta contable
  const handleEliminarCuenta = async (cuenta: CuentaContable) => {
    if (!window.confirm(`¿Estás seguro de eliminar la cuenta contable "${cuenta.nombrecuentacontable}"?`)) {
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🗑️ Eliminando cuenta contable:', cuenta.id_cuentacontable);
      
      const response = await fetch(`/api/cuentas-contables/${cuenta.id_cuentacontable}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        showToastMessage('✅ Cuenta contable eliminada exitosamente', 'success');
        await cargarCuentasContables();
      } else {
        showToastMessage(`❌ Error: ${data.message}`, 'error');
      }
    } catch (error) {
      console.error('❌ Error eliminando cuenta contable:', error);
      showToastMessage('❌ Error de conexión al eliminar cuenta contable', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentCuenta(null);
    setIsEditing(false);
  };

  // Efecto para cargar cuentas contables al montar el componente
  useEffect(() => {
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
          <h1>💰 Configuración de Cuentas Contables</h1>
        </div>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={handleNuevaCuenta}
            disabled={isLoading}
          >
            ➕ Agregar Cuenta Contable
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
        {cuentasContables.length === 0 && !isLoading ? (
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <h3>No hay cuentas contables registradas</h3>
            <p>Comienza agregando tu primera cuenta contable</p>
            <button className="btn-primary" onClick={handleNuevaCuenta}>
              ➕ Agregar Cuenta Contable
            </button>
          </div>
        ) : (
          <div className="minicards-grid">
            {cuentasContables.map((cuenta) => (
              <div key={cuenta.id_cuentacontable} className="minicard">
                <div className="minicard-header">
                  <h3 className="minicard-title">{cuenta.nombrecuentacontable}</h3>
                  <div className="minicard-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditarCuenta(cuenta)}
                      title="Editar cuenta contable"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleEliminarCuenta(cuenta)}
                      title="Eliminar cuenta contable"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="minicard-content">
                  <div className="field-row">
                    <span className="field-label">Naturaleza:</span>
                    <span className={`status-badge ${cuenta.naturalezacuentacontable === 'COMPRA' ? 'compra' : 'gasto'}`}>
                      {cuenta.naturalezacuentacontable}
                    </span>
                  </div>
                  
                  <div className="field-row">
                    <span className="field-label">Tipo:</span>
                    <span className="field-value">{cuenta.tipocuentacontable}</span>
                  </div>
                  
                  <div className="field-row">
                    <span className="field-label">Usuario:</span>
                    <span className="field-value">{cuenta.usuarioauditoria}</span>
                  </div>
                  
                  <div className="field-row">
                    <span className="field-label">Fecha Registro:</span>
                    <span className="field-value">
                      {new Date(cuenta.fechaRegistroauditoria).toLocaleDateString()}
                    </span>
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
              <h2>{isEditing ? '✏️ Editar Cuenta Contable' : '➕ Nueva Cuenta Contable'}</h2>
              <button 
                className="modal-close"
                onClick={handleCloseModal}
                type="button"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarCuenta} className="modal-form">
              <div className="form-content">
                {/* Primera fila - Nombre */}
                <div className="form-row full-width">
                  <div className="form-group">
                    <label htmlFor="nombrecuentacontable">Nombre de la Cuenta Contable *</label>
                    <input
                      type="text"
                      id="nombrecuentacontable"
                      name="nombrecuentacontable"
                      value={formData.nombrecuentacontable}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: Inventario de Materias Primas, Gastos Operativos..."
                    />
                  </div>
                </div>

                {/* Segunda fila - Naturaleza (Radio buttons) */}
                <div className="form-row full-width">
                  <div className="form-group">
                    <label className="form-label">Naturaleza de Cuenta *</label>
                    <div className="radio-group">
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="naturalezacuentacontable"
                          value="COMPRA"
                          checked={formData.naturalezacuentacontable === 'COMPRA'}
                          onChange={() => handleRadioChange('COMPRA')}
                        />
                        <span className="radio-text">💰 COMPRA</span>
                      </label>
                      <label className="radio-option">
                        <input
                          type="radio"
                          name="naturalezacuentacontable"
                          value="GASTO"
                          checked={formData.naturalezacuentacontable === 'GASTO'}
                          onChange={() => handleRadioChange('GASTO')}
                        />
                        <span className="radio-text">💸 GASTO</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Tercera fila - Tipo de cuenta (Dropdown condicional) */}
                <div className="form-row full-width">
                  <div className="form-group">
                    <label htmlFor="tipocuentacontable">Tipo de Cuenta *</label>
                    <select
                      id="tipocuentacontable"
                      name="tipocuentacontable"
                      value={formData.tipocuentacontable}
                      onChange={handleInputChange}
                      required
                      className="form-select"
                    >
                      {getTiposDisponibles().map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                    <div className="form-help">
                      {formData.naturalezacuentacontable === 'COMPRA' 
                        ? 'Tipos disponibles para cuentas de COMPRA'
                        : 'Tipos disponibles para cuentas de GASTO'
                      }
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

export default ConfigCuentaContable;