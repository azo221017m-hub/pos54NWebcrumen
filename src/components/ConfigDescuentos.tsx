import React, { useState, useEffect } from 'react';
import type { ScreenType, Descuento, CreateDescuentoData, TipoDescuento } from '../types';
import Toast from './Toast';
import apiService from '../services/api';
import '../styles/FormStyles.css';

interface Props {
  onNavigate: (screen: ScreenType) => void;
}

const ConfigDescuentos: React.FC<Props> = ({ onNavigate }) => {
  // Estados del componente
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentDescuento, setCurrentDescuento] = useState<Descuento | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Estados del formulario
  const [formData, setFormData] = useState<CreateDescuentoData>({
    nombre: '',
    tipodescuento: '$',
    valor: 0,
    estatusdescuento: 'ACTIVO',
    requiereautorizacion: 'NO',
    usuarioauditoria: 'ADMIN',
    idnegocio: 1
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

  // Función para cargar descuentos
  const cargarDescuentos = async () => {
    setIsLoading(true);
    try {
      console.log('💰 Cargando descuentos...');
      const response = await apiService.getDescuentos();
      
      if (response.success && response.data) {
        console.log('🔍 Estructura de datos recibida:', response.data[0]); // Debug log
        setDescuentos(response.data);
        console.log(`✅ Descuentos cargados: ${response.data.length}`);
      } else {
        console.error('❌ Error en respuesta:', response.message);
        showToastMessage(`Error al cargar descuentos: ${response.message}`, 'error');
      }
    } catch (error) {
      console.error('💥 Error cargando descuentos:', error);
      showToastMessage('Error de conexión al cargar descuentos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para cargar descuentos al montar el componente
  useEffect(() => {
    cargarDescuentos();
  }, []);

  // Función para abrir modal de creación
  const handleAgregarDescuento = () => {
    setFormData({
      nombre: '',
      tipodescuento: '$',
      valor: 0,
      estatusdescuento: 'ACTIVO',
      requiereautorizacion: 'NO',
      usuarioauditoria: 'ADMIN',
      idnegocio: 1
    });
    setCurrentDescuento(null);
    setIsEditing(false);
    setShowModal(true);
  };

  // Función para abrir modal de edición
  const handleEditarDescuento = (descuento: Descuento) => {
    setFormData({
      nombre: descuento.nombre,
      tipodescuento: descuento.tipodescuento,
      valor: typeof descuento.valor === 'string' ? parseFloat(descuento.valor) : descuento.valor,
      estatusdescuento: descuento.estatusdescuento,
      requiereautorizacion: descuento.requiereautorizacion,
      usuarioauditoria: 'ADMIN',
      idnegocio: descuento.idnegocio
    });
    setCurrentDescuento(descuento);
    setIsEditing(true);
    setShowModal(true);
  };

  // Función para cerrar modal
  const handleCerrarModal = () => {
    setShowModal(false);
    setCurrentDescuento(null);
    setIsEditing(false);
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (field: keyof CreateDescuentoData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para guardar descuento
  const handleGuardarDescuento = async () => {
    try {
      // Validaciones
      if (!formData.nombre.trim()) {
        showToastMessage('El nombre del descuento es obligatorio', 'error');
        return;
      }

      if (formData.valor <= 0) {
        showToastMessage('El valor del descuento debe ser mayor a 0', 'error');
        return;
      }

      if (formData.tipodescuento === '%' && formData.valor > 100) {
        showToastMessage('El porcentaje no puede ser mayor a 100%', 'error');
        return;
      }

      setIsLoading(true);

      let response;
      if (isEditing && currentDescuento) {
        console.log('🔄 Actualizando descuento:', formData);
        response = await apiService.updateDescuento(currentDescuento.id_descuento, formData);
      } else {
        console.log('💰 Creando nuevo descuento:', formData);
        response = await apiService.createDescuento(formData);
      }

      if (response.success) {
        showToastMessage(
          isEditing ? 'Descuento actualizado exitosamente' : 'Descuento creado exitosamente',
          'success'
        );
        await cargarDescuentos();
        handleCerrarModal();
      } else {
        showToastMessage(`Error: ${response.message}`, 'error');
      }
    } catch (error) {
      console.error('💥 Error guardando descuento:', error);
      showToastMessage('Error de conexión al guardar descuento', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar descuento
  const handleEliminarDescuento = async (descuento: Descuento) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el descuento "${descuento.nombre}"?`)) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('🗑️ Eliminando descuento:', descuento.id_descuento);
      
      const response = await apiService.deleteDescuento(descuento.id_descuento, {
        usuarioauditoria: 'ADMIN'
      });

      if (response.success) {
        showToastMessage('Descuento eliminado exitosamente', 'success');
        await cargarDescuentos();
      } else {
        showToastMessage(`Error al eliminar: ${response.message}`, 'error');
      }
    } catch (error) {
      console.error('💥 Error eliminando descuento:', error);
      showToastMessage('Error de conexión al eliminar descuento', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para formatear el valor del descuento
  const formatearValor = (valor: number | string, tipo: TipoDescuento): string => {
    const numericValue = typeof valor === 'string' ? parseFloat(valor) : valor;
    if (isNaN(numericValue)) {
      return '0'; // Valor por defecto si no se puede convertir
    }
    
    if (tipo === '%') {
      return `${numericValue}%`;
    }
    return `$${numericValue.toFixed(2)}`;
  };

  return (
    <>
      <style>{`
        .descuentos-container {
          padding: 1.5rem;
          background: #f8fafc;
          min-height: 100vh;
        }

        .descuentos-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          background: white;
          border-radius: 8px 8px 0 0;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .descuentos-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
        }

        .btn-add-descuento {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
        }

        .btn-add-descuento:hover {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-back {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);
          margin-right: 1rem;
        }

        .btn-back:hover {
          background: linear-gradient(135deg, #4f46e5, #4338ca);
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(99, 102, 241, 0.4);
        }

        .descuentos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          padding: 1rem;
        }

        .descuento-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .descuento-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .descuento-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .descuento-header-card {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .descuento-nombre {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .descuento-status {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-activo {
          background: #dcfce7;
          color: #166534;
        }

        .status-inactivo {
          background: #fee2e2;
          color: #991b1b;
        }

        .descuento-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
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
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-value {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
        }

        .valor-descuento {
          font-size: 1.25rem;
          color: #059669;
        }

        .descuento-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .btn-edit {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-edit:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          transform: translateY(-1px);
        }

        .btn-delete {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-delete:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: translateY(-1px);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-row.full-width {
          grid-template-columns: 1fr;
        }

        .switch-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .switch-group {
          display: flex;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid #e5e7eb;
          background: #f9fafb;
        }

        .switch-option {
          flex: 1;
          padding: 0.75rem 1rem;
          background: #f9fafb;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
        }

        .switch-option.active {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          transform: scale(1.02);
          z-index: 1;
        }

        .switch-option:not(.active):hover {
          background: #e5e7eb;
        }

        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .btn-cancel {
          padding: 0.75rem 1.5rem;
          background: #f3f4f6;
          color: #374151;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
          color: #111827;
        }

        .btn-save {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
        }

        .btn-save:hover {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateY(-1px);
          box-shadow: 0 6px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-save:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 3rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .empty-state p {
          margin-bottom: 1.5rem;
        }
      `}</style>
      
      <div className="descuentos-container">
        {/* Header */}
        <div className="descuentos-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn-back" onClick={() => onNavigate('tablero-inicial')}>
              ← Regresar
            </button>
            <h1 className="descuentos-title">
              💰 Gestión de Descuentos
            </h1>
          </div>
          
          <button className="btn-add-descuento" onClick={handleAgregarDescuento}>
            ✨ Agregar Descuento
          </button>
        </div>

        {/* Contenido principal */}
        {isLoading && descuentos.length === 0 ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : descuentos.length === 0 ? (
          <div className="empty-state">
            <h3>No hay descuentos registrados</h3>
            <p>Comienza agregando tu primer descuento para el sistema POS</p>
            <button className="btn-add-descuento" onClick={handleAgregarDescuento}>
              ✨ Agregar Primer Descuento
            </button>
          </div>
        ) : (
          <div className="descuentos-grid">
            {descuentos.map((descuento) => (
              <div key={descuento.id_descuento} className="descuento-card">
                <div className="descuento-header-card">
                  <h3 className="descuento-nombre">{descuento.nombre}</h3>
                  <span className={`descuento-status ${descuento.estatusdescuento === 'ACTIVO' ? 'status-activo' : 'status-inactivo'}`}>
                    {descuento.estatusdescuento}
                  </span>
                </div>

                <div className="descuento-details">
                  <div className="detail-item">
                    <span className="detail-label">Tipo y Valor</span>
                    <span className="detail-value valor-descuento">
                      {formatearValor(descuento.valor, descuento.tipodescuento)}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Requiere Autorización</span>
                    <span className="detail-value">
                      {descuento.requiereautorizacion === 'SI' ? '✅ Sí' : '❌ No'}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Usuario Auditoría</span>
                    <span className="detail-value">{descuento.usuarioauditoria}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Fecha Registro</span>
                    <span className="detail-value">
                      {descuento.fechaRegistroauditoria ? new Date(descuento.fechaRegistroauditoria).toLocaleDateString() : 'No disponible'}
                    </span>
                  </div>
                </div>

                <div className="descuento-actions">
                  <button 
                    className="btn-edit" 
                    onClick={() => handleEditarDescuento(descuento)}
                    disabled={isLoading}
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    className="btn-delete" 
                    onClick={() => handleEliminarDescuento(descuento)}
                    disabled={isLoading}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal para agregar/editar descuento */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCerrarModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">
                  {isEditing ? '✏️ Editar Descuento' : '✨ Nuevo Descuento'}
                </h3>
                <button className="btn-close" onClick={handleCerrarModal}>×</button>
              </div>

              <div className="modal-body">
                <div className="form-row full-width">
                  <div className="form-group">
                    <label className="form-label">Nombre del Descuento *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      placeholder="Ej: Descuento Cliente Frecuente"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tipo de Descuento *</label>
                    <div className="switch-container">
                      <div className="switch-group">
                        <button
                          type="button"
                          className={`switch-option ${formData.tipodescuento === '$' ? 'active' : ''}`}
                          onClick={() => handleInputChange('tipodescuento', '$')}
                        >
                          💵 Peso ($)
                        </button>
                        <button
                          type="button"
                          className={`switch-option ${formData.tipodescuento === '%' ? 'active' : ''}`}
                          onClick={() => handleInputChange('tipodescuento', '%')}
                        >
                          📊 Porcentaje (%)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Valor {formData.tipodescuento === '$' ? '(Pesos)' : '(Porcentaje)'} *
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.valor}
                      onChange={(e) => handleInputChange('valor', parseFloat(e.target.value) || 0)}
                      placeholder={formData.tipodescuento === '$' ? '0.00' : '0'}
                      min="0"
                      max={formData.tipodescuento === '%' ? 100 : undefined}
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Estatus del Descuento *</label>
                    <div className="switch-container">
                      <div className="switch-group">
                        <button
                          type="button"
                          className={`switch-option ${formData.estatusdescuento === 'ACTIVO' ? 'active' : ''}`}
                          onClick={() => handleInputChange('estatusdescuento', 'ACTIVO')}
                        >
                          ✅ ACTIVO
                        </button>
                        <button
                          type="button"
                          className={`switch-option ${formData.estatusdescuento === 'INACTIVO' ? 'active' : ''}`}
                          onClick={() => handleInputChange('estatusdescuento', 'INACTIVO')}
                        >
                          ❌ INACTIVO
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Requiere Autorización *</label>
                    <div className="switch-container">
                      <div className="switch-group">
                        <button
                          type="button"
                          className={`switch-option ${formData.requiereautorizacion === 'SI' ? 'active' : ''}`}
                          onClick={() => handleInputChange('requiereautorizacion', 'SI')}
                        >
                          ✅ SÍ
                        </button>
                        <button
                          type="button"
                          className={`switch-option ${formData.requiereautorizacion === 'NO' ? 'active' : ''}`}
                          onClick={() => handleInputChange('requiereautorizacion', 'NO')}
                        >
                          ❌ NO
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-cancel" onClick={handleCerrarModal}>
                  Cancelar
                </button>
                <button 
                  className="btn-save" 
                  onClick={handleGuardarDescuento}
                  disabled={isLoading || !formData.nombre.trim() || formData.valor <= 0}
                >
                  {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')} Descuento
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast de notificaciones */}
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

export default ConfigDescuentos;