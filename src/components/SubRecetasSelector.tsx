// src/components/SubRecetasSelector.tsx
// Componente para seleccionar subrecetas con búsqueda y cálculo de costos

import React, { useState, useEffect } from 'react';
import { getSubRecetas } from '../services/api';
import type { ApiResponse } from '../types';
import '../styles/ConfigScreens.css';

// Interfaz para subrecetas
interface SubReceta {
  idSubReceta: number;
  nombreSubReceta: string;
  costoSubReceta: number | string;
  totalInsumos: number | string;
  instruccionesSubr: string;
}

// Props del componente
interface SubRecetasSelectorProps {
  onSubRecetaSelect: (subreceta: SubReceta) => void;
  onClose: () => void;
  isOpen: boolean;
}

const SubRecetasSelector: React.FC<SubRecetasSelectorProps> = ({ 
  onSubRecetaSelect, 
  onClose, 
  isOpen 
}) => {
  const [subrecetas, setSubRecetas] = useState<SubReceta[]>([]);
  const [filteredSubRecetas, setFilteredSubRecetas] = useState<SubReceta[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar subrecetas al abrir el selector
  useEffect(() => {
    if (isOpen) {
      loadSubRecetas();
    }
  }, [isOpen]);

  // Filtrar subrecetas según término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSubRecetas(subrecetas);
    } else {
      const filtered = subrecetas.filter(subreceta =>
        subreceta.nombreSubReceta.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSubRecetas(filtered);
    }
  }, [searchTerm, subrecetas]);

  // Función para cargar subrecetas
  const loadSubRecetas = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 Cargando subrecetas para selector...');
      const response: ApiResponse<SubReceta[]> = await getSubRecetas();
      
      if (response.success && response.data) {
        setSubRecetas(response.data);
        console.log(`✅ ${response.data.length} subrecetas cargadas`);
      } else {
        setError('Error al cargar subrecetas');
        console.error('❌ Error:', response.message);
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      setError('Error de conexión al cargar subrecetas');
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección de subreceta
  const handleSelect = (subreceta: SubReceta): void => {
    console.log('✅ SubReceta seleccionada:', subreceta.nombreSubReceta);
    onSubRecetaSelect(subreceta);
    onClose();
  };

  // No renderizar si no está abierto
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999
      }}
    >
      <div 
        className="modal-content subrecetas-selector"
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          width: '90vw',
          maxWidth: '800px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div className="modal-header">
          <h2>Seleccionar SubReceta</h2>
          <button 
            className="btn-close"
            onClick={onClose}
            title="Cerrar selector"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Buscador */}
          <div className="search-section">
            <div className="form-group">
              <label className="form-label">Buscar por nombre de subreceta</label>
              <input
                type="text"
                className="form-input"
                placeholder="Escriba el nombre de la subreceta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Lista de subrecetas */}
          <div className="results-section">
            {loading ? (
              <div className="loading-state">
                <p>Cargando subrecetas...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>❌ {error}</p>
                <button 
                  className="btn-secondary"
                  onClick={loadSubRecetas}
                >
                  Reintentar
                </button>
              </div>
            ) : filteredSubRecetas.length === 0 ? (
              <div className="empty-state">
                <p>
                  {searchTerm ? 
                    `No se encontraron subrecetas que contengan "${searchTerm}"` : 
                    'No hay subrecetas disponibles'
                  }
                </p>
              </div>
            ) : (
              <div className="subrecetas-grid">
                {filteredSubRecetas.map((subreceta) => (
                  <div 
                    key={subreceta.idSubReceta}
                    className="subreceta-card"
                    onClick={() => handleSelect(subreceta)}
                  >
                    <div className="subreceta-header">
                      <h4>{subreceta.nombreSubReceta}</h4>
                      <span className="subreceta-cost">
                        ${Number(subreceta.costoSubReceta || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="subreceta-details">
                      <p className="subreceta-ingredients">
                        {Number(subreceta.totalInsumos || 0)} insumo(s)
                      </p>
                      {subreceta.instruccionesSubr && (
                        <p className="subreceta-instructions">
                          {subreceta.instruccionesSubr.substring(0, 100)}
                          {subreceta.instruccionesSubr.length > 100 && '...'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubRecetasSelector;