import React from 'react';
import { Scale, Edit, Trash2, Package, Building2, ArrowRightLeft } from 'lucide-react';
import type { UMCompra } from '../../../types/umcompra.types';
import './ListaUMCompra.css';

interface ListaUMCompraProps {
  unidades: UMCompra[];
  onEditar: (um: UMCompra) => void;
  onEliminar: (id: number) => void;
  loading?: boolean;
}

export const ListaUMCompra: React.FC<ListaUMCompraProps> = ({
  unidades,
  onEditar,
  onEliminar,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="lista-umcompra-loading">
        <div className="spinner"></div>
        <p>Cargando unidades de medida...</p>
      </div>
    );
  }

  if (unidades.length === 0) {
    return (
      <div className="lista-umcompra-empty">
        <Scale size={64} strokeWidth={1} />
        <h3>No hay unidades de medida registradas</h3>
        <p>Comienza creando una nueva unidad de medida</p>
      </div>
    );
  }

  const formatFecha = (fecha?: string) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="lista-umcompra-container">
      <div className="umcompra-grid">
        {unidades.map((um) => (
          <div key={um.idUmCompra} className="umcompra-card">
            {/* Header */}
            <div className="umcompra-card-header">
              <div className="umcompra-icon">
                <Scale size={28} />
              </div>
              <div className="umcompra-title">
                <h3>{um.nombreUmCompra}</h3>
                {um.umMatPrima && (
                  <span className="umcompra-badge">{um.umMatPrima}</span>
                )}
              </div>
            </div>

            {/* Valores */}
            <div className="umcompra-valores">
              <div className="valor-item principal">
                <Package size={18} className="valor-icon" />
                <div className="valor-info">
                  <span className="valor-label">Valor</span>
                  <span className="valor-numero">{Number(um.valor || 0).toFixed(3)}</span>
                </div>
              </div>
              <div className="valor-item convertido">
                <ArrowRightLeft size={18} className="valor-icon" />
                <div className="valor-info">
                  <span className="valor-label">Valor Convertido</span>
                  <span className="valor-numero">{Number(um.valorConvertido || 0).toFixed(3)}</span>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="umcompra-info">
              {um.idnegocio && (
                <div className="info-item">
                  <Building2 size={16} />
                  <span>Negocio: {um.idnegocio}</span>
                </div>
              )}
            </div>

            {/* Meta información */}
            <div className="umcompra-meta">
              <span className="meta-item">ID: {um.idUmCompra}</span>
              <span className="meta-item">Registro: {formatFecha(um.fechaRegistroauditoria)}</span>
            </div>

            {/* Acciones */}
            <div className="umcompra-card-actions">
              <button
                className="btn-action btn-editar"
                onClick={() => onEditar(um)}
                title="Editar unidad"
              >
                <Edit size={18} />
                <span>Editar</span>
              </button>
              <button
                className="btn-action btn-eliminar"
                onClick={() => {
                  if (window.confirm(`¿Está seguro de eliminar la unidad "${um.nombreUmCompra}"?`)) {
                    onEliminar(um.idUmCompra!);
                  }
                }}
                title="Eliminar unidad"
              >
                <Trash2 size={18} />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
