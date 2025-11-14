// Componente ConfigUMedida - Gestión de Unidades de Medida de Compra
import React, { useState, useEffect } from 'react';
import type { ScreenType, UMedida, CreateUMedidaData, UpdateUMedidaData, UnidadMateriaPrima } from '../types';
import { UNIDADES_MATERIA_PRIMA } from '../types';
import Toast from './Toast';
import apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface Props {
  onNavigate: (screen: ScreenType) => void;
}

const ConfigUMedida: React.FC<Props> = ({ onNavigate }) => {
  const { user: currentUser } = useAuth();
  
  // Estados del componente
  const [umedidas, setUmedidas] = useState<UMedida[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentUMedida, setCurrentUMedida] = useState<UMedida | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Estados del formulario
  const [formData, setFormData] = useState<CreateUMedidaData>({
    nombreUmCompra: '',
    valor: 0,
    umMatPrima: 'Kg' as UnidadMateriaPrima,
    valorConvertido: 0,
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

  // Función para cargar unidades de medida
  const cargarUMedidas = async () => {
    setIsLoading(true);
    try {
      console.log('📏 Cargando unidades de medida...');
      const response = await apiService.getUMedidas();
      
      if (response.success && response.data) {
        console.log('✅ Unidades de medida cargadas:', response.data.length);
        setUmedidas(response.data);
      } else {
        console.error('❌ Error en la respuesta:', response.message);
        showToastMessage('Error al cargar unidades de medida', 'error');
      }
    } catch (error) {
      console.error('❌ Error al cargar unidades de medida:', error);
      showToastMessage('Error de conexión al cargar unidades de medida', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    cargarUMedidas();
  }, []);

  // Función para abrir modal de creación
  const handleAgregarUMedida = () => {
    console.log('➕ Abriendo modal para agregar unidad de medida');
    setIsEditing(false);
    setCurrentUMedida(null);
    setFormData({
      nombreUmCompra: '',
      valor: 0,
      umMatPrima: 'Kg' as UnidadMateriaPrima,
      valorConvertido: 0,
      usuarioauditoria: currentUser?.nombre || 'system',
      idnegocio: currentUser?.idNegocio || 1
    });
    setShowModal(true);
  };

  // Función para abrir modal de edición
  const handleEditarUMedida = (umedida: UMedida) => {
    console.log('✏️ Abriendo modal para editar unidad de medida:', umedida.nombreUmCompra);
    setIsEditing(true);
    setCurrentUMedida(umedida);
    setFormData({
      nombreUmCompra: umedida.nombreUmCompra,
      valor: umedida.valor,
      umMatPrima: umedida.umMatPrima,
      valorConvertido: umedida.valorConvertido,
      usuarioauditoria: currentUser?.nombre || 'system',
      idnegocio: currentUser?.idNegocio || 1
    });
    setShowModal(true);
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Manejar campos numéricos
    if (name === 'valor' || name === 'valorConvertido') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Función para guardar unidad de medida
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombreUmCompra.trim()) {
      showToastMessage('El nombre de la unidad de medida es requerido', 'error');
      return;
    }
    
    if (!formData.umMatPrima.trim()) {
      showToastMessage('La unidad de materia prima es requerida', 'error');
      return;
    }

    if (formData.valor <= 0) {
      showToastMessage('El valor debe ser mayor a 0', 'error');
      return;
    }

    if (formData.valorConvertido <= 0) {
      showToastMessage('El valor convertido debe ser mayor a 0', 'error');
      return;
    }

    try {
      if (isEditing && currentUMedida) {
        console.log('💾 Actualizando unidad de medida:', currentUMedida.idUmCompra);
        const updateData: UpdateUMedidaData = {
          nombreUmCompra: formData.nombreUmCompra,
          valor: formData.valor,
          umMatPrima: formData.umMatPrima,
          valorConvertido: formData.valorConvertido,
          usuarioauditoria: formData.usuarioauditoria
        };
        
        const response = await apiService.updateUMedida(currentUMedida.idUmCompra, updateData);
        
        if (response.success) {
          showToastMessage('Unidad de medida actualizada correctamente', 'success');
          await cargarUMedidas();
          setShowModal(false);
        } else {
          showToastMessage(response.message || 'Error al actualizar unidad de medida', 'error');
        }
      } else {
        console.log('➕ Creando nueva unidad de medida');
        const response = await apiService.createUMedida(formData);
        
        if (response.success) {
          showToastMessage('Unidad de medida creada correctamente', 'success');
          await cargarUMedidas();
          setShowModal(false);
        } else {
          showToastMessage(response.message || 'Error al crear unidad de medida', 'error');
        }
      }
    } catch (error) {
      console.error('❌ Error al guardar unidad de medida:', error);
      showToastMessage('Error de conexión al guardar', 'error');
    }
  };

  // Función para eliminar unidad de medida
  const handleEliminarUMedida = async (umedida: UMedida) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la unidad de medida "${umedida.nombreUmCompra}"?`)) {
      return;
    }

    try {
      console.log('🗑️ Eliminando unidad de medida:', umedida.idUmCompra);
      const response = await apiService.deleteUMedida(umedida.idUmCompra);
      
      if (response.success) {
        showToastMessage('Unidad de medida eliminada correctamente', 'success');
        await cargarUMedidas();
      } else {
        showToastMessage(response.message || 'Error al eliminar unidad de medida', 'error');
      }
    } catch (error) {
      console.error('❌ Error al eliminar unidad de medida:', error);
      showToastMessage('Error de conexión al eliminar', 'error');
    }
  };

  // Función para cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentUMedida(null);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="umedidas-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando unidades de medida...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .umedidas-container {
          padding: 1.5rem;
          background: #f8fafc;
          min-height: 100vh;
        }

        .umedidas-header {
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

        .umedidas-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
        }

        .btn-add-umedida {
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

        .btn-add-umedida:hover {
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

        .umedidas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          padding: 1rem;
        }

        .umedida-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .umedida-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        .umedida-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .umedida-header-card {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .umedida-nombre {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .umedida-details {
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

        .valor-principal {
          font-size: 1.25rem;
          color: #8b5cf6;
        }

        .umedida-actions {
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
          flex-direction: column;
          gap: 1rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #8b5cf6;
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
          margin: 0;
        }
      `}</style>

      <div className="umedidas-container">
        {/* Header */}
        <div className="umedidas-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn-back" onClick={() => onNavigate('tablero-inicial')}>
              ← Regresar
            </button>
            <h1 className="umedidas-title">
              📏 Unidades de Medida
            </h1>
          </div>
          
          <button className="btn-add-umedida" onClick={handleAgregarUMedida}>
            ✨ Agregar Unidad de Medida
          </button>
        </div>

        {/* Lista de unidades de medida */}
        <div className="umedidas-grid">
          {umedidas.length === 0 ? (
            <div className="empty-state">
              <h3>No hay unidades de medida registradas</h3>
              <p>Agrega tu primera unidad de medida para comenzar</p>
            </div>
          ) : (
            umedidas.map((umedida) => (
              <div key={umedida.idUmCompra} className="umedida-card">
                <div className="umedida-header-card">
                  <h3 className="umedida-nombre">{umedida.nombreUmCompra}</h3>
                </div>

                <div className="umedida-details">
                  <div className="detail-item">
                    <span className="detail-label">Valor</span>
                    <span className="detail-value valor-principal">{umedida.valor.toFixed(3)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Valor Convertido</span>
                    <span className="detail-value">{umedida.valorConvertido.toFixed(3)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Unidad Mat. Prima</span>
                    <span className="detail-value">{umedida.umMatPrima}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Registrado por</span>
                    <span className="detail-value">{umedida.usuarioauditoria}</span>
                  </div>
                </div>

                <div className="umedida-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEditarUMedida(umedida)}
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleEliminarUMedida(umedida)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal para crear/editar unidad de medida */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {isEditing ? '✏️ Editar Unidad de Medida' : '➕ Nueva Unidad de Medida'}
              </h2>
              <button className="btn-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row full-width">
                  <div className="form-group">
                    <label htmlFor="nombreUmCompra">Nombre de la Unidad *</label>
                    <input
                      type="text"
                      id="nombreUmCompra"
                      name="nombreUmCompra"
                      value={formData.nombreUmCompra}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: Kilogramo, Metro, Litro..."
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="valor">Valor *</label>
                    <input
                      type="number"
                      id="valor"
                      name="valor"
                      value={formData.valor}
                      onChange={handleInputChange}
                      step="0.001"
                      min="0"
                      required
                      placeholder="0.000"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="valorConvertido">Valor Convertido *</label>
                    <input
                      type="number"
                      id="valorConvertido"
                      name="valorConvertido"
                      value={formData.valorConvertido}
                      onChange={handleInputChange}
                      step="0.001"
                      min="0"
                      required
                      placeholder="0.000"
                    />
                  </div>
                </div>

                <div className="form-row full-width">
                  <div className="form-group">
                    <label htmlFor="umMatPrima">Unidad de Materia Prima *</label>
                    <select
                      id="umMatPrima"
                      name="umMatPrima"
                      value={formData.umMatPrima}
                      onChange={handleInputChange}
                      required
                      className="form-select"
                    >
                      {UNIDADES_MATERIA_PRIMA.map((unidad) => (
                        <option key={unidad.value} value={unidad.value}>
                          {unidad.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  {isEditing ? '💾 Guardar Cambios' : '➕ Crear Unidad'}
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
    </>
  );
};

export default ConfigUMedida;