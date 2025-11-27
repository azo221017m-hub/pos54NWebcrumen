import React, { useState } from 'react';
import { Edit2, Trash2, ChefHat, FileText, DollarSign, CheckCircle, XCircle, ChevronDown, ChevronUp, Package } from 'lucide-react';
import type { Subreceta } from '../../../types/subreceta.types';
import './ListaSubrecetas.css';

interface Props {
  subrecetas: Subreceta[];
  onEditar: (subreceta: Subreceta) => void;
  onEliminar: (id: number) => void;
}

const ListaSubrecetas: React.FC<Props> = ({ subrecetas, onEditar, onEliminar }) => {
  console.log('🟢 ListaSubrecetas: Renderizando con', subrecetas.length, 'subrecetas');
  
  const [expandidos, setExpandidos] = useState<Record<number, boolean>>({});

  const subrecetasArray = Array.isArray(subrecetas) ? subrecetas : [];

  const toggleExpand = (id: number) => {
    setExpandidos(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (subrecetasArray.length === 0) {
    return (
      <div className="lista-subrecetas-vacia">
        <ChefHat size={64} className="icono-vacio" />
        <h3>No hay subrecetas registradas</h3>
        <p>Crea tu primera subreceta para comenzar</p>
      </div>
    );
  }

  return (
    <div className="lista-subrecetas">
      {subrecetasArray.map((subreceta) => (
        <div key={subreceta.idSubReceta} className="subreceta-card">
          <div className="subreceta-card-header">
            <ChefHat size={24} />
            <h3>{subreceta.nombreSubReceta}</h3>
          </div>

          <div className="subreceta-card-body">
            {/* Costo */}
            <div className="subreceta-info-item">
              <DollarSign size={18} className="info-icon" />
              <div className="info-content">
                <span className="info-label">Costo Total</span>
                <span className="info-value costo">${Number(subreceta.costoSubReceta || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Instrucciones */}
            {subreceta.instruccionesSubr && (
              <div className="subreceta-info-item">
                <FileText size={18} className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Instrucciones</span>
                  <p className="info-text">{subreceta.instruccionesSubr.substring(0, 100)}...</p>
                </div>
              </div>
            )}

            {/* Archivo */}
            {subreceta.archivoInstruccionesSubr && (
              <div className="subreceta-info-item">
                <FileText size={18} className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Archivo</span>
                  <span className="info-value">{subreceta.archivoInstruccionesSubr}</span>
                </div>
              </div>
            )}

            {/* Estatus */}
            <div className="subreceta-info-item">
              {subreceta.estatusSubr === 1 ? (
                <CheckCircle size={18} className="info-icon activo" />
              ) : (
                <XCircle size={18} className="info-icon inactivo" />
              )}
              <div className="info-content">
                <span className="info-label">Estatus</span>
                <span className={`badge ${subreceta.estatusSubr === 1 ? 'activo' : 'inactivo'}`}>
                  {subreceta.estatusSubr === 1 ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            {/* Ingredientes - Sección expandible */}
            {subreceta.detalles && subreceta.detalles.length > 0 && (
              <div className="subreceta-ingredientes-section">
                <button
                  className="ingredientes-toggle"
                  onClick={() => toggleExpand(subreceta.idSubReceta)}
                  type="button"
                >
                  <Package size={18} className="info-icon" />
                  <span className="ingredientes-count">
                    {subreceta.detalles.length} ingrediente{subreceta.detalles.length !== 1 ? 's' : ''}
                  </span>
                  {expandidos[subreceta.idSubReceta] ? (
                    <ChevronUp size={18} className="toggle-icon" />
                  ) : (
                    <ChevronDown size={18} className="toggle-icon" />
                  )}
                </button>

                {expandidos[subreceta.idSubReceta] && (
                  <div className="ingredientes-lista-detalle">
                    <table className="ingredientes-table">
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
                            <td className="td-numero">{index + 1}</td>
                            <td className="td-ingrediente">{detalle.nombreInsumoSubr}</td>
                            <td className="td-cantidad">{Number(detalle.cantidadUsoSubr || 0).toFixed(2)}</td>
                            <td className="td-um">{detalle.umInsumoSubr}</td>
                            <td className="td-costo">${Number(detalle.costoInsumoSubr || 0).toFixed(2)}</td>
                            <td className="td-subtotal">
                              ${((detalle.cantidadUsoSubr || 0) * (detalle.costoInsumoSubr || 0)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="subreceta-card-footer">
            <button
              className="btn-editar"
              onClick={() => onEditar(subreceta)}
              title="Editar subreceta"
            >
              <Edit2 size={18} />
              Editar
            </button>
            <button
              className="btn-eliminar"
              onClick={() => onEliminar(subreceta.idSubReceta)}
              title="Eliminar subreceta"
            >
              <Trash2 size={18} />
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListaSubrecetas;
