import React from 'react';
import './BarraPrivilegios.css';

interface Props {
  valor: number;
  onChange: (valor: number) => void;
  disabled?: boolean;
}

const BarraPrivilegios: React.FC<Props> = ({ valor, onChange, disabled = false }) => {
  const niveles = [
    { nivel: 1, label: 'Básico', color: '#94a3b8' },
    { nivel: 2, label: 'Bajo', color: '#60a5fa' },
    { nivel: 3, label: 'Medio', color: '#34d399' },
    { nivel: 4, label: 'Alto', color: '#fbbf24' },
    { nivel: 5, label: 'Total', color: '#f87171' }
  ];

  return (
    <div className="barra-privilegios">
      <div className="barra-privilegios-header">
        <span className="barra-privilegios-label">Nivel de Privilegio</span>
        <span className="barra-privilegios-value">
          Nivel {valor} - {niveles.find(n => n.nivel === valor)?.label || 'N/A'}
        </span>
      </div>
      
      <div className="barra-privilegios-container">
        <div className="barra-privilegios-track">
          <div 
            className="barra-privilegios-fill"
            style={{
              width: `${(valor / 5) * 100}%`,
              background: niveles.find(n => n.nivel === valor)?.color || '#94a3b8'
            }}
          />
        </div>
        
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={valor}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="barra-privilegios-input"
        />
      </div>
      
      <div className="barra-privilegios-markers">
        {niveles.map((nivel) => (
          <button
            key={nivel.nivel}
            type="button"
            onClick={() => !disabled && onChange(nivel.nivel)}
            disabled={disabled}
            className={`barra-privilegios-marker ${valor === nivel.nivel ? 'active' : ''}`}
            style={{
              borderColor: valor === nivel.nivel ? nivel.color : '#e2e8f0',
              color: valor === nivel.nivel ? nivel.color : '#64748b'
            }}
            title={`Nivel ${nivel.nivel}: ${nivel.label}`}
          >
            {nivel.nivel}
          </button>
        ))}
      </div>
      
      <div className="barra-privilegios-legend">
        {niveles.map((nivel) => (
          <div
            key={nivel.nivel}
            className="barra-privilegios-legend-item"
            style={{
              opacity: valor === nivel.nivel ? 1 : 0.5
            }}
          >
            <div
              className="barra-privilegios-legend-dot"
              style={{ background: nivel.color }}
            />
            <span>{nivel.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarraPrivilegios;
