import React from 'react';
import type { Insumo } from '../../../types/insumo.types';
import { Edit, Trash2, Package, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import './ListaInsumos.css';

interface Props {
  insumos: Insumo[];
  onEdit: (insumo: Insumo) => void;
  onDelete: (id: number) => void;
}

const ListaInsumos: React.FC<Props> = ({ insumos, onEdit, onDelete }) => {
  const insumosArray = Array.isArray(insumos) ? insumos : [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  const getStockStatus = (actual: number, minimo: number) => {
    const actualNum = Number(actual);
    const minimoNum = Number(minimo);
    if (actualNum <= minimoNum) return 'critico';
    if (actualNum <= minimoNum * 1.5) return 'bajo';
    return 'normal';
  };

  return (
    <div className="lista-insumos-container">
      <div className="tabla-wrapper">
        <table className="tabla-insumos">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Unidad</th>
              <th>Stock Actual</th>
              <th>Stock Mínimo</th>
              <th>Costo Promedio</th>
              <th>Grupo Movimiento</th>
              <th>Inventariable</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {insumosArray.length === 0 ? (
              <tr>
                <td colSpan={10} className="sin-datos">
                  <Package size={32} className="icono-vacio-inline" />
                  No hay insumos registrados
                </td>
              </tr>
            ) : (
              insumosArray.map((insumo) => {
                const stockStatus = getStockStatus(insumo.stock_actual, insumo.stock_minimo);
                return (
                  <tr key={insumo.id_insumo}>
                    <td>{insumo.id_insumo}</td>
                    <td className="cell-nombre">{insumo.nombre}</td>
                    <td>{insumo.unidad_medida}</td>
                    <td>
                      <span className={`stock-badge stock-${stockStatus}`}>
                        {stockStatus === 'critico' && <AlertTriangle size={13} />}
                        {insumo.stock_actual}
                      </span>
                    </td>
                    <td>{insumo.stock_minimo}</td>
                    <td>{formatCurrency(Number(insumo.costo_promedio_ponderado || 0))}</td>
                    <td>{insumo.nombrecuentacontable || '-'}</td>
                    <td>
                      {insumo.inventariable === 1 ? (
                        <span className="badge badge-info">Sí</span>
                      ) : (
                        <span className="badge badge-neutral">No</span>
                      )}
                    </td>
                    <td>
                      {insumo.activo === 1 ? (
                        <span className="badge badge-activo">
                          <CheckCircle size={13} /> Activo
                        </span>
                      ) : (
                        <span className="badge badge-inactivo">
                          <XCircle size={13} /> Inactivo
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="acciones-btns">
                        <button
                          className="btn-accion btn-editar"
                          onClick={() => onEdit(insumo)}
                          title="Editar insumo"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-accion btn-eliminar"
                          onClick={() => onDelete(insumo.id_insumo)}
                          title="Eliminar insumo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaInsumos;
