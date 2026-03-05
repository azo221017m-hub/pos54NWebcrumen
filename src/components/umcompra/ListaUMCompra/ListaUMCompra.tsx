import React from 'react';
import { Scale, Edit, Trash2 } from 'lucide-react';
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
      <div className="lista-loading">
        <div className="spinner"></div>
        <p>Cargando unidades de medida...</p>
      </div>
    );
  }

  return (
    <div className="lista-umcompra-container">
      <div className="tabla-wrapper">
        <table className="tabla-umcompra">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>UM Materia Prima</th>
              <th>Valor</th>
              <th>Valor Convertido</th>
              <th>Negocio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {unidades.length === 0 ? (
              <tr>
                <td colSpan={7} className="sin-datos">
                  <Scale size={32} className="icono-vacio-inline" />
                  No hay unidades de medida registradas
                </td>
              </tr>
            ) : (
              unidades.map((um) => (
                <tr key={um.idUmCompra}>
                  <td>{um.idUmCompra}</td>
                  <td className="cell-nombre">{um.nombreUmCompra}</td>
                  <td>{um.umMatPrima || '-'}</td>
                  <td>{Number(um.valor || 0).toFixed(3)}</td>
                  <td>{Number(um.valorConvertido || 0).toFixed(3)}</td>
                  <td>{um.idnegocio || '-'}</td>
                  <td>
                    <div className="acciones-btns">
                      <button
                        className="btn-accion btn-editar"
                        onClick={() => onEditar(um)}
                        title="Editar unidad"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-accion btn-eliminar"
                        onClick={() => {
                          if (window.confirm(`¿Está seguro de eliminar la unidad "${um.nombreUmCompra}"?`)) {
                            onEliminar(um.idUmCompra!);
                          }
                        }}
                        title="Eliminar unidad"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
