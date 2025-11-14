// src/components/ConfigMesas.tsx
// Componente para configuración y gestión de mesas con diseño de minicards

import React, { useState, useEffect } from 'react';
import type { Mesa, CreateMesaData, ScreenType } from '../types';
import Toast from './Toast';
import apiService from '../services/api';


// Estilos CSS inline para minicards y modal
const componentStyles = `
  .mesas-container {
    padding: 1.5rem;
    background: #f8fafc;
    min-height: 100vh;
  }
  
  .mesas-header {
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
  
  .mesas-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .btn-add-mesa {
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
  
  .btn-add-mesa:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
  
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .mesa-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
    position: relative;
  }
  
  .mesa-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
  
  .mesa-disponible {
    border-left: 4px solid #48bb78;
  }
  
  .mesa-ocupada {
    border-left: 4px solid #ed8936;
  }
  
  .mesa-reservada {
    border-left: 4px solid #4299e1;
  }
  
  .mesa-mantenimiento {
    border-left: 4px solid #e53e3e;
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
  
  .card-numero {
    font-size: 2rem;
    font-weight: 800;
    color: #667eea;
    text-align: center;
    margin: 1rem 0;
    background: #f7fafc;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1rem auto;
  }
  
  .card-status {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .status-disponible {
    background: #c6f6d5;
    color: #22543d;
  }
  
  .status-ocupada {
    background: #fbd38d;
    color: #7b341e;
  }
  
  .status-reservada {
    background: #bee3f8;
    color: #2a4365;
  }
  
  .status-mantenimiento {
    background: #fed7d7;
    color: #742a2a;
  }
  
  .card-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1rem 0;
    padding: 0.75rem;
    background: #f7fafc;
    border-radius: 8px;
  }
  
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
    max-width: 500px;
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
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: background 0.2s;
  }
  
  .btn-close:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

// Interfaz para las props del componente
interface ConfigMesasProps {
  onNavigate: (screen: ScreenType) => void;
}

const ConfigMesas: React.FC<ConfigMesasProps> = ({ onNavigate }) => {
  // Estados del componente
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingMesa, setEditingMesa] = useState<Mesa | null>(null);
  
  // Estados para el formulario
  const [formData, setFormData] = useState<CreateMesaData>({
    nombremesa: '',
    numeromesa: 0,
    cantcomensales: 1,
    estatusmesa: 'DISPONIBLE'
  });

  // Estados para Toast
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({
    isVisible: false,
    message: '',
    type: 'success'
  });

  // Función para mostrar toast
  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    console.log('🔔 [ConfigMesas] Mostrando toast:', { message, type });
    setToast({
      isVisible: true,
      message,
      type
    });
  };

  // Función para cerrar toast
  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Función para cargar mesas
  const loadMesas = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('📋 [ConfigMesas] Cargando mesas...');
      
      const response = await apiService.getMesas();
      console.log('📋 [ConfigMesas] Respuesta:', response);
      
      if (response.success && response.data) {
        setMesas(response.data);
        console.log(`✅ [ConfigMesas] ${response.data.length} mesas cargadas`);
      } else {
        // Datos de ejemplo si no hay respuesta del servidor
        const mesasEjemplo: Mesa[] = [
          {
            idmesa: 1,
            nombremesa: 'Mesa Principal',
            numeromesa: 1,
            cantcomensales: 4,
            estatusmesa: 'DISPONIBLE',
            tiempodeinicio: new Date().toISOString(),
            tiempoactual: new Date().toISOString(),
            estatustiempo: 'INACTIVA',
            fechaRegistroauditoria: new Date().toISOString(),
            usuarioauditoria: 'sistema',
            fehamodificacionauditoria: new Date().toISOString(),
            idnegocio: 1
          },
          {
            idmesa: 2,
            nombremesa: 'Mesa VIP',
            numeromesa: 2,
            cantcomensales: 6,
            estatusmesa: 'OCUPADA',
            tiempodeinicio: new Date().toISOString(),
            tiempoactual: new Date().toISOString(),
            estatustiempo: 'EN_CURSO',
            fechaRegistroauditoria: new Date().toISOString(),
            usuarioauditoria: 'sistema',
            fehamodificacionauditoria: new Date().toISOString(),
            idnegocio: 1
          },
          {
            idmesa: 3,
            nombremesa: 'Mesa Terraza',
            numeromesa: 3,
            cantcomensales: 2,
            estatusmesa: 'RESERVADA',
            tiempodeinicio: new Date().toISOString(),
            tiempoactual: new Date().toISOString(),
            estatustiempo: 'INACTIVA',
            fechaRegistroauditoria: new Date().toISOString(),
            usuarioauditoria: 'sistema',
            fehamodificacionauditoria: new Date().toISOString(),
            idnegocio: 1
          }
        ];
        setMesas(mesasEjemplo);
        showToast('Mostrando datos de ejemplo', 'warning');
      }
    } catch (error) {
      console.error('💥 [ConfigMesas] Error cargando mesas:', error);
      showToast('Error al cargar mesas', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar mesas al montar el componente
  useEffect(() => {
    console.log('🎯 [ConfigMesas] Componente montado, cargando mesas...');
    loadMesas();
  }, []);

  // Funciones del modal
  const abrirModalNuevo = (): void => {
    console.log('➕ Abriendo modal para nueva mesa');
    setIsEditing(false);
    setEditingMesa(null);
    setFormData({
      nombremesa: '',
      numeromesa: 0,
      cantcomensales: 1,
      estatusmesa: 'DISPONIBLE'
    });
    setShowModal(true);
  };

  const abrirModalEdicion = (mesa: Mesa): void => {
    console.log('✏️ Abriendo modal para editar mesa:', mesa.idmesa);
    setIsEditing(true);
    setEditingMesa(mesa);
    setFormData({
      nombremesa: mesa.nombremesa,
      numeromesa: mesa.numeromesa,
      cantcomensales: mesa.cantcomensales,
      estatusmesa: mesa.estatusmesa
    });
    setShowModal(true);
  };

  const cerrarModal = (): void => {
    console.log('❌ Cerrando modal de mesa');
    setShowModal(false);
    setIsEditing(false);
    setEditingMesa(null);
    setFormData({
      nombremesa: '',
      numeromesa: 0,
      cantcomensales: 1,
      estatusmesa: 'DISPONIBLE'
    });
  };

  // Función para manejar cambios en inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  // Función para validar formulario
  const validateForm = (): boolean => {
    if (!formData.nombremesa.trim()) {
      showToast('El nombre de la mesa es requerido', 'error');
      return false;
    }

    if (formData.numeromesa <= 0) {
      showToast('El número de mesa debe ser mayor a 0', 'error');
      return false;
    }

    if (formData.cantcomensales <= 0) {
      showToast('La cantidad de comensales debe ser mayor a 0', 'error');
      return false;
    }

    // Verificar que el número de mesa no esté duplicado
    const existingMesa = mesas.find(mesa => 
      mesa.numeromesa === formData.numeromesa && 
      mesa.idmesa !== editingMesa?.idmesa
    );
    
    if (existingMesa) {
      showToast(`Ya existe una mesa con el número ${formData.numeromesa}`, 'error');
      return false;
    }

    return true;
  };

  const guardarMesa = async (): Promise<void> => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      console.log('💾 Guardando mesa:', formData);
      
      let response;
      if (isEditing && editingMesa) {
        response = await apiService.updateMesa(editingMesa.idmesa, formData);
        showToast('Mesa actualizada exitosamente', 'success');
      } else {
        response = await apiService.createMesa(formData);
        showToast('Mesa creada exitosamente', 'success');
      }
      
      if (response.success) {
        cerrarModal();
        await loadMesas();
      } else {
        showToast(response.message || 'Error al guardar la mesa', 'error');
      }
      
    } catch (error) {
      console.error('💥 Error guardando mesa:', error);
      showToast('Error de conexión al guardar', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para eliminar mesa
  const handleDelete = async (mesa: Mesa): Promise<void> => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la mesa "${mesa.nombremesa}"?`)) {
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('🗑️ Eliminando mesa:', mesa.idmesa);
      
      const response = await apiService.deleteMesa(mesa.idmesa, { usuarioauditoria: 'sistema' });
      
      if (response.success) {
        showToast('Mesa eliminada exitosamente', 'success');
        await loadMesas();
      } else {
        showToast(response.message || 'Error al eliminar la mesa', 'error');
      }
      
    } catch (error) {
      console.error('💥 Error eliminando mesa:', error);
      showToast('Error de conexión al eliminar', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{componentStyles}</style>
      <div className="mesas-container">
        
        {/* Botón de regresar */}
        <button 
          className="btn-regresar"
          onClick={() => {
            console.log('🔙 Navegando de vuelta al tablero inicial');
            onNavigate('tablero-inicial');
          }}
        >
          ← Regresar al Tablero
        </button>

        {/* Header con título y botón agregar */}
        <div className="mesas-header">
          <h1 className="mesas-title">
            🍽️ Gestión de Mesas
          </h1>
          <button 
            className="btn-add-mesa"
            onClick={abrirModalNuevo}
            disabled={isLoading}
          >
            ➕ Agregar Mesa
          </button>
        </div>

        {/* Contenido principal - Grid de minicards */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p>Cargando mesas...</p>
          </div>
        ) : (
          <div className="cards-grid">
            {mesas.map((mesa) => (
              <div key={mesa.idmesa} className={`mesa-card mesa-${mesa.estatusmesa.toLowerCase()}`}>
                
                {/* Header de la card con nombre y estado */}
                <div className="card-header">
                  <h3 className="card-title">{mesa.nombremesa}</h3>
                  <span className={`card-status status-${mesa.estatusmesa.toLowerCase()}`}>
                    {mesa.estatusmesa}
                  </span>
                </div>

                {/* Número de mesa grande */}
                <div className="card-numero">
                  {mesa.numeromesa}
                </div>

                {/* Información de la mesa */}
                <div className="card-info">
                  <div>
                    <strong>👥 Comensales:</strong>
                    <span style={{ marginLeft: '0.5rem' }}>{mesa.cantcomensales}</span>
                  </div>
                </div>

                {/* Información adicional */}
                <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginBottom: '1rem', textAlign: 'center' }}>
                  <div>ID: {mesa.idmesa}</div>
                </div>

                {/* Botones de acción */}
                <div className="card-actions">
                  <button 
                    className="btn-card-action btn-edit-card"
                    onClick={() => abrirModalEdicion(mesa)}
                    title="Editar mesa"
                    disabled={isLoading}
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    className="btn-card-action btn-delete-card"
                    onClick={() => handleDelete(mesa)}
                    title="Eliminar mesa"
                    disabled={isLoading}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}

            {/* Mensaje cuando no hay mesas */}
            {mesas.length === 0 && (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '3rem',
                background: 'white',
                borderRadius: '12px',
                border: '2px dashed #e2e8f0'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: '0.5' }}>🍽️</div>
                <h3 style={{ color: '#4a5568', marginBottom: '0.5rem' }}>No hay mesas registradas</h3>
                <p style={{ color: '#718096', marginBottom: '1.5rem' }}>Comienza creando tu primera mesa</p>
                <button 
                  className="btn-add-mesa" 
                  onClick={abrirModalNuevo}
                  style={{ position: 'relative', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                >
                  ➕ Crear primera mesa
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal para crear/editar mesa */}
        {showModal && (
          <div className="modal-overlay" onClick={cerrarModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{isEditing ? '✏️ Editar Mesa' : '➕ Nueva Mesa'}</h2>
                <button className="btn-close" onClick={cerrarModal}>✕</button>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="nombremesa" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Nombre de la Mesa *
                  </label>
                  <input
                    type="text"
                    id="nombremesa"
                    name="nombremesa"
                    value={formData.nombremesa}
                    onChange={handleInputChange}
                    placeholder="Ej: Mesa Principal, Mesa VIP..."
                    disabled={isLoading}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="numeromesa" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Número de Mesa *
                  </label>
                  <input
                    type="number"
                    id="numeromesa"
                    name="numeromesa"
                    value={formData.numeromesa || ''}
                    onChange={handleInputChange}
                    placeholder="1"
                    min="1"
                    disabled={isLoading}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="cantcomensales" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Cantidad de Comensales *
                  </label>
                  <input
                    type="number"
                    id="cantcomensales"
                    name="cantcomensales"
                    value={formData.cantcomensales}
                    onChange={handleInputChange}
                    placeholder="4"
                    min="1"
                    max="20"
                    disabled={isLoading}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="estatusmesa" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Estado de la Mesa
                  </label>
                  <select
                    id="estatusmesa"
                    name="estatusmesa"
                    value={formData.estatusmesa}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="OCUPADA">Ocupada</option>
                    <option value="RESERVADA">Reservada</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                  </select>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                justifyContent: 'flex-end', 
                padding: '1rem 1.5rem', 
                borderTop: '1px solid #e5e7eb' 
              }}>
                <button 
                  className="btn-secondary" 
                  onClick={cerrarModal}
                  disabled={isLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f7fafc',
                    color: '#4a5568',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-primary" 
                  onClick={guardarMesa}
                  disabled={isLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')} Mesa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Component */}
        {toast.isVisible && (
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.type === 'error' ? 4000 : 3000}
            onClose={closeToast}
          />
        )}
      </div>
    </>
  );
};

export default ConfigMesas;