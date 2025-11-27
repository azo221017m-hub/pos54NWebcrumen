import React, { useState } from 'react';
import { Edit2, Trash2, ChefHat, FileText, DollarSign, CheckCircle, XCircle, ChevronDown, ChevronUp, Package } from 'lucide-react';
import type { Receta } from '../../../types/receta.types';
import './ListaRecetas.css';

interface Props {
  recetas: Receta[];
  onEditar: (receta: Receta) => void;
  onEliminar: (id: number) => void;
}

const ListaRecetas: React.FC<Props> = ({ recetas, onEditar, onEliminar }) => {
  const [expandidos, setExpandidos] = useState<Record<number, boolean>>({});

  const recetasArray = Array.isArray(recetas) ? recetas : [];

  const toggleExpand = (id: number) => {
    setExpandidos(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (recetasArray.length === 0) {
    return (
      <div className="lista-recetas-vacia">
        <ChefHat size={64} className="icono-vacio" />
        <h3>No hay recetas registradas</h3>
        <p>Crea tu primera receta para comenzar</p>
      </div>
    );
  }

  return (
    <div className="lista-recetas">
      {recetasArray.map((receta) => (
        <div key={receta.idReceta} className="receta-card">
          <div className="receta-card-header">
            <ChefHat size={24} />
            <h3>{receta.nombreReceta}</h3>
          </div>

          <div className="receta-card-body">
            {/* Costo */}
            <div className="receta-info-item">
              <DollarSign size={18} className="info-icon" />
              <div className="info-content">
                <span className="info-label">Costo Total</span>
                <span className="info-value costo">${Number(receta.costoReceta || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Instrucciones */}
            {receta.instrucciones && (
              <div className="receta-info-item">
                <FileText size={18} className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Instrucciones</span>
                  <p className="info-text">{receta.instrucciones.substring(0, 100)}...</p>
                </div>
              </div>
            )}

            {/* Archivo */}
            {receta.archivoInstrucciones && (
              <div className="receta-info-item">
                <FileText size={18} className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Archivo</span>
                  <span className="info-value">{receta.archivoInstrucciones}</span>
                </div>
              </div>
            )}

            {/* Estatus */}
            <div className="receta-info-item">
              {receta.estatus === 1 ? (
                <CheckCircle size={18} className="info-icon activo" />
              ) : (
                <XCircle size={18} className="info-icon inactivo" />
              )}
              <div className="info-content">
                <span className="info-label">Estatus</span>
                <span className={`badge ${receta.estatus === 1 ? 'activo' : 'inactivo'}`}>
                  {receta.estatus === 1 ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            {/* Ingredientes expandible */}
            {receta.detalles && receta.detalles.length > 0 && (
              <div className="receta-ingredientes-section">
                <button
                  className="ingredientes-toggle"
                  onClick={() => toggleExpand(receta.idReceta)}
                  type="button"
                >
                  <Package size={18} className="info-icon" />
                  <span className="ingredientes-count">
                    {receta.detalles.length} ingrediente{receta.detalles.length !== 1 ? 's' : ''}
                  </span>
                  {expandidos[receta.idReceta] ? (
                    <ChevronUp size={18} className="toggle-icon" />
                  ) : (
                    <ChevronDown size={18} className="toggle-icon" />
                  )}
                </button>

                {expandidos[receta.idReceta] && (
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
                        {receta.detalles.map((detalle, index) => (
                          <tr key={detalle.idDetalleReceta || index}>
                            <td className="td-numero">{index + 1}</td>
                            <td className="td-ingrediente">
                              {detalle.nombreinsumo || detalle.idreferencia || 'Sin nombre'}
                            </td>
                            <td className="td-cantidad">{Number(detalle.cantidadUso || 0).toFixed(2)}</td>
                            <td className="td-um">{detalle.umInsumo}</td>
                            <td className="td-costo">${Number(detalle.costoInsumo || 0).toFixed(2)}</td>
                            <td className="td-subtotal">
                              ${((detalle.cantidadUso || 0) * (detalle.costoInsumo || 0)).toFixed(2)}
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

          <div className="receta-card-footer">
            <button
              className="btn-editar"
              onClick={() => onEditar(receta)}
              title="Editar receta"
            >
              <Edit2 size={18} />
              Editar
            </button>
            <button
              className="btn-eliminar"
              onClick={() => onEliminar(receta.idReceta)}
              title="Eliminar receta"
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

export default ListaRecetas;
