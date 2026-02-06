import React from 'react';
import type { Insumo } from '../../../types/insumo.types';
import { Edit, Trash2, Package, DollarSign, TrendingUp, AlertTriangle, Minus } from 'lucide-react';
import './ListaInsumos.css';

interface Props {
  insumos: Insumo[];
  onEdit: (insumo: Insumo) => void;
  onDelete: (id: number) => void;
}

const ListaInsumos: React.FC<Props> = ({ insumos, onEdit, onDelete }) => {
  // Validación defensiva: asegurarse de que insumos sea un array
  console.log('🟢 ListaInsumos - Props recibido:', insumos, 'Tipo:', typeof insumos, 'Es array:', Array.isArray(insumos));
  const insumosArray = Array.isArray(insumos) ? insumos : [];
  console.log('🟢 ListaInsumos - Array procesado:', insumosArray, 'Longitud:', insumosArray.length);
  
  if (insumosArray.length === 0) {
    return (
      <div className="lista-insumos-vacia">
        <Package size={64} className="icono-vacio" />
        <h3>No hay insumos registrados</h3>
        <p>Comienza agregando un nuevo insumo</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const getStockStatus = (actual: number, minimo: number) => {
    if (actual <= minimo) return 'critico';
    if (actual <= minimo * 1.5) return 'bajo';
    return 'normal';
  };

  return (
    <div className="lista-insumos">
      {insumosArray.map((insumo) => {
        const stockStatus = getStockStatus(insumo.stock_actual, insumo.stock_minimo);
        
        return (
          <div key={insumo.id_insumo} className="insumo-card">
            <div className="insumo-card-header">
              <div className="insumo-icon">
                <Package size={24} />
              </div>
              <div className="insumo-header-info">
                <h3 className="insumo-nombre">{insumo.nombre}</h3>
                <span className="insumo-unidad">{insumo.unidad_medida}</span>
              </div>
              <div className="insumo-badges">
                {insumo.activo === 1 ? (
                  <span className="badge badge-success">Activo</span>
                ) : (
                  <span className="badge badge-inactive">Inactivo</span>
                )}
                {insumo.inventariable === 1 && (
                  <span className="badge badge-info">Inventariable</span>
                )}
              </div>
            </div>

            <div className="insumo-card-body">
              <div className="insumo-stats">
                <div className={`stat-item stock-${stockStatus}`}>
                  <div className="stat-icon">
                    {stockStatus === 'critico' ? (
                      <AlertTriangle size={20} />
                    ) : (
                      <TrendingUp size={20} />
                    )}
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Stock Actual</span>
                    <span className="stat-value">{insumo.stock_actual}</span>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon">
                    <Minus size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Stock Mínimo</span>
                    <span className="stat-value">{insumo.stock_minimo}</span>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon">
                    <DollarSign size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Costo Promedio</span>
                    <span className="stat-value">
                      {formatCurrency(insumo.costo_promedio_ponderado)}
                    </span>
                  </div>
                </div>
              </div>

              {(insumo.idinocuidad || insumo.nombrecuentacontable) && (
                <div className="insumo-detalles">
                  {insumo.idinocuidad && (
                    <div className="detalle-item">
                      <span className="detalle-label">Inocuidad:</span>
                      <span className="detalle-value">{insumo.idinocuidad}</span>
                    </div>
                  )}
                  {insumo.nombrecuentacontable && (
                    <div className="detalle-item">
                      <span className="detalle-label">Grupo de Movimiento:</span>
                      <span className="detalle-value">{insumo.nombrecuentacontable}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="insumo-card-footer">
              <button
                className="btn-accion btn-editar"
                onClick={() => onEdit(insumo)}
                title="Editar insumo"
              >
                <Edit size={16} />
                Editar
              </button>
              <button
                className="btn-accion btn-eliminar"
                onClick={() => onDelete(insumo.id_insumo)}
                title="Eliminar insumo"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ListaInsumos;
