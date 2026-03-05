import React, { useState } from 'react';
import { Edit2, Trash2, ChefHat, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { Subreceta } from '../../../types/subreceta.types';
import './ListaSubrecetas.css';

interface Props {
  subrecetas: Subreceta[];
  onEditar: (subreceta: Subreceta) => void;
  onEliminar: (id: number) => void;
}

const ListaSubrecetas: React.FC<Props> = ({ subrecetas, onEditar, onEliminar }) => {
  const [expandidos, setExpandidos] = useState<Record<number, boolean>>({});

  const subrecetasArray = Array.isArray(subrecetas) ? subrecetas : [];

  const toggleExpand = (id: number) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="lista-subrecetas-container">
      <div className="tabla-wrapper">
        <table className="tabla-subrecetas">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Costo</th>
              <th>Instrucciones</th>
              <th>Ingredientes</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {subrecetasArray.length === 0 ? (
              <tr>
                <td colSpan={7} className="sin-datos">
                  <ChefHat size={32} className="icono-vacio-inline" />
                  No hay subrecetas registradas
                </td>
              </tr>
            ) : (
              subrecetasArray.map((subreceta) => (
                <React.Fragment key={subreceta.idSubReceta}>
                  <tr>
                    <td>{subreceta.idSubReceta}</td>
                    <td className="cell-nombre">{subreceta.nombreSubReceta}</td>
                    <td>${Number(subreceta.costoSubReceta || 0).toFixed(2)}</td>
                    <td className="cell-instrucciones">
                      {subreceta.instruccionesSubr
                        ? subreceta.instruccionesSubr.substring(0, 60) + (subreceta.instruccionesSubr.length > 60 ? '…' : '')
                        : '-'}
                    </td>
                    <td>
                      {subreceta.detalles && subreceta.detalles.length > 0 ? (
                        <button
                          className="btn-expandir"
                          onClick={() => toggleExpand(subreceta.idSubReceta)}
                          type="button"
                        >
                          {subreceta.detalles.length} ing.
                          {expandidos[subreceta.idSubReceta] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      ) : '-'}
                    </td>
                    <td>
                      {subreceta.estatusSubr === 1 ? (
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
                          onClick={() => onEditar(subreceta)}
                          title="Editar subreceta"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-accion btn-eliminar"
                          onClick={() => onEliminar(subreceta.idSubReceta)}
                          title="Eliminar subreceta"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandidos[subreceta.idSubReceta] && subreceta.detalles && subreceta.detalles.length > 0 && (
                    <tr className="fila-ingredientes">
                      <td colSpan={7}>
                        <table className="tabla-ingredientes-inner">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Ingrediente</th>
                              <th>Cantidad</th>
                              <th>U.M.</th>
                              <th>Costo Unit.</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subreceta.detalles.map((detalle, index) => (
                              <tr key={detalle.idDetalleSubReceta || index}>
                                <td>{index + 1}</td>
                                <td>{detalle.nombreInsumoSubr}</td>
                                <td>{Number(detalle.cantidadUsoSubr || 0).toFixed(2)}</td>
                                <td>{detalle.umInsumoSubr}</td>
                                <td>${Number(detalle.costoInsumoSubr || 0).toFixed(2)}</td>
                                <td>${((detalle.cantidadUsoSubr || 0) * (detalle.costoInsumoSubr || 0)).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaSubrecetas;
