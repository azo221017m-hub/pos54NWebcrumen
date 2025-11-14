// src/components/InsumosSelector.tsx
// Componente reutilizable para listado y buscador de insumos

import { useState, useEffect } from 'react';
import type { Insumo } from '../types';
import '../styles/InsumosSelector.css';

// Tipos específicos para el selector
interface InsumoSelectorItem extends Omit<Insumo, 'existencia'> {
  existencia?: number;
}

interface InsumosSelectorProps {
  onInsumoSelect: (insumo: InsumoSelectorItem) => void;
  filtroTipo?: 'INSUMO' | 'PRODUCTO' | 'ALL';
  className?: string;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  selectedInsumos?: number[]; // IDs de insumos ya seleccionados para marcarlos
}

// Componente InsumosSelector
const InsumosSelector: React.FC<InsumosSelectorProps> = ({
  onInsumoSelect,
  filtroTipo = 'INSUMO',
  className = '',
  placeholder = 'Buscar insumos...',
  label = 'Buscar Insumos',
  disabled = false,
  selectedInsumos = []
}) => {
  // Estados para el componente
  const [busquedaTexto, setBusquedaTexto] = useState<string>('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<InsumoSelectorItem[]>([]);
  const [mostrandoResultados, setMostrandoResultados] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Función para buscar insumos
  const buscarInsumos = async (textoBusqueda: string): Promise<void> => {
    if (!textoBusqueda.trim() || textoBusqueda.length < 2) {
      setResultadosBusqueda([]);
      setMostrandoResultados(false);
      return;
    }

    setCargando(true);
    setError('');

    try {
      console.log('🔍 Buscando insumos:', textoBusqueda, 'Tipo:', filtroTipo);
      
      // Construir URL con parámetros de búsqueda
      const params = new URLSearchParams({
        busqueda: textoBusqueda.trim(),
        ...(filtroTipo !== 'ALL' && { tipo: filtroTipo })
      });

      const response = await fetch(`http://localhost:4000/api/insumos/buscar?${params}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Insumos encontrados:', data.data?.length || 0);
        setResultadosBusqueda(data.data || []);
        setMostrandoResultados(true);
      } else {
        console.log('❌ Sin resultados:', data.message);
        setResultadosBusqueda([]);
        setMostrandoResultados(false);
        setError(data.message || 'No se encontraron insumos');
      }
    } catch (error) {
      console.error('❌ Error al buscar insumos:', error);
      setError('Error al buscar insumos. Intente nuevamente.');
      setResultadosBusqueda([]);
      setMostrandoResultados(false);
    } finally {
      setCargando(false);
    }
  };

  // Efecto para realizar búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      buscarInsumos(busquedaTexto);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [busquedaTexto, filtroTipo]);

  // Función para manejar selección de insumo
  const handleInsumoSelect = (insumo: InsumoSelectorItem): void => {
    console.log('🎯 Insumo seleccionado:', insumo.nomInsumo);
    onInsumoSelect(insumo);
    setBusquedaTexto('');
    setResultadosBusqueda([]);
    setMostrandoResultados(false);
  };

  // Función para verificar si un insumo ya está seleccionado
  const isInsumoSelected = (insumoId: number): boolean => {
    return selectedInsumos.includes(insumoId);
  };

  return (
    <div className={`insumos-selector ${className}`}>
      <div className="selector-form-group">
        <label className="selector-label">{label}</label>
        <div className="selector-input-container">
          <input
            type="text"
            className="selector-input"
            placeholder={placeholder}
            value={busquedaTexto}
            onChange={(e) => setBusquedaTexto(e.target.value)}
            disabled={disabled}
          />
          {cargando && (
            <div className="selector-loading">
              <div className="loading-spinner"></div>
            </div>
          )}
        </div>
      </div>

      {/* Resultados de búsqueda */}
      {mostrandoResultados && (
        <div className="selector-results">
          <div className="results-header">
            <span className="results-count">
              {resultadosBusqueda.length} insumo{resultadosBusqueda.length !== 1 ? 's' : ''} encontrado{resultadosBusqueda.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="results-list">
            {resultadosBusqueda.map((insumo) => (
              <div
                key={insumo.idInsumo}
                className={`result-item ${isInsumoSelected(insumo.idInsumo) ? 'selected' : ''}`}
                onClick={() => handleInsumoSelect(insumo)}
              >
                <div className="result-info">
                  <div className="result-name">
                    <span className="name-text">{insumo.nomInsumo}</span>
                    {isInsumoSelected(insumo.idInsumo) && (
                      <span className="selected-badge">✓</span>
                    )}
                  </div>
                  <div className="result-details">
                    <span className="result-um">📏 {insumo.umInsumo || 'N/A'}</span>
                    <span className="result-price">
                      💰 ${typeof insumo.costoPromPond === 'number' ? 
                        insumo.costoPromPond.toFixed(2) : 
                        parseFloat(String(insumo.costoPromPond || 0)).toFixed(2)}
                    </span>
                    {insumo.existencia !== undefined && (
                      <span className="result-stock">📦 Stock: {insumo.existencia}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="selector-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {!cargando && busquedaTexto.length >= 2 && resultadosBusqueda.length === 0 && !error && (
        <div className="selector-no-results">
          <span className="no-results-icon">🔍</span>
          No se encontraron insumos con "{busquedaTexto}"
        </div>
      )}
    </div>
  );
};

export default InsumosSelector;