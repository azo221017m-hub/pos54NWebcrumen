import React, { useState } from 'react';
import { Edit2, Trash2, ChefHat, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
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
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="lista-recetas-container">
      <div className="tabla-wrapper">
        <table className="tabla-recetas">
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
            {recetasArray.length === 0 ? (
              <tr>
                <td colSpan={7} className="sin-datos">
                  <ChefHat size={32} className="icono-vacio-inline" />
                  No hay recetas registradas
                </td>
              </tr>
            ) : (
              recetasArray.map((receta) => (
                <React.Fragment key={receta.idReceta}>
                  <tr>
                    <td>{receta.idReceta}</td>
                    <td className="cell-nombre">{receta.nombreReceta}</td>
                    <td>${Number(receta.costoReceta || 0).toFixed(2)}</td>
                    <td className="cell-instrucciones">
                      {receta.instrucciones
                        ? receta.instrucciones.substring(0, 60) + (receta.instrucciones.length > 60 ? '…' : '')
                        : '-'}
                    </td>
                    <td>
                      {receta.detalles && receta.detalles.length > 0 ? (
                        <button
                          className="btn-expandir"
                          onClick={() => toggleExpand(receta.idReceta)}
                          type="button"
                        >
                          {receta.detalles.length} ing.
                          {expandidos[receta.idReceta] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      ) : '-'}
                    </td>
                    <td>
                      {receta.estatus === 1 ? (
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
                          onClick={() => onEditar(receta)}
                          title="Editar receta"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-accion btn-eliminar"
                          onClick={() => onEliminar(receta.idReceta)}
                          title="Eliminar receta"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandidos[receta.idReceta] && receta.detalles && receta.detalles.length > 0 && (
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
                            {receta.detalles.map((detalle, index) => (
                              <tr key={detalle.idDetalleReceta || index}>
                                <td>{index + 1}</td>
                                <td>{detalle.nombreinsumo || detalle.idreferencia || 'Sin nombre'}</td>
                                <td>{Number(detalle.cantidadUso || 0).toFixed(2)}</td>
                                <td>{detalle.umInsumo}</td>
                                <td>${Number(detalle.costoInsumo || 0).toFixed(2)}</td>
                                <td>${((detalle.cantidadUso || 0) * (detalle.costoInsumo || 0)).toFixed(2)}</td>
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

export default ListaRecetas;
